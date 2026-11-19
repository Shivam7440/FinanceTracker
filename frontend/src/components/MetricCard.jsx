import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  accentColor = 'var(--accent-cyan)',
  badge
}) {
  return (
    <div className="metric-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor
          }}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
        <span className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          {value}
        </span>
        {badge && (
          <span style={{ fontSize: '0.75rem', color: isPositive ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 600 }}>
            {badge}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>{subtitle}</span>
        {change && (
          <span style={{
            color: isPositive ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
    </div>
  );
}
