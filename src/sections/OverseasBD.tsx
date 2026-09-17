/**
 * Overseas BD Section — 小驼陪一个真实故事走过的 7 天（陪跑者版）
 *
 * 强化"陪跑档案"叙事：
 * - 主标：「7 天,我们怎么陪一家百年老字号找到日本合伙人」
 * - 每个步骤改为「陪他 X」/ 「陪他 Y」
 * - 情感化叙事：「客户想...但...我们陪他...」
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Heart,
  Compass,
  Search,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Step {
  num: string;
  icon: React.ReactNode;
  title: string;
  emotion: string;
  desc: string;
}

const steps: Step[] = [
  {
    num: '01',
    icon: <Compass className="h-5 w-5" />,
    title: '陪他想清楚',
    emotion: '他一开始只想做日本',
    desc: 'Day 1-2 — 客户只看到日本。我们陪他聊 60 分钟,拆开"做日本"三个字 —— 哪些品类适合、哪些不适合、第一步到底该迈向哪里。',
  },
  {
    num: '02',
    icon: <Search className="h-5 w-5" />,
    title: '陪他找队友',
    emotion: '他不知道日本分销生态长什么样',
    desc: 'Day 3-4 — 小驼扫了 12,000+ 日本分销 / 零售 / IP 候选。真人顾问陪他从中挑出 50 家,再一起缩到 32 家「值得见」的合伙人。',
  },
  {
    num: '03',
    icon: <ShieldCheck className="h-5 w-5" />,
    title: '陪他核验证',
    emotion: '他怕挑错人,签了被坑',
    desc: 'Day 5-6 — 我们陪他逐家核完注册、合作、合规、财务。过滤掉 90% 表面好看但不靠谱的,留下 12 家可以坐下来谈的。',
  },
  {
    num: '04',
    icon: <Send className="h-5 w-5" />,
    title: '陪他走到签约',
    emotion: '他第一次坐到谈判桌前',
    desc: 'Day 7+ — 我们陪他飞到日本,坐到第一张谈判桌前。冷场时给提示,价格博弈时给底线。最后 3 家签了 MOU,后续 14 个月我们继续陪。',
  },
];

const metrics = [
  { label: '陪跑时长', value: '7 天' },
  { label: '扫描候选', value: '12,000+' },
  { label: '陪挑合伙人', value: '32 家' },
  { label: '签约至今', value: '14 月' },
];

const OverseasBD = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const caseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 标题淡入
      gsap.fromTo(
        '.obd-header',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );

      // 指标条依次浮入
      gsap.fromTo(
        '.obd-metric',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: metricsRef.current, start: 'top 85%' },
        }
      );

      // 4 步卡片依次浮入
      gsap.fromTo(
        '.obd-step',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: stepsRef.current, start: 'top 80%' },
        }
      );

      // 案例浮入
      gsap.fromTo(
        '.obd-case',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: caseRef.current, start: 'top 85%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="overseas-bd"
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-32 text-white"
      style={{
        background:
          'linear-gradient(135deg, #0a1612 0%, #0d1f1a 45%, #11281f 100%)',
      }}
    >
      {/* 装饰背景 - 暖色调光晕 + 网格 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(252,211,77,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(252,211,77,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div
          className="absolute -top-32 right-1/4 w-[28rem] h-[28rem] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(252,211,77,0.5) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[26rem] h-[26rem] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(94,234,212,0.45) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* 章节标题 — 陪跑档案叙事 + 算法世界观 */}
        <div className="mx-auto max-w-3xl text-center mb-14 obd-header">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C2473B]/30 bg-[#C2473B]/10 px-4 py-2 text-sm text-[#C2473B] mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">算法即世界 · 陪跑档案 · 2026.06</span>
          </div>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.15] tracking-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            <span className="text-[#C2473B]">7 天,算法 + 陪跑</span>
            <span className="block text-white mt-2">一家百年老字号找到日本合伙人</span>
          </h2>
          <p className="mt-6 text-lg leading-[1.85] text-amber-50/80 max-w-2xl mx-auto">
            一家想做日本药妆连锁与汉方药店渠道的百年中成药厂,
            <span className="font-semibold text-[#C2473B]">小驼 7 天</span> 扫了 12,000+ 候选,
            真人顾问陪他挑了 <span className="font-semibold text-[#C2473B]">32 家</span> 合伙人,3 家签 MOU —— 我们又陪了 14 个月。
          </p>
        </div>

        {/* 关键指标 — 围绕「陪跑结果」 */}
        <div
          ref={metricsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-16 max-w-4xl mx-auto"
        >
          {metrics.map((m) => (
            <div
              key={m.label}
              className="obd-metric rounded-xl border border-[#C2473B]/25 bg-[#C2473B]/[0.04] px-5 py-4 text-center"
            >
              <div className="text-2xl md:text-3xl font-bold text-[#C2473B] mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                {m.value}
              </div>
              <div className="text-xs text-amber-50/70">{m.label}</div>
            </div>
          ))}
        </div>

        {/* 4 步陪跑过程 — 故事化 */}
        <div ref={stepsRef} className="relative">
          {/* 连接线 (桌面端 lg+ 显示) */}
          <div
            className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px z-0"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(194,71,59,0.4) 20%, rgba(194,71,59,0.4) 80%, transparent)',
            }}
          />
          <div className="grid gap-5 lg:gap-4 md:grid-cols-2 lg:grid-cols-4 relative z-10">
            {steps.map((step) => (
              <div
                key={step.num}
                className="obd-step relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 hover:border-[#C2473B]/40 hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C2473B]/15 text-[#C2473B] border border-[#C2473B]/30">
                    {step.icon}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#C2473B]/70 tracking-wider" style={{ fontFamily: 'var(--font-serif)' }}>
                    Day {step.num}
                  </div>
                </div>
                {/* 情感化副标题 */}
                <div className="text-xs text-amber-50/55 italic mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  {step.emotion}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-amber-50/75">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 案例研究 */}
        <div
          ref={caseRef}
          className="obd-case mt-16 max-w-4xl mx-auto rounded-[1.5rem] border border-[#C2473B]/30 bg-gradient-to-br from-[#C2473B]/[0.08] to-[#C2473B]/[0.02] p-8 md:p-10"
        >
          <div className="grid md:grid-cols-5 gap-6 md:gap-8 items-center">
            <div className="md:col-span-3">
              <div className="text-xs font-semibold text-[#C2473B] mb-2 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                一个真实的陪跑 · 中药出海日本 · 经客户授权化名
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                某沪上百年中成药厂 → 日本药妆与汉方药店渠道
              </h3>
              <p className="text-sm leading-relaxed text-amber-50/80">
                客户想进入日本药妆连锁与汉方药店渠道,但对当地分销结构不熟悉。
                小驼 7 天扫了 12,000+ 日本分销/零售/IP 服务候选,顾问陪他挑 32 家优质合伙人,
                12 家进入深度谈判,<span className="text-[#C2473B] font-medium">3 家已签 MOU</span>。
                后续 14 个月,我们继续陪 —— 政策变了我们比他先看到,新机会我们继续陪他挖。
              </p>
            </div>
            <div className="md:col-span-2 grid grid-cols-3 md:grid-cols-1 gap-3">
              <div className="rounded-xl bg-white/[0.04] border border-[#C2473B]/25 p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#C2473B] mb-1" style={{ fontFamily: 'var(--font-serif)' }}>32</div>
                <div className="text-xs text-amber-50/70">陪挑合伙人</div>
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-[#C2473B]/25 p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#C2473B] mb-1" style={{ fontFamily: 'var(--font-serif)' }}>12</div>
                <div className="text-xs text-amber-50/70">深度谈判</div>
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-[#C2473B]/25 p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#C2473B] mb-1" style={{ fontFamily: 'var(--font-serif)' }}>3</div>
                <div className="text-xs text-amber-50/70">已签 MOU</div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部 CTA */}
        <div className="mt-16 text-center obd-header">
          <p className="text-base text-amber-50/80 mb-6">
            想让小驼陪你的项目走一次这样的 7 天?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <Link
              to="/diagnose"
              className="inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.4)] transition-all hover:-translate-y-0.5"
            >
              <Heart className="h-5 w-5 fill-white" />
              让小驼陪我走第一步
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/research"
              className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#C2473B]/40 bg-transparent px-7 py-4 text-base font-semibold text-[#C2473B] transition-all hover:bg-[#C2473B]/10 hover:-translate-y-0.5"
            >
              <Sparkles className="h-5 w-5" />
              看 32 个被陪过的出海人
            </Link>
            {/* Tertiary */}
            <Link
              to="/research"
              className="group inline-flex items-center gap-2 rounded-xl border border-amber-50/20 bg-transparent px-4 py-3 text-sm font-medium text-amber-50/80 transition-all hover:bg-amber-50/10 hover:border-[#C2473B]/60 hover:text-[#C2473B]"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C2473B] group-hover:animate-pulse" />
              订阅《出海陪跑周报》
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverseasBD;
