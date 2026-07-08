// Admin App Component - Routes & Providers
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './stores/AuthContext';
import { UIProvider } from './stores/UIContext';
import { MainLayout } from './components/Layout/MainLayout';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const SubmissionsPage = lazy(() => import('./pages/SubmissionsPage').then(m => ({ default: m.SubmissionsPage })));
const ClientIntakePage = lazy(() => import('./pages/ClientIntakePage').then(m => ({ default: m.ClientIntakePage })));
const DiagnosesPage = lazy(() => import('./pages/DiagnosesPage').then(m => ({ default: m.DiagnosesPage })));
const VisitorsPage = lazy(() => import('./pages/VisitorsPage').then(m => ({ default: m.VisitorsPage })));
const CommentsPage = lazy(() => import('./pages/CommentsPage').then(m => ({ default: m.CommentsPage })));
const ResearchPage = lazy(() => import('./pages/ResearchPage').then(m => ({ default: m.ResearchPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

import './styles/admin.css';

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-xs text-zinc-500">加载中...</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      } />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="submissions" element={<SubmissionsPage />} />
        <Route path="client-intake" element={<ClientIntakePage />} />
        <Route path="diagnoses" element={<DiagnosesPage />} />
        <Route path="visitors" element={<VisitorsPage />} />
        <Route path="comments" element={<CommentsPage />} />
        <Route path="research" element={<ResearchPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <UIProvider>
        <AdminRoutes />
      </UIProvider>
    </AuthProvider>
  );
}