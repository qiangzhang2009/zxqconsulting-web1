// Submissions Page — World-class Lead Management with Kanban & Table Views
import { useState, useMemo } from 'react';
import {
  Inbox, MessageSquare, Globe2, Search, Download,
  LayoutGrid, List, Clock, User,
  Mail, Phone, Building, MapPin, Calendar, ArrowRight,
  MoreHorizontal, CheckCircle, Circle,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge, SUBMISSION_STATUSES } from '../components/ui/StatusBadge';
import { DataTable, type Column } from '../components/data-table/DataTable';
import { Modal } from '../components/ui/Modal';
import { useSubmissions, updateSubmission } from '../hooks/useAdminData';
import type { Submission } from '../types/admin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { fmtRelative, countryFlag, initials } from '../lib/format';

// ── Reference constants ──────────────────────────────────────────────────────
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

const STATUS_CONFIG = {
  new:        { label: '新线索',   color: 'blue'    as const, accent: 'blue'    as const },
  contacted:  { label: '已联系',   color: 'amber'   as const, accent: 'amber'   as const },
  qualified:  { label: '已合格',   color: 'emerald' as const, accent: 'emerald' as const },
  closed:     { label: '已关闭',   color: 'zinc'   as const, accent: 'cyan'    as const },
};

// ── Kanban Card ─────────────────────────────────────────────────────────────
function KanbanCard({ submission, onClick }: {
  submission: Submission;
  onClick: () => void;
}) {
  const isNew = submission.status === 'new';
  const flag  = countryFlag(submission.country);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative rounded-xl border cursor-pointer transition-all duration-200',
        'hover:scale-[1.01] hover:shadow-xl hover:shadow-black/30',
        'bg-[var(--admin-card)] border-[var(--admin-border)]',
        'hover:border-[var(--admin-border-strong)]',
        isNew && 'border-blue-500/30 hover:border-blue-500/50',
      )}
    >
      {/* Subtle top accent line for new */}
      {isNew && (
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent rounded-full" />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
              'border border-white/10',
              isNew
                ? 'bg-blue-500/15 text-blue-400'
                : 'bg-[var(--admin-elev)] text-zinc-400',
            )}>
              {initials(submission.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {submission.name || '匿名访客'}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {submission.email || '—'}
              </p>
            </div>
          </div>
          {isNew && (
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-bold tracking-wide">
              NEW
            </span>
          )}
        </div>

        {/* Company */}
        {submission.company && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-zinc-400">
            <Building size={12} className="shrink-0 text-zinc-600" />
            <span className="truncate">{submission.company}</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {submission.product_stage && (
            <span className="px-2 py-0.5 rounded-lg bg-[var(--admin-elev)] text-zinc-400 text-[10px] font-medium border border-[var(--admin-border)]">
              {STAGE_LABEL[submission.product_stage] || submission.product_stage}
            </span>
          )}
          {submission.target_markets && (
            <span className="px-2 py-0.5 rounded-lg bg-[var(--admin-elev)] text-zinc-400 text-[10px] font-medium border border-[var(--admin-border)]">
              {submission.target_markets}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-[var(--admin-divider)]">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="text-base leading-none">{flag}</span>
            <span className="hidden sm:inline text-[10px]">{submission.country || '未知'}</span>
          </div>
          <span className="text-xs text-zinc-600">{fmtRelative(submission.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Kanban Column ────────────────────────────────────────────────────────────
function KanbanColumn({ status, submissions, onCardClick }: {
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  submissions: Submission[];
  onCardClick: (s: Submission) => void;
}) {
  const config = STATUS_CONFIG[status];

  const headerColorMap = {
    blue:    'border-t-blue-500/50 bg-blue-500/5',
    amber:   'border-t-amber-500/50 bg-amber-500/5',
    emerald: 'border-t-emerald-500/50 bg-emerald-500/5',
    zinc:    'border-t-zinc-500/50 bg-zinc-500/5',
  };

  const dotColorMap = {
    blue:    'bg-blue-400',
    amber:   'bg-amber-400',
    emerald: 'bg-emerald-400',
    zinc:    'bg-zinc-400',
  };

  return (
    <div className="flex-1 min-w-[280px] max-w-[340px] flex flex-col">
      {/* Column Header */}
      <div className={cn(
        'flex items-center justify-between px-4 py-3 rounded-t-xl border-t-2 mb-0',
        'border border-b-0 border-[var(--admin-border)]',
        headerColorMap[config.color],
      )}>
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', dotColorMap[config.color])} />
          <span className="text-sm font-semibold text-white">{config.label}</span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--admin-elev)] border border-[var(--admin-border)] text-zinc-500 text-xs font-medium">
            {submissions.length}
          </span>
        </div>
        <button className="p-1 rounded-lg hover:bg-white/5 text-zinc-600 hover:text-white transition-colors">
          <MoreHorizontal size={15} />
        </button>
      </div>

      {/* Cards container */}
      <div className={cn(
        'flex-1 p-2.5 rounded-b-xl border border-t-0 min-h-[440px]',
        'border-[var(--admin-border)] bg-[var(--admin-bg-soft)]',
        'flex flex-col gap-2',
      )}>
        {submissions.length > 0 ? (
          submissions.map((s) => (
            <KanbanCard
              key={s.id}
              submission={s}
              onClick={() => onCardClick(s)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-[var(--admin-card)] border border-[var(--admin-border)] flex items-center justify-center mb-3">
              <div className={cn('w-2 h-2 rounded-full opacity-30', dotColorMap[config.color])} />
            </div>
            <p className="text-xs text-zinc-600">暂无{config.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function SubmissionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingStatus, setEditingStatus] = useState<Submission['status']>('new');
  const [editingAssignedTo, setEditingAssignedTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const { data, loading, refetch } = useSubmissions({
    page,
    limit: 100,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  // Group by status for kanban
  const groupedSubmissions = useMemo(() => {
    if (!data?.data) return { new: [], contacted: [], qualified: [], closed: [] };
    return {
      new:        data.data.filter((s) => s.status === 'new'),
      contacted:  data.data.filter((s) => s.status === 'contacted'),
      qualified:  data.data.filter((s) => s.status === 'qualified'),
      closed:     data.data.filter((s) => s.status === 'closed'),
    };
  }, [data]);

  // KPI stats
  const stats = useMemo(() => ({
    total:      data?.total || 0,
    newCount:    groupedSubmissions.new.length,
    contacted:   groupedSubmissions.contacted.length,
    qualified:   groupedSubmissions.qualified.length,
  }), [data, groupedSubmissions]);

  // Table columns
  const columns: Column<Submission>[] = useMemo(() => [
    {
      key: 'name',
      header: '联系人',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700/60 to-slate-800/40 border border-white/[0.06] flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-slate-300">
              {initials(row.name)}
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
          <div className="text-xs text-zinc-600">{row.target_markets || ''}</div>
        </div>
      ),
    },
    {
      key: 'country',
      header: '地区',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
          <span>{countryFlag(row.country)}</span>
          <span>{row.country || '—'}</span>
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
        status: editingStatus,
        notes: editingNotes,
        assigned_to: editingAssignedTo || null,
      });
      toast.success('已保存');
      setSelected(null);
      refetch();
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    if (!data?.data?.length) return;
    const headers = ['姓名', '邮箱', '电话', '公司', '状态', '项目阶段', '目标市场', '时间'];
    const rows = data.data.map((s) => [
      s.name || '', s.email || '', s.phone || '', s.company || '',
      s.status, STAGE_LABEL[s.product_stage || ''] || '',
      s.target_markets || '', s.created_at,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('已导出 CSV');
  };

  return (
    <>
      <PageHeader
        eyebrow="线索管理"
        title="客户线索"
        description={`${stats.total} 条线索 · ${stats.newCount} 条待处理`}
        icon={<Inbox size={18} className="text-emerald-400" />}
        metrics={[
          { label: '全部线索',  value: stats.total.toLocaleString(),     accent: 'emerald' },
          { label: '新线索',    value: stats.newCount.toLocaleString(),  accent: 'blue'    },
          { label: '已联系',    value: stats.contacted.toLocaleString(), accent: 'amber'   },
          { label: '已合格',    value: stats.qualified.toLocaleString(), accent: 'emerald' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="admin-tabs">
              <button
                onClick={() => setViewMode('table')}
                className={cn('admin-tab', viewMode === 'table' && 'active')}
              >
                <List size={13} />
                表格
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={cn('admin-tab', viewMode === 'kanban' && 'active')}
              >
                <LayoutGrid size={13} />
                看板
              </button>
            </div>

            <button
              onClick={exportCSV}
              className="admin-btn primary"
            >
              <Download size={14} />
              导出 CSV
            </button>
          </div>
        }
      />

      {/* ── Kanban View ─────────────────────────────────────────────── */}
      {viewMode === 'kanban' && (
        <div>
          {/* Kanban toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索姓名、邮箱、公司..."
                className="admin-input pl-9"
              />
            </div>
          </div>

          {/* Board */}
          <div className="flex gap-4 overflow-x-auto pb-4 admin-scroll">
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

      {/* ── Table View ──────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <DataTable
          data={data?.data || []}
          columns={columns}
          loading={loading}
          searchValue={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          searchPlaceholder="搜索姓名、邮箱、公司..."
          onRowClick={openDetail}
          onExport={exportCSV}
          toolbar={
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="admin-select text-xs min-w-[120px]"
            >
              <option value="">全部状态</option>
              {SUBMISSION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s}
                </option>
              ))}
            </select>
          }
          pagination={
            data
              ? {
                  page: data.page,
                  limit: data.limit,
                  total: data.total,
                  onPageChange: setPage,
                }
              : undefined
          }
          emptyTitle="暂无线索"
          emptyDescription={search ? '没有匹配的线索记录' : '客户提交后会自动出现在这里'}
          emptyIcon={<MessageSquare size={28} />}
        />
      )}

      {/* ── Detail Modal ────────────────────────────────────────────── */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name || '匿名访客'}
        description={
          selected
            ? `${selected.company || '—'} · ${fmtRelative(selected.created_at)}`
            : ''
        }
        size="lg"
        footer={
          <>
            <button
              onClick={() => setSelected(null)}
              className="admin-btn ghost"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="admin-btn primary"
            >
              {saving ? '保存中...' : '保存更新'}
            </button>
          </>
        }
      >
        {selected && (
          <div className="space-y-6">

            {/* Contact Info Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '邮箱',   value: selected.email,   icon: Mail    },
                { label: '电话',   value: selected.phone,   icon: Phone   },
                { label: '公司',   value: selected.company, icon: Building },
              ].map((item) => (
                <div key={item.label} className="admin-card p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 uppercase tracking-widest font-semibold mb-1">
                    <item.icon size={10} />
                    {item.label}
                  </div>
                  <div className="text-sm text-white truncate">{item.value || '—'}</div>
                </div>
              ))}
            </div>

            {/* Project Info */}
            <div>
              <div className="admin-section-title">
                <Calendar size={12} />
                项目信息
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '项目阶段',   value: STAGE_LABEL[selected.product_stage || ''] || '—'     },
                  { label: '目标市场',   value: selected.target_markets || '—'                        },
                  { label: '时间线',     value: selected.timeline || '—'                             },
                  { label: '预算范围',   value: BUDGET_LABEL[selected.budget || ''] || '—'          },
                  { label: '已有认证',   value: VALIDATION_LABEL[selected.has_validation || ''] || '—'},
                  { label: '来源页面',   value: selected.source_page || '/'                          },
                ].map((item) => (
                  <div key={item.label} className="admin-card p-3 rounded-xl">
                    <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm text-white truncate">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            {selected.message && (
              <div>
                <div className="admin-section-title">
                  <MessageSquare size={12} />
                  留言内容
                </div>
                <div className="admin-card p-4 rounded-xl">
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {selected.message}
                  </p>
                </div>
              </div>
            )}

            {/* Status & Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-section-title">
                  <CheckCircle size={12} />
                  处理状态
                </label>
                <select
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value as Submission['status'])}
                  className="admin-select"
                >
                  {SUBMISSION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="admin-section-title">
                  <User size={12} />
                  负责人
                </label>
                <input
                  type="text"
                  value={editingAssignedTo}
                  onChange={(e) => setEditingAssignedTo(e.target.value)}
                  placeholder="分配给..."
                  className="admin-input"
                />
              </div>
            </div>

            <div>
              <label className="admin-section-title">
                <ArrowRight size={12} />
                内部备注
              </label>
              <textarea
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                rows={3}
                placeholder="添加处理备注..."
                className="admin-textarea"
              />
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-xs text-zinc-600 border-t border-[var(--admin-divider)] pt-4">
              <Globe2 size={13} />
              <span>{countryFlag(selected.country)}</span>
              <span>{selected.country || '—'}</span>
              <span className="text-zinc-800">·</span>
              <span>{selected.region || '—'}</span>
              <span className="text-zinc-800">·</span>
              <span>{selected.city || '—'}</span>
            </div>

          </div>
        )}
      </Modal>
    </>
  );
}
