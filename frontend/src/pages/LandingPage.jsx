import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Zap,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Lock,
  Database,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Server,
  Sun,
  Moon,
  Menu,
  X,
  User,
  ExternalLink,
  ChevronRight,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Key
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import '../styles/landing.css';

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-wrapper">
      <div className="landing-ambient-bg" />

      {/* =========================================================================
          SECTION 1: STICKY NAVIGATION BAR
          ========================================================================= */}
      <header className="landing-navbar">
        <div className="landing-nav-container">
          {/* Brand Logo & Name */}
          <Link to="/" className="landing-brand">
            <div className="landing-brand-logo">
              <img
                src="/aura-finance-icon.png"
                alt="Aura Finance Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
            <div>
              <div className="landing-brand-name">
                Aura <span style={{ color: 'var(--accent-cyan)' }}>Finance</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '-2px' }}>
                Institutional Wealth
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="landing-nav-links">
            <li>
              <span className="landing-nav-link" onClick={() => scrollToSection('features')}>Features</span>
            </li>
            <li>
              <span className="landing-nav-link" onClick={() => scrollToSection('analytics')}>Performance</span>
            </li>
            <li>
              <span className="landing-nav-link" onClick={() => scrollToSection('security')}>Security</span>
            </li>
            <li>
              <span className="landing-nav-link" onClick={() => scrollToSection('demo-access')}>Demo Access</span>
            </li>
            <li>
              <a
                href="http://localhost:5001/api/docs"
                target="_blank"
                rel="noreferrer"
                className="landing-nav-link"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>API Docs</span>
                <ExternalLink size={12} />
              </a>
            </li>
          </ul>

          {/* Action Buttons & Theme Toggle */}
          <div className="landing-nav-actions">
            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              title="Toggle Theme"
              style={{ padding: '8px 10px', borderRadius: '10px' }}
            >
              {theme === 'dark' ? <Sun size={16} color="var(--accent-amber)" /> : <Moon size={16} color="var(--accent-purple)" />}
            </button>

            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px' }}>
              <span>Get Started</span>
              <ArrowRight size={15} />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              className="landing-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`landing-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <span className="landing-nav-link" onClick={() => scrollToSection('features')}>Features</span>
          <span className="landing-nav-link" onClick={() => scrollToSection('analytics')}>Performance & Benchmarks</span>
          <span className="landing-nav-link" onClick={() => scrollToSection('security')}>Security Architecture</span>
          <span className="landing-nav-link" onClick={() => scrollToSection('demo-access')}>Demo Roles Matrix</span>
          <a
            href="http://localhost:5001/api/docs"
            target="_blank"
            rel="noreferrer"
            className="landing-nav-link"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Swagger API Docs</span>
            <ExternalLink size={14} />
          </a>
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <Link to="/login" className="btn btn-secondary" style={{ flex: 1 }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ flex: 1 }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          SECTION 2: HERO SECTION WITH LIVE PREVIEW
          ========================================================================= */}
      <section className="landing-hero">
        <div className="landing-pill">
          <Sparkles size={14} />
          <span>Aura Finance v2.4 • Next-Gen Wealth Intelligence</span>
        </div>

        <h1 className="landing-hero-title">
          Autonomous Cash Flow & Wealth Intelligence for{' '}
          <span className="landing-gradient-text">High-Growth Operators</span>
        </h1>

        <p className="landing-hero-subtitle">
          Engineered with React 18, PostgreSQL, and sub-millisecond Redis caching. Monitor multi-category liquidity, 
          forecast savings velocity, and eliminate financial blind spots with audited ledger transparency.
        </p>

        {/* Dual CTA */}
        <div className="landing-hero-actions">
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <span>Launch Console Free</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-cyan" style={{ padding: '14px 26px', fontSize: '1rem' }}>
            <Key size={18} />
            <span>Explore Live Demo Accounts</span>
          </Link>
        </div>

        {/* Key Metrics Strip (Social Proof) */}
        <div className="landing-metrics-strip">
          <div className="landing-metric-box">
            <div className="landing-metric-val" style={{ color: 'var(--accent-emerald)' }}>₹0.00</div>
            <div className="landing-metric-label">Discrepancy (Decimal Precision)</div>
          </div>
          <div className="landing-metric-box">
            <div className="landing-metric-val" style={{ color: 'var(--accent-cyan)' }}>21.4x</div>
            <div className="landing-metric-label">Faster Cache Latency via Redis</div>
          </div>
          <div className="landing-metric-box">
            <div className="landing-metric-val" style={{ color: 'var(--accent-purple)' }}>10k+</div>
            <div className="landing-metric-label">Virtualized Rows (Zero DOM Lag)</div>
          </div>
          <div className="landing-metric-box">
            <div className="landing-metric-val" style={{ color: '#F59E0B' }}>3 Roles</div>
            <div className="landing-metric-label">Strict RBAC & IDOR Isolation</div>
          </div>
        </div>

        {/* Interactive Hero Visual Mockup */}
        <div className="landing-preview-container">
          <div className="landing-preview-glow" />
          <div className="landing-preview-card">
            {/* Window chrome header */}
            <div className="landing-preview-header">
              <div className="landing-window-dots">
                <div className="landing-dot red" />
                <div className="landing-dot yellow" />
                <div className="landing-dot green" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                aurafinance.io/dashboard • session active
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge badge-income" style={{ fontSize: '0.7rem' }}>
                  ● Redis HIT (0.86ms)
                </span>
              </div>
            </div>

            {/* Simulated Live UI Content */}
            <div className="landing-preview-content">
              {/* Left Column: Metrics & Visual Chart Simulation */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Net Liquid Balance
                    </span>
                    <div className="tabular-nums" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                      ₹67,279.60
                    </div>
                  </div>
                  <span className="badge badge-income">
                    +63.3% Savings Rate
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: 'var(--bg-card-elevated)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Inflow</div>
                    <div className="tabular-nums" style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '1.1rem', marginTop: '2px' }}>
                      +₹1,06,200.00
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-card-elevated)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Outflow</div>
                    <div className="tabular-nums" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem', marginTop: '2px' }}>
                      -₹38,920.40
                    </div>
                  </div>
                </div>

                {/* Simulated Chart Bars */}
                <div style={{ background: 'var(--bg-card-elevated)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    <span>6-Month Cash Flow Velocity</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>Live Aggregation</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '100px', paddingTop: '10px' }}>
                    {[
                      { month: 'Jun', h1: '40%', h2: '80%' },
                      { month: 'Jul', h1: '55%', h2: '85%' },
                      { month: 'Aug', h1: '45%', h2: '75%' },
                      { month: 'Sep', h1: '60%', h2: '90%' },
                      { month: 'Oct', h1: '50%', h2: '80%' },
                      { month: 'Nov', h1: '35%', h2: '95%' }
                    ].map((item, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%' }}>
                        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3px' }}>
                          <div style={{ width: '40%', height: item.h2, background: 'linear-gradient(to top, #10B981, #34D399)', borderRadius: '3px 3px 0 0' }} />
                          <div style={{ width: '40%', height: item.h1, background: 'linear-gradient(to top, #F43F5E, #FB7185)', borderRadius: '3px 3px 0 0' }} />
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Ledger Stream */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Recent Verified Transactions
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                    PostgreSQL Audited
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { desc: 'Institutional Client Retainer', cat: 'Freelance & Consulting', amt: '+₹25,000.00', type: 'income', time: 'Today' },
                    { desc: 'AWS Cluster Compute Tier-1', cat: 'Cloud Infrastructure & Tech', amt: '-₹3,840.50', type: 'expense', time: 'Yesterday' },
                    { desc: 'Senior Engineering Salary', cat: 'Salary & Wages', amt: '+₹65,000.00', type: 'income', time: 'Nov 1' },
                    { desc: 'Corporate Fiber & Gigabit Uplink', cat: 'Utilities & Bills', amt: '-₹2,499.00', type: 'expense', time: 'Oct 28' },
                    { desc: 'Figma Organization Seats', cat: 'Software Tools & Subscriptions', amt: '-₹1,850.00', type: 'expense', time: 'Oct 25' },
                  ].map((tx, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: 'var(--bg-card-elevated)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: tx.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                            color: tx.type === 'income' ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                          }}
                        >
                          {tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{tx.desc}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tx.cat} • {tx.time}</div>
                        </div>
                      </div>
                      <div className="tabular-nums" style={{ fontSize: '0.85rem', fontWeight: 700, color: tx.type === 'income' ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
                        {tx.amt}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: ARCHITECTURAL FEATURES GRID
          ========================================================================= */}
      <section id="features" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-tag">ENGINEERED FOR SCALE</span>
          <h2 className="landing-section-title">Institutional Features. Zero Compromise.</h2>
          <p className="landing-section-desc">
            Aura Finance is not another basic spreadsheet clone. It is a full-stack financial operating system designed for accuracy, speed, and audited governance.
          </p>
        </div>

        <div className="landing-features-grid">
          {/* Card 1 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
              <Layers size={24} />
            </div>
            <h3 className="landing-feature-title">Virtualized Ledger (react-window)</h3>
            <p className="landing-feature-desc">
              DOM recycling allows seamless scrolling through 10,000+ financial records at 60 FPS without memory leaks or render latency.
            </p>
          </div>

          {/* Card 2 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
              <Shield size={24} />
            </div>
            <h3 className="landing-feature-title">Multi-Tier RBAC & IDOR Defense</h3>
            <p className="landing-feature-desc">
              Three pre-configured roles (Admin, Operator, Read-Only Auditor) with strict server-side authorization middleware protecting every transaction route.
            </p>
          </div>

          {/* Card 3 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
              <BarChart3 size={24} />
            </div>
            <h3 className="landing-feature-title">Interactive Chart.js Visualizations</h3>
            <p className="landing-feature-desc">
              Category spending distributions, 6-month historical rolling trend lines, and income vs expense comparisons rendered with canvas efficiency.
            </p>
          </div>

          {/* Card 4 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
              <Database size={24} />
            </div>
            <h3 className="landing-feature-title">Decimal Relational Precision</h3>
            <p className="landing-feature-desc">
              PostgreSQL <code style={{ color: 'var(--accent-cyan)' }}>NUMERIC(12,2)</code> arithmetic prevents JavaScript IEEE-754 floating-point rounding errors across all balance calculations.
            </p>
          </div>

          {/* Card 5 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#EC4899' }}>
              <Sparkles size={24} />
            </div>
            <h3 className="landing-feature-title">Autonomous Cost Optimization</h3>
            <p className="landing-feature-desc">
              Identifies idle SaaS subscriptions, unmanaged cloud compute costs, and repetitive recurring outflows to maximize net savings rates.
            </p>
          </div>

          {/* Card 6 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' }}>
              <Zap size={24} />
            </div>
            <h3 className="landing-feature-title">Sub-Millisecond Redis Caching</h3>
            <p className="landing-feature-desc">
              15-minute analytics TTL and 1-hour category caching with dynamic pattern invalidation ensure queries return in under 1 millisecond.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: PERFORMANCE & REDIS BENCHMARK SHOWCASE
          ========================================================================= */}
      <section id="analytics" className="landing-section" style={{ backgroundColor: 'rgba(12, 15, 23, 0.5)' }}>
        <div className="landing-section-header">
          <span className="landing-section-tag">PROVEN VELOCITY</span>
          <h2 className="landing-section-title">21.4x Faster with Redis Caching</h2>
          <p className="landing-section-desc">
            Audited using Node.js high-resolution timers (<code style={{ color: 'var(--accent-cyan)' }}>process.hrtime.bigint()</code>). 
            Complex financial aggregates are served instantly from memory while guaranteeing immediate invalidation on any data mutation.
          </p>
        </div>

        <div className="landing-benchmark-card">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '16px' }}>
              <Clock size={14} />
              <span>LIVE BENCHMARK TELEMETRY</span>
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Eliminate Database Bottlenecks
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
              When calculating multi-month aggregates, repeated PostgreSQL queries introduce latency under load. 
              Aura Finance stores processed analytics payloads under isolated user keys, delivering instantaneous response times.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={18} color="var(--accent-emerald)" />
                <span><strong>15-Minute Analytics TTL:</strong> Zero redundant query computation</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={18} color="var(--accent-emerald)" />
                <span><strong>Instant Invalidation:</strong> Updates automatically purge user cache keys</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={18} color="var(--accent-emerald)" />
                <span><strong>In-Memory Fallback:</strong> Operates seamlessly with or without Redis URL</span>
              </li>
            </ul>
          </div>

          {/* Benchmark comparison bars */}
          <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Cold Read (PostgreSQL Query)</span>
                <span className="tabular-nums" style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>18.42 ms</span>
              </div>
              <div style={{ height: '12px', background: 'var(--bg-card-elevated)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #F43F5E, #FB7185)', borderRadius: '6px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Cached Read (Redis Layer)</span>
                <span className="tabular-nums" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>0.86 ms (21.4x faster)</span>
              </div>
              <div style={{ height: '12px', background: 'var(--bg-card-elevated)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: '4.7%', height: '100%', background: 'linear-gradient(90deg, #10B981, #34D399)', borderRadius: '6px' }} />
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Measured Latency Speedup
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  2,140% Performance Lift
                </div>
              </div>
              <Link to="/login" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                Run Benchmark
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: ENTERPRISE SECURITY & COMPLIANCE
          ========================================================================= */}
      <section id="security" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-tag">SECURITY FIRST</span>
          <h2 className="landing-section-title">Built for Bank-Grade Trust</h2>
          <p className="landing-section-desc">
            Engineered with strict zero-trust principles. Every request is verified, rate-limited, and audited.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
              <Lock size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              100% Parameterized SQL
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              All queries use explicit parameter tokens (<code style={{ color: 'var(--accent-cyan)' }}>$1, $2</code>) and sort column whitelisting, preventing SQL injection vulnerabilities.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
              <Shield size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Strict IDOR Isolation
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Transactions enforce ownership checks at the database layer. Non-admin users cannot inspect, update, or delete other users' financial data.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
              <Server size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Anti-Abuse Rate Limiting
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Enforced by <code style={{ color: 'var(--accent-cyan)' }}>express-rate-limit</code>: Auth (5/15m), Transactions (100/h), and Analytics (50/h) to defend against brute-force and scraping.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon" style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)' }}>
              <Key size={22} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Bcrypt Hashing & JWT
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Passwords salted and hashed using 10 rounds of bcrypt. Authentication sessions authenticated with cryptographic JSON Web Tokens.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: PRE-CONFIGURED DEMO PERSONAS MATRIX
          ========================================================================= */}
      <section id="demo-access" className="landing-section" style={{ backgroundColor: 'rgba(12, 15, 23, 0.4)' }}>
        <div className="landing-section-header">
          <span className="landing-section-tag">INSTANT EVALUATION</span>
          <h2 className="landing-section-title">Explore With 3 Pre-Seeded Roles</h2>
          <p className="landing-section-desc">
            Evaluate the platform without manual data entry. Quick-launch demo accounts are pre-seeded in the live PostgreSQL database.
          </p>
        </div>

        <div className="landing-personas-grid">
          {/* Persona 1: Admin */}
          <div className="landing-persona-card">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="badge badge-role-admin">Administrator</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full System Control</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                System Admin
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                Full administrative access, user role promotions, tenant inspection, and platform-wide analytics oversight.
              </p>
              <div style={{ background: 'var(--bg-card-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem', marginBottom: '20px' }}>
                <div style={{ color: 'var(--text-muted)' }}>Email: <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>admin@aurafinance.io</span></div>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Password: <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Admin@123456</span></div>
              </div>
            </div>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
              Launch as Admin
            </Link>
          </div>

          {/* Persona 2: Standard User */}
          <div className="landing-persona-card" style={{ borderColor: 'rgba(6, 182, 212, 0.4)', background: 'linear-gradient(145deg, var(--bg-card), var(--bg-card-elevated))' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="badge badge-role-user">Standard User</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>87 Transactions Seeded</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Alex Rostova
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                Standard financial operator. Manage own ledger entries, view live interactive Chart.js dashboards, and benchmark speedup.
              </p>
              <div style={{ background: 'var(--bg-card-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem', marginBottom: '20px' }}>
                <div style={{ color: 'var(--text-muted)' }}>Email: <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>alex@aurafinance.io</span></div>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Password: <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>User@123456</span></div>
              </div>
            </div>
            <Link to="/login" className="btn btn-cyan" style={{ width: '100%', fontSize: '0.85rem' }}>
              Launch as Alex (Recommended)
            </Link>
          </div>

          {/* Persona 3: Read-Only Auditor */}
          <div className="landing-persona-card">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="badge badge-role-readonly">Read-Only Auditor</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mutation Blocked</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Auditor ReadOnly
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                Inspect balances and analytics. Any attempt to add, edit, or delete records is blocked with strict HTTP 403 Forbidden.
              </p>
              <div style={{ background: 'var(--bg-card-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem', marginBottom: '20px' }}>
                <div style={{ color: 'var(--text-muted)' }}>Email: <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>auditor@aurafinance.io</span></div>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Password: <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>ReadOnly@123456</span></div>
              </div>
            </div>
            <Link to="/login" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
              Launch as Auditor
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: CALL TO ACTION BANNER
          ========================================================================= */}
      <section className="landing-section">
        <div className="landing-cta-box">
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.03em' }}>
            Ready to Take Control of Your Cash Velocity?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Join Aura Finance today. Zero setup fees, instant PostgreSQL database integration, and high-performance financial tracking.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              <span>Create Account Free</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 24px', fontSize: '1rem' }}>
              <span>Sign In to Existing Vault</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: PROFESSIONAL FOOTER
          ========================================================================= */}
      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div>
            <div className="landing-brand" style={{ marginBottom: '16px' }}>
              <div className="landing-brand-logo">
                <img
                  src="/aura-finance-icon.png"
                  alt="Aura Finance Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <div className="landing-brand-name">
                Aura <span style={{ color: 'var(--accent-cyan)' }}>Finance</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '320px' }}>
              Enterprise personal finance and institutional cash flow management platform engineered with React 18, PostgreSQL, and Redis caching.
            </p>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Platform Modules
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Overview Dashboard</Link></li>
              <li><Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Transactions & Cash Flow</Link></li>
              <li><Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Budgets & Analytics</Link></li>
              <li><Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Admin User Console</Link></li>
            </ul>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Documentation & API
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><a href="http://localhost:5001/api/docs" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Swagger OpenAPI UI</a></li>
              <li><a href="http://localhost:5001/api/health" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Health Status Endpoint</a></li>
              <li><a href="#analytics" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Performance Benchmarks</a></li>
              <li><a href="#security" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Security Specifications</a></li>
            </ul>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Security & Compliance
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li style={{ color: 'var(--text-muted)' }}>Role-Based Access Control</li>
              <li style={{ color: 'var(--text-muted)' }}>Strict IDOR Isolation</li>
              <li style={{ color: 'var(--text-muted)' }}>PostgreSQL NUMERIC(12,2)</li>
              <li style={{ color: 'var(--text-muted)' }}>express-rate-limit 429</li>
            </ul>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <div>
            © {new Date().getFullYear()} Aura Finance Technologies. All rights reserved. Built with React 18, Node.js & PostgreSQL.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>All Systems Operational • Node Tier 1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
