import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DiagnosisPage from './pages/DiagnosisPage';
import CasesPage from './pages/CasesPage';
import ExpertPage from './pages/ExpertPage';
import MethodPage from './pages/MethodPage';
import MarketsPage from './pages/MarketsPage';
import AdminPage from './pages/AdminPage';

const ResearchHub = lazy(() => import('./pages/ResearchHub'));
const ResearchReport = lazy(() => import('./pages/ResearchReport'));

export const router = createBrowserRouter([
  {
    path: '/admin',
    element: <AdminPage />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'diagnose', element: <DiagnosisPage /> },
      { path: 'cases', element: <CasesPage /> },
      { path: 'expert', element: <ExpertPage /> },
      { path: 'method', element: <MethodPage /> },
      { path: 'markets', element: <MarketsPage /> },
      { path: 'research', element: <ResearchHub /> },
      { path: 'research/:reportId', element: <ResearchReport /> },
    ],
  },
  {
    path: '*',
    element: <Layout />,
    children: [{ index: true, element: <HomePage /> }],
  },
]);
