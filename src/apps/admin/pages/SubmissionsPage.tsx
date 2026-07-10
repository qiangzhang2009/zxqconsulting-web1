// Submissions Page - Lead Management with Kanban View
import { useState, useMemo } from 'react';
import {
  Inbox, MessageSquare, Globe2, Search, Filter, Download,
  LayoutGrid, List, ChevronDown, ChevronRight, Clock, User,
  Mail, Phone, Building, MapPin, Calendar, ArrowRight,
  MoreHorizontal, Eye, Edit, Trash2, CheckCircle, Circle,
  GripVertical,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge, SUBMISSION_STATUSES } from '../components/ui/StatusBadge';
import { DataTable, type Column } from '../components/data-table/DataTable';
import { Modal } from '../components/ui/Modal';
import { useSubmissions, updateSubmission } from '../hooks/useAdminData';
import type { Submission } from '../types/admin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STAGE_LABEL: Record<string, string> = {
  idea: '构思阶段', pilot: '试点阶段', launch: '上市阶段', scale: '规模化',
  exploring: '探索中', committed: '已立项', testing: '测试中', expanding: '扩张中',
};

const BUDGET_LABEL: Record<string, string> = {
  'below-500k': '<50万', '500k-2m': '50-200万', '2m-5m': '200-500万', 'above-5m': '>500万',
};

const VALIDATION_LABEL: Record<string, string> = {
  none: '无', 'domestic-only': '仅国内', 'some-testing': '部分测试', 'existing-overseas': '已有海外',
};

const COUNTRY_FLAG: Record<string, string> = {
  CN: '🇨🇳', HK: '🇭🇰', TW: '🇹🇼', SG: '🇸🇬', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪',
  JP: '🇯🇵', KR: '🇰🇷', AU: '🇦🇺', FR: '🇫🇷', MY: '🇲🇾', TH: '🇹🇭', IN: '🇮🇳',
  AE: '🇦🇪', CA: '🇨🇦', NL: '🇳🇱', CH: '🇨🇭', BR: '🇧🇷', MX: '🇲🇽', ID: '🇮🇩',
};

const STATUS_CONFIG = {
  new: { label: '新线索', color: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Circle },
  contacted: { label: '已联系', color: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: Clock },
  qualified: { label: '已合格', color: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: CheckCircle },
  closed: { label: '已关闭', color: 'zinc', bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', icon: CheckCircle },
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}天前`;
  return fmtDateTime(iso);
}

// Kanban Card Component
function KanbanCard({ submission, onClick }: {
  submission: Submission;
  onClick: () => void;
}) {
  const isNew = submission.status === 'new';
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'group rounded-xl border bg-gradient-to-br p-4 cursor-pointer transition-all duration-200',
        'hover:scale-[1.01] hover:shadow-lg hover:shadow-black/20',
        isNew
          ? 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40'
          : 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/50'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium',
            isNew ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400'
          )}>
            {(submission.name || 'A')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {submission.name || '匿名访客'}
            </p>
            <p className="text-xs text-zinc-500 truncate">
              {submission.email || '—'}
            </p>
          </div>
        </div>
        {isNew && (
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-medium">
            NEW
          </span>
        )}
      </div>

      {/* Company */}
      {submission.company && (
        <div className="flex items-center gap-1.5 mb-2 text-xs text-zinc-400">
          <Building size={12} />
          <span className="truncate">{submission.company}</span>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {submission.product_stage && (
          <span className="px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-400 text-[10px]">
            {STAGE_LABEL[submission.product_stage] || submission.product_stage}
          </span>
        )}
        {submission.target_markets && (
          <span className="px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-400 text-[10px]">
            {submission.target_markets}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <MapPin size={12} />
          <span>{submission.country ? COUNTRY_FLAG[submission.country] : '🌐'}</span>
        </div>
        <span className="text-xs text-zinc-500">{fmtRelative(submission.created_at)}</span>
      </div>
    </div>
  );
}

// Kanban Column Component
function KanbanColumn({ status, submissions, onCardClick }: {
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  submissions: Submission[];
  onCardClick: (s: Submission) => void;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    zinc: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  };

  return (
    <div className="flex-1 min-w-[300px] max-w-[350px]">
      {/* Column Header */}
      <div className={cn(
        'flex items-center justify-between px-3 py-2.5 rounded-t-xl border-t-2 mb-0',
        colorMap[config.color as keyof typeof colorMap]
      )}>
        <div className="flex items-center gap-2">
          <Icon size={14} className={config.color === 'blue' ? 'text-blue-400' : config.color === 'amber' ? 'text-amber-400' : config.color === 'emerald' ? 'text-emerald-400' : 'text-zinc-400'} />
          <span className="text-sm font-semibold text-white">{config.label}</span>
          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs">
            {submissions.length}
          </span>
        </div>
        <button className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Cards */}
      <div className={cn(
        'p-2 rounded-b-xl border border-t-0 min-h-[400px] space-y-2',
        'bg-zinc-900/30 border-zinc-800/50'
      )}>
        {submissions.map((submission) => (
          <KanbanCard
            key={submission.id}
            submission={submission}
            onClick={() => onCardClick(submission)}
          />
        ))}
        {submissions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center mb-2">
              <Icon size={18} className="text-zinc-600" />
            </div>
            <p className="text-xs text-zinc-600">暂无{config.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SubmissionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingStatus, setEditingStatus] = useState('');
  const [editingAssignedTo, setEditingAssignedTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const { data, loading, refetch } = useSubmissions({
    page,
    limit: 100, // More items for kanban
    search: search || undefined,
    status: statusFilter || undefined,
  });

  // Group submissions by status for kanban view
  const groupedSubmissions = useMemo(() => {
    if (!data?.data) return { new: [], contacted: [], qualified: [], closed: [] };
    return {
      new: data.data.filter((s) => s.status === 'new'),
      contacted: data.data.filter((s) => s.status === 'contacted'),
      qualified: data.data.filter((s) => s.status === 'qualified'),
      closed: data.data.filter((s) => s.status === 'closed'),
    };
  }, [data]);

  const columns: Column<Submission>[] = useMemo(() => [
    {
      key: 'name',
      header: '联系人',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700/60 to-slate-800/40 border border-white/[0.06] flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-slate-300">
              {(row.name || 'A')[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">{row.name || '匿名'}</div>
            <div className="text-xs text-zinc-500 truncate">{row.company || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: '联系方式',
      render: (row) => (
        <div>
          <div className="text-xs text-zinc-300 truncate max-w-[180px]">{row.email || '—'}</div>
          <div className="text-xs text-zinc-600">{row.phone || ''}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: '状态',
      width: '120px',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'stage',
      header: '项目',
      render: (row) => (
        <div>
          <div className="text-xs text-zinc-300">
            {STAGE_LABEL[row.product_stage || ''] || '—'}
          </div>
          <div className="text-xs text-zinc-600">
            {row.target_markets || ''}
          </div>
        </div>
      ),
    },
    {
      key: 'country',
      header: '地区',
      render: (row) => (
        <span className="text-xs text-zinc-400">
          {COUNTRY_FLAG[row.country || ''] || '🌐'} {row.country || '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: '时间',
      width: '100px',
      render: (row) => (
        <span className="text-xs text-zinc-500">{fmtRelative(row.created_at)}</span>
      ),
    },
  ], []);

  const handleStatusChange = async (row: Submission, newStatus: string) => {
    try {
      await updateSubmission(row.id, { status: newStatus as Submission['status'] });
      toast.success('状态已更新');
      refetch();
    } catch (err) {
      toast.error('更新失败');
    }
  };

  const openDetail = (row: Submission) => {
    setSelected(row);
    setEditingStatus(row.status);
    setEditingNotes(row.notes || '');
    setEditingAssignedTo(row.assigned_to || '');
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateSubmission(selected.id, {
        status: editingStatus as Submission['status'],
        notes: editingNotes,
        assigned_to: editingAssignedTo || null,
      });
      toast.success('已保存');
      setSelected(null);
      refetch();
    } catch (err) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    if (!data?.data.length) return;
    const headers = ['姓名', '邮箱', '电话', '公司', '状态', '项目阶段', '目标市场', '时间'];
    const rows = data.data.map(s => [
      s.name || '', s.email || '', s.phone || '', s.company || '',
      s.status, STAGE_LABEL[s.product_stage || ''] || '',
      s.target_markets || '', s.created_at,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('已导出 CSV');
  };

  // Stats for header
  const stats = useMemo(() => ({
    total: data?.total || 0,
    new: groupedSubmissions.new.length,
    contacted: groupedSubmissions.contacted.length,
    qualified: groupedSubmissions.qualified.length,
  }), [data, groupedSubmissions]);

  return (
    <>
      <PageHeader
        title="线索管理"
        description={`${stats.total} 条线索 · ${stats.new} 条待处理`}
        icon={<Inbox size={18} className="text-blue-400" />}
        actions={
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  viewMode === 'table'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-zinc-500 hover:text-white'
                )}
              >
                <List size={14} />
                表格
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  viewMode === 'kanban'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-zinc-500 hover:text-white'
                )}
              >
                <LayoutGrid size={14} />
                看板
              </button>
            </div>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-white text-sm transition-colors"
            >
              <Download size={16} />
              导出
            </button>
          </div>
        }
      />

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="mb-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索姓名、邮箱、公司..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500/40 transition-colors"
              />
            </div>
          </div>

          {/* Kanban Board */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {(['new', 'contacted', 'qualified', 'closed'] as const).map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                submissions={groupedSubmissions[status]}
                onCardClick={openDetail}
              />
            ))}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable
          data={data?.data || []}
          columns={columns}
          loading={loading}
          pagination={
            data ? {
              page: data.page,
              limit: data.limit,
              total: data.total,
              onPageChange: setPage,
            } : undefined
          }
          onRowClick={openDetail}
          onSearchChange={setSearch}
          searchValue={search}
          searchPlaceholder="搜索姓名、邮箱、公司..."
          onExport={exportCSV}
          toolbar={
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-xs text-zinc-300 outline-none focus:border-emerald-500/40 transition-colors"
            >
              <option value="">全部状态</option>
              {SUBMISSION_STATUSES.map(s => (
                <option key={s} value={s}>
                  {({ new: '新线索', contacted: '已联系', qualified: '已合格', closed: '已关闭' } as any)[s]}
                </option>
              ))}
            </select>
          }
          emptyTitle="暂无线索"
          emptyDescription={search ? '没有匹配的线索记录' : '客户提交后会自动出现在这里'}
          emptyIcon={<MessageSquare size={28} />}
        />
      )}

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name || '匿名访客'}
        description={selected ? `${selected.company || '—'} · ${fmtDateTime(selected.created_at)}` : ''}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setSelected(null)}
              className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 transition-colors"
            >
              {saving ? '保存中...' : '保存更新'}
            </button>
          </>
        }
      >
        {selected && (
          <div className="p-6 space-y-5">
            {/* Contact Info */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '邮箱', value: selected.email, icon: Mail },
                { label: '电话', value: selected.phone, icon: Phone },
                { label: '公司', value: selected.company, icon: Building },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                    <item.icon size={10} />
                    {item.label}
                  </div>
                  <div className="text-sm text-white truncate">{item.value || '—'}</div>
                </div>
              ))}
            </div>

            {/* Project Info */}
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3 font-medium flex items-center gap-1">
                <Calendar size={10} />
                项目信息
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '项目阶段', value: STAGE_LABEL[selected.product_stage || ''] || '—' },
                  { label: '目标市场', value: selected.target_markets || '—' },
                  { label: '时间线', value: selected.timeline || '—' },
                  { label: '预算范围', value: BUDGET_LABEL[selected.budget || ''] || '—' },
                  { label: '已有认证', value: VALIDATION_LABEL[selected.has_validation || ''] || '—' },
                  { label: '来源页面', value: selected.source_page || '/' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-3">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="text-sm text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            {selected.message && (
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-medium">留言内容</div>
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                </div>
              </div>
            )}

            {/* Status & Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-medium">处理状态</div>
                <select
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-sm text-white outline-none focus:border-emerald-500/40 transition-colors"
                >
                  {SUBMISSION_STATUSES.map(s => (
                    <option key={s} value={s}>
                      {({ new: '新线索', contacted: '已联系', qualified: '已合格', closed: '已关闭' } as any)[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-medium">负责人</div>
                <input
                  value={editingAssignedTo}
                  onChange={(e) => setEditingAssignedTo(e.target.value)}
                  placeholder="分配给..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/40 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-medium">内部备注</div>
              <textarea
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                rows={3}
                placeholder="添加处理备注..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/40 transition-colors resize-none"
              />
            </div>

            {/* Location */}
            <div className="flex gap-2 text-xs text-zinc-500 items-center">
              <Globe2 size={12} />
              <span>{selected.country || '—'}</span>
              <span>·</span>
              <span>{selected.region || '—'}</span>
              <span>·</span>
              <span>{selected.city || '—'}</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
