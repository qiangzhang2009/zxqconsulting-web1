// Admin Header
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Search, LogOut, User } from 'lucide-react';
import { useAuth } from '../../stores/AuthContext';
import { useUI } from '../../stores/UIContext';

const PAGE_TITLES: Record<string, string> = {
  '/admin': '概览仪表盘',
  '/admin/submissions': '提交管理',
  '/admin/diagnoses': 'AI 诊断报告',
  '/admin/visitors': '访客管理',
  '/admin/comments': '评论审核',
  '/admin/research': '研究报告分析',
  '/admin/settings': '系统设置',
};

export function Header() {
  const location = useLocation();
  const { email, logout } = useAuth();
  const { toggleSidebar, setSidebarMobile } = useUI();

  const pageTitle = PAGE_TITLES[location.pathname] || '管理后台';

  return (
    <header className="h-16 bg-[var(--admin-sidebar)] border-b border-[var(--admin-border)] sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* 左侧 - 移动菜单 + 标题 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarMobile(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-zinc-400"
        >
          <Menu size={20} />
        </button>
        <button
          onClick={toggleSidebar}
          className="hidden lg:block p-2 rounded-lg hover:bg-white/5 text-zinc-400"
          title="切换菜单"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight">{pageTitle}</h1>
          <p className="text-xs text-zinc-500 hidden sm:block">岐黄四海 · 智能出海决策平台</p>
        </div>
      </div>

      {/* 右侧 - 用户 */}
      <div className="flex items-center gap-2">
        <div className="relative group">
          <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center">
              <User size={14} className="text-emerald-400" />
            </div>
            <span className="hidden sm:block text-sm text-white max-w-[140px] truncate">{email}</span>
          </button>

          {/* 下拉菜单 */}
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[var(--admin-sidebar)] border border-[var(--admin-border)] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <div className="p-3 border-b border-[var(--admin-border)]">
              <p className="text-sm font-medium text-white truncate">{email}</p>
              <p className="text-xs text-zinc-500 mt-0.5">管理员</p>
            </div>
            <div className="p-1">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={14} />
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}