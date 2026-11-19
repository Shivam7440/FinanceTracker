import React from 'react';
import { Menu, Plus, Sun, Moon, Bell, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

export default function Topbar({ onToggleSidebar, onOpenAddTransaction }) {
  const { user, canWriteTransactions, isReadOnly } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      {/* Left section: mobile hamburger & breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary"
          style={{ padding: '8px', display: 'none' }}
          aria-label="Toggle Navigation"
          id="mobile-nav-toggle"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#06B6D4', boxShadow: '0 0 6px #06B6D4' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Liquid Ledger Node v2.4
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{ padding: '8px 12px', borderRadius: '9999px' }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={16} color="#FBBF24" /> : <Moon size={16} color="#6366F1" />}
          <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{theme}</span>
        </button>

        {/* Add Transaction Button */}
        <button
          onClick={onOpenAddTransaction}
          disabled={!canWriteTransactions}
          className="btn btn-primary"
          title={isReadOnly ? 'Read-only accounts cannot create transactions' : 'Record a new transaction'}
        >
          <Plus size={16} />
          <span>New Transaction</span>
        </button>

        {/* User Profile Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '9999px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.75rem',
            color: '#FFFFFF'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user?.name || 'Aura Member'}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role || 'Guest'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
