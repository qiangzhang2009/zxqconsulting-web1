// CommentsPage — 评论管理
import { useState, useCallback, useEffect } from 'react';
import { MessageSquare, Eye, Check, X, Filter } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { DataTable, type Column } from '../components/data-table/DataTable';
import { CardSkeleton } from '../components/ui/Skeleton';
import { fmtRelative, fmtDateTime, countryFlag, cn } from '@/apps/admin/lib/format';
import { api } from '../services/api';
import type { Comment } from '../types/admin';

const LIMIT = 15;

type CommentStatus = 'pending' | 'approved' | 'rejected';

export function CommentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommentStatus | ''>('');
  const [data, setData] = useState<{ total: number; data: Comment[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Comment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async (p: number, q: string, status: string) => {
    setLoading(true);
    try {
      const res = await api.getComments({
        page: p,
        limit: LIMIT,
        search: q,
        status: status || undefined,
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, '', '');
  }, [fetchData]);

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
    fetchData(1, v, statusFilter);
  }, [fetchData, statusFilter]);

  const handleStatusFilter = useCallback((s: CommentStatus | '') => {
    setStatusFilter(s);
    setPage(1);
    fetchData(1, search, s);
  }, [fetchData, search]);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    fetchData(p, search, statusFilter);
  }, [fetchData, search, statusFilter]);

  const handleApprove = async (id: string) => {
    await api.updateComment(id, 'approved');
    fetchData(page, search, statusFilter);
  };

  const handleReject = async (id: string) => {
    await api.updateComment(id, 'rejected');
    fetchData(page, search, statusFilter);
  };

  const handleView = (row: Comment) => {
    setSelected(row);
    setModalOpen(true);
  };

  // KPIs
  const totalComments = data?.total ?? 0;
  const pendingCount = data?.data.filter(c => c.status === 'pending').length ?? 0;
  const approvedCount = data?.data.filter(c => c.status === 'approved').length ?? 0;

  const statusTabs: Array<{ value: CommentStatus | ''; label: string }> = [
    { value: '', label: '全部' },
    { value: 'pending', label: '待审核' },
    { value: 'approved', label: '已通过' },
    { value: 'rejected', label: '已拒绝' },
  ];

  const columns: Column<Comment>[] = [
    {
      key: 'user_name',
      header: '用户名',
      render: (c) => (
        <div className="space-y-0.5">
          <div className="text-sm font-medium text-white">{c.user_name}</div>
          <div className="text-xs text-zinc-500">{c.user_email}</div>
        </div>
      ),
    },
    {
      key: 'content',
      header: '内容',
      render: (c) => (
        <div className="max-w-xs">
          <p className="text-sm text-zinc-300 truncate">{c.content}</p>
        </div>
      ),
    },
    {
      key: 'likes',
      header: '点赞',
      width: '60px',
      align: 'center',
      render: (c) => (
        <span className={cn(
          'font-bold text-sm',
          (c.likes ?? 0) > 0 ? 'text-emerald-400' : 'text-zinc-500'
        )}>
          {c.likes ?? 0}
        </span>
      ),
    },
    {
      key: 'status',
      header: '状态',
      width: '100px',
      align: 'center',
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: 'timestamp',
      header: '时间',
      width: '120px',
      render: (c) => (
        <span className="text-xs text-zinc-500">{fmtRelative(c.timestamp)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '140px',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <button
            className="admin-btn ghost sm"
            onClick={(e) => { e.stopPropagation(); handleView(c); }}
            title="查看详情"
          >
            <Eye size={14} />
          </button>
          {c.status === 'pending' && (
            <>
              <button
                className="admin-btn sm"
                style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}
                onClick={(e) => { e.stopPropagation(); handleApprove(c.id); }}
                title="批准"
              >
                <Check size={13} />
              </button>
              <button
                className="admin-btn danger sm"
                onClick={(e) => { e.stopPropagation(); handleReject(c.id); }}
                title="拒绝"
              >
                <X size={13} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="admin-content">
      <PageHeader
        eyebrow="内容管理"
        title="评论管理"
        icon={<MessageSquare size={20} />}
        metrics={[
          { label: '总评论数', value: totalComments, accent: 'emerald' },
          { label: '待审核', value: pendingCount, accent: 'amber' },
          { label: '已通过', value: approvedCount, accent: 'blue' },
        ]}
      />

      {loading && !data ? (
        <div className="admin-grid admin-grid-3">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} height={80} />)}
        </div>
      ) : (
        <DataTable
          data={data?.data ?? []}
          columns={columns}
          loading={loading}
          pagination={{
            page,
            limit: LIMIT,
            total: data?.total ?? 0,
            onPageChange: handlePageChange,
          }}
          searchValue={search}
          onSearchChange={handleSearch}
          searchPlaceholder="搜索用户名、邮箱、内容..."
          onRowClick={handleView}
          toolbar={
            <div className="admin-tabs">
              {statusTabs.map(tab => (
                <button
                  key={tab.value}
                  className={cn('admin-tab', statusFilter === tab.value && 'active')}
                  onClick={() => handleStatusFilter(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          }
          emptyTitle="暂无评论"
          emptyDescription="暂无评论记录"
        />
      )}

      {/* Detail Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="评论详情"
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <div className="admin-card">
              <div className="admin-section-title">用户信息</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">用户名</span>
                  <span className="text-white">{selected.user_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">邮箱</span>
                  <span>{selected.user_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">位置</span>
                  <span>{countryFlag(selected.geo_country)} {selected.geo_city || selected.geo_region || selected.geo_country || '未知'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">语言</span>
                  <span>{selected.lang || '—'}</span>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-section-title">评论内容</div>
              <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {selected.content}
              </p>
            </div>

            <div className="admin-card">
              <div className="admin-section-title">互动</div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">点赞数</span>
                <span className="text-emerald-400 font-bold">{selected.likes ?? 0}</span>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-section-title">状态</div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="text-xs text-zinc-600 text-right">
              发布时间 {fmtDateTime(selected.timestamp)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CommentsPage;
