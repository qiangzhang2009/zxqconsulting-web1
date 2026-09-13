/**
 * Home Hero Section — 算法驱动版
 *
 * 设计要点:
 * - 主标: "中医出海 一站式服务 全程陪伴"
 * - 核心价值: 专属订制算法发现四大资源
 * - 简洁的左文案 + 右图结构
 * - 颜色: 墨青 #2F5D57 + 朱砂 #C2473B
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
  Users,
  Building2,
  TrendingUp,
  Target,
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

  // 四大发现能力
  const capabilities = [
    { icon: Users, label: '发现下游客户', desc: '精准定位目标市场的潜在买家' },
    { icon: Building2, label: '发现上游供应商', desc: '优化供应链,找到优质合作伙伴' },
    { icon: TrendingUp, label: '发现投资金主', desc: '对接对该领域感兴趣的投资机构' },
    { icon: Target, label: '发现竞争对手', desc: '知己知彼,找准差异化定位' },
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
          {/* ========== 上下结构:左文案 + 右图 ========== */}
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
                  {t('hero2.tagline', '专属订制算法 + 资深顾问全程陪跑')}
                </span>
              </div>

              {/* 主标题 — 对仗三行结构 */}
              <h1 className="hero-fade mt-7 text-[2.5rem] sm:text-5xl md:text-6xl xl:text-[4.2rem] font-semibold leading-[1.08] tracking-tight text-[#1B2520]">
                <span className="block">
                  {t('hero2.titlePart1', '中医出海')}
                </span>
                <span className="block mt-2">
                  <span className="relative inline-block whitespace-nowrap">
                    <span className="relative z-10 text-[#2F5D57]">
                      {t('hero2.titleHighlight', '一站式服务')}
                    </span>
                    <span className="absolute bottom-1.5 left-0 right-0 h-3 bg-[#2F5D57]/15 -z-0" />
                  </span>
                </span>
                <span className="block mt-4 text-[#1B2520]/55 font-light text-[0.55em] md:text-[0.5em] xl:text-[0.45em] tracking-normal">
                  {t('hero2.titlePart2', '全程陪伴 · 算法驱动 · 每一步都有据可依')}
                </span>
              </h1>

              {/* 描述 — 价值点 */}
              <p className="hero-fade mt-7 max-w-xl text-base md:text-lg leading-[1.75] text-[#3a4540]">
                {t(
                  'hero2.description',
                  '岐黄四海 — 用专属订制算法帮助中医药、保健食品、汉方品牌精准找到下游客户、上游供应商、投资金主和竞争对手。算法发现机会,顾问陪跑落地。'
                )}
              </p>

              {/* 四大发现能力 */}
              <div className="hero-fade mt-8 grid grid-cols-2 gap-3">
                {capabilities.map((cap) => (
                  <div key={cap.label} className="flex items-start gap-2.5 rounded-xl bg-white/80 border border-[#2F5D57]/10 px-3.5 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2F5D57]/10">
                      <cap.icon className="h-4 w-4 text-[#2F5D57]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#1B2520]">{cap.label}</div>
                      <div className="text-[10px] text-[#5b6661] mt-0.5">{cap.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 主次 CTA */}
              <div className="hero-fade mt-9 flex flex-wrap items-center gap-3">
                <Link
                  to="/diagnose"
                  onClick={() => tracking.click('hero_start_diagnosis', 'cta')}
                  className="group inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.30)] transition-all hover:-translate-y-0.5"
                >
                  <Sparkles className="h-5 w-5" />
                  {t('hero2.ctaStart', '开始智能诊断')}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/expert"
                  onClick={() => tracking.click('hero_talk_to_expert', 'cta')}
                  className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-4 text-base font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white hover:-translate-y-0.5"
                >
                  <MessageSquare className="h-5 w-5" />
                  {t('hero2.ctaExpert', '预约顾问咨询')}
                </Link>

                <a
                  href="/download-guide"
                  onClick={() => tracking.click('hero_download_guide', 'cta')}
                  className="inline-flex items-center gap-2 px-4 py-4 text-[#3a4540] hover:text-[#1B2520] transition"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-medium underline underline-offset-4 decoration-[#2F5D57]/40">
                    {t('hero2.ctaDownload', '下载服务介绍')}
                  </span>
                </a>
              </div>

              {/* 三句信任锚点 */}
              <div className="hero-fade mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#5b6661]">
                {[
                  t('hero2.trust1', '专属订制算法精准匹配'),
                  t('hero2.trust2', '资深顾问全程陪跑'),
                  t('hero2.trust3', '35 国市场框架入库'),
                ].map((item) => (
                  <div key={item} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#2F5D57]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ============ 右:图示容器 ============ */}
            <div className="hero-fade flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[360px] sm:max-w-[380px] lg:max-w-[400px]">
                {/* 2:3 竖向画框 */}
                <div className="relative aspect-[2/3] overflow-hidden rounded-[2rem] border border-[#2F5D57]/15 bg-gradient-to-br from-[#1B2520] via-[#2F5D57] to-[#1B2520] shadow-[0_30px_60px_-20px_rgba(27,37,32,0.35)]">
                  {/* 顶部小标识条 */}
                  <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C2473B] animate-ink-pulse" />
                      AI · 算法驱动
                    </span>
                    <span className="text-[10px] tracking-wider text-white/60">
                      ← 移动鼠标 →
                    </span>
                  </div>

                  {/* 主体:Avatar 填满容器 */}
                  <div className="absolute inset-0">
                    <InteractiveAvatar />
                  </div>

                  {/* 底部说明 */}
                  <div className="absolute bottom-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                    <div className="flex items-center gap-2 text-[10px] text-white/85">
                      <CheckCircle2 className="h-3 w-3 text-[#C2473B]" />
                      <span>发现客户·供应商·投资·竞争 四维资源</span>
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

                {/* 容器外的装饰:左上角 四大发现 */}
                <div
                  className="hidden md:flex absolute -left-12 top-4 h-auto w-40 rounded-2xl bg-white text-[#1B2520] shadow-xl rotate-[-4deg] p-4"
                  aria-hidden
                >
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#2F5D57]">专属算法</div>
                    <div className="text-xs font-semibold">发现四大资源</div>
                    <div className="space-y-1.5 mt-2">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <Users className="h-3 w-3 text-[#C2473B]" />
                        <span>下游客户</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <Building2 className="h-3 w-3 text-[#C2473B]" />
                        <span>上游供应商</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <TrendingUp className="h-3 w-3 text-[#C2473B]" />
                        <span>投资金主</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <Target className="h-3 w-3 text-[#C2473B]" />
                        <span>竞争对手</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 容器外的装饰:右下角 CTA 提示卡 */}
                <div
                  className="hidden lg:block absolute -right-6 bottom-12 max-w-[200px] rounded-2xl bg-white p-3.5 shadow-[0_14px_36px_-12px_rgba(27,37,32,0.18)] border border-[#2F5D57]/15"
                  aria-hidden
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#C2473B]">
                    全程陪伴
                  </div>
                  <div className="mt-1 text-xs text-[#1B2520] leading-relaxed">
                    从诊断到落地,每一步都有专属顾问陪跑
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

      {/* ========== 服务承诺条带 — hero 下方 ========== */}
      <div className="relative z-10 border-t border-[#2F5D57]/10 bg-[#F5F0E8]/40">
        <div className="container mx-auto px-6 py-10 md:py-12">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-6 md:gap-10 md:grid-cols-[280px_1fr] items-start">
              {/* 标题区 */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2F5D57]/70">
                  {t('hero2.tierLabel', '我们的承诺')}
                </div>
                <h3 className="mt-2 font-serif text-2xl md:text-[1.7rem] font-semibold text-[#1B2520] leading-snug">
                  {t('hero2.previewTitle', '从诊断到落地,全程陪伴')}
                </h3>
                <p className="mt-3 text-sm text-[#5b6661] leading-relaxed">
                  {t(
                    'hero2.tierABDesc',
                    '算法发现机会,顾问陪跑落地 — 每一步都有据可依'
                  )}
                </p>
                <Link
                  to="/method"
                  onClick={() => tracking.click('hero_tier_strip_start', 'strip')}
                  className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2F5D57] hover:text-[#C2473B] transition"
                >
                  {t('hero2.ctaStart', '了解更多')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* 四个承诺 */}
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  { key: 'A', label: '精准发现', desc: '用算法发现客户、供应商、投资、竞争', color: 'bg-[#C2473B]' },
                  { key: 'B', label: '全程陪跑', desc: '从诊断到落地,顾问全程指导', color: 'bg-[#2F5D57]' },
                  { key: 'C', label: '合规保障', desc: '35国法规框架,确保合规进入', color: 'bg-[#B8860B]' },
                  { key: 'D', label: '持续支持', desc: '出海后持续跟踪,及时调整策略', color: 'bg-[#8a938e]' },
                ].map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center gap-3 rounded-xl border border-[#2F5D57]/12 bg-white px-4 py-3 hover:border-[#2F5D57]/30 hover:shadow-sm transition"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.color} text-white text-sm font-bold`}
                    >
                      {item.key}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1B2520]">
                        {item.label}
                      </div>
                      <div className="mt-0.5 text-xs text-[#5b6661] truncate">
                        {item.desc}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
