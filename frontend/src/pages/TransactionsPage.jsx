import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeftRight,
  Search,
  Filter,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Download,
  ListFilter,
  RotateCcw
} from 'lucide-react';
import { transactionsApi, categoriesApi } from '../api/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import VirtualTransactionList from '../components/VirtualTransactionList.jsx';
import TransactionModal from '../components/TransactionModal.jsx';
import TransactionDetailsModal from '../components/TransactionDetailsModal.jsx';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingFallback from '../components/LoadingFallback.jsx';

export default function TransactionsPage({ onOpenAddTransaction }) {
  const { isReadOnly, canWriteTransactions } = useAuth();
  const { addToast } = useToast();

  // State
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState('transaction_date');
  const [order, setOrder] = useState('desc');

  // View Mode: 'table' | 'virtual'
  const [viewMode, setViewMode] = useState('table');

  // Modals state
  const [txToEdit, setTxToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [txToDelete, setTxToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load categories
  useEffect(() => {
    async function fetchCats() {
      try {
        const { data } = await categoriesApi.getAll();
        if (data.success) setCategories(data.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    fetchCats();
  }, []);

  // Fetch transactions wrapped in useCallback
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        type,
        categoryId,
        from,
        to,
        sort,
        order
      };

      const { data } = await transactionsApi.getAll(params);
      if (data.success) {
        setTransactions(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch transactions', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, type, categoryId, from, to, sort, order, addToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handlers wrapped in useCallback
  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleLimitChange = useCallback((e) => {
    const newLimit = parseInt(e.target.value, 10);
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setType('');
    setCategoryId('');
    setFrom('');
    setTo('');
    setSort('transaction_date');
    setOrder('desc');
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleEditClick = useCallback((tx) => {
    setTxToEdit(tx);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!txToDelete) return;
    setDeleteLoading(true);
    try {
      await transactionsApi.delete(txToDelete.id);
      addToast('Transaction deleted successfully', 'success');
      setTxToDelete(null);
      fetchTransactions();
    } catch (err) {
      addToast(err.message || 'Failed to delete transaction', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }, [txToDelete, fetchTransactions, addToast]);

  // Derived metrics from current filtered transactions using useMemo
  const pageMetrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((tx) => {
      const amt = parseFloat(tx.amount || 0);
      if (tx.type === 'income') income += amt;
      else expense += amt;
    });
    return {
      income,
      expense,
      net: income - expense
    };
  }, [transactions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Read-Only Notice */}
      {isReadOnly && (
        <div className="read-only-banner">
          <ShieldCheck size={20} color="#FBBF24" />
          <div>
            <strong>Auditor Mode Active:</strong> You have read-only privileges. All transaction records and details are fully visible, but mutation operations (create, edit, delete) are prohibited.
          </div>
        </div>
      )}

      {/* Header & Metric Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              LIQUID LEDGER NODE V2.4
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Real-time Multi-account Audit
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Transactions & Cash Flow
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real-time synchronized ledger across custodial accounts, institutional payroll, and settlement vaults.
          </p>
        </div>

        {/* View mode toggle & Add Transaction button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Toggle View: Table vs Virtual Scroll */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-input)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: viewMode === 'table' ? 'var(--bg-card-elevated)' : 'transparent',
                color: viewMode === 'table' ? 'var(--accent-cyan)' : 'var(--text-muted)'
              }}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('virtual')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: viewMode === 'virtual' ? 'var(--bg-card-elevated)' : 'transparent',
                color: viewMode === 'virtual' ? 'var(--accent-cyan)' : 'var(--text-muted)'
              }}
            >
              Virtualized Stream
            </button>
          </div>

          <button
            onClick={onOpenAddTransaction}
            disabled={!canWriteTransactions}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
          {/* Search Box */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Search Description / Category
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search merchant, notes, entity..."
                className="input"
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Type
            </label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
              className="select"
            >
              <option value="">All Flow Types</option>
              <option value="income">Income / Inflow</option>
              <option value="expense">Expense / Outflow</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
              className="select"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              From Date
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
              className="input"
            />
          </div>

          {/* Date To */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              To Date
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setPagination((prev) => ({ ...prev, page: 1 })); }}
              className="input"
            />
          </div>

          {/* Clear Filters Button */}
          <div>
            <button
              onClick={handleClearFilters}
              className="btn btn-secondary"
              style={{ width: '100%', height: '42px', fontSize: '0.8rem' }}
              title="Reset all filter parameters"
            >
              <RotateCcw size={14} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Ledger Content */}
      {loading ? (
        <LoadingFallback />
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions match your criteria"
          description="Adjust your search filters or record a new transaction to view ledger entries."
          actionLabel="Record New Transaction"
          onAction={onOpenAddTransaction}
          canAction={canWriteTransactions}
        />
      ) : viewMode === 'virtual' ? (
        /* Virtualized List Rendering (Assignment Requirement) */
        <VirtualTransactionList
          transactions={transactions}
          height={520}
          onViewDetails={setSelectedTx}
          onEdit={handleEditClick}
          onDelete={setTxToDelete}
          canWrite={canWriteTransactions}
        />
      ) : (
        /* Standard Paginated Table View */
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '48px' }}>Type</th>
                <th>Merchant / Entity</th>
                <th>Category</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right', width: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <tr key={tx.id}>
                    <td>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isIncome ? <ArrowUpRight size={16} color="#10B981" /> : <ArrowDownRight size={16} color="#F43F5E" />}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {tx.description || 'Transaction'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Node ID: {tx.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: tx.category_color || 'var(--accent-cyan)',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        padding: '4px 10px',
                        borderRadius: '6px'
                      }}>
                        {tx.category_name}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {tx.transaction_date ? tx.transaction_date.split('T')[0] : 'N/A'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="tabular-nums" style={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: isIncome ? 'var(--accent-emerald)' : 'var(--text-primary)'
                      }}>
                        {isIncome ? '+' : '-'}₹{parseFloat(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="btn btn-secondary"
                          style={{ padding: '6px', borderRadius: '6px' }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>

                        {canWriteTransactions && (
                          <>
                            <button
                              onClick={() => handleEditClick(tx)}
                              className="btn btn-secondary"
                              style={{ padding: '6px', borderRadius: '6px' }}
                              title="Edit Transaction"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setTxToDelete(tx)}
                              className="btn btn-danger"
                              style={{ padding: '6px', borderRadius: '6px' }}
                              title="Delete Transaction"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Server-Side Pagination Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 0',
        fontSize: '0.825rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{(pagination.page - 1) * pagination.limit + 1}</strong> to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{pagination.total}</strong> ledger entries
          </span>

          <select
            value={pagination.limit}
            onChange={handleLimitChange}
            className="select"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.75rem' }}
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>

        {/* Page navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          <span style={{ padding: '0 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <TransactionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        transactionToEdit={txToEdit}
        onSuccess={fetchTransactions}
      />

      {/* Details Modal */}
      <TransactionDetailsModal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={handleDeleteConfirm}
        transaction={txToDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
