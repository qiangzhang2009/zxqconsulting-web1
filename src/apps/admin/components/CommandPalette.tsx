// CommandPalette — Global Cmd+K palette for navigation, search & quick actions
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft, Hash, Compass, ArrowRight } from 'lucide-react';
import { NAV_ITEMS_FLAT, type NavItem } from '../config/navigation';
import { cn } from '@/lib/utils';

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface Result {
  item: NavItem;
  section: string;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Group flat items by section
  const grouped: Result[] = useMemo(() => {
    const sections = new Map<string, NavItem[]>();
    NAV_ITEMS_FLAT.forEach((item) => {
      const section = item.path.split('/').pop()?.split('-')[0] || '其它';
      if (!sections.has(section)) sections.set(section, []);
      sections.get(section)!.push(item);
    });
    const out: Result[] = [];
    sections.forEach((items, _section) => {
      items.forEach((item) => out.push({ item, section: item.label }));
    });
    return out;
  }, []);

  const results: Result[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return grouped;
    return grouped.filter(
      (r) =>
        r.item.label.toLowerCase().includes(q) ||
        (r.item.description || '').toLowerCase().includes(q) ||
        r.item.key.toLowerCase().includes(q)
    );
  }, [query, grouped]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => Math.min(results.length - 1, a + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const r = results[active];
        if (r) {
          navigate(r.item.path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, active, results, navigate, onClose]);

  if (!open) return null;

  return (
    <div
      className="admin-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ alignItems: 'flex-start', paddingTop: '12vh' }}
    >
      <div
        className="admin-modal"
        style={{
          maxWidth: 640,
          margin: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '70vh',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--admin-border)]">
          <Search size={16} className="text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="搜索页面、功能、跳转..."
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-zinc-600"
          />
          <kbd className="admin-badge neutral" style={{ padding: '2px 7px', fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 10 }}>
            ESC
          </kbd>
        </div>

        <div className="admin-scroll overflow-y-auto" style={{ maxHeight: '50vh', padding: 8 }}>
          {results.length === 0 ? (
            <div className="px-4 py-12 text-center text-zinc-500 text-sm">
              没有匹配「{query}」的页面
            </div>
          ) : (
            results.map((r, idx) => {
              const Icon = r.item.icon;
              const isActive = idx === active;
              return (
                <button
                  key={r.item.key}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => {
                    navigate(r.item.path);
                    onClose();
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                    isActive
                      ? 'bg-emerald-500/10 text-white'
                      : 'text-zinc-300 hover:bg-white/[0.03]'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                    )}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.item.label}</div>
                    {r.item.description && (
                      <div className="text-xs text-zinc-500 truncate">{r.item.description}</div>
                    )}
                  </div>
                  {r.item.shortcut && (
                    <kbd className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900/50">
                      {r.item.shortcut}
                    </kbd>
                  )}
                  {isActive && (
                    <CornerDownLeft size={14} className="text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--admin-border)] text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <kbd className="font-mono px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900/50">↑↓</kbd>
            选择
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="font-mono px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900/50">↵</kbd>
            进入
          </span>
          <span className="flex items-center gap-1.5 ml-auto">
            <Compass size={11} /> 岐黄四海 · 命令面板
          </span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
