import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe2, Languages, ArrowRight, Bot, LayoutGrid, BriefcaseBusiness, FileSearch, Shield } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { tracking } from '../lib/tracking';
import i18n from '../i18n';

const Navbar = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 32);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: t('nav2.product', 'Product'), to: '/', icon: Bot },
    { name: t('nav2.diagnosisEngine', 'Diagnosis Engine'), to: '/diagnose', icon: LayoutGrid },
    { name: t('nav2.useCases', 'Use Cases'), to: '/markets', icon: BriefcaseBusiness },
    { name: t('nav2.caseProof', 'Case Proof'), to: '/cases', icon: FileSearch },
    { name: t('nav2.expertUpgrade', 'Expert Upgrade'), to: '/expert', icon: ArrowRight },
    { name: t('nav2.research', 'Research'), to: '/research', icon: FileSearch },
  ];

  const affiliatedPlatforms = [
    { label: 'AfricaZero', href: 'https://africa.zxqconsulting.com/', trackingLabel: 'navbar_africa' },
    { label: 'Global2China', href: 'https://global2china.zxqconsulting.com/', trackingLabel: 'navbar_global2china' },
  ];

  const isActive = (to: string) => location.pathname === to;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'border-b border-white/10 bg-[#07111a]/88 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-6">
          <Link
            to="/"
            onClick={() => tracking.click('brand_home', 'navigation')}
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)] transition-transform duration-300 group-hover:scale-105">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300/80">{t('brand.name')}</div>
              <div className="text-base font-semibold text-white sm:text-lg">
                {t('brand.tagline', 'TCM Global Decision OS')}
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            <LanguageSwitcher />
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                onClick={() => tracking.click(link.name, 'navigation')}
                className={`text-sm font-medium transition-colors duration-300 ${
                  isActive(link.to)
                    ? 'text-emerald-300'
                    : 'text-slate-200 hover:text-emerald-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <div className="hidden items-center gap-3 xl:flex">
              {affiliatedPlatforms.map((platform) => (
                <a
                  key={platform.href}
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => tracking.click(platform.trackingLabel, 'affiliated_platform')}
                  className="text-xs uppercase tracking-[0.18em] text-slate-400 transition-colors hover:text-slate-200"
                >
                  {platform.label}
                </a>
              ))}
              <a
                href="/admin"
                onClick={() => tracking.click('navbar_admin', 'navigation')}
                className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-emerald-400"
                title="管理后台"
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">管理后台</span>
              </a>
            </div>

            <Link
              to="/diagnose"
              onClick={() => tracking.click('header_start_diagnosis', 'cta')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              {t('hero2.ctaStart', 'Start diagnosis')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            className="md:hidden rounded-xl border border-white/10 bg-white/5 p-2.5 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0c1722]/95 p-4 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.to}
                    onClick={() => tracking.click(`mobile_${link.name}`, 'navigation')}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/5 ${
                      isActive(link.to) ? 'bg-white/5 text-emerald-300' : 'text-white hover:text-emerald-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-emerald-300" />
                    {link.name}
                  </Link>
                );
              })}

              <div className="mt-3 border-t border-white/10 pt-4">
                <div className="mb-3 flex items-center gap-2 px-2 text-sm font-medium text-white">
                  <Languages className="h-4 w-4 text-emerald-300" />
                  <span>{t('nav2.selectLang', 'Choose language')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'en', name: 'English', flag: '🇺🇸' },
                    { code: 'zh', name: '中文', flag: '🇨🇳' },
                    { code: 'es', name: 'Español', flag: '🇪🇸' },
                    { code: 'ja', name: '日本語', flag: '🇯🇵' },
                    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                    { code: 'fr', name: 'Français', flag: '🇫🇷' },
                    { code: 'pt', name: 'Português', flag: '🇧🇷' },
                    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
                    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                    { code: 'ko', name: '한국어', flag: '🇰🇷' },
                    { code: 'id', name: 'Bahasa', flag: '🇮🇩' },
                    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
                    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
                    { code: 'ms', name: 'Bahasa', flag: '🇲🇾' },
                    { code: 'lo', name: 'Lao', flag: '🇱🇦' },
                    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18nInstance.changeLanguage(lang.code);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center rounded-xl border px-2 py-2 text-xs transition-colors ${
                        i18nInstance.language === lang.code
                          ? 'border-emerald-400/50 bg-emerald-400/10 text-white'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="mt-1">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {i18nInstance.language === 'zh' ? '关联平台' : 'Affiliated platforms'}
                </div>
                <div className="flex flex-col gap-2">
                  {affiliatedPlatforms.map((platform) => (
                    <a
                      key={platform.href}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => tracking.click(platform.trackingLabel, 'mobile_affiliated_platform')}
                      className="rounded-xl border border-white/10 px-3 py-3 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {platform.label}
                    </a>
                  ))}
                  <a
                    href="/admin"
                    onClick={() => tracking.click('mobile_admin', 'navigation')}
                    className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-emerald-400"
                  >
                    <Shield className="h-4 w-4" />
                    {i18nInstance.language === 'zh' ? '管理后台' : 'Admin'}
                  </a>
                </div>
              </div>

              <Link
                to="/diagnose"
                onClick={() => tracking.click('mobile_start_diagnosis', 'cta')}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900"
              >
                {t('hero2.ctaStart', 'Start diagnosis')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
