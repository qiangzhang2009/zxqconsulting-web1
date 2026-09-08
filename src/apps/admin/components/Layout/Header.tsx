// Header — Sticky admin top bar: breadcrumb, search trigger, notifications, profile
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, Search, Bell, LogOut, User, ChevronDown, Globe, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../stores/AuthContext';
import { useUI } from '../../stores/UIContext';
import { findNavItem } from '../../config/navigation';
import { cn } from '@/lib/utils';

interface Props {
  onOpenCommand: () => void;
}

export function Header({ onOpenCommand }: Props) {
  const location = useLocation();
  const { email, role, logout } = useAuth();
  const { toggleSidebar, setSidebarMobile } = useUI();

  const current = findNavItem(location.pathname);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Close popovers on route change
  useEffect(() => {
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  return (
    <header className="admin-header">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarMobile(true)}
          className="lg:hidden admin-btn subtle sm"
          aria-label="打开菜单"
        >
          <Menu size={16} />
        </button>
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex admin-btn subtle sm"
          title="切换菜单"
          aria-label="切换菜单"
        >
          <Menu size={16} />
        </button>

        <div className="min-w-0 hidden sm:block">
          <div className="admin-header-breadcrumb">
            <span>管理后台</span>
            {current && current.path !== '/admin' && (
              <>
                <span className="text-zinc-700">/</span>
                <span className="crumb-current">{current.label}</span>
              </>
            )}
            {(!current || current.path === '/admin') && (
              <>
                <span className="text-zinc-700">/</span>
                <span className="crumb-current">概览</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 hidden md:block">
            {now.toLocaleString('zh-CN', {
              year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
              hour: '2-digit', minute: '2-digit',
            })}
          </div>
        </div>
      </div>

      {/* Search trigger */}
      <button
        onClick={onOpenCommand}
        className="admin-header-search"
        aria-label="打开命令面板"
      >
        <Search size={14} />
        <span>搜索页面、功能、跳转...</span>
        <kbd>⌘ K</kbd>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="admin-btn subtle sm relative"
            aria-label="通知"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
          </button>
          {notifOpen && (
            <NotificationPanel onClose={() => setNotifOpen(false)} />
          )}
        </div>

        {/* Environment */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono text-emerald-400 bg-emerald-500/8 border border-emerald-500/20">
          <Globe size={11} />
          Production
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="admin-btn subtle sm gap-2"
            aria-label="账号菜单"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/30 to-cyan-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-[11px] font-bold">
              {(email || 'A')[0].toUpperCase()}
            </div>
            <ChevronDown size={12} className="text-zinc-500" />
          </button>
          {profileOpen && (
            <ProfilePanel
              email={email}
              role={role}
              onLogout={logout}
              onClose={() => setProfileOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-[var(--admin-card)] border border-[var(--admin-border)] shadow-2xl z-50 overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--admin-border)] flex items-center justify-between">
          <div className="text-sm font-semibold text-white">通知中心</div>
          <button className="text-[11px] text-emerald-400 hover:text-emerald-300">
            全部已读
          </button>
        </div>
        <div className="max-h-[360px] overflow-y-auto admin-scroll">
          <NotifItem
            title="3 条新线索待跟进"
            description="来自网站 /diagnose 页面的 AI 诊断表单"
            time="5 分钟前"
            icon="inbox"
            onClick={() => { navigate('/admin/submissions'); onClose(); }}
          />
          <NotifItem
            title="系统已部署到生产"
            description="version 2.4.1 · 由 Cloudflare Workers 推送"
            time="2 小时前"
            icon="shield"
          />
          <NotifItem
            title="周报生成完成"
            description="本周访问 1,283 · 较上周 +18%"
            time="昨天 18:00"
            icon="activity"
            onClick={() => { navigate('/admin'); onClose(); }}
          />
        </div>
        <div className="px-4 py-2 border-t border-[var(--admin-border)] bg-white/[0.015] text-[11px] text-zinc-500 text-center">
          通知由系统自动汇总 · 不推送离线消息
        </div>
      </div>
    </>
  );
}

function NotifItem({
  title,
  description,
  time,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  time: string;
  icon: 'inbox' | 'shield' | 'activity';
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-[var(--admin-divider)] hover:bg-white/[0.03] transition-colors',
        !onClick && 'cursor-default'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
            icon === 'inbox' && 'bg-blue-500/10 text-blue-400',
            icon === 'shield' && 'bg-emerald-500/10 text-emerald-400',
            icon === 'activity' && 'bg-purple-500/10 text-purple-400'
          )}
        >
          {icon === 'inbox' && <Bell size={14} />}
          {icon === 'shield' && <ShieldCheck size={14} />}
          {icon === 'activity' && <Search size={14} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{title}</div>
          <div className="text-xs text-zinc-500 mt-0.5 truncate">{description}</div>
          <div className="text-[10.5px] text-zinc-600 mt-1">{time}</div>
        </div>
      </div>
    </button>
  );
}

function ProfilePanel({
  email,
  role,
  onLogout,
  onClose,
}: {
  email: string | null;
  role: string | null;
  onLogout: () => void;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[var(--admin-card)] border border-[var(--admin-border)] shadow-2xl z-50 overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--admin-border)]">
          <div className="text-sm font-semibold text-white truncate">{email}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {role === 'super_admin' ? '超级管理员' : role === 'admin' ? '管理员' : role === 'editor' ? '编辑' : '查看员'}
          </div>
        </div>
        <div className="p-1">
          <button
            onClick={() => { navigate('/admin/security'); onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-white/[0.04] transition-colors"
          >
            <ShieldCheck size={14} />
            安全设置
          </button>
          <button
            onClick={() => { navigate('/admin/audit-log'); onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-white/[0.04] transition-colors"
          >
            <User size={14} />
            我的活动
          </button>
          <div className="admin-divider" style={{ margin: '4px 8px' }} />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} />
            退出登录
          </button>
        </div>
      </div>
    </>
  );
}

export default Header;
