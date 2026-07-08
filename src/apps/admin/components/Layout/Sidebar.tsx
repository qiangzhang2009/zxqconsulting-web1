// Admin Sidebar
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  ClipboardList,
  Brain,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Hexagon,
} from 'lucide-react';
import { useUI } from '../../stores/UIContext';
import { cn } from '@/lib/utils';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { key: 'dashboard',   label: '概览',          icon: <LayoutDashboard size={18} />, path: '/admin' },
  { key: 'submissions', label: '提交管理',      icon: <Inbox size={18} />,          path: '/admin/submissions' },
  { key: 'client-intake', label: '客户采集表',   icon: <ClipboardList size={18} />, path: '/admin/client-intake' },
  { key: 'diagnoses',   label: 'AI 诊断',       icon: <Brain size={18} />,         path: '/admin/diagnoses' },
  { key: 'visitors',    label: '访客管理',      icon: <Users size={18} />,         path: '/admin/visitors' },
  { key: 'comments',    label: '评论审核',      icon: <MessageSquare size={18} />, path: '/admin/comments' },
  { key: 'research',   label: '研究分析',      icon: <BarChart3 size={18} />,     path: '/admin/research' },
  { key: 'settings',   label: '设置',           icon: <Settings size={18} />,       path: '/admin/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setSidebarMobile } = useUI();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* 移动端遮罩 */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarMobile(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-[var(--admin-sidebar)] border-r border-[var(--admin-border)] z-50 transition-all duration-300 flex flex-col',
          sidebarCollapsed ? 'w-[72px]' : 'w-[280px]',
          sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-[var(--admin-border)]">
          <Link to="/admin" className="flex items-center gap-3 text-white no-underline">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Hexagon size={18} className="text-emerald-400" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold tracking-tight truncate">岐黄四海</div>
                <div className="text-[10px] text-zinc-500 tracking-widest uppercase">Admin</div>
              </div>
            )}
          </Link>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {MENU_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarMobile(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative group',
                      active
                        ? 'bg-emerald-500/15 text-emerald-400 font-medium'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-400 rounded-r-full" />
                    )}
                    <span className="shrink-0">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 折叠按钮 */}
        <div className="hidden lg:block p-3 border-t border-[var(--admin-border)]">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors text-sm"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} />
                <span>收起菜单</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}