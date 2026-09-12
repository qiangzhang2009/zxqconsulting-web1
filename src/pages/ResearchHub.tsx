import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Clock, Layers, MapPin, Tag, Sparkles, FileSearch, Lock,
  ArrowDownAZ, Filter, X, ChevronDown,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tracking } from '../lib/tracking';
import { RESEARCH_REPORTS } from '../data/researchReports';

const regionColor: Record<string, string> = {
  '日本': 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  '日本·大阪': 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  '欧洲': 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  '东南亚': 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  '中东': 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  '北美': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  '澳洲': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  '全球': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  '中国': 'bg-red-500/15 text-red-300 border-red-500/25',
  '波兰': 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  '波兰 · 华沙': 'bg-blue-500/15 text-blue-300 border-blue-500/25',
};

const categoryColor: Record<string, string> = {
  '全流程': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  '选品': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  '监管': 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  '渠道': 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  '人群': 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  '尽调': 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  '赛道': 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  '情报': 'bg-orange-500/15 text-orange-300 border-orange-500/25',
};

type SortKey = 'newest' | 'oldest' | 'reading' | 'title';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: '最新发布' },
  { value: 'oldest', label: '最早发布' },
  { value: 'reading', label: '阅读时长（长→短）' },
  { value: 'title', label: '标题 A→Z' },
];

export default function ResearchHub() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    document.title = `${t('nav.research', '数据会说话 · 报告库')} · Qihuang Sihai`;
    tracking.pageView({ page_title: document.title });
  }, [t]);

  // 统计每个 region 和 category 的报告数
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: RESEARCH_REPORTS.length };
    RESEARCH_REPORTS.forEach((r) => {
      counts[r.region] = (counts[r.region] || 0) + 1;
    });
    return counts;
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: RESEARCH_REPORTS.length };
    RESEARCH_REPORTS.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, []);

  // 按 region 分组（用于分类视图）
  const regionGroups = useMemo(() => {
    const groups: Record<string, typeof RESEARCH_REPORTS> = {};
    RESEARCH_REPORTS.forEach((r) => {
      if (!groups[r.region]) groups[r.region] = [];
      groups[r.region].push(r);
    });
    return groups;
  }, []);

  // 应用过滤和排序
  const filteredReports = useMemo(() => {
    let list = RESEARCH_REPORTS.filter((r) => {
      if (selectedRegion !== 'all' && r.region !== selectedRegion) return false;
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'reading':
          return b.readMinutes - a.readMinutes;
        case 'title':
          // 用 localeCompare 支持中文
          return a.title.localeCompare(b.title, 'zh-CN');
        default:
          return 0;
      }
    });
    return list;
  }, [selectedRegion, selectedCategory, sortKey]);

  const sortedRegions = useMemo(() => {
    // 按报告数排序的 region 列表（用于分类视图）
    const regions = Object.keys(regionGroups).sort((a, b) => {
      // 全球排第一，中国其次，然后按报告数排序
      if (a === '全球') return -1;
      if (b === '全球') return 1;
      if (a === '中国') return -1;
      if (b === '中国') return 1;
      return regionGroups[b].length - regionGroups[a].length;
    });
    return regions;
  }, [regionGroups]);

  const activeFilterCount =
    (selectedRegion !== 'all' ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedRegion('all');
    setSelectedCategory('all');
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortKey)?.label || '';

  return (
    <>
      <main className="relative overflow-hidden bg-[#07111a] pt-32 pb-24 text-slate-100">
        {/* 背景光斑 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6">
          {/* Hero */}
          <header className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              {t('nav.research', 'Research Library')}
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {t('research.hubTitle', '数据会说话 · 报告库')}
            </h1>
            <p className="mt-5 text-lg text-slate-300">
              {t(
                'research.hubSubtitle',
                '以可执行的研究成果陈列我们的方法论与判断力。每份报告均基于一手数据，标注样本规模、方法与边界。',
              )}
            </p>
          </header>

          {/* Toolbar: Filter + Sort */}
          <section className="mt-16">
            <div className="mb-6 flex flex-col gap-4">
              {/* Top row: title + sort dropdown */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    {t('research.latest', '最新成果')}
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-white">
                    {activeFilterCount === 0 ? (
                      <>{t('research.reportsCount', {
                        defaultValue: '共 {{count}} 份研究报告',
                        count: RESEARCH_REPORTS.length,
                      })}</>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>
                          显示 {filteredReports.length} / {RESEARCH_REPORTS.length} 份
                        </span>
                        <button
                          onClick={clearAllFilters}
                          className="inline-flex items-center gap-1 rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-0.5 text-xs font-normal text-slate-300 transition-colors hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300"
                        >
                          <X className="h-3 w-3" />
                          清空过滤
                        </button>
                      </span>
                    )}
                  </div>
                </div>

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setSortOpen(!sortOpen);
                      tracking.click('research_sort_toggle', 'research_hub');
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition-all hover:border-emerald-400/40 hover:bg-emerald-400/5"
                  >
                    <ArrowDownAZ className="h-4 w-4 text-emerald-300" />
                    <span className="text-slate-400">排序：</span>
                    <span className="font-medium">{currentSortLabel}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {sortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setSortOpen(false)}
                      />
                      <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0d1b2a] shadow-2xl">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSortKey(opt.value);
                              setSortOpen(false);
                              tracking.click(`research_sort_${opt.value}`, 'research_hub');
                            }}
                            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                              sortKey === opt.value
                                ? 'bg-emerald-400/10 text-emerald-300'
                                : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                            }`}
                          >
                            {opt.label}
                            {sortKey === opt.value && (
                              <span className="text-emerald-300">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Filter chips - region */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                  <Filter className="h-3.5 w-3.5" />
                  <span>按区域</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedRegion('all');
                      tracking.click('research_filter_region_all', 'research_hub');
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      selectedRegion === 'all'
                        ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300'
                        : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.15] hover:text-slate-200'
                    }`}
                  >
                    全部
                    <span className={`text-[10px] ${selectedRegion === 'all' ? 'text-emerald-400/70' : 'text-slate-500'}`}>
                      ({regionCounts.all})
                    </span>
                  </button>
                  {sortedRegions.map((region) => (
                    <button
                      key={region}
                      onClick={() => {
                        setSelectedRegion(region);
                        tracking.click(`research_filter_region_${region}`, 'research_hub');
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedRegion === region
                          ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300'
                          : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.15] hover:text-slate-200'
                      }`}
                    >
                      {region}
                      <span className={`text-[10px] ${selectedRegion === region ? 'text-emerald-400/70' : 'text-slate-500'}`}>
                        ({regionCounts[region] || 0})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter chips - category */}
              {Object.keys(categoryCounts).filter((k) => k !== 'all').length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    <Tag className="h-3.5 w-3.5" />
                    <span>按类型</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        tracking.click('research_filter_category_all', 'research_hub');
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedCategory === 'all'
                          ? 'border-orange-400/40 bg-orange-400/15 text-orange-300'
                          : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.15] hover:text-slate-200'
                      }`}
                    >
                      全部
                    </button>
                    {Object.keys(categoryCounts)
                      .filter((k) => k !== 'all')
                      .sort()
                      .map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            tracking.click(`research_filter_category_${cat}`, 'research_hub');
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                            selectedCategory === cat
                              ? 'border-orange-400/40 bg-orange-400/15 text-orange-300'
                              : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.15] hover:text-slate-200'
                          }`}
                        >
                          {cat}
                          <span className={`text-[10px] ${selectedCategory === cat ? 'text-orange-400/70' : 'text-slate-500'}`}>
                            ({categoryCounts[cat] || 0})
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active filter hints */}
            <div className="hidden items-center gap-3 text-sm text-slate-400 sm:flex">
              <FileSearch className="h-4 w-4 text-emerald-300" />
              <span>{t('research.hint', '点击卡片即可在线阅读完整报告')}</span>
            </div>

            {/* Report Cards Grid */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {filteredReports.map((r) => (
                <article
                  key={r.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-7 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:shadow-[0_24px_60px_rgba(16,185,129,0.15)]"
                >
                  {/* Decorative top edge */}
                  <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-400/60 via-cyan-400/40 to-blue-400/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${
                          regionColor[r.region] || 'bg-slate-500/15 text-slate-300 border-slate-500/25'
                        }`}
                      >
                        <MapPin className="h-3 w-3" />
                        {r.region}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${
                          categoryColor[r.category] || 'bg-slate-500/15 text-slate-300 border-slate-500/25'
                        }`}
                      >
                        <Tag className="h-3 w-3" />
                        {r.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">{r.date}</div>
                  </div>

                  <div className="flex items-start gap-2">
                    <h2 className="flex-1 text-2xl font-semibold text-white transition-colors group-hover:text-emerald-300">
                      {r.title}
                    </h2>
                    {r.passwordHash && (
                      <span
                        title="此报告需要输入密码才能查看"
                        className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[10px] font-medium text-amber-300"
                      >
                        <Lock className="h-3 w-3" />
                        密码
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{r.subtitle}</p>

                  {/* Metrics */}
                  {r.metrics && r.metrics.length > 0 && (
                    <div className="mt-5 grid grid-cols-4 gap-2 border-y border-white/[0.06] py-4">
                      {r.metrics.map((m, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-base font-semibold text-white sm:text-lg">{m.value}</div>
                          <div className="mt-1 text-[10px] text-slate-500">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Highlights */}
                  <ul className="mt-5 space-y-2">
                    {r.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-5">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {r.readMinutes} {t('research.min', '分钟阅读')}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        {r.chapters} {t('research.chapters', '章节')}
                      </span>
                    </div>
                    <Link
                      to={`/research/${r.id}`}
                      onClick={() => tracking.click(`research_open_${r.id}`, 'research_hub')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-emerald-300"
                    >
                      {t('research.readNow', '在线阅读')}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}

              {/* Empty State */}
              {filteredReports.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
                  <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-slate-500">
                    <FileSearch className="h-6 w-6" />
                  </div>
                  <div className="mt-4 text-slate-300">暂无符合条件的报告</div>
                  <div className="mt-1 text-sm text-slate-500">试试切换其他分类或排序方式</div>
                  <button
                    onClick={clearAllFilters}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-400/15"
                  >
                    <X className="h-4 w-4" />
                    清空过滤
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-20 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-blue-500/10 p-10">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                  {t('research.ctaTitle', '需要定制研究？')}
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {t(
                    'research.ctaDesc',
                    '如有特定市场 / 品类 / 监管的研究需求，可申请专家评审，按项目深度交付报告。',
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  tracking.click('research_cta_expert', 'research_hub');
                  navigate('/expert');
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                {t('research.ctaBtn', '申请专家评审')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Methodology footer note */}
          <footer className="mt-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-xs text-slate-500">
            <BookOpen className="mb-2 inline h-4 w-4 text-slate-400" />
            <span className="ml-2">
              {t(
                'research.methodologyNote',
                '方法论：所有报告样本规模、方法、采集边界均在报告开头「数据源与方法论」章节明示。仅展示已通过内部评议的研究成果。',
              )}
            </span>
          </footer>
        </div>
      </main>
    </>
  );
}
