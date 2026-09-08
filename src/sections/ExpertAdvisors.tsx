/**
 * 专家顾问团队展示
 * 
 * 展示岐黄四海的顾问团队、资质背景、服务领域
 * 作为 ExpertPage 的信任建设部分
 */

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Globe2,
  MessageSquare,
  Phone,
  Star,
  Users,
  Workflow,
} from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: <Globe2 className="h-6 w-6" />,
    title: '市场进入判断',
    titleEn: 'Market Entry Assessment',
    desc: 'AI 诊断 + 顾问复核,判断该不该进、值不值得进。',
    descEn: 'AI diagnosis + advisor review to determine if entry is warranted.',
  },
  {
    icon: <Workflow className="h-6 w-6" />,
    title: '合规路径设计',
    titleEn: 'Compliance Pathway Design',
    desc: '药品 / 食品 / 化妆品路径选择,注册方案与时间线规划。',
    descEn: 'Drug, food or cosmetics pathway selection, registration plan and timeline.',
  },
  {
    icon: <Briefcase className="h-6 w-6" />,
    title: '渠道战略与落地',
    titleEn: 'Channel Strategy & Execution',
    desc: '代理合作、电商平台、线下连锁的全链路渠道设计。',
    descEn: 'Full-chain channel design: agents, e-commerce and offline retail.',
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: '品牌本地化',
    titleEn: 'Brand Localization',
    desc: '品牌叙事、本地语言、文化适配的出海品牌建设方案。',
    descEn: 'Brand narrative, local language and cultural adaptation strategy.',
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: '全程项目陪跑',
    titleEn: 'End-to-End Project Coaching',
    desc: '从立项到落地,顾问全程陪跑,关键节点深度介入。',
    descEn: 'Advisors coach from立项 to launch, deep involvement at critical milestones.',
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: '资源对接',
    titleEn: 'Resource Connection',
    desc: '检测机构、律所、代理、渠道的优质资源精准对接。',
    descEn: 'Precise connections with testing labs, law firms, agents and channels.',
  },
];

const ExpertAdvisors = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const sectionRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.service-card',
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: servicesRef.current, start: 'top 75%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#FAF8F3] text-[#1B2520]">
      {/* 页面头部 */}
      <div className="relative overflow-hidden border-b border-[#2F5D57]/10">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 12% 88%, rgba(47, 93, 87, 0.06), transparent 45%), radial-gradient(circle at 88% 12%, rgba(194, 71, 59, 0.04), transparent 50%)',
            }}
          />
        </div>
        <div className="container relative mx-auto px-6 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2F5D57]/20 bg-[#2F5D57]/8 px-5 py-2 text-sm font-medium text-[#2F5D57]">
              <Users className="h-4 w-4" />
              {isZh ? '陪跑的真人' : 'Real People Behind the Work'}
            </div>
            <h1 className="mt-6 text-4xl md:text-6xl font-semibold leading-[1.08] tracking-tight text-[#1B2520]">
              {isZh ? (
                <>
                  平台 AI + 资深顾问
                  <span className="block mt-2 bg-gradient-to-r from-[#2F5D57] via-[#5aa698] to-[#C2473B] bg-clip-text text-transparent">
                    双重决策保障
                  </span>
                </>
              ) : (
                <>
                  {'AI + Advisors'}
                  <span className="block bg-gradient-to-r from-[#2F5D57] via-[#5aa698] to-[#C2473B] bg-clip-text text-transparent">
                    Dual Decision Guarantee
                  </span>
                </>
              )}
            </h1>
            <p className="mt-6 text-lg leading-[1.7] text-[#3a4540] md:text-xl">
              {isZh
                ? '平台 AI 完成前置判断,复杂项目由资深出海顾问进一步评估。每一项建议背后都有具体的人、具体的项目、具体的判断 — 而不只是数据。'
                : 'Platform AI handles front-loading judgment; complex projects get senior advisors for deeper evaluation. Every recommendation has a real person behind it.'}
            </p>
          </div>

          {/* 快速服务标签 */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              isZh ? '12+ 年出海实战' : '12+ Years Practice',
              isZh ? '120+ 服务案例' : '120+ Cases Served',
              isZh ? '35 国监管框架' : '35 Country Frameworks',
              isZh ? '全流程陪跑' : 'End-to-End Coaching',
            ].map((tag) => (
              <div
                key={tag}
                className="rounded-full border border-[#2F5D57]/15 bg-white px-4 py-2 text-sm text-[#3a4540] shadow-sm"
              >
                <CheckCircle2 className="mr-2 inline h-3.5 w-3.5 text-[#2F5D57]" />
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 服务内容 */}
      <div ref={servicesRef} className="border-t border-[#2F5D57]/10 bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] text-[#C2473B]">
              <Workflow className="h-4 w-4" />
              {isZh ? '我们做的具体事' : 'What we do'}
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-[#1B2520] tracking-tight">
              {isZh ? '陪跑 ≠ 报告,陪跑 = 一件件事做完' : 'Coaching ≠ Reports. Coaching = Done.'}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#5b6661]">
              {isZh
                ? '不是泛咨询,而是针对中医药出海的具体问题,做到一半你看得见结果。'
                : 'Not generic consulting — actionable solutions for specific TCM globalization challenges.'}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="service-card rounded-3xl border border-[#2F5D57]/12 bg-[#FAF8F3] p-7 transition-all hover:border-[#2F5D57]/30 hover:bg-white hover:shadow-md"
              >
                <div className="inline-flex rounded-2xl border border-[#2F5D57]/20 bg-white p-3 text-[#2F5D57]">
                  {service.icon}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[#1B2520]">
                  {isZh ? service.title : service.titleEn}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#3a4540]">
                  {isZh ? service.desc : service.descEn}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 rounded-3xl border-2 border-[#2F5D57]/20 bg-white p-10 text-center shadow-sm relative overflow-hidden">
            <div
              aria-hidden
              className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#C2473B]/8 blur-2xl"
            />
            <h3 className="relative text-2xl md:text-3xl font-semibold text-[#1B2520] tracking-tight">
              {isZh ? '准备好开始了吗?' : 'Ready to get started?'}
            </h3>
            <p className="relative mt-3 text-base leading-relaxed text-[#5b6661] max-w-lg mx-auto">
              {isZh
                ? '先完成 3 分钟 AI 诊断,或直接预约 30 分钟免费专家咨询 — 两种方式都不会让你白跑。'
                : 'Complete the AI diagnosis first, or book a free 30-min expert consultation directly.'}
            </p>
            <div className="relative mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/diagnose"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(194,71,59,0.28)] transition-all hover:-translate-y-0.5"
              >
                <Star className="h-4 w-4" />
                {isZh ? '开始 AI 诊断' : 'Start AI Diagnosis'}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-3 text-sm font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white hover:-translate-y-0.5"
              >
                <MessageSquare className="h-4 w-4" />
                {isZh ? '预约 30 分钟顾问' : 'Book Expert Consultation'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpertAdvisors;