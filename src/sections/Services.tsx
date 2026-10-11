/**
 * Services Section — 「稳稳」叙事下的 4 个陪跑节点
 *
 * 围绕「让本草品牌稳稳走向世界」重构：
 * - 4 个节点都锚到「稳」的具体场景：迷茫时看稳、找路时选稳、谈判时坐稳、稳定后稳 14 个月
 * - 顶部 tag 改为「让本草品牌 稳稳走向世界」
 * - 副标强调「算法指方向,数据打底,真人陪你稳稳出海」
 * - CTA 改为「让小驼陪我稳稳走第一步」
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Compass,
  Heart,
  MessageCircle,
  Sparkles,
  Users,
  Send,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Services = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);

  // 图标按 i18n services2.steps 顺序
  const stepIcons = [
    <Compass key="i" className="h-7 w-7" />,
    <Users key="u" className="h-7 w-7" />,
    <MessageCircle key="m" className="h-7 w-7" />,
    <Send key="s" className="h-7 w-7" />,
  ];
  const stepColors = [
    { color: 'text-[#C2473B]', bg: 'bg-[#C2473B]/10' },
    { color: 'text-[#D9A66B]', bg: 'bg-[#D9A66B]/15' },
    { color: 'text-[#7B9E8A]', bg: 'bg-[#7B9E8A]/15' },
    { color: 'text-[#2F5D57]', bg: 'bg-[#2F5D57]/15' },
  ];

  const steps = t('services2.steps', { returnObjects: true }) as Array<{
    step: string;
    titleEn: string;
    emotion: string;
    title: string;
    description: string;
    deliverables: string[];
  }>;

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
          stagger: 0.12,
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
        background:
          'linear-gradient(180deg, #FFFCF5 0%, #F7EFE0 50%, #FAF6EC 100%)',
      }}
    >
      {/* 装饰性背景 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(194,71,59,0.03) 60px, rgba(194,71,59,0.03) 61px)',
          }}
        />
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #D9A66B 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* 章节标题 — 「稳稳」叙事 */}
        <div className="mx-auto max-w-3xl text-center mb-16 service-header">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C2473B]/30 bg-white px-4 py-2 text-sm text-[#C2473B] shadow-sm mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">{t('services2.topTag')}</span>
          </div>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.15] tracking-tight text-[#2A1F18]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('services2.titleLine1')}
            <span className="block text-[#C2473B] mt-2">{t('services2.titleAccent')}</span>
          </h2>
          <p
            className="mt-6 text-lg leading-[1.85] text-[#5A4A3C] max-w-2xl mx-auto"
            dangerouslySetInnerHTML={{ __html: t('services2.intro') }}
          />
        </div>

        {/* 四步陪跑节点 */}
        <div className="service-steps grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <article
              key={step.step}
              className="service-card group relative rounded-[1.5rem] bg-white border border-[#C2473B]/12 p-6 hover:shadow-xl hover:border-[#C2473B]/30 transition-all duration-300"
            >
              {/* 步骤序号 */}
              <div className="absolute -top-3 -left-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#C2473B] text-white font-bold text-lg shadow-lg">
                {step.step}
              </div>

              {/* 图标 + 颜色 */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stepColors[index]?.bg} ${stepColors[index]?.color} mb-4`}>
                {stepIcons[index]}
              </div>

              {/* 情感锚点 — 小灰字 */}
              <div
                className="text-xs text-[#5A4A3C] italic mb-2 leading-snug"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {step.emotion}
              </div>

              {/* 标题 */}
              <h3
                className="text-xl font-semibold text-[#2A1F18] tracking-tight mb-1"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {step.title}
              </h3>
              <div className="text-xs text-[#C2473B]/70 mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                {step.titleEn}
              </div>

              {/* 描述 */}
              <p className="text-sm leading-relaxed text-[#5A4A3C] mb-4">
                {step.description}
              </p>

              {/* 陪跑清单 */}
              <ul className="space-y-2">
                {step.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-[#5A4A3C]">
                    <Heart className="h-3.5 w-3.5 mt-0.5 shrink-0 fill-[#C2473B] text-[#C2473B]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* 步骤连接线 */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[#C2473B]/20" />
              )}
            </article>
          ))}
        </div>

        {/* CTA 按钮 */}
        <div className="mt-16 text-center service-header">
          <div className="inline-flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <Link
              to="/diagnose"
              className="inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.25)] transition-all hover:-translate-y-0.5"
            >
              <Heart className="h-5 w-5 fill-white" />
              {t('hero3.ctaPrimary')}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/method"
              className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-4 text-base font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white hover:-translate-y-0.5"
            >
              <Users className="h-5 w-5" />
              {t('hero3.ctaMethod')}
            </Link>
            <Link
              to="/research"
              className="group inline-flex items-center gap-2 rounded-xl border border-[#2F5D57]/20 bg-white px-4 py-3 text-sm font-medium text-[#2F5D57] transition-all hover:bg-[#F7EFE0] hover:border-[#C2473B]/40 hover:text-[#C2473B]"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C2473B] group-hover:animate-pulse" />
              {t('hero3.ctaSubscribe')}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#5A4A3C]">
            {t('services2.footerNote')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Services;
