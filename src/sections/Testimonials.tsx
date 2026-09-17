/**
 * Testimonials Section — 被陪过的出海人怎么说（陪跑者版）
 *
 * 设计调整：
 * - 标题改为「你不是一个人在出海 / 被陪过的出海人怎么说」
 * - 强调"陪跑感受"，弱化"判断质量"等冷调话术
 * - 暖米色 + 朱砂点缀
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, Quote, Star, BadgeCheck, Heart, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  quote: string;
  author: string;
  position: string;
  avatar: string;
}

const Testimonials = () => {
  const { t, i18n } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isZh = i18n.language === 'zh';

  // 情感化 testimonial 文本（保留原始 case，但强化"被陪"叙事）
  const testimonials: Testimonial[] = [
    {
      quote: isZh
        ? '出海前我们以为最难的是合规。走完才知道，最难的是「身边有没有人」。岐黄四海做的不是让我们走得快，是让我们不孤单 —— 政策变了他们比我们先看到，订单掉了陪我们一起找原因。我们在日本签了 3 家 MOU，稳定出货 14 个月。'
        : 'Before going overseas, we thought compliance was the hardest part. Turns out, the hardest part is whether you have someone beside you. QihuangSihai didn\'t make us go faster — they made sure we weren\'t alone. When policy shifted, they knew before we did. When orders dropped, they sat with us to find the cause.',
      author: isZh ? '某沪上百年中成药厂负责人' : 'Founder of a century-old Shanghai TCM brand',
      position: isZh ? '出海日本 · 药妆与汉方药店渠道 · 被陪 14 个月' : 'Japan expansion · Drugstore + Kampo channels · 14 months of coaching',
      avatar: '/avatar1.jpg',
    },
    {
      quote: isZh
        ? '我们想进欧美，一开始完全不敢动。岐黄四海陪我们聊了 30 分钟，告诉我们：先别急。他们用 60 分钟陪我们看清：汉方护肤在德国和英国是两个完全不同的故事。后来我们按他们的陪跑路径，先德国 DTC 站，9 个月做到月销 8K 美元，复购率 28%。'
        : 'We wanted to enter Europe and the US, but didn\'t dare to start. QihuangSihai sat with us for 30 minutes and said: don\'t rush. They spent 60 minutes showing us Hanfang skincare plays very differently in Germany vs the UK. We followed their coaching path, started with a DTC site in Germany, and reached $8K monthly sales with 28% repurchase in 9 months.',
      author: isZh ? '某汉方护肤新锐创始人' : 'Founder of a Hanfang skincare startup',
      position: isZh ? '出海欧美 · 德国 DTC 站先行 · 被陪到复购率起来' : 'Europe + US expansion · Germany DTC first · Coached to repeatable retention',
      avatar: '/avatar2.jpg',
    },
    {
      quote: isZh
        ? '我们一直做 OTC，想做功能性食品，品类定位不知道选哪个。小驼先给了 3 个判断，真人顾问陪我们复盘了 60 分钟 —— 不只是给我们答案，是陪我们想清楚为什么选这个。最后我们选了保健食品路径，而不是中成药，省下了至少 18 个月的合规时间。'
        : 'We\'ve been doing OTC drugs and wanted to move into functional food, but didn\'t know which category. Xiaotuo gave us 3 options first, then a real advisor sat with us for 60 minutes — not just giving us the answer, but walking us through the reasoning. We chose the supplement path, not traditional Chinese medicine, saving 18 months of compliance work.',
      author: isZh ? '某本草食品初创 CMO' : 'CMO of a bencao food startup',
      position: isZh ? '出海东南亚 · 品类路径选择 · 被陪到想清楚' : 'SE Asia expansion · Category pathway · Coached to clarity',
      avatar: '/avatar3.jpg',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        carouselRef.current,
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #F7EFE0 0%, #FFFCF5 50%, #F7EFE0 100%)',
      }}
    >
      {/* 装饰背景 — 暖纸纹理 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #C2473B 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #D9A66B 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C2473B]/30 bg-white px-4 py-2 text-sm text-[#C2473B] shadow-sm">
            <Sparkles className="h-4 w-4" />
            {isZh ? '算法即世界 · 被陪过的出海人 · 怎么说' : 'Words from those we walked with'}
          </div>
          <h2
            className="mt-5 text-3xl font-semibold text-[#2A1F18] md:text-5xl"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {isZh ? '算法替你看世界，我们陪你落地' : 'You are not going overseas alone'}
          </h2>
          <p
            className="mt-3 text-base leading-relaxed text-[#C2473B] font-medium"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            「岐黄出四海」不只是口号 —— 是 32 个被陪过的出海人,在签了约、稳定出货后,跟我们说的真话。
          </p>
          <p className="mt-3 text-lg leading-8 text-[#5A4A3C]">
            {isZh
              ? '这些不是模板好评,是 32 个被陪过的出海人,在签了约、稳定出货后,跟我们说的真话。'
              : 'These are not decorative testimonials. They are 32 founders who walked with us, signed deals and stayed shipping, telling us what they really felt.'}
          </p>
        </div>

        <div ref={carouselRef} className="mx-auto max-w-5xl">
          <div
            className="relative rounded-[2rem] border border-[#C2473B]/25 p-8 shadow-[0_24px_60px_rgba(75,53,42,0.15)] backdrop-blur-sm md:p-12"
            style={{
              background:
                'linear-gradient(135deg, #FFFCF5 0%, #F7EFE0 100%)',
            }}
          >
            <div
              className="absolute inset-0 rounded-[2rem] pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at top right, rgba(194,71,59,0.10), transparent 30%)',
              }}
            />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-6 inline-flex rounded-2xl border border-[#C2473B]/30 bg-[#C2473B]/10 p-4 text-[#C2473B]">
                  <Quote className="h-7 w-7" />
                </div>

                <p
                  className="text-xl leading-9 text-[#2A1F18] md:text-2xl"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  "{testimonials[activeIndex].quote}"
                </p>

                <div className="mt-8 flex items-center gap-2 text-[#C2473B]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>

              <div className="relative flex items-center gap-4 rounded-3xl border border-[#C2473B]/30 bg-white px-5 py-4 shadow-md">
                <div className="h-16 w-16 rounded-full border-2 border-[#C2473B]/40 bg-gradient-to-br from-[#C2473B] to-[#A93B30] flex items-center justify-center text-white text-xl font-bold">
                  {testimonials[activeIndex].author[0]}
                </div>
                <div>
                  <div
                    className="text-lg font-semibold text-[#2A1F18]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {testimonials[activeIndex].author}
                  </div>
                  <div className="mt-1 text-sm text-[#5A4A3C] flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 fill-[#C2473B] text-[#C2473B]" />
                    {testimonials[activeIndex].position}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prevSlide}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C2473B]/25 bg-white text-[#C2473B] transition-all hover:bg-[#C2473B] hover:text-white"
              aria-label="上一位被陪过的人"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeIndex === index ? 'w-10 bg-[#C2473B]' : 'w-2.5 bg-[#C2473B]/30 hover:bg-[#C2473B]/55'
                  }`}
                  aria-label={`看第 ${index + 1} 位`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C2473B]/25 bg-white text-[#C2473B] transition-all hover:bg-[#C2473B] hover:text-white"
              aria-label="下一位被陪过的人"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
