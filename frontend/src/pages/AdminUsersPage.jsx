import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, ShieldCheck, ShieldAlert, UserCheck, Loader2 } from 'lucide-react';
import { usersApi } from '../api/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import LoadingFallback from '../components/LoadingFallback.jsx';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = useCallback(async (searchQuery = '') => {
    try {
      setLoading(true);
      const { data } = await usersApi.getAll(searchQuery);
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to retrieve user directory', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUsers(search);
  }, [fetchUsers, search]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await usersApi.updateRole(userId, newRole);
      addToast(`User role updated to '${newRole}'`, 'success');
      fetchUsers(search);
    } catch (err) {
      addToast(err.message || 'Failed to update user role', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && users.length === 0) return <LoadingFallback />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              PRIVILEGED ACCESS CONSOLE
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: '#C084FC', fontWeight: 600 }}>
              RBAC Multi-tenant Governance
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Admin User Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Supervise registered platform participants, audit ledger volume, and manage RBAC role entitlements.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="input"
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Role explanation summary */}
      <div style={{
        backgroundColor: 'var(--bg-card-elevated)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <ShieldAlert size={20} color="#C084FC" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#C084FC' }}>Admin Role:</strong> Full system visibility, can inspect cross-user records, access user management APIs, and change roles.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <UserCheck size={20} color="#38BDF8" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#38BDF8' }}>Standard User:</strong> Independent financial ledger, can create, edit, delete own transactions and view personal analytics.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <ShieldCheck size={20} color="#FBBF24" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#FBBF24' }}>Read-Only Auditor:</strong> Restricted viewing mode. Can review dashboards and transaction details, but all mutations are blocked.
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User / Identity</th>
              <th>Email Address</th>
              <th>Current Role</th>
              <th>Registered</th>
              <th style={{ textAlign: 'center' }}>Ledger Activity</th>
              <th style={{ textAlign: 'right' }}>Role Assignment</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = currentUser?.id === u.id;
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {u.name} {isSelf && <span style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>(You)</span>}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      UUID: {u.id.substring(0, 8)}...
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {u.email}
                  </td>
                  <td>
                    <span className={`badge badge-role-${u.role.replace('-', '')}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {u.stats?.transactionCount || 0}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                      ₹{parseFloat(u.stats?.totalExpense || 0).toLocaleString('en-IN')} outlays
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      {updatingId === u.id && <Loader2 size={16} className="animate-spin" color="var(--accent-cyan)" />}
                      <select
                        value={u.role}
                        disabled={isSelf || updatingId === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="select"
                        style={{ width: 'auto', padding: '6px 10px', fontSize: '0.75rem' }}
                      >
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="read-only">Read-Only</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
