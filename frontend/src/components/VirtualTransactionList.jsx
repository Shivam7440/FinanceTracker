import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { ArrowDownRight, ArrowUpRight, Eye, Edit2, Trash2 } from 'lucide-react';

export default function VirtualTransactionList({
  transactions,
  height = 500,
  onViewDetails,
  onEdit,
  onDelete,
  canWrite
}) {
  const Row = ({ index, style }) => {
    const tx = transactions[index];
    if (!tx) return null;
    const isIncome = tx.type === 'income';

    return (
      <div
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
          boxSizing: 'border-box'
        }}
      >
        {/* Type Icon */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '16px',
          flexShrink: 0
        }}>
          {isIncome ? <ArrowUpRight size={16} color="#10B981" /> : <ArrowDownRight size={16} color="#F43F5E" />}
        </div>

        {/* Description & Category */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>
          <div style={{
            fontWeight: 600,
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {tx.description || 'Untitled Transaction'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{
              fontSize: '0.7rem',
              color: tx.category_color || 'var(--accent-cyan)',
              fontWeight: 600,
              backgroundColor: 'rgba(255,255,255,0.04)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {tx.category_name}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {tx.transaction_date ? tx.transaction_date.split('T')[0] : ''}
            </span>
          </div>
        </div>

        {/* Amount */}
        <div style={{ textAlign: 'right', paddingRight: '20px', flexShrink: 0 }}>
          <div className="tabular-nums" style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: isIncome ? 'var(--accent-emerald)' : 'var(--text-primary)'
          }}>
            {isIncome ? '+' : '-'}₹{parseFloat(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {tx.type}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={() => onViewDetails(tx)}
            className="btn btn-secondary"
            style={{ padding: '6px', borderRadius: '6px' }}
            title="View Details"
          >
            <Eye size={14} />
          </button>

          {canWrite && (
            <>
              <button
                onClick={() => onEdit(tx)}
                className="btn btn-secondary"
                style={{ padding: '6px', borderRadius: '6px' }}
                title="Edit Transaction"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDelete(tx)}
                className="btn btn-danger"
                style={{ padding: '6px', borderRadius: '6px' }}
                title="Delete Transaction"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-card)'
    }}>
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card-elevated)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--text-secondary)'
      }}>
        <span>VIRTUALIZED LEDGER STREAM ({transactions.length} active rows)</span>
        <span style={{ color: 'var(--accent-cyan)' }}>DOM Recycling Enabled</span>
      </div>
      <List
        height={height}
        itemCount={transactions.length}
        itemSize={68}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}
