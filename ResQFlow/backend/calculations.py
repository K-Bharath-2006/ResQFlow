import json
from typing import List, Dict, Any

SEVERITY_WEIGHTS = {
    "Critical": 1.0,
    "High": 0.75,
    "Moderate": 0.5,
    "Low": 0.25
}

def calculate_impact_summary(areas: List[Dict[str, Any]]) -> Dict[str, Any]:
    total_pop = sum(a["population"] for a in areas)
    total_bld = sum(a["buildings"] for a in areas)
    total_roads = sum(a["roads_km"] for a in areas)
    total_hosp = sum(a["hospitals_affected"] for a in areas)
    total_sch = sum(a["schools_affected"] for a in areas)
    total_shelters = sum(a["shelters_count"] for a in areas)
    
    crit_count = sum(1 for a in areas if a["severity"] == "Critical")
    high_count = sum(1 for a in areas if a["severity"] == "High")
    mod_count = sum(1 for a in areas if a["severity"] == "Moderate")
    low_count = sum(1 for a in areas if a["severity"] == "Low")
    
    return {
        "total_affected_population": total_pop,
        "total_affected_buildings": total_bld,
        "total_affected_roads_km": round(total_roads, 1),
        "total_critical_infrastructure": total_hosp + total_sch + total_shelters,
        "total_hospitals_affected": total_hosp,
        "total_schools_affected": total_sch,
        "total_shelters_active": total_shelters,
        "number_of_affected_areas": len(areas),
        "critical_areas_count": crit_count,
        "high_areas_count": high_count,
        "moderate_areas_count": mod_count,
        "low_areas_count": low_count,
        "severity_breakdown": {
            "Critical": crit_count,
            "High": high_count,
            "Moderate": mod_count,
            "Low": low_count
        },
        "areas": areas
    }

def calculate_resource_requirements(total_population: int, available_inventory: Dict[str, int], critical_population: int = 0) -> List[Dict[str, Any]]:
    """
    Standard relief norms:
    - Food: 2 packets / person / day
    - Water: 3 litres / person / day
    - Medical kit: 1 kit / 25 people
    - Blankets: 1 blanket / person
    - Rescue boats: 1 boat / 500 stranded high-risk people
    - Ambulances: 1 ambulance / 1,000 vulnerable people
    """
    if critical_population <= 0:
        critical_population = int(total_population * 0.45) # estimate high risk
        
    rules = [
        {
            "resource": "Food Packets",
            "category": "Food packets",
            "unit": "packets",
            "norm_description": "2 packets / person / day",
            "required": total_population * 2,
        },
        {
            "resource": "Drinking Water",
            "category": "Drinking water",
            "unit": "Litres",
            "norm_description": "3 litres / person / day",
            "required": total_population * 3,
        },
        {
            "resource": "Medical Kits",
            "category": "Medical kits",
            "unit": "kits",
            "norm_description": "1 kit / 25 people",
            "required": max(1, int(total_population / 25)),
        },
        {
            "resource": "Thermal Blankets",
            "category": "Blankets",
            "unit": "units",
            "norm_description": "1 blanket / person",
            "required": total_population,
        },
        {
            "resource": "Rescue Boats",
            "category": "Rescue boats",
            "unit": "boats",
            "norm_description": "1 boat / 500 high-risk stranded",
            "required": max(5, int(critical_population / 500)),
        },
        {
            "resource": "Ambulances",
            "category": "Ambulances",
            "unit": "vehicles",
            "norm_description": "1 ambulance / 1,000 vulnerable",
            "required": max(4, int(total_population / 1000)),
        }
    ]
    
    results = []
    for item in rules:
        cat = item["category"]
        avail = (
            available_inventory.get(cat, 0)
            or available_inventory.get(cat.capitalize(), 0)
            or available_inventory.get("Food" if "Food" in cat else ("Water" if "Water" in cat else ("Medical Kits" if "Medical" in cat else ("Rescue Boats" if "Boat" in cat else cat))), 0)
        )
        req = item["required"]
        shortage = max(0, req - avail)
        deficit_pct = round((shortage / req * 100), 1) if req > 0 else 0.0
        
        if deficit_pct >= 40.0:
            status = "Critical Shortage"
        elif deficit_pct > 0.0:
            status = "Moderate Deficit"
        else:
            status = "Sufficient"
            
        results.append({
            "resource": item["resource"],
            "category": item["category"],
            "unit": item["unit"],
            "norm_description": item["norm_description"],
            "required": req,
            "available": avail,
            "shortage": shortage,
            "deficit_pct": deficit_pct,
            "status": status
        })
        
    return results

def calculate_priority_rankings(areas: List[Dict[str, Any]], available_inventory: Dict[str, int]) -> List[Dict[str, Any]]:
    """
    Ranks affected areas using Multi-Criteria Decision Scoring:
    - Population affected (30% weight)
    - Disaster severity (25% weight)
    - Vulnerability score (15% weight)
    - Infrastructure damage (15% weight)
    - Resource shortage index (15% weight)
    """
    if not areas:
        return []
        
    max_pop = max((a["population"] for a in areas), default=1)
    
    scored_areas = []
    for a in areas:
        pop_score = (a["population"] / max_pop) * 100
        sev_score = SEVERITY_WEIGHTS.get(a["severity"], 0.25) * 100
        vuln_score = a["vulnerability_score"]
        infra_score = a["infrastructure_damage_score"]
        
        # Local resource shortage estimate based on severity and population
        area_pop = a["population"]
        area_food_req = area_pop * 2
        area_water_req = area_pop * 3
        area_med_req = max(1, int(area_pop / 25))
        
        # Estimate shortage factor (higher if high depth or critical severity)
        shortage_factor = 0.85 if a["severity"] == "Critical" else (0.65 if a["severity"] == "High" else 0.35)
        shortage_score = shortage_factor * 100
        
        composite_score = round(
            (pop_score * 0.30) +
            (sev_score * 0.25) +
            (vuln_score * 0.15) +
            (infra_score * 0.15) +
            (shortage_score * 0.15),
            1
        )
        
        if composite_score >= 75.0:
            priority_level = "Critical"
        elif composite_score >= 55.0:
            priority_level = "High"
        elif composite_score >= 35.0:
            priority_level = "Medium"
        else:
            priority_level = "Low"
            
        food_short = int(area_food_req * shortage_factor)
        water_short = int(area_water_req * shortage_factor)
        med_short = int(area_med_req * shortage_factor)
        boat_short = max(1, int(area_pop / 600)) if a["severity"] in ["Critical", "High"] else 0
        
        # Formulate contextual recommendation
        if priority_level == "Critical":
            rec_action = f"Immediate Priority 1 Dispatch: Send {food_short:,} food packets, {water_short:,} L water, and {boat_short} rescue boats. High water depth ({a['water_depth_m']}m) requires amphibious evacuation."
        elif priority_level == "High":
            rec_action = f"Priority 2 Dispatch: Send {food_short:,} food packets and {med_short} medical kits. Establish mobile medical station at accessible perimeter."
        elif priority_level == "Medium":
            rec_action = f"Priority 3 Dispatch: Distribute dry rations ({food_short:,} packs) and potable water ({water_short:,} L) to local shelter camp."
        else:
            rec_action = "Monitoring & Standard Supply: Route standard shelter supplies as logistics corridors clear."
            
        scored_areas.append({
            "area_id": a["id"],
            "area_name": a["name"],
            "district": a["district"],
            "population": a["population"],
            "severity": a["severity"],
            "severity_weight": SEVERITY_WEIGHTS.get(a["severity"], 0.25),
            "vulnerability_score": round(vuln_score, 1),
            "infrastructure_damage": round(infra_score, 1),
            "resource_shortage_index": round(shortage_score, 1),
            "priority_score": composite_score,
            "priority_level": priority_level,
            "center_lat": a["center_lat"],
            "center_lng": a["center_lng"],
            "water_depth_m": a["water_depth_m"],
            "key_shortages": {
                "food_packets": food_short,
                "drinking_water_l": water_short,
                "medical_kits": med_short,
                "rescue_boats": boat_short
            },
            "recommended_action": rec_action
        })
        
    # Sort descending by priority_score
    scored_areas.sort(key=lambda x: x["priority_score"], reverse=True)
    
    # Assign ranks
    for idx, item in enumerate(scored_areas):
        item["rank"] = idx + 1
        
    return scored_areas

def generate_relief_allocations(ranked_areas: List[Dict[str, Any]], available_inventory: Dict[str, int]) -> List[Dict[str, Any]]:
    """
    Greedy / Priority-constrained allocation algorithm that dispenses available warehouse stocks
    to highest priority areas first.
    """
    remaining_stock = dict(available_inventory)
    recommendations = []
    
    for order, area in enumerate(ranked_areas, start=1):
        shortages = area["key_shortages"]
        
        # Calculate how much we can allocate from remaining available
        alloc_food = min(shortages.get("food_packets", 0), remaining_stock.get("Food packets", 0))
        remaining_stock["Food packets"] = max(0, remaining_stock.get("Food packets", 0) - alloc_food)
        
        alloc_water = min(shortages.get("drinking_water_l", 0), remaining_stock.get("Drinking water", 0))
        remaining_stock["Drinking water"] = max(0, remaining_stock.get("Drinking water", 0) - alloc_water)
        
        alloc_med = min(shortages.get("medical_kits", 0), remaining_stock.get("Medical kits", 0))
        remaining_stock["Medical kits"] = max(0, remaining_stock.get("Medical kits", 0) - alloc_med)
        
        alloc_boats = min(shortages.get("rescue_boats", 0), remaining_stock.get("Rescue boats", 0))
        remaining_stock["Rescue boats"] = max(0, remaining_stock.get("Rescue boats", 0) - alloc_boats)
        
        # Warehouse source
        if "Aluva" in area["area_name"] or "Paravur" in area["area_name"]:
            source = "State Emergency Relief Hub - Kakkanad & NDRF Aluva Post"
            eta = "35 - 50 mins (Watercraft / Heavy Truck)"
        elif "Kalady" in area["area_name"] or "Angamaly" in area["area_name"]:
            source = "North Sector Staging Base - Angamaly"
            eta = "20 - 30 mins (Direct Road)"
        else:
            source = "Kalamassery Regional Depot"
            eta = "15 - 25 mins"
            
        recommendations.append({
            "area_id": area["area_id"],
            "area_name": area["area_name"],
            "priority_level": area["priority_level"],
            "priority_score": area["priority_score"],
            "population": area["population"],
            "dispatch_order": order,
            "recommended_action": area["recommended_action"],
            "shortage_summary": shortages,
            "allocated_resources": {
                "Food Packets": alloc_food,
                "Drinking Water (L)": alloc_water,
                "Medical Kits": alloc_med,
                "Rescue Boats": alloc_boats
            },
            "source_warehouse": source,
            "estimated_transit_time": eta,
            "status": "Ready for Dispatch" if (alloc_food > 0 or alloc_water > 0 or alloc_boats > 0) else "Backlog / Awaiting Supply"
        })
        
    return recommendations
