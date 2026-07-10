// 报告互动分析 - 点赞 / 转发 / 阅读时长
import { useEffect, useState } from 'react';
import { Heart, Share2, Eye, Clock, TrendingUp, MapPin, Activity } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { KPICard } from '../components/ui/KPICard';
import { CardSkeleton } from '../components/ui/Skeleton';
import { BarChart } from '../components/charts/BarChart';
import { api } from '../services/api';
import type { ReportInteractionItem, ReportInteractionDetail, ReportInteractionsResponse } from '../types/admin';
import { RESEARCH_REPORTS } from '@/data/researchReports';

const TITLE_MAP: Record<string, string> = Object.fromEntries(
  RESEARCH_REPORTS.map((r) => [r.id, r.title]),
);

function formatDuration(sec: number) {
  if (!sec || sec <= 0) return '0s';
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function tsToTime(ts: number) {
  if (!ts) return '-';
  return new Date(ts).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function ReportAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [aggregate, setAggregate] = useState<ReportInteractionsResponse | null>(null);
  const [detail, setDetail] = useState<ReportInteractionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadAggregate = async (d: number) => {
    setLoading(true);
    try {
      const data = await api.getReportInteractions({ days: d });
      if ('totals' in data) {
        setAggregate(data);
        // 默认选中第一份有数据的报告
        if (!selectedReport && data.items.length > 0) {
          setSelectedReport(data.items[0].report_id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (reportId: string) => {
    if (!reportId) {
      setDetail(null);
      return;
    }
    setLoadingDetail(true);
    try {
      const data = await api.getReportInteractions({ days, report_id: reportId });
      if ('summary' in data) setDetail(data);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadAggregate(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  useEffect(() => {
    loadDetail(selectedReport);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport, days]);

  if (loading || !aggregate) {
    return (
      <>
        <PageHeader
          title="报告互动分析"
          description="点赞 · 转发 · 阅读时长 · 受众分布"
          icon={<Heart size={18} className="text-rose-400" />}
        />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="报告互动分析"
        description="洞察每份研究报告的传播效果与读者参与度"
        icon={<Heart size={18} className="text-rose-400" />}
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
              onClick={() => loadAggregate(days)}
              className="ml-1 px-2 py-1 rounded-md text-xs text-zinc-500 hover:text-white"
              title="刷新"
            >
              ↻
            </button>
          </div>
        }
      />

      {/* Total KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KPICard
          label="总点赞"
          value={aggregate.totals.likes}
          accent="rose"
          icon={<Heart size={18} />}
        />
        <KPICard
          label="总转发"
          value={aggregate.totals.shares}
          accent="blue"
          icon={<Share2 size={18} />}
        />
        <KPICard
          label="总阅读"
          value={aggregate.totals.views}
          accent="emerald"
          icon={<Eye size={18} />}
        />
        <KPICard
          label="阅读会话"
          value={aggregate.totals.read_sessions}
          accent="amber"
          icon={<Activity size={18} />}
          description="至少 1 秒"
        />
        <KPICard
          label="独立访客"
          value={aggregate.totals.unique_visitors}
          accent="purple"
          icon={<MapPin size={18} />}
        />
      </div>

      {/* Per-report table */}
      <div className="admin-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">报告明细</h3>
          <span className="ml-auto text-xs text-zinc-500">点击行查看单份报告深度数据</span>
        </div>
        {aggregate.items.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 text-xs">暂无报告互动数据</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-border)]/60 text-[10px] uppercase tracking-widest text-zinc-500">
                  <th className="py-2 pr-3 text-left font-medium">报告</th>
                  <th className="py-2 px-3 text-right font-medium">点赞</th>
                  <th className="py-2 px-3 text-right font-medium">转发</th>
                  <th className="py-2 px-3 text-right font-medium">浏览</th>
                  <th className="py-2 px-3 text-right font-medium">阅读会话</th>
                  <th className="py-2 px-3 text-right font-medium">独立访客</th>
                  <th className="py-2 px-3 text-right font-medium">平均阅读</th>
                  <th className="py-2 px-3 text-right font-medium">最深阅读</th>
                  <th className="py-2 pl-3 text-right font-medium">滚动深度</th>
                </tr>
              </thead>
              <tbody>
                {aggregate.items.map((it) => (
                  <tr
                    key={it.report_id}
                    onClick={() => setSelectedReport(it.report_id)}
                    className={`border-b border-[var(--admin-border)]/30 cursor-pointer transition-colors ${
                      selectedReport === it.report_id
                        ? 'bg-emerald-500/10'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <td className="py-2.5 pr-3 text-left">
                      <div className="font-medium text-white truncate max-w-[320px]">
                        {TITLE_MAP[it.report_id] || it.report_id}
                      </div>
                      <div className="text-[10px] text-zinc-600 mt-0.5">{it.report_id}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-300 tabular-nums">{it.likes}</td>
                    <td className="py-2.5 px-3 text-right text-blue-300 tabular-nums">{it.shares}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-300 tabular-nums">{it.views}</td>
                    <td className="py-2.5 px-3 text-right text-amber-300 tabular-nums">{it.read_sessions}</td>
                    <td className="py-2.5 px-3 text-right text-purple-300 tabular-nums">{it.unique_visitors}</td>
                    <td className="py-2.5 px-3 text-right text-slate-200 tabular-nums">
                      {formatDuration(it.avg_read_seconds)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200 tabular-nums">
                      {formatDuration(it.max_read_seconds)}
                    </td>
                    <td className="py-2.5 pl-3 text-right text-slate-400 tabular-nums">
                      {it.avg_scroll ? `${it.avg_scroll}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected report detail */}
      {selectedReport && (
        <>
          {loadingDetail || !detail ? (
            <div className="admin-card">
              <CardSkeleton />
            </div>
          ) : (
            <>
              <div className="admin-card mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart size={14} className="text-rose-400" />
                  <h3 className="text-sm font-semibold text-white">
                    {TITLE_MAP[detail.report_id] || detail.report_id}
                  </h3>
                  <span className="ml-auto text-xs text-zinc-500">
                    最近 {detail.days} 天
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <DetailStat icon={<Heart size={14} className="text-rose-400" />} label="点赞" value={detail.summary.likes} />
                  <DetailStat icon={<Share2 size={14} className="text-blue-400" />} label="转发" value={detail.summary.shares} />
                  <DetailStat icon={<Eye size={14} className="text-emerald-400" />} label="浏览" value={detail.summary.views} />
                  <DetailStat icon={<MapPin size={14} className="text-purple-400" />} label="独立 IP" value={detail.summary.unique_visitors} />
                  <DetailStat icon={<Activity size={14} className="text-amber-400" />} label="阅读会话" value={detail.summary.read_sessions} />
                  <DetailStat icon={<Clock size={14} className="text-amber-300" />} label="平均阅读" value={formatDuration(detail.summary.avg_read_seconds)} />
                  <DetailStat icon={<Clock size={14} className="text-emerald-300" />} label="最长阅读" value={formatDuration(detail.summary.max_read_seconds)} />
                  <DetailStat icon={<TrendingUp size={14} className="text-blue-300" />} label="滚动深度" value={detail.summary.avg_scroll ? `${detail.summary.avg_scroll}%` : '-'} />
                </div>
              </div>

              {/* Top countries + read distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="admin-card">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={14} className="text-purple-400" />
                    <h3 className="text-sm font-semibold text-white">读者地域分布</h3>
                  </div>
                  {detail.top_countries.length > 0 ? (
                    <BarChart
                      data={detail.top_countries.map((c) => ({
                        label: c.country || '未知',
                        value: c.visitors,
                        color: '#a78bfa',
                      }))}
                      height={200}
                    />
                  ) : (
                    <div className="text-center py-8 text-zinc-600 text-xs">暂无地域数据</div>
                  )}
                </div>

                <div className="admin-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={14} className="text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">阅读时长 Top 10</h3>
                  </div>
                  {detail.sessions.length > 0 ? (
                    <div className="space-y-2">
                      {detail.sessions.slice(0, 10).map((s) => (
                        <div key={s.id} className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-base">
                              {({ CN: '🇨🇳', HK: '🇭🇰', TW: '🇹🇼', SG: '🇸🇬', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', JP: '🇯🇵', KR: '🇰🇷', AU: '🇦🇺' } as Record<string, string>)[s.country] || '🌐'}
                            </span>
                            <span className="text-zinc-300 truncate">
                              {s.country || '未知'}{s.city ? ` · ${s.city}` : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-amber-300 tabular-nums w-14 text-right">
                              {formatDuration(s.duration_seconds)}
                            </span>
                            <span className="text-zinc-500 tabular-nums w-10 text-right">
                              {s.max_scroll || 0}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-zinc-600 text-xs">暂无阅读会话</div>
                  )}
                </div>
              </div>

              {/* Recent events */}
              <div className="admin-card">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={14} className="text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">最近事件流</h3>
                  <span className="ml-auto text-xs text-zinc-500">最近 200 条</span>
                </div>
                {detail.recent_events.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[var(--admin-border)]/60 text-[10px] uppercase tracking-widest text-zinc-500">
                          <th className="py-2 pr-3 text-left font-medium">时间</th>
                          <th className="py-2 px-3 text-left font-medium">类型</th>
                          <th className="py-2 px-3 text-left font-medium">国家</th>
                          <th className="py-2 px-3 text-left font-medium">IP</th>
                          <th className="py-2 px-3 text-right font-medium">阅读时长</th>
                          <th className="py-2 pl-3 text-right font-medium">滚动</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.recent_events.slice(0, 60).map((e) => (
                          <tr key={e.id} className="border-b border-[var(--admin-border)]/20 hover:bg-white/[0.02]">
                            <td className="py-1.5 pr-3 text-zinc-400">{tsToTime(e.created_at)}</td>
                            <td className="py-1.5 px-3">
                              <EventTag type={e.event_type} />
                            </td>
                            <td className="py-1.5 px-3 text-zinc-300">{e.country || '-'}</td>
                            <td className="py-1.5 px-3 text-zinc-500 font-mono text-[10px]">
                              {e.ip ? e.ip.replace(/\.\d+\.\d+$/, '.***.***') : '-'}
                            </td>
                            <td className="py-1.5 px-3 text-right text-amber-300 tabular-nums">
                              {e.duration_seconds ? formatDuration(e.duration_seconds) : '-'}
                            </td>
                            <td className="py-1.5 pl-3 text-right text-zinc-400 tabular-nums">
                              {e.max_scroll || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-600 text-xs">暂无事件</div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

function DetailStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-lg font-semibold text-white tabular-nums">{value}</div>
    </div>
  );
}

function EventTag({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string }> = {
    like: { label: '点赞', color: 'bg-rose-500/15 text-rose-300' },
    unlike: { label: '取消赞', color: 'bg-zinc-500/15 text-zinc-400' },
    share: { label: '转发', color: 'bg-blue-500/15 text-blue-300' },
    view: { label: '浏览', color: 'bg-emerald-500/15 text-emerald-300' },
    read: { label: '阅读会话', color: 'bg-amber-500/15 text-amber-300' },
  };
  const cfg = map[type] || { label: type, color: 'bg-zinc-500/15 text-zinc-400' };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default ReportAnalyticsPage;