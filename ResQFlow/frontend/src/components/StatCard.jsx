import React from 'react';

export default function StatCard({
  label,
  value,
  subtext,
  icon,
  theme = 'blue', // 'blue', 'teal', 'warning', 'critical'
}) {
  return (
    <div className={`stat-card stat-theme-${theme}`}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {icon && <div className="stat-icon-wrapper">{icon}</div>}
      </div>
      <div className="stat-value">{value}</div>
      {subtext && <div className="stat-subtext">{subtext}</div>}
    </div>
  );
}
