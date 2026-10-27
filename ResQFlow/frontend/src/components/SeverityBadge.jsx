import React from 'react';

export default function SeverityBadge({ level = 'Low', size = 'normal' }) {
  const normalized = (level || '').toLowerCase();

  let badgeClass = 'badge-low';
  let dotColor = '#0284c7';

  if (normalized.includes('crit')) {
    badgeClass = 'badge-critical';
    dotColor = '#dc2626';
  } else if (normalized.includes('high') || normalized.includes('warn')) {
    badgeClass = 'badge-high';
    dotColor = '#ea580c';
  } else if (normalized.includes('mod') || normalized.includes('medium')) {
    badgeClass = 'badge-moderate';
    dotColor = '#d97706';
  } else if (normalized.includes('suff') || normalized.includes('safe') || normalized.includes('ready')) {
    badgeClass = 'badge-sufficient';
    dotColor = '#059669';
  }

  return (
    <span className={`badge ${badgeClass}`} style={size === 'sm' ? { fontSize: '0.68rem', padding: '0.15rem 0.5rem' } : {}}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dotColor, display: 'inline-block' }} />
      {level}
    </span>
  );
}
