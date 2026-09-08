// ResearchPage — 研究报告分析
import { useState, useCallback, useEffect } from 'react';
import { BarChart3, Clock, Globe, FileText, Eye, Download, ExternalLink } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, type Column } from '../components/data-table/DataTable';
import { CardSkeleton } from '../components/ui/Skeleton';
import { fmtNumber, fmtCompact, cn } from '@/apps/admin/lib/format';
import { api } from '../services/api';
import type { ReportStats } from '../types/admin';

const LIMIT = 20;

export function ResearchPage() {
  const [data, setData] = useState<{
    overview: {
      todayPageviews: number;
      todayVisitors: number;
      totalPageviews: number;
      totalUniqueVisitors: number;
      totalCountries: number;
      totalReports: number;
      avgReadTime: number | null;
    };
    reports: ReportStats[];
    trafficSources: Array<{ traffic_source: string; pageviews: number; visitors: number }>;
    devices: Array<{ device_type: string; pageviews: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getResearchAnalytics({ days: 30 });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: Column<ReportStats>[] = [
    {
      key: 'title',
      header: '报告',
      render: (r) => (
        <div className="space-y-0.5 max-w-xs">
          <div className="text-sm font-medium text-white truncate">{r.title}</div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{r.region}</span>
            <span>·</span>
            <span>{r.category}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'pageviews',
      header: '浏览量',
      align: 'right',
      render: (r) => (
        <span className="font-semibold text-white">{fmtCompact(r.pageviews)}</span>
      ),
    },
    {
      key: 'unique_visitors',
      header: '访客数',
      align: 'right',
      render: (r) => (
        <span className="text-zinc-400">{fmtCompact(r.unique_visitors)}</span>
      ),
    },
    {
      key: 'downloads',
      header: '下载',
      align: 'right',
      render: (r) => (
        <span className={cn(
          'font-semibold',
          (r.downloads ?? 0) > 0 ? 'text-emerald-400' : 'text-zinc-500'
        )}>
          {r.downloads ?? 0}
        </span>
      ),
    },
    {
      key: 'externals',
      header: '外链',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <ExternalLink size={11} className="text-zinc-500" />
          <span className="text-zinc-400">{r.externals ?? 0}</span>
        </div>
      ),
    },
    {
      key: 'countries_reached',
      header: '国家数',
      align: 'right',
      render: (r) => (
        <span className="text-zinc-400">{r.countries_reached ?? 0}</span>
      ),
    },
  ];

  const maxTraffic = data?.trafficSources?.length
    ? Math.max(...data.trafficSources.map(s => s.pageviews))
    : 0;

  const maxDevice = data?.devices?.length
    ? Math.max(...data.devices.map(d => d.pageviews))
    : 0;

  const avgReadTimeStr = data?.overview.avgReadTime != null
    ? `${(data.overview.avgReadTime / 60).toFixed(1)} 分钟`
    : '—';

  return (
    <div className="admin-content">
      <PageHeader
        eyebrow="内容分析"
        title="研究报告"
        icon={<BarChart3 size={20} />}
        metrics={data ? [
          { label: '总浏览量', value: fmtNumber(data.overview.totalPageviews), accent: 'emerald' },
          { label: '总访客', value: fmtNumber(data.overview.totalUniqueVisitors), accent: 'blue' },
          { label: '国家覆盖', value: fmtNumber(data.overview.totalCountries), accent: 'purple' },
          { label: '报告数', value: fmtNumber(data.overview.totalReports), accent: 'amber' },
          { label: '平均阅读时长', value: avgReadTimeStr, accent: 'cyan' },
        ] : undefined}
      />

      {loading && !data ? (
        <div className="admin-grid admin-grid-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} height={80} />)}
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Traffic sources */}
          <div className="admin-card">
            <div className="admin-section-title">流量来源分布</div>
            {data.trafficSources.length > 0 ? (
              <div className="space-y-2">
                {data.trafficSources.map((s) => (
                  <div key={s.traffic_source} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-zinc-400 truncate flex-shrink-0">
                      {s.traffic_source || '直接访问'}
                    </div>
                    <div className="flex-1 h-6 bg-white/[0.04] rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md bg-gradient-to-r from-emerald-500/60 to-emerald-400/80"
                        style={{ width: `${maxTraffic > 0 ? (s.pageviews / maxTraffic) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-xs text-white font-medium">
                      {fmtCompact(s.pageviews)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-zinc-500 py-4 text-center">暂无数据</div>
            )}
          </div>

          {/* Devices */}
          <div className="admin-card">
            <div className="admin-section-title">设备分布</div>
            {data.devices.length > 0 ? (
              <div className="flex items-end gap-3 h-28">
                {data.devices.map((d) => (
                  <div key={d.device_type} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-20">
                      <div
                        className="w-full max-w-20 rounded-t-md bg-gradient-to-t from-blue-500/60 to-sky-400/80"
                        style={{ height: `${maxDevice > 0 ? (d.pageviews / maxDevice) * 100 : 0}%`, minHeight: 4 }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400 capitalize">{d.device_type || '未知'}</span>
                    <span className="text-xs font-semibold text-white">{fmtCompact(d.pageviews)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-zinc-500 py-4 text-center">暂无数据</div>
            )}
          </div>

          {/* Reports table */}
          <DataTable
            data={data.reports}
            columns={columns}
            loading={loading}
            searchPlaceholder="搜索报告..."
            emptyTitle="暂无报告数据"
            emptyDescription="暂无研究报告数据"
          />
        </div>
      ) : null}
    </div>
  );
}

export default ResearchPage;
