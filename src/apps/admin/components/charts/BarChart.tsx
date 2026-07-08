// Bar Chart Component
import { useMemo } from 'react';

interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  height?: number;
  formatValue?: (v: number) => string;
}

export function BarChart({ data, height = 200, formatValue }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1);

  if (!data.length) {
    return <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">暂无数据</div>;
  }

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = (item.value / max) * 100;
        return (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 truncate flex-1">{item.label}</span>
              <span className="text-white font-medium ml-2">
                {formatValue ? formatValue(item.value) : item.value.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.color || '#10b981',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}