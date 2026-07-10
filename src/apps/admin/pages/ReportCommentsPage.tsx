// 报告留言管理
import { useEffect, useState, useMemo } from 'react';
import { MessageCircle, Search, Trash2, RotateCcw, Eye, EyeOff, MapPin, Hash } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { KPICard } from '../components/ui/KPICard';
import { CardSkeleton } from '../components/ui/Skeleton';
import { api } from '../services/api';
import { RESEARCH_REPORTS } from '@/data/researchReports';

type CommentRow = {
  id: number;
  report_id: string;
  nickname: string;
  content: string;
  ip: string;
  ip_hash: string;
  country: string;
  region: string;
  city: string;
  ua: string;
  status: string;
  created_at: string;
};

const TITLE_MAP: Record<string, string> = Object.fromEntries(
  RESEARCH_REPORTS.map((r) => [r.id, r.title]),
);

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function ReportCommentsPage() {
  const [days, setDays] = useState(30);
  const [reportId, setReportId] = useState('');
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [data, setData] = useState<{
    comments: CommentRow[];
    stats: { total: number; visible: number; hidden: number; reports: number; unique_users: number };
    top_reports: Array<{ report_id: string; cnt: number }>;
    daily: Array<{ day: string; cnt: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getReportComments({ days, report_id: reportId || undefined, q: q || undefined });
      setData({
        comments: (res.comments || []) as CommentRow[],
        stats: res.stats,
        top_reports: res.top_reports || [],
        daily: res.daily || [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [days, reportId]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data.comments;
    if (statusFilter !== 'all') list = list.filter((c) => c.status === statusFilter);
    if (q) {
      const t = q.toLowerCase();
      list = list.filter((c) => c.nickname.toLowerCase().includes(t) || c.content.toLowerCase().includes(t));
    }
    return list;
  }, [data, statusFilter, q]);

  const hide = async (id: number) => {
    if (!confirm('隐藏这条留言？')) return;
    await api.hideReportComment(id);
    await load();
  };
  const restore = async (id: number) => {
    await api.restoreReportComment(id);
    await load();
  };

  if (loading || !data) {
    return (
      <>
        <PageHeader title="报告留言" description="读者在每份报告下的留言" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </>
    );
  }

  const maxDaily = Math.max(1, ...data.daily.map((d) => d.cnt));

  return (
    <>
      <PageHeader
        title="报告留言"
        description="读者在每份报告下的留言与互动"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-border)] text-sm text-white"
            >
              <option value={7}>最近 7 天</option>
              <option value={30}>最近 30 天</option>
              <option value={90}>最近 90 天</option>
              <option value={365}>最近 1 年</option>
            </select>
            <select
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-border)] text-sm text-white max-w-[260px]"
            >
              <option value="">全部报告</option>
              {RESEARCH_REPORTS.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard label="留言总数" value={data.stats.total || 0} icon={<MessageCircle size={18} />} />
        <KPICard label="可见" value={data.stats.visible || 0} icon={<Eye size={18} />} />
        <KPICard label="已隐藏" value={data.stats.hidden || 0} icon={<EyeOff size={18} />} />
        <KPICard label="独立用户" value={data.stats.unique_users || 0} icon={<Hash size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Daily trend */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)]">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">每日新增</div>
          <div className="flex items-end gap-1 h-32">
            {data.daily.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-600">暂无数据</div>
            ) : data.daily.map((d) => {
              const h = Math.round((d.cnt / maxDaily) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1" title={`${d.day}: ${d.cnt}`}>
                  <div className="w-full bg-emerald-500/40 hover:bg-emerald-400 transition rounded-t" style={{ height: `${Math.max(h, 4)}%` }} />
                  <div className="text-[9px] text-zinc-500 -rotate-45 origin-right whitespace-nowrap">{d.day.slice(5)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top reports */}
        <div className="p-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)]">
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">留言最多的报告</div>
          {data.top_reports.length === 0 ? (
            <div className="text-xs text-zinc-600 py-6 text-center">暂无数据</div>
          ) : (
            <ul className="space-y-2">
              {data.top_reports.map((t) => (
                <li key={t.report_id} className="flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => setReportId(t.report_id)}
                    className="flex-1 truncate text-left text-slate-200 hover:text-emerald-300 transition"
                  >
                    {TITLE_MAP[t.report_id] || t.report_id}
                  </button>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300 tabular-nums">{t.cnt}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索昵称或内容…"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-border)] text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400/60 focus:outline-none"
          />
        </div>
        <div className="flex rounded-lg border border-[var(--admin-border)] overflow-hidden">
          {(['all', 'visible', 'hidden'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs transition ${statusFilter === s ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-400 hover:bg-white/5'}`}
            >
              {s === 'all' ? '全部' : s === 'visible' ? '可见' : '已隐藏'}
            </button>
          ))}
        </div>
      </div>

      {/* Comments list */}
      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] divide-y divide-[var(--admin-border)]">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-500">没有留言</div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="p-4 hover:bg-white/[0.02] transition">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold">
                  {c.nickname.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-semibold text-slate-100">{c.nickname}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-400">{TITLE_MAP[c.report_id] || c.report_id}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-500">{formatTime(c.created_at)}</span>
                    {c.status === 'hidden' && (
                      <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] text-rose-300">已隐藏</span>
                    )}
                    {(c.country || c.city) && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
                        <MapPin size={10} /> {[c.country, c.city].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-200 whitespace-pre-wrap break-words">{c.content}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-600">
                    <span>IP hash: {c.ip_hash?.slice(0, 12) || '-'}</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  {c.status === 'visible' ? (
                    <button
                      onClick={() => hide(c.id)}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-300 transition"
                      title="隐藏"
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => restore(c.id)}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-emerald-500/10 hover:text-emerald-300 transition"
                      title="恢复"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}