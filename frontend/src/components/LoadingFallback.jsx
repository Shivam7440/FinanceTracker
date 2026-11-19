import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '16px'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
      }}>
        <Loader2 size={24} color="#FFFFFF" className="animate-spin" />
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
        LOADING LEDGER NODE...
      </div>
    </div>
  );
}
