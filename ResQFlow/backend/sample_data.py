import json
from datetime import datetime

# Sample realistic scenarios
SCENARIOS_DATA = [
    {
        "id": "scn_chennai_flood_demo",
        "title": "Chennai Metropolitan Inundation & Embankment Breach Scenario",
        "disaster_type": "Flood",
        "district": "Chennai (Adyar & Cooum River Basins)",
        "scenario_type": "Simulated Event (Demo Prototype)",
        "description": "Predefined hydrologic simulation of intensive precipitation, reservoir discharges, and urban riverbank breaches across Chennai metropolitan wards.",
        "severity_level": "Critical",
        "center_lat": 13.0827,
        "center_lng": 80.2707,
        "default_zoom": 12,
        "is_active": 1,
        "last_analyzed": "2026-10-08 12:00:00"
    },
    {
        "id": "scn_ernakulam_flood_2026",
        "title": "Periyar Basin Extreme Monsoonal Flood Event",
        "disaster_type": "Flood",
        "district": "Ernakulam District (Periyar River Basin)",
        "scenario_type": "Simulated Event (Heavy Monsoonal Breach - Level 4)",
        "description": "Unprecedented water discharge from upstream dams combined with 360mm rainfall over 48 hours causes severe inundation of Aluva, Paravur, Kalady, and Eloor taluks along the Periyar riverbank.",
        "severity_level": "Critical",
        "center_lat": 10.1130,
        "center_lng": 76.3530,
        "default_zoom": 12,
        "is_active": 0,
        "last_analyzed": "2026-10-07 14:30:00"
    },
    {
        "id": "scn_ernakulam_historical_100yr",
        "title": "Periyar 100-Year Return Period Historical Flood",
        "disaster_type": "Flood",
        "district": "Ernakulam District (Periyar River Basin)",
        "scenario_type": "Historical Event (2018 Great Flood Baseline)",
        "description": "Historical benchmark calibration replicating the August 2018 deluge with extensive riverine overspill affecting 8 coastal and riverbank taluks.",
        "severity_level": "High",
        "center_lat": 10.1130,
        "center_lng": 76.3530,
        "default_zoom": 12,
        "is_active": 0,
        "last_analyzed": None
    },
    {
        "id": "scn_kamrup_brahmaputra_flood",
        "title": "Brahmaputra River Valley Inundation Scenario",
        "disaster_type": "Flood",
        "district": "Kamrup Metro District (Guwahati Valley)",
        "scenario_type": "Simulated Event (Riverine Embankment Spill)",
        "description": "Brahmaputra water level breaches danger mark by 1.8m, submerging low-lying urban wards and riverside settlements across Pandu, Uzan Bazar, and Bharalumukh.",
        "severity_level": "High",
        "center_lat": 26.1844,
        "center_lng": 91.7539,
        "default_zoom": 12,
        "is_active": 0,
        "last_analyzed": None
    }
]

# Affected Areas for Ernakulam Scenario
# Realistic coordinates around Aluva, Paravur, Kalady, Eloor, Angamaly, Kochi periphery (lat ~ 10.0 to 10.2, lng ~ 76.2 to 76.45)
AREAS_ERNAKULAM = [
    {
        "id": "area_aluva_central",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Aluva Central & Riverbank Ward",
        "district": "Ernakulam District",
        "severity": "Critical",
        "population": 14200,
        "buildings": 3150,
        "roads_km": 42.5,
        "hospitals_affected": 2,
        "schools_affected": 5,
        "shelters_count": 3,
        "polygon_coords": [
            [10.1010, 76.3400],
            [10.1180, 76.3420],
            [10.1250, 76.3620],
            [10.1140, 76.3750],
            [10.0980, 76.3650],
            [10.1010, 76.3400]
        ],
        "center_lat": 10.1110,
        "center_lng": 76.3570,
        "water_depth_m": 2.8,
        "vulnerability_score": 92.5,
        "infrastructure_damage_score": 88.0
    },
    {
        "id": "area_paravur_coastal",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Paravur Coastal & Estuary Ward",
        "district": "Ernakulam District",
        "severity": "Critical",
        "population": 11800,
        "buildings": 2840,
        "roads_km": 38.2,
        "hospitals_affected": 1,
        "schools_affected": 4,
        "shelters_count": 2,
        "polygon_coords": [
            [10.1380, 76.2200],
            [10.1620, 76.2250],
            [10.1690, 76.2510],
            [10.1450, 76.2600],
            [10.1280, 76.2380],
            [10.1380, 76.2200]
        ],
        "center_lat": 10.1480,
        "center_lng": 76.2390,
        "water_depth_m": 2.3,
        "vulnerability_score": 88.0,
        "infrastructure_damage_score": 84.5
    },
    {
        "id": "area_north_paravur_lowlands",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "North Paravur Lowlands",
        "district": "Ernakulam District",
        "severity": "High",
        "population": 9400,
        "buildings": 1920,
        "roads_km": 29.4,
        "hospitals_affected": 1,
        "schools_affected": 3,
        "shelters_count": 2,
        "polygon_coords": [
            [10.1320, 76.2620],
            [10.1550, 76.2680],
            [10.1580, 76.2950],
            [10.1350, 76.2990],
            [10.1220, 76.2750],
            [10.1320, 76.2620]
        ],
        "center_lat": 10.1400,
        "center_lng": 76.2800,
        "water_depth_m": 1.7,
        "vulnerability_score": 76.0,
        "infrastructure_damage_score": 72.0
    },
    {
        "id": "area_kalady_foothills",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Kalady & Malayattoor River Bend",
        "district": "Ernakulam District",
        "severity": "High",
        "population": 7600,
        "buildings": 1540,
        "roads_km": 24.1,
        "hospitals_affected": 1,
        "schools_affected": 2,
        "shelters_count": 2,
        "polygon_coords": [
            [10.1500, 76.4200],
            [10.1780, 76.4350],
            [10.1820, 76.4680],
            [10.1560, 76.4750],
            [10.1410, 76.4420],
            [10.1500, 76.4200]
        ],
        "center_lat": 10.1620,
        "center_lng": 76.4480,
        "water_depth_m": 1.5,
        "vulnerability_score": 71.5,
        "infrastructure_damage_score": 68.0
    },
    {
        "id": "area_eloor_industrial",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Eloor Industrial & River Basin",
        "district": "Ernakulam District",
        "severity": "Moderate",
        "population": 5300,
        "buildings": 920,
        "roads_km": 18.6,
        "hospitals_affected": 0,
        "schools_affected": 2,
        "shelters_count": 1,
        "polygon_coords": [
            [10.0650, 76.2880],
            [10.0880, 76.2920],
            [10.0920, 76.3210],
            [10.0710, 76.3250],
            [10.0590, 76.3020],
            [10.0650, 76.2880]
        ],
        "center_lat": 10.0750,
        "center_lng": 76.3060,
        "water_depth_m": 0.9,
        "vulnerability_score": 58.0,
        "infrastructure_damage_score": 52.0
    },
    {
        "id": "area_angamaly_bypass",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Angamaly Bypass Drainage Ward",
        "district": "Ernakulam District",
        "severity": "Moderate",
        "population": 4100,
        "buildings": 640,
        "roads_km": 14.3,
        "hospitals_affected": 0,
        "schools_affected": 1,
        "shelters_count": 1,
        "polygon_coords": [
            [10.1800, 76.3700],
            [10.2050, 76.3750],
            [10.2100, 76.4020],
            [10.1880, 76.4080],
            [10.1740, 76.3880],
            [10.1800, 76.3700]
        ],
        "center_lat": 10.1910,
        "center_lng": 76.3890,
        "water_depth_m": 0.7,
        "vulnerability_score": 46.0,
        "infrastructure_damage_score": 41.0
    },
    {
        "id": "area_kalamassery_highland",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Kalamassery Highland & University Zone",
        "district": "Ernakulam District",
        "severity": "Low",
        "population": 2800,
        "buildings": 320,
        "roads_km": 8.4,
        "hospitals_affected": 0,
        "schools_affected": 1,
        "shelters_count": 2,
        "polygon_coords": [
            [10.0380, 76.3150],
            [10.0580, 76.3200],
            [10.0620, 76.3450],
            [10.0420, 76.3500],
            [10.0310, 76.3320],
            [10.0380, 76.3150]
        ],
        "center_lat": 10.0460,
        "center_lng": 76.3330,
        "water_depth_m": 0.3,
        "vulnerability_score": 28.0,
        "infrastructure_damage_score": 22.0
    },
    {
        "id": "area_kochi_east",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Kochi East Suburban Low Drainage",
        "district": "Ernakulam District",
        "severity": "Low",
        "population": 1900,
        "buildings": 190,
        "roads_km": 6.1,
        "hospitals_affected": 0,
        "schools_affected": 0,
        "shelters_count": 1,
        "polygon_coords": [
            [10.0120, 76.3280],
            [10.0320, 76.3310],
            [10.0350, 76.3550],
            [10.0160, 76.3590],
            [10.0080, 76.3410],
            [10.0120, 76.3280]
        ],
        "center_lat": 10.0210,
        "center_lng": 76.3430,
        "water_depth_m": 0.2,
        "vulnerability_score": 21.0,
        "infrastructure_damage_score": 16.0
    }
]

# Critical Facilities for Ernakulam Scenario
FACILITIES_ERNAKULAM = [
    {
        "id": "fac_aluva_taluk_hosp",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Aluva Taluk Government Hospital",
        "facility_type": "hospital",
        "lat": 10.1145,
        "lng": 76.3562,
        "capacity": 350,
        "status": "flooded",
        "area_name": "Aluva Central & Riverbank Ward",
        "contact": "+91 484 2623340"
    },
    {
        "id": "fac_rajagiri_hosp",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Rajagiri Hospital Complex",
        "facility_type": "hospital",
        "lat": 10.1082,
        "lng": 76.3685,
        "capacity": 550,
        "status": "operational",
        "area_name": "Aluva Central & Riverbank Ward",
        "contact": "+91 484 2905000"
    },
    {
        "id": "fac_paravur_govt_hosp",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "North Paravur Taluk Hospital",
        "facility_type": "hospital",
        "lat": 10.1442,
        "lng": 76.2415,
        "capacity": 280,
        "status": "isolated",
        "area_name": "Paravur Coastal & Estuary Ward",
        "contact": "+91 484 2442220"
    },
    {
        "id": "fac_kalady_rural_hosp",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Kalady Community Health Centre",
        "facility_type": "hospital",
        "lat": 10.1648,
        "lng": 76.4430,
        "capacity": 120,
        "status": "operational",
        "area_name": "Kalady & Malayattoor River Bend",
        "contact": "+91 484 2462310"
    },
    {
        "id": "fac_kalamassery_med_college",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Ernakulam Govt Medical College",
        "facility_type": "hospital",
        "lat": 10.0545,
        "lng": 76.3490,
        "capacity": 900,
        "status": "operational",
        "area_name": "Kalamassery Highland & University Zone",
        "contact": "+91 484 2754000"
    },
    {
        "id": "fac_uc_college_shelter",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Union Christian College Relief Camp",
        "facility_type": "shelter",
        "lat": 10.1265,
        "lng": 76.3475,
        "capacity": 1200,
        "status": "active_relief",
        "area_name": "Aluva Central & Riverbank Ward",
        "contact": "+91 484 2603633"
    },
    {
        "id": "fac_paravur_boys_shelter",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Paravur Govt Higher Secondary Camp",
        "facility_type": "shelter",
        "lat": 10.1475,
        "lng": 76.2360,
        "capacity": 850,
        "status": "active_relief",
        "area_name": "Paravur Coastal & Estuary Ward",
        "contact": "+91 484 2443015"
    },
    {
        "id": "fac_sanskrit_univ_shelter",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Sanskrit University Camp Kalady",
        "facility_type": "shelter",
        "lat": 10.1610,
        "lng": 76.4385,
        "capacity": 1500,
        "status": "active_relief",
        "area_name": "Kalady & Malayattoor River Bend",
        "contact": "+91 484 2463380"
    },
    {
        "id": "fac_cusat_mega_shelter",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "CUSAT Indoor Stadium Mega Shelter",
        "facility_type": "shelter",
        "lat": 10.0440,
        "lng": 76.3260,
        "capacity": 2500,
        "status": "active_relief",
        "area_name": "Kalamassery Highland & University Zone",
        "contact": "+91 484 2577290"
    },
    {
        "id": "fac_depot_ernakulam_central",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "State Emergency Relief Hub - Kakkanad",
        "facility_type": "warehouse",
        "lat": 10.0150,
        "lng": 76.3510,
        "capacity": 50000,
        "status": "operational",
        "area_name": "Kochi East Suburban Low Drainage",
        "contact": "+91 484 2423001"
    },
    {
        "id": "fac_depot_angamaly_north",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "North Sector Staging Base - Angamaly",
        "facility_type": "warehouse",
        "lat": 10.1950,
        "lng": 76.3850,
        "capacity": 25000,
        "status": "operational",
        "area_name": "Angamaly Bypass Drainage Ward",
        "contact": "+91 484 2452200"
    }
]

# Realistic Road Segments
ROADS_ERNAKULAM = [
    {
        "id": "road_nh544_aluva",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "NH-544 Aluva Bridge to Kalamassery Highway",
        "road_type": "National Highway",
        "coords": [
            [10.1200, 76.3500],
            [10.1080, 76.3520],
            [10.0820, 76.3380],
            [10.0520, 76.3280]
        ],
        "status": "submerged",
        "length_km": 8.5
    },
    {
        "id": "road_paravur_coastal_sh",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "SH-66 Coastal Link Road",
        "road_type": "State Highway",
        "coords": [
            [10.1700, 76.2300],
            [10.1450, 76.2400],
            [10.1150, 76.2550],
            [10.0800, 76.2700]
        ],
        "status": "submerged",
        "length_km": 12.3
    },
    {
        "id": "road_seaport_airport_rd",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Seaport-Airport Evacuation Corridor",
        "road_type": "Expressway / Lifeline",
        "coords": [
            [10.1550, 76.3980],
            [10.1120, 76.3680],
            [10.0450, 76.3520],
            [10.0050, 76.3480]
        ],
        "status": "partially_passable",
        "length_km": 17.6
    },
    {
        "id": "road_angamaly_kalady_rd",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "MC Road Angamaly to Kalady Section",
        "road_type": "State Highway",
        "coords": [
            [10.1980, 76.3850],
            [10.1800, 76.4150],
            [10.1650, 76.4420]
        ],
        "status": "submerged",
        "length_km": 7.4
    },
    {
        "id": "road_kalamassery_byepass",
        "scenario_id": "scn_ernakulam_flood_2026",
        "name": "Container Terminal Expressway",
        "road_type": "National Highway",
        "coords": [
            [10.0520, 76.3280],
            [10.0380, 76.3020],
            [10.0150, 76.2800]
        ],
        "status": "clear",
        "length_km": 9.2
    }
]

# Relief Resources Inventory
# Matches the exact resources requested:
# - Food packets
# - Drinking water
# - Medical kits
# - Blankets
# - Rescue boats
# - Ambulances
AREAS_CHENNAI = [
    {
        "id": "area_velachery_basin",
        "scenario_id": "scn_chennai_flood_demo",
        "name": "Velachery Lowland & Lake Basin Ward",
        "district": "Chennai",
        "severity": "Critical",
        "population": 12500,
        "buildings": 3200,
        "roads_km": 36.4,
        "hospitals_affected": 2,
        "schools_affected": 5,
        "shelters_count": 3,
        "polygon_coords": [
            [12.9700, 80.2100],
            [12.9850, 80.2120],
            [12.9920, 80.2300],
            [12.9800, 80.2350],
            [12.9650, 80.2250],
            [12.9700, 80.2100]
        ],
        "center_lat": 12.9780,
        "center_lng": 80.2220,
        "water_depth_m": 2.8,
        "vulnerability_score": 90.0,
        "infrastructure_damage_score": 65.0
    },
    {
        "id": "area_adyar_riverbank",
        "scenario_id": "scn_chennai_flood_demo",
        "name": "Adyar Riverbank & Saidapet Ward",
        "district": "Chennai",
        "severity": "High",
        "population": 9800,
        "buildings": 2400,
        "roads_km": 28.5,
        "hospitals_affected": 1,
        "schools_affected": 3,
        "shelters_count": 2,
        "polygon_coords": [
            [13.0050, 80.2200],
            [13.0200, 80.2250],
            [13.0250, 80.2500],
            [13.0100, 80.2580],
            [12.9980, 80.2400],
            [13.0050, 80.2200]
        ],
        "center_lat": 13.0120,
        "center_lng": 80.2380,
        "water_depth_m": 1.8,
        "vulnerability_score": 75.0,
        "infrastructure_damage_score": 50.0
    },
    {
        "id": "area_cooum_central",
        "scenario_id": "scn_chennai_flood_demo",
        "name": "Cooum Canal & Egmore Embankment Ward",
        "district": "Chennai",
        "severity": "Moderate",
        "population": 6500,
        "buildings": 1600,
        "roads_km": 22.0,
        "hospitals_affected": 1,
        "schools_affected": 2,
        "shelters_count": 2,
        "polygon_coords": [
            [13.0700, 80.2500],
            [13.0850, 80.2550],
            [13.0900, 80.2750],
            [13.0750, 80.2800],
            [13.0650, 80.2650],
            [13.0700, 80.2500]
        ],
        "center_lat": 13.0780,
        "center_lng": 80.2650,
        "water_depth_m": 0.8,
        "vulnerability_score": 55.0,
        "infrastructure_damage_score": 25.0
    }
]

FACILITIES_CHENNAI = [
    {
        "id": "fac_chennai_general",
        "scenario_id": "scn_chennai_flood_demo",
        "name": "Rajiv Gandhi Govt General Hospital",
        "facility_type": "Hospital",
        "lat": 13.0810,
        "lng": 80.2780,
        "capacity": 1500,
        "status": "Operational (Critical)",
        "area_name": "Cooum Canal & Egmore Embankment Ward",
        "contact": "+91-44-2530-5000"
    },
    {
        "id": "fac_velachery_shelter",
        "scenario_id": "scn_chennai_flood_demo",
        "name": "Velachery Central Emergency Flood Shelter",
        "facility_type": "Relief Shelter",
        "lat": 12.9780,
        "lng": 80.2220,
        "capacity": 1200,
        "status": "Active (High Inflow)",
        "area_name": "Velachery Lowland & Lake Basin Ward",
        "contact": "+91-44-2244-1234"
    },
    {
        "id": "fac_saidapet_school",
        "scenario_id": "scn_chennai_flood_demo",
        "name": "Saidapet Model School Relief Base",
        "facility_type": "School / Relief Camp",
        "lat": 13.0120,
        "lng": 80.2380,
        "capacity": 800,
        "status": "Operational",
        "area_name": "Adyar Riverbank & Saidapet Ward",
        "contact": "+91-44-2435-5678"
    }
]

ROADS_CHENNAI = [
    {
        "id": "road_anna_salai",
        "scenario_id": "scn_chennai_flood_demo",
        "name": "Anna Salai (Mount Road) Arterial Evacuation Route",
        "road_type": "National Highway / Lifeline",
        "coords": [
            [13.0820, 80.2750],
            [13.0550, 80.2500],
            [13.0180, 80.2250],
            [12.9950, 80.1980]
        ],
        "status": "partially_passable",
        "length_km": 14.8
    },
    {
        "id": "road_velachery_main",
        "scenario_id": "scn_chennai_flood_demo",
        "name": "Velachery Bypass & Inner Ring Link Road",
        "road_type": "State Highway",
        "coords": [
            [12.9900, 80.2100],
            [12.9750, 80.2250],
            [12.9600, 80.2350]
        ],
        "status": "submerged",
        "length_km": 6.2
    }
]

# Relief Resources Inventory
# Matches the exact demo resources required:
# - Food (10,000 packets)
# - Water (15,000 litres)
# - Medical Kits (350 kits)
# - Blankets (5,000 units)
# - Rescue Boats (25 boats)
# - Ambulances (15 vehicles)
INITIAL_RESOURCES = [
    {
        "name": "Ready-to-Eat Food Packets",
        "category": "Food",
        "quantity": 10000,
        "unit": "packets",
        "location": "Central Disaster Relief Hub - Chennai",
        "status": "Available",
        "lat": 13.0827,
        "lng": 80.2707,
        "last_updated": "2026-10-08 12:00:00"
    },
    {
        "name": "Purified Potable Water Supplies",
        "category": "Water",
        "quantity": 15000,
        "unit": "Litres",
        "location": "Chennai Metro Water Logistics Depot",
        "status": "Available",
        "lat": 13.0750,
        "lng": 80.2600,
        "last_updated": "2026-10-08 12:00:00"
    },
    {
        "name": "Disaster Emergency Medical Kits",
        "category": "Medical Kits",
        "quantity": 350,
        "unit": "kits",
        "location": "Govt General Hospital Emergency Post - Chennai",
        "status": "Available",
        "lat": 13.0810,
        "lng": 80.2780,
        "last_updated": "2026-10-08 12:00:00"
    },
    {
        "name": "Thermal & Fleece Disaster Blankets",
        "category": "Blankets",
        "quantity": 5000,
        "unit": "units",
        "location": "State Logistics Warehousing Center - Chennai",
        "status": "Available",
        "lat": 13.0600,
        "lng": 80.2400,
        "last_updated": "2026-10-08 12:00:00"
    },
    {
        "name": "Inflatable Motorized Rescue Boats (IRB)",
        "category": "Rescue Boats",
        "quantity": 25,
        "unit": "boats",
        "location": "SDRF Water Rescue Station - Chennai",
        "status": "Available",
        "lat": 13.0100,
        "lng": 80.2600,
        "last_updated": "2026-10-08 12:00:00"
    },
    {
        "name": "Advanced Life Support (ALS) Ambulances",
        "category": "Ambulances",
        "quantity": 15,
        "unit": "vehicles",
        "location": "State EMS Central Fleet Depot - Chennai",
        "status": "Available",
        "lat": 13.0500,
        "lng": 80.2500,
        "last_updated": "2026-10-08 12:00:00"
    }
]

def seed_sample_data(conn):
    cursor = conn.cursor()
    
    # 1. Seed demo user
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO users (email, password, name, role)
            VALUES (?, ?, ?, ?)
        """, ("admin@resqflow.gov.in", "admin123", "Officer Rajesh Kumar", "State Disaster Controller"))
        cursor.execute("""
            INSERT INTO users (email, password, name, role)
            VALUES (?, ?, ?, ?)
        """, ("analyst@resqflow.gov.in", "demo123", "Priya Nair", "GIS & Logistics Analyst"))

    # 2. Seed Scenarios
    for s in SCENARIOS_DATA:
        cursor.execute("SELECT id FROM scenarios WHERE id = ?", (s["id"],))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO scenarios (id, title, disaster_type, district, scenario_type, description, severity_level, center_lat, center_lng, default_zoom, is_active, last_analyzed)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (s["id"], s["title"], s["disaster_type"], s["district"], s["scenario_type"], s["description"], s["severity_level"], s["center_lat"], s["center_lng"], s["default_zoom"], s["is_active"], s["last_analyzed"]))

    # 3. Seed Affected Areas
    all_areas = AREAS_ERNAKULAM + AREAS_CHENNAI
    for a in all_areas:
        cursor.execute("SELECT id FROM affected_areas WHERE id = ?", (a["id"],))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO affected_areas (
                    id, scenario_id, name, district, severity, population, buildings, roads_km,
                    hospitals_affected, schools_affected, shelters_count, polygon_coords,
                    center_lat, center_lng, water_depth_m, vulnerability_score, infrastructure_damage_score
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                a["id"], a["scenario_id"], a["name"], a["district"], a["severity"], a["population"],
                a["buildings"], a["roads_km"], a["hospitals_affected"], a["schools_affected"],
                a["shelters_count"], json.dumps(a["polygon_coords"]), a["center_lat"], a["center_lng"],
                a["water_depth_m"], a["vulnerability_score"], a["infrastructure_damage_score"]
            ))

    # 4. Seed Critical Facilities
    all_facilities = FACILITIES_ERNAKULAM + FACILITIES_CHENNAI
    for f in all_facilities:
        cursor.execute("SELECT id FROM critical_facilities WHERE id = ?", (f["id"],))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO critical_facilities (
                    id, scenario_id, name, facility_type, lat, lng, capacity, status, area_name, contact
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f["id"], f["scenario_id"], f["name"], f["facility_type"], f["lat"], f["lng"],
                f["capacity"], f["status"], f["area_name"], f["contact"]
            ))

    # 5. Seed Road Networks
    all_roads = ROADS_ERNAKULAM + ROADS_CHENNAI
    for r in all_roads:
        cursor.execute("SELECT id FROM road_networks WHERE id = ?", (r["id"],))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO road_networks (
                    id, scenario_id, name, road_type, coords, status, length_km
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                r["id"], r["scenario_id"], r["name"], r["road_type"], json.dumps(r["coords"]),
                r["status"], r["length_km"]
            ))

    # 6. Seed / Reset Demo Resources
    cursor.execute("SELECT COUNT(*) FROM resources")
    cnt = cursor.fetchone()[0]
    cursor.execute("SELECT SUM(quantity) FROM resources WHERE category LIKE '%Food%'")
    food_sum = cursor.fetchone()[0] or 0

    if cnt == 0 or food_sum == 0:
        cursor.execute("DELETE FROM resources")
        for res in INITIAL_RESOURCES:
            cursor.execute("""
                INSERT INTO resources (
                    name, category, quantity, unit, location, status, lat, lng, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                res["name"], res["category"], res["quantity"], res["unit"], res["location"],
                res["status"], res.get("lat"), res.get("lng"), res["last_updated"]
            ))

