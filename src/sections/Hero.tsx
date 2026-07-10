import { useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileSearch,
  Globe2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { tracking } from '../lib/tracking';
import { InteractiveAvatar } from '@/components/InteractiveAvatar';


const Hero = () => {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-fade',
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.15,
        }
      );

      gsap.fromTo(
        '.hero-card',
        { opacity: 0, y: 32, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.45,
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const diagnosisQuestions = useMemo(() => [
    t('hero2.q1', 'Which market should you enter first?'),
    t('hero2.q2', 'How hard will compliance and entry be?'),
    t('hero2.q3', 'Is this opportunity worth funding now?'),
  ], [t]);

  const trustItems = useMemo(() => [
    t('hero2.trust1', 'Get an initial decision in 3 minutes'),
    t('hero2.trust2', 'Assess market, compliance, cost, channels and risk in one flow'),
    t('hero2.trust3', 'Complex projects get a deeper expert evaluation'),
  ], [t]);

  const previewCards = useMemo(() => [
    { icon: Target, title: t('hero2.opportunityScore'), text: t('hero2.opportunityScoreText') },
    { icon: ShieldCheck, title: t('hero2.entryComplexity'), text: t('hero2.entryComplexityText') },
    { icon: TrendingUp, title: t('hero2.nextBestAction'), text: t('hero2.nextBestActionText') },
  ], [t]);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen overflow-hidden bg-[#07111a] text-white"
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(22,163,74,0.16),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(8,145,178,0.14),transparent_30%),linear-gradient(180deg,#07111a_0%,#0a1622_55%,#07111a_100%)]" />
      <div className="absolute inset-0 z-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,17,26,0.22)_45%,rgba(7,17,26,0.74)_100%)]" />

      <div className="relative z-10 container mx-auto px-6 pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="hero-fade inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-200 backdrop-blur-md">
            <Bot className="h-4 w-4 text-emerald-400" />
            <span>{t('hero2.tagline', 'AI platform for TCM global expansion decisions')}</span>
          </div>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <div className="hero-fade mb-5 text-sm uppercase tracking-[0.28em] text-emerald-300/80">
                {t('hero2.subtitle', 'Global Expansion Intelligence Platform')}
              </div>

              <h1 className="hero-fade max-w-4xl text-5xl font-semibold leading-[1.05] md:text-7xl xl:text-[5.4rem]">
                {t('hero2.titlePart1', 'Use AI to decide')}
                <span className="block bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                  {t('hero2.titlePart2Gradient', 'if your TCM product should go global')}
                </span>
              </h1>

              <div className="hero-fade mt-4 mb-0 text-2xl font-light italic tracking-wide text-slate-400 md:text-3xl">
                {t('brand.slogan', '一脉岐黄。四海安康')}
              </div>

              <p className="hero-fade mt-6 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
                {t('hero2.description')}
              </p>

              <div className="hero-fade mt-8 grid gap-3 sm:grid-cols-3">
                {diagnosisQuestions.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-sm text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="hero-fade mt-10 flex flex-wrap gap-4">
                <Link
                  to="/diagnose"
                  onClick={() => tracking.click('hero_start_diagnosis', 'cta')}
                  className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-8 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(16,185,129,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(16,185,129,0.34)]"
                >
                  <Sparkles className="h-5 w-5" />
                  {t('hero2.ctaStart', 'Start AI diagnosis')}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/cases"
                  onClick={() => tracking.click('hero_view_sample_report', 'cta')}
                  className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
                >
                  <FileSearch className="h-5 w-5 text-emerald-300" />
                  {t('hero2.ctaViewSample', 'View sample report')}
                </Link>
              </div>

              <div className="hero-fade mt-12 grid gap-3 sm:grid-cols-3">
                {trustItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4 text-sm text-slate-300"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="hero-card rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
                      {t('hero2.previewLabel', 'Diagnosis preview')}
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      {t('hero2.previewTitle', 'Structured output, not generic advice')}
                    </h3>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                    {t('hero2.threeMin', '3 min')}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#0b1824] p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('hero2.market', 'Market')}</div>
                    <div className="mt-2 text-lg font-semibold text-white">{t('hero2.marketValue', 'Japan / Germany / UAE')}</div>
                    <div className="mt-2 text-sm text-slate-400">{t('hero2.marketDesc', 'Priority order and entry recommendation')}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#0b1824] p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('hero2.category', 'Category')}</div>
                    <div className="mt-2 text-lg font-semibold text-white">{t('hero2.categoryValue', 'Supplements / TCM / Hanfang skincare')}</div>
                    <div className="mt-2 text-sm text-slate-400">{t('hero2.categoryDesc', 'Match category with entry pathways')}</div>
                  </div>
                </div>
              </div>

              {previewCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="hero-card rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md"
                  >
                    <div className="mb-4 inline-flex rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{card.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hero-fade mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-8 text-sm text-slate-400">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                {t('hero2.builtFor', 'Built for')} <strong className="ml-1 text-white">{t('hero2.builtForTarget', 'TCM / Supplements / Hanfang')}</strong>
              </div>
              <div>
                {t('hero2.coverage', 'Coverage')} <strong className="ml-1 text-white">{t('hero2.coverageNum', '35+')}</strong>
              </div>
              <div>
                {t('hero2.output', 'Output')} <strong className="ml-1 text-white">{t('hero2.outputVal', 'Decision-ready')}</strong>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-emerald-300">
              <Globe2 className="h-4 w-4" />
              <span>{t('hero2.diagnoseFirst', 'Diagnose first, then decide whether deeper expert evaluation is needed')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 lg:block">
        <Link
          to="/diagnose"
          onClick={() => tracking.click('hero_begin_diagnosis', 'cta')}
          className="hero-fade flex flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400 transition-colors hover:text-white"
        >
          <span>{t('hero2.beginDiagnosis', 'Begin diagnosis')}</span>
          <ChevronDownIcon />
        </Link>
      </div>

      {/* Interactive Avatar - Syrebo Llama */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 hidden opacity-20 lg:block">
        <div className="flex items-end justify-center pb-4">
          <div className="w-48 h-64">
            <InteractiveAvatar />
          </div>
        </div>
      </div>
    </section>
  );
};

const ChevronDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default Hero;
