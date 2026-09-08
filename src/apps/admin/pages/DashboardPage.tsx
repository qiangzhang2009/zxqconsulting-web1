// DashboardPage — World-class operations console
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, FileText, Brain, Activity, TrendingUp, AlertCircle,
  ArrowUpRight, ArrowRight, Clock, CheckCircle, Circle,
  Inbox, MessageSquare, BarChart3, Heart,
  Sparkles, Target, Zap, ChevronRight,
  Globe2, TrendingDown, Calendar, ArrowUpRight as ExternalLink,
  Lightbulb, Bot, Gauge, FileBarChart,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { KPICard } from '../components/ui/KPICard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CardSkeleton, Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useAnalytics, useSubmissions } from '../hooks/useAdminData';
import type { Submission } from '../types/admin';
import { cn, fmtNumber, fmtPercent, countryFlag, fmtRelative, fmtDateTime } from '@/apps/admin/lib/format';

const COUNTRY_FLAG: Record<string, string> = {
  CN: '🇨🇳', HK: '🇭🇰', TW: '🇹🇼', SG: '🇸🇬', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪',
  JP: '🇯🇵', KR: '🇰🇷', AU: '🇦🇺', FR: '🇫🇷', MY: '🇲🇾', TH: '🇹🇭', IN: '🇮🇳',
  AE: '🇦🇪', CA: '🇨🇦', NL: '🇳🇱', CH: '🇨🇭', BR: '🇧🇷', MX: '🇲🇽', ID: '🇮🇩',
};

const STATUS_DOT = {
  new: 'bg-blue-400',
  contacted: 'bg-amber-400',
  qualified: 'bg-emerald-400',
  closed: 'bg-zinc-500',
};

// ============================================================
// Main page
// ============================================================
export function DashboardPage() {
  const [period, setPeriod] = useState(30);
  const { data, loading, refetch } = useAnalytics(period);
  const { data: submissions } = useSubmissions({ page: 1, limit: 5 });

  // Manual auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(() => refetch(), 60_000);
    return () => clearInterval(t);
  }, [refetch]);

  const statusBreakdown = useMemo(() => {
    if (!data?.statusBreakdown) return { new: 0, contacted: 0, qualified: 0, closed: 0 };
    return {
      new: data.statusBreakdown['new'] || 0,
      contacted: data.statusBreakdown['contacted'] || 0,
      qualified: data.statusBreakdown['qualified'] || 0,
      closed: data.statusBreakdown['closed'] || 0,
    };
  }, [data]);

  const totalLeads = statusBreakdown.new + statusBreakdown.contacted + statusBreakdown.qualified + statusBreakdown.closed;
  const totalData = data?.total || { conversionRate: 0, visitors: 0, submissions: 0 };
  const recentReports = data?.recentReports || [];
  const trend = data?.trend || [];
  const topCountries = data?.topCountries || [];
  const topMarkets = data?.topMarkets || [];
  const todayVisitors = data?.today?.visitors || 0;
  const todaySubs = data?.today?.submissions || 0;

  // Derived sparkline (last 14 days visitors)
  const sparkline = useMemo(() => {
    return trend.slice(-14).map((p) => Number(p.visitors || 0));
  }, [trend]);
  const sparklineSubs = useMemo(() => {
    return trend.slice(-14).map((p) => Number(p.submissions || 0));
  }, [trend]);

  // Lead → Qualified conversion
  const leadConversion = totalLeads > 0 ? (statusBreakdown.qualified / totalLeads) * 100 : 0;

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="概览仪表盘"
        description={`实时业务指标 · 数据更新于 ${fmtDateTime(new Date().toISOString())}`}
        icon={<Gauge size={18} />}
        actions={
          <div className="flex items-center gap-2">
            <PeriodSelector value={period} onChange={setPeriod} />
            <button
              onClick={() => refetch()}
              className="admin-btn ghost sm"
              title="刷新数据"
            >
              <Sparkles size={13} />
              刷新
            </button>
          </div>
        }
      />

      {/* ── KPI Strip ────────────────────────────────────────────── */}
      <section className="admin-grid admin-grid-4 admin-mb-6">
        <KPICard
          label="访客总数"
          value={totalData.visitors || 0}
          icon={<Users size={16} />}
          accent="emerald"
          delta={todayVisitors > 0 ? Math.min(45, Math.round((todayVisitors / Math.max(1, totalData.visitors)) * 100 * 1.4)) : null}
          deltaLabel="本日占比"
          sparkline={sparkline.length > 1 ? sparkline : undefined}
          description={
            <>
              <span className="text-white font-semibold">{fmtNumber(todayVisitors)}</span>
              <span className="text-zinc-500"> 位今日访客</span>
            </>
          }
        />
        <KPICard
          label="线索总数"
          value={totalData.submissions || 0}
          icon={<Inbox size={16} />}
          accent="blue"
          delta={todaySubs > 0 ? Math.round((todaySubs / Math.max(1, totalData.submissions)) * 100 * 1.6) : null}
          sparkline={sparklineSubs.length > 1 ? sparklineSubs : undefined}
          description={
            <>
              <span className="text-amber-400 font-semibold">{statusBreakdown.new}</span>
              <span className="text-zinc-500"> 条待跟进</span>
            </>
          }
        />
        <KPICard
          label="访客 → 线索转化率"
          value={Number(totalData.conversionRate.toFixed(2))}
          decimals={2}
          suffix="%"
          icon={<TrendingUp size={16} />}
          accent="amber"
          delta={null}
          description={
            <>
              <span className="text-emerald-400 font-semibold">{fmtPercent(leadConversion, 1)}</span>
              <span className="text-zinc-500"> 已合格占比</span>
            </>
          }
        />
        <KPICard
          label="AI 诊断报告"
          value={recentReports.length}
          icon={<Brain size={16} />}
          accent="purple"
          delta={null}
          description={
            <>
              <span className="text-emerald-400 font-semibold">
                {recentReports.filter((r) => r.qualification_decision?.leadTier === 'L1').length}
              </span>
              <span className="text-zinc-500"> 份 L1 高质量</span>
            </>
          }
        />
      </section>

      {/* ── Smart Insights + Pipeline ───────────────────────────── */}
      <section className="admin-grid admin-grid-3 admin-mb-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Smart insight banner */}
          <InsightsBanner
            todayVisitors={todayVisitors}
            todaySubs={todaySubs}
            statusBreakdown={statusBreakdown}
            conversionRate={totalData.conversionRate}
          />

          {/* Pipeline funnel */}
          <div className="admin-card admin-card-pad-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Target size={14} className="text-amber-400" />
                  线索漏斗
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  实时展示线索在各阶段的分布与转化情况 · 共 {fmtNumber(totalLeads)} 条
                </p>
              </div>
              <Link
                to="/admin/submissions"
                className="admin-btn ghost sm"
              >
                进入漏斗
                <ArrowRight size={12} />
              </Link>
            </div>
            <Funnel stages={[
              { key: 'new', label: '新线索', count: statusBreakdown.new, color: 'bg-blue-500', text: 'text-blue-400' },
              { key: 'contacted', label: '已联系', count: statusBreakdown.contacted, color: 'bg-amber-500', text: 'text-amber-400' },
              { key: 'qualified', label: '已合格', count: statusBreakdown.qualified, color: 'bg-emerald-500', text: 'text-emerald-400' },
              { key: 'closed', label: '已关闭', count: statusBreakdown.closed, color: 'bg-zinc-500', text: 'text-zinc-400' },
            ]} total={totalLeads} />
          </div>

          {/* Trend chart */}
          <div className="admin-card admin-card-pad-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BarChart3 size={14} className="text-blue-400" />
                  流量趋势
                </h3>
                <p className="text-xs text-zinc-500 mt-1">过去 {period} 天访客与线索的分布</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  访客
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                  线索
                </span>
              </div>
            </div>
            <DualLineChart data={trend} />
          </div>
        </div>

        {/* Right column: today tasks + lead sources */}
        <div className="space-y-6">
          {/* Today tasks */}
          <div className="admin-card admin-card-pad-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap size={14} className="text-amber-400" />
                今日待办
              </h3>
              <Link to="/admin/tasks" className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5">
                全部 <ChevronRight size={11} />
              </Link>
            </div>
            <TodayTasks statusBreakdown={statusBreakdown} totalLeads={totalLeads} recentReportsCount={recentReports.length} />
          </div>

          {/* Top markets */}
          <div className="admin-card admin-card-pad-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Globe2 size={14} className="text-cyan-400" />
                热门市场
              </h3>
              <Link to="/admin/diagnoses" className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5">
                详情 <ChevronRight size={11} />
              </Link>
            </div>
            <TopMarkets items={topMarkets} />
          </div>
        </div>
      </section>

      {/* ── Recent activity + geo + reports ─────────────────────── */}
      <section className="admin-grid admin-grid-3 admin-mb-6">
        {/* Recent leads */}
        <div className="admin-card admin-card-pad-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Inbox size={14} className="text-blue-400" />
              最新线索
            </h3>
            <Link to="/admin/submissions" className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5">
              查看全部 <ChevronRight size={11} />
            </Link>
          </div>
          <RecentLeads submissions={submissions?.data || []} loading={loading} />
        </div>

        {/* Top countries */}
        <div className="admin-card admin-card-pad-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe2 size={14} className="text-emerald-400" />
              访客来源 Top 5
            </h3>
            <Link to="/admin/visitors" className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5">
              详情 <ChevronRight size={11} />
            </Link>
          </div>
          <TopCountries items={topCountries.slice(0, 5)} total={totalData.visitors || 0} />
        </div>

        {/* Recent reports */}
        <div className="admin-card admin-card-pad-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Brain size={14} className="text-purple-400" />
              最新 AI 报告
            </h3>
            <Link to="/admin/diagnoses" className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5">
              全部 <ChevronRight size={11} />
            </Link>
          </div>
          <RecentReports reports={recentReports.slice(0, 4)} />
        </div>
      </section>

      {/* ── Quick actions ──────────────────────────────────────── */}
      <section className="admin-mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="admin-section-title">
            <Sparkles size={12} className="text-amber-400" />
            快捷入口
          </h3>
        </div>
        <div className="admin-grid admin-grid-4">
          <QuickAction icon={<Inbox size={18} />} label="线索管理" description={`${statusBreakdown.new} 条新线索待处理`} href="/admin/submissions" accent="blue" />
          <QuickAction icon={<MessageSquare size={18} />} label="客户采集" description="完整企业出海信息表" href="/admin/client-intake" accent="emerald" />
          <QuickAction icon={<FileBarChart size={18} />} label="研究报告" description="阅读数据 + 互动情况" href="/admin/research" accent="purple" />
          <QuickAction icon={<Heart size={18} />} label="报告互动" description="点赞 · 分享 · 阅读时长" href="/admin/report-analytics" accent="rose" />
        </div>
      </section>
    </>
  );
}

// ============================================================
// Sub-components
// ============================================================

function PeriodSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="admin-tabs">
      {[
        { key: 7, label: '7 天' },
        { key: 30, label: '30 天' },
        { key: 90, label: '90 天' },
      ].map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={cn('admin-tab', value === p.key && 'active')}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function InsightsBanner({
  todayVisitors,
  todaySubs,
  statusBreakdown,
  conversionRate,
}: {
  todayVisitors: number;
  todaySubs: number;
  statusBreakdown: Record<string, number>;
  conversionRate: number;
}) {
  const tips = useMemo(() => {
    const out: { icon: React.ReactNode; tone: string; title: string; desc: string }[] = [];
    if (statusBreakdown.new > 5) {
      out.push({
        icon: <AlertCircle size={14} />,
        tone: 'amber',
        title: `${statusBreakdown.new} 条新线索等待首次联系`,
        desc: '行业最佳实践:2 小时内首次响应可将转化率提升 21 倍',
      });
    }
    if (conversionRate < 1 && todayVisitors > 50) {
      out.push({
        icon: <TrendingDown size={14} />,
        tone: 'rose',
        title: '转化率低于行业基准',
        desc: '当前 ' + fmtPercent(conversionRate, 2) + ' · 行业基准 2.5%,建议优化落地页文案',
      });
    }
    if (todayVisitors === 0 && todaySubs === 0) {
      out.push({
        icon: <Lightbulb size={14} />,
        tone: 'cyan',
        title: '今日暂无流量',
        desc: '检查站点运行状态与 DNS 配置,或启动新一批内容投放',
      });
    }
    if (statusBreakdown.qualified >= 1) {
      out.push({
        icon: <CheckCircle size={14} />,
        tone: 'emerald',
        title: `${statusBreakdown.qualified} 条合格线索可进入项目阶段`,
        desc: '建议在 24 小时内启动项目立项流程,保持客户粘性',
      });
    }
    if (out.length === 0) {
      out.push({
        icon: <Bot size={14} />,
        tone: 'emerald',
        title: '系统运行正常',
        desc: '所有关键指标在健康区间内,继续监控流量与转化漏斗',
      });
    }
    return out;
  }, [todayVisitors, todaySubs, statusBreakdown, conversionRate]);

  const toneClass = {
    amber:   'from-amber-500/10  to-amber-500/0  border-amber-500/20 text-amber-300',
    rose:    'from-rose-500/10   to-rose-500/0   border-rose-500/20 text-rose-300',
    emerald: 'from-emerald-500/10 to-emerald-500/0 border-emerald-500/20 text-emerald-300',
    cyan:    'from-cyan-500/10   to-cyan-500/0   border-cyan-500/20 text-cyan-300',
  } as const;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="admin-section-title">
          <Bot size={12} className="text-emerald-400" />
          智能洞察
        </h3>
        <span className="text-[10px] text-zinc-500 ml-auto">{tips.length} 条建议</span>
      </div>
      {tips.map((tip, i) => (
        <div
          key={i}
          className={cn(
            'rounded-xl border p-3.5 bg-gradient-to-br flex items-start gap-3',
            toneClass[tip.tone as keyof typeof toneClass]
          )}
        >
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
            {tip.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white">{tip.title}</div>
            <div className="text-xs text-zinc-400 mt-0.5">{tip.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Funnel({
  stages,
  total,
}: {
  stages: Array<{ key: string; label: string; count: number; color: string; text: string }>;
  total: number;
}) {
  return (
    <div className="space-y-3">
      {stages.map((s, i) => {
        const pct = total > 0 ? (s.count / total) * 100 : 0;
        const width = Math.max(pct, 1.5);
        return (
          <div key={s.key}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', s.color)} />
                <span className="text-xs font-medium text-zinc-300">{s.label}</span>
                {i < stages.length - 1 && total > 0 && (
                  <span className="text-[10px] text-zinc-600">
                    · {fmtPercent(pct, 1)}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn('text-base font-bold', s.text)}>{fmtNumber(s.count)}</span>
              </div>
            </div>
            <div className="relative h-2 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-700', s.color)}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DualLineChart({ data }: { data: Array<{ date: string; visitors: number; submissions: number }> }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-zinc-600">
        暂无趋势数据
      </div>
    );
  }
  const w = 800;
  const h = 220;
  const pad = { l: 36, r: 16, t: 16, b: 28 };
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;

  const max = Math.max(
    1,
    ...data.map((d) => Number(d.visitors || 0)),
    ...data.map((d) => Number(d.submissions || 0))
  );
  const step = data.length > 1 ? chartW / (data.length - 1) : 0;

  const toPath = (key: 'visitors' | 'submissions') => {
    return data
      .map((d, i) => {
        const x = pad.l + i * step;
        const y = pad.t + chartH - (Number(d[key] || 0) / max) * chartH;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const toArea = (key: 'visitors' | 'submissions') => {
    const path = toPath(key);
    const first = pad.l;
    const last = pad.l + (data.length - 1) * step;
    return `${path} L ${last},${pad.t + chartH} L ${first},${pad.t + chartH} Z`;
  };

  // Y-axis ticks (4 levels)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((p) => Math.round(max * p));

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-auto">
        <defs>
          <linearGradient id="visitors-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="submissions-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {ticks.map((v, i) => {
          const y = pad.t + chartH - (v / max) * chartH;
          return (
            <g key={i}>
              <line
                x1={pad.l}
                x2={w - pad.r}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <text
                x={pad.l - 8}
                y={y + 3}
                fontSize="10"
                fill="rgba(161,167,180,0.6)"
                textAnchor="end"
                fontFamily="JetBrains Mono, ui-monospace, monospace"
              >
                {fmtNumber(v)}
              </text>
            </g>
          );
        })}

        {/* Areas */}
        <path d={toArea('visitors')} fill="url(#visitors-fill)" />
        <path d={toArea('submissions')} fill="url(#submissions-fill)" />

        {/* Lines */}
        <path d={toPath('visitors')} fill="none" stroke="#10b981" strokeWidth="1.75" strokeLinejoin="round" />
        <path d={toPath('submissions')} fill="none" stroke="#3b82f6" strokeWidth="1.75" strokeLinejoin="round" />

        {/* X labels — every Nth */}
        {data.map((d, i) => {
          if (data.length > 14 && i % Math.ceil(data.length / 7) !== 0) return null;
          const x = pad.l + i * step;
          const label = d.date.slice(5);
          return (
            <text
              key={i}
              x={x}
              y={h - 8}
              fontSize="10"
              fill="rgba(161,167,180,0.5)"
              textAnchor="middle"
              fontFamily="JetBrains Mono, ui-monospace, monospace"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function TodayTasks({
  statusBreakdown,
  totalLeads,
  recentReportsCount,
}: {
  statusBreakdown: Record<string, number>;
  totalLeads: number;
  recentReportsCount: number;
}) {
  const tasks = useMemo(() => {
    const out: Array<{ title: string; hint: string; href: string; tone: 'urgent' | 'high' | 'medium' | 'low' }> = [];
    if (statusBreakdown.new > 0) {
      out.push({
        title: `跟进 ${statusBreakdown.new} 条新线索`,
        hint: '今日 · 建议 2 小时内响应',
        href: '/admin/submissions',
        tone: 'urgent',
      });
    }
    if (statusBreakdown.contacted > 0) {
      out.push({
        title: `回访 ${statusBreakdown.contacted} 条已联系线索`,
        hint: '检查沟通进展 · 推进至合格',
        href: '/admin/submissions',
        tone: 'high',
      });
    }
    if (recentReportsCount > 0) {
      out.push({
        title: `${recentReportsCount} 份 AI 报告待分级`,
        hint: '点击进入 AI 诊断中心',
        href: '/admin/diagnoses',
        tone: 'medium',
      });
    }
    if (totalLeads === 0) {
      out.push({
        title: '线索漏斗暂无数据',
        hint: '检查站点表单或推广渠道',
        href: '/admin/settings',
        tone: 'low',
      });
    }
    if (out.length === 0) {
      out.push({
        title: '今日任务清空 ✓',
        hint: '所有关键任务已完成',
        href: '/admin',
        tone: 'low',
      });
    }
    return out;
  }, [statusBreakdown, totalLeads, recentReportsCount]);

  return (
    <ul className="space-y-2">
      {tasks.map((t, i) => (
        <li key={i}>
          <Link
            to={t.href}
            className="block rounded-lg border border-zinc-800/60 bg-white/[0.015] hover:bg-white/[0.04] hover:border-zinc-700 transition-all p-2.5"
          >
            <div className="flex items-start gap-2">
              <Circle size={14} className={cn(
                'shrink-0 mt-0.5',
                t.tone === 'urgent' && 'text-rose-400',
                t.tone === 'high' && 'text-amber-400',
                t.tone === 'medium' && 'text-blue-400',
                t.tone === 'low' && 'text-zinc-500'
              )} />
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium text-white">{t.title}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{t.hint}</div>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function TopMarkets({ items }: { items: Array<{ market_id: string; market_name: string; count: number }> }) {
  if (!items.length) {
    return <div className="text-center py-6 text-xs text-zinc-600">暂无数据</div>;
  }
  const total = items.reduce((sum, i) => sum + (i.count || 0), 0);
  return (
    <ul className="space-y-2.5">
      {items.slice(0, 5).map((m, i) => {
        const pct = total > 0 ? (m.count / total) * 100 : 0;
        return (
          <li key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-300 truncate">{m.market_name || m.market_id}</span>
              <span className="text-[11px] font-mono text-zinc-500">{m.count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${Math.max(pct, 2)}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function RecentLeads({ submissions, loading }: { submissions: Submission[]; loading: boolean }) {
  if (loading && submissions.length === 0) {
    return (
      <ul className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 p-2">
            <Skeleton width={32} height={32} radius={8} />
            <div className="flex-1">
              <Skeleton width="60%" height={12} />
              <Skeleton width="40%" height={10} className="mt-1.5" />
            </div>
          </li>
        ))}
      </ul>
    );
  }
  if (!submissions.length) {
    return <EmptyState icon={<Inbox size={20} />} title="暂无线索" description="客户提交后会出现在这里" />;
  }
  return (
    <ul className="space-y-1.5">
      {submissions.slice(0, 5).map((lead) => (
        <li key={lead.id}>
          <Link
            to="/admin/submissions"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700/40 to-slate-800/30 border border-white/[0.06] flex items-center justify-center text-zinc-300 text-xs font-semibold shrink-0">
              {(lead.name || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-medium text-white truncate">
                {lead.name || '匿名访客'}
              </div>
              <div className="text-[11px] text-zinc-500 truncate">
                {lead.company || lead.email || '—'}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <StatusBadge status={lead.status} size="sm" />
              <span className="text-[10px] text-zinc-600">{fmtRelative(lead.created_at)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function TopCountries({
  items,
  total,
}: {
  items: Array<{ country: string; visitors: number }>;
  total: number;
}) {
  if (!items.length) {
    return <div className="text-center py-6 text-xs text-zinc-600">暂无访客来源</div>;
  }
  return (
    <ul className="space-y-2">
      {items.map((c, i) => {
        const pct = total > 0 ? (c.visitors / total) * 100 : 0;
        return (
          <li key={c.country + i} className="flex items-center gap-3">
            <span className="text-lg w-6 text-center">{COUNTRY_FLAG[c.country] || '🌐'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-200">{c.country || '未知'}</span>
                <span className="text-xs font-mono font-semibold text-white">{fmtNumber(c.visitors)}</span>
              </div>
              <div className="h-1 mt-1 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function RecentReports({ reports }: { reports: any[] }) {
  if (!reports.length) {
    return <div className="text-center py-6 text-xs text-zinc-600">暂无报告</div>;
  }
  return (
    <ul className="space-y-2">
      {reports.map((r) => {
        const tier = r.qualification_decision?.leadTier || 'L3';
        const score = r.diagnosis_report?.opportunityScore || 0;
        return (
          <li key={r.id}>
            <Link
              to="/admin/diagnoses"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                tier === 'L1' && 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
                tier === 'L2' && 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
                tier === 'L3' && 'bg-zinc-700/30 text-zinc-400 border border-zinc-700/50'
              )}>
                {tier}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium text-white truncate">
                  {r.market_name || r.market_id || '未命名市场'}
                </div>
                <div className="text-[11px] text-zinc-500 truncate">
                  {r.country || '—'} · {fmtRelative(r.created_at)}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[12px] font-mono font-bold text-emerald-400">{score}</div>
                <div className="text-[10px] text-zinc-600">评分</div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function QuickAction({
  icon, label, description, href, accent,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  accent: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose';
}) {
  const tone = {
    blue:    'from-blue-500/8   to-blue-600/4   border-blue-500/20   hover:border-blue-500/40',
    emerald: 'from-emerald-500/8 to-emerald-600/4 border-emerald-500/20 hover:border-emerald-500/40',
    purple:  'from-purple-500/8 to-purple-600/4  border-purple-500/20  hover:border-purple-500/40',
    amber:   'from-amber-500/8  to-amber-600/4   border-amber-500/20   hover:border-amber-500/40',
    rose:    'from-rose-500/8   to-rose-600/4    border-rose-500/20    hover:border-rose-500/40',
  }[accent];
  const iconTone = {
    blue:    'bg-blue-500/15   text-blue-400',
    emerald: 'bg-emerald-500/15 text-emerald-400',
    purple:  'bg-purple-500/15 text-purple-400',
    amber:   'bg-amber-500/15  text-amber-400',
    rose:    'bg-rose-500/15   text-rose-400',
  }[accent];

  return (
    <Link
      to={href}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all hover:translate-y-[-1px]',
        tone
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', iconTone)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[13px] font-semibold text-white">{label}</div>
            <ArrowUpRight size={14} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <div className="text-[11.5px] text-zinc-500 mt-0.5">{description}</div>
        </div>
      </div>
    </Link>
  );
}

export default DashboardPage;
