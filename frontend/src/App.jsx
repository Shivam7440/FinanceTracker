import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import LoadingFallback from './components/LoadingFallback.jsx';
import TransactionModal from './components/TransactionModal.jsx';

// Lazy-loaded pages (Assignment requirement for route-based code splitting)
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage.jsx'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingFallback />;
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// Admin-only Route Guard
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--accent-rose)', fontSize: '1.5rem', fontWeight: 800 }}>403 — Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          This console is strictly restricted to platform administrators.
        </p>
      </div>
    );
  }
  return children;
}

// App Layout Shell
function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTransactionSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="main-content">
        <Topbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenAddTransaction={() => setIsGlobalAddOpen(true)}
        />

        <main className="page-body">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardPage
                    key={refreshTrigger}
                    onOpenAddTransaction={() => setIsGlobalAddOpen(true)}
                  />
                }
              />
              <Route
                path="/transactions"
                element={
                  <TransactionsPage
                    key={refreshTrigger}
                    onOpenAddTransaction={() => setIsGlobalAddOpen(true)}
                  />
                }
              />
              <Route path="/analytics" element={<AnalyticsPage key={refreshTrigger} />} />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsersPage />
                  </AdminRoute>
                }
              />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isGlobalAddOpen}
        onClose={() => setIsGlobalAddOpen(false)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
