// AuditLogPage — 操作审计日志（数据源: /api/admin/audit-log）
import { useMemo, useState } from 'react';
import { Activity, LogIn, LogOut, Edit3, Shield, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useAuditLog } from '../hooks/useAdminData';
import { cn } from '@/lib/utils';

const ACTION_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  '登录':        { label: '登录',     cls: 'new',      icon: <LogIn size={11} /> },
  '登录失败':    { label: '登录失败', cls: 'danger',   icon: <AlertCircle size={11} /> },
  '修改状态':    { label: '修改',     cls: 'amber',    icon: <Edit3 size={11} /> },
  '审核评论':    { label: '审核',     cls: 'purple',   icon: <Shield size={11} /> },
  '新建项目':    { label: '新建',     cls: 'emerald',  icon: <Edit3 size={11} /> },
  '更新项目':    { label: '更新',     cls: 'amber',    icon: <Edit3 size={11} /> },
  '删除项目':    { label: '删除',     cls: 'danger',   icon: <AlertCircle size={11} /> },
  '新建白皮书':  { label: '新建',     cls: 'emerald',  icon: <Edit3 size={11} /> },
  '更新白皮书':  { label: '更新',     cls: 'amber',    icon: <Edit3 size={11} /> },
  '删除白皮书':  { label: '删除',     cls: 'danger',   icon: <AlertCircle size={11} /> },
};

const FALLBACK_META = { label: '操作', cls: 'neutral', icon: <Activity size={11} /> };

const TIME_RANGES = [
  { key: 1,   label: '今天' },
  { key: 7,   label: '近 7 天' },
  { key: 30,  label: '近 30 天' },
] as const;

const ACTION_FILTER_OPTIONS = ['全部', '登录', '登录失败', '修改状态', '审核评论', '新建项目', '更新项目', '新建白皮书', '更新白皮书'];

export default function AuditLogPage() {
  const [timeRange, setTimeRange] = useState<number>(7);
  const [filterAction, setFilterAction] = useState<string>('全部');
  const { data, loading, refetch } = useAuditLog({ days: timeRange, limit: 200 });

  const logs = useMemo(() => data?.logs || [], [data]);
  const stats = data?.stats || { total: 0, today: 0, success: 0, failed: 0, logins: 0, dataChanges: 0 };

  const filtered = useMemo(() => {
    if (filterAction === '全部') return logs;
    return logs.filter((l) => l.action === filterAction);
  }, [logs, filterAction]);

  return (
    <div>
      <PageHeader
        eyebrow="系统安全"
        title="操作审计日志"
        icon={<Activity size={20} />}
        metrics={[
          { label: '今日操作',  value: stats.today,      accent: 'emerald' },
          { label: '登录次数',  value: stats.logins,     accent: 'blue' },
          { label: '异常次数',  value: stats.failed,     accent: 'rose' },
          { label: '数据变更',  value: stats.dataChanges,accent: 'amber' },
        ]}
        actions={
          <button className="admin-btn ghost sm" onClick={() => refetch()} title="刷新">
            <RefreshCw size={13} />
            刷新
          </button>
        }
        toolbar={
          <div className="flex items-center gap-3 flex-wrap">
            <div className="admin-tabs" style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.025)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 4 }}>
              {TIME_RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setTimeRange(r.key)}
                  className={cn('admin-tab', timeRange === r.key && 'active')}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <select
              className="admin-select"
              style={{ width: 'auto' }}
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              {ACTION_FILTER_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* Timeline */}
      <div className="relative">
        {loading && logs.length === 0 ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} height={80} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Activity size={26} />}
            title="暂无审计记录"
            description="当前时间范围内没有匹配的操作"
          />
        ) : (
          <>
            <div
              className="absolute left-[19px] top-6 bottom-0 w-px"
              style={{ background: 'var(--admin-border)' }}
            />
            <div className="flex flex-col gap-4">
              {filtered.map((log) => {
                const meta = ACTION_META[log.action] || { ...FALLBACK_META, label: log.action };
                const isSuccess = log.status === 'success';
                const isFailed = log.status === 'failed';

                return (
                  <div key={log.id} className="flex items-start gap-4 relative">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 z-10',
                        isSuccess ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : isFailed ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                        : 'bg-zinc-700/30 border-zinc-600/40 text-zinc-300'
                      )}
                    >
                      {isSuccess ? <Activity size={14} /> : isFailed ? <AlertCircle size={14} /> : meta.icon}
                    </div>

                    <div className="admin-card flex-1 min-w-0" style={{ padding: '14px 16px' }}>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn('admin-badge', meta.cls)} style={{ gap: 4 }}>
                            {meta.icon}
                            {meta.label}
                          </span>
                          <span className="text-xs text-zinc-500">by</span>
                          <span className="text-xs font-semibold text-white">{log.user_email}</span>
                          <span className="text-xs text-zinc-600 px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/5">
                            {log.user_role}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={log.status} />
                          <span className="text-xs text-zinc-500 tabular-nums">{log.timestamp}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mt-2 text-xs text-zinc-500 flex-wrap">
                        <span>IP：<span className="text-zinc-400 font-mono">{log.ip}</span></span>
                        {log.target && log.target !== '-' && (
                          <span>对象：<span className="text-zinc-400">{log.target}</span></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
