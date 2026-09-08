// Sidebar — Premium admin sidebar with grouped nav, role chip, collapsible sections
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Hexagon, Star, Shield, ChevronsUpDown, LogOut } from 'lucide-react';
import { useUI } from '../../stores/UIContext';
import { useAuth } from '../../stores/AuthContext';
import { NAV_SECTIONS, ROLE_LABELS, ROLE_BADGE, findNavItem, type NavItem } from '../../config/navigation';
import { cn } from '@/lib/utils';
import { initials } from '@/apps/admin/lib/format';

const FAV_KEY = 'qhs_admin_favorites';

function loadFavs(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '["dashboard","submissions"]'));
  } catch {
    return new Set(['dashboard', 'submissions']);
  }
}

function saveFavs(s: Set<string>) {
  localStorage.setItem(FAV_KEY, JSON.stringify([...s]));
}

interface Props {
  onOpenCommand?: () => void;
}

export function Sidebar({ onOpenCommand }: Props) {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setSidebarMobile } = useUI();
  const { email, role, logout } = useAuth();

  const favs = useMemo(loadFavs, []);
  const favorites = useMemo(
    () =>
      NAV_SECTIONS.flatMap((s) => s.items).filter((i) => favs.has(i.key)),
    [favs]
  );

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const currentItem = findNavItem(location.pathname);

  return (
    <>
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarMobile(false)}
        />
      )}

      <aside
        className={cn(
          'admin-sidebar',
          sidebarCollapsed && 'collapsed',
          sidebarMobileOpen && 'mobile-open'
        )}
        aria-label="管理后台导航"
      >
        {/* Brand */}
        <div className="admin-sidebar-brand">
          <Link
            to="/admin"
            className="flex items-center gap-3 no-underline text-white shrink-0"
            onClick={() => setSidebarMobile(false)}
          >
            <span className="mark">
              <Hexagon size={18} />
            </span>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold tracking-tight leading-none">
                  岐黄四海
                </div>
                <div className="text-[9.5px] text-emerald-400/80 tracking-[0.18em] uppercase font-medium mt-1">
                  Console
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Nav scroll */}
        <nav className="admin-sidebar-nav admin-scroll">
          {/* Favorites */}
          {!sidebarCollapsed && favorites.length > 0 && (
            <div className="admin-sidebar-section">
              <div className="admin-sidebar-section-title">
                <Star size={11} />
                收藏
              </div>
              <ul className="space-y-0.5">
                {favorites.slice(0, 5).map((item) => (
                  <NavRow
                    key={item.key}
                    item={item}
                    active={isActive(item.path)}
                    onClick={() => setSidebarMobile(false)}
                  />
                ))}
              </ul>
            </div>
          )}

          {/* Sections */}
          {NAV_SECTIONS.map((section) => (
            <div key={section.key} className="admin-sidebar-section">
              {!sidebarCollapsed && (
                <div className="admin-sidebar-section-title">
                  {section.label}
                </div>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <NavRow
                    key={item.key}
                    item={item}
                    active={isActive(item.path)}
                    onClick={() => setSidebarMobile(false)}
                    collapsed={sidebarCollapsed}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer — role chip + collapse */}
        <div className="admin-sidebar-footer">
          {!sidebarCollapsed ? (
            <>
              <div className="admin-role-chip">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-xs font-semibold">
                  {initials(email)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-semibold text-white truncate">{email}</div>
                  <span
                    className={cn(
                      'inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-semibold border',
                      ROLE_BADGE[role || 'admin']
                    )}
                  >
                    {ROLE_LABELS[role || 'admin'] || '管理员'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="退出登录"
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </div>
              <button
                onClick={toggleSidebar}
                className="admin-btn ghost sm w-full mt-2"
                title="收起侧边栏"
              >
                <ChevronLeft size={14} />
                收起
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className="admin-btn subtle sm w-full"
              title="展开侧边栏"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function NavRow({
  item,
  active,
  onClick,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  collapsed?: boolean;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        to={item.path}
        onClick={onClick}
        className={cn('admin-nav-item', active && 'active')}
        title={collapsed ? item.label : undefined}
      >
        <Icon size={16} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.shortcut && (
              <span className="kbd">{item.shortcut.split(' ').pop()}</span>
            )}
          </>
        )}
      </Link>
    </li>
  );
}

export default Sidebar;
