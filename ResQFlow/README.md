# ResQFlow – Disaster Impact & Relief Resource Analyser

**ResQFlow** is a comprehensive, production-grade web prototype built for disaster management authorities to evaluate the spatial impact of disasters and dynamically determine where relief resources are needed most.

It demonstrates the complete disaster-relief operational chain:
**Disaster → Impact → Affected Population → Resource Requirement → Shortage → Priority → Resource Allocation**

---

## 🏛️ System Features & Pages

1. **Authentication (Login Page)**:
   - Official Disaster Management Emergency Operations Center portal.
   - Demo / Mock credentials with 1-click evaluator login buttons.
   - Default credentials: `admin@resqflow.gov.in` / `admin123`.

2. **Operations Dashboard**:
   - **Summary Cards**: Affected Population, Inundated Buildings, Cut-off Roads (km), Critical Areas, Available Resources, and Net Supply Shortages.
   - **Interactive Leaflet Map**: Renders flood inundation polygons, emergency shelters, hospital pins, inundated vs passable road networks, and supply warehouses.
   - **Operational Summaries**: Disaster severity distribution, resource shortage overview, and priority ranking hotspots.

3. **Disaster Scenario Modeler**:
   - Disaster Type selection (*Riverine Flood Inundation*).
   - District selection (*Ernakulam District - Periyar River Basin*, *Kamrup Metro*, *Cuttack Basin*).
   - Scenario type toggle (*Simulated Monsoonal Dam Breach* vs *100-Year Historical Deluge*).
   - **"Analyse Disaster"** execution button that triggers hydrologic models on the FastAPI backend and generates spatial metrics.

4. **Disaster Impact Analysis**:
   - Deep-dive into flood polygons color-coded by depth and severity:
     - **Critical** (&gt;2.0m inundation, Red)
     - **High** (1.2m - 2.0m depth, Orange)
     - **Moderate** (0.6m - 1.2m depth, Amber)
     - **Low** (&lt;0.6m depth, Teal/Light Blue)
   - Impact Statistics: Total affected population, buildings, road lengths, and critical infrastructure (hospitals, schools, shelters).
   - Interactive table with "Focus on Map" zoom tool.

5. **Relief Resource Management**:
   - Catalog of core relief categories:
     - 🍱 **Food packets**
     - 💧 **Drinking water (Litres)**
     - 💊 **Medical kits**
     - 🛏️ **Blankets**
     - 🚤 **Rescue boats**
     - 🚑 **Ambulances**
   - Full CRUD: Add, Edit, Delete resources, plus instant quantity increment/decrement and status updates (*Available, In Transit, Allocated, Low Stock, Depleted*).

6. **Resource Requirement Analysis**:
   - Real-time calculations using statutory disaster relief norms:
     - **Food**: 2 packets / person / day
     - **Water**: 3 litres / person / day
     - **Medical Kits**: 1 kit / 25 people
     - **Blankets**: 1 blanket / person
     - **Rescue Boats**: 1 boat / 500 high-risk stranded individuals
     - **Ambulances**: 1 ambulance / 1,000 vulnerable individuals
   - Contingency cycle toggles (**1 Day vs 2 Days vs 3 Days**) dynamically updating required quantities, available stock, shortages, and deficit progress bars.

7. **Priority Analysis & Relief Allocation Engine**:
   - **Multi-Criteria Decision Analysis (MCDA)** ranking:
     - Formula: Population (30%) + Severity (25%) + Vulnerability (15%) + Damage (15%) + Shortage Index (15%).
     - Zonal ranking table sorted descending by priority score (0 - 100).
   - **Algorithmic Relief Allocation**:
     - Allocates warehouse supplies to the highest-priority areas first.
     - Specific recommendations (*Area A: Direct immediate food & water air-drop; Area B: Send medical trauma teams*).
     - **"Confirm & Dispatch Convoy"** action that logs dispatch events in SQLite, deduces inventory, and flags convoys as *En Route*.

---

## 💻 Tech Stack

- **Frontend**: React 19 + Vite, JavaScript
- **Mapping**: Leaflet + CartoDB Positron light government tiles
- **Icons**: Lucide React
- **Design System**: Vanilla CSS light theme (White, Light Blue `#f0f9ff`, Navy Blue `#0f2e5a`, Light Grey, Teal `#0d9488`, with Orange/Red reserved strictly for risk/shortages)
- **Backend**: FastAPI (Python 3.11)
- **Database**: SQLite prototype database (`resqflow.db`)
- **Spatial Data**: Pre-seeded GeoJSON polygons, coordinate centroids, road linestrings, and facility nodes.

---

## 🚀 How to Run Locally

### 1. Backend (FastAPI)
```bash
cd backend
# Create virtual environment if desired:
# python -m venv venv
# source venv/bin/activate  (or venv\Scripts\activate on Windows)
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend will start at: `http://127.0.0.1:8000` (API docs at `http://127.0.0.1:8000/docs`).

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Open your browser and navigate to: **`http://127.0.0.1:5173/`**

---

## 🔑 Login Credentials

- **State Disaster Controller**:
  - Email: `admin@resqflow.gov.in`
  - Password: `admin123`
- **Logistics & GIS Analyst**:
  - Email: `analyst@resqflow.gov.in`
  - Password: `demo123`
*(Or click the 1-click evaluator buttons on the login page)*
