import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Users,
  Settings,
  LogOut,
  Shield,
  Lock,
  Wallet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, isReadOnly, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions & Cash Flow', icon: ArrowLeftRight },
    { to: '/analytics', label: 'Budgets & Analytics', icon: PieChart },
    ...(isAdmin ? [{ to: '/admin/users', label: 'Admin User Management', icon: Users }] : []),
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 35
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
          }}>
            <Wallet size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Aura <span style={{ color: 'var(--accent-cyan)' }}>Finance</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Institutional Wealth
            </div>
          </div>
        </div>

        {/* Role Badge Indicator */}
        <div style={{ padding: '0 24px 16px' }}>
          <div style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>Active Identity:</span>
            <span className={`badge badge-role-${user?.role?.replace('-', '') || 'user'}`}>
              {user?.role || 'Guest'}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Security / Vault Status indicator */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span>Vault Status</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={12} color="var(--accent-cyan)" />
            <span>Encrypted Node Tier 1 Sec</span>
          </div>

          <button
            onClick={handleSignOut}
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '16px', fontSize: '0.8rem', padding: '8px' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
