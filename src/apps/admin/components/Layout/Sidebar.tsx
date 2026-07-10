// Admin Sidebar - Professional Navigation with Grouped Sections
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Brain,
  Users,
  BarChart3,
  Heart,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  CheckSquare,
  Search,
  Inbox,
  ScrollText,
  Shield,
  FileText,
  Activity,
} from 'lucide-react';
import { useUI } from '../../stores/UIContext';
import { cn } from '@/lib/utils';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number | string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    title: '工作台',
    items: [
      { key: 'dashboard', label: '工作台概览', icon: <LayoutDashboard size={18} />, path: '/admin' },
      { key: 'tasks', label: '任务中心', icon: <CheckSquare size={18} />, path: '/admin/tasks' },
    ],
  },
  {
    title: '客户',
    items: [
      { key: 'submissions', label: '线索管理', icon: <Inbox size={18} />, path: '/admin/submissions' },
      { key: 'client-intake', label: '客户采集', icon: <ClipboardList size={18} />, path: '/admin/client-intake' },
      { key: 'diagnoses', label: 'AI 诊断报告', icon: <Brain size={18} />, path: '/admin/diagnoses' },
    ],
  },
  {
    title: '分析',
    items: [
      { key: 'research', label: '研究报告', icon: <Search size={18} />, path: '/admin/research' },
      { key: 'report-analytics', label: '报告互动', icon: <Heart size={18} />, path: '/admin/report-analytics' },
      { key: 'report-comments', label: '报告留言', icon: <MessageSquare size={18} />, path: '/admin/report-comments' },
      { key: 'visitors', label: '访客分析', icon: <Users size={18} />, path: '/admin/visitors' },
    ],
  },
  {
    title: '系统',
    items: [
      { key: 'audit-log', label: '操作日志', icon: <ScrollText size={18} />, path: '/admin/audit-log' },
      { key: 'settings', label: '系统设置', icon: <Settings size={18} />, path: '/admin/settings' },
    ],
  },
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
      {/* Mobile Overlay */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarMobile(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-r border-zinc-800/50 z-50 transition-all duration-300 flex flex-col',
          sidebarCollapsed ? 'w-[68px]' : 'w-[260px]',
          sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-zinc-800/50">
          <Link to="/admin" className="flex items-center gap-3 text-white no-underline">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <Hexagon size={20} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold tracking-tight text-white">岐黄四海</div>
                <div className="text-[10px] text-emerald-400/70 tracking-widest uppercase font-medium">Admin</div>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
          {MENU_GROUPS.map((group) => (
            <div key={group.title} className="mb-6">
              {!sidebarCollapsed && (
                <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                  {group.title}
                </div>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
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
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-400 rounded-r-full" />
                        )}
                        <span className="shrink-0">{item.icon}</span>
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.badge && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
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
            </div>
          ))}
        </nav>

        {/* Collapse Button */}
        <div className="hidden lg:block p-3 border-t border-zinc-800/50">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.03] transition-colors text-sm"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} />
                <span>收起</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
