import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import SeverityBadge from '../components/SeverityBadge';
import StatCard from '../components/StatCard';
import {
  Calculator,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  Boxes,
} from 'lucide-react';

export default function RequirementAnalysisPage({ onNavigate }) {
  const { requirements, impactSummary, loading, refreshData, mlAnalysis } = useDisaster();
  const [provisionDays, setProvisionDays] = useState(1); // 1 day base emergency rate or multi-day contingency

  const totalPop = mlAnalysis?.prediction?.affected_population ?? (impactSummary?.total_affected_population || 0);


  // Recalculate dynamic requirements if user switches contingency cycle
  const computedRequirements = (requirements || []).map((req) => {
    let reqMultiplier = 1;
    if (req.category === 'Food packets' || req.category === 'Drinking water') {
      reqMultiplier = provisionDays;
    }
    const dynamicRequired = Math.round(req.required * reqMultiplier);
    const dynamicShortage = Math.max(0, dynamicRequired - req.available);
    const dynamicDeficitPct = dynamicRequired > 0 ? Math.round((dynamicShortage / dynamicRequired) * 100 * 10) / 10 : 0;

    let dynamicStatus = 'Sufficient';
    if (dynamicDeficitPct >= 40) {
      dynamicStatus = 'Critical Shortage';
    } else if (dynamicDeficitPct > 0) {
      dynamicStatus = 'Moderate Deficit';
    }

    return {
      ...req,
      required: dynamicRequired,
      shortage: dynamicShortage,
      deficit_pct: dynamicDeficitPct,
      status: dynamicStatus,
    };
  });

  const totalRequiredUnits = computedRequirements.reduce((sum, r) => sum + r.required, 0);
  const totalAvailableUnits = computedRequirements.reduce((sum, r) => sum + r.available, 0);
  const totalShortageUnits = computedRequirements.reduce((sum, r) => sum + r.shortage, 0);
  const criticalDeficitCount = computedRequirements.filter((r) => r.status === 'Critical Shortage').length;

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Resource Requirement Analysis</h1>
          <p className="page-subtitle">
            Dynamic calculation of relief material needs against live depot inventory for <b>{totalPop.toLocaleString()} affected citizens</b>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => onNavigate('resources')}>
            <span>Adjust Inventory</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('priority')}>
            <span>Proceed to Priority & Allocation</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 1. Summary Cards */}
      <div className="stats-grid">
        <StatCard
          label="Affected Population"
          value={totalPop.toLocaleString()}
          subtext="Base population index for norms"
          icon={<Calculator size={20} />}
          theme="blue"
        />
        <StatCard
          label="Total Units Required"
          value={totalRequiredUnits.toLocaleString()}
          subtext={`Norms calculated for ${provisionDays} day(s)`}
          icon={<Boxes size={20} />}
          theme="blue"
        />
        <StatCard
          label="Available Warehouse Stock"
          value={totalAvailableUnits.toLocaleString()}
          subtext="Aggregated ready materials"
          icon={<CheckCircle size={20} />}
          theme="teal"
        />
        <StatCard
          label="Total Supply Shortage"
          value={totalShortageUnits.toLocaleString()}
          subtext="Immediate supply deficit"
          icon={<TrendingDown size={20} />}
          theme="critical"
        />
      </div>

      {/* 2. Relief Norms Guidance Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-light-blue)', borderColor: 'var(--sky-border)' }}>
        <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--navy-dark)', fontSize: '0.9rem' }}>
                <Info size={16} style={{ color: 'var(--navy-primary)' }} />
                <span>Statutory Relief Norms & Calculation Rules</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Formulas applied dynamically from affected headcount: <b>Food</b> (2 packets/person/day) &bull; <b>Water</b> (3 L/person/day) &bull; <b>Medical Kits</b> (1 kit/25 people) &bull; <b>Blankets</b> (1 blanket/person)
              </p>
            </div>

            {/* Contingency Cycle Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy-dark)' }}>Contingency Cycle:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3].map((days) => (
                  <button
                    key={days}
                    className={`btn btn-sm ${provisionDays === days ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.25rem 0.65rem' }}
                    onClick={() => setProvisionDays(days)}
                  >
                    {days} Day{days > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Core Resource Requirements Table */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Calculator size={18} style={{ color: 'var(--navy-accent)' }} />
            <span>Relief Materials: Demand vs Availability vs Shortage</span>
          </div>
          {criticalDeficitCount > 0 && (
            <span className="badge badge-critical">
              <AlertTriangle size={12} />
              <span>{criticalDeficitCount} Critical Shortages Detected</span>
            </span>
          )}
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Resource Item</th>
                  <th>Relief Norm Formula</th>
                  <th className="text-right">Required</th>
                  <th className="text-right">Available in Stock</th>
                  <th className="text-right">Net Shortage (Deficit)</th>
                  <th style={{ width: '160px' }}>Deficit Ratio</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {computedRequirements.map((req, index) => {
                  const hasShortage = req.shortage > 0;
                  return (
                    <tr key={index}>
                      <td style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>
                        {req.resource}
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          Category: {req.category}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {req.norm_description}
                      </td>
                      <td className="text-right" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {req.required.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>{req.unit}</span>
                      </td>
                      <td className="text-right" style={{ fontWeight: 600, color: 'var(--teal-primary)' }}>
                        {req.available.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>{req.unit}</span>
                      </td>
                      <td className="text-right" style={{ fontWeight: 800, fontSize: '0.95rem', color: hasShortage ? 'var(--critical-red)' : 'var(--safe-green)' }}>
                        {hasShortage ? `-${req.shortage.toLocaleString()}` : '0'} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>{req.unit}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="progress-bar-container" style={{ flex: 1 }}>
                            <div
                              className={`progress-bar-fill ${
                                req.deficit_pct >= 40
                                  ? 'progress-fill-critical'
                                  : req.deficit_pct > 0
                                  ? 'progress-fill-warning'
                                  : 'progress-fill-sufficient'
                              }`}
                              style={{ width: `${Math.min(100, req.deficit_pct)}%` }}
                            />
                          </div>
                          <span style={{ fontSize: '0.76rem', fontWeight: 700, minWidth: '38px', textAlign: 'right' }}>
                            {req.deficit_pct}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <SeverityBadge level={req.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Action Recommendation Callout */}
      <div className="card" style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-light)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--navy-dark)', fontSize: '0.95rem' }}>
                Next Operational Step: Multi-Criteria Priority Ranking
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Since aggregate shortages exist for Food, Water, and Blankets, available stock must be allocated strictly by area vulnerability and severity ranking.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => onNavigate('priority')}>
              <span>View Priority Ranking & Allocation Engine</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
