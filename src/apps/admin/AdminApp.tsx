// Admin App Component - Routes & Providers
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './stores/AuthContext';
import { UIProvider } from './stores/UIContext';
import { MainLayout } from './components/Layout/MainLayout';
import { ToastStack } from './components/ToastStack';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const SubmissionsPage = lazy(() => import('./pages/SubmissionsPage').then(m => ({ default: m.SubmissionsPage })));
const ClientIntakePage = lazy(() => import('./pages/ClientIntakePage').then(m => ({ default: m.ClientIntakePage })));
const DiagnosesPage = lazy(() => import('./pages/DiagnosesPage').then(m => ({ default: m.DiagnosesPage })));
const VisitorsPage = lazy(() => import('./pages/VisitorsPage').then(m => ({ default: m.VisitorsPage })));
const CommentsPage = lazy(() => import('./pages/CommentsPage').then(m => ({ default: m.CommentsPage })));
const ResearchPage = lazy(() => import('./pages/ResearchPage').then(m => ({ default: m.ResearchPage })));
const ReportAnalyticsPage = lazy(() => import('./pages/ReportAnalyticsPage').then(m => ({ default: m.ReportAnalyticsPage })));
const ReportCommentsPage = lazy(() => import('./pages/ReportCommentsPage').then(m => ({ default: m.ReportCommentsPage })));
const TasksPage = lazy(() => import('./pages/TasksPage').then(m => ({ default: m.default })));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage').then(m => ({ default: m.default })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(m => ({ default: m.default })));
const WhitepaperPipelinePage = lazy(() => import('./pages/WhitepaperPipelinePage').then(m => ({ default: m.default })));
const SecuritySettingsPage = lazy(() => import('./pages/SecuritySettingsPage').then(m => ({ default: m.default })));

import './styles/admin.css';

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="admin-spinner" style={{ width: 28, height: 28, borderWidth: 2.5 }} />
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
      <Route
        path="login"
        element={
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        }
      />
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
        <Route path="report-analytics" element={<ReportAnalyticsPage />} />
        <Route path="report-comments" element={<ReportCommentsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="whitepapers" element={<WhitepaperPipelinePage />} />
        <Route path="security" element={<SecuritySettingsPage />} />
      </Route>
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <UIProvider>
        <AdminRoutes />
        <ToastStack />
      </UIProvider>
    </AuthProvider>
  );
}
