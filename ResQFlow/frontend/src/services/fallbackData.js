// Complete standalone disaster operational dataset
// Used whenever backend API is offline so maps and all details render seamlessly.

export const FALLBACK_SCENARIOS_LIST = [
  {
    id: "scn_chennai_flood_demo",
    title: "Chennai Metropolitan Inundation & Embankment Breach Scenario",
    disaster_type: "Flood",
    district: "Chennai (Adyar & Cooum River Basins)",
    scenario_type: "Simulated Event (Demo Prototype)",
    description: "Predefined hydrologic simulation of intensive precipitation, reservoir discharges, and urban riverbank breaches across Chennai metropolitan wards.",
    severity_level: "Critical",
    center_lat: 13.0827,
    center_lng: 80.2707,
    default_zoom: 12,
    is_active: 1,
    last_analyzed: "2026-10-09 12:00:00"
  },
  {
    id: "scn_ernakulam_flood_2026",
    title: "Periyar Basin Extreme Monsoonal Flood Event",
    disaster_type: "Flood",
    district: "Ernakulam District (Periyar River Basin)",
    scenario_type: "Simulated Event (Level 4 Deluge)",
    description: "Extreme water discharge from upstream dams combined with 360mm rainfall over 48 hours causes severe inundation of Aluva, Paravur, and Eloor taluks.",
    severity_level: "Critical",
    center_lat: 10.1130,
    center_lng: 76.3530,
    default_zoom: 12,
    is_active: 0,
    last_analyzed: "2026-10-08 14:30:00"
  }
];

export const FALLBACK_AREAS = [
  {
    id: "area_velachery_basin",
    scenario_id: "scn_chennai_flood_demo",
    name: "Velachery Lowland & Lake Basin Ward",
    district: "Chennai",
    severity: "Critical",
    population: 12500,
    buildings: 3200,
    roads_km: 36.4,
    hospitals_affected: 2,
    schools_affected: 5,
    shelters_count: 3,
    polygon_coords: [
      [12.9700, 80.2100],
      [12.9850, 80.2120],
      [12.9920, 80.2300],
      [12.9800, 80.2350],
      [12.9650, 80.2250],
      [12.9700, 80.2100]
    ],
    center_lat: 12.9780,
    center_lng: 80.2220,
    water_depth_m: 2.8,
    vulnerability_score: 90.0,
    infrastructure_damage_score: 65.0
  },
  {
    id: "area_adyar_riverbank",
    scenario_id: "scn_chennai_flood_demo",
    name: "Adyar Riverbank & Saidapet Ward",
    district: "Chennai",
    severity: "High",
    population: 9800,
    buildings: 2400,
    roads_km: 28.5,
    hospitals_affected: 1,
    schools_affected: 3,
    shelters_count: 2,
    polygon_coords: [
      [13.0050, 80.2200],
      [13.0200, 80.2250],
      [13.0250, 80.2500],
      [13.0100, 80.2580],
      [12.9980, 80.2400],
      [13.0050, 80.2200]
    ],
    center_lat: 13.0120,
    center_lng: 80.2380,
    water_depth_m: 1.8,
    vulnerability_score: 75.0,
    infrastructure_damage_score: 50.0
  },
  {
    id: "area_cooum_central",
    scenario_id: "scn_chennai_flood_demo",
    name: "Cooum Canal & Egmore Embankment Ward",
    district: "Chennai",
    severity: "Moderate",
    population: 6500,
    buildings: 1600,
    roads_km: 22.0,
    hospitals_affected: 1,
    schools_affected: 2,
    shelters_count: 2,
    polygon_coords: [
      [13.0700, 80.2500],
      [13.0850, 80.2550],
      [13.0900, 80.2750],
      [13.0750, 80.2800],
      [13.0650, 80.2650],
      [13.0700, 80.2500]
    ],
    center_lat: 13.0780,
    center_lng: 80.2650,
    water_depth_m: 0.8,
    vulnerability_score: 55.0,
    infrastructure_damage_score: 25.0
  }
];

export const FALLBACK_FACILITIES = [
  {
    id: "fac_chennai_general",
    scenario_id: "scn_chennai_flood_demo",
    name: "Rajiv Gandhi Govt General Hospital",
    facility_type: "Hospital",
    lat: 13.0810,
    lng: 80.2780,
    capacity: 1500,
    status: "Operational (Critical)",
    area_name: "Cooum Canal & Egmore Embankment Ward",
    contact: "+91-44-2530-5000"
  },
  {
    id: "fac_velachery_shelter",
    scenario_id: "scn_chennai_flood_demo",
    name: "Velachery Central Emergency Flood Shelter",
    facility_type: "Relief Shelter",
    lat: 12.9780,
    lng: 80.2220,
    capacity: 1200,
    status: "Active (High Inflow)",
    area_name: "Velachery Lowland & Lake Basin Ward",
    contact: "+91-44-2244-1234"
  },
  {
    id: "fac_saidapet_school",
    scenario_id: "scn_chennai_flood_demo",
    name: "Saidapet Model School Relief Base",
    facility_type: "Relief Shelter",
    lat: 13.0120,
    lng: 80.2380,
    capacity: 800,
    status: "Operational",
    area_name: "Adyar Riverbank & Saidapet Ward",
    contact: "+91-44-2435-5678"
  },
  {
    id: "fac_central_hub",
    scenario_id: "scn_chennai_flood_demo",
    name: "Central Disaster Logistics Warehouse Hub",
    facility_type: "Warehouse",
    lat: 13.0600,
    lng: 80.2400,
    capacity: 45000,
    status: "operational",
    area_name: "Adyar Riverbank & Saidapet Ward",
    contact: "+91-44-2856-9900"
  }
];

export const FALLBACK_ROADS = [
  {
    id: "road_anna_salai",
    scenario_id: "scn_chennai_flood_demo",
    name: "Anna Salai (Mount Road) Arterial Evacuation Route",
    road_type: "National Highway / Lifeline",
    coords: [
      [13.0820, 80.2750],
      [13.0550, 80.2500],
      [13.0180, 80.2250],
      [12.9950, 80.1980]
    ],
    status: "partially_passable",
    length_km: 14.8
  },
  {
    id: "road_velachery_main",
    scenario_id: "scn_chennai_flood_demo",
    name: "Velachery Bypass & Inner Ring Link Road",
    road_type: "State Highway",
    coords: [
      [12.9900, 80.2100],
      [12.9750, 80.2250],
      [12.9600, 80.2350]
    ],
    status: "submerged",
    length_km: 6.2
  }
];

export const FALLBACK_REQUIREMENTS = [
  {
    resource: "Food Packets",
    category: "Food",
    required: 57600,
    available: 10000,
    shortage: 47600,
    surplus: 0,
    status: "Critical Shortage",
    priority_level: "High",
    unit: "packets"
  },
  {
    resource: "Drinking Water (Litres)",
    category: "Water",
    required: 86400,
    available: 15000,
    shortage: 71400,
    surplus: 0,
    status: "Critical Shortage",
    priority_level: "High",
    unit: "litres"
  },
  {
    resource: "Emergency Medical Kits",
    category: "Medical Kits",
    required: 1152,
    available: 350,
    shortage: 802,
    surplus: 0,
    status: "Critical Shortage",
    priority_level: "High",
    unit: "kits"
  },
  {
    resource: "Disaster Blankets",
    category: "Blankets",
    required: 28800,
    available: 5000,
    shortage: 23800,
    surplus: 0,
    status: "Critical Shortage",
    priority_level: "Medium",
    unit: "units"
  },
  {
    resource: "Rescue Boats",
    category: "Rescue Boats",
    required: 26,
    available: 25,
    shortage: 1,
    surplus: 0,
    status: "Moderate Deficit",
    priority_level: "High",
    unit: "boats"
  },
  {
    resource: "Ambulances",
    category: "Ambulances",
    required: 29,
    available: 15,
    shortage: 14,
    surplus: 0,
    status: "Critical Shortage",
    priority_level: "High",
    unit: "vehicles"
  }
];

export const FALLBACK_PRIORITIES = [
  {
    area_id: "area_velachery_basin",
    area_name: "Velachery Lowland & Lake Basin Ward",
    rank: 1,
    composite_score: 93.4,
    priority_level: "Critical",
    severity: "Critical",
    population: 12500,
    water_depth_m: 2.8,
    action_required: "Immediate air drops, amphibious vehicle deployment, and critical food/water dispatch."
  },
  {
    area_id: "area_adyar_riverbank",
    area_name: "Adyar Riverbank & Saidapet Ward",
    rank: 2,
    composite_score: 78.2,
    priority_level: "High",
    severity: "High",
    population: 9800,
    water_depth_m: 1.8,
    action_required: "Deploy high-clearance rescue trucks, mobile clinics, and potable water bowsers."
  },
  {
    area_id: "area_cooum_central",
    area_name: "Cooum Canal & Egmore Embankment Ward",
    rank: 3,
    composite_score: 56.7,
    priority_level: "Moderate",
    severity: "Moderate",
    population: 6500,
    water_depth_m: 0.8,
    action_required: "Distribute emergency ration packs and fortify canal flood barriers."
  }
];

export const FALLBACK_ALLOCATIONS = [
  {
    area_id: "area_velachery_basin",
    area_name: "Velachery Lowland & Lake Basin Ward",
    priority_rank: 1,
    severity: "Critical",
    allocated_food: 4340,
    allocated_water: 6510,
    allocated_medical: 152,
    allocated_blankets: 2170,
    dispatch_status: "Pending Dispatch",
    recommended_route: "Southern Lifeline Corridor via Velachery Bypass (Escorted Convoy)"
  },
  {
    area_id: "area_adyar_riverbank",
    area_name: "Adyar Riverbank & Saidapet Ward",
    priority_rank: 2,
    severity: "High",
    allocated_food: 3403,
    allocated_water: 5104,
    allocated_medical: 119,
    allocated_blankets: 1701,
    dispatch_status: "Pending Dispatch",
    recommended_route: "Anna Salai Arterial Route (Partially Passable - Heavy Vehicle Lane)"
  },
  {
    area_id: "area_cooum_central",
    area_name: "Cooum Canal & Egmore Embankment Ward",
    priority_rank: 3,
    severity: "Moderate",
    allocated_food: 2257,
    allocated_water: 3386,
    allocated_medical: 79,
    allocated_blankets: 1129,
    dispatch_status: "Pending Dispatch",
    recommended_route: "Poonamallee High Road to Egmore Corridor"
  }
];

export const FALLBACK_ML_ANALYSIS = {
  scenario_name: "Critical Flood",
  location: "Chennai",
  disaster_type: "Flood",
  prediction: {
    severity: "Critical",
    affected_population: 28800,
    priority: "High"
  },
  resources: {
    food: { required: 57600, available: 10000, shortage: 47600, status: "Critical Shortage", unit: "packets" },
    water: { required: 86400, available: 15000, shortage: 71400, status: "Critical Shortage", unit: "Litres" },
    medical_kits: { required: 1152, available: 350, shortage: 802, status: "Critical Shortage", unit: "kits" },
    blankets: { required: 28800, available: 5000, shortage: 23800, status: "Critical Shortage", unit: "units" }
  },
  priority_recommendation: {
    recommended_action: "Execute Level 4 Multi-Agency Tactical Deployment & Immediate Airlift Convoys",
    reasons: [
      "Critical disaster severity (>2m flood inundation across coastal riverbanks)",
      "High population exposure (28,800 affected residents in vulnerable lowlands)",
      "Infrastructure damage score of 65% with significant arterial road submersion",
      "Severe immediate shortages identified across food packets and potable water"
    ]
  },
  inputs: {
    rainfall_mm: 220,
    water_level_m: 5.5,
    flood_depth_m: 2.8,
    elevation_m: 10,
    population_density_per_km2: 5500,
    building_density_per_km2: 900,
    road_blockage_percent: 60,
    vulnerable_population_ratio: 0.18,
    distance_from_river_km: 1.5,
    hospital_access_score: 45,
    historical_flood_count: 3,
    infrastructure_damage_score: 65
  }
};

export const FALLBACK_DASHBOARD_DATA = {
  scenario: FALLBACK_SCENARIOS_LIST[0],
  summary_cards: {
    affected_population: 28800,
    affected_buildings: 7200,
    affected_roads_km: 86.9,
    critical_areas_count: 1,
    available_resources_count: 30390,
    resource_shortage_count: 143617,
    critical_shortage_items: 5
  },
  impact_summary: {
    total_affected_population: 28800,
    total_affected_buildings: 7200,
    total_affected_roads_km: 86.9,
    total_critical_infrastructure: 11,
    total_hospitals_affected: 4,
    total_schools_affected: 10,
    total_shelters_active: 7,
    number_of_affected_areas: 3,
    critical_areas_count: 1,
    high_areas_count: 1,
    moderate_areas_count: 1,
    low_areas_count: 0,
    severity_breakdown: {
      Critical: 1,
      High: 1,
      Moderate: 1,
      Low: 0
    },
    areas: FALLBACK_AREAS,
    scenario: FALLBACK_SCENARIOS_LIST[0]
  },
  requirements: FALLBACK_REQUIREMENTS,
  priority_areas: FALLBACK_PRIORITIES,
  all_priorities: FALLBACK_PRIORITIES,
  facilities: FALLBACK_FACILITIES,
  roads: FALLBACK_ROADS,
  recent_disaster_analysis: {
    scenario_title: "Chennai Metropolitan Inundation & Embankment Breach Scenario",
    district: "Chennai (Adyar & Cooum River Basins)",
    type: "Flood",
    scenario_type: "Simulated Event (Demo Prototype)",
    severity: "Critical",
    last_analyzed: "2026-10-09 12:00:00",
    status: "Active Threat Assessment",
    evacuation_readiness: "Level 3 Emergency Protocol"
  },
  ml_analysis: FALLBACK_ML_ANALYSIS
};
