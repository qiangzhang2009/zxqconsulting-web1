// Donut Chart Component
import { useMemo } from 'react';

interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ data, size = 140, thickness = 16, centerLabel, centerValue }: DonutChartProps) {
  const { segments, total } = useMemo(() => {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return { segments: [], total: 0 };

    let cumulative = 0;
    const segments = data.map(d => {
      const pct = (d.value / total) * 100;
      const start = cumulative;
      cumulative += pct;
      return { ...d, pct, start, end: cumulative };
    });

    return { segments, total };
  }, [data]);

  if (total === 0) {
    return <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">暂无数据</div>;
  }

  const r = 50 - thickness / 2;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;

  const describeArc = (startPct: number, endPct: number) => {
    const startAngle = (startPct / 100) * 360;
    const endAngle = (endPct / 100) * 360;
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="shrink-0 -rotate-90" style={{ width: size, height: size }}>
        {segments.map((s, i) => (
          <path
            key={i}
            d={describeArc(s.start, s.end)}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness / 4}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="flex-1 space-y-1.5 min-w-0">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-zinc-400 flex-1 truncate">{s.label}</span>
            <span className="text-white font-medium">{s.value}</span>
            <span className="text-zinc-600 text-[10px]">({s.pct.toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}