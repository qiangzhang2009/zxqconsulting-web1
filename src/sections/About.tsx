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
        {/* 顶部:我们是谁 */}
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
                className="rounded-xl border border-[#2F5D57]/15 bg-[#FAF8F3] p-6 text-center"
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

        {/* CTA */}
        <div className="mt-16 text-center about-header">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/diagnose"
              className="inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.25)] transition-all hover:-translate-y-0.5"
            >
              <Users className="h-5 w-5" />
              开始智能诊断
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/expert"
              className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-4 text-base font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white hover:-translate-y-0.5"
            >
              <Globe2 className="h-5 w-5" />
              预约顾问咨询
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
