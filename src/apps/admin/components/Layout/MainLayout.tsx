// MainLayout — Admin shell with sidebar, header, command palette
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '../CommandPalette';
import { useUI } from '../../stores/UIContext';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const { sidebarCollapsed } = useUI();
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        // future: open keyboard shortcuts help
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    const main = document.getElementById('admin-main-scroll');
    if (main) main.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="admin-root min-h-screen">
      <div className="admin-shell flex">
        <Sidebar onOpenCommand={() => setPaletteOpen(true)} />
        <main
          id="admin-main-scroll"
          className={cn(
            'admin-main flex-1 min-w-0',
            sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[264px]'
          )}
        >
          <Header onOpenCommand={() => setPaletteOpen(true)} />
          <div className="admin-content" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

export default MainLayout;
