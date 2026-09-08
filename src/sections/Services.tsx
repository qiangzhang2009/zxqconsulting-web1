import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Compass,
  FileBarChart,
  LayoutTemplate,
  ShieldCheck,
  UserRoundSearch,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Capability {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  categoryKey: string;
  outputs: string[];
  isSealed?: boolean;
}

const Services = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const capabilitiesRef = useRef<HTMLDivElement>(null);
  const methodRef = useRef<HTMLDivElement>(null);

  const capabilities: Capability[] = [
    {
      id: 'market-priority',
      icon: <Compass className="h-5 w-5" />,
      titleKey: 'services.cap_market_priority',
      descKey: 'services.cap_market_priority_desc',
      categoryKey: 'services.category_strategy',
      outputs: [
        t('services.cap_market_priority_out1'),
        t('services.cap_market_priority_out2'),
        t('services.cap_market_priority_out3'),
      ],
      isSealed: true,
    },
    {
      id: 'entry-complexity',
      icon: <ShieldCheck className="h-5 w-5" />,
      titleKey: 'services.cap_entry_complexity',
      descKey: 'services.cap_entry_complexity_desc',
      categoryKey: 'services.category_risk',
      outputs: [
        t('services.cap_entry_complexity_out1'),
        t('services.cap_entry_complexity_out2'),
        t('services.cap_entry_complexity_out3'),
      ],
    },
    {
      id: 'diagnosis-summary',
      icon: <FileBarChart className="h-5 w-5" />,
      titleKey: 'services.cap_diagnosis_summary',
      descKey: 'services.cap_diagnosis_summary_desc',
      categoryKey: 'services.category_analysis',
      outputs: [
        t('services.cap_diagnosis_summary_out1'),
        t('services.cap_diagnosis_summary_out2'),
        t('services.cap_diagnosis_summary_out3'),
      ],
    },
    {
      id: 'follow-up',
      icon: <Brain className="h-5 w-5" />,
      titleKey: 'services.cap_followup',
      descKey: 'services.cap_followup_desc',
      categoryKey: 'services.category_intelligence',
      outputs: [
        t('services.cap_followup_out1'),
        t('services.cap_followup_out2'),
        t('services.cap_followup_out3'),
      ],
    },
    {
      id: 'sample-proof',
      icon: <LayoutTemplate className="h-5 w-5" />,
      titleKey: 'services.cap_sample_proof',
      descKey: 'services.cap_sample_proof_desc',
      categoryKey: 'services.category_case',
      outputs: [
        t('services.cap_sample_proof_out1'),
        t('services.cap_sample_proof_out2'),
        t('services.cap_sample_proof_out3'),
      ],
    },
    {
      id: 'expert-upgrade',
      icon: <UserRoundSearch className="h-5 w-5" />,
      titleKey: 'services.cap_expert_upgrade',
      descKey: 'services.cap_expert_upgrade_desc',
      categoryKey: 'services.category_expert',
      outputs: [
        t('services.cap_expert_upgrade_out1'),
        t('services.cap_expert_upgrade_out2'),
        t('services.cap_expert_upgrade_out3'),
      ],
    },
  ];

  const methodSteps = [
    {
      step: '壹',
      title: t('about.step1Title'),
      description: t('about.step1Desc'),
    },
    {
      step: '贰',
      title: t('about.step2Title'),
      description: t('about.step2Desc'),
    },
    {
      step: '叁',
      title: t('about.step3Title'),
      description: t('about.step3Desc'),
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.pub-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: capabilitiesRef.current, start: 'top 75%' },
        }
      );
      gsap.fromTo(
        '.method-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: methodRef.current, start: 'top 75%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="section-services relative py-24 md:py-32 overflow-hidden"
    >
      {/* 装饰性背景 */}
      <div className="absolute inset-0 z-0">
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
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="volume-mark justify-center text-base mb-4">
            <span>卷叁</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.15] tracking-tight text-[#1B2520]">
            {t('about.sixLayersSubtitle', '6 个能力,撑起一个出海判断')}
          </h2>
          <p className="mt-6 text-lg leading-[1.8] text-[#3a4540] max-w-2xl mx-auto">
            {t('about.sixLayersSubtitleEn', '不是 6 个工具,是 6 项具体能交付的能力 — 每项背后都有可执行步骤与可衡量结果。')}
          </p>
        </div>

        {/* 服务卡片网格 */}
        <div ref={capabilitiesRef} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {capabilities.map((capability) => (
            <article
              key={capability.id}
              className="pub-card card-seal card-hover rounded-xl bg-white p-7 relative"
            >
              {/* 类别标签 */}
              <span className="badge badge-primary mb-4">
                <span className="badge-dot badge-dot-primary" />
                {t(capability.categoryKey)}
              </span>

              {/* 图标圆圈 */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#2F5D57]/10 text-[#2F5D57] mb-5">
                {capability.icon}
              </div>

              {/* 标题 */}
              <h3 className="text-xl font-semibold text-[#1B2520] tracking-tight mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                {t(capability.titleKey)}
              </h3>

              {/* 描述 */}
              <p className="text-sm leading-relaxed text-[#5b6661] mb-5">
                {t(capability.descKey)}
              </p>

              {/* 输出列表 */}
              <div className="space-y-2.5 mb-6">
                {capability.outputs.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-[#3a4540]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C2473B]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* 印章装饰 */}
              {capability.isSealed && (
                <div className="absolute top-4 right-4">
                  <div className="seal-stamp">
                    <span>重点</span>
                    <span>推荐</span>
                  </div>
                </div>
              )}

              {/* Learn more 链接 */}
              <Link
                to="/expert"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C2473B] hover:text-[#a33a30] transition-colors group"
              >
                <span>了解更多</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </div>

        {/* 陪跑方法论 */}
        <div
          ref={methodRef}
          className="mt-20 rounded-[1.5rem] border border-[#2F5D57]/15 bg-white p-8 md:p-12 shadow-sm relative overflow-hidden"
        >
          {/* 装饰性印章 */}
          <div
            aria-hidden
            className="absolute -top-8 -right-8 w-32 h-32 opacity-5"
          >
            <div className="seal-stamp-lg">
              <span>方法</span>
              <span>论</span>
            </div>
          </div>

          {/* 装饰渐变 */}
          <div
            aria-hidden
            className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[#C2473B]/5 blur-3xl"
          />

          <div className="relative">
            <div className="volume-mark mb-3">
              <span>陪跑思路</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-semibold text-[#1B2520] tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
              {t('about.approachTitle', '陪跑的思路')}
            </h3>
            <p className="mt-3 text-base text-[#5b6661]">
              {t('services.howItWorksDesc', '三步走，从诊断到落地')}
            </p>
          </div>

          {/* 步骤卡片 */}
          <div className="relative mt-10 grid gap-6 lg:grid-cols-3">
            {methodSteps.map((step, i) => (
              <div
                key={step.step}
                className="method-card pub-card rounded-xl bg-[#FAF8F3] p-6 relative"
              >
                {/* 朱砂序号 */}
                <div className="absolute -top-4 left-6 flex items-center justify-center w-12 h-12 rounded-xl bg-[#C2473B] text-white font-bold text-lg shadow-md" style={{ fontFamily: 'var(--font-serif)' }}>
                  {step.step}
                </div>
                <h4 className="mt-6 text-lg font-semibold text-[#1B2520] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  {step.title}
                </h4>
                <p className="text-sm leading-relaxed text-[#5b6661]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA 按钮 */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/expert"
              className="btn btn-primary"
            >
              {t('about.viewExpertPath', '查看顾问团')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-sm text-[#8a938e]">
              {t('services.ctaNote', '每项能力都附有可执行的步骤清单')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
