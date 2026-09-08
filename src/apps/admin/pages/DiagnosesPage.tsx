// DiagnosesPage — AI 诊断报告列表
import { useState, useCallback, useEffect } from 'react';
import { FileText, Eye, Download } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { DataTable, type Column } from '../components/data-table/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import { fmtRelative, fmtDateTime, fmtNumber, countryFlag } from '@/apps/admin/lib/format';
import { cn } from '@/lib/utils';
import { api } from '../services/api';
import type { DiagnosisReport } from '../types/admin';

const LIMIT = 15;

export function DiagnosesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [data, setData] = useState<{ total: number; data: DiagnosisReport[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<DiagnosisReport | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const res = await api.getDiagnoses({ page: p, limit: LIMIT, search: q });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData(1, '');
  }, [fetchData]);

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
    fetchData(1, v);
  }, [fetchData]);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    fetchData(p, search);
  }, [fetchData, search]);

  const handleView = (row: DiagnosisReport) => {
    setSelected(row);
    setModalOpen(true);
  };

  const exportCSV = () => {
    if (!data?.data) return;
    const rows = data.data;
    const headers = ['市场名', '国家', '分类', '产品类型', '机会评分', '分级', '创建时间'];
    const csv = [
      headers.join(','),
      ...rows.map(r => [
        r.market_name || r.market_name_en || '',
        r.country || '',
        r.category || '',
        r.product_type || '',
        r.diagnosis_report?.opportunityScore ?? '',
        r.qualification_decision?.leadTier || '',
        r.created_at || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnoses-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const leadTierBadge = (tier: string) => {
    const map: Record<string, string> = { L1: 'emerald', L2: 'amber', L3: 'zinc' };
    const cls = map[tier] || 'zinc';
    return <span className={cn('admin-badge', cls)}>{tier}</span>;
  };

  const columns: Column<DiagnosisReport>[] = [
    {
      key: 'market_name',
      header: '市场名',
      render: (r) => (
        <div>
          <div className="font-medium text-white">{r.market_name || r.market_name_en || '—'}</div>
          {r.market_name_en && r.market_name && (
            <div className="text-xs text-zinc-500">{r.market_name_en}</div>
          )}
        </div>
      ),
    },
    {
      key: 'country',
      header: '国家',
      render: (r) => (
        <span className="text-sm">{countryFlag(r.country)} {r.country || '—'}</span>
      ),
    },
    { key: 'category', header: '分类' },
    { key: 'product_type', header: '产品类型' },
    {
      key: 'opportunityScore',
      header: '机会评分',
      align: 'center',
      render: (r) => {
        const score = r.diagnosis_report?.opportunityScore ?? 0;
        const color = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-zinc-400';
        return <span className={cn('font-bold', color)}>{score}</span>;
      },
    },
    {
      key: 'leadTier',
      header: '分级',
      align: 'center',
      render: (r) => leadTierBadge(r.qualification_decision?.leadTier || '—'),
    },
    {
      key: 'created_at',
      header: '创建时间',
      render: (r) => (
        <span className="text-xs text-zinc-400">{fmtRelative(r.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      align: 'right',
      render: (r) => (
        <button
          className="admin-btn subtle sm"
          onClick={(e) => { e.stopPropagation(); handleView(r); }}
          title="查看详情"
        >
          <Eye size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="admin-content">
      <PageHeader
        eyebrow="数据分析"
        title="AI 诊断报告"
        icon={<FileText size={20} />}
        metrics={data ? [
          { label: '总报告数', value: fmtNumber(data.total) },
        ] : undefined}
        actions={
          <button className="admin-btn ghost sm" onClick={exportCSV}>
            <Download size={14} />导出
          </button>
        }
      />

      {loading && !data ? (
        <div className="admin-grid admin-grid-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} height={80} />)}
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
          searchPlaceholder="搜索市场名、分类..."
          onRowClick={handleView}
          emptyTitle="暂无诊断报告"
          emptyDescription="暂无 AI 诊断报告数据"
        />
      )}

      {/* Detail Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="诊断报告详情"
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="admin-grid admin-grid-2 gap-3">
              <div className="admin-card pad-sm">
                <div className="admin-section-title">基本信息</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">市场</span>
                    <span className="text-white">{selected.market_name || selected.market_name_en || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">国家</span>
                    <span>{countryFlag(selected.country)} {selected.country || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">分类</span>
                    <span>{selected.category || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">产品类型</span>
                    <span>{selected.product_type || '—'}</span>
                  </div>
                </div>
              </div>
              <div className="admin-card pad-sm">
                <div className="admin-section-title">评分</div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">机会评分</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {selected.diagnosis_report?.opportunityScore ?? '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">复杂度评分</div>
                    <div className="text-lg font-semibold text-white">
                      {selected.diagnosis_report?.complexityScore ?? '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">lead 分级</div>
                    {leadTierBadge(selected.qualification_decision?.leadTier || '—')}
                  </div>
                </div>
              </div>
            </div>

            {/* Report content */}
            <div className="admin-card">
              <div className="admin-section-title">诊断摘要</div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {selected.diagnosis_report?.summary || '—'}
              </p>
            </div>

            <div className="admin-card">
              <div className="admin-section-title">建议</div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {selected.diagnosis_report?.recommendation || '—'}
              </p>
            </div>

            <div className="admin-grid admin-grid-2 gap-3">
              <div className="admin-card pad-sm">
                <div className="admin-section-title">市场进入决策</div>
                <p className="text-sm text-zinc-300">
                  {selected.diagnosis_report?.goToMarketDecision || '—'}
                </p>
              </div>
              <div className="admin-card pad-sm">
                <div className="admin-section-title">推荐路径</div>
                <p className="text-sm text-zinc-300">
                  {selected.diagnosis_report?.recommendedPath || '—'}
                </p>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-section-title">资质决策</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">审核适配度</span>
                  <span>{selected.qualification_decision?.reviewFit || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">升级原因</span>
                  <span>{selected.qualification_decision?.escalationReason || '—'}</span>
                </div>
                {selected.qualification_decision?.blockers?.length > 0 && (
                  <div>
                    <div className="text-zinc-500 mb-1">阻碍因素</div>
                    <div className="flex flex-wrap gap-1">
                      {selected.qualification_decision.blockers.map((b, i) => (
                        <span key={i} className="admin-badge danger">{b}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-zinc-600 text-right">
              创建于 {fmtDateTime(selected.created_at)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default DiagnosesPage;
