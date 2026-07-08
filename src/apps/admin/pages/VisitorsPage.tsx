// Visitors Page
import { useState, useMemo } from 'react';
import { Users, Globe2, Activity } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { DataTable, type Column } from '../components/data-table/DataTable';
import { Modal } from '../components/ui/Modal';
import { KPICard } from '../components/ui/KPICard';
import { DonutChart } from '../components/charts/DonutChart';
import { useVisitors } from '../hooks/useAdminData';
import type { Visitor } from '../types/admin';
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

export function VisitorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Visitor | null>(null);

  const { data, loading } = useVisitors({
    page,
    limit: 20,
    search: search || undefined,
  });

  const columns: Column<Visitor>[] = useMemo(() => [
    {
      key: 'contact',
      header: '访客',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-blue-300">
              {(row.contact_name || row.email || 'V')[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {row.contact_name || row.email || '匿名访客'}
            </div>
            <div className="text-xs text-zinc-500 truncate">{row.company_name || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact_info',
      header: '联系方式',
      render: (row) => (
        <div>
          <div className="text-xs text-zinc-300 truncate max-w-[180px]">{row.email || '—'}</div>
          <div className="text-xs text-zinc-600">{row.phone || ''}</div>
        </div>
      ),
    },
    {
      key: 'markets',
      header: '目标市场',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.selected_markets || []).slice(0, 3).map((m, i) => (
            <span key={i} className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
              {m}
            </span>
          ))}
          {(row.selected_markets || []).length > 3 && (
            <span className="text-[10px] text-zinc-500">+{(row.selected_markets || []).length - 3}</span>
          )}
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
      key: 'visits',
      header: '访问',
      width: '80px',
      align: 'right',
      render: (row) => (
        <span className="text-sm text-zinc-300">{row.visit_count || 1}</span>
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

  const exportCSV = () => {
    if (!data?.data.length) return;
    const headers = ['姓名', '邮箱', '电话', '公司', '国家', '访问次数', '首次访问'];
    const rows = data.data.map(v => [
      v.contact_name || '', v.email || '', v.phone || '', v.company_name || '',
      v.country || '', v.visit_count || 1, v.first_visit || v.created_at,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('已导出 CSV');
  };

  // Aggregate data
  const countryStats = useMemo(() => {
    if (!data?.data) return [];
    const map = new Map<string, number>();
    data.data.forEach(v => {
      const c = v.country || 'Unknown';
      map.set(c, (map.get(c) || 0) + 1);
    });
    const colors = ['#34d399', '#60a5fa', '#fbbf24', '#a78bfa', '#f472b6', '#22d3ee'];
    return Array.from(map.entries()).map(([label, value], i) => ({
      label: `${COUNTRY_FLAG[label] || '🌐'} ${label}`,
      value,
      color: colors[i % colors.length],
    })).sort((a, b) => b.value - a.value);
  }, [data?.data]);

  return (
    <>
      <PageHeader
        title="访客管理"
        description="浏览用户访问记录与地理分布"
        icon={<Users size={18} className="text-blue-400" />}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KPICard
          label="总访客数"
          value={data?.total || 0}
          accent="emerald"
          icon={<Users size={18} />}
        />
        <KPICard
          label="国家/地区"
          value={countryStats.length}
          accent="blue"
          icon={<Globe2 size={18} />}
        />
        <KPICard
          label="本页活跃度"
          value={data?.data.filter(v => (v.visit_count || 1) > 1).length || 0}
          accent="purple"
          icon={<Activity size={18} />}
          description="回访访客"
        />
      </div>

      {/* Distribution */}
      {countryStats.length > 0 && (
        <div className="admin-card mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">访客地区分布</h3>
          <DonutChart data={countryStats} size={120} />
        </div>
      )}

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
        searchPlaceholder="搜索姓名、公司、电话..."
        onExport={exportCSV}
        emptyTitle="暂无访客"
        emptyDescription="用户访问后会自动出现在这里"
        emptyIcon={<Users size={28} />}
      />

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.contact_name || '匿名访客'}
        description={selected ? `${selected.company_name || '—'} · ${fmtDateTime(selected.created_at)}` : ''}
      >
        {selected && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '邮箱', value: selected.email },
                { label: '电话', value: selected.contact_phone || selected.phone },
                { label: '公司', value: selected.company_name },
                { label: '来源', value: selected.source || 'website' },
                { label: '国家/地区', value: selected.country },
                { label: '首次访问', value: fmtDateTime(selected.first_visit || selected.created_at) },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-3">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{item.label}</div>
                  <div className="text-sm text-white truncate">{item.value || '—'}</div>
                </div>
              ))}
            </div>

            {(selected.selected_markets || []).length > 0 && (
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-medium">目标市场</div>
                <div className="flex flex-wrap gap-2">
                  {selected.selected_markets.map((m, i) => (
                    <span key={i} className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl bg-white/[0.03] border border-[var(--admin-border)] p-4">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-medium">访问轨迹</div>
              <div className="space-y-2 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>首次访问</span>
                  <span className="text-zinc-300">{fmtDateTime(selected.first_visit || selected.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span>最后访问</span>
                  <span className="text-zinc-300">{fmtDateTime(selected.last_visit || selected.updated_at || selected.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span>总访问次数</span>
                  <span className="text-zinc-300">{selected.visit_count || 1} 次</span>
                </div>
                {selected.device && (
                  <div className="flex justify-between">
                    <span>设备</span>
                    <span className="text-zinc-300">{selected.device}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}