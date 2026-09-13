/**
 * Home Hero Section — 海外市场BD版
 *
 * 设计要点:
 * - 主标: 海外市场BD — 用算法 7 天打开海外市场
 * - 视觉中心: 右图"算法漏斗"实时展示 10,000+ → 50 → 12 → 3 的过滤过程
 * - 配色: amber/gold 主调(与 OverseasBD section 一致),品牌青辅
 * - 底部条: 4 步 BD 算法工作流(全景扫描 / 智能发现 / 资质核验 / 触达陪跑)
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  ArrowRight,
  Compass,
  Globe2,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { tracking } from '../lib/tracking';
import { InteractiveAvatar } from '@/components/InteractiveAvatar';
import { FunnelAlgorithm } from './FunnelAlgorithm';

interface FunnelStage {
  key: string;
  icon: React.ReactNode;
  count: number;
  countLabel: string;
  stageLabel: string;
  widthPct: number;
  desc: string;
  accent: string;
  barClass: string;
  ringClass: string;
}

const funnelStages: FunnelStage[] = [
  {
    key: '1',
    icon: <Compass className="h-3.5 w-3.5" />,
    count: 10000,
    countLabel: '+',
    stageLabel: '市场全景扫描',
    widthPct: 100,
    desc: '电商 / 展会 / 专利 / 协会',
    accent: 'text-amber-200',
    barClass: 'bg-amber-400/30',
    ringClass: 'border-amber-400/30',
  },
  {
    key: '2',
    icon: <Search className="h-3.5 w-3.5" />,
    count: 50,
    countLabel: '家',
    stageLabel: '合伙人智能匹配',
    widthPct: 50,
    desc: '品类 / 价位 / 规模',
    accent: 'text-amber-300',
    barClass: 'bg-amber-400/45',
    ringClass: 'border-amber-400/40',
  },
  {
    key: '3',
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    count: 12,
    countLabel: '家',
    stageLabel: '多维资质核验',
    widthPct: 22,
    desc: '合规 / 财务 / 合作',
    accent: 'text-amber-300',
    barClass: 'bg-amber-400/65',
    ringClass: 'border-amber-400/55',
  },
  {
    key: '4',
    icon: <Send className="h-3.5 w-3.5" />,
    count: 3,
    countLabel: '家',
    stageLabel: '进入深度谈判',
    widthPct: 9,
    desc: '签约 MOU',
    accent: 'text-amber-300',
    barClass: 'bg-amber-300',
    ringClass: 'border-amber-300',
  },
];

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 文案主体渐入
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

      // 算法漏斗时间轴
      const tl = gsap.timeline({ delay: 0.55 });
      funnelStages.forEach((stage, i) => {
        const bar = `.funnel-bar-${stage.key}`;
        const counter = `.funnel-counter-${stage.key}`;
        const obj = { val: 0 };
        tl.fromTo(
          bar,
          { width: '0%' },
          {
            width: `${stage.widthPct}%`,
            duration: 0.7,
            ease: 'power2.out',
          },
          i * 0.22
        );
        tl.to(
          obj,
          {
            val: stage.count,
            duration: 0.7,
            ease: 'power1.out',
            onUpdate: () => {
              const el = document.querySelector(counter);
              if (el) el.textContent = Math.round(obj.val).toLocaleString();
            },
          },
          i * 0.22
        );
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative overflow-hidden bg-[#FAF8F3]"
    >
      {/* 背景层:暖色径向 + 暗色网格 */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 8%, rgba(252, 211, 77, 0.10), transparent 45%), radial-gradient(circle at 92% 80%, rgba(47, 93, 87, 0.08), transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(47, 93, 87, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(47, 93, 87, 0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-14 pb-10 md:pt-20 md:pb-16">
        <div className="mx-auto max-w-[1440px]">
          {/* ========== 上:三列结构(文案 + 吉祥物 + 漏斗) ========== */}
          {/* 响应:<lg 单列堆叠,lg-xl 两列(文 + 漏斗),xl+ 三列(中间插入吉祥物) */}
          <div className="grid gap-10 lg:gap-8 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_360px_minmax(0,440px)] items-center">
            {/* ============ 左:文案主轴 ============ */}
            <div>
              {/* 顶部 tag */}
              <div className="hero-fade inline-flex items-center gap-2.5 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                <Globe2 className="h-3.5 w-3.5" />
                <span className="font-medium">海外业务 · 算法驱动</span>
              </div>

              {/* 主标题 */}
              <h1 className="hero-fade mt-7 text-[2.6rem] sm:text-5xl md:text-6xl xl:text-[4.4rem] font-semibold leading-[1.05] tracking-tight">
                <span className="block text-[#1B2520]">
                  海外市场<span className="text-amber-300">BD</span>
                </span>
                <span className="block mt-3 text-[#1B2520]/60 font-light text-[0.5em] md:text-[0.42em] xl:text-[0.4em] tracking-normal">
                  用算法 <span className="text-amber-300 font-semibold">7 天</span> 为您打开海外市场
                </span>
              </h1>

              {/* 描述 */}
              <p className="hero-fade mt-7 max-w-xl text-base md:text-lg leading-[1.78] text-[#3a4540]">
                传统人工 BD 进入一个新市场需要 6-12 个月。
                我们的专属订制算法在 <span className="font-semibold text-amber-300">7 天</span> 内,
                扫描 10,000+ 候选、为中医品牌匹配最合适的本地合伙人
                (分销 / 代理 / 零售 / IP),并完成资质核验与触达策略。
                <span className="text-[#1B2520] font-medium">算法发现机会,顾问陪跑落地。</span>
              </p>

              {/* 主次 CTA */}
              <div className="hero-fade mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/diagnose"
                  onClick={() => tracking.click('hero_start_overseas_bd', 'cta')}
                  className="group inline-flex items-center gap-3 rounded-2xl bg-amber-400 hover:bg-amber-300 px-7 py-4 text-base font-semibold text-[#1a0f00] shadow-[0_10px_30px_rgba(252,211,77,0.35)] transition-all hover:-translate-y-0.5"
                >
                  <Sparkles className="h-5 w-5" />
                  启动海外BD 智能诊断
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/research"
                  onClick={() => tracking.click('hero_view_bd_method', 'cta')}
                  className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-4 text-base font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white hover:-translate-y-0.5"
                >
                  <Globe2 className="h-5 w-5" />
                  查看 BD 方法论报告
                </Link>
              </div>

              {/* 3 项信任锚点 */}
              <div className="hero-fade mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#5b6661]">
                {[
                  '已为多家中药老字号匹配海外合伙人',
                  '7 天交付 · 92% 入选率',
                  '算法 + 顾问 · 全程陪跑',
                ].map((item) => (
                  <div key={item} className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ============ 中:羊驼吉祥物 ============ */}
            <div className="hidden xl:flex justify-center animate-float-slow">
              <div className="relative w-full max-w-[360px] rounded-3xl bg-gradient-to-br from-[#0a1612] via-[#0d1f1a] to-[#11281f] border border-amber-400/35 shadow-[0_25px_60px_-20px_rgba(252,211,77,0.35)] overflow-hidden">
                {/* 顶部装饰条 */}
                <div className="flex items-center justify-between px-3.5 pt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-200">
                      LIVE
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-amber-200/60">
                    AI · 24h
                  </span>
                </div>

                {/* 主区域:羊驼 canvas + 浮动装饰 */}
                <div className="relative aspect-[16/10] mt-1">
                  <InteractiveAvatar compact loadingBg="#0d1f1a" />

                  {/* 浮动:数据点 1 */}
                  <div
                    className="absolute top-2 right-2 rounded-full bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 backdrop-blur-sm"
                    aria-hidden
                  >
                    <span className="text-[8px] font-bold text-amber-200 tabular-nums">
                      10,000+
                    </span>
                  </div>
                  {/* 浮动:数据点 2 */}
                  <div
                    className="absolute bottom-8 left-2 rounded-full bg-amber-300/20 border border-amber-300/40 px-1.5 py-0.5 backdrop-blur-sm"
                    aria-hidden
                  >
                    <span className="text-[8px] font-bold text-amber-100 tabular-nums">
                      7 天交付
                    </span>
                  </div>
                </div>

                {/* 底部标签 */}
                <div className="bg-amber-400/[0.08] border-t border-amber-400/25 px-3 py-2.5 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                    AI · 算法小驼驼
                  </div>
                  <div className="text-[9px] text-amber-50/60 mt-0.5">
                    实时监控海外BD数据流
                  </div>
                </div>
              </div>
            </div>

            {/* ============ 右:算法漏斗可视化 ============ */}
            <div className="hero-fade flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[440px]">
                {/* 卡片容器 - 暗色突出 */}
                <div className="relative rounded-[2rem] border border-[#2F5D57]/20 bg-gradient-to-br from-[#0a1612] via-[#0d1f1a] to-[#11281f] p-6 md:p-7 shadow-[0_30px_60px_-20px_rgba(27,37,32,0.45)]">
                  {/* 顶部状态条 */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200">
                        LIVE
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-200/60">
                      海外BD · 算法工作流
                    </span>
                  </div>

                  {/* 标题 */}
                  <div className="mb-6">
                    <div className="text-xs text-amber-50/70 mb-1">
                      算法漏斗 · Algorithm Funnel
                    </div>
                    <h3 className="text-xl font-semibold text-white tracking-tight">
                      7 天,从候选池到签约
                    </h3>
                  </div>

                  {/* 算法漏斗 4 阶 — 注解版,bar 下方带 breakdown chips */}
                  <FunnelAlgorithm />

                  {/* 底部签名条 */}
                  <div className="mt-5 pt-4 border-t border-amber-400/15 flex items-center justify-between">
                    <div className="text-[10px] text-amber-50/60">
                      <span className="font-mono text-amber-300">⏱ 7 天</span>
                      <span className="mx-1.5">·</span>
                      <span className="font-mono text-amber-300">24%</span>
                      进入谈判
                    </div>
                    <div className="text-[10px] font-semibold text-amber-300">
                      qihuangsihai.com
                    </div>
                  </div>
                </div>

                {/* 容器外的小装饰:左上角浮动 */}
                <div
                  className="hidden md:block absolute -left-8 -top-4 max-w-[170px] rounded-2xl bg-white px-3.5 py-3 shadow-xl border border-amber-400/30 rotate-[-4deg]"
                  aria-hidden
                >
                  <div className="text-[9px] font-bold uppercase tracking-widest text-amber-300 mb-1">
                    真实案例
                  </div>
                  <div className="text-xs font-semibold text-[#1B2520] leading-snug">
                    某百年中药老字号 → 日本
                  </div>
                  <div className="text-[10px] text-[#5b6661] mt-1">
                    7 天匹配 32 家合伙人
                  </div>
                </div>

                {/* 容器外的小装饰:右下角浮动 */}
                <div
                  className="hidden lg:block absolute -right-4 bottom-4 max-w-[180px] rounded-2xl bg-[#1B2520] px-3.5 py-3 shadow-xl border border-amber-400/30 rotate-[3deg]"
                  aria-hidden
                >
                  <div className="text-[9px] font-bold uppercase tracking-widest text-amber-300 mb-1">
                    覆盖市场
                  </div>
                  <div className="text-xs text-white leading-relaxed">
                    日本 · 韩国 · 东南亚<br />
                    美国 · 欧盟 · 中东
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== 底部条:海外BD 算法工作流 ========== */}
      <div className="relative z-10 border-t border-[#2F5D57]/10 bg-[#F5F0E8]/40">
        <div className="container mx-auto px-6 py-10 md:py-12">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-6 md:gap-10 md:grid-cols-[280px_1fr] items-start">
              {/* 标题区 */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
                  我们的承诺
                </div>
                <h3 className="mt-2 text-2xl md:text-[1.7rem] font-semibold text-[#1B2520] leading-snug">
                  海外BD 算法如何工作
                </h3>
                <p className="mt-3 text-sm text-[#5b6661] leading-relaxed">
                  算法发现机会,顾问陪跑落地 — 每一步都有据可依
                </p>
                <Link
                  to="/method"
                  onClick={() => tracking.click('hero_strip_method', 'strip')}
                  className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 hover:text-[#C2473B] transition"
                >
                  了解完整方法论
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* 4 步工作流 */}
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Compass, label: '市场全景扫描', desc: '算法扫描目标国分销生态', color: 'bg-amber-400' },
                  { icon: Search, label: '合伙人智能发现', desc: '从 10,000+ 候选筛出 50 家', color: 'bg-amber-500' },
                  { icon: ShieldCheck, label: '多维资质核验', desc: '注册 / 合作 / 合规 / 财务', color: 'bg-amber-600' },
                  { icon: Send, label: '定制化触达陪跑', desc: '个性化话术 + 谈判节点跟踪', color: 'bg-amber-700' },
                ].map((item, idx) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl border border-[#2F5D57]/12 bg-white px-4 py-3 hover:border-amber-400/40 hover:shadow-sm transition"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.color} text-white`}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-amber-300/70">
                          0{idx + 1}
                        </span>
                        <div className="text-sm font-semibold text-[#1B2520]">
                          {item.label}
                        </div>
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
