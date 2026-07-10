// Tasks Page - Professional Task Management Center
import { useState, useMemo } from 'react';
import {
  CheckSquare, Plus, Search, Filter, Calendar, Clock, User,
  MoreHorizontal, Circle, CheckCircle, AlertCircle, ArrowUp,
  Tag, MessageSquare, Link as LinkIcon, Bell, Sparkles,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/ui/Modal';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: '跟进日本市场客户',
    description: '联系 3 家对汉方市场感兴趣的客户，确认需求',
    status: 'todo',
    priority: 'high',
    assignee: '张三',
    dueDate: '2026-07-11',
    tags: ['客户', '日本'],
    createdAt: '2026-07-10T08:00:00Z',
    updatedAt: '2026-07-10T08:00:00Z',
  },
  {
    id: '2',
    title: '审核新留言',
    description: '有 12 条报告留言待审核',
    status: 'in_progress',
    priority: 'medium',
    tags: ['审核'],
    createdAt: '2026-07-10T09:00:00Z',
    updatedAt: '2026-07-10T10:00:00Z',
  },
  {
    id: '3',
    title: '更新周报数据',
    status: 'done',
    priority: 'low',
    assignee: '李四',
    tags: ['报告'],
    createdAt: '2026-07-09T14:00:00Z',
    updatedAt: '2026-07-10T11:00:00Z',
  },
  {
    id: '4',
    title: '导出本月线索数据',
    description: '整理 Excel 格式发给销售团队',
    status: 'todo',
    priority: 'medium',
    assignee: '王五',
    dueDate: '2026-07-15',
    tags: ['数据'],
    createdAt: '2026-07-08T16:00:00Z',
    updatedAt: '2026-07-08T16:00:00Z',
  },
  {
    id: '5',
    title: '处理紧急：客户系统故障',
    description: '客户反馈无法访问报告页面',
    status: 'in_progress',
    priority: 'urgent',
    assignee: '赵六',
    dueDate: '2026-07-10',
    tags: ['紧急', '技术支持'],
    createdAt: '2026-07-10T07:30:00Z',
    updatedAt: '2026-07-10T08:30:00Z',
  },
];

const PRIORITY_CONFIG = {
  urgent: { label: '紧急', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: AlertCircle },
  high: { label: '高', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: ArrowUp },
  medium: { label: '中', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: Circle },
  low: { label: '低', color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', icon: Circle },
};

const STATUS_CONFIG = {
  todo: { label: '待办', color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
  in_progress: { label: '进行中', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  done: { label: '已完成', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

function TaskCard({ task, onToggle, onClick }: {
  task: Task;
  onToggle: (id: string) => void;
  onClick: (task: Task) => void;
}) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const statusConfig = STATUS_CONFIG[task.status];
  const PriorityIcon = priorityConfig.icon;

  return (
    <div
      onClick={() => onClick(task)}
      className={cn(
        'group relative rounded-2xl border bg-gradient-to-br p-4 transition-all duration-200 cursor-pointer',
        'hover:scale-[1.01] hover:shadow-lg',
        task.status === 'done'
          ? 'border-zinc-800/50 from-zinc-900/30 to-zinc-900/20 opacity-60'
          : 'border-zinc-800/50 from-zinc-900/50 to-zinc-900/30 hover:border-zinc-700/50'
      )}
    >
      {/* Priority Indicator */}
      <div className={cn(
        'absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium',
        priorityConfig.bg, priorityConfig.color
      )}>
        <PriorityIcon size={10} />
        {priorityConfig.label}
      </div>

      {/* Status Toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
        className={cn(
          'mb-3 transition-colors',
          task.status === 'done' ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'
        )}
      >
        {task.status === 'done' ? <CheckCircle size={22} /> : <Circle size={22} />}
      </button>

      {/* Content */}
      <div className="pr-16">
        <h3 className={cn(
          'text-sm font-semibold leading-snug',
          task.status === 'done' ? 'text-zinc-500 line-through' : 'text-white'
        )}>
          {task.title}
        </h3>
        {task.description && (
          <p className={cn('text-zinc-500 text-xs mt-1.5 line-clamp-2')}>
            {task.description}
          </p>
        )}
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-zinc-800/50 text-zinc-400 text-[10px] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center">
                <User size={10} className="text-zinc-400" />
              </div>
              <span className="text-xs text-zinc-500">{task.assignee}</span>
            </div>
          )}
        </div>
        {task.dueDate && (
          <div className={cn(
            'flex items-center gap-1 text-xs',
            new Date(task.dueDate) < new Date() ? 'text-red-400' : 'text-zinc-500'
          )}>
            <Calendar size={12} />
            {new Date(task.dueDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskDetailModal({ task, open, onClose, onToggle }: {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onToggle: (id: string) => void;
}) {
  if (!task) return null;
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task.title}
      size="lg"
      footer={
        <>
          <button
            onClick={() => { onToggle(task.id); onClose(); }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
          >
            {task.status === 'done' ? '标记为待办' : '标记完成'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            关闭
          </button>
        </>
      }
    >
      <div className="p-6 space-y-5">
        {/* Status & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">状态</div>
            <span className={cn(
              'px-2 py-1 rounded-lg text-xs font-medium',
              task.status === 'done' ? 'bg-emerald-500/10 text-emerald-400' :
              task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-500/10 text-zinc-400'
            )}>
              {STATUS_CONFIG[task.status].label}
            </span>
          </div>
          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">优先级</div>
            <span className={cn(
              'px-2 py-1 rounded-lg text-xs font-medium',
              priorityConfig.bg, priorityConfig.color
            )}>
              {priorityConfig.label}
            </span>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">描述</div>
            <p className="text-sm text-zinc-300 leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Assignee & Due Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">负责人</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
                <User size={12} className="text-zinc-400" />
              </div>
              <span className="text-sm text-white">{task.assignee || '未分配'}</span>
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">截止日期</div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className={cn(
                new Date(task.dueDate || '') < new Date() ? 'text-red-400' : 'text-zinc-400'
              )} />
              <span className="text-sm text-white">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : '未设置'}
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">标签</div>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg bg-zinc-800/50 text-zinc-400 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-zinc-600 flex gap-4 pt-2">
          <span>创建于 {new Date(task.createdAt).toLocaleDateString('zh-CN')}</span>
          <span>更新于 {new Date(task.updatedAt).toLocaleDateString('zh-CN')}</span>
        </div>
      </div>
    </Modal>
  );
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Task['priority']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter !== 'all' && task.status !== filter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [tasks, filter, priorityFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
    urgent: tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done').length,
  }), [tasks]);

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: task.status === 'done' ? 'todo' : 'done', updatedAt: new Date().toISOString() }
          : task
      )
    );
    if (selectedTask?.id === id) {
      setSelectedTask((prev) => prev ? { ...prev, status: prev.status === 'done' ? 'todo' : 'done' } : null);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowDetail(true);
  };

  return (
    <>
      <PageHeader
        title="任务中心"
        description="管理日常任务与待办事项"
        icon={<CheckSquare size={18} className="text-emerald-400" />}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-sm transition-colors">
            <Plus size={16} />
            新建任务
          </button>
        }
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { key: 'all', label: '全部', count: stats.total },
          { key: 'todo', label: '待办', count: stats.todo, color: 'text-zinc-400' },
          { key: 'in_progress', label: '进行中', count: stats.inProgress, color: 'text-blue-400' },
          { key: 'done', label: '已完成', count: stats.done, color: 'text-emerald-400' },
          { key: 'urgent', label: '紧急', count: stats.urgent, color: 'text-red-400' },
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setFilter(stat.key === 'urgent' ? 'todo' : stat.key as any)}
            className={cn(
              'rounded-xl border bg-gradient-to-br p-4 text-left transition-all',
              filter === (stat.key === 'urgent' ? 'todo' : stat.key)
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-zinc-800/50 bg-zinc-900/30 hover:border-zinc-700/50',
              stat.key === 'urgent' && stats.urgent > 0 && 'animate-pulse'
            )}
          >
            <div className="text-xs text-zinc-500 mb-1">{stat.label}</div>
            <div className={cn(
              'text-2xl font-bold',
              stat.color || 'text-white'
            )}>
              {stat.count}
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索任务..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500/40 transition-colors"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-sm text-zinc-300 outline-none focus:border-emerald-500/40 transition-colors"
        >
          <option value="all">全部优先级</option>
          <option value="urgent">紧急</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              viewMode === 'grid' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500 hover:text-white'
            )}
          >
            网格
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              viewMode === 'list' ? 'bg-emerald-500/15 text-emerald-400' : 'text-zinc-500 hover:text-white'
            )}
          >
            列表
          </button>
        </div>
      </div>

      {/* Task Grid/List */}
      {filteredTasks.length > 0 ? (
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
        )}>
          {filteredTasks.map((task) => (
            viewMode === 'grid' ? (
              <TaskCard key={task.id} task={task} onToggle={handleToggle} onClick={handleTaskClick} />
            ) : (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-r transition-all cursor-pointer',
                  task.status === 'done'
                    ? 'border-zinc-800/50 from-zinc-900/30 to-transparent opacity-60'
                    : 'border-zinc-800/50 from-zinc-900/50 to-zinc-900/30 hover:border-zinc-700/50'
                )}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(task.id); }}
                  className={cn(
                    'shrink-0 transition-colors',
                    task.status === 'done' ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'
                  )}
                >
                  {task.status === 'done' ? <CheckCircle size={20} /> : <Circle size={20} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    task.status === 'done' ? 'text-zinc-500 line-through' : 'text-white'
                  )}>
                    {task.title}
                  </p>
                </div>
                <div className={cn(
                  'px-2 py-0.5 rounded-lg text-[10px] font-medium',
                  PRIORITY_CONFIG[task.priority].bg, PRIORITY_CONFIG[task.priority].color
                )}>
                  {PRIORITY_CONFIG[task.priority].label}
                </div>
                {task.dueDate && (
                  <div className={cn(
                    'flex items-center gap-1 text-xs',
                    new Date(task.dueDate) < new Date() ? 'text-red-400' : 'text-zinc-500'
                  )}>
                    <Calendar size={12} />
                    {new Date(task.dueDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
            <CheckSquare size={28} className="text-zinc-600" />
          </div>
          <h3 className="text-white font-medium mb-2">暂无任务</h3>
          <p className="text-zinc-500 text-sm">点击右上角按钮创建新任务</p>
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        open={showDetail}
        onClose={() => setShowDetail(false)}
        onToggle={handleToggle}
      />
    </>
  );
}
