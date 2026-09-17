/**
 * Home Hero Section — 算法世界观 + 陪跑者版（B 方案）
 *
 * 设计要点：
 * - 主标：算法即世界 / 岐黄出四海（双行）
 * - 「岐黄」注解：取自岐伯、黄帝 —— 中医药的两千年源头
 * - 副标：算法给你方向，真人陪你落地（算法 + 陪跑双锚）
 * - 顶部 tag：算法即世界 · 我们陪你落地
 * - 视觉中心：羊驼吉祥物（240px+），周围散落「陪跑节点」对话气泡
 * - 配色：暖米色主调（#F7EFE0），朱砂 + 墨青点缀
 * - CTA 三层：主菜「让小驼陪我走第一步」/ 沙拉「看我们的方法论」/ 点心「订阅《算法出海周报》」
 * - 算法视角金句暗线：在每处文案开篇体现「算法即世界」的世界观
 */

import { useEffect, useRef } from 'react';
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

// 陪跑节点 — 从「算法漏斗」升级为「陪跑路上的对话」
const accompanyNodes = [
  {
    key: 'a',
    icon: <Compass className="h-3.5 w-3.5" />,
    label: '出发前',
    desc: '小驼陪你判断要不要走',
    color: 'bg-[#C2473B]',
    position: 'top-0 left-0',
  },
  {
    key: 'b',
    icon: <Heart className="h-3.5 w-3.5" />,
    label: '找同行',
    desc: '小驼陪你找第一批队友',
    color: 'bg-[#D9A66B]',
    position: 'top-8 right-0',
  },
  {
    key: 'c',
    icon: <MessageCircle className="h-3.5 w-3.5" />,
    label: '走到底',
    desc: '小驼陪你签约、落地',
    color: 'bg-[#2F5D57]',
    position: 'bottom-8 left-0',
  },
  {
    key: 'd',
    icon: <Sparkles className="h-3.5 w-3.5" />,
    label: '送一程',
    desc: '小驼送你稳定出货',
    color: 'bg-[#7B9E8A]',
    position: 'bottom-0 right-0',
  },
];

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

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
              {/* 顶部 tag — 算法世界观 + 陪跑 */}
              <div className="hero-fade inline-flex items-center gap-2.5 rounded-full border border-[#C2473B]/30 bg-white px-4 py-2 text-sm text-[#C2473B] shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C2473B] opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C2473B]" />
                </span>
                <Heart className="h-3.5 w-3.5 fill-[#C2473B]" />
                <span className="font-medium">算法即世界 · 我们陪你落地</span>
              </div>

              {/* 主标 — 「算法即世界 岐黄出四海」 */}
              <h1
                className="hero-fade mt-6 font-semibold leading-[1.1] tracking-tight text-[#2A1F18]"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.4rem, 4.6vw, 4.2rem)',
                }}
              >
                <span className="block">算法即世界</span>
                <span className="block mt-2">
                  岐黄<span className="text-[#C2473B]">出四海</span>
                </span>
              </h1>

              {/* 「岐黄」注解 — serif 小字,品牌历史锚点 */}
              <p
                className="hero-fade mt-4 max-w-xl text-sm leading-relaxed text-[#5A4A3C] italic"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                「岐黄」二字取自岐伯、黄帝 —— 中医药的两千年源头
              </p>

              {/* 算法 + 陪跑 双锚副标 */}
              <p className="hero-fade mt-5 max-w-xl text-base md:text-lg leading-[1.85] text-[#5A4A3C]">
                <span className="text-[#2A1F18] font-medium">
                  算法告诉你这条路该不该走，我们陪你走到能签
                </span>
                <br />
                <span className="text-[#C2473B]">小驼</span>扫尽 10,000+ 候选,
                真人顾问陪你拆判断、跑合规、坐到第一张谈判桌前 —— <span className="text-[#2A1F18]">算法给你方向,真人陪你落地。</span>
              </p>

              {/* CTA 三层分级 — 主菜 / 沙拉 / 点心 */}
              <div className="hero-fade mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/diagnose"
                  onClick={() => tracking.click('hero_start_accompany', 'cta')}
                  className="group inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.35)] transition-all hover:-translate-y-0.5"
                >
                  <Heart className="h-5 w-5 fill-white" />
                  让小驼陪我走第一步
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/method"
                  onClick={() => tracking.click('hero_view_methodology', 'cta')}
                  className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#2F5D57] bg-white px-7 py-4 text-base font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57] hover:text-white hover:-translate-y-0.5"
                >
                  <Sparkles className="h-5 w-5" />
                  看我们的方法论
                </Link>

                <Link
                  to="/research"
                  onClick={() => tracking.click('hero_subscribe_weekly', 'cta')}
                  className="group inline-flex items-center gap-2 rounded-xl border border-[#2F5D57]/20 bg-white px-4 py-3 text-sm font-medium text-[#2F5D57] transition-all hover:bg-[#F7EFE0] hover:border-[#C2473B]/40 hover:text-[#C2473B]"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C2473B] group-hover:animate-pulse" />
                  订阅《算法出海周报》
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* 信任锚点 — 算法 + 陪跑 双线 */}
              <div className="hero-fade mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#5A4A3C]">
                {[
                  '算法先看 · 真人陪跑',
                  '7 天走到 3 张敢签的判断书',
                  '35 国监管框架',
                  '签约后继续陪你 14 个月',
                ].map((item) => (
                  <div key={item} className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C2473B]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ============ 右：羊驼吉祥物 — 视觉中心 ============ */}
            <div className="hero-fade relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[480px] aspect-square">
                {/* 中心大圆背景 — 暖纸色 */}
                <div
                  className="absolute inset-8 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 40%, #FFFCF5 0%, #F7EFE0 60%, #E8DCC4 100%)',
                    boxShadow:
                      '0 30px 80px -30px rgba(75, 53, 42, 0.25), inset 0 0 0 1px rgba(217, 166, 107, 0.15)',
                  }}
                />

                {/* 羊驼吉祥物 — 居中，最大尺寸 */}
                <div className="hero-alpaca absolute inset-0 flex items-center justify-center z-20">
                  <div
                    className="relative rounded-full bg-gradient-to-br from-[#FFF8EC] via-[#F7EFE0] to-[#E8DCC4] border-[3px] border-[#C2473B] shadow-[0_30px_60px_-15px_rgba(194,71,59,0.4)] overflow-hidden transition-all duration-500 cursor-pointer group"
                    style={{
                      width: 'clamp(220px, 28vw, 320px)',
                      height: 'clamp(220px, 28vw, 320px)',
                    }}
                    aria-label="小驼 — 你的出海陪跑伙伴"
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
                      <span className="text-[9px] font-bold tracking-wider text-white">陪跑中</span>
                    </div>

                    {/* 右下朱砂小角标 */}
                    <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[#C2473B] border-[3px] border-[#F7EFE0] shadow-md z-10" />
                  </div>
                </div>

                {/* 4 个陪跑节点 — 围绕羊驼呈环形 */}
                {accompanyNodes.map((node, i) => {
                  // 用 transform 精确放置 4 个节点在圆周上
                  const positions = [
                    { top: '8%', left: '10%' },
                    { top: '8%', right: '10%' },
                    { bottom: '8%', left: '10%' },
                    { bottom: '8%', right: '10%' },
                  ];
                  const pos = positions[i];
                  return (
                    <div
                      key={node.key}
                      className="accompany-node absolute z-30 group"
                      style={pos}
                    >
                      {/* 连接虚线（指向中心） */}
                      <div
                        className="absolute hidden lg:block"
                        style={{
                          width: '60px',
                          height: '60px',
                          top: '50%',
                          left: '50%',
                          transform: `translate(-50%, -50%) rotate(${45 + i * 90}deg)`,
                        }}
                        aria-hidden
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              'radial-gradient(circle, transparent 49%, rgba(194,71,59,0.25) 50%, transparent 51%)',
                          }}
                        />
                      </div>

                      {/* 节点卡片 */}
                      <div className="relative rounded-2xl bg-white border border-[#C2473B]/20 px-3.5 py-3 shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5 hover:border-[#C2473B]/40">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${node.color}`}
                          >
                            {node.icon}
                          </span>
                          <span
                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C2473B]"
                            style={{ fontFamily: 'var(--font-serif)' }}
                          >
                            {node.label}
                          </span>
                        </div>
                        <div
                          className="text-xs text-[#2A1F18] leading-snug whitespace-nowrap"
                          style={{ fontFamily: 'var(--font-serif)' }}
                        >
                          {node.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 中心底部小标签 — 羊驼身份（算法 + 陪跑 双锚） */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 text-center">
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#C2473B]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    小驼 · 用算法替你扫世界，用陪跑替你走世界
                  </div>
                  <div className="text-[9px] text-[#5A4A3C] mt-0.5">
                    24h 在线 · 点击看方法论
                  </div>
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
