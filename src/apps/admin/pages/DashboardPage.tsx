// Dashboard Page - Professional Workspace Dashboard
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, FileText, Brain, Activity, TrendingUp, AlertCircle,
  ArrowUpRight, ArrowRight, Clock, CheckCircle, Circle,
  Inbox, MessageSquare, BarChart3, Heart,
  ChevronRight, Sparkles, Target, Zap,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { KPICard } from '../components/ui/KPICard';
import { AreaChart } from '../components/charts/AreaChart';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useAnalytics, useSubmissions } from '../hooks/useAdminData';
import type { Submission } from '../types/admin';
import { cn } from '@/lib/utils';

const COUNTRY_FLAG: Record<string, string> = {
  CN: '🇨🇳', HK: '🇭🇰', TW: '🇹🇼', SG: '🇸🇬', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪',
  JP: '🇯🇵', KR: '🇰🇷', AU: '🇦🇺', FR: '🇫🇷', MY: '🇲🇾', TH: '🇹🇭', IN: '🇮🇳',
  AE: '🇦🇪', CA: '🇨🇦', NL: '🇳🇱', CH: '🇨🇭', BR: '🇧🇷', MX: '🇲🇽', ID: '🇮🇩',
};

const STATUS_CONFIG = {
  new: { label: '新线索', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  contacted: { label: '已联系', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  qualified: { label: '已合格', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  closed: { label: '已关闭', color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/30' },
};

const PRIORITY_CONFIG = {
  urgent: { label: '紧急', color: 'text-red-400', bg: 'bg-red-500/10' },
  high: { label: '高', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  medium: { label: '中', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  low: { label: '低', color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
};

// Quick Action Card Component
function QuickAction({ icon, label, description, href, accent }: {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  accent: string;
}) {
  return (
    <Link
      to={href}
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
        accent === 'blue' && 'from-blue-500/5 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40',
        accent === 'emerald' && 'from-emerald-500/5 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/40',
        accent === 'purple' && 'from-purple-500/5 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40',
        accent === 'amber' && 'from-amber-500/5 to-amber-600/5 border-amber-500/20 hover:border-amber-500/40',
      )}
    >
      <div className={cn(
        'absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.06] blur-2xl transition-opacity',
        accent === 'blue' && 'bg-blue-500',
        accent === 'emerald' && 'bg-emerald-500',
        accent === 'purple' && 'bg-purple-500',
        accent === 'amber' && 'bg-amber-500',
      )} />
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
          accent === 'blue' && 'bg-blue-500/15 text-blue-400',
          accent === 'emerald' && 'bg-emerald-500/15 text-emerald-400',
          accent === 'purple' && 'bg-purple-500/15 text-purple-400',
          accent === 'amber' && 'bg-amber-500/15 text-amber-400',
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">{label}</h3>
            <ArrowRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </div>
          <p className="text-xs text-zinc-500 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}

// Task Item Component
function TaskItem({ title, priority, deadline, status }: {
  title: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  deadline?: string;
  status: 'pending' | 'done';
}) {
  const priorityConfig = PRIORITY_CONFIG[priority];
  return (
    <div className="flex items-center gap-3 py-3 border-b border-zinc-800/50 last:border-0">
      <button className={cn(
        'shrink-0 transition-colors',
        status === 'done' ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'
      )}>
        {status === 'done' ? <CheckCircle size={18} /> : <Circle size={18} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm truncate',
          status === 'done' ? 'text-zinc-500 line-through' : 'text-white'
        )}>
          {title}
        </p>
        {deadline && (
          <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
            <Clock size={10} />
            {deadline}
          </p>
        )}
      </div>
      <span className={cn(
        'px-2 py-0.5 rounded text-[10px] font-medium shrink-0',
        priorityConfig.bg, priorityConfig.color
      )}>
        {priorityConfig.label}
      </span>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ icon, action, target, time, avatar }: {
  icon: React.ReactNode;
  action: string;
  target: string;
  time: string;
  avatar?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-800/50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400">
        {avatar || icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300">
          <span className="text-white font-medium">{target}</span>
          {' '}{action}
        </p>
        <p className="text-xs text-zinc-600 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [period, setPeriod] = useState(30);
  const { data, loading, refetch } = useAnalytics(period);
  const { data: submissions, loading: submissionsLoading } = useSubmissions({ page: 1, limit: 5 });

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

  if (loading) {
    return (
      <>
        <PageHeader title="工作台" description="业务概览与工作中心" icon={<Activity size={18} className="text-emerald-400" />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="工作台"
        description={new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        icon={<Activity size={18} className="text-emerald-400" />}
        actions={
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/50 border border-zinc-800">
            {[
              { key: '7', label: '7天' },
              { key: '30', label: '30天' },
              { key: '90', label: '90天' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(Number(p.key))}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
                  period === Number(p.key)
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-zinc-500 hover:text-white'
                )}
              >
                {p.label}
              </button>
            ))}
            <div className="w-px h-5 bg-zinc-700 mx-1" />
            <button
              onClick={refetch}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors"
              title="刷新数据"
            >
              <Sparkles size={14} />
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="线索总数"
          value={totalLeads}
          accent="emerald"
          icon={<Users size={18} />}
          trend={12.5}
          description={`待处理: ${statusBreakdown.new}`}
        />
        <KPICard
          label="转化率"
          value={totalData.conversionRate}
          suffix="%"
          decimals={2}
          accent="blue"
          icon={<TrendingUp size={18} />}
          trend={3.2}
          description="访客 → 线索"
        />
        <KPICard
          label="已合格"
          value={statusBreakdown.qualified}
          accent="purple"
          icon={<Target size={18} />}
          description={`占比 ${totalLeads > 0 ? ((statusBreakdown.qualified / totalLeads) * 100).toFixed(1) : 0}%`}
        />
        <KPICard
          label="AI 诊断"
          value={recentReports.length}
          accent="amber"
          icon={<Brain size={18} />}
          description="最近报告"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap size={14} className="text-amber-400" />
              快捷操作
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickAction
              icon={<Inbox size={20} />}
              label="线索管理"
              description={`${statusBreakdown.new} 条新线索待处理`}
              href="/admin/submissions"
              accent="blue"
            />
            <QuickAction
              icon={<MessageSquare size={20} />}
              label="客户采集"
              description="查看新客户信息表"
              href="/admin/client-intake"
              accent="emerald"
            />
            <QuickAction
              icon={<BarChart3 size={20} />}
              label="研究报告"
              description="分析报告阅读数据"
              href="/admin/research"
              accent="purple"
            />
            <QuickAction
              icon={<Heart size={20} />}
              label="报告互动"
              description="追踪用户互动情况"
              href="/admin/report-analytics"
              accent="amber"
            />
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" />
              今日待办
            </h3>
            <Link to="/admin/tasks" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              查看全部 <ChevronRight size={12} />
            </Link>
          </div>
          <div>
            <TaskItem title="跟进 3 条新线索" priority="high" deadline="今天" status="pending" />
            <TaskItem title="审核报告留言" priority="medium" deadline="今天" status="pending" />
            <TaskItem title="更新客户采集表" priority="low" deadline="本周" status="pending" />
            <TaskItem title="查看周报数据" priority="medium" status="done" />
          </div>
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">趋势分析</h3>
              <p className="text-xs text-zinc-500 mt-0.5">访客与线索趋势</p>
            </div>
          </div>
          <AreaChart
            data={trend}
            series={[
              { key: 'visitors', label: '访客', color: '#34d399' },
              { key: 'submissions', label: '线索', color: '#60a5fa' },
            ]}
            height={220}
          />
        </div>

        {/* Pipeline Status */}
        <div className="rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">线索漏斗</h3>
            <Link to="/admin/submissions" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              详情 <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { key: 'new', label: '新线索', icon: <Circle size={14} /> },
              { key: 'contacted', label: '已联系', icon: <MessageSquare size={14} /> },
              { key: 'qualified', label: '已合格', icon: <Target size={14} /> },
              { key: 'closed', label: '已关闭', icon: <CheckCircle size={14} /> },
            ].map((stage, idx) => {
              const count = statusBreakdown[stage.key as keyof typeof statusBreakdown] || 0;
              const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
              const config = STATUS_CONFIG[stage.key as keyof typeof STATUS_CONFIG];
              return (
                <div key={stage.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={config.color}>{stage.icon}</span>
                      <span className="text-sm text-zinc-400">{stage.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{count}</span>
                      <span className="text-xs text-zinc-600">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', config.color.replace('text-', 'bg-'))}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity & Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Leads */}
        <div className="rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">最近线索</h3>
            <Link to="/admin/submissions" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              查看全部 <ChevronRight size={12} />
            </Link>
          </div>
          {submissions?.data && submissions.data.length > 0 ? (
            <div className="space-y-3">
              {submissions.data.slice(0, 5).map((lead) => {
                const config = STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG];
                return (
                  <Link
                    key={lead.id}
                    to="/admin/submissions"
                    className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400 text-sm font-medium">
                        {(lead.name || 'A')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{lead.name || '匿名访客'}</p>
                        <p className="text-xs text-zinc-500 truncate">{lead.company || lead.email || '—'}</p>
                      </div>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-medium shrink-0',
                      config.bg, config.color
                    )}>
                      {config.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-600 text-sm">暂无线索数据</div>
          )}
        </div>

        {/* Top Countries */}
        <div className="rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">访客来源</h3>
            <Link to="/admin/visitors" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              详情 <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {topCountries.slice(0, 6).map((item, idx) => (
              <div key={item.country} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 text-sm">{COUNTRY_FLAG[item.country] || '🌐'}</span>
                  <span className="text-sm text-zinc-300">{item.country || '未知'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{item.visitors}</span>
                  <span className="text-xs text-zinc-600">访客</span>
                </div>
              </div>
            ))}
            {topCountries.length === 0 && (
              <div className="text-center py-8 text-zinc-600 text-sm">暂无数据</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
