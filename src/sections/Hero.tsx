/**
 * Home Hero Section — 决策伙伴 (第 3 版)
 *
 * 设计要点:
 * - 主标: "出海,不是赶路 — 是选路" (对仗 + 留白)
 * - 右栏: 9:16 竖向容器装 InteractiveAvatar (synapse sprite),cover 居中裁切保留主体
 * - 35 国 4 档预览: 从右栏移出,作为 hero 下方独立条带,降低右栏负担
 * - 删除顾问卡 (该人物不存在)
 * - 颜色: 墨青 #2F5D57 + 朱砂 #C2473B 点睛
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Download,
  MessageSquare,
  Sparkles,
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
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.07,
          ease: 'power3.out',
          delay: 0.1,
        }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // 35 国 4 档 — hero 下方条带
  const tiers = [
    { key: 'A', label: t('hero2.tierA', 'A级 · 优先 12 个月'), color: 'bg-[#C2473B]', countries: '日本 · 阿联酋 · 新加坡' },
    { key: 'B', label: t('hero2.tierB', 'B级 · 中期 12-24 个月'), color: 'bg-[#2F5D57]', countries: '德国 · 法国 · 韩国' },
    { key: 'C', label: t('hero2.tierC', 'C级 · 长期观察'), color: 'bg-[#B8860B]', countries: '美国 · 加拿大 · 英国' },
    { key: 'D', label: t('hero2.tierD', 'D级 · 暂不进入'), color: 'bg-[#8a938e]', countries: '巴西 · 印度 · 俄罗斯' },
  ];

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative overflow-hidden text-[#1B2520] bg-[#FAF8F3]"
    >
      {/* 背景层:宣纸肌理 + 墨青径向晕染 */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 12%, rgba(47, 93, 87, 0.10), transparent 45%), radial-gradient(circle at 88% 70%, rgba(194, 71, 59, 0.06), transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.32]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(47, 93, 87, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(47, 93, 87, 0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="mx-auto max-w-[1440px]">
          {/* ========== 上下结构:左文案 + 右 9:16 Avatar ========== */}
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center">
            {/* ============ 左:文案主轴 ============ */}
            <div>
              {/* 顶部 tag */}
              <div className="hero-fade inline-flex items-center gap-2.5 rounded-full border border-[#2F5D57]/15 bg-white/85 px-4 py-2 text-sm text-[#2F5D57] backdrop-blur-md shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2F5D57] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2F5D57]" />
                </span>
                <Bot className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {t('hero2.tagline', 'AI 诊断 + 真人顾问双轨决策 / 35 国合规框架入库')}
                </span>
              </div>

              {/* subtitle — 小标题 */}
              <div className="hero-fade mt-7 text-xs font-semibold uppercase tracking-[0.32em] text-[#2F5D57]/70">
                {t('hero2.subtitle', 'Global Expansion Intelligence · 决策伙伴')}
              </div>

              {/* 主标题 — 对仗三行结构 */}
              <h1 className="hero-fade mt-4 text-[2.5rem] sm:text-5xl md:text-6xl xl:text-[4.6rem] font-semibold leading-[1.08] tracking-tight text-[#1B2520]">
                <span className="block">
                  {t('hero2.titlePart1', '出海,不是赶路')}
                </span>
                <span className="block mt-2">
                  <span className="relative inline-block whitespace-nowrap">
                    <span className="relative z-10 text-[#2F5D57]">
                      {t('hero2.titleHighlight', '是选路')}
                    </span>
                    <span className="absolute bottom-1.5 left-0 right-0 h-3 bg-[#2F5D57]/15 -z-0" />
                  </span>
                </span>
                <span className="block mt-4 text-[#1B2520]/55 font-light text-[0.55em] md:text-[0.5em] xl:text-[0.45em] tracking-normal">
                  {t('hero2.titlePart2', '35 国 4 档优先级,先帮你筛,再陪你判断')}
                </span>
              </h1>

              {/* 描述 — 价值点 */}
              <p className="hero-fade mt-7 max-w-xl text-base md:text-lg leading-[1.75] text-[#3a4540]">
                {t(
                  'hero2.description',
                  '岐黄四海 — 中医药、保健食品、汉方护肤品牌的出海决策伙伴。 AI 3 分钟把 35 国拆成 4 档优先级,真人顾问再和你判断:该不该走、什么时候走、怎么走。'
                )}
              </p>

              {/* 主次 CTA */}
              <div className="hero-fade mt-9 flex flex-wrap items-center gap-3">
                <Link
                  to="/diagnose"
                  onClick={() => tracking.click('hero_start_diagnosis', 'cta')}
                  className="group inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.30)] transition-all hover:-translate-y-0.5"
                >
                  <Sparkles className="h-5 w-5" />
                  {t('hero2.ctaStart', '开始 AI 诊断')}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/expert"
                  onClick={() => tracking.click('hero_talk_to_expert', 'cta')}
                  className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-4 text-base font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white hover:-translate-y-0.5"
                >
                  <MessageSquare className="h-5 w-5" />
                  {t('hero2.ctaExpert', '预约 30 分钟专家咨询')}
                </Link>

                <a
                  href="/download-guide"
                  onClick={() => tracking.click('hero_download_guide', 'cta')}
                  className="inline-flex items-center gap-2 px-4 py-4 text-[#3a4540] hover:text-[#1B2520] transition"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-medium underline underline-offset-4 decoration-[#2F5D57]/40">
                    {t('hero2.ctaDownload', '下载 35 国出海指南 (PDF)')}
                  </span>
                </a>
              </div>

              {/* 三句信任锚点 */}
              <div className="hero-fade mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#5b6661]">
                {[
                  t('hero2.trust1', '3 分钟完成前置判断'),
                  t('hero2.trust2', '35 国法规框架入库'),
                  t('hero2.trust3', '复杂项目由真人顾问进一步评估'),
                ].map((item) => (
                  <div key={item} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#2F5D57]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ============ 右:9:16 Avatar 容器 ============ */}
            <div className="hero-fade flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[360px] sm:max-w-[380px] lg:max-w-[400px]">
                {/* 2:3 竖向画框 */}
                <div className="relative aspect-[2/3] overflow-hidden rounded-[2rem] border border-[#2F5D57]/15 bg-gradient-to-br from-[#1B2520] via-[#2F5D57] to-[#1B2520] shadow-[0_30px_60px_-20px_rgba(27,37,32,0.35)]">
                  {/* 顶部小标识条 */}
                  <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C2473B] animate-ink-pulse" />
                      AI · 互动演示
                    </span>
                    <span className="text-[10px] tracking-wider text-white/60">
                      ← 移动鼠标 →
                    </span>
                  </div>

                  {/* 主体:Avatar 填满容器(cover 模式自动裁切) */}
                  <div className="absolute inset-0">
                    <InteractiveAvatar />
                  </div>

                  {/* 底部说明 */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                    <div className="flex items-center gap-2 text-[10px] text-white/85">
                      <CheckCircle2 className="h-3 w-3 text-[#C2473B]" />
                      <span>覆盖 35 国监管框架 · AI + 真人顾问双轨判断</span>
                    </div>
                  </div>

                  {/* 装饰: 朱砂印章 右上角 */}
                  <div className="absolute top-3 right-3 z-10 opacity-70">
                    <div
                      className="seal-stamp text-[8px] leading-tight bg-white/90"
                      aria-hidden
                    >
                      岐黄<br />四海
                    </div>
                  </div>
                </div>

                {/* 容器外的装饰:左侧 35 数字 */}
                <div
                  className="hidden md:flex absolute -left-12 top-12 h-24 w-24 rounded-2xl bg-[#2F5D57] text-white flex-col items-center justify-center shadow-xl rotate-[-8deg]"
                  aria-hidden
                >
                  <span className="font-serif text-4xl font-bold leading-none">35</span>
                  <span className="mt-1 text-[9px] tracking-widest uppercase">Countries</span>
                  <span className="text-[10px] font-medium mt-0.5 opacity-90">目标国</span>
                </div>

                {/* 容器外的装饰:右下角 CTA 提示卡 */}
                <div
                  className="hidden lg:block absolute -right-6 bottom-12 max-w-[200px] rounded-2xl bg-white p-3.5 shadow-[0_14px_36px_-12px_rgba(27,37,32,0.18)] border border-[#2F5D57]/15"
                  aria-hidden
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#C2473B]">
                    3 分钟
                  </div>
                  <div className="mt-1 text-xs text-[#1B2520] leading-relaxed">
                    完成一次 AI 出海初判 · 直接看 A/B/C/D 优先级
                  </div>
                  <Link
                    to="/diagnose"
                    onClick={() => tracking.click('hero_avatar_side_cta', 'avatar')}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#2F5D57] hover:text-[#C2473B] transition"
                  >
                    开始诊断
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== 35 国 4 档条带 — hero 下方 ========== */}
      <div className="relative z-10 border-t border-[#2F5D57]/10 bg-[#F5F0E8]/40">
        <div className="container mx-auto px-6 py-10 md:py-12">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-6 md:gap-10 md:grid-cols-[280px_1fr] items-start">
              {/* 标题区 */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2F5D57]/70">
                  {t('hero2.tierLabel', '35 国分级')}
                </div>
                <h3 className="mt-2 font-serif text-2xl md:text-[1.7rem] font-semibold text-[#1B2520] leading-snug">
                  {t('hero2.previewTitle', '结构化结果,而不是泛泛建议')}
                </h3>
                <p className="mt-3 text-sm text-[#5b6661] leading-relaxed">
                  {t(
                    'hero2.tierABDesc',
                    '日本 — 备案制窗口期 / 德国 — 汉方护肤复购稳健'
                  )}
                </p>
                <Link
                  to="/diagnose"
                  onClick={() => tracking.click('hero_tier_strip_start', 'strip')}
                  className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2F5D57] hover:text-[#C2473B] transition"
                >
                  {t('hero2.ctaStart', '开始 AI 诊断')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* 4 分级列表 */}
              <ul className="grid gap-3 sm:grid-cols-2">
                {tiers.map((tier) => (
                  <li
                    key={tier.key}
                    className="flex items-center gap-3 rounded-xl border border-[#2F5D57]/12 bg-white px-4 py-3 hover:border-[#2F5D57]/30 hover:shadow-sm transition"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tier.color} text-white text-sm font-bold`}
                    >
                      {tier.key}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1B2520]">
                        {tier.label}
                      </div>
                      <div className="mt-0.5 text-xs text-[#5b6661] truncate">
                        {tier.countries}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Trust Bar — 收口 ========== */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 pb-12 md:pb-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2F5D57]/70 mb-3 text-center">
              {t('hero2.trustTitle', '既往的判断 · 不只是 PPT 上的数字')}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-[#2F5D57]/15 bg-[#2F5D57]/5 overflow-hidden">
              {[
                { value: '120+', label: t('hero2.trustLabel1', '服务中医药出海企业') },
                { value: '35', label: t('hero2.trustLabel2', '目标国监管框架入库') },
                { value: '12+', label: t('hero2.trustLabel3', '年医药出海实战') },
                { value: '¥30亿+', label: t('hero2.trustLabel4', '客户累计决策资源') },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1 bg-white px-5 py-5 transition-colors hover:bg-[#FAF8F3]"
                >
                  <div className="text-2xl font-bold text-[#1B2520] leading-none">
                    {item.value}
                  </div>
                  <div className="text-xs text-[#5b6661]">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
