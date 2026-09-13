/**
 * About Section — 我们是谁版块
 * 
 * 简洁展示:
 * - 我们是谁
 * - 为什么选我们
 * - 核心价值观
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Globe2,
  Heart,
  Lightbulb,
  Quote,
  Shield,
  Target,
  Users,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// 核心价值观
const values: ValueItem[] = [
  {
    icon: <Target className="h-5 w-5" />,
    title: '精准而非泛泛',
    desc: '不做万金油建议,只给有据可依的判断',
  },
  {
    icon: <Heart className="h-5 w-5" />,
    title: '陪跑而非报告',
    desc: '从诊断到落地,全程真人顾问指导',
  },
  {
    icon: <Lightbulb className="h-5 w-5" />,
    title: '算法驱动决策',
    desc: '用数据发现机会,用经验判断路径',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: '合规为本',
    desc: '35国法规框架,确保每一步合规',
  },
];

interface ValueItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const About = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-header',
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
        '.about-content',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.about-content', start: 'top 80%' },
        }
      );

      gsap.fromTo(
        '.value-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.value-grid', start: 'top 80%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-32 bg-white"
    >
      {/* 装饰性背景 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{
            background: 'radial-gradient(circle, rgba(47, 93, 87, 0.2) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* 顶部:品牌金句 + 创始人独白(品牌起源故事) */}
        <div className="mx-auto max-w-3xl text-center mb-14 about-header">
          {/* 品牌金句 — 朱砂线 + 小字 */}
          <div className="inline-flex items-center gap-3 mb-7">
            <span className="h-px w-10 bg-[#C2473B]" />
            <span
              className="text-[12px] font-bold uppercase tracking-[0.28em] text-[#C2473B]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              一脉岐黄 · 四海安康
            </span>
            <span className="h-px w-10 bg-[#C2473B]" />
          </div>
        </div>

        {/* 创始人独白 / 品牌起源 — 200 字 */}
        <div className="mx-auto max-w-3xl mb-10 about-header">
          <div className="rounded-3xl border border-[#2F5D57]/15 bg-[#FAF8F3] p-8 md:p-12 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C2473B] mb-4">
              为什么做岐黄四海
            </div>
            <p className="text-lg md:text-xl leading-[1.95] text-[#1B2520] font-medium mb-5" style={{ fontFamily: 'var(--font-serif)' }}>
              我们看过一家中药老字号,把 800 万扔进日本市场,两年颗粒无收。
            </p>
            <p className="text-lg md:text-xl leading-[1.95] text-[#1B2520] font-medium mb-5" style={{ fontFamily: 'var(--font-serif)' }}>
              我们也陪过另一个老字号,7 天找到 32 家日本合伙人,3 家签 MOU,稳定出货 14 个月。
            </p>
            <p className="text-base leading-[1.9] text-[#3a4540]">
              差别不在资源,在路径。<br />
              这就是我们做岐黄四海的原因。<span className="text-[#C2473B]">让每一家想出海的中医药品牌,都拿到一份敢交给董事会的判断书。</span>
            </p>
          </div>
        </div>

        {/* 主理人说卡 — v2 PRD:独白下方的第一人称锚点 */}
        <div className="mx-auto max-w-3xl mb-20 about-header">
          <div className="relative rounded-2xl border border-[#C2473B]/25 bg-gradient-to-br from-white via-[#FAF8F3] to-[#F5F0E8] p-6 md:p-8 shadow-md">
            {/* 大引号装饰 */}
            <div
              className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-[#C2473B] text-white text-lg font-serif shadow-md"
              aria-hidden
            >
              「
            </div>

            <div className="flex items-start gap-4 md:gap-5">
              {/* 主理人头像占位(后期替换为实拍照片) */}
              <div className="shrink-0">
                <div
                  className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-[#2F5D57] via-[#1B2520] to-[#0a1612] flex items-center justify-center text-white text-xl md:text-2xl font-semibold shadow-md border-2 border-[#FAF8F3]"
                  aria-label="主理人头像占位"
                >
                  张
                </div>
                <div className="mt-1.5 text-center text-[9px] font-bold uppercase tracking-widest text-[#C2473B]">
                  主理人
                </div>
              </div>

              {/* 引言主体 */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-base md:text-lg leading-[1.85] text-[#1B2520] font-medium mb-3"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  我们做这件事,不是要给行业多一个选择,而是要让每一个想出海的中医药人,<span className="text-[#C2473B]">都敢迈出下一步。</span>
                </p>
                <div className="flex items-center gap-2 text-sm text-[#5b6661]">
                  <span className="h-px w-6 bg-[#2F5D57]/30" />
                  <span className="font-medium text-[#1B2520]">张小强</span>
                  <span className="text-[#C2473B]">·</span>
                  <span>岐黄四海 主理人</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 我们是谁 — 双栏 */}
        <div className="grid gap-12 lg:grid-cols-2 items-start mb-20">
          {/* 左侧:引言 */}
          <div className="about-header">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2F5D57]/20 bg-[#2F5D57]/5 px-4 py-2 text-sm text-[#2F5D57] mb-6">
              <Globe2 className="h-4 w-4" />
              <span className="font-medium">我们是谁</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.15] tracking-tight text-[#1B2520] mb-6">
              中医出海
              <span className="block text-[#2F5D57]">一站式服务 全程陪伴</span>
            </h2>

            <div className="relative pl-6 border-l-4 border-[#C2473B]">
              <Quote className="absolute -left-4 -top-2 h-6 w-6 text-[#C2473B]/20" />
              <p className="text-lg leading-[1.9] text-[#3a4540] italic">
                出海不是一句口号,是一份敢交给董事会的判断。
              </p>
            </div>

            <p className="mt-6 text-base leading-[1.9] text-[#5b6661]">
              岐黄四海专注于中医药、保健食品、汉方品牌的全球增长。
              我们用专属订制算法帮您精准找到:下游客户、上游供应商、投资金主和竞争对手,
              搭配资深顾问全程陪跑——让每一步都有据可依。
            </p>
          </div>

          {/* 右侧:核心价值观 */}
          <div className="about-content">
            <h3 className="text-xl font-semibold text-[#1B2520] mb-6 flex items-center gap-3">
              <Award className="h-5 w-5 text-[#C2473B]" />
              我们的核心价值观
            </h3>
            <div className="value-grid grid gap-4">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="value-card flex items-start gap-4 rounded-xl bg-[#FAF8F3] border border-[#2F5D57]/10 p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2F5D57]/10 text-[#2F5D57]">
                    {value.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1B2520] mb-1">{value.title}</h4>
                    <p className="text-sm text-[#5b6661]">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="divider my-16" />

        {/* 中间:为什么选我们 */}
        <div className="mb-20">
          <div className="text-center mb-12 about-header">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#1B2520] mb-4">
              为什么选我们
            </h2>
            <p className="text-base text-[#5b6661] max-w-2xl mx-auto">
              不是咨询公司,也不是工具栈——我们是陪跑伙伴。算法发现机会,顾问陪跑落地。
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 about-content">
            {[
              {
                title: '专属订制算法',
                desc: '不是通用报告,而是根据您的产品、市场和资源,定制化发现四大关键资源。',
                highlight: '精准匹配,不是泛泛建议',
              },
              {
                title: '资深顾问陪跑',
                desc: '不是给一份报告就走,而是从诊断到落地,每一步都有真人顾问指导。',
                highlight: '全程陪伴,不是一锤子买卖',
              },
              {
                title: '35 国法规框架',
                desc: '覆盖日本、欧盟、东南亚、中东等主要出海目的地的法规框架,确保合规进入。',
                highlight: '合规为本,不是冒险突进',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[#2F5D57]/15 bg-[#FAF8F3] p-6 text-center hover:border-[#C2473B]/30 hover:shadow-md transition-all duration-300"
              >
                <h4 className="text-lg font-semibold text-[#1B2520] mb-2">{item.title}</h4>
                <p className="text-sm text-[#5b6661] mb-4">{item.desc}</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#C2473B]/10 px-3 py-1.5 text-xs font-medium text-[#C2473B]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {item.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA 三层分级 */}
        <div className="mt-16 text-center about-header">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <Link
              to="/diagnose"
              className="inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.25)] transition-all hover:-translate-y-0.5"
            >
              <Users className="h-5 w-5" />
              开始 7 天陪跑
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/expert"
              className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-4 text-base font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white hover:-translate-y-0.5"
            >
              <Globe2 className="h-5 w-5" />
              看 32 个真实陪跑档案
            </Link>
            {/* Tertiary — 订阅《出海判断周报》 */}
            <Link
              to="/research"
              className="group inline-flex items-center gap-2 rounded-xl border border-[#2F5D57]/20 bg-white/60 px-4 py-3 text-sm font-medium text-[#2F5D57] transition-all hover:bg-white hover:border-[#C2473B]/40 hover:text-[#C2473B]"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C2473B] group-hover:animate-pulse" />
              订阅《出海判断周报》
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
