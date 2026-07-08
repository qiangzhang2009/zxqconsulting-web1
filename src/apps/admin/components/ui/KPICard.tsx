// KPI Card
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { AnimatedNumber } from './AnimatedNumber';

interface KPICardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  trend?: number;
  icon?: ReactNode;
  accent?: 'emerald' | 'blue' | 'amber' | 'purple' | 'rose';
  description?: string;
}

const ACCENT_MAP = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'bg-emerald-500' },
  blue:    { text: 'text-blue-400',    bg: 'bg-blue-500/10',    glow: 'bg-blue-500' },
  amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/10',   glow: 'bg-amber-500' },
  purple:  { text: 'text-purple-400',  bg: 'bg-purple-500/10',  glow: 'bg-purple-500' },
  rose:    { text: 'text-rose-400',    bg: 'bg-rose-500/10',    glow: 'bg-rose-500' },
};

export function KPICard({ label, value, suffix, prefix, decimals, trend, icon, accent = 'emerald', description }: KPICardProps) {
  const accentStyle = ACCENT_MAP[accent];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-gradient-to-br from-[var(--admin-card)] to-transparent p-5 hover:border-[var(--admin-border)]/80 transition-colors">
      {/* 装饰光斑 */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full ${accentStyle.glow} opacity-[0.04] -translate-y-1/2 translate-x-1/2 blur-2xl`} />

      <div className="flex items-start justify-between mb-3">
        <div className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">{label}</div>
        {icon && (
          <div className={`w-9 h-9 rounded-lg ${accentStyle.bg} flex items-center justify-center ${accentStyle.text}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className={`text-3xl font-bold ${accentStyle.text} tracking-tight`}>
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-md ${
            trend > 0 ? 'text-emerald-400 bg-emerald-500/10' : trend < 0 ? 'text-red-400 bg-red-500/10' : 'text-zinc-400 bg-zinc-500/10'
          }`}>
            {trend > 0 ? <TrendingUp size={11} /> : trend < 0 ? <TrendingDown size={11} /> : null}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>

      {description && (
        <p className="text-xs text-zinc-500 mt-2">{description}</p>
      )}
    </div>
  );
}