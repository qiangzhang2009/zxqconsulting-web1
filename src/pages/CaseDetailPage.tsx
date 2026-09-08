/**
 * 案例详情页
 * 
 * 路径: /cases/:slug
 * 每个案例的独立深度页面,包含完整的决策逻辑、路径、结果与启发
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Compass,
  DollarSign,
  Globe2,
  Lightbulb,
  MapPin,
  Route,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';
import { getCaseBySlug } from '@/data/cases';
import { tracking } from '@/lib/tracking';

const DECISION_TYPE_CONFIG = {
  market: { icon: <Compass className="h-5 w-5" />, label: '选市场型', labelEn: 'Market Selection' },
  compliance: { icon: <ShieldCheck className="h-5 w-5" />, label: '解准入型', labelEn: 'Compliance Solution' },
  channel: { icon: <Route className="h-5 w-5" />, label: '搭渠道型', labelEn: 'Channel Building' },
  resource: { icon: <BarChart3 className="h-5 w-5" />, label: '找资源型', labelEn: 'Resource Matching' },
};

const CaseDetailPage = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const { slug } = useParams<{ slug: string }>();

  const c = getCaseBySlug(slug || '');

  useEffect(() => {
    if (c) {
      document.title = `${isZh ? c.company : c.companyEn} · ${isZh ? c.industry : c.industryEn} · ${isZh ? '岐黄四海案例' : 'QihuangSihai Case'}`;
      tracking.pageView({ page: `/cases/${slug || 'unknown'}` });
    }
  }, [c, isZh, slug]);

  if (!c) {
    return (
      <div className="min-h-screen bg-[#07111a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white">
            {isZh ? '案例不存在' : 'Case not found'}
          </h1>
          <Link to="/cases" className="mt-4 inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300">
            <ArrowLeft className="h-4 w-4" />
            {isZh ? '返回案例库' : 'Back to Cases'}
          </Link>
        </div>
      </div>
    );
  }

  const typeConfig = DECISION_TYPE_CONFIG[c.decisionType];
  const relatedCases = [c]; // 可以扩展为找同类型案例

  return (
    <div className="min-h-screen bg-[#07111a] text-white">
      {/* 顶部导航 */}
      <div className="border-b border-white/10 bg-[#07111a]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link
            to="/cases"
            className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {isZh ? '返回案例库' : 'Back to Cases'}
          </Link>
          <Link
            to="/diagnose"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-emerald-50"
          >
            {isZh ? '开始 AI 诊断' : 'Start AI Diagnosis'}
          </Link>
        </div>
      </div>

      {/* Hero 头部 */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0d1f30] to-[#07111a]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(22,163,74,0.12),transparent_50%)]" />
        <div className="container relative mx-auto px-6 py-16">
          <div className="mx-auto max-w-4xl">
            {/* 标签 */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
                {typeConfig.icon}
                {isZh ? typeConfig.label : typeConfig.labelEn}
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <Globe2 className="h-4 w-4" />
                {c.markets.map((m, i) => (
                  <span key={m}>
                    {m}{i < c.markets.length - 1 ? ' / ' : ''}
                  </span>
                ))}
              </div>
              <div className="text-sm text-slate-400">{c.flag}</div>
            </div>

            {/* 公司名 */}
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              {isZh ? c.company : c.companyEn}
            </h1>
            <p className="mt-3 text-lg text-slate-400">
              {isZh ? c.industry : c.industryEn}
            </p>

            {/* 核心数据 */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {c.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-5"
                >
                  <div className="text-3xl font-bold text-white">{metric.value}</div>
                  <div className="mt-1 text-sm text-slate-400">
                    {isZh ? metric.label : metric.labelEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-12">
            {/* 核心问题 */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
                  <Target className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {isZh ? '核心挑战' : 'Core Challenge'}
                </h2>
              </div>
              <p className="text-lg leading-8 text-slate-300">
                {isZh ? c.challenge : c.challengeEn}
              </p>
            </div>

            {/* 解决方案 */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Route className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {isZh ? '采取路径' : 'Pathway Taken'}
                </h2>
              </div>
              <p className="text-lg leading-8 text-slate-300">
                {isZh ? c.solution : c.solutionEn}
              </p>
            </div>

            {/* 执行结果 */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {isZh ? '最终结果' : 'Final Outcome'}
                </h2>
              </div>
              <p className="text-lg leading-8 text-slate-300">
                {isZh ? c.result : c.resultEn}
              </p>
            </div>

            {/* 关键数据 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="h-4 w-4" />
                  {isZh ? '执行周期' : 'Duration'}
                </div>
                <div className="text-xl font-semibold text-white">
                  {isZh ? c.duration : c.durationEn}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                  <DollarSign className="h-4 w-4" />
                  {isZh ? '投入规模' : 'Investment'}
                </div>
                <div className="text-xl font-semibold text-white">
                  {isZh ? c.investment : c.investmentEn}
                </div>
              </div>
            </div>

            {/* 关键教训 */}
            <div className="rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 to-transparent p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {isZh ? '关键启发' : 'Key Takeaway'}
                </h2>
              </div>
              <p className="text-lg leading-8 text-slate-300">
                {isZh ? c.keyLesson : c.keyLessonEn}
              </p>
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <p className="text-base text-slate-200">
                  {isZh ? c.insight : c.insightEn}
                </p>
              </div>
            </div>

            {/* 底部 CTA */}
            <div className="rounded-3xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-8 text-center">
              <h3 className="text-2xl font-semibold text-white">
                {isZh
                  ? '想了解您的项目适合哪种路径?'
                  : 'Want to know which pathway fits your project?'}
              </h3>
              <p className="mt-3 text-base text-slate-400">
                {isZh
                  ? '先完成 AI 诊断，或直接预约专家咨询。'
                  : 'Complete the AI diagnosis first, or book an expert consultation directly.'}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link
                  to="/diagnose"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                >
                  {isZh ? '开始 AI 诊断' : 'Start AI Diagnosis'}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/expert"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  {isZh ? '预约专家咨询' : 'Book Expert Consultation'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailPage;