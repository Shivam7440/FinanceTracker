import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('aura_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on load
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const storedToken = localStorage.getItem('aura_token');
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await authApi.getMe();
        if (isMounted && data.success) {
          setUser(data.user);
        }
      } catch (err) {
        console.warn('Session verification notice:', err.message);
        localStorage.removeItem('aura_token');
        localStorage.removeItem('aura_user');
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();
    return () => { isMounted = false; };
  }, []);

  // Login handler wrapped in useCallback for stable reference
  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    if (data.success && data.token) {
      localStorage.setItem('aura_token', data.token);
      localStorage.setItem('aura_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.error || 'Login failed');
  }, []);

  // Register handler
  const register = useCallback(async (name, email, password, role = 'user') => {
    const { data } = await authApi.register({ name, email, password, role });
    if (data.success && data.token) {
      localStorage.setItem('aura_token', data.token);
      localStorage.setItem('aura_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.error || 'Registration failed');
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    setToken(null);
    setUser(null);
  }, []);

  // Update user in local state and localStorage
  const updateUser = useCallback((updatedUserData, newToken) => {
    setUser((prev) => ({ ...prev, ...updatedUserData }));
    const current = JSON.parse(localStorage.getItem('aura_user') || '{}');
    localStorage.setItem('aura_user', JSON.stringify({ ...current, ...updatedUserData }));
    if (newToken) {
      setToken(newToken);
      localStorage.setItem('aura_token', newToken);
    }
  }, []);

  // Refresh user data from API
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authApi.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('aura_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err.message);
    }
    return null;
  }, []);

  // Derived role capabilities using useMemo
  const roleCapabilities = useMemo(() => {
    const role = user?.role;
    return {
      isAdmin: role === 'admin',
      isUser: role === 'user',
      isReadOnly: role === 'read-only',
      canWriteTransactions: role === 'admin' || role === 'user'
    };
  }, [user?.role]);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    ...roleCapabilities
  }), [user, token, loading, login, register, logout, updateUser, refreshUser, roleCapabilities]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
