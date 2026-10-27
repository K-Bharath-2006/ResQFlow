from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str

class ScenarioSummary(BaseModel):
    id: str
    title: str
    disaster_type: str
    district: str
    scenario_type: str
    description: str
    severity_level: str
    center_lat: float
    center_lng: float
    default_zoom: int
    is_active: bool
    last_analyzed: Optional[str] = None

class ScenarioAnalyzeRequest(BaseModel):
    scenario_id: str
    disaster_type: Optional[str] = "Flood"
    district: Optional[str] = None
    scenario_type: Optional[str] = None

class AffectedArea(BaseModel):
    id: str
    scenario_id: str
    name: str
    district: str
    severity: str
    population: int
    buildings: int
    roads_km: float
    hospitals_affected: int
    schools_affected: int
    shelters_count: int
    polygon_coords: List[List[float]]
    center_lat: float
    center_lng: float
    water_depth_m: float
    vulnerability_score: float
    infrastructure_damage_score: float

class CriticalFacility(BaseModel):
    id: str
    scenario_id: str
    name: str
    facility_type: str
    lat: float
    lng: float
    capacity: int
    status: str
    area_name: str
    contact: Optional[str] = None

class RoadNetwork(BaseModel):
    id: str
    scenario_id: str
    name: str
    road_type: str
    coords: List[List[float]]
    status: str
    length_km: float

class ResourceItem(BaseModel):
    id: Optional[int] = None
    name: str
    category: str
    quantity: int
    unit: str
    location: str
    status: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    last_updated: Optional[str] = None

class ResourceCreate(BaseModel):
    name: str
    category: str
    quantity: int
    unit: str
    location: str
    status: str = "Available"
    lat: Optional[float] = None
    lng: Optional[float] = None

class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class RequirementItem(BaseModel):
    resource: str
    category: str
    unit: str
    norm_description: str
    required: int
    available: int
    shortage: int
    deficit_pct: float
    status: str

class AreaPriority(BaseModel):
    area_id: str
    area_name: str
    district: str
    population: int
    severity: str
    severity_weight: float
    vulnerability_score: float
    infrastructure_damage: float
    resource_shortage_index: float
    priority_score: float
    priority_level: str
    rank: int
    center_lat: float
    center_lng: float
    key_shortages: Dict[str, int]
    recommended_action: str

class AllocationRecommendation(BaseModel):
    area_id: str
    area_name: str
    priority_level: str
    priority_score: float
    population: int
    dispatch_order: int
    recommended_action: str
    shortage_summary: Dict[str, int]
    allocated_resources: Dict[str, int]
    source_warehouse: str
    estimated_transit_time: str
    status: str

class ImpactSummary(BaseModel):
    total_affected_population: int
    total_affected_buildings: int
    total_affected_roads_km: float
    total_critical_infrastructure: int
    total_hospitals_affected: int
    total_schools_affected: int
    total_shelters_active: int
    number_of_affected_areas: int
    critical_areas_count: int
    high_areas_count: int
    moderate_areas_count: int
    low_areas_count: int
    severity_breakdown: Dict[str, int]
    areas: List[AffectedArea]

class DashboardData(BaseModel):
    scenario: ScenarioSummary
    impact_summary: ImpactSummary
    resource_summary: Dict[str, Any]
    priority_summary: List[AreaPriority]
    facilities: List[CriticalFacility]
    roads: List[RoadNetwork]

# --- ML Prediction & Analysis Models ---
class MlAnalyseRequest(BaseModel):
    location: str = Field(default="Chennai", description="Disaster location")
    disaster_type: str = Field(default="Flood", description="Disaster type")
    rainfall_mm: float = Field(..., ge=0, description="Rainfall in mm")
    water_level_m: float = Field(..., ge=0, description="Water level in meters")
    flood_depth_m: float = Field(..., ge=0, description="Flood depth in meters")
    elevation_m: float = Field(..., description="Elevation in meters")
    population_density_per_km2: float = Field(..., ge=0, description="Population density per km2")
    building_density_per_km2: float = Field(..., ge=0, description="Building density per km2")
    road_blockage_percent: float = Field(..., ge=0, le=100, description="Road blockage percentage")
    vulnerable_population_ratio: float = Field(..., ge=0, le=1.0, description="Vulnerable population ratio (0 to 1)")
    distance_from_river_km: float = Field(..., ge=0, description="Distance from river in km")
    hospital_access_score: float = Field(..., ge=0, le=100, description="Hospital accessibility score")
    historical_flood_count: int = Field(..., ge=0, description="Historical flood count")
    infrastructure_damage_score: float = Field(..., ge=0, le=100, description="Infrastructure damage score")
    scenario_name: Optional[str] = None

class ResourceStatus(BaseModel):
    required: int
    available: int
    shortage: int
    surplus: Optional[int] = 0
    status: str

class MlPrediction(BaseModel):
    severity: str
    affected_population: int
    priority: str

class PriorityRecommendation(BaseModel):
    priority_level: str
    reasons: List[str]
    recommended_action: str

class MlAnalyseResponse(BaseModel):
    location: str
    disaster_type: str
    scenario_name: Optional[str] = "Demo Scenario"
    prediction: MlPrediction
    resources: Dict[str, ResourceStatus]
    inputs: Optional[Dict[str, Any]] = None
    priority_recommendation: Optional[PriorityRecommendation] = None

