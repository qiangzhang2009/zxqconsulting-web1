// Skeleton loading component
interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`admin-skeleton h-4 ${className}`} />
        ))}
      </>
    );
  }
  return <div className={`admin-skeleton ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="admin-card space-y-3">
      <div className="admin-skeleton h-4 w-1/3" />
      <div className="admin-skeleton h-8 w-2/3" />
      <div className="admin-skeleton h-3 w-1/2" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 admin-card">
          <div className="admin-skeleton w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="admin-skeleton h-4 w-1/3" />
            <div className="admin-skeleton h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}