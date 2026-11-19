import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  ShieldCheck,
  Zap,
  CreditCard,
  Sparkles,
  ArrowRight,
  Eye,
  Plus
} from 'lucide-react';
import { analyticsApi, transactionsApi } from '../api/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import MetricCard from '../components/MetricCard.jsx';
import MonthlyTrendLineChart from '../components/charts/MonthlyTrendLineChart.jsx';
import SpendingDoughnutChart from '../components/charts/SpendingDoughnutChart.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TransactionDetailsModal from '../components/TransactionDetailsModal.jsx';
import LoadingFallback from '../components/LoadingFallback.jsx';

export default function DashboardPage({ onOpenAddTransaction }) {
  const { user, isReadOnly, canWriteTransactions } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, trendsRes, catRes, txRes] = await Promise.all([
        analyticsApi.getSummary({ period: 'month' }),
        analyticsApi.getTrends(6),
        analyticsApi.getCategories({ type: 'expense' }),
        transactionsApi.getAll({ limit: 6, sort: 'transaction_date', order: 'desc' })
      ]);

      if (summaryRes.data.success) setSummary(summaryRes.data.data);
      if (trendsRes.data.success) setTrends(trendsRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data.categories || []);
      if (txRes.data.success) setRecentTransactions(txRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Unable to retrieve dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived calculations with useMemo
  const kpis = useMemo(() => {
    if (!summary) return null;
    const totals = summary.totals || {};
    const current = summary.currentPeriod || {};

    const netVal = parseFloat(totals.netBalance || 0);
    const isNetPositive = netVal >= 0;

    return {
      netBalance: `$${Math.abs(netVal).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      isNetPositive,
      inflow: `$${parseFloat(totals.totalIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      outflow: `$${parseFloat(totals.totalExpenses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      monthlyInflow: `$${parseFloat(current.monthlyIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      monthlySpend: `$${parseFloat(current.monthlyExpense || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      savingsRate: totals.savingsRate || 0,
      txCount: totals.transactionCount || 0
    };
  }, [summary]);

  if (loading) return <LoadingFallback />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Read-Only Banner if applicable */}
      {isReadOnly && (
        <div className="read-only-banner">
          <ShieldCheck size={20} color="#FBBF24" />
          <div>
            <strong>Auditor Tier Active:</strong> You are browsing in read-only audit mode. You can inspect all ledger records, analytics charts, and financial statements, but create/edit operations are restricted.
          </div>
        </div>
      )}

      {/* Welcome & System Status Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              PERSONAL WEALTH VAULT
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              Real-time Ledger Synchronized
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Welcome back, {user?.name || 'Investor'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Your cash flow and capital reserves are performing within optimal target velocity.
          </p>
        </div>

        {/* Health Score Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 18px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Financial Health Index
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              94 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 100</span>
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34D399',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <Sparkles size={13} />
            <span>Optimal Flow</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      {kpis && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <MetricCard
            title="Net Balance Movement"
            value={`${kpis.isNetPositive ? '+' : '-'}${kpis.netBalance}`}
            subtitle={`Inflow ${kpis.inflow} • Outflow ${kpis.outflow}`}
            badge={kpis.isNetPositive ? 'Surplus' : 'Deficit'}
            isPositive={kpis.isNetPositive}
            icon={TrendingUp}
            accentColor="var(--accent-emerald)"
          />

          <MetricCard
            title="Monthly Cash Inflow"
            value={kpis.monthlyInflow}
            subtitle="Verified deposits & yield"
            change="12.4% vs last mo"
            isPositive={true}
            icon={ArrowUpRight}
            accentColor="var(--accent-cyan)"
          />

          <MetricCard
            title="Monthly Cash Spend"
            value={kpis.monthlySpend}
            subtitle="Operational outlays & bills"
            change="3.2% velocity pacing"
            isPositive={false}
            icon={ArrowDownRight}
            accentColor="var(--accent-rose)"
          />

          <MetricCard
            title="Liquid Reserves Retention"
            value={`${kpis.savingsRate}%`}
            subtitle={`${kpis.txCount} recorded transactions`}
            badge="Target > 40%"
            isPositive={kpis.savingsRate >= 40}
            icon={Wallet}
            accentColor="var(--accent-purple)"
          />
        </div>
      )}

      {/* Main Historical Trend Chart Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Zap size={14} color="var(--accent-cyan)" />
              <span>Predictive Engine</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              Cashflow Velocity & Monthly Trend
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Timespan:</span>
            <span className="badge badge-role-user">Past 6 Months</span>
          </div>
        </div>

        <MonthlyTrendLineChart trendsData={trends} />
      </div>

      {/* Secondary Row: Capital Allocation Breakdown (Doughnut) + Recent Transactions Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Left Card: Spending Doughnut */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Monthly Outflow Composition
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                Capital Allocation Breakdown
              </h3>
            </div>
            <Link to="/analytics" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
              Full Analytics →
            </Link>
          </div>

          <SpendingDoughnutChart categoryData={categories} />
        </div>

        {/* Right Card: Recent Transactions Table */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Audit Log
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                Recent Transactions
              </h3>
            </div>
            <Link to="/transactions" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
              View All ({recentTransactions.length}) →
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <EmptyState
              title="No recent activity"
              description="Record your first transaction to populate your live synchronized ledger."
              onAction={onOpenAddTransaction}
              canAction={canWriteTransactions}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-card-elevated)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: isIncome ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {isIncome ? <ArrowUpRight size={16} color="#10B981" /> : <ArrowDownRight size={16} color="#F43F5E" />}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {tx.description || 'Transaction'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          <span>{tx.category_name}</span>
                          <span>•</span>
                          <span>{tx.transaction_date ? tx.transaction_date.split('T')[0] : ''}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '12px' }}>
                      <span className="tabular-nums" style={{
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: isIncome ? 'var(--accent-emerald)' : 'var(--text-primary)'
                      }}>
                        {isIncome ? '+' : '-'}${parseFloat(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Autonomous Optimization Alert Banner (matches Screenshot 1 & 3) */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.12), rgba(6, 182, 212, 0.08))',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#C084FC'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#C084FC', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Autonomous Optimization Alert
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: '2px' }}>
              Unused Figma Seat & Redundant Cloud Compute Detected
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              3 consecutive billing cycles with 0 design editor activity. Potential recurring savings of <strong style={{ color: 'var(--accent-emerald)' }}>$45.00/mo</strong> instantly.
            </div>
          </div>
        </div>

        <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
          <span>Run Portfolio Optimization</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
      />
    </div>
  );
}
