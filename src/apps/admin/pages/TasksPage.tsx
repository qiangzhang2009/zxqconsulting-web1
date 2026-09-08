// TasksPage — 任务管理
import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Plus, AlertTriangle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { fmtRelative, fmtDate } from '@/apps/admin/lib/format';

const TASKS = [
  { id: 1, title: '跟进 TC2026-001 客户首次沟通', priority: 'high' as const, status: 'pending' as const, due_date: '2026-09-05', assignee: '张强', source: '线索管理' },
  { id: 2, title: '审核中医药欧盟注册白皮书草稿', priority: 'medium' as const, status: 'in_progress' as const, due_date: '2026-09-07', assignee: '李静', source: '白皮书流水线' },
  { id: 3, title: '更新日本市场诊断报告 L1 分级', priority: 'low' as const, status: 'completed' as const, due_date: '2026-09-02', assignee: '王芳', source: 'AI 诊断' },
  { id: 4, title: '发送客户采集表跟进邮件', priority: 'high' as const, status: 'pending' as const, due_date: '2026-09-04', assignee: '张强', source: '客户采集' },
  { id: 5, title: '审核新评论 3 条', priority: 'medium' as const, status: 'in_progress' as const, due_date: '2026-09-03', assignee: '李静', source: '网站评论' },
];

const PRIORITY_META = {
  high:   { label: '高', cls: 'rose',    accent: 'rose' },
  medium: { label: '中', cls: 'amber',   accent: 'amber' },
  low:    { label: '低', cls: 'blue',    accent: 'blue' },
};

const TABS = ['全部', '待办', '进行中', '已完成'] as const;
type Tab = typeof TABS[number];

const PRIORITY_ICONS = {
  high:   <ArrowUp size={11} />,
  medium: <ArrowRight size={11} />,
  low:    <ArrowDown size={11} />,
};

function TaskCard({ task }: { task: typeof TASKS[0] }) {
  const priority = PRIORITY_META[task.priority];
  const isOverdue = task.status !== 'completed' && new Date(task.due_date) < new Date();
  return (
    <div className="admin-card" style={{ padding: '16px' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5 min-w-0">
          {task.status === 'completed'
            ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            : <Circle size={16} className="text-zinc-600 shrink-0 mt-0.5" />
          }
          <span className={cn(
            'text-sm font-medium leading-snug',
            task.status === 'completed' ? 'text-zinc-500 line-through' : 'text-white'
          )}>
            {task.title}
          </span>
        </div>
        <span className={cn('admin-badge shrink-0', priority.cls)} style={{ gap: 4 }}>
          {PRIORITY_ICONS[task.priority]}
          {priority.label}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <Clock size={11} />
          {isOverdue ? (
            <span className="text-rose-400">{fmtDate(task.due_date)} 已逾期</span>
          ) : (
            fmtDate(task.due_date)
          )}
        </span>
        <span>负责人：<span className="text-zinc-300">{task.assignee}</span></span>
        <span>来源：<span className="text-zinc-300">{task.source}</span></span>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tab, setTab] = useState<Tab>('全部');
  const [showNew, setShowNew] = useState(false);

  const total     = TASKS.length;
  const pending   = TASKS.filter(t => t.status === 'pending').length;
  const inProgress= TASKS.filter(t => t.status === 'in_progress').length;
  const completed = TASKS.filter(t => t.status === 'completed').length;
  const urgent    = TASKS.filter(t => t.priority === 'high' && t.status === 'pending').length;

  const filtered = TASKS.filter(t => {
    if (tab === '待办')    return t.status === 'pending';
    if (tab === '进行中') return t.status === 'in_progress';
    if (tab === '已完成') return t.status === 'completed';
    return true;
  });

  return (
    <div>
      <PageHeader
        eyebrow="工作台"
        title="任务管理"
        icon={<CheckCircle2 size={20} />}
        actions={
          <button className="admin-btn primary" onClick={() => setShowNew(true)}>
            <Plus size={15} />
            新建任务
          </button>
        }
        metrics={[
          { label: '待办数',   value: total,      accent: 'emerald' },
          { label: '待处理',  value: pending,     accent: 'blue' },
          { label: '进行中',  value: inProgress,  accent: 'amber' },
          { label: '紧急',    value: urgent,      accent: 'rose' },
        ]}
      />

      {/* Tabs */}
      <div className="admin-tabs admin-mb-4" style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.025)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 4 }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn('admin-tab', tab === t && 'active')}
          >
            {t}
            {t === '待办'    && <span className="ml-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full">{pending}</span>}
            {t === '进行中'  && <span className="ml-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">{inProgress}</span>}
            {t === '已完成' && <span className="ml-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">{completed}</span>}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={26} />}
            title="暂无任务"
            description="所有任务已完成，或者筛选范围内没有任务"
          />
        ) : (
          filtered.map(task => <TaskCard key={task.id} task={task} />)
        )}
      </div>

      {/* New task modal (placeholder) */}
      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="新建任务"
        footer={
          <>
            <button className="admin-btn ghost" onClick={() => setShowNew(false)}>取消</button>
            <button className="admin-btn primary">确认创建</button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">任务标题</label>
            <input className="admin-input" placeholder="请输入任务标题" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">优先级</label>
              <select className="admin-select">
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">负责人</label>
              <select className="admin-select">
                <option value="zxq">张强</option>
                <option value="lj">李静</option>
                <option value="wf">王芳</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1.5">截止日期</label>
            <input type="date" className="admin-input" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
