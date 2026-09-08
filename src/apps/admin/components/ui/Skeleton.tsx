// Skeleton — unified loading placeholders
import type { CSSProperties } from 'react';

export function Skeleton({
  width = '100%',
  height = 14,
  radius = 6,
  className,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`admin-skeleton ${className || ''}`}
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

export function CardSkeleton({ height = 120 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5" style={{ minHeight: height }}>
      <Skeleton width="40%" height={11} />
      <Skeleton width="60%" height={22} radius={6} className="mt-3" />
      <Skeleton width="80%" height={11} className="mt-3" />
    </div>
  );
}

export function RowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: 14 }}>
          <Skeleton width="80%" height={12} />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <RowSkeleton key={i} cols={cols} />
      ))}
    </>
  );
}

export default Skeleton;
