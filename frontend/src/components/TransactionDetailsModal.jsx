import React from 'react';
import { X, Calendar, Tag, User, Clock, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function TransactionDetailsModal({ isOpen, onClose, transaction }) {
  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === 'income';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Transaction Ledger Entry
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Hero Amount */}
          <div style={{
            padding: '20px',
            backgroundColor: 'var(--bg-card-elevated)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
              Settlement Amount
            </span>
            <div className="tabular-nums" style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: isIncome ? 'var(--accent-emerald)' : 'var(--text-primary)',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              {isIncome ? <ArrowUpRight size={24} color="var(--accent-emerald)" /> : <ArrowDownRight size={24} color="var(--accent-rose)" />}
              <span>{isIncome ? '+' : '-'}₹{parseFloat(transaction.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ marginTop: '8px' }}>
              <span className={`badge badge-${transaction.type}`}>
                {transaction.type}
              </span>
            </div>
          </div>

          {/* Key-Value Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                <Tag size={12} /> Category
              </span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                {transaction.category_name || 'Uncategorized'}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                <Calendar size={12} /> Date
              </span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                {transaction.transaction_date ? transaction.transaction_date.split('T')[0] : 'N/A'}
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>
                Description / Memo
              </span>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                {transaction.description || 'No description provided'}
              </div>
            </div>

            {transaction.user_name && (
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                  <User size={12} /> Account Owner
                </span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {transaction.user_name}
                </div>
              </div>
            )}

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                <Clock size={12} /> Recorded At
              </span>
              <div style={{ fontWeight: 500, color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.75rem' }}>
                {new Date(transaction.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-input)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            overflowWrap: 'break-word'
          }}>
            Node Record UUID: {transaction.id}
          </div>

          <button onClick={onClose} className="btn btn-secondary" style={{ width: '100%' }}>
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
