// Client Intake Page - 企业出海服务客户信息采集表
import { useState, useMemo } from 'react';
import { Inbox, User, Building, Globe2, Phone, Mail, ClipboardList } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable, type Column } from '../components/data-table/DataTable';
import { Modal } from '../components/ui/Modal';
import api from '../services/api';
import type { ClientIntake, ClientIntakeResponse } from '../types/admin';
import { toast } from 'sonner';

const STAGE_LABEL: Record<string, string> = {
  planning: '计划出海', exploring: '初步探索', testing: '小范围试水', scaling: '规模化扩张', established: '已建立成熟业务',
};

const COMPANY_TYPE_LABEL: Record<string, string> = {
  private: '民营企业', state: '国有企业', joint: '中外合资', foreign: '外资企业', public: '上市公司', startup: '初创企业',
};

const BUDGET_LABEL: Record<string, string> = {
  'under10w': '<10万', '10w-30w': '10-30万', '30w-50w': '30-50万', '50w-100w': '50-100万',
  '100w-300w': '100-300万', '300w-500w': '300-500万', '500w-1000w': '500-1000万', 'above1000w': '>1000万', tbd: '待定',
};

const INDUSTRY_LABEL: Record<string, string> = {
  manufacturing: '制造业', ecommerce: '跨境电商', app: 'App/软件/游戏', consumer: '消费品', food: '食品/饮料',
  healthcare: '医疗器械/医药', energy: '新能源/光伏', service: '专业服务', education: '教育培训', finance: '金融科技',
  entertainment: '文化娱乐/内容', other: '其他',
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
    } catch (err) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useMemo(() => {
    load();
  }, [page, search, statusFilter]);

  const columns: Column<ClientIntake>[] = useMemo(() => [
    {
      key: 'company',
      header: '企业信息',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-700/40 to-teal-800/30 border border-white/[0.06] flex items-center justify-center shrink-0">
            <Building size={14} className="text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">{row.company_name || '—'}</div>
            <div className="text-xs text-zinc-500 truncate">{INDUSTRY_LABEL[row.industry || ''] || row.industry || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: '联系人',
      render: (row) => (
        <div>
          <div className="text-xs text-white truncate max-w-[160px]">{row.contact_name || '—'}</div>
          <div className="text-xs text-zinc-600 truncate">{row.contact_title || ''}</div>
        </div>
      ),
    },
    {
      key: 'contact_info',
      header: '联系方式',
      render: (row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-xs text-zinc-300"><Mail size={10} />{row.contact_email || '—'}</div>
          <div className="flex items-center gap-1 text-xs text-zinc-600"><Phone size={10} />{row.contact_phone || '—'}</div>
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
        <span className="text-xs text-emerald-400">{BUDGET_LABEL[row.budget || ''] || '—'}</span>
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
      render: (row) => <StatusBadge status={row.status as any || 'new'} />,
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
        status: editingStatus as any,
        notes: editingNotes,
      } as any);
      toast.success('已保存');
      setSelected(null);
      load();
    } catch (err) {
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
        searchPlaceholder="搜索企业名称、联系人..."
        onExport={exportCSV}
        toolbar={
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-border)] text-xs text-zinc-300 outline-none focus:border-emerald-500/40"
          >
            <option value="">全部状态</option>
            <option value="new">新提交</option>
            <option value="contacted">已联系</option>
            <option value="qualified">已合格</option>
            <option value="closed">已关闭</option>
          </select>
        }
        emptyTitle="暂无提交"
        emptyDescription={search ? '没有匹配的记录' : '客户填写信息采集表后会出现在这里'}
        emptyIcon={<Inbox size={28} />}
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
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* 基础信息 */}
            <div>
              <div className="text-xs text-emerald-400 uppercase tracking-widest mb-3 font-medium flex items-center gap-2">
                <User size={14} /> 基础信息
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '企业名称', value: selected.company_name },
                  { label: '英文名称', value: selected.company_name_en },
                  { label: '统一社会信用代码', value: selected.unified_code },
                  { label: '企业性质', value: COMPANY_TYPE_LABEL[selected.company_type || ''] },
                  { label: '成立时间', value: selected.establish_date },
                  { label: '注册资本', value: selected.registered_capital },
                  { label: '所属行业', value: INDUSTRY_LABEL[selected.industry || ''] },
                  { label: '产品品类', value: selected.product_category },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="text-sm text-white truncate">{item.value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 联系人信息 */}
            <div>
              <div className="text-xs text-blue-400 uppercase tracking-widest mb-3 font-medium flex items-center gap-2">
                <Phone size={14} /> 联系人
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '姓名', value: selected.contact_name },
                  { label: '职务', value: selected.contact_title },
                  { label: '手机', value: selected.contact_phone },
                  { label: '邮箱', value: selected.contact_email },
                  { label: '微信/WhatsApp', value: selected.contact_wechat },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="text-sm text-white truncate">{item.value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 出海现状 */}
            <div>
              <div className="text-xs text-amber-400 uppercase tracking-widest mb-3 font-medium flex items-center gap-2">
                <Globe2 size={14} /> 出海现状
              </div>
              <div className="space-y-2">
                <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-4">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">企业简介</div>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{selected.company_intro || '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '出海阶段', value: STAGE_LABEL[selected.overseas_stage || ''] },
                    { label: '海外子公司', value: selected.has_branch === 'yes' ? '有' : '无' },
                    { label: '海外营收', value: selected.has_revenue === 'yes' ? `${selected.overseas_revenue} / ${selected.revenue_ratio}` : '无' },
                    { label: '出海经验', value: selected.overseas_experience },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{item.label}</div>
                      <div className="text-sm text-white">{item.value || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 目标市场 */}
            <div>
              <div className="text-xs text-purple-400 uppercase tracking-widest mb-3 font-medium">目标市场</div>
              <div className="space-y-2">
                <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">目标市场</div>
                  <TagList items={selected.target_markets?.split(',').filter(Boolean) || []} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">时间规划</div>
                    <div className="text-sm text-white">{selected.market_timeline || '—'}</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">首选市场</div>
                    <div className="text-sm text-white">{selected.priority_markets || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 商业模式 */}
            <div>
              <div className="text-xs text-cyan-400 uppercase tracking-widest mb-3 font-medium">商业模式</div>
              <div className="space-y-2">
                <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">商业模式</div>
                  <TagList items={selected.business_model?.split(',').filter(Boolean) || []} />
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-4">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">核心产品/服务</div>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{selected.product_detail || '—'}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '平均客单价', value: selected.avg_price },
                    { label: '年供货能力', value: selected.supply_capacity },
                    { label: '自有供应链', value: selected.supply_chain },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{item.label}</div>
                      <div className="text-sm text-white">{item.value || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 服务需求 */}
            <div>
              <div className="text-xs text-rose-400 uppercase tracking-widest mb-3 font-medium">服务需求</div>
              <div className="space-y-2">
                <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">需要的服务类型</div>
                  <TagList items={selected.services?.split(',').filter(Boolean) || []} />
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-4">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">需求详细描述</div>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{selected.service_detail || '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">预算</div>
                    <div className="text-sm text-emerald-400">{BUDGET_LABEL[selected.budget || ''] || '—'}</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">时间紧迫度</div>
                    <div className="text-sm text-white">{selected.urgency || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 财务状况 */}
            <div>
              <div className="text-xs text-emerald-400 uppercase tracking-widest mb-3 font-medium">财务状况</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '年营收', value: selected.annual_revenue },
                  { label: '净利润率', value: selected.profit_rate },
                  { label: '可动用资金', value: selected.available_funds },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="text-sm text-white">{item.value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 竞争分析 */}
            <div>
              <div className="text-xs text-yellow-400 uppercase tracking-widest mb-3 font-medium">竞争优势</div>
              <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-4">
                <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{selected.advantages || '—'}</p>
              </div>
            </div>

            {/* 风险挑战 */}
            <div>
              <div className="text-xs text-orange-400 uppercase tracking-widest mb-3 font-medium">风险挑战</div>
              <div className="space-y-2">
                <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">主要挑战</div>
                  <TagList items={selected.challenges?.split(',').filter(Boolean) || []} />
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-4">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">过往问题</div>
                  <p className="text-sm text-zinc-300">{selected.past_problems || '—'}</p>
                </div>
              </div>
            </div>

            {/* 状态和备注 */}
            <div className="border-t border-[var(--admin-border)] pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-medium">处理状态</div>
                  <select
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--admin-card)] border border-[var(--admin-border)] text-sm text-white outline-none focus:border-emerald-500/40"
                  >
                    <option value="new">新提交</option>
                    <option value="contacted">已联系</option>
                    <option value="qualified">已合格</option>
                    <option value="closed">已关闭</option>
                  </select>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-medium">负责人</div>
                  <input
                    defaultValue={selected.assigned_to || ''}
                    placeholder="分配给..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--admin-card)] border border-[var(--admin-border)] text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/40"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-medium">内部备注</div>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  rows={3}
                  placeholder="添加处理备注..."
                  className="w-full px-4 py-3 rounded-xl bg-[var(--admin-card)] border border-[var(--admin-border)] text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/40 resize-none"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
