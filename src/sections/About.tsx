/**
 * About Section — 「稳稳」叙事版（C 方案）
 *
 * 核心叙事：
 * - 主金句：「让本草品牌,稳稳走向世界」（与 Hero 同句，1+1=记忆加深）
 * - 创始人独白改为「稳」视角 —— 出海不是赶路，是稳着走
 * - 「数据底座」小段：把"算法即世界"的世界观替换为"35 国数据底座"的实在锚点
 * - 「主理人说」+ 「小驼同事」情感锚点保留，并升级为「稳稳陪跑」
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Award,
  Globe2,
  Heart,
  Lightbulb,
  Quote,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);

  // 核心价值观图标 — 围绕「稳稳陪跑」的 4 条承诺（标题/描述用 t()）
  const valueIcons = [
    <Heart key="h" className="h-5 w-5 fill-[#C2473B] text-[#C2473B]" />,
    <Users key="u" className="h-5 w-5" />,
    <Lightbulb key="l" className="h-5 w-5" />,
    <Shield key="s" className="h-5 w-5" />,
  ];

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

  const values = t('about2.values', { returnObjects: true }) as Array<{ title: string; desc: string }>;
  const whyUsCards = t('about2.whyUsCards', { returnObjects: true }) as Array<{ title: string; desc: string; highlight: string }>;

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-32"
      style={{
        background:
          'linear-gradient(180deg, #FFFFFF 0%, #FAF6EC 50%, #FFFFFF 100%)',
      }}
    >
      {/* 装饰性背景 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, #C2473B 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, #D9A66B 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* 顶部：品牌金句 — 新主 Slogan 第 5 次露出 */}
        <div className="mx-auto max-w-3xl text-center mb-10 about-header">
          <div className="inline-flex items-center gap-3 mb-7">
            <span className="h-px w-10 bg-[#C2473B]" />
            <span
              className="text-[12px] font-bold uppercase tracking-[0.28em] text-[#C2473B]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('about2.taglinePill')}
            </span>
            <span className="h-px w-10 bg-[#C2473B]" />
          </div>
        </div>

        {/* 数据底座小段 — 替代原"算法即世界"哲理段,把"算法 + 数据 + 陪跑"实化到"35 国数据底座" */}
        <div className="mx-auto max-w-3xl mb-8 about-header">
          <div
            className="rounded-2xl border-l-4 border-[#2F5D57] bg-white px-6 py-5 shadow-sm"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#2F5D57] mb-2 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              {t('about2.dataPill')}
            </div>
            <p
              className="text-base md:text-[17px] leading-[1.85] text-[#2A1F18]"
              dangerouslySetInnerHTML={{ __html: t('about2.dataParagraph') }}
            />
          </div>
        </div>

        {/* 创始人独白 — 「稳稳」视角改写 */}
        <div className="mx-auto max-w-3xl mb-10 about-header">
          <div
            className="rounded-3xl border border-[#C2473B]/15 p-8 md:p-12 shadow-sm"
            style={{
              background:
                'linear-gradient(135deg, #FFFCF5 0%, #F7EFE0 60%, #FAF6EC 100%)',
            }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C2473B] mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('about2.whyStableTitle')}
            </div>
            <p
              className="text-lg md:text-xl leading-[1.95] text-[#2A1F18] font-medium mb-5"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('about2.whyStableP1')}
            </p>
            <p
              className="text-lg md:text-xl leading-[1.95] text-[#2A1F18] font-medium mb-5"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('about2.whyStableP2')}
            </p>
            <p
              className="text-lg md:text-xl leading-[1.95] text-[#2A1F18] font-medium mb-5"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('about2.whyStableP3')}
            </p>
            <p className="text-base leading-[1.9] text-[#5A4A3C]">
              <span className="text-[#C2473B]">{t('about2.whyStableP4')}</span>
              <br />
              {t('about2.whyStableP5')}
            </p>
          </div>
        </div>

        {/* 主理人说卡 — 改为「稳稳陪跑」主题 */}
        <div className="mx-auto max-w-3xl mb-20 about-header">
          <div className="grid gap-4 md:gap-5 md:grid-cols-[1fr_1fr]">
            {/* 主理人说 */}
            <div className="relative rounded-2xl border border-[#C2473B]/25 bg-gradient-to-br from-white via-[#FAF6EC] to-[#F7EFE0] p-6 md:p-8 shadow-md">
              <div
                className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-[#C2473B] text-white text-lg font-serif shadow-md"
                aria-hidden
              >
                「
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-[#C2473B] via-[#A93B30] to-[#7A2A20] flex items-center justify-center text-white text-xl md:text-2xl font-semibold shadow-md border-2 border-[#FAF6EC]">
                    张
                  </div>
                  <div className="mt-1.5 text-center text-[9px] font-bold uppercase tracking-widest text-[#C2473B]">
                    {t('about2.founderRole')}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-base md:text-lg leading-[1.85] text-[#2A1F18] font-medium mb-3"
                    style={{ fontFamily: 'var(--font-serif)' }}
                    dangerouslySetInnerHTML={{ __html: t('about2.founderQuote') }}
                  />
                  <div className="flex items-center gap-2 text-sm text-[#5A4A3C]">
                    <span className="h-px w-6 bg-[#C2473B]/30" />
                    <span className="font-medium text-[#2A1F18]">{t('about2.founderName')}</span>
                    <span className="text-[#C2473B]">·</span>
                    <span>{t('about2.founderTitle')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 小驼说 — 算法 + 数据 + 陪跑 三锚合一的"队友" */}
            <div className="relative rounded-2xl border border-[#D9A66B]/30 bg-gradient-to-br from-[#FFFCF5] via-[#FAF6EC] to-[#F7EFE0] p-6 md:p-8 shadow-md">
              <div
                className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-[#D9A66B] text-white text-lg shadow-md"
                aria-hidden
              >
                🦙
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-[#F7EFE0] via-[#E8DCC4] to-[#D9A66B] flex items-center justify-center text-2xl shadow-md border-2 border-[#FAF6EC]">
                    🦙
                  </div>
                  <div className="mt-1.5 text-center text-[9px] font-bold uppercase tracking-widest text-[#D9A66B]">
                    {t('about2.teammateRole')}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-base md:text-lg leading-[1.85] text-[#2A1F18] font-medium mb-3"
                    style={{ fontFamily: 'var(--font-serif)' }}
                    dangerouslySetInnerHTML={{ __html: t('about2.teammoteQuote') }}
                  />
                  <div className="flex items-center gap-2 text-sm text-[#5A4A3C]">
                    <span className="h-px w-6 bg-[#D9A66B]/40" />
                    <span className="font-medium text-[#2A1F18]">{t('about2.teammateName')}</span>
                    <span className="text-[#D9A66B]">·</span>
                    <span>{t('about2.teammateTitle')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 我们是谁 — 双栏 */}
        <div className="grid gap-12 lg:grid-cols-2 items-start mb-20">
          {/* 左侧：引言 */}
          <div className="about-header">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C2473B]/30 bg-white px-4 py-2 text-sm text-[#C2473B] mb-6 shadow-sm">
              <Heart className="h-4 w-4 fill-[#C2473B]" />
              <span className="font-medium">{t('about2.whoBadge')}</span>
            </div>

            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.15] tracking-tight text-[#2A1F18] mb-6"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('about2.whoTitle1')}
              <span className="block text-[#C2473B]">{t('about2.whoTitle2')}</span>
            </h2>

            <div className="relative pl-6 border-l-4 border-[#C2473B]">
              <Quote className="absolute -left-4 -top-2 h-6 w-6 text-[#C2473B]/20" />
              <p className="text-lg leading-[1.9] text-[#5A4A3C] italic">
                {t('about2.whoQuote')}
              </p>
            </div>

            <p className="mt-6 text-base leading-[1.9] text-[#5A4A3C]">
              {t('about2.whoDesc')}
            </p>
          </div>

          {/* 右侧：核心价值观 */}
          <div className="about-content">
            <h3 className="text-xl font-semibold text-[#2A1F18] mb-6 flex items-center gap-3">
              <Award className="h-5 w-5 text-[#C2473B]" />
              {t('about2.promiseTitle')}
            </h3>
            <div className="value-grid grid gap-4">
              {values.map((value, idx) => (
                <div
                  key={value.title}
                  className="value-card flex items-start gap-4 rounded-xl bg-white border border-[#C2473B]/12 p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#C2473B]/10 text-[#C2473B]">
                    {valueIcons[idx] || <Globe2 className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4
                      className="font-semibold text-[#2A1F18] mb-1"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {value.title}
                    </h4>
                    <p className="text-sm text-[#5A4A3C]">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="divider my-16" />

        {/* 中间：为什么选我们 */}
        <div className="mb-20">
          <div className="text-center mb-12 about-header">
            <h2
              className="text-3xl md:text-4xl font-semibold text-[#2A1F18] mb-4"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('about2.whyUsTitle')}
            </h2>
            <p className="text-base text-[#5A4A3C] max-w-2xl mx-auto">
              {t('about2.whyUsLead')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 about-content">
            {whyUsCards.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[#C2473B]/15 bg-white p-6 text-center hover:border-[#C2473B]/30 hover:shadow-md transition-all duration-300"
              >
                <h4
                  className="text-lg font-semibold text-[#2A1F18] mb-2"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {item.title}
                </h4>
                <p className="text-sm text-[#5A4A3C] mb-4">{item.desc}</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#C2473B]/10 px-3 py-1.5 text-xs font-medium text-[#C2473B]">
                  <Heart className="h-3.5 w-3.5 fill-[#C2473B]" />
                  {item.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA 三层分级 */}
        <div className="mt-16 text-center about-header">
          <p className="text-base text-[#5A4A3C] mb-6">
            {t('about2.ctaAsk')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
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
        </div>
      </div>
    </section>
  );
};

export default About;
