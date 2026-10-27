import sqlite3
import os
from contextlib import contextmanager
from pathlib import Path

# Load environment variables from root or backend .env
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

DB_FILENAME = os.getenv("DATABASE_NAME", "resqflow.db")
DB_PATH = os.path.join(os.path.dirname(__file__), DB_FILENAME)

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Users table (Demo auth)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL
            )
        """)
        
        # 2. Disaster Scenarios
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS scenarios (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                disaster_type TEXT NOT NULL,
                district TEXT NOT NULL,
                scenario_type TEXT NOT NULL,
                description TEXT NOT NULL,
                severity_level TEXT NOT NULL,
                center_lat REAL NOT NULL,
                center_lng REAL NOT NULL,
                default_zoom INTEGER NOT NULL,
                is_active INTEGER DEFAULT 0,
                last_analyzed TEXT
            )
        """)
        
        # 3. Affected Areas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS affected_areas (
                id TEXT PRIMARY KEY,
                scenario_id TEXT NOT NULL,
                name TEXT NOT NULL,
                district TEXT NOT NULL,
                severity TEXT NOT NULL,
                population INTEGER NOT NULL,
                buildings INTEGER NOT NULL,
                roads_km REAL NOT NULL,
                hospitals_affected INTEGER NOT NULL,
                schools_affected INTEGER NOT NULL,
                shelters_count INTEGER NOT NULL,
                polygon_coords TEXT NOT NULL,
                center_lat REAL NOT NULL,
                center_lng REAL NOT NULL,
                water_depth_m REAL NOT NULL,
                vulnerability_score REAL NOT NULL,
                infrastructure_damage_score REAL NOT NULL,
                FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
            )
        """)
        
        # 4. Critical Facilities (Hospitals, Shelters, Schools, Warehouses)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS critical_facilities (
                id TEXT PRIMARY KEY,
                scenario_id TEXT NOT NULL,
                name TEXT NOT NULL,
                facility_type TEXT NOT NULL,
                lat REAL NOT NULL,
                lng REAL NOT NULL,
                capacity INTEGER NOT NULL,
                status TEXT NOT NULL,
                area_name TEXT NOT NULL,
                contact TEXT,
                FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
            )
        """)
        
        # 5. Road Networks
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS road_networks (
                id TEXT PRIMARY KEY,
                scenario_id TEXT NOT NULL,
                name TEXT NOT NULL,
                road_type TEXT NOT NULL,
                coords TEXT NOT NULL,
                status TEXT NOT NULL,
                length_km REAL NOT NULL,
                FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
            )
        """)
        
        # 6. Relief Resources Inventory
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                unit TEXT NOT NULL,
                location TEXT NOT NULL,
                status TEXT NOT NULL,
                lat REAL,
                lng REAL,
                last_updated TEXT NOT NULL
            )
        """)
        
        # 7. Dispatches / Allocations History
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS allocations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scenario_id TEXT NOT NULL,
                area_id TEXT NOT NULL,
                area_name TEXT NOT NULL,
                priority_level TEXT NOT NULL,
                priority_score REAL NOT NULL,
                allocated_food INTEGER DEFAULT 0,
                allocated_water INTEGER DEFAULT 0,
                allocated_medical INTEGER DEFAULT 0,
                allocated_blankets INTEGER DEFAULT 0,
                allocated_boats INTEGER DEFAULT 0,
                allocated_ambulances INTEGER DEFAULT 0,
                status TEXT DEFAULT 'Recommended',
                dispatch_timestamp TEXT NOT NULL,
                notes TEXT
            )
        """)
