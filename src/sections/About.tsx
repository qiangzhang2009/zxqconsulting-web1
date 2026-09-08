/**
 * About / 陪跑路径 — 东方出版社版
 *
 * 灵感: 一本关于中医药出海的决策手册 · 纸张质感 + 墨青朱砂
 * 感觉: 翻开一本Prestigious Chinese Medical Publisher的目录页
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, BookOpen, Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// 陪跑四阶段 — 中文数字
const phases = [
  {
    numeral: '壹',
    title: '看清现状',
    desc: '30分钟深度对话，摸清你的产品、团队与预算承受度 — 不上来就卖报告。',
  },
  {
    numeral: '贰',
    title: 'AI 拆解排序',
    desc: '35国法规框架的AI引擎，把你的产品对应到目标市场优先级，3分钟出结果。',
  },
  {
    numeral: '叁',
    title: '顾问复盘',
    desc: '针对最有价值的1-2个市场做60-90分钟远程复盘，确认/调整/否定你的方向。',
  },
  {
    numeral: '肆',
    title: '陪你启动',
    desc: '立项后再谈陪跑：准入文档、代理对接、分销谈判，直到首单落地。',
  },
];

// 大字引言
const pullQuote =
  '"出海"不是一句口号，是一份敢交给董事会的判断 — 而不是一份落灰的PPT。';

const About = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const phasesRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 标题区淡入
      gsap.fromTo(
        headerRef.current?.children || [],
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 80%' },
        }
      );

      // 阶段卡片依次浮入
      gsap.fromTo(
        phasesRef.current?.children || [],
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: phasesRef.current, start: 'top 78%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="section-about relative overflow-hidden py-24 md:py-32"
    >
      {/* 纸纹装饰背景 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 15% 90%, rgba(47, 93, 87, 0.06), transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 85% 10%, rgba(194, 71, 59, 0.04), transparent 45%)',
          }}
        />
      </div>

      <div className="relative z-10 container-pub">
        {/* ── 卷首语·头部 ── */}
        <div ref={headerRef} className="max-w-2xl mb-16">
          {/* 章节标记 */}
          <div className="volume-mark mb-6">
            卷首语 · 壹
          </div>

          {/* 大标题 */}
          <h2 className="text-[2rem] md:text-[2.75rem] font-semibold leading-[1.2] tracking-tight text-[#1B2520] mb-6">
            不是咨询公司，
            <br />
            <span className="text-gradient-primary">也不是工具栈</span>
            <br />
            — 是陪跑的伙伴
          </h2>

          {/* 正文 */}
          <p className="text-base leading-[1.9] text-[#3a4540] mb-5">
            我们做的，是把"出海"从一句口号变回可拍板的判断。
            AI把信息筛掉80%，真人顾问把最后20%的不确定变成一句话：
            这条路走不走、什么时候走、怎么走。
          </p>

          {/* 证据项 */}
          <ul className="space-y-3 mb-8">
            {[
              '过去12年，陪120+家中医药企业做过立项/出海/复盘',
              '35国法规框架已入库，且每周由顾问更新',
              '复杂项目会被我们直接劝退 — 不浪费你的钱',
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm leading-relaxed text-[#3a4540]"
              >
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C2473B] shrink-0"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/cases"
              className="btn btn-outline btn-sm"
            >
              看我们做过的判断
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/expert"
              className="btn btn-ghost btn-sm text-[#5b6661]"
            >
              与顾问直接对话
            </Link>
          </div>
        </div>

        {/* ── 引言区块 ── */}
        <div className="max-w-3xl mb-20 pl-4 border-l-0">
          <div className="relative">
            <Quote className="absolute -left-1 -top-2 h-8 w-8 text-[#C2473B]/20" aria-hidden />
            <p className="pull-quote pl-8">{pullQuote}</p>
          </div>
        </div>

        {/* ── 陪跑路径·目录感 ── */}
        <div>
          {/* 目录标题 */}
          <div className="flex items-baseline gap-4 mb-10">
            <span className="volume-mark">陪跑路径</span>
            <div className="flex-1 h-px bg-[#2F5D57]/12" />
            <BookOpen className="h-4 w-4 text-[#2F5D57]/40 shrink-0" />
          </div>

          {/* 四阶段卡片 */}
          <div
            ref={phasesRef}
            className="grid gap-5 sm:grid-cols-2"
          >
            {phases.map((phase) => (
              <article
                key={phase.numeral}
                className="pub-card card-seal relative p-7 pl-9 hover:shadow-md transition-shadow duration-300"
              >
                {/* 朱砂点墨装饰 */}
                <span
                  className="absolute right-5 top-5 w-1.5 h-1.5 rounded-full bg-[#C2473B]/40"
                  aria-hidden
                />

                {/* 阶段编号（中文数字） */}
                <div className="absolute left-0 top-7 bottom-7 w-px bg-gradient-to-b from-[#C2473B] via-[#C2473B]/60 to-transparent rounded-full" />

                <div className="flex items-start gap-5">
                  {/* 中文数字圆形徽章 */}
                  <div
                    className="shrink-0 w-14 h-14 rounded-full border border-[#2F5D57]/20 bg-[#2F5D57]/5 flex items-center justify-center"
                    aria-hidden
                  >
                    <span className="font-serif text-2xl font-semibold text-[#2F5D57]/80">
                      {phase.numeral}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-xl font-semibold text-[#1B2520] leading-snug mb-2">
                      {phase.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#5b6661]">
                      {phase.desc}
                    </p>
                  </div>
                </div>

                {/* 底部小墨点 */}
                <div className="absolute bottom-4 right-4 flex gap-1.5">
                  <span className="dot-ink opacity-30" aria-hidden />
                  <span className="dot-ink opacity-20" aria-hidden />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
