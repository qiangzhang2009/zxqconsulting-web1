// KPICard — premium KPI tile with sparkline, accent & delta
import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import { cn } from '@/lib/utils';

type Accent = 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'cyan';

const ACCENT = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'rgba(16, 185, 129, 0.18)' },
  blue:    { text: 'text-blue-400',    bg: 'bg-blue-500/10',    glow: 'rgba(56, 189, 248, 0.18)' },
  amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/10',   glow: 'rgba(251, 191, 36, 0.18)' },
  rose:    { text: 'text-rose-400',    bg: 'bg-rose-500/10',    glow: 'rgba(244, 63, 94, 0.18)' },
  purple:  { text: 'text-purple-400',  bg: 'bg-purple-500/10',  glow: 'rgba(168, 85, 247, 0.18)' },
  cyan:    { text: 'text-cyan-400',    bg: 'bg-cyan-500/10',    glow: 'rgba(34, 211, 238, 0.18)' },
};

interface Props {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  delta?: number | null;
  deltaLabel?: string;
  icon?: ReactNode;
  accent?: Accent;
  description?: ReactNode;
  /** Inline sparkline data */
  sparkline?: number[];
  footer?: ReactNode;
  onClick?: () => void;
}

export function KPICard({
  label,
  value,
  suffix,
  prefix,
  decimals,
  delta,
  deltaLabel,
  icon,
  accent = 'emerald',
  description,
  sparkline,
  footer,
  onClick,
}: Props) {
  const a = ACCENT[accent];
  const dir = delta == null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';

  return (
    <div
      onClick={onClick}
      className={cn(
        'kpi-tile',
        onClick && 'cursor-pointer hover:border-zinc-700 transition-colors'
      )}
      style={{ ['--accent-soft' as string]: a.glow }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="kpi-tile-label">{label}</div>
        {icon && (
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', a.bg, a.text)}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mt-2">
        <div className={cn('kpi-tile-value', a.text)}>
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </div>
        {delta != null && (
          <span className={cn('kpi-tile-delta', dir)}>
            {dir === 'up' && <TrendingUp size={11} />}
            {dir === 'down' && <TrendingDown size={11} />}
            {dir === 'flat' && <Minus size={11} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>

      {description && (
        <div className="text-[11.5px] text-zinc-500 mt-1.5">{description}</div>
      )}

      {sparkline && sparkline.length > 1 && (
        <Sparkline data={sparkline} color={a.glow.replace(/rgba\((.*),\s*0\.18\)/, 'rgb($1)')} />
      )}

      {footer && <div className="mt-3 pt-3 border-t border-zinc-800/60">{footer}</div>}
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 220;
  const h = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / Math.max(1, data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  const last = data[data.length - 1];
  const lastY = h - ((last - min) / range) * h;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-3">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${h} ${points.join(' ')} ${w},${h}`}
        fill="url(#spark-fill)"
        stroke="none"
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={w} cy={lastY} r="2.5" fill={color} />
    </svg>
  );
}

export default KPICard;
