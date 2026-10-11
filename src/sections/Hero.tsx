/**
 * Home Hero Section — 「稳稳」叙事版（C 方案）
 *
 * 围绕新主 slogan ——「让本草品牌稳稳走向世界」重构：
 * - 主标：让本草品牌 / 稳稳走向世界（双行，「稳稳」朱砂加重）
 * - 「本草」注解：出口两千年 —— 中药、保健食品、汉方护肤的共同根
 * - 副标：算法指方向 · 数据打底 · 真人陪你出海（三大支柱锚点）
 * - 顶部 tag：让本草品牌 稳稳走向世界
 * - 视觉中心：羊驼吉祥物「小驼」，围绕 4 个陪跑节点
 * - 配色：暖米色主调（#F7EFE0），朱砂 + 墨青点缀
 * - CTA 三层：主菜「让小驼陪我稳稳走第一步」/ 沙拉「看我们的方法论」/ 点心「订阅《出海判断周报》》
 * - 「稳稳」叙事暗线：算法给稳的方向，数据给稳的判断，陪跑给稳的落地
 */

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  ArrowRight,
  Compass,
  Heart,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { tracking } from '../lib/tracking';
import { InteractiveAvatar } from '@/components/InteractiveAvatar';

const Hero = () => {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);

  // 陪跑节点 — 围绕「稳稳出海」的 4 个关键节点（i18n: hero3.nodes）
  const accompanyNodes = [
    {
      key: 'judge',
      icon: <Compass className="h-3.5 w-3.5" />,
      color: 'bg-[#C2473B]',
    },
    {
      key: 'ally',
      icon: <Heart className="h-3.5 w-3.5" />,
      color: 'bg-[#D9A66B]',
    },
    {
      key: 'negotiate',
      icon: <MessageCircle className="h-3.5 w-3.5" />,
      color: 'bg-[#2F5D57]',
    },
    {
      key: 'ship',
      icon: <Sparkles className="h-3.5 w-3.5" />,
      color: 'bg-[#7B9E8A]',
    },
  ] as const;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 文案主体渐入
      gsap.fromTo(
        '.hero-fade',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.07,
          ease: 'power3.out',
          delay: 0.1,
        }
      );

      // 羊驼居中浮入
      gsap.fromTo(
        '.hero-alpaca',
        { opacity: 0, scale: 0.85, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          delay: 0.35,
        }
      );

      // 陪跑节点依次浮入
      gsap.fromTo(
        '.accompany-node',
        { opacity: 0, scale: 0.6, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.14,
          ease: 'back.out(1.4)',
          delay: 0.85,
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, #FFF8EC 0%, #F7EFE0 55%, #F0E5D0 100%)',
      }}
    >
      {/* 装饰背景 — 暖纸纹理 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 12%, rgba(217, 166, 107, 0.18), transparent 45%), radial-gradient(circle at 82% 88%, rgba(194, 71, 59, 0.10), transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(75, 53, 42, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(75, 53, 42, 0.4) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-12 pb-10 md:pt-16 md:pb-14">
        <div className="mx-auto max-w-[1440px]">
          {/* ========== 上：左右两栏(文案 + 羊驼视觉中心) ========== */}
          <div className="grid gap-10 lg:gap-12 lg:grid-cols-2 items-center">
            {/* ============ 左：文案主轴 ============ */}
            <div>
              {/* 顶部 tag — 新主 Slogan + 三大支柱暗线 */}
              <div className="hero-fade inline-flex items-center gap-2.5 rounded-full border border-[#C2473B]/30 bg-white px-4 py-2 text-sm text-[#C2473B] shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C2473B] opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C2473B]" />
                </span>
                <Heart className="h-3.5 w-3.5 fill-[#C2473B]" />
                <span className="font-medium">{t('hero3.topTag')}</span>
              </div>

              {/* 主标 — 新 Slogan「让本草品牌 稳稳走向世界」 */}
              <h1
                className="hero-fade mt-6 font-semibold leading-[1.1] tracking-tight text-[#2A1F18]"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.4rem, 4.6vw, 4.2rem)',
                }}
              >
                <span className="block">{t('hero3.titleLine1')}</span>
                <span className="block mt-2">
                  <span className="text-[#C2473B]">{t('hero3.titleAccent')}</span>
                  {' '}{t('hero3.titleLine2')}
                </span>
              </h1>

              {/* 「本草」注解 — 替代原「岐黄」注解，把品牌根脉绑到「本草」品类 */}
              <p
                className="hero-fade mt-4 max-w-xl text-sm leading-relaxed text-[#5A4A3C] italic"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {t('hero3.bencaoNote')}
              </p>

              {/* 三大支柱副标 — 算法指方向 · 数据打底 · 真人陪你出海 */}
              <p className="hero-fade mt-5 max-w-xl text-base md:text-lg leading-[1.85] text-[#5A4A3C]">
                <span className="text-[#2A1F18] font-medium">
                  {t('hero3.subtitleLead')}
                </span>
                <br />
                <span className="text-[#C2473B]">{t('hero3.alpacaName')}</span>
                {t('hero3.subtitleDetail')}
              </p>

              {/* CTA 三层分级 — 主菜 / 沙拉 / 点心 */}
              <div className="hero-fade mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/diagnose"
                  onClick={() => tracking.click('hero_start_accompany', 'cta')}
                  className="group inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.35)] transition-all hover:-translate-y-0.5"
                >
                  <Heart className="h-5 w-5 fill-white" />
                  {t('hero3.ctaPrimary')}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/method"
                  onClick={() => tracking.click('hero_view_methodology', 'cta')}
                  className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-4 text-base font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white hover:-translate-y-0.5"
                >
                  <Sparkles className="h-5 w-5" />
                  {t('hero3.ctaMethod')}
                </Link>

                <Link
                  to="/research"
                  onClick={() => tracking.click('hero_subscribe_weekly', 'cta')}
                  className="group inline-flex items-center gap-2 rounded-xl border border-[#2F5D57]/20 bg-white px-4 py-3 text-sm font-medium text-[#2F5D57] transition-all hover:bg-[#F7EFE0] hover:border-[#C2473B]/40 hover:text-[#C2473B]"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C2473B] group-hover:animate-pulse" />
                  {t('hero3.ctaSubscribe')}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* 信任锚点 — 「稳稳」的具象化表达 */}
              <div className="hero-fade mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#5A4A3C]">
                {(t('hero3.trustItems', { returnObjects: true }) as string[]).map((item) => (
                  <div key={item} className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C2473B]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ============ 右：羊驼吉祥物 + 节点网格 ============ */}
            <div className="hero-fade flex justify-center">
              <div className="relative w-full max-w-[520px]">
                {/* 中心大圆背景 — 暖纸色 */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 40%, #FFFCF5 0%, #F7EFE0 60%, #E8DCC4 100%)',
                    boxShadow:
                      '0 30px 80px -30px rgba(75, 53, 42, 0.25), inset 0 0 0 1px rgba(217, 166, 107, 0.15)',
                  }}
                />

                {/* 羊驼吉祥物 — 居中 */}
                <div className="hero-alpaca relative z-20 flex justify-center py-10">
                  <div
                    className="relative rounded-full bg-gradient-to-br from-[#FFF8EC] via-[#F7EFE0] to-[#E8DCC4] border-[3px] border-[#C2473B] shadow-[0_30px_60px_-15px_rgba(194,71,59,0.4)] overflow-hidden transition-all duration-500 cursor-pointer group"
                    style={{
                      width: 'clamp(220px, 30vw, 300px)',
                      height: 'clamp(220px, 30vw, 300px)',
                    }}
                    aria-label={t('hero3.alpacaName')}
                    role="img"
                  >
                    {/* 朱砂呼吸环 */}
                    <span
                      className="absolute inset-0 rounded-full ring-2 ring-[#C2473B]/40 animate-ink-pulse pointer-events-none"
                      aria-hidden
                    />
                    {/* 羊驼 canvas */}
                    <InteractiveAvatar compact loadingBg="#F7EFE0" />

                    {/* 左上 LIVE 小圆点 */}
                    <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-[#2A1F18]/85 px-2 py-1 backdrop-blur-sm z-10">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C2473B] animate-pulse" />
                      <span className="text-[9px] font-bold tracking-wider text-white">{t('hero3.liveBadge')}</span>
                    </div>

                    {/* 右下朱砂小角标 */}
                    <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[#C2473B] border-[3px] border-[#F7EFE0] shadow-md z-10" />
                  </div>
                </div>

                {/* 羊驼身份单行标签 — 放在 avatar 与节点之间 */}
                <div className="relative z-20 text-center px-4 pb-6 -mt-2">
                  <div
                    className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C2473B]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {t('hero3.alpacaName')} · {t('hero3.alpacaFooter')}
                  </div>
                  <div className="text-[9px] text-[#5A4A3C] mt-0.5">
                    {t('hero3.alpacaSubline')}
                  </div>
                </div>

                {/* 4 个陪跑节点 — 2×2 网格（或 md: 1×4 行） */}
                <div className="relative z-20 grid grid-cols-2 gap-3 px-4 pb-8 max-w-md mx-auto">
                  {accompanyNodes.map((node) => (
                    <div
                      key={node.key}
                      className="accompany-node rounded-xl bg-white border border-[#C2473B]/15 p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-[#C2473B]/30"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${node.color}`}
                        >
                          {node.icon}
                        </span>
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C2473B] leading-tight"
                          style={{ fontFamily: 'var(--font-serif)' }}
                        >
                          {t(`hero3.nodes.${node.key}.label`)}
                        </span>
                      </div>
                      <div
                        className="text-[11px] text-[#2A1F18] leading-snug"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {t(`hero3.nodes.${node.key}.desc`)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
