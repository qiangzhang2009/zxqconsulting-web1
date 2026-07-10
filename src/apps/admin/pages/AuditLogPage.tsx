// Audit Log Page - System Operation History
import { useState, useMemo } from 'react';
import {
  ScrollText, Search, Filter, User, Clock, ChevronDown,
  ChevronRight, AlertCircle, Info, CheckCircle, XCircle,
  FileEdit, Trash2, LogIn, LogOut, Eye, Settings,
  Plus, Minus, Edit, Trash, Download, Upload,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { cn } from '@/lib/utils';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: 'admin' | 'analyst' | 'moderator';
  action: string;
  target: string;
  targetType: 'submission' | 'comment' | 'report' | 'visitor' | 'system' | 'user';
  details: string;
  ip: string;
  status: 'success' | 'failed';
}

const MOCK_LOGS: AuditLog[] = [
  {
    id: '1',
    timestamp: '2026-07-10T14:32:15Z',
    user: 'admin@zxq.com',
    userRole: 'admin',
    action: 'update_status',
    target: '线索 #1234',
    targetType: 'submission',
    details: '状态从「新线索」改为「已联系」',
    ip: '192.168.1.100',
    status: 'success',
  },
  {
    id: '2',
    timestamp: '2026-07-10T14:28:03Z',
    user: 'analyst@zxq.com',
    userRole: 'analyst',
    action: 'login',
    target: '系统',
    targetType: 'system',
    details: '用户登录成功',
    ip: '192.168.1.101',
    status: 'success',
  },
  {
    id: '3',
    timestamp: '2026-07-10T14:15:42Z',
    user: 'moderator@zxq.com',
    userRole: 'moderator',
    action: 'approve_comment',
    target: '评论 #5678',
    targetType: 'comment',
    details: '审核通过用户评论',
    ip: '192.168.1.102',
    status: 'success',
  },
  {
    id: '4',
    timestamp: '2026-07-10T13:55:18Z',
    user: 'admin@zxq.com',
    userRole: 'admin',
    action: 'export_data',
    target: '线索数据',
    targetType: 'submission',
    details: '导出 CSV 格式，共 234 条记录',
    ip: '192.168.1.100',
    status: 'success',
  },
  {
    id: '5',
    timestamp: '2026-07-10T13:42:09Z',
    user: 'analyst@zxq.com',
    userRole: 'analyst',
    action: 'view_report',
    target: '报告 #789',
    targetType: 'report',
    details: '查看报告详情页',
    ip: '192.168.1.101',
    status: 'success',
  },
  {
    id: '6',
    timestamp: '2026-07-10T13:30:55Z',
    user: 'admin@zxq.com',
    userRole: 'admin',
    action: 'delete_comment',
    target: '评论 #9012',
    targetType: 'comment',
    details: '删除违规评论',
    ip: '192.168.1.100',
    status: 'success',
  },
  {
    id: '7',
    timestamp: '2026-07-10T12:15:33Z',
    user: 'unknown@zxq.com',
    userRole: 'admin',
    action: 'login',
    target: '系统',
    targetType: 'system',
    details: '登录失败：密码错误',
    ip: '203.0.113.50',
    status: 'failed',
  },
  {
    id: '8',
    timestamp: '2026-07-10T11:58:21Z',
    user: 'moderator@zxq.com',
    userRole: 'moderator',
    action: 'reject_comment',
    target: '评论 #3456',
    targetType: 'comment',
    details: '拒绝通过：包含广告内容',
    ip: '192.168.1.102',
    status: 'success',
  },
];

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  login: { label: '登录', icon: <LogIn size={14} />, color: 'text-blue-400 bg-blue-500/10' },
  logout: { label: '登出', icon: <LogOut size={14} />, color: 'text-zinc-400 bg-zinc-500/10' },
  create: { label: '创建', icon: <Plus size={14} />, color: 'text-emerald-400 bg-emerald-500/10' },
  update: { label: '更新', icon: <Edit size={14} />, color: 'text-amber-400 bg-amber-500/10' },
  delete: { label: '删除', icon: <Trash size={14} />, color: 'text-red-400 bg-red-500/10' },
  view: { label: '查看', icon: <Eye size={14} />, color: 'text-zinc-400 bg-zinc-500/10' },
  export: { label: '导出', icon: <Download size={14} />, color: 'text-purple-400 bg-purple-500/10' },
  import: { label: '导入', icon: <Upload size={14} />, color: 'text-cyan-400 bg-cyan-500/10' },
  approve_comment: { label: '审核通过', icon: <CheckCircle size={14} />, color: 'text-emerald-400 bg-emerald-500/10' },
  reject_comment: { label: '审核拒绝', icon: <XCircle size={14} />, color: 'text-red-400 bg-red-500/10' },
  update_status: { label: '状态变更', icon: <FileEdit size={14} />, color: 'text-amber-400 bg-amber-500/10' },
  view_report: { label: '查看报告', icon: <Eye size={14} />, color: 'text-blue-400 bg-blue-500/10' },
  export_data: { label: '数据导出', icon: <Download size={14} />, color: 'text-purple-400 bg-purple-500/10' },
  delete_comment: { label: '删除评论', icon: <Trash size={14} />, color: 'text-red-400 bg-red-500/10' },
};

const TARGET_TYPE_CONFIG: Record<string, { label: string }> = {
  submission: { label: '线索' },
  comment: { label: '评论' },
  report: { label: '报告' },
  visitor: { label: '访客' },
  system: { label: '系统' },
  user: { label: '用户' },
};

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  admin: { label: '管理员', color: 'text-red-400' },
  analyst: { label: '分析师', color: 'text-blue-400' },
  moderator: { label: '审核员', color: 'text-emerald-400' },
};

function LogItem({ log, expanded, onToggle }: {
  log: AuditLog;
  expanded: boolean;
  onToggle: () => void;
}) {
  const actionConfig = ACTION_CONFIG[log.action] || ACTION_CONFIG.update;
  const roleConfig = ROLE_CONFIG[log.userRole];

  return (
    <div className="border-b border-zinc-800/50 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 py-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        {/* Status */}
        <div className="shrink-0">
          {log.status === 'success' ? (
            <CheckCircle size={16} className="text-emerald-400" />
          ) : (
            <AlertCircle size={16} className="text-red-400" />
          )}
        </div>

        {/* Time */}
        <div className="w-32 shrink-0">
          <div className="text-xs text-zinc-500">
            {new Date(log.timestamp).toLocaleString('zh-CN', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {/* Action */}
        <div className="w-24 shrink-0">
          <span className={cn(
            'inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium',
            actionConfig.color
          )}>
            {actionConfig.icon}
            {actionConfig.label}
          </span>
        </div>

        {/* User */}
        <div className="w-40 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
              <User size={12} className="text-zinc-500" />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-white truncate">{log.user.split('@')[0]}</div>
              <span className={cn('text-[10px]', roleConfig.color)}>{roleConfig.label}</span>
            </div>
          </div>
        </div>

        {/* Target */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600">[{TARGET_TYPE_CONFIG[log.targetType]?.label}]</span>
            <span className="text-sm text-zinc-300 truncate">{log.target}</span>
          </div>
        </div>

        {/* Expand */}
        <div className="shrink-0">
          {expanded ? (
            <ChevronDown size={16} className="text-zinc-500" />
          ) : (
            <ChevronRight size={16} className="text-zinc-500" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-6 pb-4 ml-10">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 space-y-3">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">操作详情</div>
              <p className="text-sm text-zinc-300">{log.details}</p>
            </div>
            <div className="flex gap-6 text-xs">
              <div>
                <span className="text-zinc-500">IP 地址：</span>
                <span className="text-zinc-400">{log.ip}</span>
              </div>
              <div>
                <span className="text-zinc-500">完整时间：</span>
                <span className="text-zinc-400">{log.timestamp}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter((log) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !log.user.toLowerCase().includes(query) &&
          !log.target.toLowerCase().includes(query) &&
          !log.details.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (userFilter !== 'all' && log.userRole !== userFilter) return false;
      return true;
    });
  }, [searchQuery, actionFilter, userFilter]);

  const uniqueUsers = useMemo(() => {
    return [...new Set(MOCK_LOGS.map((l) => l.user))];
  }, []);

  const uniqueActions = useMemo(() => {
    return [...new Set(MOCK_LOGS.map((l) => l.action))];
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      <PageHeader
        title="操作日志"
        description="系统操作历史与审计追踪"
        icon={<ScrollText size={18} className="text-emerald-400" />}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-white font-medium text-sm transition-colors">
            <Download size={16} />
            导出日志
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: '今日操作', value: 23, color: 'text-white' },
          { label: '登录事件', value: 8, color: 'text-blue-400' },
          { label: '数据变更', value: 12, color: 'text-amber-400' },
          { label: '异常事件', value: 1, color: 'text-red-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4"
          >
            <div className="text-xs text-zinc-500 mb-1">{stat.label}</div>
            <div className={cn('text-2xl font-bold', stat.color)}>{stat.value}</div>
          </div>
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
            placeholder="搜索用户、操作、目标..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500/40 transition-colors"
          />
        </div>

        {/* Action Filter */}
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-sm text-zinc-300 outline-none focus:border-emerald-500/40 transition-colors"
        >
          <option value="all">全部操作</option>
          {uniqueActions.map((action) => (
            <option key={action} value={action}>
              {ACTION_CONFIG[action]?.label || action}
            </option>
          ))}
        </select>

        {/* User Filter */}
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-sm text-zinc-300 outline-none focus:border-emerald-500/40 transition-colors"
        >
          <option value="all">全部用户</option>
          {uniqueUsers.map((user) => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>
      </div>

      {/* Log List */}
      <div className="rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-3 bg-zinc-900/50 border-b border-zinc-800/50 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
          <div className="w-6 shrink-0"></div>
          <div className="w-32 shrink-0">时间</div>
          <div className="w-24 shrink-0">操作</div>
          <div className="w-40 shrink-0">用户</div>
          <div className="flex-1">操作对象</div>
          <div className="w-6 shrink-0"></div>
        </div>

        {/* Items */}
        {filteredLogs.length > 0 ? (
          <div className="divide-y divide-zinc-800/30">
            {filteredLogs.map((log) => (
              <LogItem
                key={log.id}
                log={log}
                expanded={expandedIds.has(log.id)}
                onToggle={() => toggleExpand(log.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
              <ScrollText size={28} className="text-zinc-600" />
            </div>
            <h3 className="text-white font-medium mb-2">暂无日志</h3>
            <p className="text-zinc-500 text-sm">没有符合条件的操作记录</p>
          </div>
        )}
      </div>
    </>
  );
}
