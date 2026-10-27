import math
from pathlib import Path
from typing import Dict, Any, List, Optional
import joblib
import pandas as pd

# Model Directory setup using pathlib
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "ml_models"

# Required model and feature filenames
MODEL_FILES = {
    "severity_model": MODEL_DIR / "severity_model.pkl",
    "affected_population_model": MODEL_DIR / "affected_population_model.pkl",
    "priority_model": MODEL_DIR / "priority_model.pkl",
    "severity_features": MODEL_DIR / "severity_features.pkl",
    "population_features": MODEL_DIR / "population_features.pkl",
    "priority_features": MODEL_DIR / "priority_features.pkl",
}

# Feature definitions according to project specifications
SEVERITY_FEATURES = [
    "rainfall_mm",
    "water_level_m",
    "flood_depth_m",
    "elevation_m",
    "population_density_per_km2",
    "building_density_per_km2",
    "road_blockage_percent",
    "vulnerable_population_ratio",
    "distance_from_river_km",
    "hospital_access_score",
    "historical_flood_count",
    "infrastructure_damage_score"
]

POPULATION_FEATURES = list(SEVERITY_FEATURES)

PRIORITY_FEATURES = [
    "rainfall_mm",
    "water_level_m",
    "flood_depth_m",
    "elevation_m",
    "population_density_per_km2",
    "road_blockage_percent",
    "vulnerable_population_ratio",
    "hospital_access_score",
    "infrastructure_damage_score",
    "affected_population"
]

# Predefined Demo Flood Scenarios across 4 Key Cities
DEMO_CITIES_DATA = {
    "Chennai": {
        "name": "Chennai",
        "state": "Tamil Nadu",
        "region_description": "Adyar & Cooum River Basins",
        "center_lat": 13.0827,
        "center_lng": 80.2707,
        "scenarios": {
            "Moderate Flood": {
                "scenario_name": "Moderate Flood",
                "location": "Chennai",
                "disaster_type": "Flood",
                "rainfall_mm": 110.0,
                "water_level_m": 3.0,
                "flood_depth_m": 0.8,
                "elevation_m": 25.0,
                "population_density_per_km2": 2500.0,
                "building_density_per_km2": 600.0,
                "road_blockage_percent": 25.0,
                "vulnerable_population_ratio": 0.10,
                "distance_from_river_km": 4.0,
                "hospital_access_score": 75.0,
                "historical_flood_count": 2,
                "infrastructure_damage_score": 25.0,
                "description": "Monsoonal depression causing low-lying waterlogging and localized canal swells across Chennai wards."
            },
            "High Flood": {
                "scenario_name": "High Flood",
                "location": "Chennai",
                "disaster_type": "Flood",
                "rainfall_mm": 180.0,
                "water_level_m": 4.3,
                "flood_depth_m": 1.8,
                "elevation_m": 15.0,
                "population_density_per_km2": 4000.0,
                "building_density_per_km2": 1000.0,
                "road_blockage_percent": 50.0,
                "vulnerable_population_ratio": 0.16,
                "distance_from_river_km": 2.5,
                "hospital_access_score": 55.0,
                "historical_flood_count": 4,
                "infrastructure_damage_score": 50.0,
                "description": "Intense tropical convective downpour breaching Adyar/Cooum river danger margins with widespread urban flooding."
            },
            "Critical Flood": {
                "scenario_name": "Critical Flood",
                "location": "Chennai",
                "disaster_type": "Flood",
                "rainfall_mm": 220.0,
                "water_level_m": 5.2,
                "flood_depth_m": 2.8,
                "elevation_m": 12.0,
                "population_density_per_km2": 4500.0,
                "building_density_per_km2": 1200.0,
                "road_blockage_percent": 65.0,
                "vulnerable_population_ratio": 0.18,
                "distance_from_river_km": 1.5,
                "hospital_access_score": 45.0,
                "historical_flood_count": 5,
                "infrastructure_damage_score": 65.0,
                "description": "Severe cyclonic event triggering catastrophic storm surge, Chembarambakkam reservoir release, and massive inundation."
            }
        }
    },
    "Mumbai": {
        "name": "Mumbai",
        "state": "Maharashtra",
        "region_description": "Mithi River & Coastal Lowlands",
        "center_lat": 19.0760,
        "center_lng": 72.8777,
        "scenarios": {
            "Moderate Flood": {
                "scenario_name": "Moderate Flood",
                "location": "Mumbai",
                "disaster_type": "Flood",
                "rainfall_mm": 130.0,
                "water_level_m": 3.2,
                "flood_depth_m": 0.9,
                "elevation_m": 18.0,
                "population_density_per_km2": 6000.0,
                "building_density_per_km2": 1500.0,
                "road_blockage_percent": 30.0,
                "vulnerable_population_ratio": 0.12,
                "distance_from_river_km": 3.5,
                "hospital_access_score": 70.0,
                "historical_flood_count": 3,
                "infrastructure_damage_score": 30.0,
                "description": "High tide confluence with monsoonal squall causing railway subways and coastal slum waterlogging."
            },
            "High Flood": {
                "scenario_name": "High Flood",
                "location": "Mumbai",
                "disaster_type": "Flood",
                "rainfall_mm": 240.0,
                "water_level_m": 4.6,
                "flood_depth_m": 2.0,
                "elevation_m": 10.0,
                "population_density_per_km2": 8500.0,
                "building_density_per_km2": 2200.0,
                "road_blockage_percent": 60.0,
                "vulnerable_population_ratio": 0.19,
                "distance_from_river_km": 1.8,
                "hospital_access_score": 50.0,
                "historical_flood_count": 5,
                "infrastructure_damage_score": 58.0,
                "description": "Mithi river breaches retention embankments around Kurla, Kalina, and Dharavi with major arterial road severance."
            },
            "Critical Flood": {
                "scenario_name": "Critical Flood",
                "location": "Mumbai",
                "disaster_type": "Flood",
                "rainfall_mm": 350.0,
                "water_level_m": 5.8,
                "flood_depth_m": 3.2,
                "elevation_m": 8.0,
                "population_density_per_km2": 9800.0,
                "building_density_per_km2": 2600.0,
                "road_blockage_percent": 75.0,
                "vulnerable_population_ratio": 0.22,
                "distance_from_river_km": 0.8,
                "hospital_access_score": 38.0,
                "historical_flood_count": 7,
                "infrastructure_damage_score": 78.0,
                "description": "Catastrophic cloudburst during peak spring astronomical tide, completely flooding low-lying wards."
            }
        }
    },
    "Guwahati": {
        "name": "Guwahati",
        "state": "Assam",
        "region_description": "Brahmaputra River Valley",
        "center_lat": 26.1445,
        "center_lng": 91.7362,
        "scenarios": {
            "Moderate Flood": {
                "scenario_name": "Moderate Flood",
                "location": "Guwahati",
                "disaster_type": "Flood",
                "rainfall_mm": 120.0,
                "water_level_m": 3.5,
                "flood_depth_m": 1.0,
                "elevation_m": 52.0,
                "population_density_per_km2": 1800.0,
                "building_density_per_km2": 450.0,
                "road_blockage_percent": 35.0,
                "vulnerable_population_ratio": 0.15,
                "distance_from_river_km": 3.0,
                "hospital_access_score": 65.0,
                "historical_flood_count": 4,
                "infrastructure_damage_score": 35.0,
                "description": "Seasonal Brahmaputra river swell inundating low-lying riverside communities and riverfront channels."
            },
            "High Flood": {
                "scenario_name": "High Flood",
                "location": "Guwahati",
                "disaster_type": "Flood",
                "rainfall_mm": 210.0,
                "water_level_m": 4.9,
                "flood_depth_m": 2.2,
                "elevation_m": 48.0,
                "population_density_per_km2": 2400.0,
                "building_density_per_km2": 650.0,
                "road_blockage_percent": 55.0,
                "vulnerable_population_ratio": 0.20,
                "distance_from_river_km": 1.5,
                "hospital_access_score": 48.0,
                "historical_flood_count": 6,
                "infrastructure_damage_score": 60.0,
                "description": "River breaches warning mark with heavy hill catchment runoff across Pandu, Bharalumukh, and Uzan Bazar."
            },
            "Critical Flood": {
                "scenario_name": "Critical Flood",
                "location": "Guwahati",
                "disaster_type": "Flood",
                "rainfall_mm": 290.0,
                "water_level_m": 6.1,
                "flood_depth_m": 3.4,
                "elevation_m": 45.0,
                "population_density_per_km2": 2900.0,
                "building_density_per_km2": 800.0,
                "road_blockage_percent": 70.0,
                "vulnerable_population_ratio": 0.25,
                "distance_from_river_km": 0.5,
                "hospital_access_score": 35.0,
                "historical_flood_count": 8,
                "infrastructure_damage_score": 75.0,
                "description": "Major Brahmaputra embankment failure and flash floods inundating urban municipal zones."
            }
        }
    },
    "Kochi": {
        "name": "Kochi",
        "state": "Kerala",
        "region_description": "Periyar River Basin",
        "center_lat": 10.1130,
        "center_lng": 76.3530,
        "scenarios": {
            "Moderate Flood": {
                "scenario_name": "Moderate Flood",
                "location": "Kochi",
                "disaster_type": "Flood",
                "rainfall_mm": 105.0,
                "water_level_m": 2.8,
                "flood_depth_m": 0.7,
                "elevation_m": 22.0,
                "population_density_per_km2": 2200.0,
                "building_density_per_km2": 550.0,
                "road_blockage_percent": 20.0,
                "vulnerable_population_ratio": 0.11,
                "distance_from_river_km": 3.8,
                "hospital_access_score": 80.0,
                "historical_flood_count": 2,
                "infrastructure_damage_score": 22.0,
                "description": "Monsoon showers causing canal backflows and localized flooding in low-lying taluks."
            },
            "High Flood": {
                "scenario_name": "High Flood",
                "location": "Kochi",
                "disaster_type": "Flood",
                "rainfall_mm": 195.0,
                "water_level_m": 4.5,
                "flood_depth_m": 1.9,
                "elevation_m": 14.0,
                "population_density_per_km2": 3500.0,
                "building_density_per_km2": 900.0,
                "road_blockage_percent": 48.0,
                "vulnerable_population_ratio": 0.17,
                "distance_from_river_km": 2.0,
                "hospital_access_score": 58.0,
                "historical_flood_count": 4,
                "infrastructure_damage_score": 52.0,
                "description": "Heavy catchment discharge from upstream dams elevating Periyar river levels over danger mark."
            },
            "Critical Flood": {
                "scenario_name": "Critical Flood",
                "location": "Kochi",
                "disaster_type": "Flood",
                "rainfall_mm": 310.0,
                "water_level_m": 5.5,
                "flood_depth_m": 3.0,
                "elevation_m": 11.0,
                "population_density_per_km2": 4200.0,
                "building_density_per_km2": 1100.0,
                "road_blockage_percent": 68.0,
                "vulnerable_population_ratio": 0.20,
                "distance_from_river_km": 1.0,
                "hospital_access_score": 42.0,
                "historical_flood_count": 6,
                "infrastructure_damage_score": 70.0,
                "description": "Unprecedented water discharge and coastal tidal locks creating massive inundation of Aluva and Paravur."
            }
        }
    }
}

# Flat backward-compatible DEMO_SCENARIOS defaulting to Chennai
DEMO_SCENARIOS = DEMO_CITIES_DATA["Chennai"]["scenarios"]


# Demo Available Resource Inventory for Prototype
DEMO_AVAILABLE_RESOURCES = {
    "food": 10000,        # packets
    "water": 15000,       # litres
    "medical_kits": 350,  # kits
    "blankets": 5000      # units
}

class MlModelManager:
    _instance = None

    def __init__(self):
        self.severity_model = None
        self.affected_population_model = None
        self.priority_model = None
        self.severity_features: List[str] = SEVERITY_FEATURES
        self.population_features: List[str] = POPULATION_FEATURES
        self.priority_features: List[str] = PRIORITY_FEATURES
        self.is_loaded = False
        self.load_models()

    @classmethod
    def get_instance(cls) -> "MlModelManager":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def verify_files_exist(self):
        """Verifies all required model files exist; raises clear RuntimeError if missing."""
        missing = []
        for name, path in MODEL_FILES.items():
            if not path.exists():
                missing.append(f"{name} ({path})")
        if missing:
            raise FileNotFoundError(
                f"Missing ML model files in {MODEL_DIR}:\n" + "\n".join(missing)
            )

    def load_models(self):
        """Loads already-trained .pkl models into memory using joblib."""
        self.verify_files_exist()
        try:
            self.severity_model = joblib.load(MODEL_FILES["severity_model"])
            self.affected_population_model = joblib.load(MODEL_FILES["affected_population_model"])
            self.priority_model = joblib.load(MODEL_FILES["priority_model"])
            
            # Load feature lists if available, fallback to hardcoded exact lists
            try:
                self.severity_features = joblib.load(MODEL_FILES["severity_features"])
            except Exception:
                self.severity_features = SEVERITY_FEATURES
                
            try:
                self.population_features = joblib.load(MODEL_FILES["population_features"])
            except Exception:
                self.population_features = POPULATION_FEATURES
                
            try:
                self.priority_features = joblib.load(MODEL_FILES["priority_features"])
            except Exception:
                self.priority_features = PRIORITY_FEATURES

            self.is_loaded = True
            print(f"[ML Service] Successfully loaded trained models from {MODEL_DIR}")
        except Exception as e:
            self.is_loaded = False
            raise RuntimeError(f"Failed to load ML models from {MODEL_DIR}: {e}")

    def predict_severity(self, input_data: Dict[str, Any]) -> str:
        """
        Passes the 12 features in exact order to severity_model.pkl.
        Returns predicted severity: Low, Moderate, High, or Critical.
        """
        df = pd.DataFrame([input_data])[self.severity_features]
        prediction = self.severity_model.predict(df)[0]
        return str(prediction)

    def predict_affected_population(self, input_data: Dict[str, Any]) -> int:
        """
        Passes the 12 features in exact order to affected_population_model.pkl.
        Returns rounded integer of affected population.
        """
        df = pd.DataFrame([input_data])[self.population_features]
        prediction = self.affected_population_model.predict(df)[0]
        return max(0, int(round(prediction)))

    def predict_priority(self, input_data: Dict[str, Any], affected_pop: int) -> str:
        """
        Passes the 10 features plus affected_population to priority_model.pkl.
        Returns predicted priority: Low, Medium, High, or Critical.
        """
        prio_dict = dict(input_data)
        prio_dict["affected_population"] = affected_pop
        df = pd.DataFrame([prio_dict])[self.priority_features]
        prediction = self.priority_model.predict(df)[0]
        return str(prediction)

    def calculate_resource_requirements(
        self,
        affected_pop: int,
        available_override: Optional[Dict[str, int]] = None
    ) -> Dict[str, Dict[str, Any]]:
        """
        Applies prototype relief norms:
        - Food: 2 packets per person
        - Water: 3 litres per person
        - Medical kits: ceil(person / 25)
        - Blankets: ceil(person * 0.85)

        Calculates shortages against available demo inventory:
        shortage = max(0, required - available)
        status: Sufficient | Shortage | Surplus
        """
        available = dict(DEMO_AVAILABLE_RESOURCES)
        if available_override:
            available.update(available_override)

        food_req = int(round(affected_pop * 2))
        water_req = int(round(affected_pop * 3))
        med_req = math.ceil(affected_pop / 25) if affected_pop > 0 else 0
        blankets_req = math.ceil(affected_pop * 0.85) if affected_pop > 0 else 0

        def calc_item(required: int, avail: int) -> Dict[str, Any]:
            shortage = max(0, required - avail)
            surplus = max(0, avail - required)
            if shortage > 0:
                status = "Shortage"
            elif surplus > 0:
                status = "Sufficient"  # Matches user prompt example
            else:
                status = "Sufficient"

            return {
                "required": required,
                "available": avail,
                "shortage": shortage,
                "surplus": surplus,
                "status": status
            }

        return {
            "food": calc_item(food_req, available.get("food", 10000)),
            "water": calc_item(water_req, available.get("water", 15000)),
            "medical_kits": calc_item(med_req, available.get("medical_kits", 350)),
            "blankets": calc_item(blankets_req, available.get("blankets", 5000))
        }

    def generate_priority_reasoning(
        self,
        severity: str,
        affected_population: int,
        priority: str,
        input_data: Dict[str, Any],
        resources: Dict[str, Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Deterministic rule-based reasoning engine explaining the predicted priority.
        """
        reasons = []

        # 1. Severity Reason
        if severity in ["Critical", "High"]:
            reasons.append(f"High disaster severity ({severity}) predicted by ML model")
        elif severity == "Moderate":
            reasons.append("Moderate disaster severity predicted by ML model")
        else:
            reasons.append("Low immediate flood severity predicted by ML model")

        # 2. Population Reason
        if affected_population >= 4000:
            reasons.append(f"High affected population ({affected_population:,} citizens)")
        elif affected_population >= 1500:
            reasons.append(f"Elevated affected population ({affected_population:,} citizens)")
        else:
            reasons.append(f"Localized affected population ({affected_population:,} citizens)")

        # 3. Infrastructure Damage Reason
        dmg = input_data.get("infrastructure_damage_score", 0)
        if dmg >= 50:
            reasons.append(f"High infrastructure damage ({dmg}/100)")
        elif dmg >= 25:
            reasons.append(f"Moderate infrastructure damage ({dmg}/100)")
        else:
            reasons.append("Low infrastructure impact")

        # 4. Resource Shortages Reason
        shortage_items = [
            k.replace("_", " ").title()
            for k, v in resources.items()
            if v.get("shortage", 0) > 0
        ]
        if shortage_items:
            reasons.append(f"Significant resource shortage in {', '.join(shortage_items)}")
        else:
            reasons.append("Relief resource inventory currently sufficient")

        # Action based on priority
        if priority in ["Critical", "CRITICAL"]:
            action = "Immediate Stage 4 Red Alert Evacuation & Emergency Regional Fleet Mobilization"
        elif priority in ["High", "HIGH"]:
            action = "Stage 3 High Readiness: Dispatch Priority Relief Convoys and Reinforce Shelters"
        elif priority in ["Medium", "Moderate", "MEDIUM"]:
            action = "Stage 2 Alert: Pre-position Logistics at Staging Bases & Monitor Embankments"
        else:
            action = "Standard Emergency Monitoring & Operational Readiness Protocol"

        return {
            "priority_level": priority,
            "reasons": reasons,
            "recommended_action": action
        }

    def run_full_analysis(
        self,
        input_data: Dict[str, Any],
        scenario_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes complete pipeline:
        1. Severity prediction (ML)
        2. Affected population prediction (ML)
        3. Priority prediction (ML)
        4. Resource requirement calculation
        5. Shortage calculation
        6. Structured response generation
        """
        if not self.is_loaded:
            self.load_models()

        # Predictions
        severity = self.predict_severity(input_data)
        affected_pop = self.predict_affected_population(input_data)
        priority = self.predict_priority(input_data, affected_pop)

        # Resources
        resources = self.calculate_resource_requirements(affected_pop)

        # Deterministic reasoning
        prio_rec = self.generate_priority_reasoning(
            severity, affected_pop, priority, input_data, resources
        )

        return {
            "location": input_data.get("location", "Chennai"),
            "disaster_type": input_data.get("disaster_type", "Flood"),
            "scenario_name": scenario_name or "Custom Scenario",
            "prediction": {
                "severity": severity,
                "affected_population": affected_pop,
                "priority": priority
            },
            "resources": resources,
            "inputs": input_data,
            "priority_recommendation": prio_rec
        }

# Global singleton helper
ml_manager = MlModelManager.get_instance()
