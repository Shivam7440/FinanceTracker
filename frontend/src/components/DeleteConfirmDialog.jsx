import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function DeleteConfirmDialog({ isOpen, onClose, onConfirm, transaction, loading }) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#FB7185',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <AlertTriangle size={24} />
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Delete Transaction?
          </h3>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            Are you sure you want to permanently delete this transaction? This action will invalidate analytics caches and cannot be undone.
          </p>

          <div style={{
            backgroundColor: 'var(--bg-card-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
              {transaction.description || 'Untitled Transaction'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>{transaction.category_name}</span>
              <span className="tabular-nums" style={{ fontWeight: 700, color: transaction.type === 'income' ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
                ${parseFloat(transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button type="button" onClick={onClose} disabled={loading} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="button" onClick={onConfirm} disabled={loading} className="btn btn-danger" style={{ flex: 1 }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>Delete Permanently</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
