// PageHeader — World-class page header with breadcrumb, title, KPIs strip, actions
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  /** Eyebrow label above title (e.g. "客户管理") */
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  /** Lucide icon node */
  icon?: ReactNode;
  /** Right-aligned actions (buttons, period selector, etc.) */
  actions?: ReactNode;
  /** Secondary toolbar row (filters, view switchers) */
  toolbar?: ReactNode;
  /** Optional inline metric strip rendered below title */
  metrics?: Array<{
    label: string;
    value: ReactNode;
    delta?: number;
    accent?: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'cyan';
  }>;
  /** Breadcrumb segments (rendered above eyebrow) */
  breadcrumb?: Array<{ label: string; href?: string }>;
}

const ACCENT_MAP = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  blue:    { text: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  rose:    { text: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  purple:  { text: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  cyan:    { text: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
};

export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  actions,
  toolbar,
  metrics,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <header className="admin-mb-6">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-3" aria-label="breadcrumb">
          {breadcrumb.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-zinc-700">/</span>}
              <span className={cn(i === breadcrumb.length - 1 && 'text-zinc-300 font-medium')}>
                {c.label}
              </span>
            </span>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-widest mb-1">
                {eyebrow}
              </div>
            )}
            <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
            {description && (
              <p className="text-xs text-zinc-500 mt-1">{description}</p>
            )}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>

      {metrics && metrics.length > 0 && (
        <div className="admin-grid admin-grid-4 admin-mt-4">
          {metrics.map((m, i) => {
            const accent = ACCENT_MAP[m.accent || 'emerald'];
            const delta = m.delta;
            const deltaCls =
              delta == null ? ''
              : delta > 0 ? 'up'
              : delta < 0 ? 'down'
              : 'flat';
            return (
              <div key={i} className={cn('rounded-xl border px-4 py-3', accent.bg, accent.border)}>
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                  {m.label}
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <div className={cn('text-lg font-bold', accent.text)}>{m.value}</div>
                  {delta != null && (
                    <span className={cn('kpi-tile-delta', deltaCls)} style={{ marginTop: 0 }}>
                      {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'} {Math.abs(delta).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toolbar && <div className="admin-mt-4">{toolbar}</div>}
    </header>
  );
}

export default PageHeader;
