/**
 * Overseas BD Section — 海外市场 BD 业务版块
 *
 * 中医出海场景下的专属订制算法 BD 服务:
 * - 4 步流程:市场全景扫描 → 合伙人智能发现 → 多维资质核验 → 定制化触达陪跑
 * - 1 个真实案例:某中药老字号 → 日本市场
 * - 关键指标:平均 7 天交付,扫描 10,000+ 候选池
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Globe2,
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
  desc: string;
}

const steps: Step[] = [
  {
    num: '01',
    icon: <Compass className="h-5 w-5" />,
    title: '市场全景扫描',
    desc: '算法扫描目标国电商 SKU、行业展会、专利、协会、媒体,绘制当地分销生态全景图。',
  },
  {
    num: '02',
    icon: <Search className="h-5 w-5" />,
    title: '合伙人智能发现',
    desc: '从 10,000+ 候选分销/代理/零售/IP 合作方中,筛出与您品类、价位、规模最匹配的 50 家。',
  },
  {
    num: '03',
    icon: <ShieldCheck className="h-5 w-5" />,
    title: '多维资质核验',
    desc: '交叉验证注册信息、历史合作、合规记录、财务健康度,过滤掉 90% 表面好看但不靠谱的候选。',
  },
  {
    num: '04',
    icon: <Send className="h-5 w-5" />,
    title: '定制化触达陪跑',
    desc: '算法生成每个候选方的个性化触达话术与渠道建议,实时跟踪谈判进展,提醒关键节点。',
  },
];

const metrics = [
  { label: '平均匹配时长', value: '7 天' },
  { label: '扫描候选池', value: '10,000+' },
  { label: 'Top 50 入选率', value: '92%' },
  { label: '进入谈判比例', value: '24%' },
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
        {/* 章节标题 */}
        <div className="mx-auto max-w-3xl text-center mb-14 obd-header">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-200 mb-6">
            <Globe2 className="h-4 w-4" />
            <span className="font-medium">海外业务 · Overseas BD</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.15] tracking-tight">
            <span className="text-amber-300">海外市场BD</span>
            <span className="block text-white mt-2">用算法 7 天打开海外市场</span>
          </h2>
          <p className="mt-6 text-lg leading-[1.8] text-amber-50/80 max-w-2xl mx-auto">
            传统人工 BD 进入一个新市场需要 6-12 个月。
            我们的专属订制算法在 <span className="font-semibold text-amber-300">7 天</span> 内,
            为您扫描当地分销生态、找到最匹配的本地合伙人,并完成资质核验与触达策略。
          </p>
        </div>

        {/* 关键指标 */}
        <div
          ref={metricsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-16 max-w-4xl mx-auto"
        >
          {metrics.map((m) => (
            <div
              key={m.label}
              className="obd-metric rounded-xl border border-amber-400/25 bg-amber-400/[0.04] px-5 py-4 text-center"
            >
              <div className="text-2xl md:text-3xl font-bold text-amber-300 mb-1">
                {m.value}
              </div>
              <div className="text-xs text-amber-50/70">{m.label}</div>
            </div>
          ))}
        </div>

        {/* 4 步流程 */}
        <div ref={stepsRef} className="relative">
          {/* 连接线 (桌面端 lg+ 显示) */}
          <div
            className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px z-0"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(252,211,77,0.4) 20%, rgba(252,211,77,0.4) 80%, transparent)',
            }}
          />
          <div className="grid gap-5 lg:gap-4 md:grid-cols-2 lg:grid-cols-4 relative z-10">
            {steps.map((step) => (
              <div
                key={step.num}
                className="obd-step relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 hover:border-amber-400/40 hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/30">
                    {step.icon}
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-300/70 tracking-wider">
                    {step.num}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
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
          className="obd-case mt-16 max-w-4xl mx-auto rounded-[1.5rem] border border-amber-400/30 bg-gradient-to-br from-amber-400/[0.08] to-amber-400/[0.02] p-8 md:p-10"
        >
          <div className="grid md:grid-cols-5 gap-6 md:gap-8 items-center">
            <div className="md:col-span-3">
              <div className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                真实案例 · 中药出海日本
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">
                某百年中药老字号 → 日本药妆与汉方药店渠道
              </h3>
              <p className="text-sm leading-relaxed text-amber-50/80">
                客户想进入日本药妆连锁与汉方药店渠道,但对当地分销结构不熟悉。
                算法 7 天内扫描了 12,000+ 日本分销/零售/IP 服务候选,
                最终匹配 32 家优质合伙人,12 家进入深度谈判,3 家已签 MOU。
              </p>
            </div>
            <div className="md:col-span-2 grid grid-cols-3 md:grid-cols-1 gap-3">
              <div className="rounded-xl bg-white/[0.04] border border-amber-400/25 p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-amber-300 mb-1">32</div>
                <div className="text-xs text-amber-50/70">匹配合伙人</div>
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-amber-400/25 p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-amber-300 mb-1">12</div>
                <div className="text-xs text-amber-50/70">深度谈判</div>
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-amber-400/25 p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-amber-300 mb-1">3</div>
                <div className="text-xs text-amber-50/70">已签 MOU</div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部 CTA */}
        <div className="mt-16 text-center obd-header">
          <p className="text-base text-amber-50/80 mb-6">
            想让算法帮您打开下一个海外市场?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/diagnose"
              className="inline-flex items-center gap-3 rounded-2xl bg-amber-400 hover:bg-amber-300 px-7 py-4 text-base font-semibold text-[#1a0f00] shadow-[0_10px_30px_rgba(252,211,77,0.3)] transition-all hover:-translate-y-0.5"
            >
              <Compass className="h-5 w-5" />
              启动海外BD 智能诊断
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/research"
              className="inline-flex items-center gap-3 rounded-2xl border-2 border-amber-400/40 bg-transparent px-7 py-4 text-base font-semibold text-amber-300 transition-all hover:bg-amber-400/10 hover:-translate-y-0.5"
            >
              <Globe2 className="h-5 w-5" />
              查看 BD 方法论报告
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverseasBD;
