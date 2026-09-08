import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, Globe2, Languages, ArrowRight, ShieldCheck,
} from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { tracking } from '../lib/tracking';
import i18n from '../i18n';

const Navbar = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: t('nav2.how', '如何工作'), to: '/method', note: '方法' },
    { name: t('nav2.cases', '过往判断'), to: '/cases', note: '案例' },
    { name: t('nav2.markets', '35 国'), to: '/markets', note: '市场' },
    { name: t('nav2.research', '研究'), to: '/research', note: '报告' },
    { name: t('nav2.expert', '专家顾问'), to: '/expert', note: '顾问', highlight: true },
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-spring ${
        isScrolled
          ? 'border-b border-[#2F5D57]/10 bg-[#FAF8F3]/92 py-2.5 shadow-[0_4px_20px_rgba(31,42,32,0.06)] backdrop-blur-xl'
          : 'bg-[#FAF8F3]/70 backdrop-blur-sm py-4'
      }`}
    >
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between gap-6">
          {/* 品牌 */}
          <Link
            to="/"
            onClick={() => tracking.click('brand_home', 'navigation')}
            className="group flex items-center gap-2.5"
          >
            {/* 墨青圆形徽章 */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2F5D57]/25 bg-[#2F5D57] text-white shadow-sm">
              <Globe2 className="h-[18px] w-[18px]" />
              {/* 右上角朱砂点 */}
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#C2473B] animate-ink-pulse" />
            </div>
            <div className="leading-tight">
              <div className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#2F5D57]/60">
                {t('brand.name', '岐黄四海')}
              </div>
              <div className="text-sm font-semibold tracking-tight text-[#1B2520]">
                {t('brand.tagline', '出海决策伙伴')}
              </div>
            </div>
          </Link>

          {/* 主导航 */}
          <div className="hidden items-center gap-0.5 xl:flex">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.name}
                  to={link.to}
                  onClick={() => tracking.click(link.name, 'navigation')}
                  className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-[#2F5D57] bg-[#2F5D57]/8 font-semibold'
                      : link.highlight
                      ? 'text-[#C2473B] hover:text-[#A93B30] hover:bg-[#C2473B]/5'
                      : 'text-[#5b6661] hover:text-[#1B2520] hover:bg-[#2F5D57]/5'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute -bottom-px left-4 right-4 h-[2px] rounded-full bg-[#2F5D57]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* 右侧动作组 */}
          <div className="hidden items-center gap-2 xl:flex">
            <LanguageSwitcher />

            {/* 管理后台入口（低调） */}
            <Link
              to="/admin/login"
              onClick={() => tracking.click('header_admin_entry', 'navigation')}
              title="管理后台"
              aria-label="管理后台"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2F5D57]/15 bg-white/60 text-[#2F5D57]/70 transition-all duration-200 hover:border-[#2F5D57]/40 hover:bg-[#2F5D57]/5 hover:text-[#2F5D57]"
            >
              <ShieldCheck className="h-4 w-4" />
            </Link>

            {/* 精致版 CTA */}
            <Link
              to="/diagnose"
              onClick={() => tracking.click('header_start_diagnosis', 'cta')}
              className="inline-flex items-center gap-2 rounded-full border border-[#C2473B]/40 bg-[#C2473B] px-5 py-2 text-sm font-semibold text-white shadow-[0_2px_12px_rgba(194,71,59,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#A93B30] hover:border-[#A93B30]/60 hover:shadow-[0_4px_16px_rgba(194,71,59,0.25)] active:translate-y-0"
            >
              {t('hero2.ctaStart', '3 分钟 AI 诊断')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* 移动端汉堡 */}
          <button
            className="rounded-xl border border-[#2F5D57]/15 bg-white/80 p-2.5 text-[#1B2520] backdrop-blur-sm transition-colors hover:bg-white xl:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="mt-3 rounded-2xl border border-[#2F5D57]/12 bg-[#FAF8F3] p-5 shadow-[0_8px_30px_rgba(31,42,32,0.1)] xl:hidden">
            {/* 导航链接 */}
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  onClick={() => tracking.click(`mobile_${link.name}`, 'navigation')}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-[#2F5D57]/8 text-[#2F5D57] font-semibold'
                      : link.highlight
                      ? 'text-[#C2473B] hover:bg-[#C2473B]/5'
                      : 'text-[#3a4540] hover:bg-[#2F5D57]/5 hover:text-[#1B2520]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* 语言选择区 */}
            <div className="mt-4 border-t border-[#2F5D57]/10 pt-4">
              <div className="mb-3 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-widest text-[#2F5D57]/60">
                <Languages className="h-3.5 w-3.5" />
                <span>语言</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { code: 'en', name: 'EN' },
                  { code: 'zh', name: '中文' },
                  { code: 'ja', name: '日本語' },
                  { code: 'ko', name: '한국어' },
                  { code: 'de', name: 'DE' },
                  { code: 'fr', name: 'FR' },
                  { code: 'es', name: 'ES' },
                  { code: 'pt', name: 'PT' },
                  { code: 'ar', name: 'AR' },
                  { code: 'id', name: 'ID' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      i18nInstance.changeLanguage(lang.code);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`rounded-lg border py-2 text-xs font-medium transition-colors ${
                      i18nInstance.language === lang.code
                        ? 'border-[#2F5D57]/40 bg-[#2F5D57]/8 text-[#2F5D57] font-semibold'
                        : 'border-[#2F5D57]/10 bg-white text-[#5b6661] hover:border-[#2F5D57]/25 hover:text-[#1B2520]'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 主 CTA */}
            <Link
              to="/diagnose"
              onClick={() => tracking.click('mobile_start_diagnosis', 'cta')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#C2473B]/40 bg-[#C2473B] px-5 py-3 text-sm font-semibold text-white"
            >
              {t('hero2.ctaStart', '3 分钟 AI 诊断')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* 管理后台入口（移动端） */}
            <Link
              to="/admin/login"
              onClick={() => tracking.click('mobile_admin_entry', 'navigation')}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#2F5D57]/25 bg-white px-5 py-3 text-sm font-semibold text-[#2F5D57] transition-colors hover:bg-[#2F5D57]/5"
            >
              <ShieldCheck className="h-4 w-4" />
              管理后台
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
