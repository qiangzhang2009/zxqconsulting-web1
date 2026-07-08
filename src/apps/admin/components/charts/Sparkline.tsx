// Sparkline - Mini trend line
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showLastValue?: boolean;
}

export function Sparkline({ data, color = '#10b981', height = 32, width = 80, showLastValue }: SparklineProps) {
  if (data.length < 2) return <div style={{ height, width }} />;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const fillPts = `0,${height} ${pts.join(' ')} ${width},${height}`;
  const linePts = pts.join(' ');

  return (
    <div className="flex items-center gap-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="shrink-0" style={{ width, height }}>
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPts} fill={`url(#spark-${color.replace('#', '')})`} />
        <polyline points={linePts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      {showLastValue && (
        <span className="text-xs text-zinc-400 font-medium">{data[data.length - 1]}</span>
      )}
    </div>
  );
}