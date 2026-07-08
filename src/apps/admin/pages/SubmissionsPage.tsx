// Submissions Page
import { useState, useMemo } from 'react';
import { Inbox, MessageSquare, Globe2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge, SUBMISSION_STATUSES } from '../components/ui/StatusBadge';
import { DataTable, type Column } from '../components/data-table/DataTable';
import { Modal } from '../components/ui/Modal';
import { useSubmissions, updateSubmission } from '../hooks/useAdminData';
import type { Submission } from '../types/admin';
import { toast } from 'sonner';

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

export function SubmissionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Submission | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingStatus, setEditingStatus] = useState('');
  const [editingAssignedTo, setEditingAssignedTo] = useState('');
  const [saving, setSaving] = useState(false);

  const { data, loading, refetch } = useSubmissions({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  });

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

  return (
    <>
      <PageHeader
        title="提交管理"
        description="处理客户咨询与意向提交"
        icon={<Inbox size={18} className="text-blue-400" />}
      />

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
            className="px-3 py-2 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-border)] text-xs text-zinc-300 outline-none focus:border-emerald-500/40"
          >
            <option value="">全部状态</option>
            {SUBMISSION_STATUSES.map(s => (
              <option key={s} value={s}>
                {({ new: '新提交', contacted: '已联系', qualified: '已合格', closed: '已关闭' } as any)[s]}
              </option>
            ))}
          </select>
        }
        emptyTitle="暂无提交"
        emptyDescription={search ? '没有匹配的提交记录' : '客户提交后会自动出现在这里'}
        emptyIcon={<MessageSquare size={28} />}
      />

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name || '匿名访客'}
        description={selected ? `${selected.company || '—'} · ${selected ? fmtDateTime(selected.created_at) : ''}` : ''}
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
                { label: '邮箱', value: selected.email },
                { label: '电话', value: selected.phone },
                { label: '公司', value: selected.company },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{item.label}</div>
                  <div className="text-sm text-white truncate">{item.value || '—'}</div>
                </div>
              ))}
            </div>

            {/* Project Info */}
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-medium">项目信息</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '项目阶段', value: STAGE_LABEL[selected.product_stage || ''] || '—' },
                  { label: '目标市场', value: selected.target_markets || '—' },
                  { label: '时间线', value: selected.timeline || '—' },
                  { label: '预算范围', value: BUDGET_LABEL[selected.budget || ''] || '—' },
                  { label: '已有认证', value: VALIDATION_LABEL[selected.has_validation || ''] || '—' },
                  { label: '来源页面', value: selected.source_page || '/' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="text-sm text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            {selected.message && (
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-medium">留言内容</div>
                <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-4">
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                </div>
              </div>
            )}

            {/* Status & Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-medium">处理状态</div>
                <select
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--admin-card)] border border-[var(--admin-border)] text-sm text-white outline-none focus:border-emerald-500/40"
                >
                  {SUBMISSION_STATUSES.map(s => (
                    <option key={s} value={s}>
                      {({ new: '新提交', contacted: '已联系', qualified: '已合格', closed: '已关闭' } as any)[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-medium">负责人</div>
                <input
                  value={editingAssignedTo}
                  onChange={(e) => setEditingAssignedTo(e.target.value)}
                  placeholder="分配给..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--admin-card)] border border-[var(--admin-border)] text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/40"
                />
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-medium">内部备注</div>
              <textarea
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                rows={3}
                placeholder="添加处理备注..."
                className="w-full px-4 py-3 rounded-xl bg-[var(--admin-card)] border border-[var(--admin-border)] text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/40 resize-none"
              />
            </div>

            <div className="flex gap-2 text-xs text-zinc-500">
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