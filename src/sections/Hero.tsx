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
import { IndustryNetworkGraph } from './industry-network/IndustryNetworkGraph';

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
          <div className="grid gap-10 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] items-center">
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

              {/* 品牌金句 — 朱砂线 + 小字 */}
              <div className="hero-fade mt-5 flex items-center gap-3">
                <span className="h-px w-8 bg-[#C2473B]" />
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#C2473B]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  一脉岐黄 · 四海安康
                </span>
                <span className="h-px w-8 bg-[#C2473B]" />
              </div>

              {/* 主标题 — 从「功能描述」升级为「判断承诺」 */}
              <h1 className="hero-fade mt-5 text-[2.6rem] sm:text-5xl md:text-6xl xl:text-[4.2rem] font-semibold leading-[1.08] tracking-tight">
                <span className="block text-[#1B2520]">
                  把出海判断,
                </span>
                <span className="block mt-2 text-[#1B2520]">
                  做到<span className="text-[#C2473B]">敢</span>交给董事会
                </span>
              </h1>

              {/* "岐黄"注解 — 降低品牌名理解成本 */}
              <div className="hero-fade mt-4 flex items-center gap-2.5 text-sm text-[#5b6661]">
                <span
                  className="inline-block h-1 w-1 rounded-full bg-[#C2473B]"
                  aria-hidden
                />
                <span
                  className="italic"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  「岐黄」二字取自<span className="text-[#1B2520] font-medium">岐伯</span>与<span className="text-[#1B2520] font-medium">黄帝</span>——中医药的两千年源头
                </span>
              </div>

              {/* 副标题 — 落到具体承诺 */}
              <p className="hero-fade mt-6 max-w-xl text-base md:text-lg leading-[1.78] text-[#3a4540]">
                AI <span className="font-semibold text-[#C2473B]">7 天</span>,
                扫描 10,000+ 候选、
                匹配 50 家合伙人、走到 3 张敢签的判断书 ——
                <span className="text-[#1B2520] font-medium">算法发现机会,顾问陪跑落地。</span>
              </p>

              {/* CTA 三层分级:一级 7 天陪跑 / 二级 看案例 / 三级 订阅周报 */}
              <div className="hero-fade mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/diagnose"
                  onClick={() => tracking.click('hero_start_overseas_bd', 'cta')}
                  className="group inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.35)] transition-all hover:-translate-y-0.5"
                >
                  <Sparkles className="h-5 w-5" />
                  开始 7 天陪跑
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/research"
                  onClick={() => tracking.click('hero_view_bd_method', 'cta')}
                  className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-4 text-base font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white hover:-translate-y-0.5"
                >
                  <Globe2 className="h-5 w-5" />
                  看 32 个真实陪跑档案
                </Link>

                {/* Tertiary — 订阅《出海判断周报》 */}
                <Link
                  to="/research"
                  onClick={() => tracking.click('hero_subscribe_newsletter', 'cta')}
                  className="group inline-flex items-center gap-2 rounded-xl border border-[#2F5D57]/20 bg-white/60 px-4 py-3 text-sm font-medium text-[#2F5D57] transition-all hover:bg-white hover:border-[#C2473B]/40 hover:text-[#C2473B]"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C2473B] group-hover:animate-pulse" />
                  订阅《出海判断周报》
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* 3 项信任锚点 — 围绕「判断」而非「功能」 */}
              <div className="hero-fade mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#5b6661]">
                {[
                  '7 天出判断书',
                  '92% 入选率,3 家进入谈判',
                  '算法 + 顾问 · 全程陪跑',
                ].map((item) => (
                  <div key={item} className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C2473B]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ============ 中:羊驼吉祥物 — 已迁移到右下方浮动 ============ */}

            {/* ============ 右:算法漏斗可视化 ============ */}
            <div className="hero-fade flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[440px]">
                {/* 卡片容器 - 暗色突出(品牌墨青+朱砂) */}
                <div className="relative rounded-[2rem] border border-[#2F5D57]/20 bg-gradient-to-br from-[#0a1612] via-[#0d1f1a] to-[#11281f] p-6 md:p-7 shadow-[0_30px_60px_-20px_rgba(27,37,32,0.45)]">
                  {/* 顶部状态条 */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C2473B] opacity-70" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C2473B]" />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C2473B]">
                        LIVE
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-50/60">
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
                  <div className="mt-5 pt-4 border-t border-[#C2473B]/15 flex items-center justify-between">
                    <div className="text-[10px] text-amber-50/60">
                      <span className="font-mono text-[#C2473B]">⏱ 7 天</span>
                      <span className="mx-1.5">·</span>
                      <span className="font-mono text-[#C2473B]">24%</span>
                      进入谈判
                    </div>
                    <div className="text-[10px] font-semibold text-[#C2473B]">
                      qihuangsihai.com
                    </div>
                  </div>
                </div>

                {/* 容器外的小装饰:左上角浮动 — 一句话陪跑档案 */}
                <div
                  className="hidden md:block absolute -left-8 -top-4 max-w-[180px] rounded-2xl bg-white px-3.5 py-3 shadow-xl border border-[#C2473B]/30 rotate-[-4deg]"
                  aria-hidden
                >
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#C2473B] mb-1">
                    真实陪跑
                  </div>
                  <div className="text-xs font-semibold text-[#1B2520] leading-snug">
                    某沪上百年中成药厂 → 日本
                  </div>
                  <div className="text-[10px] text-[#5b6661] mt-1">
                    7 天匹配 32 家合伙人,3 家签 MOU
                  </div>
                </div>

                {/* 容器外的小装饰:右下角浮动 — 羊驼吉祥物(品牌差异化符号)
                    v2 PRD:显示断点放宽到 lg+,尺寸 lg 110px / xl 140px */}
                <div
                  className="hidden lg:block absolute -right-6 -bottom-6 z-20 group cursor-pointer"
                  aria-label="岐黄四海的 AI 助手 — 算法小驼驼"
                  role="img"
                >
                  {/* 朱砂外环 + 呼吸动画(增强) */}
                  <div className="relative lg:w-[110px] lg:h-[110px] xl:w-[140px] xl:h-[140px] rounded-full bg-gradient-to-br from-[#FAF8F3] via-[#F5F0E8] to-[#EDE8DC] border-2 border-[#C2473B] shadow-[0_18px_42px_-12px_rgba(194,71,59,0.45)] overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-1 group-hover:shadow-[0_24px_50px_-12px_rgba(194,71,59,0.55)]">
                    {/* 朱砂呼吸环(品牌差异化信号) */}
                    <span
                      className="absolute inset-0 rounded-full ring-2 ring-[#C2473B]/40 animate-ink-pulse pointer-events-none"
                      aria-hidden
                    />
                    {/* 内部羊驼 canvas */}
                    <InteractiveAvatar compact loadingBg="#FAF8F3" />

                    {/* 左上 LIVE 小圆点 */}
                    <div className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 backdrop-blur-sm z-10">
                      <span className="h-1 w-1 rounded-full bg-[#C2473B] animate-ink-pulse" />
                      <span className="text-[7px] font-bold tracking-wider text-white">LIVE</span>
                    </div>

                    {/* 右下朱砂小角标 */}
                    <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#C2473B] border-2 border-white shadow-sm z-10" />
                  </div>

                  {/* 底部小标签 — v2 PRD:标签从「算法小驼驼」改为「岐黄四海的 AI 助手」 */}
                  <div className="mt-2 text-center">
                    <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#C2473B]">
                      岐黄四海的 AI 助手
                    </div>
                    <div className="text-[8px] text-[#5b6661] mt-0.5">
                      24h 在线 · 点击看陪跑档案
                    </div>
                  </div>

                  {/* 悬停浮层:陪跑档案摘要 */}
                  <div className="absolute right-0 bottom-full mb-3 w-[260px] origin-bottom-right scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                    <div className="rounded-2xl bg-[#1B2520] border border-[#C2473B]/30 shadow-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#C2473B] animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#C2473B]">
                          陪跑档案 · #2026-06
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white leading-snug">
                        某沪上百年中成药厂 × 日本药妆连锁
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-[#aab8d6]">7 天匹配</span>
                        <span className="font-mono font-bold text-[#C2473B]">32 → 3 家 MOU</span>
                      </div>
                    </div>
                    {/* 小三角 */}
                    <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-[#1B2520] border-r border-b border-[#C2473B]/30 rotate-45" />
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

            {/* ========== 本地预览:产业网络拓扑 ========== */}
            <div className="mt-10 md:mt-14 rounded-2xl border border-[#2F5D57]/12 bg-white/70 backdrop-blur-sm p-5 md:p-7 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    本地预览 · Local Preview
                  </div>
                  <h4 className="mt-2 text-lg md:text-xl font-semibold text-[#1B2520] leading-snug">
                    产业网络拓扑 · insitro × ECYTON
                  </h4>
                  <p className="mt-1.5 text-xs md:text-sm text-[#5b6661]">
                    实时映射资本 · 客户 · 供应 · 合作 · 竞对 5 类关系,focal 节点脉冲提示动态监测
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-[#5b6661]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    FOCAL
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2F5D57]" />
                    CAPITAL
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C2473B]" />
                    SUPPLIER
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-[#FAF8F3] border border-[#2F5D57]/8 overflow-hidden">
                <IndustryNetworkGraph />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
