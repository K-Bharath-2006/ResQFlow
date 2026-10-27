import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import LeafletMap from '../components/LeafletMap';
import StatCard from '../components/StatCard';
import SeverityBadge from '../components/SeverityBadge';
import {
  Activity,
  Users,
  Building,
  Route,
  ShieldAlert,
  Hospital,
  GraduationCap,
  Tent,
  Layers,
  ArrowRight,
  Filter,
  MapPin,
  CloudRain,
  HeartPulse,
  Gauge,
  Sliders,
} from 'lucide-react';

export default function ImpactAnalysisPage({ onNavigate }) {
  const { dashboardData, loading, mlAnalysis } = useDisaster();
  const [selectedArea, setSelectedArea] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('All');

  if (loading || !dashboardData) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading spatial impact assessments...</div>;
  }

  const {
    scenario,
    impact_summary,
    facilities,
    roads,
  } = dashboardData;

  const activeMl = mlAnalysis || dashboardData.ml_analysis;
  const locationName = activeMl?.location || 'Chennai';
  const disasterName = activeMl?.disaster_type || 'Flood';
  const predSeverity = activeMl?.prediction?.severity || 'Moderate';
  const predPopulation = activeMl?.prediction?.affected_population ?? impact_summary?.total_affected_population;
  const infraDamage = activeMl?.inputs?.infrastructure_damage_score ?? 65;
  const roadBlockage = activeMl?.inputs?.road_blockage_percent ?? 50;
  const vulnRatio = activeMl?.inputs?.vulnerable_population_ratio ?? 0.16;
  const hospAccess = activeMl?.inputs?.hospital_access_score ?? 55;

  const areas = impact_summary?.areas || [];

  const filteredAreas = severityFilter === 'All'
    ? areas
    : areas.filter((a) => a.severity.toLowerCase() === severityFilter.toLowerCase());

  const handleSelectArea = (area) => {
    setSelectedArea(area);
  };

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Disaster Impact Analysis</h1>
          <p className="page-subtitle">
            Spatial polygon evaluation, infrastructure vulnerability, and ML population exposure for <b>{locationName}</b> ({activeMl?.scenario_name || 'Disaster Scenario'})
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('requirements')}>
          <span>Analyze Resource Requirements</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* 1. ML Impact Analysis Overview Panel */}
      <div className="card" style={{ marginBottom: '1.75rem', border: '1.5px solid var(--sky-border)', backgroundColor: '#ffffff' }}>
        <div className="card-header" style={{ backgroundColor: 'var(--bg-light-blue)' }}>
          <div className="card-title">
            <Activity size={18} style={{ color: 'var(--navy-accent)' }} />
            <span>ML Disaster Prediction & Vulnerability Profile</span>
          </div>
          <span className="badge badge-info">Trained ML Model Inference</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* 1. Selected Location */}
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <MapPin size={13} color="var(--navy-accent)" />
                <span>Selected Location</span>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-dark)', marginTop: '4px' }}>
                {locationName}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                River Basin Inundation Zone
              </div>
            </div>

            {/* 2. Disaster Type */}
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <CloudRain size={13} color="var(--navy-accent)" />
                <span>Disaster Type</span>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-dark)', marginTop: '4px' }}>
                {disasterName}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Precipitation & Spillway Deluge
              </div>
            </div>

            {/* 3. Predicted Severity */}
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <ShieldAlert size={13} color="var(--navy-accent)" />
                <span>Predicted Severity</span>
              </div>
              <div style={{ marginTop: '6px' }}>
                <SeverityBadge level={predSeverity} size="md" />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                via severity_model.pkl
              </div>
            </div>

            {/* 4. Predicted Affected Population */}
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <Users size={13} color="var(--navy-accent)" />
                <span>Predicted Population</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-dark)', marginTop: '4px' }}>
                {predPopulation.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                via affected_population_model.pkl
              </div>
            </div>
          </div>

          {/* Vulnerability & Accessibility Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {/* 5. Infrastructure Damage */}
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Infrastructure Damage Score</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--critical-red)', marginTop: '3px' }}>
                {infraDamage} / 100
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${infraDamage}%`, height: '100%', backgroundColor: 'var(--critical-red)' }} />
              </div>
            </div>

            {/* 6. Road Blockage */}
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Road Network Blockage</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--warning-orange)', marginTop: '3px' }}>
                {roadBlockage}%
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${roadBlockage}%`, height: '100%', backgroundColor: 'var(--warning-orange)' }} />
              </div>
            </div>

            {/* 7. Vulnerable Population Ratio */}
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Vulnerable Population</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-dark)', marginTop: '3px' }}>
                {(vulnRatio * 100).toFixed(0)}%
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${vulnRatio * 100}%`, height: '100%', backgroundColor: 'var(--navy-primary)' }} />
              </div>
            </div>

            {/* 8. Hospital Accessibility */}
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hospital Accessibility Score</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--teal-primary)', marginTop: '3px' }}>
                {hospAccess} / 100
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${hospAccess}%`, height: '100%', backgroundColor: 'var(--teal-primary)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Impact Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Affected Population"
          value={impact_summary?.total_affected_population?.toLocaleString() || '0'}
          subtext="Directly in flood danger zone"
          icon={<Users size={20} />}
          theme="blue"
        />
        <StatCard
          label="Total Affected Buildings"
          value={impact_summary?.total_affected_buildings?.toLocaleString() || '0'}
          subtext="Inundated structures"
          icon={<Building size={20} />}
          theme="blue"
        />
        <StatCard
          label="Total Affected Roads"
          value={`${impact_summary?.total_affected_roads_km || 0} km`}
          subtext="Severed transport corridors"
          icon={<Route size={20} />}
          theme="warning"
        />
        <StatCard
          label="Critical Infrastructure"
          value={impact_summary?.total_critical_infrastructure || 0}
          subtext={`${impact_summary?.total_hospitals_affected || 0} Hospitals & ${impact_summary?.total_schools_affected || 0} Schools`}
          icon={<Hospital size={20} />}
          theme="critical"
        />
        <StatCard
          label="Number of Affected Areas"
          value={impact_summary?.number_of_affected_areas || 0}
          subtext={`${impact_summary?.critical_areas_count || 0} Critical & ${impact_summary?.high_areas_count || 0} High severity`}
          icon={<ShieldAlert size={20} />}
          theme="teal"
        />
      </div>

      {/* 2. Interactive Map Section */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Layers size={18} style={{ color: 'var(--navy-accent)' }} />
            <span>Disaster Inundation Polygon Map</span>
          </div>
          {selectedArea ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Focused Zone: <b>{selectedArea.name}</b></span>
              <SeverityBadge level={selectedArea.severity} size="sm" />
              <button className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem' }} onClick={() => setSelectedArea(null)}>
                Clear Selection
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Click on any flood polygon or list row to isolate area assessment
            </div>
          )}
        </div>
        <div style={{ padding: '0.5rem' }}>
          <LeafletMap
            center={selectedArea ? [selectedArea.center_lat, selectedArea.center_lng] : [scenario?.center_lat || 10.1130, scenario?.center_lng || 76.3530]}
            zoom={selectedArea ? 13 : (scenario?.default_zoom || 12)}
            areas={filteredAreas}
            facilities={facilities || []}
            roads={roads || []}
            selectedAreaId={selectedArea?.id}
            onAreaClick={handleSelectArea}
            height="520px"
          />
        </div>
      </div>

      {/* 3. Detailed Zonal Breakdown Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Activity size={18} style={{ color: 'var(--navy-dark)' }} />
            <span>Zonal Impact & Critical Infrastructure Breakdown</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="All">All Severity Levels</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Only</option>
              <option value="Moderate">Moderate Only</option>
              <option value="Low">Low Only</option>
            </select>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Affected Area / Ward</th>
                  <th>Severity Level</th>
                  <th className="text-right">Max Water Depth</th>
                  <th className="text-right">Affected Population</th>
                  <th className="text-right">Buildings</th>
                  <th className="text-right">Roads (km)</th>
                  <th className="text-center">Hospitals Affected</th>
                  <th className="text-center">Schools Affected</th>
                  <th className="text-center">Active Shelters</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAreas.map((area) => {
                  const isSelected = selectedArea?.id === area.id;
                  return (
                    <tr
                      key={area.id}
                      style={{
                        backgroundColor: isSelected ? 'var(--bg-light-blue)' : undefined,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleSelectArea(area)}
                    >
                      <td style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>
                        {area.name}
                      </td>
                      <td>
                        <SeverityBadge level={area.severity} />
                      </td>
                      <td className="text-right" style={{ fontWeight: 600, color: area.water_depth_m > 2.0 ? 'var(--critical-red)' : 'var(--navy-primary)' }}>
                        {area.water_depth_m} m
                      </td>
                      <td className="text-right" style={{ fontWeight: 600 }}>
                        {area.population.toLocaleString()}
                      </td>
                      <td className="text-right">
                        {area.buildings.toLocaleString()}
                      </td>
                      <td className="text-right">
                        {area.roads_km} km
                      </td>
                      <td className="text-center" style={{ color: area.hospitals_affected > 0 ? 'var(--critical-red)' : 'var(--safe-green)', fontWeight: 700 }}>
                        {area.hospitals_affected}
                      </td>
                      <td className="text-center">
                        {area.schools_affected}
                      </td>
                      <td className="text-center" style={{ fontWeight: 600, color: 'var(--teal-primary)' }}>
                        {area.shelters_count}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectArea(area);
                          }}
                        >
                          Focus on Map
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
