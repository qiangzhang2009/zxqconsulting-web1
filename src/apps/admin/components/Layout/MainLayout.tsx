// Admin Main Layout
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUI } from '../../stores/UIContext';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const { sidebarCollapsed } = useUI();

  return (
    <div className="admin-root min-h-screen bg-[var(--admin-bg)]">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[280px]'
        )}
      >
        <Header />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}