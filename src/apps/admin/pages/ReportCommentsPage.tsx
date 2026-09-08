// ReportCommentsPage — 报告评论管理
import { useState, useCallback, useEffect } from 'react';
import { MessageCircle, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable, type Column } from '../components/data-table/DataTable';
import { CardSkeleton } from '../components/ui/Skeleton';
import { fmtRelative, fmtDateTime, fmtNumber, countryFlag, cn } from '@/apps/admin/lib/format';
import { api } from '../services/api';

const LIMIT = 20;

interface ReportComment {
  id: number;
  report_id: string;
  nickname: string;
  content: string;
  ip: string;
  country: string;
  region: string;
  city: string;
  status: string;
  created_at: string;
}

export function ReportCommentsPage() {
  const [data, setData] = useState<{
    success: boolean;
    comments: ReportComment[];
    stats: { total: number; visible: number; hidden: number; reports: number };
    days: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getReportComments({ days: 30 });
      setData(res as any);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleHide = async (id: number) => {
    await api.hideReportComment(id);
    fetchData();
  };

  const handleRestore = async (id: number) => {
    await api.restoreReportComment(id);
    fetchData();
  };

  const columns: Column<ReportComment>[] = [
    {
      key: 'report_id',
      header: '报告 ID',
      width: '140px',
      render: (c) => (
        <span className="font-mono text-xs text-zinc-500">{c.report_id.slice(0, 12)}…</span>
      ),
    },
    {
      key: 'nickname',
      header: '昵称',
      render: (c) => (
        <div className="text-sm text-white">{c.nickname || '匿名用户'}</div>
      ),
    },
    {
      key: 'content',
      header: '内容',
      render: (c) => (
        <p className="text-sm text-zinc-300 max-w-xs truncate">{c.content}</p>
      ),
    },
    {
      key: 'ip',
      header: 'IP',
      width: '100px',
      render: (c) => (
        <span className="font-mono text-xs text-zinc-500">{c.ip}</span>
      ),
    },
    {
      key: 'location',
      header: '位置',
      width: '130px',
      render: (c) => (
        <span className="text-sm">
          {countryFlag(c.country)} {c.city || c.region || c.country || '未知'}
        </span>
      ),
    },
    {
      key: 'status',
      header: '状态',
      width: '100px',
      align: 'center',
      render: (c) => (
        <StatusBadge
          status={c.status === 'visible' ? 'approved' : c.status === 'hidden' ? 'rejected' : 'pending'}
        />
      ),
    },
    {
      key: 'created_at',
      header: '时间',
      width: '110px',
      render: (c) => (
        <span className="text-xs text-zinc-500">{fmtRelative(c.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          {c.status === 'visible' ? (
            <button
              className="admin-btn subtle sm"
              onClick={(e) => { e.stopPropagation(); handleHide(c.id); }}
              title="隐藏评论"
            >
              <EyeOff size={13} />
            </button>
          ) : (
            <button
              className="admin-btn sm"
              style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}
              onClick={(e) => { e.stopPropagation(); handleRestore(c.id); }}
              title="恢复评论"
            >
              <Eye size={13} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="admin-content">
      <PageHeader
        eyebrow="内容管理"
        title="报告评论"
        icon={<MessageCircle size={20} />}
        metrics={data ? [
          { label: '总评论', value: fmtNumber(data.stats.total), accent: 'emerald' },
          { label: '已显示', value: fmtNumber(data.stats.visible), accent: 'blue' },
          { label: '已隐藏', value: fmtNumber(data.stats.hidden), accent: 'amber' },
          { label: '被举报', value: fmtNumber(data.stats.reports), accent: 'rose' },
        ] : undefined}
      />

      {loading && !data ? (
        <div className="admin-grid admin-grid-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} height={80} />)}
        </div>
      ) : (
        <DataTable
          data={data?.comments ?? []}
          columns={columns}
          loading={loading}
          searchPlaceholder="搜索评论内容、昵称..."
          emptyTitle="暂无评论"
          emptyDescription="暂无报告评论"
        />
      )}
    </div>
  );
}

export default ReportCommentsPage;
