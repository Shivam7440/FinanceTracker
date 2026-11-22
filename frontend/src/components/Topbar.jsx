import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Plus,
  Sun,
  Moon,
  ChevronDown,
  User,
  Edit3,
  Shield,
  KeyRound,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import ProfileModal from './ProfileModal.jsx';

export default function Topbar({ onToggleSidebar, onOpenAddTransaction }) {
  const { user, canWriteTransactions, isReadOnly, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('profile');

  const dropdownContainerRef = useRef(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleOpenModal = (tab) => {
    setModalTab(tab);
    setIsProfileModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
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

          {/* User Profile Button & Dropdown Container */}
          <div ref={dropdownContainerRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`topbar-profile-btn ${isDropdownOpen ? 'active' : ''}`}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              aria-label="User Account Management"
            >
              <div className="topbar-profile-avatar">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user?.name || 'User'} />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {user?.name || 'Aura Member'}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user?.role || 'Guest'}
                </span>
              </div>
              <ChevronDown
                size={14}
                style={{
                  color: 'var(--text-muted)',
                  marginLeft: '2px',
                  transition: 'transform 0.2s ease',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'none'
                }}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="profile-dropdown-menu" role="menu">
                {/* Header Overview */}
                <div className="profile-dropdown-header">
                  <div className="topbar-profile-avatar" style={{ width: '38px', height: '38px', fontSize: '0.95rem' }}>
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user?.name || 'User'} />
                    ) : (
                      user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.name || 'Aura Member'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                      {user?.email || 'user@aurafinance.io'}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`badge badge-role-${user?.role?.replace('-', '') || 'user'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {user?.role || 'user'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dropdown Navigation Actions */}
                <button
                  type="button"
                  onClick={() => handleOpenModal('account')}
                  className="profile-dropdown-item"
                  role="menuitem"
                >
                  <User size={15} color="var(--accent-cyan)" />
                  <span>View Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenModal('profile')}
                  className="profile-dropdown-item"
                  role="menuitem"
                >
                  <Edit3 size={15} color="var(--accent-cyan)" />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenModal('account')}
                  className="profile-dropdown-item"
                  role="menuitem"
                >
                  <Shield size={15} color="var(--accent-cyan)" />
                  <span>Account Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenModal('security')}
                  className="profile-dropdown-item"
                  role="menuitem"
                >
                  <KeyRound size={15} color="var(--accent-cyan)" />
                  <span>Change Password</span>
                </button>

                <div className="profile-dropdown-divider" />

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="profile-dropdown-item danger"
                  role="menuitem"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* User Profile & Account Management Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialTab={modalTab}
      />
    </>
  );
}
