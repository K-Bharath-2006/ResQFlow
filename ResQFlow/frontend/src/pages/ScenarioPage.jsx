import React, { useState, useEffect } from 'react';
import { useDisaster } from '../context/DisasterContext';
import SeverityBadge from '../components/SeverityBadge';
import {
  CloudRain,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  RefreshCw,
  Info,
  Droplets,
  Activity,
  Users,
  Building2,
  ShieldAlert,
  Truck,
  HeartPulse,
  MapPin,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

// Predefined Demo Flood Scenarios across 4 Key Cities
export const DEMO_CITIES_CONFIG = {
  Chennai: {
    name: 'Chennai',
    state: 'Tamil Nadu',
    region: 'Adyar & Cooum River Basins',
    lat: 13.0827,
    lng: 80.2707,
    scenarios: {
      'Moderate Flood': {
        scenario_name: 'Moderate Flood',
        location: 'Chennai',
        disaster_type: 'Flood',
        rainfall_mm: 110,
        water_level_m: 3.0,
        flood_depth_m: 0.8,
        elevation_m: 25,
        population_density_per_km2: 2500,
        building_density_per_km2: 600,
        road_blockage_percent: 25,
        vulnerable_population_ratio: 0.10,
        distance_from_river_km: 4.0,
        hospital_access_score: 75,
        historical_flood_count: 2,
        infrastructure_damage_score: 25,
        description: 'Monsoonal depression causing low-lying waterlogging and localized canal swells across Chennai wards.',
      },
      'High Flood': {
        scenario_name: 'High Flood',
        location: 'Chennai',
        disaster_type: 'Flood',
        rainfall_mm: 180,
        water_level_m: 4.3,
        flood_depth_m: 1.8,
        elevation_m: 15,
        population_density_per_km2: 4000,
        building_density_per_km2: 1000,
        road_blockage_percent: 50,
        vulnerable_population_ratio: 0.16,
        distance_from_river_km: 2.5,
        hospital_access_score: 55,
        historical_flood_count: 4,
        infrastructure_damage_score: 50,
        description: 'Intense tropical convective downpour breaching Adyar/Cooum river danger margins with widespread urban flooding.',
      },
      'Critical Flood': {
        scenario_name: 'Critical Flood',
        location: 'Chennai',
        disaster_type: 'Flood',
        rainfall_mm: 220,
        water_level_m: 5.2,
        flood_depth_m: 2.8,
        elevation_m: 12,
        population_density_per_km2: 4500,
        building_density_per_km2: 1200,
        road_blockage_percent: 65,
        vulnerable_population_ratio: 0.18,
        distance_from_river_km: 1.5,
        hospital_access_score: 45,
        historical_flood_count: 5,
        infrastructure_damage_score: 65,
        description: 'Severe cyclonic event triggering catastrophic storm surge, Chembarambakkam reservoir release, and massive inundation.',
      },
    },
  },
  Mumbai: {
    name: 'Mumbai',
    state: 'Maharashtra',
    region: 'Mithi River & Coastal Lowlands',
    lat: 19.0760,
    lng: 72.8777,
    scenarios: {
      'Moderate Flood': {
        scenario_name: 'Moderate Flood',
        location: 'Mumbai',
        disaster_type: 'Flood',
        rainfall_mm: 130,
        water_level_m: 3.2,
        flood_depth_m: 0.9,
        elevation_m: 18,
        population_density_per_km2: 6000,
        building_density_per_km2: 1500,
        road_blockage_percent: 30,
        vulnerable_population_ratio: 0.12,
        distance_from_river_km: 3.5,
        hospital_access_score: 70,
        historical_flood_count: 3,
        infrastructure_damage_score: 30,
        description: 'High tide confluence with monsoonal squall causing railway subways and coastal slum waterlogging.',
      },
      'High Flood': {
        scenario_name: 'High Flood',
        location: 'Mumbai',
        disaster_type: 'Flood',
        rainfall_mm: 240,
        water_level_m: 4.6,
        flood_depth_m: 2.0,
        elevation_m: 10,
        population_density_per_km2: 8500,
        building_density_per_km2: 2200,
        road_blockage_percent: 60,
        vulnerable_population_ratio: 0.19,
        distance_from_river_km: 1.8,
        hospital_access_score: 50,
        historical_flood_count: 5,
        infrastructure_damage_score: 58,
        description: 'Mithi river breaches retention embankments around Kurla, Kalina, and Dharavi with major arterial road severance.',
      },
      'Critical Flood': {
        scenario_name: 'Critical Flood',
        location: 'Mumbai',
        disaster_type: 'Flood',
        rainfall_mm: 350,
        water_level_m: 5.8,
        flood_depth_m: 3.2,
        elevation_m: 8,
        population_density_per_km2: 9800,
        building_density_per_km2: 2600,
        road_blockage_percent: 75,
        vulnerable_population_ratio: 0.22,
        distance_from_river_km: 0.8,
        hospital_access_score: 38,
        historical_flood_count: 7,
        infrastructure_damage_score: 78,
        description: 'Catastrophic cloudburst during peak spring astronomical tide, completely flooding low-lying wards.',
      },
    },
  },
  Guwahati: {
    name: 'Guwahati',
    state: 'Assam',
    region: 'Brahmaputra River Valley',
    lat: 26.1445,
    lng: 91.7362,
    scenarios: {
      'Moderate Flood': {
        scenario_name: 'Moderate Flood',
        location: 'Guwahati',
        disaster_type: 'Flood',
        rainfall_mm: 120,
        water_level_m: 3.5,
        flood_depth_m: 1.0,
        elevation_m: 52,
        population_density_per_km2: 1800,
        building_density_per_km2: 450,
        road_blockage_percent: 35,
        vulnerable_population_ratio: 0.15,
        distance_from_river_km: 3.0,
        hospital_access_score: 65,
        historical_flood_count: 4,
        infrastructure_damage_score: 35,
        description: 'Seasonal Brahmaputra river swell inundating low-lying riverside communities and riverfront channels.',
      },
      'High Flood': {
        scenario_name: 'High Flood',
        location: 'Guwahati',
        disaster_type: 'Flood',
        rainfall_mm: 210,
        water_level_m: 4.9,
        flood_depth_m: 2.2,
        elevation_m: 48,
        population_density_per_km2: 2400,
        building_density_per_km2: 650,
        road_blockage_percent: 55,
        vulnerable_population_ratio: 0.20,
        distance_from_river_km: 1.5,
        hospital_access_score: 48,
        historical_flood_count: 6,
        infrastructure_damage_score: 60,
        description: 'River breaches warning mark with heavy hill catchment runoff across Pandu, Bharalumukh, and Uzan Bazar.',
      },
      'Critical Flood': {
        scenario_name: 'Critical Flood',
        location: 'Guwahati',
        disaster_type: 'Flood',
        rainfall_mm: 290,
        water_level_m: 6.1,
        flood_depth_m: 3.4,
        elevation_m: 45,
        population_density_per_km2: 2900,
        building_density_per_km2: 800,
        road_blockage_percent: 70,
        vulnerable_population_ratio: 0.25,
        distance_from_river_km: 0.5,
        hospital_access_score: 35,
        historical_flood_count: 8,
        infrastructure_damage_score: 75,
        description: 'Major Brahmaputra embankment failure and flash floods inundating urban municipal zones.',
      },
    },
  },
  Kochi: {
    name: 'Kochi',
    state: 'Kerala',
    region: 'Periyar River Basin',
    lat: 10.1130,
    lng: 76.3530,
    scenarios: {
      'Moderate Flood': {
        scenario_name: 'Moderate Flood',
        location: 'Kochi',
        disaster_type: 'Flood',
        rainfall_mm: 105,
        water_level_m: 2.8,
        flood_depth_m: 0.7,
        elevation_m: 22,
        population_density_per_km2: 2200,
        building_density_per_km2: 550,
        road_blockage_percent: 20,
        vulnerable_population_ratio: 0.11,
        distance_from_river_km: 3.8,
        hospital_access_score: 80,
        historical_flood_count: 2,
        infrastructure_damage_score: 22,
        description: 'Monsoon showers causing canal backflows and localized flooding in low-lying taluks.',
      },
      'High Flood': {
        scenario_name: 'High Flood',
        location: 'Kochi',
        disaster_type: 'Flood',
        rainfall_mm: 195,
        water_level_m: 4.5,
        flood_depth_m: 1.9,
        elevation_m: 14,
        population_density_per_km2: 3500,
        building_density_per_km2: 900,
        road_blockage_percent: 48,
        vulnerable_population_ratio: 0.17,
        distance_from_river_km: 2.0,
        hospital_access_score: 58,
        historical_flood_count: 4,
        infrastructure_damage_score: 52,
        description: 'Heavy catchment discharge from upstream dams elevating Periyar river levels over danger mark.',
      },
      'Critical Flood': {
        scenario_name: 'Critical Flood',
        location: 'Kochi',
        disaster_type: 'Flood',
        rainfall_mm: 310,
        water_level_m: 5.5,
        flood_depth_m: 3.0,
        elevation_m: 11,
        population_density_per_km2: 4200,
        building_density_per_km2: 1100,
        road_blockage_percent: 68,
        vulnerable_population_ratio: 0.20,
        distance_from_river_km: 1.0,
        hospital_access_score: 42,
        historical_flood_count: 6,
        infrastructure_damage_score: 70,
        description: 'Unprecedented water discharge and coastal tidal locks creating massive inundation of Aluva and Paravur.',
      },
    },
  },
};

export default function ScenarioPage({ onNavigate }) {
  const {
    mlAnalysis,
    runMlAnalysis,
    analyzingMl,
    selectedScenarioName,
    setSelectedScenarioName,
  } = useDisaster();

  // Active City state (default Chennai or from active ML analysis)
  const [selectedCity, setSelectedCity] = useState(
    mlAnalysis?.location || 'Chennai'
  );

  // Active Scenario state
  const [selectedScenario, setSelectedScenario] = useState(
    selectedScenarioName || mlAnalysis?.scenario_name || 'Critical Flood'
  );

  const [disasterType, setDisasterType] = useState('Flood');

  // Helper to retrieve preset data safely
  const getPresetData = (cityName, scnName) => {
    const city = DEMO_CITIES_CONFIG[cityName] || DEMO_CITIES_CONFIG['Chennai'];
    return city.scenarios[scnName] || city.scenarios['Critical Flood'];
  };

  // State for all 12 ML feature variables
  const [inputs, setInputs] = useState(() =>
    getPresetData(selectedCity, selectedScenario)
  );

  const [lastAnalysis, setLastAnalysis] = useState(mlAnalysis);
  const [errorMsg, setErrorMsg] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Sync when mlAnalysis changes in context
  useEffect(() => {
    if (mlAnalysis) {
      setLastAnalysis(mlAnalysis);
      if (mlAnalysis.location && DEMO_CITIES_CONFIG[mlAnalysis.location]) {
        setSelectedCity(mlAnalysis.location);
      }
      if (mlAnalysis.scenario_name) {
        setSelectedScenario(mlAnalysis.scenario_name);
      }
    }
  }, [mlAnalysis]);

  // Handle City Change
  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    const newPreset = getPresetData(cityName, selectedScenario);
    setInputs({ ...newPreset });
  };

  // Handle Scenario Change
  const handleScenarioChange = (scnName) => {
    setSelectedScenario(scnName);
    if (setSelectedScenarioName) {
      setSelectedScenarioName(scnName);
    }
    const newPreset = getPresetData(selectedCity, scnName);
    setInputs({ ...newPreset });
  };

  // Reset to current preset
  const handleResetToPreset = () => {
    const preset = getPresetData(selectedCity, selectedScenario);
    setInputs({ ...preset });
  };

  // Handle individual input field changes
  const handleInputChange = (field, value) => {
    setInputs((prev) => ({
      ...prev,
      [field]: parseFloat(value) || (value === '' ? 0 : value),
    }));
  };

  // Execute ML prediction analysis
  const handleRunAnalysis = async () => {
    setErrorMsg('');
    try {
      const payload = {
        location: selectedCity,
        disaster_type: disasterType,
        scenario_name: selectedScenario,
        rainfall_mm: Number(inputs.rainfall_mm),
        water_level_m: Number(inputs.water_level_m),
        flood_depth_m: Number(inputs.flood_depth_m),
        elevation_m: Number(inputs.elevation_m),
        population_density_per_km2: Number(inputs.population_density_per_km2),
        building_density_per_km2: Number(inputs.building_density_per_km2),
        road_blockage_percent: Number(inputs.road_blockage_percent),
        vulnerable_population_ratio: Number(inputs.vulnerable_population_ratio),
        distance_from_river_km: Number(inputs.distance_from_river_km),
        hospital_access_score: Number(inputs.hospital_access_score),
        historical_flood_count: parseInt(inputs.historical_flood_count, 10) || 0,
        infrastructure_damage_score: Number(inputs.infrastructure_damage_score),
      };

      const res = await runMlAnalysis(payload, selectedScenario);
      setLastAnalysis(res);
    } catch (err) {
      setErrorMsg('Failed to run ML disaster analysis: ' + (err.message || 'Unknown error'));
    }
  };

  const cityData = DEMO_CITIES_CONFIG[selectedCity] || DEMO_CITIES_CONFIG['Chennai'];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Disaster Scenario Simulation & ML Analysis</h1>
          <p className="page-subtitle">
            Select across 4 prototype cities, configure hydrologic flood variables, and execute trained ML prediction models
          </p>
        </div>
      </div>

      {/* Prototype Demo Warning Banner */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          backgroundColor: 'var(--bg-light-blue)',
          borderColor: 'var(--sky-border)',
          borderLeftWidth: '4px',
          borderLeftColor: 'var(--navy-accent)',
        }}
      >
        <div className="card-body" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={18} color="var(--navy-primary)" />
          <div style={{ fontSize: '0.82rem', color: 'var(--navy-dark)' }}>
            <strong>MULTI-CITY DEMO DATASET:</strong> Explore 4 realistic flood vulnerability profiles across <b>Chennai</b>, <b>Mumbai</b>, <b>Guwahati</b>, and <b>Kochi</b>. All predictions are generated directly by your pre-trained Random Forest models.
          </div>
        </div>
      </div>

      {errorMsg && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            backgroundColor: 'var(--critical-bg)',
            borderColor: 'var(--critical-border)',
          }}
        >
          <div className="card-body" style={{ color: 'var(--critical-text)', fontWeight: 600 }}>
            <AlertTriangle size={16} style={{ display: 'inline', marginRight: '6px' }} />
            {errorMsg}
          </div>
        </div>
      )}

      {/* 4-City Quick Selector Strip */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-dark)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Select Target City for Simulation:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {Object.entries(DEMO_CITIES_CONFIG).map(([cityKey, cityInfo]) => {
            const isSelected = selectedCity === cityKey;
            return (
              <button
                key={cityKey}
                type="button"
                onClick={() => handleCityChange(cityKey)}
                style={{
                  textAlign: 'left',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected ? '2px solid var(--navy-accent)' : '1px solid var(--border-light)',
                  backgroundColor: isSelected ? 'var(--bg-light-blue)' : '#ffffff',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isSelected ? 'var(--navy-dark)' : 'var(--text-primary)' }}>
                    {cityInfo.name}
                  </span>
                  <MapPin size={15} color={isSelected ? 'var(--navy-accent)' : 'var(--text-muted)'} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {cityInfo.state}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
                  {cityInfo.region}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', marginBottom: '1.75rem' }}>
        {/* Left Column: Selection Controls */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Sliders size={18} style={{ color: 'var(--navy-accent)' }} />
              <span>Scenario & Location Controls</span>
            </div>
            <SeverityBadge
              level={
                selectedScenario.includes('Critical')
                  ? 'Critical'
                  : selectedScenario.includes('High')
                  ? 'High'
                  : 'Moderate'
              }
            />
          </div>

          <div className="card-body">
            {/* Field 1: Disaster Type */}
            <div className="form-group">
              <label className="form-label">Disaster Type</label>
              <select
                className="form-select"
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value)}
              >
                <option value="Flood">Flood (Riverine Inundation & Embankment Breach)</option>
              </select>
            </div>

            {/* Field 2: Location Dropdown */}
            <div className="form-group">
              <label className="form-label">Location (4 Demo Cities Available)</label>
              <select
                id="city-select"
                className="form-select"
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                <option value="Chennai">Chennai (Tamil Nadu - Adyar & Cooum River Basins)</option>
                <option value="Mumbai">Mumbai (Maharashtra - Mithi River & Coastal Lowlands)</option>
                <option value="Guwahati">Guwahati (Assam - Brahmaputra River Valley)</option>
                <option value="Kochi">Kochi (Kerala - Periyar River Basin)</option>
              </select>
            </div>

            {/* Field 3: Scenario Dropdown */}
            <div className="form-group">
              <label className="form-label">Scenario Severity Level</label>
              <select
                id="scenario-select"
                className="form-select"
                value={selectedScenario}
                onChange={(e) => handleScenarioChange(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                <option value="Moderate Flood">Moderate Flood</option>
                <option value="High Flood">High Flood</option>
                <option value="Critical Flood">Critical Flood</option>
              </select>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Selecting a scenario updates all 12 trained ML input variables for {selectedCity}
              </div>
            </div>

            {/* Scenario Description box */}
            <div
              style={{
                padding: '0.85rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                marginTop: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontWeight: 700, color: 'var(--navy-dark)', fontSize: '0.88rem' }}>
                  {inputs.scenario_name || selectedScenario} &bull; {selectedCity}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {cityData.region}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {inputs.description || cityData.scenarios[selectedScenario]?.description}
              </div>
            </div>

            {/* Fine-Tuning Toggle & Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', padding: '0.5rem 0' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setEditMode(!editMode)}
                style={{ fontSize: '0.78rem' }}
              >
                <Sliders size={13} style={{ marginRight: '4px' }} />
                <span>{editMode ? 'Hide Feature Inputs' : 'Fine-Tune 12 ML Features'}</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleResetToPreset}
                title="Reset all fields to standard scenario defaults"
                style={{ fontSize: '0.78rem' }}
              >
                <RotateCcw size={13} style={{ marginRight: '4px' }} />
                <span>Reset to City Preset</span>
              </button>
            </div>

            {/* Editable Feature Inputs (Visible when editMode is active) */}
            {editMode && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--border-medium)',
                }}
              >
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--navy-dark)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  Custom Feature Fine-Tuning
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.78rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Rainfall (mm):</label>
                    <input
                      type="number"
                      className="form-control"
                      value={inputs.rainfall_mm}
                      onChange={(e) => handleInputChange('rainfall_mm', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Water Level (m):</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={inputs.water_level_m}
                      onChange={(e) => handleInputChange('water_level_m', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Flood Depth (m):</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={inputs.flood_depth_m}
                      onChange={(e) => handleInputChange('flood_depth_m', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Elevation (m):</label>
                    <input
                      type="number"
                      className="form-control"
                      value={inputs.elevation_m}
                      onChange={(e) => handleInputChange('elevation_m', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Pop Density (/km²):</label>
                    <input
                      type="number"
                      className="form-control"
                      value={inputs.population_density_per_km2}
                      onChange={(e) => handleInputChange('population_density_per_km2', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Bldg Density (/km²):</label>
                    <input
                      type="number"
                      className="form-control"
                      value={inputs.building_density_per_km2}
                      onChange={(e) => handleInputChange('building_density_per_km2', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Road Blockage (%):</label>
                    <input
                      type="number"
                      className="form-control"
                      value={inputs.road_blockage_percent}
                      onChange={(e) => handleInputChange('road_blockage_percent', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Vuln Ratio (0-1):</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={inputs.vulnerable_population_ratio}
                      onChange={(e) => handleInputChange('vulnerable_population_ratio', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>River Dist (km):</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={inputs.distance_from_river_km}
                      onChange={(e) => handleInputChange('distance_from_river_km', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Hospital Access (0-100):</label>
                    <input
                      type="number"
                      className="form-control"
                      value={inputs.hospital_access_score}
                      onChange={(e) => handleInputChange('hospital_access_score', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Hist Floods Count:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={inputs.historical_flood_count}
                      onChange={(e) => handleInputChange('historical_flood_count', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '2px' }}>Infra Damage (0-100):</label>
                    <input
                      type="number"
                      className="form-control"
                      value={inputs.infrastructure_damage_score}
                      onChange={(e) => handleInputChange('infrastructure_damage_score', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Analyse Disaster Action button */}
            <div style={{ marginTop: '1.75rem' }}>
              <button
                id="analyse-disaster-btn"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.98rem', fontWeight: 700 }}
                onClick={handleRunAnalysis}
                disabled={analyzingMl}
              >
                {analyzingMl ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Executing ML Models for {selectedCity}...</span>
                  </>
                ) : (
                  <>
                    <CloudRain size={18} />
                    <span>Analyse Disaster for {selectedCity}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Panel of Selected Input Values */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Database size={18} style={{ color: 'var(--teal-primary)' }} />
                <span>Selected Scenario Input Values &bull; {selectedCity}</span>
              </div>
              <span className="badge badge-info">12 ML Input Features</span>
            </div>

            <div className="card-body">
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Review active hydrologic, urban and vulnerability parameters for <b>{selectedCity}</b> ({selectedScenario}):
              </p>

              {/* Group 1: Hydrologic Metrics */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--navy-primary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Droplets size={14} />
                  <span>Hydrologic Variables</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                  <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-light-blue)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sky-border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rainfall (mm)</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
                      {inputs.rainfall_mm} mm
                    </div>
                  </div>
                  <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-light-blue)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sky-border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Water Level (m)</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
                      {inputs.water_level_m} m
                    </div>
                  </div>
                  <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-light-blue)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sky-border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Flood Depth (m)</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--critical-red)' }}>
                      {inputs.flood_depth_m} m
                    </div>
                  </div>
                  <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-light-blue)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sky-border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Elevation (m)</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
                      {inputs.elevation_m} m
                    </div>
                  </div>
                  <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-light-blue)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sky-border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>River Distance (km)</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
                      {inputs.distance_from_river_km} km
                    </div>
                  </div>
                  <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-light-blue)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sky-border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Historical Floods</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
                      {inputs.historical_flood_count} events
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Demographic & Urban Factors */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--navy-primary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} />
                  <span>Demographic & Urban Density</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                  <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Population Density</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
                      {Number(inputs.population_density_per_km2).toLocaleString()} /km²
                    </div>
                  </div>
                  <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Building Density</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
                      {Number(inputs.building_density_per_km2).toLocaleString()} /km²
                    </div>
                  </div>
                  <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Vulnerable Pop Ratio</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
                      {(Number(inputs.vulnerable_population_ratio) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 3: Vulnerability & Infrastructure */}
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--navy-primary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} />
                  <span>Vulnerability & Infrastructure</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                  <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Road Blockage</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--warning-orange)' }}>
                      {inputs.road_blockage_percent}%
                    </div>
                  </div>
                  <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hospital Access Score</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--teal-primary)' }}>
                      {inputs.hospital_access_score}/100
                    </div>
                  </div>
                  <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Infrastructure Damage</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--critical-red)' }}>
                      {inputs.infrastructure_damage_score}/100
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ML Analysis Results Card */}
          {lastAnalysis && (
            <div className="card" style={{ border: '2px solid var(--teal-primary)' }}>
              <div className="card-header" style={{ backgroundColor: 'var(--bg-teal-light)' }}>
                <div className="card-title" style={{ color: 'var(--teal-dark)' }}>
                  <CheckCircle2 size={18} color="var(--teal-primary)" />
                  <span>ML Output: {lastAnalysis.location} &bull; {lastAnalysis.scenario_name}</span>
                </div>
                <span className="badge badge-sufficient">Live Trained Models</span>
              </div>

              <div className="card-body">
                {/* 3 Core ML Predictions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Predicted Severity</div>
                    <div style={{ marginTop: '4px' }}>
                      <SeverityBadge level={lastAnalysis.prediction.severity} size="md" />
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      severity_model.pkl
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Affected Population</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-dark)', marginTop: '2px' }}>
                      {lastAnalysis.prediction.affected_population.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      affected_pop_model.pkl
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Priority Level</div>
                    <div style={{ marginTop: '4px' }}>
                      <SeverityBadge level={lastAnalysis.prediction.priority} size="md" />
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      priority_model.pkl
                    </div>
                  </div>
                </div>

                {/* Resource Requirements & Inventory Shortage Summary */}
                {lastAnalysis.resources && (
                  <div style={{ marginBottom: '1.25rem', padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--navy-dark)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Truck size={14} color="var(--navy-accent)" />
                      <span>Relief Resource Requirements</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', fontSize: '0.75rem' }}>
                      <div style={{ padding: '0.5rem', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                        <div style={{ color: 'var(--text-muted)' }}>Food Packets:</div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-dark)' }}>
                          {lastAnalysis.resources.food?.required?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: lastAnalysis.resources.food?.shortage > 0 ? 'var(--critical-red)' : 'var(--safe-green)' }}>
                          {lastAnalysis.resources.food?.shortage > 0 ? `-${lastAnalysis.resources.food.shortage} Shortage` : 'Sufficient'}
                        </div>
                      </div>

                      <div style={{ padding: '0.5rem', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                        <div style={{ color: 'var(--text-muted)' }}>Drinking Water:</div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-dark)' }}>
                          {lastAnalysis.resources.water?.required?.toLocaleString()} L
                        </div>
                        <div style={{ fontSize: '0.68rem', color: lastAnalysis.resources.water?.shortage > 0 ? 'var(--critical-red)' : 'var(--safe-green)' }}>
                          {lastAnalysis.resources.water?.shortage > 0 ? `-${lastAnalysis.resources.water.shortage} Shortage` : 'Sufficient'}
                        </div>
                      </div>

                      <div style={{ padding: '0.5rem', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                        <div style={{ color: 'var(--text-muted)' }}>Medical Kits:</div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-dark)' }}>
                          {lastAnalysis.resources.medical_kits?.required?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: lastAnalysis.resources.medical_kits?.shortage > 0 ? 'var(--critical-red)' : 'var(--safe-green)' }}>
                          {lastAnalysis.resources.medical_kits?.shortage > 0 ? `-${lastAnalysis.resources.medical_kits.shortage} Shortage` : 'Sufficient'}
                        </div>
                      </div>

                      <div style={{ padding: '0.5rem', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                        <div style={{ color: 'var(--text-muted)' }}>Blankets:</div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-dark)' }}>
                          {lastAnalysis.resources.blankets?.required?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: lastAnalysis.resources.blankets?.shortage > 0 ? 'var(--critical-red)' : 'var(--safe-green)' }}>
                          {lastAnalysis.resources.blankets?.shortage > 0 ? `-${lastAnalysis.resources.blankets.shortage} Shortage` : 'Sufficient'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SDMA Protocol Action Recommendation */}
                {lastAnalysis.priority_recommendation && (
                  <div style={{ marginBottom: '1.25rem', padding: '0.75rem 0.85rem', backgroundColor: 'var(--bg-light-blue)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--navy-accent)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      SDMA Recommended Operational Protocol
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-dark)', marginTop: '2px' }}>
                      {lastAnalysis.priority_recommendation.recommended_action}
                    </div>
                  </div>
                )}

                {/* Quick Navigation Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => onNavigate('dashboard')}
                  >
                    <span>View Dashboard</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    className="btn btn-teal"
                    style={{ flex: 1 }}
                    onClick={() => onNavigate('impact')}
                  >
                    <span>Impact Analysis</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => onNavigate('priority')}
                  >
                    <span>Resource & Priority</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
