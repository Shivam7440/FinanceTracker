import React, { useState, useEffect, useCallback } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { categoriesApi, transactionsApi } from '../api/client.js';
import { useToast } from './Toast.jsx';

export default function TransactionModal({ isOpen, onClose, transactionToEdit, onSuccess }) {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const { data } = await categoriesApi.getAll();
        if (isMounted && data.success) {
          setCategories(data.data);
          if (!categoryId && data.data.length > 0) {
            setCategoryId(data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
    return () => { isMounted = false; };
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type || 'expense');
      setAmount(String(transactionToEdit.amount || ''));
      setCategoryId(transactionToEdit.category_id || '');
      setDescription(transactionToEdit.description || '');
      setTransactionDate(transactionToEdit.transaction_date ? transactionToEdit.transaction_date.split('T')[0] : new Date().toISOString().split('T')[0]);
    } else {
      setType('expense');
      setAmount('');
      setDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      if (categories.length > 0 && !categoryId) {
        setCategoryId(categories[0].id);
      }
    }
    setError('');
  }, [transactionToEdit, isOpen, categories]);

  // useCallback for reset handler
  const handleReset = useCallback(() => {
    setAmount('');
    setDescription('');
    setError('');
    onClose();
  }, [onClose]);

  // useCallback for form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        type,
        amount: parsedAmount,
        categoryId,
        description: description.trim(),
        transactionDate
      };

      if (transactionToEdit) {
        await transactionsApi.update(transactionToEdit.id, payload);
        addToast('Transaction updated successfully', 'success');
      } else {
        await transactionsApi.create(payload);
        addToast('Transaction recorded successfully', 'success');
      }

      onSuccess();
      handleReset();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
      addToast(err.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [amount, categoryId, description, transactionDate, type, transactionToEdit, onSuccess, handleReset, addToast]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleReset}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {transactionToEdit ? 'Edit Transaction' : 'Record New Transaction'}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-time ledger updates with instant Redis cache invalidation
            </p>
          </div>
          <button
            onClick={handleReset}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#FB7185',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.825rem'
            }}>
              {error}
            </div>
          )}

          {/* Segmented Type Toggle */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Transaction Type
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              backgroundColor: 'var(--bg-input)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <button
                type="button"
                onClick={() => setType('expense')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: type === 'expense' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
                  color: type === 'expense' ? '#FB7185' : 'var(--text-muted)',
                  border: type === 'expense' ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <ArrowDownRight size={16} />
                <span>Expense / Outflow</span>
              </button>

              <button
                type="button"
                onClick={() => setType('income')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: type === 'income' ? '#34D399' : 'var(--text-muted)',
                  border: type === 'income' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <ArrowUpRight size={16} />
                <span>Income / Inflow</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Amount ($ USD) *
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input tabular-nums"
                style={{ paddingLeft: '32px', fontSize: '1.1rem', fontWeight: 700 }}
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="select"
            >
              <option value="">Select a category</option>
              {categories
                .filter((c) => c.type === 'both' || c.type === type)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Transaction Date */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Transaction Date *
            </label>
            <input
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="input"
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Merchant / Description
            </label>
            <input
              type="text"
              maxLength={255}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. AWS Cloud Compute or Executive Salary"
              className="input"
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={type === 'income' ? 'btn btn-cyan' : 'btn btn-primary'}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>{transactionToEdit ? 'Save Changes' : 'Confirm Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
