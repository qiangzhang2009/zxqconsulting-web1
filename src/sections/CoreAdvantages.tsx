/**
 * Core Advantages Section — 我们陪你的 4 件事（陪跑者版）
 *
 * 从「四大发现能力」改为「我们陪你的 4 件事」:
 * - 陪你判断要不要走
 * - 陪你找到第一批客户
 * - 陪你打通合规路径
 * - 陪你签约 + 持续跟进
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
  Heart,
  Sparkles,
  CheckCircle2,
  Shield,
  MessageCircle,
  Compass,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CompanionItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  desc: string;
  features: string[];
  caseStudy?: {
    company: string;
    result: string;
  };
  color: string;
  bg: string;
}

const CoreAdvantages = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const companionItems: CompanionItem[] = [
    {
      id: 'judge',
      icon: <Compass className="h-6 w-6" />,
      title: '陪你判断要不要走',
      subtitle: 'When you wonder "should we go?"',
      desc: '你不是想出海才来找我们,你是「想出海但不确定值不值得」才来。我们陪你想 —— 不是催你立项,也不是劝你放弃。',
      features: [
        '60 分钟陪聊,小驼 + 真人顾问都在',
        '35 国优先级,我们陪你看哪个先做',
        '预算 / 团队 / 合规,我们陪你掂量',
        '如果不该走,我们直接告诉你',
      ],
      caseStudy: {
        company: '某沪上百年中成药厂',
        result: '陪他想清楚「做日本」是否真的是第一步',
      },
      color: 'text-[#C2473B]',
      bg: 'bg-[#C2473B]/10',
    },
    {
      id: 'find-first',
      icon: <Users className="h-6 w-6" />,
      title: '陪你找到第一个队友',
      subtitle: 'When you need your first ally',
      desc: '出海最难的不是"找客户",是"找对的人"。我们陪你挑 —— 不是扔一份名单让你自己联系,是陪你看每个候选、一起排优先级。',
      features: [
        '小驼扫 10,000+ 候选,顾问陪你筛 50 家',
        '每个候选的画像,我们陪你看',
        '第一次邮件怎么写,我们陪你改',
        '谁适合先接触,我们陪你想',
      ],
      caseStudy: {
        company: '某沪上百年中成药厂',
        result: '7 天匹配 32 家日本合伙人,3 家签 MOU',
      },
      color: 'text-[#D9A66B]',
      bg: 'bg-[#D9A66B]/15',
    },
    {
      id: 'compliance',
      icon: <Shield className="h-6 w-6" />,
      title: '陪你打通合规路径',
      subtitle: 'When regulations feel like a maze',
      desc: '药品 / 食品 / 化妆品,每个市场门槛都不一样。我们陪你走 —— 不是丢一份 PDF 让你自己看,是陪你看条款、陪你做判断、陪你避坑。',
      features: [
        '35 国法规框架,我们陪你入库',
        '剂型 / 成分 / 标签,我们陪你想',
        '注册方案,我们陪你排时间表',
        '政策变了,我们比你先看到',
      ],
      caseStudy: {
        company: '某华东保健食品集团',
        result: '德国欧盟认证 3 家原料供应商,合规先打通',
      },
      color: 'text-[#7B9E8A]',
      bg: 'bg-[#7B9E8A]/15',
    },
    {
      id: 'follow-through',
      icon: <MessageCircle className="h-6 w-6" />,
      title: '陪你签约 + 继续陪',
      subtitle: 'When you need us after signing',
      desc: '签约不是结束。我们陪你盯 —— 政策变了我们比你先看到,订单掉了我们陪你找原因,新机会来了我们继续陪你看。',
      features: [
        '政策变了,我们比你先 48 小时看到',
        '订单波动,我们陪你做归因',
        '新机会来了,我们继续陪你看',
        '深夜出问题,你打电话有人接',
      ],
      caseStudy: {
        company: '某汉方护肤新锐品牌',
        result: '日本市场签约后,继续陪 14 个月稳定出货',
      },
      color: 'text-[#2F5D57]',
      bg: 'bg-[#2F5D57]/15',
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
      className="relative overflow-hidden py-24 md:py-32 bg-white"
    >
      {/* 装饰性背景 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-0 w-96 h-96 rounded-full opacity-8"
          style={{
            background: 'radial-gradient(circle, #D9A66B 0%, transparent 70%)',
            transform: 'translate(-30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full opacity-8"
          style={{
            background: 'radial-gradient(circle, #C2473B 0%, transparent 70%)',
            transform: 'translate(30%, 30%)',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* 章节标题 — 算法 + 陪跑 双锚 */}
        <div className="mx-auto max-w-3xl text-center mb-16 advantage-header">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C2473B]/30 bg-[#C2473B]/8 px-4 py-2 text-sm text-[#C2473B] shadow-sm mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">算法即世界 · 我们陪你的 4 件事</span>
          </div>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.15] tracking-tight text-[#2A1F18]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            算法先看，我们陪你做完
            <span className="block text-[#C2473B] mt-2">不只是顾问,是陪到底的队友</span>
          </h2>
          <p className="mt-6 text-lg leading-[1.85] text-[#5A4A3C] max-w-2xl mx-auto">
            不要海量的功能清单。
            <br />
            只有 4 件事 —— <span className="text-[#C2473B] font-medium">算法替你扫世界,真人陪你走到「签了还在陪」</span>,每件事我们都陪在旁边。
          </p>
        </div>

        {/* 四大陪跑卡片 */}
        <div ref={cardsRef} className="grid gap-8 md:grid-cols-2">
          {companionItems.map((item, index) => (
            <article
              key={item.id}
              className="advantage-card group relative rounded-[1.5rem] bg-white border border-[#C2473B]/12 p-8 shadow-sm hover:shadow-xl hover:border-[#C2473B]/30 transition-all duration-300"
            >
              {/* 顶部装饰 */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[1.5rem] bg-gradient-to-r from-[#C2473B] via-[#D9A66B] to-[#7B9E8A] opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* 序号 */}
              <div className="absolute -top-4 right-8 flex h-10 w-10 items-center justify-center rounded-full bg-[#C2473B] text-white font-bold text-lg shadow-lg">
                {index + 1}
              </div>

              {/* 图标 */}
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${item.bg} ${item.color} mb-5`}>
                {item.icon}
              </div>

              {/* 情感化副标题 */}
              <div
                className="text-xs text-[#5A4A3C] italic mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {item.subtitle}
              </div>

              {/* 主标题 */}
              <h3
                className="text-2xl font-semibold text-[#2A1F18] tracking-tight mb-3"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {item.title}
              </h3>

              {/* 描述 */}
              <p className="text-sm leading-relaxed text-[#5A4A3C] mb-6">
                {item.desc}
              </p>

              {/* 特点列表 */}
              <ul className="space-y-3 mb-6">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-[#2A1F18]">
                    <Heart className="h-4 w-4 mt-0.5 shrink-0 fill-[#C2473B] text-[#C2473B]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* 案例 */}
              {item.caseStudy && (
                <div className="rounded-xl bg-[#FFFCF5] p-4 border-l-4 border-[#C2473B]">
                  <div className="text-xs font-semibold text-[#C2473B] mb-1 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    一个真实的陪跑 · 经客户授权化名
                  </div>
                  <div className="text-xs text-[#5A4A3C]">
                    <span className="font-medium text-[#2A1F18]">{item.caseStudy.company}</span>
                    <span className="mx-1">—</span>
                    {item.caseStudy.result}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* 「我们拒绝的事」 — 品牌人格 */}
        <div className="mt-14 max-w-3xl mx-auto advantage-header">
          <div className="rounded-2xl border border-[#C2473B]/20 bg-[#FFFCF5] p-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-6 bg-[#C2473B]" />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C2473B]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                我们拒绝的事
              </span>
            </div>
            <p className="text-sm text-[#5A4A3C] leading-relaxed">
              我们<span className="text-[#C2473B] font-semibold">不接不熟悉的品类</span> ·
              我们<span className="text-[#C2473B] font-semibold">不催你立项</span> ·
              我们<span className="text-[#C2473B] font-semibold">不签完就走</span>。
              敢于说是陪你,敢于不也是陪你。
            </p>
          </div>
        </div>

        {/* 底部 CTA */}
        <div className="mt-16 text-center advantage-header">
          <p className="text-base text-[#5A4A3C] mb-6">
            想让小驼陪你做第 1 件事?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <Link
              to="/diagnose"
              className="inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.25)] transition-all hover:-translate-y-0.5"
            >
              <Heart className="h-5 w-5 fill-white" />
              让小驼陪我走第一步
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/expert"
              className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-4 text-base font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white hover:-translate-y-0.5"
            >
              <Users className="h-5 w-5" />
              看 32 个被陪过的出海人
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
        </div>
      </div>
    </section>
  );
};

export default CoreAdvantages;
