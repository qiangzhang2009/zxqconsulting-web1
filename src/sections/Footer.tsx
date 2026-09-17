/**
 * Footer — 陪跑者版
 *
 * 设计调整：
 * - 收尾改为"随时在你身后"
 * - 情感化话术：「你不是一个人出海，我们在你身后」
 * - 视觉：暖米色 + 朱砂点缀
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Heart, ArrowRight, BookOpen, MapPinned, Building2, ChevronRight, ShieldCheck, Globe2,
} from 'lucide-react';
import { tracking } from '../lib/tracking';

const Footer = () => {
  const { t } = useTranslation();

  const navGroups = [
    {
      title: '陪你的',
      links: [
        { name: t('nav2.how', '我们怎么陪你'), to: '/method' },
        { name: t('nav2.markets', '35 个目的地'), to: '/markets' },
        { name: t('nav2.research', '陪跑档案'), to: '/research' },
        { name: '管理后台', to: '/admin/login', isAdmin: true },
      ],
    },
    {
      title: '陪你的 4 件事',
      links: [
        { name: '陪你判断要不要走', to: '/method' },
        { name: '陪你找到第一个队友', to: '/method' },
        { name: '陪你打通合规路径', to: '/method' },
        { name: '陪你签约 + 继续陪', to: '/method' },
      ],
    },
    {
      title: '优先目的地',
      links: [
        { name: '日本 / 韩国', to: '/markets' },
        { name: '欧盟 / 英国', to: '/markets' },
        { name: '东南亚', to: '/markets' },
        { name: '中东', to: '/markets' },
      ],
    },
    {
      title: '陪跑阶段',
      links: [
        { name: '迷茫时陪你想', to: '/method' },
        { name: '找路时陪你找', to: '/method' },
        { name: '小驼先聊 30 分钟', to: '/diagnose' },
        { name: '和真人顾问见面', to: '/expert' },
      ],
    },
  ];

  const affiliatedPlatforms = [
    {
      label: 'AfricaZero',
      description: '非洲原产地与关税套利平台',
      href: 'https://africa.zxqconsulting.com/',
    },
    {
      label: 'Global2China',
      description: '境外品牌入华咨询平台',
      href: 'https://global2china.zxqconsulting.com/',
    },
  ];

  return (
    <footer
      className="text-[#5A4A3C]"
      style={{
        background:
          'linear-gradient(180deg, #FFFCF5 0%, #F7EFE0 100%)',
      }}
    >
      {/* 顶部朱砂分隔线 */}
      <div className="top-bar-seal" />

      {/* 主内容区 */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          {/* 左侧：使命宣言 — 陪跑者情感化 */}
          <div>
            {/* 品牌金句 — 算法世界观核心锚点 */}
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="h-[1px] w-8 bg-[#C2473B]" />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C2473B]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                算法即世界 · 岐黄出四海
              </span>
              <span className="h-[1px] w-8 bg-[#C2473B]" />
            </div>

            {/* 大字引言 — 算法 + 陪跑 双锚 */}
            <h2
              className="text-3xl md:text-4xl font-semibold leading-[1.2] text-[#2A1F18] tracking-tight max-w-2xl"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              无论世界有多大,<br />
              <span className="text-[#C2473B]">算法替你看见,我们陪你走到。</span>
            </h2>

            <p className="mt-5 text-base leading-[1.85] text-[#5A4A3C] max-w-xl">
              迷茫时小驼先帮你看清,找路时陪你找,谈判时陪你去,稳定后继续陪你盯。
              <span className="text-[#2A1F18] font-medium">算法给你方向,真人陪你落地</span> —— 你不是一个人出海,小驼 24h 在线,真人顾问在你身后。
            </p>

            {/* 目标读者 */}
            <div className="mt-6 flex flex-wrap gap-2">
              {['中药制药', '保健食品', '汉方护肤', '功能性产品', '医疗器械'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#C2473B]/20 bg-white px-3 py-1 text-xs text-[#C2473B] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 右侧：下一步 CTA */}
          <div className="rounded-2xl border border-[#C2473B]/20 bg-white p-6 lg:p-8 shadow-[0_4px_20px_rgba(75,53,42,0.08)]">
            <div className="inline-flex items-center gap-1.5 mb-4">
              <Heart className="h-4 w-4 fill-[#C2473B] text-[#C2473B]" />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C2473B]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                先让小驼陪你聊
              </span>
            </div>

            <p
              className="text-base font-medium text-[#2A1F18] leading-relaxed"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              先让小驼陪你聊 30 分钟,<br />不承诺、不付费,只是先有人在你身后。
            </p>

            <p className="mt-3 text-sm text-[#5A4A3C] leading-relaxed">
              聊完你觉得想见真人顾问,我们再约 30 分钟陪聊。
            </p>

            <Link
              to="/expert"
              onClick={() => tracking.click('footer_consultation', 'footer')}
              className="mt-6 flex w-full items-center justify-between rounded-xl border border-[#C2473B]/40 bg-[#C2473B] px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#A93B30] hover:border-[#A93B30]/60"
            >
              让真人顾问陪我聊
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/diagnose"
              onClick={() => tracking.click('footer_ai_diagnosis', 'footer')}
              className="mt-3 flex w-full items-center justify-between rounded-xl border border-[#C2473B]/25 bg-transparent px-5 py-3.5 text-sm font-semibold text-[#C2473B] transition-all hover:bg-[#C2473B]/5"
            >
              先让小驼陪我 30 分钟
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="divider my-12" />

        {/* 导航网格 */}
        <div className="grid gap-10 md:grid-cols-4">
          {/* 品牌栏 */}
          <div>
            <Link to="/" className="group flex items-center gap-3 mb-5">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#C2473B]/25 bg-[#C2473B] text-white">
                <Heart className="h-[18px] w-[18px] fill-white" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#D9A66B]" />
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#C2473B]/60">
                  {t('brand.name', '岐黄四海')}
                </div>
                <div className="text-sm font-semibold tracking-tight text-[#2A1F18]" style={{ fontFamily: 'var(--font-serif)' }}>
                  {t('brand.tagline', '算法即世界 · 岐黄出四海')}
                </div>
              </div>
            </Link>

            <p className="text-sm leading-[1.85] text-[#5A4A3C]">
              专注于中医药与汉方品牌的全球增长。
              <span className="text-[#2A1F18] font-medium">小驼用算法替你扫世界,真人顾问陪你走到能签</span>。
              算法给你方向,我们陪你落地 —— 你不是一个人出海,我们在你身后。
            </p>

            <div className="mt-5 space-y-2 text-sm text-[#5A4A3C]">
              <div className="flex items-start gap-2.5">
                <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C2473B]" />
                <span>定位:中医药出海陪跑伙伴</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPinned className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C2473B]" />
                <span>优先陪你走:日本、欧盟、东南亚、中东、澳洲、北美</span>
              </div>
            </div>
          </div>

          {/* 导航组 */}
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3
                className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#C2473B]/70 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                <span className="h-[1px] w-4 bg-[#C2473B]/40" />
                {group.title}
              </h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      onClick={() => tracking.click(`footer_${link.name}`, 'footer')}
                      className={`group inline-flex items-center gap-1 text-sm transition-colors ${
                        (link as any).isAdmin
                          ? 'text-[#C2473B] font-medium hover:text-[#A93B30]'
                          : 'text-[#5A4A3C] hover:text-[#2A1F18]'
                      }`}
                    >
                      {(link as any).isAdmin ? (
                        <ShieldCheck className="h-3 w-3 text-[#C2473B] group-hover:text-[#A93B30] transition-colors" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-[#C2473B]/40 group-hover:text-[#C2473B] transition-colors" />
                      )}
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 分隔线 */}
        <div className="divider my-10" />

        {/* 关联平台 */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#5A4A3C]/60" style={{ fontFamily: 'var(--font-serif)' }}>
              同一个队伍
            </span>
            <span className="h-[1px] flex-1 bg-[#C2473B]/10" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {affiliatedPlatforms.map((platform) => (
              <a
                key={platform.href}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => tracking.click(`footer_${platform.label}`, 'footer_affiliated')}
                className="group flex items-center justify-between rounded-xl border border-[#C2473B]/15 bg-white px-5 py-4 transition-all hover:border-[#C2473B]/35 hover:shadow-sm"
              >
                <div>
                  <div className="text-sm font-semibold text-[#2A1F18]" style={{ fontFamily: 'var(--font-serif)' }}>{platform.label}</div>
                  <div className="mt-0.5 text-xs text-[#5A4A3C]">{platform.description}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#C2473B]/40 group-hover:text-[#C2473B] group-hover:translate-x-1 transition-all" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 底部版权 */}
      <div className="border-t border-[#C2473B]/10 py-5">
        <div className="container mx-auto flex flex-col gap-1 px-6 text-center text-xs text-[#5A4A3C]/70 md:flex-row md:items-center md:justify-between">
          <div>© 2026 岐黄四海 Qihuang Sihai. <Heart className="inline h-3 w-3 fill-[#C2473B] text-[#C2473B]" /> 算法即世界 · 岐黄出四海</div>
          <div className="text-[10px] tracking-wide">
            TCM 全球出海 · 小驼 + 真人顾问陪跑伙伴
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
