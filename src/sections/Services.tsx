/**
 * Services Section — 陪你走的四个节点（陪跑者版）
 *
 * 设计思路：
 * - 不再是「四步走服务流程」，而是「陪你走的四个节点」
 * - 每个节点强调「我们陪」而非「我们提供」
 * - 情感化话术：「你迷茫时」「你找路时」「你谈判时」「你稳定后」
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
  CheckCircle2,
  Send,
  TrendingUp,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface AccompanyStep {
  step: string;
  icon: React.ReactNode;
  title: string;
  titleEn: string;
  emotion: string;
  description: string;
  deliverables: string[];
  color: string;
  bg: string;
}

const Services = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);

  const accompanySteps: AccompanyStep[] = [
    {
      step: '壹',
      icon: <Compass className="h-7 w-7" />,
      title: '迷茫时,我们陪你想',
      titleEn: 'When You\'re Lost',
      emotion: '你一个人想不清楚要不要走这一步',
      description: '你可能听说过日本、欧盟、东南亚,但不知道哪个先做。我们陪你想 —— 不是给你一张表让你自己填,是 60 分钟一起聊。',
      deliverables: [
        '60 分钟 1v1 陪聊,聊清楚要不要走',
        '35 国优先级,我们陪你看哪个先做',
        '预算、团队、合规,陪你掂量',
        '风险点陪你一起暴露,不是隐瞒',
      ],
      color: 'text-[#C2473B]',
      bg: 'bg-[#C2473B]/10',
    },
    {
      step: '贰',
      icon: <Users className="h-7 w-7" />,
      title: '找路时,我们陪你找',
      titleEn: 'When You Need Allies',
      emotion: '你想找第一个合伙人,但不知道谁靠谱',
      description: '小驼扫 10,000+ 候选,但真人顾问陪你挑 —— 不是给一份名单让你自己联系,是陪你看每个候选、一起排优先级。',
      deliverables: [
        '小驼扫 10,000+ 候选,顾问陪你筛 50 家',
        '每个候选的画像,我们陪你看',
        '谁适合先接触,我们陪你想',
        '第一次邮件怎么写,我们陪你改',
      ],
      color: 'text-[#D9A66B]',
      bg: 'bg-[#D9A66B]/15',
    },
    {
      step: '叁',
      icon: <MessageCircle className="h-7 w-7" />,
      title: '谈判时,我们陪你谈',
      titleEn: 'When You Negotiate',
      emotion: '你第一次坐到谈判桌前,怕说错话',
      description: '我们陪你坐到谈判桌前 —— 不是发一份"谈判指南"让你自学。冷场时给提示,谈崩时一起复盘,签约时一起松口气。',
      deliverables: [
        '第一次会谈,我们陪你一起飞过去',
        '合同条款,我们陪你逐字看',
        '价格博弈,我们陪你想底线',
        '冷场 / 谈崩,我们陪你救场',
      ],
      color: 'text-[#7B9E8A]',
      bg: 'bg-[#7B9E8A]/15',
    },
    {
      step: '肆',
      icon: <Send className="h-7 w-7" />,
      title: '稳定后,我们继续陪',
      titleEn: 'Until It Stands',
      emotion: '你签了约,但政策变了、订单掉了',
      description: '出海只是开始。我们陪你盯 —— 政策变了我们比你先看到,订单掉了我们陪你找原因,新机会来了我们继续陪你挖。',
      deliverables: [
        '政策变了,我们比你先 48 小时看到',
        '订单波动,我们陪你做归因',
        '新机会来了,我们继续陪你看',
        '深夜出问题,你打电话有人接',
      ],
      color: 'text-[#2F5D57]',
      bg: 'bg-[#2F5D57]/15',
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
        {/* 章节标题 — 算法 + 陪跑 双锚 */}
        <div className="mx-auto max-w-3xl text-center mb-16 service-header">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C2473B]/30 bg-white px-4 py-2 text-sm text-[#C2473B] shadow-sm mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">算法即世界 · 陪你走的四个节点</span>
          </div>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.15] tracking-tight text-[#2A1F18]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            算法先看方向，
            <span className="block text-[#C2473B] mt-2">我们陪你走完每一步</span>
          </h2>
          <p className="mt-6 text-lg leading-[1.85] text-[#5A4A3C] max-w-2xl mx-auto">
            出海不是一次咨询,是一段路。<span className="text-[#C2473B] font-medium">迷茫时小驼先帮你看清,真人顾问陪你聊,找路时陪你找,谈判时陪你去,稳定后继续陪你盯</span>。
            <br />算法给你方向,我们陪你落地。
          </p>
        </div>

        {/* 四步陪跑节点 */}
        <div className="service-steps grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {accompanySteps.map((step, index) => (
            <article
              key={step.step}
              className="service-card group relative rounded-[1.5rem] bg-white border border-[#C2473B]/12 p-6 hover:shadow-xl hover:border-[#C2473B]/30 transition-all duration-300"
            >
              {/* 步骤序号 */}
              <div className="absolute -top-3 -left-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#C2473B] text-white font-bold text-lg shadow-lg">
                {step.step}
              </div>

              {/* 图标 + 颜色 */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${step.bg} ${step.color} mb-4`}>
                {step.icon}
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
              {index < accompanySteps.length - 1 && (
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
              让小驼陪我走第一步
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/method"
              className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-4 text-base font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white hover:-translate-y-0.5"
            >
              <Users className="h-5 w-5" />
              看我们的方法论
            </Link>
            <Link
              to="/research"
              className="group inline-flex items-center gap-2 rounded-xl border border-[#2F5D57]/20 bg-white px-4 py-3 text-sm font-medium text-[#2F5D57] transition-all hover:bg-[#F7EFE0] hover:border-[#C2473B]/40 hover:text-[#C2473B]"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C2473B] group-hover:animate-pulse" />
              订阅《出海陪跑周报》
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#5A4A3C]">
            第一步可以只是「让小驼陪我聊 30 分钟」—— 不承诺、不付费,只是先有人在你身后
          </p>
        </div>
      </div>
    </section>
  );
};

export default Services;
