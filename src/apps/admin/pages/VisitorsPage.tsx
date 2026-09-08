// VisitorsPage — 访客列表
import { useState, useCallback, useEffect } from 'react';
import { Users, Monitor, Smartphone, Tablet, Globe } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, type Column } from '../components/data-table/DataTable';
import { CardSkeleton } from '../components/ui/Skeleton';
import { fmtRelative, fmtNumber, countryFlag, cn } from '@/apps/admin/lib/format';
import { api } from '../services/api';
import type { Visitor } from '../types/admin';

const LIMIT = 15;

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  desktop: <Monitor size={14} className="text-blue-400" />,
  mobile: <Smartphone size={14} className="text-emerald-400" />,
  tablet: <Tablet size={14} className="text-purple-400" />,
};

export function VisitorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<{ total: number; data: Visitor[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const res = await api.getVisitors({ page: p, limit: LIMIT, search: q });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, '');
  }, [fetchData]);

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
    fetchData(1, v);
  }, [fetchData]);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    fetchData(p, search);
  }, [fetchData, search]);

  // Derive today's visitor count from first_visit dates
  const todayVisitors = data?.data
    ? data.data.filter(v => {
        if (!v.first_visit) return false;
        const d = new Date(v.first_visit);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      }).length
    : 0;

  const columns: Column<Visitor>[] = [
    {
      key: 'visitor_id',
      header: '访客 ID',
      width: '140px',
      render: (v) => (
        <div className="font-mono text-xs text-zinc-400">
          {v.visitor_id ? v.visitor_id.slice(0, 12) + '…' : '—'}
        </div>
      ),
    },
    {
      key: 'contact',
      header: '联系信息',
      render: (v) => (
        <div className="space-y-0.5">
          <div className="text-sm text-white">{v.contact_name || v.company_name || '匿名访客'}</div>
          {v.email && <div className="text-xs text-zinc-500">{v.email}</div>}
        </div>
      ),
    },
    {
      key: 'device',
      header: '设备',
      width: '90px',
      align: 'center',
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5" title={v.device || '未知'}>
          {DEVICE_ICONS[v.device_type?.toLowerCase() || ''] || <Globe size={14} className="text-zinc-500" />}
          <span className="text-xs text-zinc-500">{v.device_type || '—'}</span>
        </div>
      ),
    },
    {
      key: 'source',
      header: '来源',
      width: '100px',
      render: (v) => (
        <span className={cn('admin-badge', v.source ? 'info' : 'neutral')}>
          {v.source || '直接访问'}
        </span>
      ),
    },
    {
      key: 'location',
      header: '位置',
      render: (v) => (
        <div className="text-sm">
          {countryFlag(v.country)} {v.city || v.region || v.country || '未知'}
          {v.region && v.country && v.city ? `, ${v.region}` : ''}
        </div>
      ),
    },
    {
      key: 'visit_count',
      header: '访问次数',
      width: '80px',
      align: 'center',
      render: (v) => (
        <span className={cn(
          'font-bold',
          (v.visit_count ?? 0) > 5 ? 'text-emerald-400' :
          (v.visit_count ?? 0) > 1 ? 'text-white' : 'text-zinc-400'
        )}>
          {v.visit_count ?? 0}
        </span>
      ),
    },
    {
      key: 'first_visit',
      header: '首次访问',
      width: '110px',
      render: (v) => (
        <span className="text-xs text-zinc-500">{fmtRelative(v.first_visit)}</span>
      ),
    },
    {
      key: 'last_visit',
      header: '最后访问',
      width: '110px',
      render: (v) => (
        <span className="text-xs text-zinc-500">{fmtRelative(v.last_visit)}</span>
      ),
    },
  ];

  // Top sources
  const topSources = data?.data
    ? Object.entries(
        data.data.reduce<Record<string, number>>((acc, v) => {
          const s = v.source || '直接访问';
          acc[s] = (acc[s] || 0) + 1;
          return acc;
        }, {})
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  return (
    <div className="admin-content">
      <PageHeader
        eyebrow="用户分析"
        title="访客管理"
        icon={<Users size={20} />}
        metrics={data ? [
          { label: '总访客数', value: fmtNumber(data.total), accent: 'emerald' },
          { label: '今日访客', value: todayVisitors, accent: 'blue' },
          { label: '数据条目', value: data.data.length, accent: 'emerald' },
        ] : undefined}
      />

      {loading && !data ? (
        <div className="admin-grid admin-grid-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} height={80} />)}
        </div>
      ) : (
        <>
          {/* Top sources panel */}
          {topSources.length > 0 && (
            <div className="admin-card admin-mb-4">
              <div className="admin-section-title">来源分布</div>
              <div className="flex flex-wrap gap-2">
                {topSources.map(([src, cnt]) => (
                  <div key={src} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-[var(--admin-border)]">
                    <span className="text-xs text-zinc-400">{src}</span>
                    <span className="text-sm font-semibold text-white">{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DataTable
            data={data?.data ?? []}
            columns={columns}
            loading={loading}
            pagination={{
              page,
              limit: LIMIT,
              total: data?.total ?? 0,
              onPageChange: handlePageChange,
            }}
            searchValue={search}
            onSearchChange={handleSearch}
            searchPlaceholder="搜索访客、公司..."
            emptyTitle="暂无访客数据"
            emptyDescription="暂无访客记录"
          />
        </>
      )}
    </div>
  );
}

export default VisitorsPage;
