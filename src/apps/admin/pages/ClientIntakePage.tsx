// Client Intake Page - 企业出海服务客户信息采集表
import { useState, useEffect, useMemo } from 'react';
import { ClipboardList, Building, Phone, Mail, Globe2, User } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable, type Column } from '../components/data-table/DataTable';
import { Modal } from '../components/ui/Modal';
import api from '../services/api';
import { fmtRelative, fmtDateTime } from '@/apps/admin/lib/format';
import { toast } from 'sonner';
import type { ClientIntake } from '../types/admin';

const STAGE_LABEL: Record<string, string> = {
  planning: '规划中',
  exploring: '初步探索',
  pilot: '试水阶段',
  testing: '小范围试水',
  scaling: '规模化扩张',
  established: '已建立成熟业务',
};

const COMPANY_TYPE_LABEL: Record<string, string> = {
  private: '民营企业',
  state: '国有企业',
  joint: '中外合资',
  foreign: '外资企业',
  public: '上市公司',
  startup: '初创企业',
};

const BUDGET_LABEL: Record<string, string> = {
  'under50w': '<50万',
  '50w-200w': '50-200万',
  '200w-500w': '200-500万',
  '500w-2000w': '500-2000万',
  'above2000w': '>2000万',
  'under10w': '<10万',
  '10w-30w': '10-30万',
  '30w-50w': '30-50万',
  '50w-100w': '50-100万',
  '100w-300w': '100-300万',
  '300w-500w': '300-500万',
  '500w-1000w': '500-1000万',
  'above1000w': '>1000万',
  tbd: '待定',
};

const INDUSTRY_LABEL: Record<string, string> = {
  manufacturing: '制造业',
  ecommerce: '跨境电商',
  app: 'App/软件/游戏',
  consumer: '消费品',
  food: '食品/饮料',
  healthcare: '医疗器械/医药',
  energy: '新能源/光伏',
  service: '专业服务',
  education: '教育培训',
  finance: '金融科技',
  entertainment: '文化娱乐/内容',
  tcm: '中医药',
  other: '其他',
};

// 行业色标
const INDUSTRY_COLOR: Record<string, string> = {
  manufacturing: 'text-blue-400',
  ecommerce: 'text-purple-400',
  app: 'text-cyan-400',
  consumer: 'text-amber-400',
  food: 'text-orange-400',
  healthcare: 'text-rose-400',
  energy: 'text-green-400',
  service: 'text-sky-400',
  education: 'text-indigo-400',
  finance: 'text-yellow-400',
  entertainment: 'text-pink-400',
  tcm: 'text-emerald-400',
  other: 'text-zinc-400',
};

const ASSESSMENT_INDUSTRY: Record<string, string> = { tcm: '中医药' };

// 渲染评估详情
function renderAssessmentDetail(additionalNote: string) {
  if (!additionalNote || !additionalNote.startsWith('{')) return null;
  try {
    const a = JSON.parse(additionalNote);
    const resultsMap: Record<string, any> = {};
    (a.results || []).forEach((r: any) => { resultsMap[r.countryId] = r; });
    return (
      <div className="space-y-3">
        <div className="admin-card p-4">
          <div className="admin-section-title">评估摘要</div>
          <div className="admin-grid admin-grid-3">
            <div className="text-center">
              <div className="text-lg text-emerald-400 font-medium">{ASSESSMENT_INDUSTRY[a.industry] || a.industry || '—'}</div>
              <div className="text-xs text-zinc-500">行业</div>
            </div>
            <div className="text-center">
              <div className="text-lg text-blue-400 font-medium">{STAGE_LABEL[a.stage] || a.stage || '—'}</div>
              <div className="text-xs text-zinc-500">阶段</div>
            </div>
            <div className="text-center">
              <div className="text-lg text-amber-400 font-medium">{BUDGET_LABEL[a.budget] || a.budget || '—'}</div>
              <div className="text-xs text-zinc-500">预算</div>
            </div>
          </div>
        </div>
        {(a.countries || []).map((c: any, idx: number) => {
          const r = resultsMap[c.countryId] || {};
          const conf = r.weightedConfidence || (r.confidenceGrade === 'A' ? 0.9 : r.confidenceGrade === 'B' ? 0.75 : r.confidenceGrade === 'C' ? 0.65 : 0.5);
          return (
            <div key={idx} className="admin-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-white">{c.countryName || c.countryId}</div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    r.recommendation === 'recommended' ? 'bg-emerald-500/20 text-emerald-400'
                    : r.recommendation === 'option' ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-red-500/20 text-red-400'
                  }`}>
                    {r.recommendation === 'recommended' ? '推荐' : r.recommendation === 'option' ? '可选' : '不建议'}
                  </span>
                  <span className="text-lg font-bold text-white">{(r.adjustedScore || r.readinessScore || 0).toFixed(1)}</span>
                  <span className="text-xs text-zinc-500">分</span>
                </div>
              </div>
              <div className="admin-grid admin-grid-4">
                <div className="text-center p-2 bg-white/[0.02] rounded">
                  <div className="text-zinc-500 text-xs">置信度</div>
                  <div className="text-white font-medium text-sm">{(conf * 100).toFixed(0)}%</div>
                </div>
                <div className="text-center p-2 bg-white/[0.02] rounded">
                  <div className="text-zinc-500 text-xs">准入模式</div>
                  <div className="text-white font-medium text-sm truncate">
                    {c.entryMode === 'cross_border_direct' ? '跨境直销' : c.entryMode || '—'}
                  </div>
                </div>
                <div className="text-center p-2 bg-white/[0.02] rounded">
                  <div className="text-zinc-500 text-xs">触发门控</div>
                  <div className="text-white font-medium text-sm">{(r.triggeredGates || []).length}</div>
                </div>
                <div className="text-center p-2 bg-white/[0.02] rounded">
                  <div className="text-zinc-500 text-xs">待处理门控</div>
                  <div className="text-white font-medium text-sm">{(r.pendingGates || []).length}</div>
                </div>
              </div>
              {c.gates && Object.keys(c.gates).length > 0 && (
                <div className="mt-3">
                  <div className="admin-section-title">门控检查</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(c.gates).map(([gate, result]: [string, any]) => (
                      <span key={gate} className={`inline-block px-2 py-0.5 rounded text-xs ${
                        result === 'pass' ? 'bg-emerald-500/20 text-emerald-400'
                        : result === 'fail' ? 'bg-red-500/20 text-red-400'
                        : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {gate}: {result === 'pass' ? '通过' : result === 'fail' ? '失败' : '待定'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  } catch {
    return (
      <div className="admin-card p-4">
        <pre className="text-xs text-zinc-400 whitespace-pre-wrap overflow-auto max-h-48">{additionalNote}</pre>
      </div>
    );
  }
}

function TagList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return <span className="text-zinc-500">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => (
        <span key={i} className="inline-block rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-300">
          {item}
        </span>
      ))}
    </div>
  );
}

// 字段块组件
function FieldBlock({ label, value, accent }: { label: string; value: string | null | undefined; accent?: string }) {
  return (
    <div className="admin-card p-3">
      <div className="admin-section-title">{label}</div>
      <div className={`text-sm text-white truncate ${accent || ''}`}>{value || '—'}</div>
    </div>
  );
}

export function ClientIntakePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [data, setData] = useState<{ total: number; data: ClientIntake[]; page: number; limit: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ClientIntake | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingStatus, setEditingStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await api.getClientIntake({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setData(result);
    } catch {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search, statusFilter]);

  // KPI metrics
  const metrics = useMemo(() => {
    const rows = data?.data || [];
    const total = data?.total || 0;
    const newCount = rows.filter(r => r.status === 'new').length;
    const contactedCount = rows.filter(r => r.status === 'contacted').length;
    const qualifiedCount = rows.filter(r => r.status === 'qualified').length;
    return [
      { label: '总提交', value: total, accent: 'emerald' as const },
      { label: '新提交', value: newCount, accent: 'blue' as const },
      { label: '已联系', value: contactedCount, accent: 'amber' as const },
      { label: '已合格', value: qualifiedCount, accent: 'purple' as const },
    ];
  }, [data]);

  const columns: Column<ClientIntake>[] = useMemo(() => [
    {
      key: 'company',
      header: '企业信息',
      render: (row) => {
        const industryKey = row.industry || '';
        const colorCls = INDUSTRY_COLOR[industryKey] || 'text-zinc-400';
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-700/40 to-teal-800/30 border border-white/[0.06] flex items-center justify-center shrink-0">
              <Building size={14} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-white truncate">{row.company_name || '—'}</div>
              <div className={`text-xs truncate ${colorCls}`}>{INDUSTRY_LABEL[industryKey] || row.industry || '—'}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'contact',
      header: '联系人',
      render: (row) => (
        <div>
          <div className="text-xs text-white truncate max-w-[140px]">{row.contact_name || '—'}</div>
          <div className="text-xs text-zinc-500 truncate">{row.contact_title || ''}</div>
        </div>
      ),
    },
    {
      key: 'contact_info',
      header: '联系方式',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-xs text-zinc-300">
            <Mail size={10} />{row.contact_email || '—'}
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-600">
            <Phone size={10} />{row.contact_phone || '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'stage',
      header: '出海阶段',
      width: '100px',
      render: (row) => (
        <span className="text-xs text-zinc-300">{STAGE_LABEL[row.overseas_stage || ''] || '—'}</span>
      ),
    },
    {
      key: 'target_markets',
      header: '目标市场',
      render: (row) => {
        const markets = row.target_markets?.split(',').filter(Boolean) || [];
        return <TagList items={markets.slice(0, 2)} />;
      },
    },
    {
      key: 'budget',
      header: '预算',
      width: '100px',
      render: (row) => (
        <span className="text-xs text-emerald-400 font-medium">{BUDGET_LABEL[row.budget || ''] || '—'}</span>
      ),
    },
    {
      key: 'services',
      header: '需求服务',
      render: (row) => {
        const services = row.services?.split(',').filter(Boolean) || [];
        return <TagList items={services.slice(0, 2)} />;
      },
    },
    {
      key: 'status',
      header: '状态',
      width: '100px',
      render: (row) => <StatusBadge status={row.status || 'new'} />,
    },
    {
      key: 'created_at',
      header: '时间',
      width: '100px',
      render: (row) => <span className="text-xs text-zinc-500">{fmtRelative(row.created_at)}</span>,
    },
  ], []);

  const openDetail = (row: ClientIntake) => {
    setSelected(row);
    setEditingStatus(row.status || 'new');
    setEditingNotes(row.notes || '');
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.updateClientIntake(selected.id.toString(), {
        status: editingStatus,
        notes: editingNotes,
      });
      toast.success('已保存');
      setSelected(null);
      load();
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    if (!data?.data.length) return;
    const headers = ['企业名称', '联系人', '职务', '邮箱', '电话', '所属行业', '出海阶段', '目标市场', '预算', '提交时间'];
    const rows = data.data.map(s => [
      s.company_name || '', s.contact_name || '', s.contact_title || '', s.contact_email || '',
      s.contact_phone || '', INDUSTRY_LABEL[s.industry || ''] || '', STAGE_LABEL[s.overseas_stage || ''] || '',
      s.target_markets || '', BUDGET_LABEL[s.budget || ''] || '', s.created_at,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-intake-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('已导出 CSV');
  };

  return (
    <>
      <PageHeader
        title="客户信息采集表"
        description="企业出海服务客户信息采集表提交记录"
        icon={<ClipboardList size={18} className="text-emerald-400" />}
        metrics={metrics}
        toolbar={
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="搜索企业名称、联系人..."
                  className="admin-input pl-9"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="admin-select"
            >
              <option value="">全部状态</option>
              <option value="new">新提交</option>
              <option value="contacted">已联系</option>
              <option value="qualified">已合格</option>
              <option value="closed">已关闭</option>
            </select>
          </div>
        }
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
        onExport={exportCSV}
        emptyTitle="暂无提交"
        emptyDescription={search ? '没有匹配的记录' : '客户填写信息采集表后会出现在这里'}
        emptyIcon={<ClipboardList size={28} />}
      />

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.company_name || '企业信息'}
        description={selected ? `${selected.contact_name || ''} · ${fmtDateTime(selected.created_at)}` : ''}
        size="xl"
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

            {/* 企业基础信息 */}
            <div>
              <div className="admin-section-title flex items-center gap-2">
                <User size={12} className="text-emerald-400" />
                企业基础信息
              </div>
              <div className="admin-grid admin-grid-4">
                <FieldBlock label="企业名称" value={selected.company_name} />
                <FieldBlock label="英文名称" value={selected.company_name_en} />
                <FieldBlock label="统一社会信用代码" value={selected.unified_code} />
                <FieldBlock label="企业性质" value={COMPANY_TYPE_LABEL[selected.company_type || '']} />
                <FieldBlock label="成立时间" value={selected.establish_date} />
                <FieldBlock label="注册资本" value={selected.registered_capital} />
                <FieldBlock label="所属行业" value={INDUSTRY_LABEL[selected.industry || '']} />
                <FieldBlock label="产品品类" value={selected.product_category} />
              </div>
            </div>

            {/* 联系人信息 */}
            <div>
              <div className="admin-section-title flex items-center gap-2">
                <Phone size={12} className="text-blue-400" />
                联系人信息
              </div>
              <div className="admin-grid admin-grid-4">
                <FieldBlock label="姓名" value={selected.contact_name} />
                <FieldBlock label="职务" value={selected.contact_title} />
                <FieldBlock label="手机" value={selected.contact_phone} />
                <FieldBlock label="邮箱" value={selected.contact_email} />
                <FieldBlock label="微信/WhatsApp" value={selected.contact_wechat} />
              </div>
            </div>

            {/* 出海现状 */}
            <div>
              <div className="admin-section-title flex items-center gap-2">
                <Globe2 size={12} className="text-amber-400" />
                出海现状
              </div>
              <div className="space-y-3">
                {selected.company_intro && (
                  <div className="admin-card p-4">
                    <div className="admin-section-title">企业简介</div>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{selected.company_intro}</p>
                  </div>
                )}
                <div className="admin-grid admin-grid-4">
                  <FieldBlock label="出海阶段" value={STAGE_LABEL[selected.overseas_stage || '']} />
                  <FieldBlock label="海外子公司" value={selected.has_branch === 'yes' ? '有' : '无'} />
                  <FieldBlock label="海外营收"
                    value={selected.has_revenue === 'yes'
                      ? `${selected.overseas_revenue || ''} / ${selected.revenue_ratio || ''}`
                      : '无'} />
                  <FieldBlock label="出海经验" value={selected.overseas_experience} />
                </div>
              </div>
            </div>

            {/* 目标市场 */}
            <div>
              <div className="admin-section-title">目标市场</div>
              <div className="admin-grid admin-grid-4">
                <div className="admin-card p-3">
                  <div className="admin-section-title">目标市场</div>
                  <TagList items={selected.target_markets?.split(',').filter(Boolean) || []} />
                </div>
                <FieldBlock label="时间规划" value={selected.market_timeline} />
                <FieldBlock label="首选市场" value={selected.priority_markets} />
                <FieldBlock label="市场关注因素" value={selected.market_factors} />
              </div>
            </div>

            {/* 商业模式 */}
            <div>
              <div className="admin-section-title">商业模式</div>
              <div className="space-y-3">
                <div className="admin-card p-3">
                  <div className="admin-section-title">商业模式类型</div>
                  <TagList items={selected.business_model?.split(',').filter(Boolean) || []} />
                </div>
                <div className="admin-card p-4">
                  <div className="admin-section-title">核心产品/服务</div>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{selected.product_detail || '—'}</p>
                </div>
                <div className="admin-grid admin-grid-4">
                  <FieldBlock label="平均客单价" value={selected.avg_price} />
                  <FieldBlock label="年供货能力" value={selected.supply_capacity} />
                  <FieldBlock label="自有供应链" value={selected.supply_chain} />
                  <FieldBlock label="资质认证" value={selected.has_cert === 'yes' ? selected.cert_detail : '无'} />
                </div>
              </div>
            </div>

            {/* 服务需求 */}
            <div>
              <div className="admin-section-title">服务需求</div>
              <div className="space-y-3">
                <div className="admin-card p-3">
                  <div className="admin-section-title">需要的服务类型</div>
                  <TagList items={selected.services?.split(',').filter(Boolean) || []} />
                </div>
                <div className="admin-card p-4">
                  <div className="admin-section-title">需求详细描述</div>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{selected.service_detail || '—'}</p>
                </div>
                <div className="admin-grid admin-grid-4">
                  <div className="admin-card p-3">
                    <div className="admin-section-title">预算</div>
                    <div className="text-sm text-emerald-400 font-medium">{BUDGET_LABEL[selected.budget || ''] || '—'}</div>
                  </div>
                  <FieldBlock label="预算重点" value={selected.budget_focus} />
                  <FieldBlock label="时间紧迫度" value={selected.urgency} />
                  <FieldBlock label="现有服务商" value={selected.existing_partners} />
                </div>
              </div>
            </div>

            {/* 财务状况 */}
            <div>
              <div className="admin-section-title">财务状况</div>
              <div className="admin-grid admin-grid-4">
                <FieldBlock label="年营收" value={selected.annual_revenue} />
                <FieldBlock label="净利润率" value={selected.profit_rate} />
                <FieldBlock label="可动用资金" value={selected.available_funds} />
                <FieldBlock label="融资需求" value={selected.finance_need} />
              </div>
              {selected.financial_note && (
                <div className="admin-card p-4 mt-3">
                  <div className="admin-section-title">财务备注</div>
                  <p className="text-sm text-zinc-300">{selected.financial_note}</p>
                </div>
              )}
            </div>

            {/* 评估详情 */}
            {selected.additional_note && selected.additional_note.startsWith('{') && (
              <div>
                <div className="admin-section-title text-pink-400">评估详情</div>
                {renderAssessmentDetail(selected.additional_note)}
              </div>
            )}

            {/* 竞争分析 */}
            <div>
              <div className="admin-section-title">竞争分析</div>
              <div className="admin-grid admin-grid-4">
                <div className="admin-card p-4">
                  <div className="admin-section-title">主要竞争对手</div>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{selected.competitors || '—'}</p>
                </div>
                <div className="admin-card p-4">
                  <div className="admin-section-title">竞争优势</div>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{selected.advantages || '—'}</p>
                </div>
                <FieldBlock label="关键成功因素" value={selected.key_factors} />
              </div>
            </div>

            {/* 风险挑战 */}
            <div>
              <div className="admin-section-title">风险挑战</div>
              <div className="space-y-3">
                <div className="admin-card p-3">
                  <div className="admin-section-title">主要挑战</div>
                  <TagList items={selected.challenges?.split(',').filter(Boolean) || []} />
                </div>
                <div className="admin-card p-4">
                  <div className="admin-section-title">过往问题</div>
                  <p className="text-sm text-zinc-300">{selected.past_problems || '—'}</p>
                </div>
                <FieldBlock label="风险承受度" value={selected.risk_tolerance} />
              </div>
            </div>

            {/* 状态和备注 */}
            <div className="border-t border-[var(--admin-border)] pt-4">
              <div className="admin-grid admin-grid-2">
                <div>
                  <div className="admin-section-title">处理状态</div>
                  <select
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value)}
                    className="admin-select"
                  >
                    <option value="new">新提交</option>
                    <option value="contacted">已联系</option>
                    <option value="qualified">已合格</option>
                    <option value="closed">已关闭</option>
                  </select>
                </div>
                <div>
                  <div className="admin-section-title">负责人</div>
                  <input
                    type="text"
                    defaultValue={selected.assigned_to || ''}
                    placeholder="分配给..."
                    className="admin-input"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="admin-section-title">内部备注</div>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  rows={3}
                  placeholder="添加处理备注..."
                  className="admin-textarea"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
