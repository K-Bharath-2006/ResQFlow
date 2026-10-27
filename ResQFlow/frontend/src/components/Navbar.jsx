import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDisaster } from '../context/DisasterContext';
import { RefreshCw, Shield, MapPin, Clock } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const { activeScenario, refreshData, loading, lastRefreshed, isApiConnected } = useDisaster();

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <div className="nav-title">
          ResQFlow <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.9rem' }}>| Disaster Impact & Relief Resource Analyser</span>
        </div>
        {activeScenario && (
          <div className="nav-badge-live">
            <MapPin size={12} style={{ color: 'var(--navy-accent)' }} />
            <span>{activeScenario.district}</span>
          </div>
        )}
        <div style={{ marginLeft: '6px' }}>
          {isApiConnected ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'var(--safe-bg)',
                color: 'var(--safe-text)',
                border: '1px solid var(--safe-border)',
              }}
              title="Connected to live FastAPI backend on port 8000"
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
              Live API
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: '#f0f9ff',
                color: '#0369a1',
                border: '1px solid #bae6fd',
              }}
              title="Operating on built-in disaster operational data. Start backend (uvicorn main:app) for live DB sync."
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0284c7' }}></span>
              Standalone Mode
            </span>
          )}
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="btn btn-outline btn-sm"
          onClick={refreshData}
          disabled={loading}
          title="Refresh disaster & resource data from backend"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Sync Data</span>
        </button>

        {activeScenario?.last_analyzed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <Clock size={13} />
            <span>Analyzed: {activeScenario.last_analyzed.split(' ')[1] || activeScenario.last_analyzed}</span>
          </div>
        )}

        {user && (
          <div className="user-pill">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0) : 'D'}
            </div>
            <div className="user-info-text">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
