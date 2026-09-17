/**
 * NotFoundPage — 404 占位页
 *
 * 品牌金句第 5 处露出:把"迷路"也变成一次品牌接触
 * 视觉:墨青底 + 朱砂点缀
 * 不依赖 i18n(无 key 暴露),纯文案 + 视觉
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Home, Mail } from 'lucide-react';
import { InteractiveAvatar } from '@/components/InteractiveAvatar';

const NotFoundPage = () => {
  return (
    <section className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-br from-[#0a1612] via-[#0d1f1a] to-[#11281f]">
      {/* 背景装饰:暖色径向 */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 22%, rgba(194,71,59,0.10), transparent 45%), radial-gradient(circle at 82% 78%, rgba(47,93,87,0.18), transparent 50%)',
        }}
      />
      {/* 网格 */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(194,71,59,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(194,71,59,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          {/* 顶部:品牌金句(朱砂线 + 小字) */}
          <div className="inline-flex items-center gap-3 mb-8">
            <span className="h-px w-10 bg-[#C2473B]" />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#C2473B]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              一脉岐黄 · 四海安康
            </span>
            <span className="h-px w-10 bg-[#C2473B]" />
          </div>

          {/* 主标:404 大数字 + 朱砂 */}
          <div className="relative">
            <div className="text-[8rem] md:text-[10rem] font-bold leading-none text-[#C2473B]/15 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] rounded-full bg-gradient-to-br from-[#FAF8F3] via-[#F5F0E8] to-[#EDE8DC] border-2 border-[#C2473B] shadow-[0_20px_50px_-12px_rgba(194,71,59,0.5)] overflow-hidden">
                <InteractiveAvatar compact loadingBg="#FAF8F3" />
                <div className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-[#C2473B] border-2 border-white shadow-sm" />
              </div>
            </div>
          </div>

          {/* 文案主体 */}
          <h1
            className="mt-6 md:mt-8 text-2xl md:text-4xl font-semibold text-white leading-snug"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            这一页找不到了
            <span className="block mt-2 text-amber-50/70 text-base md:text-lg font-normal">
              但你的<span className="text-[#C2473B] font-medium">判断</span>不会迷路
            </span>
          </h1>

          <p className="mt-6 text-sm md:text-base text-amber-50/60 max-w-lg mx-auto leading-relaxed">
            这条路径没有出口,但 35 个市场的算法 + 顾问可以重新给你指一条。
            <br />
            让算法 + 顾问陪你的项目,走一条能落地的路。
          </p>

          {/* 三级 CTA */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-6 py-3.5 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.35)] transition-all hover:-translate-y-0.5"
            >
              <Home className="h-5 w-5" />
              回首页
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </Link>
            <Link
              to="/method"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-amber-50/30 bg-transparent px-6 py-3.5 text-base font-semibold text-amber-50 transition-all hover:bg-amber-50/10 hover:border-[#C2473B]/60 hover:text-white"
            >
              <Compass className="h-5 w-5" />
              看我们的方法论
            </Link>
            <a
              href="mailto:zxq@zxqconsulting.com"
              className="group inline-flex items-center gap-2 rounded-xl border border-amber-50/15 bg-transparent px-4 py-3 text-sm font-medium text-amber-50/70 transition-all hover:border-[#C2473B]/60 hover:text-[#C2473B]"
            >
              <Mail className="h-4 w-4" />
              联系顾问
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            </a>
          </div>

          {/* 底部辅助文字 */}
          <div className="mt-12 text-[10px] font-mono uppercase tracking-[0.28em] text-amber-50/30">
            <span className="text-[#C2473B]">⏱ 7 天</span>
            <span className="mx-1.5">·</span>
            <span className="text-[#C2473B]">32 → 3</span>
            <span className="mx-1.5">·</span>
            <span>算法 + 顾问 · 全程陪跑</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;
