// ReportAnalyticsPage — 报告互动分析
import { useState, useCallback, useEffect } from 'react';
import { TrendingUp, Heart, Share2, Eye, Users } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, type Column } from '../components/data-table/DataTable';
import { CardSkeleton } from '../components/ui/Skeleton';
import { fmtNumber, fmtCompact, cn } from '@/apps/admin/lib/format';
import { api } from '../services/api';

interface ReportInteractionItem {
  report_id: string;
  likes: number;
  shares: number;
  views: number;
  unique_visitors: number;
  read_sessions: number;
  avg_read_seconds: number;
  max_read_seconds: number;
  avg_scroll: number;
}

const LIMIT = 20;

export function ReportAnalyticsPage() {
  const [data, setData] = useState<{
    days: number;
    totals: {
      likes: number;
      shares: number;
      views: number;
      read_sessions: number;
      unique_visitors: number;
    };
    items: ReportInteractionItem[];
    trend: Array<{ date: string; likes: number; shares: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getReportInteractions({ days: 30 });
      if ('totals' in res && 'items' in res) {
        setData(res as any);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: Column<ReportInteractionItem>[] = [
    {
      key: 'report_id',
      header: '报告 ID',
      width: '160px',
      render: (r) => (
        <span className="font-mono text-xs text-zinc-400">{r.report_id.slice(0, 16)}…</span>
      ),
    },
    {
      key: 'likes',
      header: '点赞',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Heart size={12} className="text-rose-400" />
          <span className="font-semibold text-rose-400">{fmtCompact(r.likes)}</span>
        </div>
      ),
    },
    {
      key: 'shares',
      header: '分享',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Share2 size={12} className="text-blue-400" />
          <span className="font-semibold text-blue-400">{fmtCompact(r.shares)}</span>
        </div>
      ),
    },
    {
      key: 'views',
      header: '阅读',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Eye size={12} className="text-zinc-500" />
          <span className="text-white">{fmtCompact(r.views)}</span>
        </div>
      ),
    },
    {
      key: 'unique_visitors',
      header: '独立访客',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Users size={12} className="text-zinc-500" />
          <span className="text-zinc-300">{fmtCompact(r.unique_visitors)}</span>
        </div>
      ),
    },
    {
      key: 'avg_read_seconds',
      header: '平均阅读时长',
      align: 'right',
      render: (r) => (
        <span className="text-zinc-400">
          {r.avg_read_seconds > 0 ? `${(r.avg_read_seconds / 60).toFixed(1)}m` : '—'}
        </span>
      ),
    },
    {
      key: 'avg_scroll',
      header: '平均滚动%',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              style={{ width: `${Math.min(100, r.avg_scroll || 0)}%` }}
            />
          </div>
          <span className="text-xs text-zinc-400 w-8">{(r.avg_scroll || 0).toFixed(0)}%</span>
        </div>
      ),
    },
  ];

  // SVG line chart for trend
  const renderTrendChart = () => {
    if (!data?.trend || data.trend.length === 0) return null;
    const points = data.trend;
    const maxVal = Math.max(...points.map(p => Math.max(p.likes, p.shares)), 1);
    const W = 600, H = 120, PAD = 10;
    const step = (W - PAD * 2) / Math.max(points.length - 1, 1);
    const toY = (v: number) => H - PAD - ((v / maxVal) * (H - PAD * 2));

    const likesPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${PAD + i * step},${toY(p.likes)}`).join(' ');
    const sharesPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${PAD + i * step},${toY(p.shares)}`).join(' ');

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32" preserveAspectRatio="none">
        <defs>
          <linearGradient id="likesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sharesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fills */}
        <path d={likesPath + ` L${PAD + (points.length - 1) * step},${H} L${PAD},${H} Z`} fill="url(#likesGrad)" />
        <path d={sharesPath + ` L${PAD + (points.length - 1) * step},${H} L${PAD},${H} Z`} fill="url(#sharesGrad)" />
        {/* Lines */}
        <path d={likesPath} fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
        <path d={sharesPath} fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
        {/* Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={PAD + i * step} cy={toY(p.likes)} r="3" fill="#f87171" />
            <circle cx={PAD + i * step} cy={toY(p.shares)} r="3" fill="#60a5fa" />
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="admin-content">
      <PageHeader
        eyebrow="内容分析"
        title="报告互动"
        icon={<TrendingUp size={20} />}
        metrics={data ? [
          { label: '总点赞', value: fmtNumber(data.totals.likes), accent: 'rose' },
          { label: '总分享', value: fmtNumber(data.totals.shares), accent: 'blue' },
          { label: '总阅读', value: fmtNumber(data.totals.views), accent: 'emerald' },
          { label: '独立访客', value: fmtNumber(data.totals.unique_visitors), accent: 'purple' },
        ] : undefined}
      />

      {loading && !data ? (
        <div className="admin-grid admin-grid-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} height={80} />)}
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Trend chart */}
          <div className="admin-card">
            <div className="admin-section-title">互动趋势（{data.days} 天）</div>
            {data.trend && data.trend.length > 0 ? (
              <>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="text-xs text-zinc-400">点赞</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <span className="text-xs text-zinc-400">分享</span>
                  </div>
                </div>
                {renderTrendChart()}
                <div className="flex justify-between text-xs text-zinc-600 mt-1">
                  <span>{data.trend[0]?.date || ''}</span>
                  <span>{data.trend[data.trend.length - 1]?.date || ''}</span>
                </div>
              </>
            ) : (
              <div className="text-sm text-zinc-500 py-8 text-center">暂无趋势数据</div>
            )}
          </div>

          {/* Detail table */}
          <DataTable
            data={data.items ?? []}
            columns={columns}
            loading={loading}
            searchPlaceholder="搜索报告..."
            emptyTitle="暂无互动数据"
            emptyDescription="暂无报告互动记录"
          />
        </div>
      ) : null}
    </div>
  );
}

export default ReportAnalyticsPage;
