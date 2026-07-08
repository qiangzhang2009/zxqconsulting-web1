// Comments Page
import { useState, useMemo } from 'react';
import { MessageSquare, ThumbsUp, Globe2, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge, COMMENT_STATUSES } from '../components/ui/StatusBadge';
import { DataTable, type Column } from '../components/data-table/DataTable';
import { Modal } from '../components/ui/Modal';
import { KPICard } from '../components/ui/KPICard';
import {
  useComments, updateComment, deleteComment,
} from '../hooks/useAdminData';
import type { Comment } from '../types/admin';
import { toast } from 'sonner';

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

export function CommentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Comment | null>(null);

  const { data, loading, refetch } = useComments({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const columns: Column<Comment>[] = useMemo(() => [
    {
      key: 'user',
      header: '用户',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-purple-300">
              {(row.user_name || 'U')[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">{row.user_name}</div>
            <div className="text-xs text-zinc-500 truncate">{row.user_email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'content',
      header: '评论内容',
      render: (row) => (
        <div className="text-xs text-zinc-300 line-clamp-2 max-w-[400px]">{row.content}</div>
      ),
    },
    {
      key: 'likes',
      header: '点赞',
      width: '80px',
      align: 'right',
      render: (row) => (
        <div className="flex items-center gap-1 justify-end text-xs text-zinc-400">
          <ThumbsUp size={11} />
          {row.likes || 0}
        </div>
      ),
    },
    {
      key: 'status',
      header: '状态',
      width: '100px',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'country',
      header: '地区',
      render: (row) => (
        <span className="text-xs text-zinc-400">
          {COUNTRY_FLAG[row.geo_country] || '🌐'} {row.geo_country || '—'}
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: '时间',
      width: '100px',
      render: (row) => (
        <span className="text-xs text-zinc-500">{fmtRelative(row.timestamp)}</span>
      ),
    },
  ], []);

  const handleApprove = async (row: Comment) => {
    try {
      await updateComment(row.id, 'approved');
      toast.success('已通过');
      refetch();
    } catch {
      toast.error('操作失败');
    }
  };

  const handleReject = async (row: Comment) => {
    try {
      await updateComment(row.id, 'rejected');
      toast.success('已拒绝');
      refetch();
    } catch {
      toast.error('操作失败');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm('确定删除这条评论吗？')) return;
    try {
      await deleteComment(selected.id);
      toast.success('已删除');
      setSelected(null);
      refetch();
    } catch {
      toast.error('删除失败');
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selected) return;
    try {
      await updateComment(selected.id, status);
      toast.success('状态已更新');
      setSelected({ ...selected, status: status as Comment['status'] });
      refetch();
    } catch {
      toast.error('更新失败');
    }
  };

  // Status counts
  const statusCounts = useMemo(() => {
    if (!data?.data) return { pending: 0, approved: 0, rejected: 0 };
    return {
      pending: data.data.filter(c => c.status === 'pending').length,
      approved: data.data.filter(c => c.status === 'approved').length,
      rejected: data.data.filter(c => c.status === 'rejected').length,
    };
  }, [data?.data]);

  return (
    <>
      <PageHeader
        title="评论审核"
        description="审核与管理用户评论"
        icon={<MessageSquare size={18} className="text-purple-400" />}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KPICard
          label="待审核"
          value={statusCounts.pending}
          accent="amber"
          icon={<MessageSquare size={18} />}
        />
        <KPICard
          label="已通过"
          value={statusCounts.approved}
          accent="emerald"
          icon={<ThumbsUp size={18} />}
        />
        <KPICard
          label="已拒绝"
          value={statusCounts.rejected}
          accent="rose"
          icon={<Trash2 size={18} />}
        />
      </div>

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
        onRowClick={setSelected}
        onSearchChange={setSearch}
        searchValue={search}
        searchPlaceholder="搜索用户名、内容..."
        toolbar={
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-border)] text-xs text-zinc-300 outline-none focus:border-emerald-500/40"
          >
            <option value="">全部状态</option>
            {COMMENT_STATUSES.map(s => (
              <option key={s} value={s}>
                {({ pending: '待审核', approved: '已通过', rejected: '已拒绝' } as any)[s]}
              </option>
            ))}
          </select>
        }
        emptyTitle="暂无评论"
        emptyDescription="用户评论后会出现在这里"
        emptyIcon={<MessageSquare size={28} />}
      />

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="评论详情"
        size="lg"
        footer={
          selected && (
            <>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                删除
              </button>
              <div className="flex-1" />
              <button
                onClick={() => handleStatusChange('rejected')}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
              >
                拒绝
              </button>
              <button
                onClick={() => handleStatusChange('approved')}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
              >
                通过
              </button>
            </>
          )
        }
      >
        {selected && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <span className="text-base font-medium text-purple-300">
                  {(selected.user_name || 'U')[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-white">{selected.user_name}</div>
                <div className="text-sm text-zinc-500">{selected.user_email}</div>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-5">
              <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {selected.content}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">点赞数</div>
                <div className="text-sm text-white">{selected.likes || 0}</div>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">地区</div>
                <div className="text-sm text-white">
                  {COUNTRY_FLAG[selected.geo_country] || '🌐'} {selected.geo_city || selected.geo_country || '—'}
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">语言</div>
                <div className="text-sm text-white">{selected.lang?.toUpperCase() || '—'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <Globe2 size={12} />
              <span>IP: {selected.geo_region || '—'}, {selected.geo_country || '—'}</span>
              <span>·</span>
              <span>{fmtDateTime(selected.timestamp)}</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}