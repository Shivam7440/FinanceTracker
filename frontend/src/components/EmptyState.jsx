import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export default function EmptyState({
  title = 'No transactions recorded',
  description = 'Your ledger is completely clear. Record an income or expense to begin tracking financial flow.',
  actionLabel = 'Record First Transaction',
  onAction,
  canAction = true
}) {
  return (
    <div style={{
      padding: '48px 24px',
      textAlign: 'center',
      border: '1px dashed var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'rgba(255, 255, 255, 0.01)',
      margin: '20px 0'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: 'var(--bg-card-elevated)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        color: 'var(--text-muted)'
      }}>
        <Inbox size={26} />
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
        {description}
      </p>

      {onAction && canAction && (
        <button onClick={onAction} className="btn btn-cyan">
          <Plus size={16} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
