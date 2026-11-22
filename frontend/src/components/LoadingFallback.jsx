import React from 'react';

export default function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '18px'
    }}>
      <div className="aura-spinner-container">
        <div className="aura-spinner-glow" />
        <div className="aura-spinner-track" />
      </div>
      <div style={{
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }}>
        Loading...
      </div>
    </div>
  );
}
