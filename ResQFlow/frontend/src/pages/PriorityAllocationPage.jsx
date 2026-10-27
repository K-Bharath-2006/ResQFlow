import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { api } from '../services/api';
import SeverityBadge from '../components/SeverityBadge';
import LeafletMap from '../components/LeafletMap';
import {
  Compass,
  TrendingUp,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function PriorityAllocationPage({ onNavigate }) {
  const { priorities, allocations, dashboardData, refreshData, loading, mlAnalysis } = useDisaster();
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [dispatchingId, setDispatchingId] = useState(null);
  const [dispatchedHistory, setDispatchedHistory] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const areas = dashboardData?.impact_summary?.areas || [];
  const facilities = dashboardData?.facilities || [];
  const roads = dashboardData?.roads || [];
  const scenario = dashboardData?.scenario;

  const activeMl = mlAnalysis || dashboardData?.ml_analysis;
  const predSeverity = activeMl?.prediction?.severity || 'Moderate';
  const predPop = activeMl?.prediction?.affected_population ?? (dashboardData?.impact_summary?.total_affected_population || 0);
  const predPriority = activeMl?.prediction?.priority || 'Medium';

  const resFood = activeMl?.resources?.food || { required: predPop * 2, available: 10000, shortage: Math.max(0, predPop * 2 - 10000), status: predPop * 2 > 10000 ? 'Shortage' : 'Sufficient' };
  const resWater = activeMl?.resources?.water || { required: predPop * 3, available: 15000, shortage: Math.max(0, predPop * 3 - 15000), status: predPop * 3 > 15000 ? 'Shortage' : 'Sufficient' };
  const resMed = activeMl?.resources?.medical_kits || { required: Math.ceil(predPop / 25), available: 350, shortage: Math.max(0, Math.ceil(predPop / 25) - 350), status: Math.ceil(predPop / 25) > 350 ? 'Shortage' : 'Sufficient' };
  const resBlankets = activeMl?.resources?.blankets || { required: Math.ceil(predPop * 0.85), available: 5000, shortage: Math.max(0, Math.ceil(predPop * 0.85) - 5000), status: Math.ceil(predPop * 0.85) > 5000 ? 'Shortage' : 'Sufficient' };

  const reasonsList = activeMl?.priority_recommendation?.reasons || [
    `${predSeverity} disaster severity estimated from hydrologic metrics`,
    `Significant affected population exposed in flood corridor (${predPop.toLocaleString()} citizens)`,
    'Infrastructure damage impacting lifeline service delivery',
    resFood.shortage > 0 || resWater.shortage > 0 ? 'Urgent relief resource shortages detected' : 'Current warehouse stock sufficient for immediate relief norms'
  ];

  const recAction = activeMl?.priority_recommendation?.recommended_action ||
    'Deploy Priority Relief Convoys & Stage Tactical Rescue Assets';

  const handleSelectArea = (areaId) => {
    setSelectedAreaId(areaId === selectedAreaId ? null : areaId);
  };

  const handleDispatch = async (alloc) => {
    setDispatchingId(alloc.area_id);
    setSuccessMessage('');
    try {
      const res = await api.dispatchAllocation(alloc);
      setDispatchedHistory((prev) => [alloc.area_id, ...prev]);
      setSuccessMessage(`Relief convoy successfully dispatched to ${alloc.area_name}! Order logged in SDMA database.`);
      await refreshData();
    } catch (err) {
      alert('Failed to execute dispatch: ' + err.message);
    } finally {
      setDispatchingId(null);
    }
  };

  const activeFocusArea = areas.find((a) => a.id === selectedAreaId);

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Results & Priority Allocation</h1>
          <p className="page-subtitle">
            ML Decision Priority Synthesis, Relief Resource Analysis & Multi-Criteria Logistics Dispatch &bull; <b>{activeMl?.location || 'Chennai'}</b> ({activeMl?.scenario_name || 'Disaster Scenario'})
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => onNavigate('dashboard')}>
          <span>Return to Operations Dashboard</span>
        </button>
      </div>

      {successMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--safe-bg)',
          color: 'var(--safe-text)',
          border: '1px solid var(--safe-border)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
          fontSize: '0.88rem',
          fontWeight: 600,
        }}>
          <CheckCircle2 size={20} color="var(--safe-green)" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SECTION 1: ML Prediction Summary */}
      <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid var(--sky-border)' }}>
        <div className="card-header" style={{ backgroundColor: 'var(--bg-light-blue)' }}>
          <div className="card-title">
            <Sparkles size={18} style={{ color: 'var(--navy-accent)' }} />
            <span>ML Prediction Summary &bull; {activeMl?.location || 'Chennai'}</span>
          </div>
          <span className="badge badge-info">{activeMl?.location ? `${activeMl.location} • ` : ''}{activeMl?.scenario_name || 'Disaster Scenario'}</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Predicted Severity
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <SeverityBadge level={predSeverity} size="lg" />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                via severity_model.pkl
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Affected Population
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--navy-dark)', marginTop: '0.25rem' }}>
                {predPop.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                via affected_population_model.pkl
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Priority Level
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <SeverityBadge level={predPriority} size="lg" />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                via priority_model.pkl
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Resource Analysis Table */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Truck size={18} style={{ color: 'var(--navy-accent)' }} />
            <span>Resource Analysis</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Calculated against demo warehouse inventory
          </span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Relief Resource</th>
                  <th className="text-right">Required Quantity</th>
                  <th className="text-right">Available Inventory</th>
                  <th className="text-right">Shortage</th>
                  <th>Supply Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>Food Packets</td>
                  <td className="text-right" style={{ fontWeight: 600 }}>{resFood.required.toLocaleString()} packets</td>
                  <td className="text-right">{resFood.available.toLocaleString()} packets</td>
                  <td className="text-right" style={{ fontWeight: 700, color: resFood.shortage > 0 ? 'var(--critical-red)' : 'var(--safe-green)' }}>
                    {resFood.shortage.toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${resFood.shortage > 0 ? 'badge-critical' : 'badge-sufficient'}`}>
                      {resFood.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>Drinking Water</td>
                  <td className="text-right" style={{ fontWeight: 600 }}>{resWater.required.toLocaleString()} Litres</td>
                  <td className="text-right">{resWater.available.toLocaleString()} Litres</td>
                  <td className="text-right" style={{ fontWeight: 700, color: resWater.shortage > 0 ? 'var(--critical-red)' : 'var(--safe-green)' }}>
                    {resWater.shortage.toLocaleString()} L
                  </td>
                  <td>
                    <span className={`badge ${resWater.shortage > 0 ? 'badge-critical' : 'badge-sufficient'}`}>
                      {resWater.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>Medical Kits</td>
                  <td className="text-right" style={{ fontWeight: 600 }}>{resMed.required.toLocaleString()} kits</td>
                  <td className="text-right">{resMed.available.toLocaleString()} kits</td>
                  <td className="text-right" style={{ fontWeight: 700, color: resMed.shortage > 0 ? 'var(--critical-red)' : 'var(--safe-green)' }}>
                    {resMed.shortage.toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${resMed.shortage > 0 ? 'badge-critical' : 'badge-sufficient'}`}>
                      {resMed.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>Thermal Blankets</td>
                  <td className="text-right" style={{ fontWeight: 600 }}>{resBlankets.required.toLocaleString()} units</td>
                  <td className="text-right">{resBlankets.available.toLocaleString()} units</td>
                  <td className="text-right" style={{ fontWeight: 700, color: resBlankets.shortage > 0 ? 'var(--critical-red)' : 'var(--safe-green)' }}>
                    {resBlankets.shortage.toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${resBlankets.shortage > 0 ? 'badge-critical' : 'badge-sufficient'}`}>
                      {resBlankets.status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 3: Priority Recommendation Panel */}
      <div
        className="card"
        style={{
          marginBottom: '1.75rem',
          backgroundColor: predPriority.toLowerCase() === 'critical' ? 'var(--critical-bg)' : predPriority.toLowerCase() === 'high' ? 'var(--warning-bg)' : 'var(--bg-light-blue)',
          borderColor: predPriority.toLowerCase() === 'critical' ? 'var(--critical-border)' : predPriority.toLowerCase() === 'high' ? 'var(--warning-border)' : 'var(--sky-border)',
        }}
      >
        <div className="card-body" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={22} color={predPriority.toLowerCase() === 'critical' ? 'var(--critical-red)' : predPriority.toLowerCase() === 'high' ? 'var(--warning-orange)' : 'var(--navy-primary)'} />
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: predPriority.toLowerCase() === 'critical' ? 'var(--critical-text)' : predPriority.toLowerCase() === 'high' ? 'var(--warning-text)' : 'var(--navy-dark)', letterSpacing: '0.02em' }}>
                {predPriority.toUpperCase()} PRIORITY RECOMMENDATION
              </div>
            </div>
            <SeverityBadge level={predPriority} size="md" />
          </div>

          <div style={{ fontWeight: 700, color: 'var(--navy-dark)', fontSize: '0.86rem', marginBottom: '0.4rem' }}>
            Reason:
          </div>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            {reasonsList.map((reason, idx) => (
              <li key={idx} style={{ marginBottom: '2px' }}>
                {reason}
              </li>
            ))}
          </ul>

          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Operational Directive:
              </span>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--navy-dark)', marginTop: '2px' }}>
                {recAction}
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('resources')}
            >
              <span>Manage Relief Inventory</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Priority Ranking Table */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div className="card-title">
            <TrendingUp size={18} style={{ color: 'var(--navy-accent)' }} />
            <span>Multi-Criteria Area Priority Ranking (Highest Priority First)</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Ranked by: Population (30%), Severity (25%), Vulnerability (15%), Damage (15%), Shortage (15%)
          </span>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Area / Taluk Name</th>
                  <th className="text-right">Population Affected</th>
                  <th>Disaster Severity</th>
                  <th>Key Estimated Shortages</th>
                  <th className="text-right">Vulnerability</th>
                  <th className="text-right">Priority Score</th>
                  <th>Priority Level</th>
                  <th className="text-center">Map Action</th>
                </tr>
              </thead>
              <tbody>
                {(priorities || []).map((item) => {
                  const isSelected = selectedAreaId === item.area_id;
                  const isDispatched = dispatchedHistory.includes(item.area_id);

                  return (
                    <tr
                      key={item.area_id}
                      style={{
                        backgroundColor: isSelected ? 'var(--bg-light-blue)' : undefined,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleSelectArea(item.area_id)}
                    >
                      <td style={{ fontWeight: 800, color: item.rank <= 2 ? 'var(--critical-red)' : 'var(--navy-primary)' }}>
                        #{item.rank}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>
                        {item.area_name}
                      </td>
                      <td className="text-right" style={{ fontWeight: 600 }}>
                        {item.population.toLocaleString()}
                      </td>
                      <td>
                        <SeverityBadge level={item.severity} />
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <span>🍱 {item.key_shortages.food_packets.toLocaleString()} food &bull; 💧 {item.key_shortages.drinking_water_l.toLocaleString()} L water</span>
                      </td>
                      <td className="text-right" style={{ fontWeight: 600 }}>
                        {item.vulnerability_score}%
                      </td>
                      <td className="text-right">
                        <span style={{
                          fontWeight: 800,
                          fontSize: '0.98rem',
                          color: item.priority_score >= 75 ? 'var(--critical-red)' : (item.priority_score >= 50 ? 'var(--warning-orange)' : 'var(--navy-primary)'),
                        }}>
                          {item.priority_score}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}> / 100</span>
                      </td>
                      <td>
                        <SeverityBadge level={item.priority_level} />
                      </td>
                      <td className="text-center">
                        <button
                          className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'} btn-sm`}
                          style={{ padding: '0.2rem 0.55rem', fontSize: '0.74rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectArea(item.area_id);
                          }}
                        >
                          {isSelected ? 'Focused' : 'Locate'}
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

      {/* 2. Priority Map Highlight */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Compass size={18} style={{ color: 'var(--teal-primary)' }} />
            <span>Spatial Priority Map & Supply Deployment Routes</span>
          </div>
          {activeFocusArea && (
            <span style={{ fontSize: '0.82rem', color: 'var(--navy-primary)', fontWeight: 600 }}>
              Viewing Priority Hotspot: {activeFocusArea.name} ({activeFocusArea.severity})
            </span>
          )}
        </div>
        <div style={{ padding: '0.5rem' }}>
          <LeafletMap
            center={activeFocusArea ? [activeFocusArea.center_lat, activeFocusArea.center_lng] : [scenario?.center_lat || 10.1130, scenario?.center_lng || 76.3530]}
            zoom={activeFocusArea ? 13 : (scenario?.default_zoom || 12)}
            areas={areas}
            facilities={facilities}
            roads={roads}
            selectedAreaId={selectedAreaId}
            onAreaClick={(area) => setSelectedAreaId(area.id)}
            height="460px"
          />
        </div>
      </div>

      {/* 3. Section 8: Relief Allocation Recommendations */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Truck size={18} style={{ color: 'var(--teal-primary)' }} />
            <span>Relief Allocation Recommendations & Dispatch Queue</span>
          </div>
          <span className="badge badge-info">
            <Sparkles size={12} />
            <span>Algorithmic Optimization</span>
          </span>
        </div>

        <div className="card-body">
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            The recommendation engine allocates available warehouse stocks to the highest-priority areas first to ensure maximum life-saving impact:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {(allocations || []).map((alloc) => {
              const isDispatched = dispatchedHistory.includes(alloc.area_id);
              const isProcessing = dispatchingId === alloc.area_id;

              return (
                <div
                  key={alloc.area_id}
                  style={{
                    border: `1.5px solid ${alloc.priority_level === 'Critical' ? 'var(--critical-border)' : (alloc.priority_level === 'High' ? 'var(--warning-border)' : 'var(--border-light)')}`,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: alloc.priority_level === 'Critical' ? 'var(--critical-bg)' : '#ffffff',
                    padding: '1.25rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--navy-dark)',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}>
                          {alloc.dispatch_order}
                        </span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-dark)', margin: 0 }}>
                          {alloc.area_name}
                        </h3>
                        <SeverityBadge level={alloc.priority_level} />
                      </div>

                      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', marginLeft: '36px' }}>
                        <span>Affected Population: <b>{alloc.population.toLocaleString()}</b></span>
                        <span>Priority Score: <b>{alloc.priority_score} / 100</b></span>
                        <span>Dispatch Status: <b style={{ color: isDispatched ? 'var(--safe-green)' : 'inherit' }}>{isDispatched ? 'Convoys En Route' : alloc.status}</b></span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleSelectArea(alloc.area_id)}
                      >
                        <MapPin size={13} />
                        <span>Locate</span>
                      </button>

                      <button
                        className={`btn ${isDispatched ? 'btn-teal' : 'btn-primary'} btn-sm`}
                        disabled={isProcessing || isDispatched}
                        onClick={() => handleDispatch(alloc)}
                      >
                        {isProcessing ? (
                          <span>Dispatching...</span>
                        ) : isDispatched ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Dispatched</span>
                          </>
                        ) : (
                          <>
                            <Send size={13} />
                            <span>Confirm & Dispatch Convoy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Recommendation Narrative Box */}
                  <div style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1rem',
                    marginLeft: '36px',
                  }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Recommended Action:
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-dark)', marginTop: '2px' }}>
                      {alloc.recommended_action}
                    </div>
                  </div>

                  {/* Allocated Resources Breakdown */}
                  <div style={{ marginLeft: '36px' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                      Allocation Manifest from Available Stock:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
                      {Object.entries(alloc.allocated_resources).map(([resName, qty]) => (
                        <div
                          key={resName}
                          style={{
                            padding: '0.6rem 0.8rem',
                            backgroundColor: qty > 0 ? 'var(--bg-light-blue)' : '#f8fafc',
                            border: `1px solid ${qty > 0 ? 'var(--sky-border)' : 'var(--border-light)'}`,
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{resName}</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: qty > 0 ? 'var(--navy-primary)' : 'var(--text-muted)', marginTop: '2px' }}>
                            {qty > 0 ? `+${qty.toLocaleString()}` : '0 (Stock Exhausted)'}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Source Logistics Hub: <b>{alloc.source_warehouse}</b></span>
                      <span>Estimated Transit Time: <b>{alloc.estimated_transit_time}</b></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
