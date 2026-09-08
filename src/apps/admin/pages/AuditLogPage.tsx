// AuditLogPage — 操作审计日志
import { useState } from 'react';
import { Activity, LogIn, LogOut, Edit3, Shield, Download, AlertCircle, Filter } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { cn } from '@/lib/utils';

const LOGS = [
  { id: 1, action: '登录',       user: 'zxq@qq.com',   role: '超级管理员', ip: '223.71.xx.xx', target: '-',                        timestamp: '2026-09-03 19:30:22', status: 'success' },
  { id: 2, action: '修改状态',   user: 'zxq@qq.com',   role: '超级管理员', ip: '223.71.xx.xx', target: 'TC2026-001 → 已联系',   timestamp: '2026-09-03 18:45:11', status: 'success' },
  { id: 3, action: '审核评论',   user: 'zxq@qq.com',   role: '超级管理员', ip: '223.71.xx.xx', target: '评论 #234 批准',         timestamp: '2026-09-03 16:20:05', status: 'success' },
  { id: 4, action: '导出数据',   user: 'zxq@qq.com',   role: '超级管理员', ip: '223.71.xx.xx', target: '线索报表 CSV',           timestamp: '2026-09-03 15:10:33', status: 'success' },
  { id: 5, action: '登录失败',   user: 'unknown@xx.com',role: '-',          ip: '185.44.xx.xx', target: '-',                        timestamp: '2026-09-03 14:05:18', status: 'failed'  },
  { id: 6, action: '更新报告',   user: 'zxq@qq.com',   role: '超级管理员', ip: '223.71.xx.xx', target: '日本汉方市场报告',       timestamp: '2026-09-02 11:30:00', status: 'success' },
];

const ACTION_META = {
  登录:     { label: '登录',     cls: 'new',      icon: <LogIn size={11} /> },
  登录失败: { label: '登录失败', cls: 'danger',   icon: <AlertCircle size={11} /> },
  修改状态: { label: '修改',     cls: 'amber',    icon: <Edit3 size={11} /> },
  审核评论: { label: '审核',    cls: 'purple',   icon: <Shield size={11} /> },
  导出数据: { label: '导出',    cls: 'cyan',     icon: <Download size={11} /> },
  更新报告: { label: '更新',    cls: 'amber',    icon: <Edit3 size={11} /> },
};

type TimeRange = 'today' | '7d' | '30d';
const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: 'today', label: '今天' },
  { key: '7d',   label: '近7天' },
  { key: '30d',  label: '近30天' },
];

const ACTION_TYPES = ['登录', '登录失败', '修改状态', '审核评论', '导出数据', '更新报告'];

export default function AuditLogPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [filterAction, setFilterAction] = useState<string>('全部');

  const todayOps  = LOGS.filter(l => l.timestamp.startsWith('2026-09-03')).length;
  const loginCount= LOGS.filter(l => l.action === '登录').length;
  const anomalyCount = LOGS.filter(l => l.action === '登录失败').length;
  const dataChanges= LOGS.filter(l => l.action !== '登录' && l.action !== '登录失败').length;

  const filtered = LOGS.filter(l => {
    if (filterAction !== '全部' && l.action !== filterAction) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        eyebrow="系统安全"
        title="操作审计日志"
        icon={<Activity size={20} />}
        metrics={[
          { label: '今日操作',  value: todayOps,     accent: 'emerald' },
          { label: '登录次数',  value: loginCount,   accent: 'blue' },
          { label: '异常次数',  value: anomalyCount, accent: 'rose' },
          { label: '数据变更',  value: dataChanges,  accent: 'amber' },
        ]}
        toolbar={
          <div className="flex items-center gap-3 flex-wrap">
            {/* 时间筛选 */}
            <div className="admin-tabs" style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.025)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 4 }}>
              {TIME_RANGES.map(r => (
                <button
                  key={r.key}
                  onClick={() => setTimeRange(r.key)}
                  className={cn('admin-tab', timeRange === r.key && 'active')}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {/* 操作类型筛选 */}
            <select
              className="admin-select"
              style={{ width: 'auto' }}
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
            >
              <option value="全部">全部类型</option>
              {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        }
      />

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div
          className="absolute left-[19px] top-6 bottom-0 w-px"
          style={{ background: 'var(--admin-border)' }}
        />

        <div className="flex flex-col gap-4">
          {filtered.map((log, idx) => {
            const meta = ACTION_META[log.action as keyof typeof ACTION_META] ?? { label: log.action, cls: 'neutral', icon: null };
            const isSuccess = log.status === 'success';
            const isFailed  = log.status === 'failed';

            return (
              <div key={log.id} className="flex items-start gap-4 relative">
                {/* Timeline node */}
                <div
                  className={cn(
                    'w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 z-10',
                    isSuccess ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                  )}
                >
                  {isSuccess
                    ? <Activity size={14} />
                    : <AlertCircle size={14} />
                  }
                </div>

                {/* Card */}
                <div className="admin-card flex-1 min-w-0" style={{ padding: '14px 16px' }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    {/* Left: action + meta */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('admin-badge', meta.cls)} style={{ gap: 4 }}>
                        {meta.icon}
                        {meta.label}
                      </span>
                      <span className="text-xs text-zinc-500">by</span>
                      <span className="text-xs font-semibold text-white">{log.user}</span>
                      <span className="text-xs text-zinc-600 px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/5">
                        {log.role}
                      </span>
                    </div>

                    {/* Right: status + time */}
                    <div className="flex items-center gap-3">
                      <StatusBadge status={log.status} />
                      <span className="text-xs text-zinc-500 tabular-nums">{log.timestamp}</span>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="flex items-center gap-6 mt-2 text-xs text-zinc-500 flex-wrap">
                    <span>IP：<span className="text-zinc-400">{log.ip}</span></span>
                    {log.target !== '-' && (
                      <span>对象：<span className="text-zinc-400">{log.target}</span></span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
