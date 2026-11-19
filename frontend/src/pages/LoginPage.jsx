import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, Lock, Mail, ArrowRight, Shield, User, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      addToast('Authenticated successfully', 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick demo credentials loader
  const handleQuickDemo = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      addToast(`Signed in as ${demoEmail.split('@')[0]}`, 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 20%, rgba(6, 182, 212, 0.08) 0%, rgba(8, 10, 15, 1) 70%)'
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
            marginBottom: '16px'
          }}>
            <Wallet size={26} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Aura <span style={{ color: 'var(--accent-cyan)' }}>Finance</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Enterprise Wealth Ledger & Real-time Cash Flow
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: '32px' }}>
          {error && (
            <div style={{
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#FB7185',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@aurafinance.io"
                  className="input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '8px' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Sign In to Vault</span>}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px', textAlign: 'center' }}>
              One-Click Evaluation Roles
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@aurafinance.io', 'Admin@123456')}
                className="btn btn-secondary"
                style={{ padding: '8px 4px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <Shield size={14} color="#C084FC" />
                <span style={{ fontWeight: 600 }}>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('alex@aurafinance.io', 'User@123456')}
                className="btn btn-secondary"
                style={{ padding: '8px 4px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <User size={14} color="#38BDF8" />
                <span style={{ fontWeight: 600 }}>User (Alex)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('auditor@aurafinance.io', 'ReadOnly@123456')}
                className="btn btn-secondary"
                style={{ padding: '8px 4px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}
              >
                <EyeOff size={14} color="#FBBF24" />
                <span style={{ fontWeight: 600 }}>Read-Only</span>
              </button>
            </div>
          </div>
        </div>

        {/* Link to Register */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}>
            Register new account
          </Link>
        </p>
      </div>
    </div>
  );
}
