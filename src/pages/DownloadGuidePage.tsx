/**
 * 下载指南页 — Lead Magnet 落地页 (重塑版)
 *
 * 设计:墨青 + 朱砂,加入"陪跑叙事"和真人顾问对话感
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, CheckCircle2, Download, FileText, Globe2,
  Lock, Mail, MapPin, MessageSquare, Sparkles, Star, Users, Send,
} from 'lucide-react';
import { tracking } from '@/lib/tracking';

const WHAT_YOU_GET = [
  {
    icon: Globe2,
    title: '35 国监管框架概览',
    titleEn: '35-Country Regulatory Overview',
    desc: '覆盖日本、欧盟、美国、澳大利亚、东南亚等主要市场的准入要求速查表',
    descEn: 'Quick-reference compliance tables for Japan, EU, USA, Australia, SE Asia and more',
  },
  {
    icon: FileText,
    title: '路径决策树',
    titleEn: 'Pathway Decision Tree',
    desc: '药品 / 保健食品 / 食品 / 化妆品 四类路径的选择逻辑与决策条件',
    descEn: 'Decision logic for drug, supplement, food and cosmetics pathways',
  },
  {
    icon: BookOpen,
    title: '首批重点市场详解',
    titleEn: 'Top 5 Market Deep-Dives',
    desc: '日本、新加坡、德国、美国、澳大利亚的进入要点、周期与成本区间',
    descEn: 'Entry essentials, timelines and cost ranges for Japan, Singapore, Germany, USA, Australia',
  },
  {
    icon: Star,
    title: '合规自测清单',
    titleEn: 'Compliance Self-Checklist',
    desc: '出海前必须确认的 20 项合规检查点，按优先级排序',
    descEn: '20 compliance checkpoints before going global, prioritized',
  },
];

const SOCIAL_PROOF = [
  { value: '120+', label: '已下载企业' },
  { value: '35', label: '覆盖国家' },
  { value: '12+', label: '年实战经验' },
];

const DownloadGuidePage = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setLoading(true);

    try {
      await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          phone: form.phone,
          resource_slug: 'tcm-global-guide-35-countries',
        }),
      });
      tracking.formSubmit('download_guide_lead', true, form);
      setSubmitted(true);
    } catch {
      tracking.formSubmit('download_guide_lead', false, form);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] text-[#1B2520] flex items-center justify-center px-6 py-16">
        <div className="max-w-lg text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2F5D57]/10 text-[#2F5D57] mb-6 shadow-sm">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {isZh ? '下载链接已发送到您的邮箱' : 'Download link sent to your email'}
          </h1>
              <div className="mt-6 text-[#5b6661] leading-relaxed">
                {isZh
                  ? '下载链接会立即发送到你的邮箱。如需进一步判断,填写表单后 24 小时内会有顾问与你联系,确认是否值得做一次 30 分钟深度复盘。'
                  : 'Download link arrives immediately. For deeper assessment, submit the form and an advisor will reach out within 24h to schedule a 30-min consultation.'}
              </div>
          <div className="mt-8 space-y-3">
            <a
              href="/downloads/tcm-global-guide-35-countries.pdf"
              download
              className="group inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-8 py-4 text-base font-semibold text-white shadow-[0_8px_22px_rgba(194,71,59,0.28)] transition-all hover:-translate-y-0.5"
            >
              <Download className="h-5 w-5" />
              {isZh ? '立即下载 PDF' : 'Download PDF Now'}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <div>
              <Link
                to="/diagnose"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-3 text-sm font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white"
              >
                {isZh ? '直接开始 AI 诊断 →' : 'Start AI Diagnosis →'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1B2520]">
      {/* 顶部导航条 */}
      <div className="border-b border-[#2F5D57]/10 bg-[#FAF8F3]/88 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-3.5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2F5D57] to-[#1B2520] text-white">
              <Globe2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold uppercase tracking-[0.22em] text-[#2F5D57]">
              {isZh ? '岐黄四海' : 'QihuangSihai'}
            </span>
          </Link>
          <Link
            to="/diagnose"
            className="rounded-xl bg-[#C2473B] hover:bg-[#A93B30] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 shadow-sm"
          >
            {isZh ? '开始 AI 诊断' : 'Start AI Diagnosis'}
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            {/* 左侧：内容 */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#2F5D57]/20 bg-[#2F5D57]/8 px-4 py-2 text-sm font-medium text-[#2F5D57]">
                <Download className="h-4 w-4" />
                {isZh ? '免费资源 · 12 个月更新一次' : 'Free · Updated every 12 months'}
              </div>

              <h1 className="mt-6 text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
                {isZh ? (
                  <>
                    <span className="text-[#1B2520]">《中医药出海</span>
                    <span className="block mt-1.5 text-[#2F5D57]">35 国国别指南》</span>
                  </>
                ) : (
                  <>
                    {'《TCM Global Expansion'}
                    <span className="block bg-gradient-to-r from-[#2F5D57] to-[#C2473B] bg-clip-text text-transparent">
                      {'35-Country Guide》'}
                    </span>
                  </>
                )}
              </h1>

              <p className="mt-6 text-lg leading-[1.7] text-[#3a4540]">
                {isZh
                  ? '岐黄四海团队耗时 12 个月整理 — 覆盖日本、欧盟、美国、澳大利亚、东南亚等 35 个目标市场的准入政策、成本区间、渠道现状与风险提示。'
                  : '12 months of research by the QihuangSihai team, covering entry policies, cost ranges, channel landscapes and risk alerts for 35 target markets.'}
              </p>

              {/* 顾问引言 */}
              <div className="mt-8 rounded-2xl border-l-4 border-[#C2473B] bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#2F5D57] to-[#1B2520] flex items-center justify-center">
                    <svg viewBox="0 0 16 16" className="h-5 w-5 text-white" fill="none">
                      <path d="M8 2L10 6H14L11 9L12.5 13L8 10.5L3.5 13L5 9L2 6H6L8 2Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm italic text-[#1B2520] leading-relaxed font-medium">
                      "{isZh
                        ? '下载只是开始。我们会用 30 分钟帮你判断:哪 3 个市场值得先看,哪 3 个明确不该碰。这份指南只是给你一个前置背景。'
                        : "The download is just the start. We'll spend 30 min with you to identify which 3 markets to focus on first, and which 3 are clearly not worth pursuing."}"
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#2F5D57]/70 font-bold">
                      — 岐黄四海 · 出海决策顾问
                    </p>
                  </div>
                </div>
              </div>

              {/* 社会证明 */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                {SOCIAL_PROOF.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#2F5D57]/15 bg-white p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-[#2F5D57]">{item.value}</div>
                    <div className="mt-1 text-xs text-[#5b6661]">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* 指南包含内容 */}
              <div className="mt-10 space-y-4">
                <h2 className="text-lg font-semibold text-[#1B2520]">
                  {isZh ? '这份指南包含什么?' : 'What\'s inside this guide?'}
                </h2>
                {WHAT_YOU_GET.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-4 rounded-2xl border border-[#2F5D57]/12 bg-white p-5 shadow-sm hover:border-[#2F5D57]/30 transition-all"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2F5D57]/8 text-[#2F5D57]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1B2520]">
                          {isZh ? item.title : item.titleEn}
                        </h3>
                        <p className="mt-1 text-sm text-[#5b6661] leading-relaxed">
                          {isZh ? item.desc : item.descEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 适合谁 */}
              <div className="mt-10">
                <h2 className="text-lg font-semibold text-[#1B2520]">
                  {isZh ? '这份指南适合谁?' : 'Who is this guide for?'}
                </h2>
                <div className="mt-3 space-y-2">
                  {[
                    isZh ? '刚开始评估出海可行性的中医药企业负责人' : 'TCM brand leaders just starting global expansion research',
                    isZh ? '已有出海计划,需要系统化国别对比的决策者' : 'Decision-makers who need structured country comparisons',
                    isZh ? '出海遇到合规或路径选择困惑的运营团队' : 'Operations teams hitting compliance or pathway confusion',
                    isZh ? '寻找系统化出海框架的投资人与顾问' : 'Investors and advisors seeking structured globalization frameworks',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-[#3a4540]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2F5D57]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧：表单 */}
            <div>
              <div className="lg:sticky lg:top-28 rounded-3xl border border-[#2F5D57]/15 bg-white p-8 shadow-xl shadow-[#2F5D57]/5">
                {/* 隐私声明 */}
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#2F5D57]/10 bg-[#FAF8F3] p-4">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#2F5D57]" />
                  <p className="text-xs text-[#5b6661] leading-relaxed">
                    {isZh
                      ? '您的信息仅用于发送下载链接 + 24 小时内 1 次顾问对接预约邀请,我们不会再给你推任何营销内容。'
                      : 'Your info is only used to send the download link + 1 advisor outreach within 24h. We will NOT push marketing.'}
                  </p>
                </div>

                <div className="mb-6 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#C2473B]/8 border border-[#C2473B]/20 px-4 py-2 text-sm font-medium text-[#C2473B]">
                    <Sparkles className="h-4 w-4" />
                    {isZh ? '填写信息,立即免费获取' : 'Fill in your details, get it free'}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1B2520]">
                      {isZh ? '姓名 *' : 'Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={isZh ? '您的姓名' : 'Your name'}
                      className="w-full rounded-xl border border-[#2F5D57]/15 bg-white px-4 py-3 text-[#1B2520] placeholder-[#5b6661]/50 transition-all focus:border-[#2F5D57]/50 focus:outline-none focus:ring-2 focus:ring-[#2F5D57]/15"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1B2520]">
                      {isZh ? '工作邮箱 *' : 'Work Email *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder={isZh ? 'name@company.com' : 'name@company.com'}
                      className="w-full rounded-xl border border-[#2F5D57]/15 bg-white px-4 py-3 text-[#1B2520] placeholder-[#5b6661]/50 transition-all focus:border-[#2F5D57]/50 focus:outline-none focus:ring-2 focus:ring-[#2F5D57]/15"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1B2520]">
                      {isZh ? '公司名称' : 'Company Name'}
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder={isZh ? '您的公司名称' : 'Your company'}
                      className="w-full rounded-xl border border-[#2F5D57]/15 bg-white px-4 py-3 text-[#1B2520] placeholder-[#5b6661]/50 transition-all focus:border-[#2F5D57]/50 focus:outline-none focus:ring-2 focus:ring-[#2F5D57]/15"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#1B2520]">
                      {isZh ? '电话 / 微信' : 'Phone / WeChat'}
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder={isZh ? '方便顾问联系您' : 'For follow-up if needed'}
                      className="w-full rounded-xl border border-[#2F5D57]/15 bg-white px-4 py-3 text-[#1B2520] placeholder-[#5b6661]/50 transition-all focus:border-[#2F5D57]/50 focus:outline-none focus:ring-2 focus:ring-[#2F5D57]/15"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] py-4 text-base font-semibold text-white shadow-[0_8px_22px_rgba(194,71,59,0.28)] transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {isZh ? '发送中...' : 'Sending...'}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="h-4 w-4" />
                        {isZh ? '免费获取 + 顾问约见' : 'Get Free + Advisor Match'}
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </button>

                  <p className="text-center text-xs text-[#5b6661]">
                    {isZh
                      ? '提交后下载链接 5 分钟内送达,顾问 24 小时内与你约时间'
                      : 'Link arrives in 5 min; advisor outreach within 24h'}
                  </p>
                </form>

                {/* 顾问背书 */}
                <div className="mt-6 rounded-2xl border border-[#2F5D57]/10 bg-[#FAF8F3] p-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#2F5D57]" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#2F5D57]/70">
                        {isZh ? '关于我们' : 'About Us'}
                      </div>
                      <div className="mt-1.5 text-sm leading-relaxed text-[#3a4540]">
                        {isZh
                          ? '岐黄四海是中医药出海决策伙伴。顾问分布中国/日本/澳大利亚,12 年陪跑 120+ 家中医药企业。我们不是工具,是陪跑的真人。'
                          : 'QihuangSihai is a TCM globalization coaching partner. Advisors in China, Japan, Australia; 12 years coaching 120+ TCM brands. We are people, not tools.'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadGuidePage;