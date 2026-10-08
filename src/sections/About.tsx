/**
 * About Section — 「稳稳」叙事版（C 方案）
 *
 * 核心叙事：
 * - 主金句：「让本草品牌，稳稳走向世界」（与 Hero 同句，1+1=记忆加深）
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
  CheckCircle2,
  Globe2,
  Heart,
  Lightbulb,
  Quote,
  Shield,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// 核心价值观 — 围绕「稳稳陪跑」的 4 条承诺
const values: ValueItem[] = [
  {
    icon: <Heart className="h-5 w-5 fill-[#C2473B] text-[#C2473B]" />,
    title: '陪你把方向看稳',
    desc: '不催你立项,也不催你放弃 —— 35 国数据先替你看清每一步的代价',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: '陪你走到能签',
    desc: '从第一次见面到 MOU,我们陪在旁边 —— 不是发完报告就走',
  },
  {
    icon: <Lightbulb className="h-5 w-5" />,
    title: '算法 + 数据 + 顾问',
    desc: '小驼扫方向,数据打底,真人顾问做判断 —— 我们陪的是你,不是 AI',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: '签约后还陪你',
    desc: '出问题的夜里第一个打电话的,是我们 —— 不是机器人',
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
              让本草品牌 · 稳稳走向世界
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
              35 国数据底座 · 让每一个判断都站得住
            </div>
            <p className="text-base md:text-[17px] leading-[1.85] text-[#2A1F18]">
              出海最贵的不是钱,是<span className="text-[#C2473B]">走错那一次</span>。我们不打算让你凭经验拍脑袋 —— 我们把 35 国监管框架、上万个候选、近百个真实案例,做成你能摸得到的数据底座;再让<span className="text-[#2A1F18] font-medium">算法指方向</span>、<span className="text-[#2A1F18] font-medium">数据打底</span>、<span className="text-[#2A1F18] font-medium">真人陪你出海</span> —— 让你的每一步都稳稳的。
            </p>
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
              为什么是「稳」,而不是「快」
            </div>
            <p
              className="text-lg md:text-xl leading-[1.95] text-[#2A1F18] font-medium mb-5"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              出海不是赶路,是稳着走。走错一步,后面 12 个月都得补 —— 这个成本,我们见过太多次。
            </p>
            <p
              className="text-lg md:text-xl leading-[1.95] text-[#2A1F18] font-medium mb-5"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              我见过一个老中医,一个人飞去日本考察,回来 6 个月没动静。
              不是不想动 —— 是不知道下一步该问谁,生怕走错那一步。
            </p>
            <p
              className="text-lg md:text-xl leading-[1.95] text-[#2A1F18] font-medium mb-5"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              我们做的,就是把那个「该问谁」变成一个你能找到、24h 在线的人 —— 小驼扫数据,真人顾问陪你做判断,你只管出海路上那件你最该做的事。
            </p>
            <p className="text-base leading-[1.9] text-[#5A4A3C]">
              <span className="text-[#C2473B]">差别不在资源,在每一步有没有人替你把稳。</span>
              <br />
              这就是我们做岐黄四海的原因 —— 让你出海时,<span className="text-[#2A1F18]">身后有人,身边有驼,脚下的路稳稳的。</span>
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
                    主理人
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-base md:text-lg leading-[1.85] text-[#2A1F18] font-medium mb-3"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    我们做这件事,不是要给行业多一个选择,
                    而是要让每一个想出海的<span className="text-[#C2473B]">本草品牌,都能稳稳走向世界。</span>
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#5A4A3C]">
                    <span className="h-px w-6 bg-[#C2473B]/30" />
                    <span className="font-medium text-[#2A1F18]">张小强</span>
                    <span className="text-[#C2473B]">·</span>
                    <span>岐黄四海 主理人</span>
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
                    陪跑队友
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-base md:text-lg leading-[1.85] text-[#2A1F18] font-medium mb-3"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    我是小驼,张小强的同事。
                    <span className="text-[#C2473B]"> 24h 在线,扫方向、查法规、看数据 —— </span>
                    不睡觉的队友,陪你稳稳走每一步。
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#5A4A3C]">
                    <span className="h-px w-6 bg-[#D9A66B]/40" />
                    <span className="font-medium text-[#2A1F18]">小驼</span>
                    <span className="text-[#D9A66B]">·</span>
                    <span>AI 陪跑队友</span>
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
              <span className="font-medium">我们是谁</span>
            </div>

            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.15] tracking-tight text-[#2A1F18] mb-6"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              不只是顾问,
              <span className="block text-[#C2473B]">是你稳稳出海的那双脚</span>
            </h2>

            <div className="relative pl-6 border-l-4 border-[#C2473B]">
              <Quote className="absolute -left-4 -top-2 h-6 w-6 text-[#C2473B]/20" />
              <p className="text-lg leading-[1.9] text-[#5A4A3C] italic">
                出海不是一句口号,是一段你每一步都得走得稳的路。
              </p>
            </div>

            <p className="mt-6 text-base leading-[1.9] text-[#5A4A3C]">
              岐黄四海专注于中医药、保健食品、汉方品牌的全球增长。
              让算法指方向,数据来打底,资深顾问陪你做判断 —— 从「要不要走」一直陪到「签了、出了、稳定了」。
              <span className="text-[#2A1F18] font-medium">你不是一个人在出海,我们让这件事稳稳地发生。</span>
            </p>
          </div>

          {/* 右侧：核心价值观 */}
          <div className="about-content">
            <h3 className="text-xl font-semibold text-[#2A1F18] mb-6 flex items-center gap-3">
              <Award className="h-5 w-5 text-[#C2473B]" />
              我们对你的承诺
            </h3>
            <div className="value-grid grid gap-4">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="value-card flex items-start gap-4 rounded-xl bg-white border border-[#C2473B]/12 p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#C2473B]/10 text-[#C2473B]">
                    {value.icon}
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
              为什么出海时,选我们陪你走得稳
            </h2>
            <p className="text-base text-[#5A4A3C] max-w-2xl mx-auto">
              不是因为我们有多大牌。是因为我们真的陪你走过 —— 走过立项的纠结、谈判的冷场、出问题的深夜。每一步,都陪你走得稳稳的。
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 about-content">
            {[
              {
                title: '不是顾问,是队友',
                desc: '你的项目我们一起扛 —— 出问题我们一起熬,签下来我们一起开心,每一步都走得稳。',
                highlight: '真陪,不是假装',
              },
              {
                title: '不是工具,是稳稳的托底',
                desc: '算法指方向,数据打底,真人顾问做判断 —— 出海路上,你需要的是每一脚都踩得稳。',
                highlight: '算法 + 数据 + 顾问,都在',
              },
              {
                title: '不是签约就走',
                desc: '出海只是开始,后续 14 个月的货我们陪你盯。中途政策变了,我们比你先看到,先稳住。',
                highlight: '签完,继续陪',
              },
            ].map((item) => (
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
            想让小驼先陪你聊一聊?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <Link
              to="/diagnose"
              className="inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.25)] transition-all hover:-translate-y-0.5"
            >
              <Heart className="h-5 w-5 fill-white" />
              让小驼陪我稳稳走第一步
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
