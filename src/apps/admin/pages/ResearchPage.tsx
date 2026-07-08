// Research Analytics Page
import { useState } from 'react';
import { BarChart3, FileText, Users, Globe2, TrendingUp, Eye, Download } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { KPICard } from '../components/ui/KPICard';
import { AreaChart } from '../components/charts/AreaChart';
import { DonutChart } from '../components/charts/DonutChart';
import { BarChart } from '../components/charts/BarChart';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useResearchAnalytics } from '../hooks/useAdminData';

const COUNTRY_FLAG: Record<string, string> = {
  CN: '🇨🇳', HK: '🇭🇰', TW: '🇹🇼', SG: '🇸🇬', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪',
  JP: '🇯🇵', KR: '🇰🇷', AU: '🇦🇺', FR: '🇫🇷', MY: '🇲🇾', TH: '🇹🇭', IN: '🇮🇳',
  AE: '🇦🇪', CA: '🇨🇦', NL: '🇳🇱', CH: '🇨🇭', BR: '🇧🇷', MX: '🇲🇽', ID: '🇮🇩',
};

export function ResearchPage() {
  const [days, setDays] = useState(30);
  const { data, loading } = useResearchAnalytics(days);

  if (loading || !data) {
    return (
      <>
        <PageHeader title="研究分析" description="研究报告访问与互动数据" icon={<BarChart3 size={18} className="text-emerald-400" />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="研究报告分析"
        description={`${data.overview.totalReports} 份报告 · ${days} 天数据`}
        icon={<BarChart3 size={18} className="text-emerald-400" />}
        actions={
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-border)]">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  days === d
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {d}天
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="总阅读量"
          value={data.overview.totalPageviews}
          accent="emerald"
          icon={<Eye size={18} />}
          description={`今日: ${data.overview.todayPageviews}`}
        />
        <KPICard
          label="独立访客"
          value={data.overview.totalUniqueVisitors}
          accent="blue"
          icon={<Users size={18} />}
          description={`今日: ${data.overview.todayVisitors}`}
        />
        <KPICard
          label="覆盖国家"
          value={data.overview.totalCountries}
          accent="amber"
          icon={<Globe2 size={18} />}
        />
        <KPICard
          label="研究报告"
          value={data.overview.totalReports}
          accent="purple"
          icon={<FileText size={18} />}
        />
      </div>

      {/* Trend Chart */}
      <div className="admin-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">阅读量趋势</h3>
            <p className="text-xs text-zinc-500 mt-0.5">各报告每日阅读量</p>
          </div>
        </div>
      <AreaChart
        data={data.trend.map(t => ({ date: String(t.date) }))}
        series={data.reports.slice(0, 4).map((r, i) => ({
          key: r.id,
          label: r.title,
          color: ['#34d399', '#60a5fa', '#fbbf24', '#a78bfa'][i],
        }))}
        height={280}
      />
      </div>

      {/* Reports Table */}
      <div className="admin-card mb-6">
        <h3 className="text-sm font-semibold text-white mb-4">报告详细数据</h3>
        <div className="overflow-x-auto -mx-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--admin-border)]">
                {['报告', '地区', '分类', 'PV', 'UV', '国家', '下载', '外部'].map((h, i) => (
                  <th key={i} className={`px-4 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest ${i >= 3 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.reports.map((r) => (
                <tr key={r.id} className="border-b border-[var(--admin-border)]/40 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-sm text-white max-w-[260px] truncate">{r.title}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{r.region}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {r.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-white text-right">{r.pageviews}</td>
                  <td className="px-4 py-3 text-sm text-zinc-300 text-right">{r.unique_visitors}</td>
                  <td className="px-4 py-3 text-sm text-zinc-300 text-right">{r.countries_reached}</td>
                  <td className="px-4 py-3 text-sm text-zinc-300 text-right">{r.downloads}</td>
                  <td className="px-4 py-3 text-sm text-zinc-300 text-right">{r.externals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Traffic Sources */}
        <div className="admin-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white">流量来源</h3>
          </div>
          <BarChart
            data={(data.trafficSources || []).slice(0, 6).map((s) => ({
              label: s.traffic_source || '未知',
              value: s.pageviews,
              color: '#60a5fa',
            }))}
            height={170}
          />
        </div>

        {/* Devices */}
        <div className="admin-card">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={14} className="text-purple-400" />
            <h3 className="text-sm font-semibold text-white">设备分布</h3>
          </div>
          <DonutChart
            data={(data.devices || []).slice(0, 5).map((d, i) => ({
              label: d.device_type || '未知',
              value: d.pageviews,
              color: ['#34d399', '#60a5fa', '#fbbf24', '#a78bfa', '#f472b6'][i % 5],
            }))}
            size={120}
          />
        </div>

        {/* Recent Visitors */}
        <div className="admin-card">
          <div className="flex items-center gap-2 mb-4">
            <Users size={14} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">最近访客</h3>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {(data.recentVisitors || []).slice(0, 8).map((v, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-xs py-1.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span>{COUNTRY_FLAG[v.country] || '🌐'}</span>
                  <span className="text-zinc-300 truncate">
                    {v.city || v.region || v.country}
                  </span>
                </div>
                <span className="text-zinc-600 text-[10px]">
                  {new Date(v.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}