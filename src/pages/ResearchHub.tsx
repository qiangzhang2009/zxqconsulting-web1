import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Layers, MapPin, Tag, Sparkles, FileSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tracking } from '../lib/tracking';
import { RESEARCH_REPORTS } from '../data/researchReports';

const regionColor: Record<string, string> = {
  '日本': 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  '欧洲': 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  '东南亚': 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  '中东': 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  '北美': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  '澳洲': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  '全球': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  '中国': 'bg-red-500/15 text-red-300 border-red-500/25',
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

export default function ResearchHub() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${t('nav.research', '数据会说话 · 报告库')} · Qihuang Sihai`;
    tracking.pageView({ page_title: document.title });
  }, [t]);

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

          {/* Report Cards */}
          <section className="mt-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  {t('research.latest', '最新成果')}
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">
                  {t('research.reportsCount', {
                    defaultValue: '共 {{count}} 份研究报告',
                    count: RESEARCH_REPORTS.length,
                  })}
                </div>
              </div>
              <div className="hidden items-center gap-3 text-sm text-slate-400 sm:flex">
                <FileSearch className="h-4 w-4 text-emerald-300" />
                <span>{t('research.hint', '点击卡片即可在线阅读完整报告')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {RESEARCH_REPORTS.map((r) => (
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

                  <h2 className="mt-5 text-2xl font-semibold text-white transition-colors group-hover:text-emerald-300">
                    {r.title}
                  </h2>
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

              {/* Empty State / Coming Soon */}
              {RESEARCH_REPORTS.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-500">
                  {t('research.empty', '暂无公开报告，研究成果正在整理中…')}
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
