// Diagnoses Page
import { useState, useMemo } from 'react';
import { Brain, Globe2, Target, TrendingUp, AlertTriangle, CheckCircle2, FileSearch } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable, type Column } from '../components/data-table/DataTable';
import { Modal } from '../components/ui/Modal';
import { useDiagnoses } from '../hooks/useAdminData';
import type { DiagnosisReport } from '../types/admin';
import { toast } from 'sonner';

const STAGE_LABEL: Record<string, string> = {
  idea: '构思阶段', pilot: '试点阶段', launch: '上市阶段', scale: '规模化',
};

const BUDGET_LABEL: Record<string, string> = {
  'below-500k': '<50万', '500k-2m': '50-200万', '2m-5m': '200-500万', 'above-5m': '>500万',
};

const VALIDATION_LABEL: Record<string, string> = {
  none: '无', 'domestic-only': '仅国内', 'some-testing': '部分测试', 'existing-overseas': '已有海外',
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

function scoreColor(s: number) {
  if (s >= 70) return 'text-emerald-400';
  if (s >= 40) return 'text-amber-400';
  return 'text-red-400';
}

function decisionColor(decision: string) {
  if (decision === 'expert_review') return 'border-emerald-500/30 bg-emerald-500/5';
  if (decision === 'prepare_first') return 'border-amber-500/30 bg-amber-500/5';
  return 'border-blue-500/30 bg-blue-500/5';
}

function decisionLabel(decision: string) {
  if (decision === 'expert_review') return '建议专家评审';
  if (decision === 'prepare_first') return '建议准备';
  return '建议立即进入';
}

export function DiagnosesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DiagnosisReport | null>(null);

  const { data, loading } = useDiagnoses({
    page,
    limit: 20,
    search: search || undefined,
  });

  const columns: Column<DiagnosisReport>[] = useMemo(() => [
    {
      key: 'market',
      header: '目标市场',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/15 to-blue-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Brain size={14} className="text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {row.market_name || row.market_name_en || row.market_id}
            </div>
            <div className="text-xs text-zinc-500 truncate">{row.category}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'stage',
      header: '项目',
      render: (row) => (
        <div className="text-xs">
          <div className="text-zinc-300">{STAGE_LABEL[row.diagnosis_input?.projectStage] || '—'}</div>
          <div className="text-zinc-600">{BUDGET_LABEL[row.diagnosis_input?.budget] || ''}</div>
        </div>
      ),
    },
    {
      key: 'tier',
      header: '线索分级',
      width: '120px',
      render: (row) => <StatusBadge status={row.qualification_decision?.leadTier || 'L1'} />,
    },
    {
      key: 'decision',
      header: '决策建议',
      width: '120px',
      render: (row) => <StatusBadge status={row.qualification_decision?.reviewFit || 'self_serve'} />,
    },
    {
      key: 'score',
      header: '机会分',
      width: '90px',
      align: 'right',
      render: (row) => {
        const score = row.diagnosis_report?.opportunityScore || 0;
        return (
          <div className={`text-sm font-bold ${scoreColor(score)}`}>
            {score}<span className="text-xs text-zinc-600">/100</span>
          </div>
        );
      },
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

  const exportCSV = () => {
    if (!data?.data.length) return;
    const headers = ['市场', '分类', '项目阶段', '预算', '机会分', '复杂度', '决策', '时间'];
    const rows = data.data.map(r => [
      r.market_name || r.market_id,
      r.category,
      STAGE_LABEL[r.diagnosis_input?.projectStage] || '',
      BUDGET_LABEL[r.diagnosis_input?.budget] || '',
      r.diagnosis_report?.opportunityScore || 0,
      r.diagnosis_report?.complexityScore || 0,
      r.qualification_decision?.reviewFit || '',
      r.created_at,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnoses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('已导出 CSV');
  };

  return (
    <>
      <PageHeader
        title="AI 诊断报告"
        description="查看 AI 生成的市场诊断与决策建议"
        icon={<Brain size={18} className="text-emerald-400" />}
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
        onRowClick={setSelected}
        onSearchChange={setSearch}
        searchValue={search}
        searchPlaceholder="搜索市场、分类..."
        onExport={exportCSV}
        emptyTitle="暂无诊断报告"
        emptyDescription="用户完成 AI 诊断后会生成报告"
        emptyIcon={<FileSearch size={28} />}
      />

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="AI 诊断报告"
        description={selected ? `${selected.market_name || selected.market_name_en || selected.market_id} · ${selected.category}` : ''}
        size="xl"
      >
        {selected && (
          <div className="p-6 space-y-5">
            {/* Score Cards */}
            {selected.diagnosis_report && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: '市场机会', value: selected.diagnosis_report.opportunityScore, suffix: '/100',
                    icon: <TrendingUp size={16} className="text-emerald-400" />,
                  },
                  {
                    label: '合规复杂度', value: selected.diagnosis_report.complexityScore, suffix: '/100',
                    icon: <AlertTriangle size={16} className="text-amber-400" />,
                  },
                  {
                    label: '预算压力', value: selected.diagnosis_report.budgetPressure === 'low' ? '低' :
                      selected.diagnosis_report.budgetPressure === 'medium' ? '中' : '高', suffix: '',
                    icon: <Target size={16} className="text-blue-400" />,
                  },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-2 text-[10px] text-zinc-500 uppercase tracking-widest">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <div className={`text-2xl font-bold ${
                      item.suffix ? scoreColor(item.value as number) : 'text-white'
                    }`}>
                      {item.value}{item.suffix}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Decision Box */}
            {selected.diagnosis_report && (
              <div className={`rounded-2xl border p-5 ${decisionColor(selected.diagnosis_report.goToMarketDecision)}`}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={14} className={
                    selected.diagnosis_report.goToMarketDecision === 'expert_review' ? 'text-emerald-400' :
                    selected.diagnosis_report.goToMarketDecision === 'prepare_first' ? 'text-amber-400' : 'text-blue-400'
                  } />
                  <span className="text-xs font-medium uppercase tracking-widest text-zinc-300">
                    {decisionLabel(selected.diagnosis_report.goToMarketDecision)}
                  </span>
                </div>
                <p className="text-sm text-white leading-relaxed mb-2">
                  {selected.diagnosis_report.summary}
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {selected.diagnosis_report.recommendation}
                </p>
                {selected.diagnosis_report.primaryBlocker && (
                  <div className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
                    <div className="text-xs text-amber-400 font-medium mb-1">主要障碍</div>
                    <div className="text-sm text-amber-100">{selected.diagnosis_report.primaryBlocker}</div>
                  </div>
                )}
              </div>
            )}

            {/* User Input */}
            {selected.diagnosis_input && (
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-medium">用户输入</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '项目阶段', value: STAGE_LABEL[selected.diagnosis_input.projectStage] || '—' },
                    { label: '预算', value: BUDGET_LABEL[selected.diagnosis_input.budget] || '—' },
                    { label: '认证状态', value: VALIDATION_LABEL[selected.diagnosis_input.validationStatus] || '—' },
                    { label: '目标市场数', value: selected.diagnosis_input.targetMarketsCount || '—' },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{item.label}</div>
                      <div className="text-sm text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
                {selected.diagnosis_input.keyQuestion && (
                  <div className="mt-2 rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">核心问题</div>
                    <div className="text-sm text-zinc-300">{selected.diagnosis_input.keyQuestion}</div>
                  </div>
                )}
              </div>
            )}

            {/* Qualification Decision */}
            {selected.qualification_decision && (
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-medium">资格评估</div>
                <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-4 space-y-3">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {selected.qualification_decision.escalationReason}
                  </p>
                  {selected.qualification_decision.blockers?.length > 0 && (
                    <div>
                      <div className="text-xs text-amber-400 font-medium mb-2">当前障碍</div>
                      <div className="flex flex-wrap gap-2">
                        {selected.qualification_decision.blockers.map((b, i) => (
                          <span key={i} className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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