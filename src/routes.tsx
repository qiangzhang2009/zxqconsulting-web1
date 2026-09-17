import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DiagnosisPage from './pages/DiagnosisPage';
import ExpertPage from './pages/ExpertPage';
import MethodPage from './pages/MethodPage';
import MarketsPage from './pages/MarketsPage';
import AdminApp from './apps/admin/AdminApp';
import DownloadGuidePage from './pages/DownloadGuidePage';
import NotFoundPage from './pages/NotFoundPage';

const ResearchHub = lazy(() => import('./pages/ResearchHub'));
const ResearchReport = lazy(() => import('./pages/ResearchReport'));
const CountryAssessmentPage = lazy(() => import('./pages/CountryAssessmentPage'));

export const router = createBrowserRouter([
  {
    path: '/admin/*',
    element: <AdminApp />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'diagnose', element: <DiagnosisPage /> },
      { path: 'expert', element: <ExpertPage /> },
      { path: 'method', element: <MethodPage /> },
      { path: 'markets', element: <MarketsPage /> },
      { path: 'research', element: <ResearchHub /> },
      { path: 'research/:reportId', element: <ResearchReport /> },
      { path: 'country-assessment', element: <CountryAssessmentPage /> },
      { path: 'download-guide', element: <DownloadGuidePage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
