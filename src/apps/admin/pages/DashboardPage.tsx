// Dashboard Page - Overview
import { useState } from 'react';
import {
  Users, FileText, Brain,
  Globe2, TrendingUp, Activity, Sparkles, Globe,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { KPICard } from '../components/ui/KPICard';
import { AreaChart } from '../components/charts/AreaChart';
import { DonutChart } from '../components/charts/DonutChart';
import { BarChart } from '../components/charts/BarChart';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useAnalytics } from '../hooks/useAdminData';

const COUNTRY_FLAG: Record<string, string> = {
  CN: '🇨🇳', HK: '🇭🇰', TW: '🇹🇼', SG: '🇸🇬', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪',
  JP: '🇯🇵', KR: '🇰🇷', AU: '🇦🇺', FR: '🇫🇷', MY: '🇲🇾', TH: '🇹🇭', IN: '🇮🇳',
  AE: '🇦🇪', CA: '🇨🇦', NL: '🇳🇱', CH: '🇨🇭', BR: '🇧🇷', MX: '🇲🇽', ID: '🇮🇩',
};

const STATUS_COLORS: Record<string, string> = {
  new: '#60a5fa',
  contacted: '#fbbf24',
  qualified: '#34d399',
  closed: '#71717a',
};

export function DashboardPage() {
  const [days, setDays] = useState(30);
  const { data, loading, refetch } = useAnalytics(days);

  if (loading || !data) {
    return (
      <>
        <PageHeader title="概览" description="实时业务数据与分析" icon={<Activity size={18} className="text-emerald-400" />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </>
    );
  }

  const statusData = Object.entries(data.statusBreakdown || {}).map(([key, value]) => ({
    label: { new: '新提交', contacted: '已联系', qualified: '已合格', closed: '已关闭' }[key] || key,
    value,
    color: STATUS_COLORS[key] || '#71717a',
  }));

  return (
    <>
      <PageHeader
        title="概览仪表盘"
        description={`最近 ${days} 天的业务数据`}
        icon={<Activity size={18} className="text-emerald-400" />}
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
            <button
              onClick={refetch}
              className="ml-1 px-2 py-1 rounded-md text-xs text-zinc-500 hover:text-white transition-colors"
              title="刷新"
            >
              ↻
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="今日访客"
          value={data.today.visitors}
          accent="emerald"
          icon={<Users size={18} />}
          description={`总访客: ${data.total.visitors.toLocaleString()}`}
        />
        <KPICard
          label="今日提交"
          value={data.today.submissions}
          accent="blue"
          icon={<FileText size={18} />}
          description={`总提交: ${data.total.submissions.toLocaleString()}`}
        />
      <KPICard
        label="总转化率"
        value={data.total.conversionRate}
        suffix="%"
        decimals={2}
        accent="amber"
        icon={<TrendingUp size={18} />}
        description="访客→提交转化"
      />
        <KPICard
          label="AI 诊断"
          value={data.recentReports?.length || 0}
          accent="purple"
          icon={<Brain size={18} />}
          description="最近诊断报告数"
        />
      </div>

      {/* Trend Chart */}
      <div className="admin-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">访客与提交趋势</h3>
            <p className="text-xs text-zinc-500 mt-0.5">每日访客和提交数量变化</p>
          </div>
        </div>
        <AreaChart
          data={data.trend}
          series={[
            { key: 'visitors', label: '访客', color: '#34d399' },
            { key: 'submissions', label: '提交', color: '#60a5fa' },
          ]}
          height={260}
        />
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Status Breakdown */}
        <div className="admin-card">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">提交状态分布</h3>
          </div>
          <DonutChart
            data={statusData.length ? statusData : [{ label: '暂无数据', value: 1, color: '#3f3f46' }]}
            size={140}
          />
        </div>

        {/* Top Countries */}
        <div className="admin-card">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={14} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white">访客来源地区</h3>
          </div>
          <BarChart
            data={(data.topCountries || []).slice(0, 6).map((c) => ({
              label: `${COUNTRY_FLAG[c.country] || '🌐'} ${c.country || '未知'}`,
              value: c.visitors,
              color: '#60a5fa',
            }))}
            height={170}
          />
        </div>

        {/* Top Sources */}
        <div className="admin-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">流量来源</h3>
          </div>
          <BarChart
            data={(data.topSources || []).slice(0, 6).map((s) => ({
              label: s.source === 'direct' ? '🖱 直接访问' :
                     s.source === 'search' ? '🔍 搜索引擎' :
                     s.source === 'social' ? '📱 社交媒体' :
                     s.source === 'internal' ? '🔗 内部跳转' : `🔗 ${s.source}`,
              value: s.count,
              color: '#fbbf24',
            }))}
            height={170}
          />
        </div>
      </div>


      {/* Top Markets & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Markets */}
        <div className="admin-card">
          <h3 className="text-sm font-semibold text-white mb-4">热门诊断市场</h3>
          {data.topMarkets && data.topMarkets.length > 0 ? (
            <div className="space-y-3">
              {data.topMarkets.slice(0, 8).map((m, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-zinc-300 truncate">{m.market_name || m.market_id}</span>
                  </div>
                  <span className="text-white font-medium ml-2">{m.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-600 text-xs">暂无数据</div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="admin-card">
          <h3 className="text-sm font-semibold text-white mb-4">最近诊断报告</h3>
          {data.recentReports && data.recentReports.length > 0 ? (
            <div className="space-y-3">
              {data.recentReports.slice(0, 5).map((r, i) => {
                const score = r.diagnosis_report?.opportunityScore || 0;
                const scoreColor = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400';
                return (
                  <div key={i} className="flex items-center justify-between gap-3 text-sm py-2 border-b border-[var(--admin-border)]/40 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-white truncate">
                        {r.market_name || r.market_name_en || r.market_id}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5 truncate">
                        {r.category} · {new Date(r.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className={`text-base font-bold ${scoreColor}`}>
                      {score}<span className="text-xs text-zinc-600">/100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-600 text-xs">暂无诊断报告</div>
          )}
        </div>
      </div>
    </>
  );
}