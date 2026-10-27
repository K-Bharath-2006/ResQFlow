import json
import os
from datetime import datetime
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional

# Load environment variables
try:
    from dotenv import load_dotenv
    root_env = Path(__file__).resolve().parent.parent / ".env"
    backend_env = Path(__file__).resolve().parent / ".env"
    if root_env.exists():
        load_dotenv(root_env)
    elif backend_env.exists():
        load_dotenv(backend_env)
except ImportError:
    pass

from database import init_db, get_db
from sample_data import seed_sample_data
from models import (
    LoginRequest, UserResponse, ScenarioSummary, ScenarioAnalyzeRequest,
    ResourceItem, ResourceCreate, ResourceUpdate, RequirementItem,
    AreaPriority, AllocationRecommendation, ImpactSummary, DashboardData,
    MlAnalyseRequest, MlAnalyseResponse
)
from calculations import (
    calculate_impact_summary, calculate_resource_requirements,
    calculate_priority_rankings, generate_relief_allocations
)
from ml_service import ml_manager, DEMO_SCENARIOS, DEMO_CITIES_DATA

# Active ML prediction state (defaults to Critical Flood demo scenario)
active_ml_analysis: Dict[str, Any] = ml_manager.run_full_analysis(
    DEMO_SCENARIOS["Critical Flood"],
    scenario_name="Critical Flood"
)


app = FastAPI(
    title=os.getenv("APP_NAME", "ResQFlow API"),
    description="Backend API for ResQFlow – Disaster Impact & Relief Resource Analyser",
    version="1.0.0",
    debug=os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
)

# Parse CORS origins from environment
cors_origins_raw = os.getenv("CORS_ORIGINS", "*")
if cors_origins_raw.strip() == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [orig.strip() for orig in cors_origins_raw.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    with get_db() as conn:
        seed_sample_data(conn)
    print("Database initialized and sample data seeded successfully.")
    # Check that all required model files exist during startup
    try:
        ml_manager.verify_files_exist()
        if not ml_manager.is_loaded:
            ml_manager.load_models()
        print("[ML Startup] All 6 ML model/feature files verified and loaded into memory.")
    except Exception as e:
        print(f"[ML Startup Error] ML model initialization failed: {e}")
        raise RuntimeError(f"Startup check failed: {e}")


# Helper to get current inventory map {category: total_quantity}
def get_inventory_map(conn) -> Dict[str, int]:
    cursor = conn.cursor()
    cursor.execute("SELECT category, SUM(quantity) as total_qty FROM resources WHERE status != 'Depleted' GROUP BY category")
    rows = cursor.fetchall()
    return {row["category"]: row["total_qty"] for row in rows}

# Helper to load active scenario and its areas
def get_active_scenario_and_areas(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scenarios WHERE is_active = 1 LIMIT 1")
    scn_row = cursor.fetchone()
    if not scn_row:
        cursor.execute("SELECT * FROM scenarios LIMIT 1")
        scn_row = cursor.fetchone()
        
    cursor.execute("SELECT * FROM affected_areas WHERE scenario_id = ?", (scn_row["id"],))
    area_rows = cursor.fetchall()
    
    areas = []
    for r in area_rows:
        d = dict(r)
        d["polygon_coords"] = json.loads(d["polygon_coords"])
        areas.append(d)
        
    return dict(scn_row), areas

# ----------------- 1. AUTH API -----------------
@app.post("/api/auth/login", response_model=Dict[str, Any])
def login(creds: LoginRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, password, name, role FROM users WHERE email = ?", (creds.email,))
        user = cursor.fetchone()
        
        # Accept demo credentials or admin123
        if user and (user["password"] == creds.password or creds.password == "admin123"):
            return {
                "success": True,
                "token": "demo-token-resqflow-2026",
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "name": user["name"],
                    "role": user["role"]
                }
            }
        elif creds.email == "admin@resqflow.gov.in" and creds.password == "admin123":
            return {
                "success": True,
                "token": "demo-token-resqflow-2026",
                "user": {
                    "id": 1,
                    "email": "admin@resqflow.gov.in",
                    "name": "State Disaster Operations Controller",
                    "role": "State Disaster Controller"
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid disaster controller credentials")

# ----------------- 2. SCENARIO APIS -----------------
@app.get("/api/scenarios", response_model=List[ScenarioSummary])
def list_scenarios():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM scenarios ORDER BY id")
        rows = cursor.fetchall()
        return [
            ScenarioSummary(
                id=r["id"],
                title=r["title"],
                disaster_type=r["disaster_type"],
                district=r["district"],
                scenario_type=r["scenario_type"],
                description=r["description"],
                severity_level=r["severity_level"],
                center_lat=r["center_lat"],
                center_lng=r["center_lng"],
                default_zoom=r["default_zoom"],
                is_active=bool(r["is_active"]),
                last_analyzed=r["last_analyzed"]
            )
            for r in rows
        ]

@app.get("/api/scenarios/active", response_model=ScenarioSummary)
def get_active_scenario():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM scenarios WHERE is_active = 1 LIMIT 1")
        r = cursor.fetchone()
        if not r:
            cursor.execute("SELECT * FROM scenarios LIMIT 1")
            r = cursor.fetchone()
        return ScenarioSummary(
            id=r["id"],
            title=r["title"],
            disaster_type=r["disaster_type"],
            district=r["district"],
            scenario_type=r["scenario_type"],
            description=r["description"],
            severity_level=r["severity_level"],
            center_lat=r["center_lat"],
            center_lng=r["center_lng"],
            default_zoom=r["default_zoom"],
            is_active=bool(r["is_active"]),
            last_analyzed=r["last_analyzed"]
        )

@app.post("/api/scenarios/analyze")
def analyze_disaster(req: ScenarioAnalyzeRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Deactivate all and activate selected
        cursor.execute("UPDATE scenarios SET is_active = 0")
        cursor.execute("""
            UPDATE scenarios 
            SET is_active = 1, last_analyzed = ? 
            WHERE id = ?
        """, (now_str, req.scenario_id))
        
        # Verify
        cursor.execute("SELECT * FROM scenarios WHERE id = ?", (req.scenario_id,))
        scn = cursor.fetchone()
        if not scn:
            # Fallback activate first
            cursor.execute("UPDATE scenarios SET is_active = 1, last_analyzed = ? WHERE id = 'scn_ernakulam_flood_2026'", (now_str,))
            cursor.execute("SELECT * FROM scenarios WHERE id = 'scn_ernakulam_flood_2026'")
            scn = cursor.fetchone()
            
        # Compute impact summary
        cursor.execute("SELECT * FROM affected_areas WHERE scenario_id = ?", (scn["id"],))
        area_rows = cursor.fetchall()
        areas = []
        for r in area_rows:
            d = dict(r)
            d["polygon_coords"] = json.loads(d["polygon_coords"])
            areas.append(d)
            
        impact = calculate_impact_summary(areas)
        impact["areas"] = areas
        impact["scenario"] = dict(scn)
        inventory = get_inventory_map(conn)
        requirements = calculate_resource_requirements(impact["total_affected_population"], inventory)
        priorities = calculate_priority_rankings(areas, inventory)
        
        return {
            "success": True,
            "message": f"Disaster impact analysis completed successfully for '{scn['title']}'",
            "scenario": dict(scn),
            "analyzed_at": now_str,
            "impact_summary": impact,
            "total_shortage_items": sum(1 for req in requirements if req["shortage"] > 0),
            "critical_areas_count": impact["critical_areas_count"]
        }

# ----------------- 3. IMPACT ANALYSIS APIS -----------------
@app.get("/api/impact/summary")
def get_impact_summary():
    with get_db() as conn:
        scn, areas = get_active_scenario_and_areas(conn)
        summary = calculate_impact_summary(areas)
        summary["areas"] = areas
        summary["scenario"] = scn
        return summary

@app.get("/api/impact/areas")
def get_affected_areas():
    with get_db() as conn:
        _, areas = get_active_scenario_and_areas(conn)
        return areas

@app.get("/api/impact/facilities")
def get_critical_facilities():
    with get_db() as conn:
        scn, _ = get_active_scenario_and_areas(conn)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM critical_facilities WHERE scenario_id = ?", (scn["id"],))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

@app.get("/api/impact/roads")
def get_road_networks():
    with get_db() as conn:
        scn, _ = get_active_scenario_and_areas(conn)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM road_networks WHERE scenario_id = ?", (scn["id"],))
        rows = cursor.fetchall()
        roads = []
        for r in rows:
            d = dict(r)
            d["coords"] = json.loads(d["coords"])
            roads.append(d)
        return roads

# ----------------- 4. RESOURCE MANAGEMENT APIS -----------------
@app.get("/api/resources")
def list_resources(category: Optional[str] = None, status: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM resources WHERE 1=1"
        params = []
        if category:
            query += " AND category = ?"
            params.append(category)
        if status:
            query += " AND status = ?"
            params.append(status)
        query += " ORDER BY category, id DESC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

@app.post("/api/resources")
def create_resource(item: ResourceCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            INSERT INTO resources (name, category, quantity, unit, location, status, lat, lng, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (item.name, item.category, item.quantity, item.unit, item.location, item.status, item.lat, item.lng, now_str))
        new_id = cursor.lastrowid
        cursor.execute("SELECT * FROM resources WHERE id = ?", (new_id,))
        return dict(cursor.fetchone())

@app.put("/api/resources/{resource_id}")
def update_resource(resource_id: int, item: ResourceUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM resources WHERE id = ?", (resource_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Resource not found")
            
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        name = item.name if item.name is not None else existing["name"]
        category = item.category if item.category is not None else existing["category"]
        quantity = item.quantity if item.quantity is not None else existing["quantity"]
        unit = item.unit if item.unit is not None else existing["unit"]
        location = item.location if item.location is not None else existing["location"]
        status = item.status if item.status is not None else existing["status"]
        lat = item.lat if item.lat is not None else existing["lat"]
        lng = item.lng if item.lng is not None else existing["lng"]
        
        cursor.execute("""
            UPDATE resources
            SET name = ?, category = ?, quantity = ?, unit = ?, location = ?, status = ?, lat = ?, lng = ?, last_updated = ?
            WHERE id = ?
        """, (name, category, quantity, unit, location, status, lat, lng, now_str, resource_id))
        
        cursor.execute("SELECT * FROM resources WHERE id = ?", (resource_id,))
        return dict(cursor.fetchone())

@app.delete("/api/resources/{resource_id}")
def delete_resource(resource_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM resources WHERE id = ?", (resource_id,))
        return {"success": True, "message": f"Resource #{resource_id} deleted"}

# ----------------- 5. RESOURCE REQUIREMENT ANALYSIS -----------------
@app.get("/api/requirements", response_model=List[RequirementItem])
def get_resource_requirements():
    with get_db() as conn:
        _, areas = get_active_scenario_and_areas(conn)
        total_pop = sum(a["population"] for a in areas)
        inventory = get_inventory_map(conn)
        reqs = calculate_resource_requirements(total_pop, inventory)
        return reqs

# ----------------- 6. PRIORITY ANALYSIS -----------------
@app.get("/api/priority", response_model=List[AreaPriority])
def get_priority_analysis():
    with get_db() as conn:
        _, areas = get_active_scenario_and_areas(conn)
        inventory = get_inventory_map(conn)
        priorities = calculate_priority_rankings(areas, inventory)
        return priorities

# ----------------- 7. RELIEF ALLOCATION RECOMMENDATION -----------------
@app.get("/api/allocations", response_model=List[AllocationRecommendation])
def get_relief_allocations():
    with get_db() as conn:
        _, areas = get_active_scenario_and_areas(conn)
        inventory = get_inventory_map(conn)
        priorities = calculate_priority_rankings(areas, inventory)
        allocations = generate_relief_allocations(priorities, inventory)
        return allocations

@app.post("/api/allocations/dispatch")
def dispatch_allocation(payload: Dict[str, Any]):
    """
    Executes and records an allocation dispatch plan to simulate real-time operations
    """
    with get_db() as conn:
        cursor = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        area_id = payload.get("area_id")
        allocated = payload.get("allocated_resources", {})
        area_name = payload.get("area_name", "Target Area")
        priority_level = payload.get("priority_level", "High")
        priority_score = payload.get("priority_score", 80.0)
        
        cursor.execute("""
            INSERT INTO allocations (
                scenario_id, area_id, area_name, priority_level, priority_score,
                allocated_food, allocated_water, allocated_medical, allocated_blankets,
                allocated_boats, allocated_ambulances, status, dispatch_timestamp, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "scn_ernakulam_flood_2026", area_id, area_name, priority_level, priority_score,
            allocated.get("Food Packets", 0), allocated.get("Drinking Water (L)", 0),
            allocated.get("Medical Kits", 0), allocated.get("Blankets", 0),
            allocated.get("Rescue Boats", 0), allocated.get("Ambulances", 0),
            "Dispatched", now_str, f"Dispatched via ResQFlow Command Engine to {area_name}"
        ))
        
        # Deduct partially from inventory to simulate live dispatch
        for category, qty in allocated.items():
            if qty > 0:
                cat_name = "Food packets" if "Food" in category else ("Drinking water" if "Water" in category else ("Medical kits" if "Medical" in category else ("Rescue boats" if "Boat" in category else category)))
                cursor.execute("""
                    UPDATE resources 
                    SET quantity = MAX(0, quantity - ?), last_updated = ?
                    WHERE category = ? AND quantity > 0
                """, (qty, now_str, cat_name))
                
        return {
            "success": True,
            "message": f"Emergency relief dispatch confirmed for {area_name}",
            "dispatched_at": now_str,
            "allocation": payload
        }

# ----------------- 8. DASHBOARD UNIFIED DATA -----------------
@app.get("/api/dashboard")
def get_dashboard_data():
    with get_db() as conn:
        scn, areas = get_active_scenario_and_areas(conn)
        impact = calculate_impact_summary(areas)
        impact["areas"] = areas
        impact["scenario"] = scn
        inventory = get_inventory_map(conn)
        requirements = calculate_resource_requirements(impact["total_affected_population"], inventory)
        priorities = calculate_priority_rankings(areas, inventory)
        
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM critical_facilities WHERE scenario_id = ?", (scn["id"],))
        facilities = [dict(r) for r in cursor.fetchall()]
        
        cursor.execute("SELECT * FROM road_networks WHERE scenario_id = ?", (scn["id"],))
        roads = []
        for r in cursor.fetchall():
            d = dict(r)
            d["coords"] = json.loads(d["coords"])
            roads.append(d)
            
        cursor.execute("SELECT COUNT(*) as total_items, SUM(quantity) as total_units FROM resources")
        res_stat = cursor.fetchone()
        
        total_shortage_units = sum(r["shortage"] for r in requirements)
        critical_shortage_count = sum(1 for r in requirements if r["status"] == "Critical Shortage")
        
        return {
            "scenario": scn,
            "summary_cards": {
                "affected_population": impact["total_affected_population"],
                "affected_buildings": impact["total_affected_buildings"],
                "affected_roads_km": impact["total_affected_roads_km"],
                "critical_areas_count": impact["critical_areas_count"],
                "available_resources_count": res_stat["total_units"] if res_stat else 0,
                "resource_shortage_count": total_shortage_units,
                "critical_shortage_items": critical_shortage_count
            },
            "impact_summary": impact,
            "requirements": requirements,
            "priority_areas": priorities[:4],  # Top 4 priority areas for dashboard summary
            "all_priorities": priorities,
            "facilities": facilities,
            "roads": roads,
            "recent_disaster_analysis": {
                "scenario_title": scn["title"],
                "district": scn["district"],
                "type": scn["disaster_type"],
                "scenario_type": scn["scenario_type"],
                "severity": scn["severity_level"],
                "last_analyzed": scn["last_analyzed"],
                "status": "Active Threat Assessment",
                "evacuation_readiness": "Level 3 Emergency Protocol"
            },
            "ml_analysis": active_ml_analysis
        }

# ----------------- 9. ML MODEL PREDICTION & SCENARIO APIS -----------------
@app.get("/api/ml/scenarios", response_model=Dict[str, Any])
def get_ml_scenarios():
    """Returns predefined prototype flood scenarios across 4 cities (Chennai, Mumbai, Guwahati, Kochi)."""
    return {
        "cities": DEMO_CITIES_DATA,
        "scenarios": DEMO_SCENARIOS,
        **DEMO_SCENARIOS
    }

@app.get("/api/ml/latest")
def get_latest_ml_analysis():
    """Returns the most recent ML prediction and resource requirement analysis."""
    global active_ml_analysis
    if not active_ml_analysis:
        active_ml_analysis = ml_manager.run_full_analysis(
            DEMO_SCENARIOS["Critical Flood"],
            scenario_name="Critical Flood"
        )
    return active_ml_analysis

@app.post("/api/ml/analyse")
def analyse_disaster_ml(req: MlAnalyseRequest):
    """
    ML Prediction Endpoint:
    1. Validates input schema (HTTP 422 if invalid)
    2. Passes features to severity_model.pkl -> Predicts severity
    3. Passes features to affected_population_model.pkl -> Predicts affected population
    4. Passes features + affected_population to priority_model.pkl -> Predicts priority
    5. Calculates relief resource requirements (Food, Water, Medical kits, Blankets)
    6. Calculates demo inventory shortages & surplus
    7. Returns complete structured JSON response
    """
    global active_ml_analysis
    try:
        data = req.model_dump()
        scenario_name = req.scenario_name or "Custom Disaster Scenario"
        result = ml_manager.run_full_analysis(data, scenario_name=scenario_name)
        active_ml_analysis = result
        return result
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=500, detail=f"ML Model File Error: {fnf}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML Prediction Error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
