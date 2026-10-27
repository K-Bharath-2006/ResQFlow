import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import StatCard from '../components/StatCard';
import SeverityBadge from '../components/SeverityBadge';
import LeafletMap from '../components/LeafletMap';
import {
  Users,
  Building,
  Route,
  AlertTriangle,
  Boxes,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Clock,
  Compass,
  FileSpreadsheet,
} from 'lucide-react';

export default function DashboardPage({ onNavigate }) {
  const { dashboardData, loading, mlAnalysis } = useDisaster();
  const [selectedArea, setSelectedArea] = useState(null);

  if (loading || !dashboardData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy-dark)' }}>
          Loading Operational Disaster Analytics...
        </div>
        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Fetching live geospatial data from ResQFlow engine</p>
      </div>
    );
  }

  const {
    scenario,
    summary_cards,
    impact_summary,
    requirements,
    priority_areas,
    recent_disaster_analysis,
    facilities,
    roads,
  } = dashboardData;

  const totalPop = summary_cards.affected_population || 0;
  const totalBuildings = summary_cards.affected_buildings || 0;
  const totalRoads = summary_cards.affected_roads_km || 0;
  const criticalAreas = summary_cards.critical_areas_count || 0;
  const availableRes = summary_cards.available_resources_count || 0;
  const shortageRes = summary_cards.resource_shortage_count || 0;

  // ML Trained Model Inference Values (strictly dynamic from trained .pkl models)
  const activeMl = mlAnalysis || dashboardData.ml_analysis;
  const predSeverity = activeMl?.prediction?.severity || 'Moderate';
  const predPopulation = activeMl?.prediction?.affected_population ?? totalPop;
  const predPriority = activeMl?.prediction?.priority || 'Medium';

  const foodShortage = activeMl?.resources?.food?.shortage ?? 0;
  const waterShortage = activeMl?.resources?.water?.shortage ?? 0;
  const medShortage = activeMl?.resources?.medical_kits?.shortage ?? 0;
  const blanketShortage = activeMl?.resources?.blankets?.shortage ?? 0;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Disaster Operations Dashboard</h1>
          <p className="page-subtitle">
            Real-time situational awareness & relief logistics overview &bull; <b>{activeMl?.scenario_name || scenario?.title} ({activeMl?.location || 'Chennai'})</b>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => onNavigate('scenario')}>
            <span>Switch Scenario</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('priority')}>
            <span>View Relief Allocations</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 1. ML Trained Model Inference Summary Section */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--teal-primary)' }} />
            <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--navy-dark)', letterSpacing: '-0.01em', margin: 0 }}>
              Trained Machine Learning Model Predictions
            </h2>
            <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
              joblib .pkl inference
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Location: <b>{activeMl?.location || 'Chennai'}</b> &bull; Event: <b>{activeMl?.scenario_name || 'Disaster Scenario'}</b>
          </div>
        </div>

        <div className="stats-grid">
          {/* Card 1: Predicted Severity */}
          <StatCard
            label="Predicted Severity"
            value={predSeverity.toUpperCase()}
            subtext="RandomForestClassifier (.pkl)"
            icon={<ShieldAlert size={20} />}
            theme={predSeverity.toLowerCase() === 'critical' ? 'critical' : predSeverity.toLowerCase() === 'high' ? 'warning' : 'blue'}
          />

          {/* Card 2: Affected Population */}
          <StatCard
            label="Affected Population"
            value={predPopulation.toLocaleString()}
            subtext="RandomForestRegressor (.pkl)"
            icon={<Users size={20} />}
            theme="blue"
          />

          {/* Card 3: Priority Level */}
          <StatCard
            label="Priority Level"
            value={predPriority.toUpperCase()}
            subtext="Decision Priority Model (.pkl)"
            icon={<AlertTriangle size={20} />}
            theme={predPriority.toLowerCase() === 'critical' ? 'critical' : predPriority.toLowerCase() === 'high' ? 'warning' : 'teal'}
          />

          {/* Card 4: Food Shortage */}
          <StatCard
            label="Food Shortage"
            value={foodShortage > 0 ? `${foodShortage.toLocaleString()}` : '0'}
            subtext={foodShortage > 0 ? 'Urgent ration deficit' : 'Depot stock sufficient'}
            icon={<TrendingDown size={20} />}
            theme={foodShortage > 0 ? 'critical' : 'teal'}
          />

          {/* Card 5: Water Shortage */}
          <StatCard
            label="Water Shortage"
            value={waterShortage > 0 ? `${waterShortage.toLocaleString()} L` : '0 L'}
            subtext={waterShortage > 0 ? 'Potable water deficit' : 'Depot stock sufficient'}
            icon={<TrendingDown size={20} />}
            theme={waterShortage > 0 ? 'critical' : 'teal'}
          />

          {/* Card 6: Medical Kits Shortage */}
          <StatCard
            label="Medical Kits Shortage"
            value={medShortage > 0 ? `${medShortage.toLocaleString()}` : '0'}
            subtext={medShortage > 0 ? 'Urgent trauma supplies deficit' : 'Depot stock sufficient'}
            icon={<Boxes size={20} />}
            theme={medShortage > 0 ? 'critical' : 'teal'}
          />
        </div>
      </div>

      {/* 2. Situational Infrastructure & Field Stats */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Spatial Infrastructure & Operational Logistics
        </h2>
        <div className="stats-grid">
          <StatCard
            label="Affected Buildings"
            value={totalBuildings.toLocaleString()}
            subtext="Residential & commercial structures"
            icon={<Building size={20} />}
            theme="blue"
          />
          <StatCard
            label="Affected Roads"
            value={`${totalRoads} km`}
            subtext="Submerged / cut-off transport links"
            icon={<Route size={20} />}
            theme="warning"
          />
          <StatCard
            label="Critical Inundation Wards"
            value={criticalAreas}
            subtext="High-risk operational sectors"
            icon={<AlertTriangle size={20} />}
            theme="critical"
          />
          <StatCard
            label="Available Depot Resources"
            value={availableRes.toLocaleString()}
            subtext="Total units across relief centers"
            icon={<Boxes size={20} />}
            theme="teal"
          />
        </div>
      </div>

      {/* 2. Map Section */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Compass size={18} style={{ color: 'var(--navy-accent)' }} />
            <span>Interactive Operational Map – Flood Inundation & Relief Assets</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Click any zone or facility marker to view field assessments
          </div>
        </div>
        <div style={{ padding: '0.5rem' }}>
          <LeafletMap
            center={[scenario?.center_lat || 10.1130, scenario?.center_lng || 76.3530]}
            zoom={scenario?.default_zoom || 12}
            areas={impact_summary?.areas || []}
            facilities={facilities || []}
            roads={roads || []}
            selectedAreaId={selectedArea?.id}
            onAreaClick={(area) => setSelectedArea(area)}
            height="500px"
          />
        </div>
      </div>

      {/* 3. Dashboard Sections Grid */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* Disaster Severity Summary */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShieldAlert size={18} style={{ color: 'var(--warning-orange)' }} />
              <span>Disaster Severity Summary</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('impact')}>
              Full Impact Details
            </button>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Zonal classification across {impact_summary?.number_of_affected_areas || 8} affected local body taluks:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Critical */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--critical-text)' }}>Critical Severity (&gt;2m Inundation)</span>
                  <span style={{ fontWeight: 700 }}>{impact_summary?.critical_areas_count || 0} Areas</span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill progress-fill-critical"
                    style={{
                      width: `${((impact_summary?.critical_areas_count || 0) / (impact_summary?.number_of_affected_areas || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* High */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--warning-text)' }}>High Severity (1.2m – 2.0m)</span>
                  <span style={{ fontWeight: 700 }}>{impact_summary?.high_areas_count || 0} Areas</span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill progress-fill-warning"
                    style={{
                      width: `${((impact_summary?.high_areas_count || 0) / (impact_summary?.number_of_affected_areas || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Moderate */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--moderate-text)' }}>Moderate Severity (0.6m – 1.2m)</span>
                  <span style={{ fontWeight: 700 }}>{impact_summary?.moderate_areas_count || 0} Areas</span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill progress-fill-moderate"
                    style={{
                      width: `${((impact_summary?.moderate_areas_count || 0) / (impact_summary?.number_of_affected_areas || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Low */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--navy-primary)' }}>Low Severity (&lt;0.6m)</span>
                  <span style={{ fontWeight: 700 }}>{impact_summary?.low_areas_count || 0} Areas</span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill progress-fill-sufficient"
                    style={{
                      width: `${((impact_summary?.low_areas_count || 0) / (impact_summary?.number_of_affected_areas || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.85rem', backgroundColor: 'var(--bg-light-blue)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--sky-border)', fontSize: '0.78rem', color: 'var(--navy-dark)' }}>
              <b>Active Field Report:</b> Extreme inundation concentrated along Periyar lowlands. Aluva and Paravur wards report 2 hospitals surrounded by floodwaters.
            </div>
          </div>
        </div>

        {/* Resource Shortage Summary */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Boxes size={18} style={{ color: 'var(--teal-primary)' }} />
              <span>Resource Shortage Summary</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('requirements')}>
              Manage Needs
            </button>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Comparison of calculated emergency requirement vs warehouse inventory:
            </p>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Relief Category</th>
                    <th className="text-right">Required</th>
                    <th className="text-right">Available</th>
                    <th className="text-right">Deficit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(requirements || []).slice(0, 4).map((req, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{req.resource}</td>
                      <td className="text-right">{req.required.toLocaleString()}</td>
                      <td className="text-right">{req.available.toLocaleString()}</td>
                      <td className="text-right" style={{ color: req.shortage > 0 ? 'var(--critical-red)' : 'var(--safe-green)', fontWeight: 700 }}>
                        {req.shortage > 0 ? `-${req.shortage.toLocaleString()}` : '0'}
                      </td>
                      <td>
                        <SeverityBadge level={req.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.85rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => onNavigate('requirements')}>
                <span>View All 6 Relief Items</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Priority Area Summary & Recent Disaster Analysis Grid */}
      <div className="grid-2">
        {/* Priority Area Summary */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={18} style={{ color: 'var(--critical-red)' }} />
              <span>Priority Areas Requiring Urgent Relief</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('priority')}>
              View All Areas
            </button>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Area Name</th>
                    <th className="text-right">Population</th>
                    <th>Severity</th>
                    <th className="text-right">Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(priority_areas || []).map((p) => (
                    <tr key={p.area_id}>
                      <td style={{ fontWeight: 700, color: 'var(--navy-primary)' }}>#{p.rank}</td>
                      <td style={{ fontWeight: 600 }}>{p.area_name}</td>
                      <td className="text-right">{p.population.toLocaleString()}</td>
                      <td>
                        <SeverityBadge level={p.severity} size="sm" />
                      </td>
                      <td className="text-right" style={{ fontWeight: 700 }}>{p.priority_score}</td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                          onClick={() => onNavigate('priority')}
                        >
                          Dispatch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Disaster Analysis */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Clock size={18} style={{ color: 'var(--navy-accent)' }} />
              <span>Disaster Analysis Brief</span>
            </div>
            <SeverityBadge level={recent_disaster_analysis?.severity || 'Critical'} />
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Active Disaster Event
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-dark)', marginTop: '2px' }}>
                  {recent_disaster_analysis?.scenario_title}
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.8rem' }}>
                  Target Region: <b>{recent_disaster_analysis?.district}</b> &bull; Type: <b>{recent_disaster_analysis?.type}</b>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Scenario Mode</div>
                  <div style={{ fontWeight: 600, color: 'var(--navy-primary)', marginTop: '2px' }}>
                    {recent_disaster_analysis?.scenario_type?.split('(')[0] || 'Simulated'}
                  </div>
                </div>
                <div style={{ padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Evacuation Readiness</div>
                  <div style={{ fontWeight: 600, color: 'var(--critical-red)', marginTop: '2px' }}>
                    {recent_disaster_analysis?.evacuation_readiness}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '4px' }}>
                {scenario?.description}
              </div>

              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => onNavigate('scenario')}
                >
                  Re-evaluate Disaster Scenario
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
