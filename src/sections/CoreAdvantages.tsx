/**
 * Core Advantages Section — 核心优势版块
 * 
 * 展示专属订制算法的四大发现能力:
 * - 发现下游客户
 * - 发现上游供应商
 * - 发现投资金主
 * - 发现竞争对手
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Users,
  Building2,
  TrendingUp,
  Target,
  Sparkles,
  CheckCircle2,
  Brain,
  Globe,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Advantage {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  features: string[];
  caseStudy?: {
    company: string;
    result: string;
  };
}

const CoreAdvantages = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const advantages: Advantage[] = [
    {
      id: 'customers',
      icon: <Users className="h-6 w-6" />,
      title: '发现下游客户',
      desc: '通过多维度数据分析,精准定位目标市场的潜在买家群体,包括分销商、零售商、医疗机构等。',
      features: [
        '基于海关数据和消费洞察的客户画像',
        '多渠道触达策略定制',
        '从发现到成交的全链路指导',
      ],
      caseStudy: {
        company: '某中药制药企业',
        result: '3个月内锁定12家日本药妆连锁潜在客户',
      },
    },
    {
      id: 'suppliers',
      icon: <Building2 className="h-6 w-6" />,
      title: '发现上游供应商',
      desc: '在目标市场或全球范围内,发现符合您需求的优质供应商,优化供应链结构。',
      features: [
        '全球供应商数据库智能匹配',
        '质量合规性前置评估',
        '供应链成本优化分析',
      ],
      caseStudy: {
        company: '某保健食品品牌',
        result: '为德国市场找到3家通过欧盟认证的原料供应商',
      },
    },
    {
      id: 'investors',
      icon: <TrendingUp className="h-6 w-6" />,
      title: '发现投资金主',
      desc: '发现对该领域感兴趣的投资机构、战略投资者和产业基金,加速出海进程。',
      features: [
        '投资偏好与您项目的高匹配度分析',
        '接触决策链上关键人物',
        'BP优化和路演策略支持',
      ],
      caseStudy: {
        company: '某本草美妆品牌',
        result: '成功对接2家关注中医药赛道的美元基金',
      },
    },
    {
      id: 'competitors',
      icon: <Target className="h-6 w-6" />,
      title: '发现竞争对手',
      desc: '全面分析目标市场的竞争格局,找准差异化定位,知己知彼。',
      features: [
        '竞争格局多维分析',
        '差异化定位策略建议',
        '竞品优劣势对比报告',
      ],
      caseStudy: {
        company: '某汉方护肤品牌',
        result: '发现日本市场2家定位相似的竞品,制定差异化突围策略',
      },
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 标题淡入
      gsap.fromTo(
        '.advantage-header',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );

      // 卡片依次浮入
      gsap.fromTo(
        '.advantage-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="core-advantages"
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-32 bg-gradient-to-b from-[#FAF8F3] to-white"
    >
      {/* 装饰性背景 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(47, 93, 87, 0.15) 0%, transparent 70%)',
            transform: 'translate(-30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(194, 71, 59, 0.1) 0%, transparent 70%)',
            transform: 'translate(30%, 30%)',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* 章节标题 */}
        <div className="mx-auto max-w-3xl text-center mb-16 advantage-header">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2F5D57]/20 bg-white/80 px-4 py-2 text-sm text-[#2F5D57] shadow-sm mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">核心优势</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.15] tracking-tight text-[#1B2520]">
            专属订制算法
            <span className="block text-[#2F5D57] mt-2">发现四大关键资源</span>
          </h2>
          <p className="mt-6 text-lg leading-[1.8] text-[#5b6661] max-w-2xl mx-auto">
            我们不只是给建议——我们用算法帮您精准找到:下游客户在哪里、上游供应商有哪些、投资金主对什么感兴趣、竞争对手如何布局。
          </p>
        </div>

        {/* 四大发现能力卡片 */}
        <div ref={cardsRef} className="grid gap-8 md:grid-cols-2">
          {advantages.map((adv, index) => (
            <article
              key={adv.id}
              className="advantage-card group relative rounded-[1.5rem] bg-white border border-[#2F5D57]/10 p-8 shadow-sm hover:shadow-xl hover:border-[#2F5D57]/25 transition-all duration-300"
            >
              {/* 顶部装饰 */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[1.5rem] bg-gradient-to-r from-[#2F5D57] to-[#C2473B] opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* 序号 */}
              <div className="absolute -top-4 right-8 flex h-10 w-10 items-center justify-center rounded-full bg-[#C2473B] text-white font-bold text-lg shadow-lg">
                {index + 1}
              </div>

              {/* 图标 */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2F5D57]/10 text-[#2F5D57] mb-5">
                {adv.icon}
              </div>

              {/* 标题和描述 */}
              <h3 className="text-2xl font-semibold text-[#1B2520] tracking-tight mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                {adv.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#5b6661] mb-6">
                {adv.desc}
              </p>

              {/* 特点列表 */}
              <ul className="space-y-3 mb-6">
                {adv.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-[#3a4540]">
                    <CheckCircle2 className="h-4 w-4 text-[#C2473B] mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* 案例 */}
              {adv.caseStudy && (
                <div className="rounded-xl bg-[#F5F0E8] p-4 border-l-4 border-[#2F5D57]">
                  <div className="text-xs font-semibold text-[#2F5D57] mb-1">真实案例</div>
                  <div className="text-xs text-[#5b6661]">
                    <span className="font-medium text-[#3a4540]">{adv.caseStudy.company}</span>
                    <span className="mx-1">—</span>
                    {adv.caseStudy.result}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* 底部 CTA */}
        <div className="mt-16 text-center advantage-header">
          <p className="text-base text-[#5b6661] mb-6">
            想了解我们的专属订制算法如何为您的项目发现关键资源?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/diagnose"
              className="inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.25)] transition-all hover:-translate-y-0.5"
            >
              <Brain className="h-5 w-5" />
              开始智能诊断
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/expert"
              className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-4 text-base font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white hover:-translate-y-0.5"
            >
              <Globe className="h-5 w-5" />
              预约顾问咨询
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoreAdvantages;
