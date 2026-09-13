/**
 * Services Section — 服务版块
 * 
 * 展示四步服务流程:
 * 1. 智能诊断 - 用算法发现问题
 * 2. 资源发现 - 用算法发现四大资源
 * 3. 顾问陪跑 - 真人顾问全程指导
 * 4. 持续支持 - 出海后持续跟踪
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  Compass,
  FileBarChart,
  Handshake,
  LayoutTemplate,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Building2,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ServiceStep {
  step: string;
  icon: React.ReactNode;
  title: string;
  titleEn: string;
  description: string;
  deliverables: string[];
}

const Services = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);

  const serviceSteps: ServiceStep[] = [
    {
      step: '壹',
      icon: <Bot className="h-7 w-7" />,
      title: '智能诊断',
      titleEn: 'AI Diagnosis',
      description: '通过 AI 诊断引擎,快速分析您的产品特点、市场定位和资源禀赋,形成初步出海判断。',
      deliverables: [
        '35 国市场优先级评估 (A/B/C/D 四档)',
        '产品合规性初步评估',
        '预算与时间线建议',
        '主要风险点识别',
      ],
    },
    {
      step: '贰',
      icon: <Search className="h-7 w-7" />,
      title: '资源发现',
      titleEn: 'Resource Discovery',
      description: '用专属订制算法精准发现:下游客户、上游供应商、投资金主和竞争对手。',
      deliverables: [
        '目标市场潜在客户名单及画像',
        '优质供应商推荐及评估',
        '对该领域感兴趣的投资机构',
        '竞争格局分析与差异化建议',
      ],
    },
    {
      step: '叁',
      icon: <Handshake className="h-7 w-7" />,
      title: '顾问陪跑',
      titleEn: 'Expert Guidance',
      description: '资深顾问全程陪跑,从诊断到落地,每一步都有真人指导。',
      deliverables: [
        '60-90 分钟深度复盘咨询',
        '合规路径定制方案',
        '本地渠道对接指导',
        '品牌本地化策略建议',
      ],
    },
    {
      step: '肆',
      icon: <TrendingUp className="h-7 w-7" />,
      title: '持续支持',
      titleEn: 'Ongoing Support',
      description: '出海后持续跟踪,及时调整策略,确保出海之路行稳致远。',
      deliverables: [
        '市场动态定期推送',
        '策略调整建议',
        '新机会持续发现',
        '问题快速响应',
      ],
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.service-header',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );

      gsap.fromTo(
        '.service-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.service-steps', start: 'top 80%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #F5F0E8 0%, #FAF8F3 50%, #F5F0E8 100%)',
      }}
    >
      {/* 装饰性背景 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(47, 93, 87, 0.03) 60px, rgba(47, 93, 87, 0.03) 61px)',
          }}
        />
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(194, 71, 59, 0.15) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* 章节标题 */}
        <div className="mx-auto max-w-3xl text-center mb-16 service-header">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2F5D57]/20 bg-white/80 px-4 py-2 text-sm text-[#2F5D57] shadow-sm mb-6">
            <Compass className="h-4 w-4" />
            <span className="font-medium">四步走服务流程</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.15] tracking-tight text-[#1B2520]">
            从诊断到落地
            <span className="block text-[#2F5D57] mt-2">全程陪伴每一步</span>
          </h2>
          <p className="mt-6 text-lg leading-[1.8] text-[#5b6661] max-w-2xl mx-auto">
            算法发现机会,顾问陪跑落地。不是给一份报告就走,而是陪您走完出海的每一步。
          </p>
        </div>

        {/* 四步服务卡片 */}
        <div className="service-steps grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {serviceSteps.map((step, index) => (
            <article
              key={step.step}
              className="service-card group relative rounded-[1.5rem] bg-white border border-[#2F5D57]/10 p-6 hover:shadow-xl hover:border-[#2F5D57]/25 transition-all duration-300"
            >
              {/* 步骤序号 */}
              <div className="absolute -top-3 -left-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#C2473B] text-white font-bold text-lg shadow-lg">
                {step.step}
              </div>

              {/* 图标 */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2F5D57]/10 text-[#2F5D57] mb-4">
                {step.icon}
              </div>

              {/* 标题 */}
              <h3 className="text-xl font-semibold text-[#1B2520] tracking-tight mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                {step.title}
              </h3>
              <div className="text-xs text-[#2F5D57]/60 mb-3">{step.titleEn}</div>

              {/* 描述 */}
              <p className="text-sm leading-relaxed text-[#5b6661] mb-4">
                {step.description}
              </p>

              {/* 交付物 */}
              <ul className="space-y-2">
                {step.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-[#3a4540]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#C2473B] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* 步骤连接线 */}
              {index < serviceSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[#2F5D57]/20" />
              )}
            </article>
          ))}
        </div>

        {/* CTA 按钮 */}
        <div className="mt-16 text-center service-header">
          <div className="inline-flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/diagnose"
              className="inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.25)] transition-all hover:-translate-y-0.5"
            >
              <Sparkles className="h-5 w-5" />
              开始第一步:智能诊断
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/method"
              className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-4 text-base font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white hover:-translate-y-0.5"
            >
              <FileBarChart className="h-5 w-5" />
              了解更多服务详情
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#5b6661]">
            诊断后可获得初步判断,决定是否需要进一步资源发现或顾问陪跑
          </p>
        </div>
      </div>
    </section>
  );
};

export default Services;
