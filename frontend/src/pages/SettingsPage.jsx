import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Sun,
  Moon,
  Shield,
  FileCode2,
  Lock,
  LogOut,
  Database,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useToast } from '../components/Toast.jsx';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    addToast('Signed out successfully', 'info');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '900px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            SYSTEM CONFIGURATION
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Node Preferences
          </span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          Preferences & Security Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Manage your account credentials, display interface theme, and review cryptographic security parameters.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Identity & Access Credentials
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Legal Name</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem', marginTop: '4px' }}>
              {user?.name || 'Aura Member'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Email</span>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem', marginTop: '4px' }}>
              {user?.email || 'N/A'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Security Role</span>
            <div style={{ marginTop: '6px' }}>
              <span className={`badge badge-role-${user?.role?.replace('-', '') || 'user'}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance & Interface Theme Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Interface Display Theme
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Select between Aura Dark (optimized for high-contrast multi-screen trading desks) and Paper Light mode.
        </p>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className="btn"
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: theme === 'dark' ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-input)',
              border: theme === 'dark' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
              color: theme === 'dark' ? '#FFFFFF' : 'var(--text-secondary)',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <Moon size={22} color={theme === 'dark' ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Aura Dark Slate (Default)</span>
          </button>

          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className="btn"
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: theme === 'light' ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-input)',
              border: theme === 'light' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
              color: theme === 'light' ? 'var(--text-primary)' : 'var(--text-secondary)',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <Sun size={22} color={theme === 'light' ? '#D97706' : 'var(--text-muted)'} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Paper Light Mode</span>
          </button>
        </div>
      </div>

      {/* Security & API Architecture Specifications */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Infrastructure & Architectural Compliance
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Authentication Architecture</span>
            <strong style={{ color: 'var(--accent-cyan)' }}>Stateless JWT (HMAC-SHA256)</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Password Hashing Standard</span>
            <strong style={{ color: 'var(--text-primary)' }}>Bcrypt (10 Salt Rounds)</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Rate Limiting Thresholds</span>
            <strong style={{ color: 'var(--text-primary)' }}>Auth: 5/15m • Tx: 100/hr • Analytics: 50/hr</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Redis Cache Policy</span>
            <strong style={{ color: 'var(--accent-emerald)' }}>Analytics: 15m TTL • Categories: 1h TTL</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Interactive API Documentation</span>
            <a
              href="http://localhost:5001/api/docs"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
            >
              <span>Swagger OpenAPI Console</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button onClick={handleSignOut} className="btn btn-danger" style={{ padding: '12px 24px' }}>
          <LogOut size={16} />
          <span>Sign Out of Aura Finance</span>
        </button>
      </div>
    </div>
  );
}
