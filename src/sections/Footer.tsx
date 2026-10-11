/**
 * Footer — 「稳稳」叙事版
 *
 * 围绕「让本草品牌稳稳走向世界」重构：
 * - 顶部金句改为新主 slogan 第 6 次露出
 * - 大字引言：「稳稳」作为品牌承诺的总收束
 * - 目标读者文案围绕「稳」展开
 * - 版权与底部署名同步更新
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Heart, ArrowRight, MapPinned, Building2, ChevronRight, ShieldCheck,
} from 'lucide-react';
import { tracking } from '../lib/tracking';

interface FooterLink {
  name: string;
  to: string;
  isAdmin?: boolean;
}

interface FooterGroup {
  title: string;
  links: FooterLink[];
}

const Footer = () => {
  const { t } = useTranslation();

  const groups = t('footer2_text.groups', { returnObjects: true }) as FooterGroup[];

  const affiliatedPlatforms = [
    {
      label: 'AfricaZero',
      description: t('footer.africaDesc'),
      href: 'https://africa.zxqconsulting.com/',
    },
    {
      label: 'Global2China',
      description: t('footer.global2chinaDesc'),
      href: 'https://global2china.zxqconsulting.com/',
    },
  ];

  const tags = t('footer2_text.tags', { returnObjects: true }) as string[];

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
            {/* 品牌金句 — 新主 Slogan 第 6 次露出 */}
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="h-[1px] w-8 bg-[#C2473B]" />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C2473B]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {t('footer2_text.taglinePill')}
              </span>
              <span className="h-[1px] w-8 bg-[#C2473B]" />
            </div>

            {/* 大字引言 — 「稳稳」作为收束 */}
            <h2
              className="text-3xl md:text-4xl font-semibold leading-[1.2] text-[#2A1F18] tracking-tight max-w-2xl"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('footer2_text.bigQuote')}
              <br />
              <span className="text-[#C2473B]">{t('footer2_text.bigQuoteAccent')}</span>
            </h2>

            <p className="mt-5 text-base leading-[1.85] text-[#5A4A3C] max-w-xl">
              {t('footer2_text.longDesc')}
            </p>

            {/* 目标读者 */}
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((tag) => (
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
                {t('footer2_text.ctaAsk')}
              </span>
            </div>

            <p
              className="text-base font-medium text-[#2A1F18] leading-relaxed"
              style={{ fontFamily: 'var(--font-serif)' }}
              dangerouslySetInnerHTML={{ __html: t('footer2_text.ctaPrimary') }}
            />

            <p className="mt-3 text-sm text-[#5A4A3C] leading-relaxed">
              {t('footer2_text.ctaSecondary')}
            </p>

            <Link
              to="/expert"
              onClick={() => tracking.click('footer_consultation', 'footer')}
              className="mt-6 flex w-full items-center justify-between rounded-xl border border-[#C2473B]/40 bg-[#C2473B] px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#A93B30] hover:border-[#A93B30]/60"
            >
              {t('footer2_text.btnConsult')}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/diagnose"
              onClick={() => tracking.click('footer_ai_diagnosis', 'footer')}
              className="mt-3 flex w-full items-center justify-between rounded-xl border border-[#C2473B]/25 bg-transparent px-5 py-3.5 text-sm font-semibold text-[#C2473B] transition-all hover:bg-[#C2473B]/5"
            >
              {t('footer2_text.btnDiagnose')}
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
                  {t('footer2_text.brandName')}
                </div>
                <div className="text-sm font-semibold tracking-tight text-[#2A1F18]" style={{ fontFamily: 'var(--font-serif)' }}>
                  {t('footer2_text.brandTagline')}
                </div>
              </div>
            </Link>

            <p className="text-sm leading-[1.85] text-[#5A4A3C]">
              {t('footer2_text.brandLongDesc')}
            </p>

            <div className="mt-5 space-y-2 text-sm text-[#5A4A3C]">
              <div className="flex items-start gap-2.5">
                <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C2473B]" />
                <span>{t('footer2_text.brandMeta1')}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPinned className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C2473B]" />
                <span>{t('footer2_text.brandMeta2')}</span>
              </div>
            </div>
          </div>

          {/* 导航组 */}
          {groups.map((group) => (
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
                        link.isAdmin
                          ? 'text-[#C2473B] font-medium hover:text-[#A93B30]'
                          : 'text-[#5A4A3C] hover:text-[#2A1F18]'
                      }`}
                    >
                      {link.isAdmin ? (
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
              {t('footer2_text.affiliatedTitle')}
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
          <div className="inline-flex items-center justify-center gap-1.5">
            <span>{t('footer2_text.copyright')}</span>
            <Heart className="h-3 w-3 fill-[#C2473B] text-[#C2473B]" />
            <span>{t('footer2_text.taglinePill')}</span>
          </div>
          <div className="text-[10px] tracking-wide">
            {t('footer2_text.subtitle')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
