// Area Chart Component - For trends
import { useMemo } from 'react';

interface AreaChartProps {
  data: Array<{ date: string; [key: string]: number | string }>;
  series: Array<{ key: string; label: string; color: string }>;
  height?: number;
  showLegend?: boolean;
}

export function AreaChart({ data, series, height = 240, showLegend = true }: AreaChartProps) {
  const { points, maxY, viewBoxW } = useMemo(() => {
    if (!data.length) return { points: [], maxY: 1, viewBoxW: 600 };

    const viewBoxW = 600;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartW = viewBoxW - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    let maxY = 0;
    series.forEach(s => {
      data.forEach(d => {
        const v = Number(d[s.key]) || 0;
        if (v > maxY) maxY = v;
      });
    });
    maxY = maxY || 1;

    const points = series.map(s => {
      const coords = data.map((d, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartW;
        const v = Number(d[s.key]) || 0;
        const y = padding.top + chartH - (v / maxY) * chartH;
        return { x, y };
      });
      return { ...s, coords };
    });

    return { points, maxY, viewBoxW };
  }, [data, series, height]);

  if (!data.length || !series.length) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">
        暂无数据
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartH = height - padding.top - padding.bottom;

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }).map((_, i) => {
    const value = (maxY / yTicks) * (yTicks - i);
    const y = padding.top + (chartH / yTicks) * i;
    return { value, y };
  });

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${viewBoxW} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          {points.map((s, i) => (
            <linearGradient key={i} id={`area-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* 网格线 */}
        {yLabels.map((label, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={label.y}
              x2={viewBoxW - padding.right}
              y2={label.y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={label.y + 3}
              textAnchor="end"
              fontSize="9"
              fill="rgba(255,255,255,0.3)"
            >
              {Math.round(label.value)}
            </text>
          </g>
        ))}

        {/* 区域 + 折线 */}
        {points.map((s, i) => {
          const pathD = s.coords.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
          const areaD = `${pathD} L ${s.coords[s.coords.length - 1].x} ${padding.top + chartH} L ${s.coords[0].x} ${padding.top + chartH} Z`;
          return (
            <g key={i}>
              <path d={areaD} fill={`url(#area-${s.key})`} />
              <path d={pathD} fill="none" stroke={s.color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
              {s.coords.map((p, j) => (
                <circle key={j} cx={p.x} cy={p.y} r="2" fill={s.color} opacity="0.8" />
              ))}
            </g>
          );
        })}

        {/* X 轴标签 */}
        {data.length > 0 && (
          <>
            <text x={padding.left} y={height - 8} textAnchor="start" fontSize="9" fill="rgba(255,255,255,0.3)">
              {data[0]?.date?.slice(5)}
            </text>
            <text x={viewBoxW - padding.right} y={height - 8} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.3)">
              {data[data.length - 1]?.date?.slice(5)}
            </text>
          </>
        )}
      </svg>

      {showLegend && (
        <div className="flex items-center justify-center gap-6 mt-2">
          {points.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <span className="w-3 h-1 rounded" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-zinc-400">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}