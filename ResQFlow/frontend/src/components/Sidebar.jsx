import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CloudRain,
  Activity,
  Boxes,
  Calculator,
  Compass,
  LogOut,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate }) {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'scenario', label: 'Disaster Scenario', icon: <CloudRain size={18} /> },
    { id: 'impact', label: 'Impact Analysis', icon: <Activity size={18} /> },
    { id: 'resources', label: 'Resources', icon: <Boxes size={18} /> },
    { id: 'requirements', label: 'Resource Analysis', icon: <Calculator size={18} /> },
    { id: 'priority', label: 'Priority & Allocation', icon: <Compass size={18} /> },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <ShieldCheck size={24} />
        </div>
        <div className="sidebar-brand">
          <span className="brand-title">ResQFlow</span>
          <span className="brand-subtitle">Gov Disaster Portal</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / System Status & Logout */}
      <div className="sidebar-footer">
        <div className="sidebar-emergency-status">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
            <AlertOctagon size={13} style={{ color: '#38bdf8' }} />
            <span>SDMA EOC ACTIVE</span>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            Protocol Level: Phase 3 Response
          </div>
        </div>

        <button
          className="nav-item"
          onClick={logout}
          style={{ color: '#f87171', marginTop: '4px' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
