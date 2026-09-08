import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Globe2, ArrowRight, BookOpen, MapPinned, Building2, ChevronRight, ShieldCheck } from 'lucide-react';
import { tracking } from '../lib/tracking';

const Footer = () => {
  const { t } = useTranslation();

  const navGroups = [
    {
      title: '导航',
      links: [
        { name: t('nav2.how', '如何工作'), to: '/method' },
        { name: t('nav2.cases', '过往判断'), to: '/cases' },
        { name: t('nav2.markets', '35 国'), to: '/markets' },
        { name: t('nav2.research', '研究'), to: '/research' },
        { name: '管理后台', to: '/admin/login', isAdmin: true },
      ],
    },
    {
      title: '优先市场',
      links: [
        { name: '日本 / 韩国', to: '/markets' },
        { name: '欧盟 / 英国', to: '/markets' },
        { name: '东南亚', to: '/markets' },
        { name: '中东', to: '/markets' },
      ],
    },
    {
      title: '平台能力',
      links: [
        { name: '市场进入判断', to: '/method' },
        { name: '合规路径评估', to: '/method' },
        { name: '渠道与增长指引', to: '/method' },
        { name: '诊断后续专家复盘', to: '/diagnose' },
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
    <footer className="bg-[#EDE8DC] text-[#3a4540]">
      {/* 顶部朱砂分隔线 */}
      <div className="top-bar-seal" />

      {/* 主内容区 */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          {/* 左侧:使命宣言 */}
          <div>
            {/* 标签 */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="h-[1px] w-8 bg-[#C2473B]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C2473B]">
                关于我们
              </span>
            </div>

            {/* 大字引言 */}
            <h2 className="text-3xl md:text-4xl font-semibold leading-[1.2] text-[#1B2520] tracking-tight max-w-2xl">
              让中医药、保健食品、汉方品牌,<br />
              <span className="text-[#2F5D57]">以更清晰的判断走出国门。</span>
            </h2>

            <p className="mt-5 text-base leading-[1.8] text-[#5b6661] max-w-xl">
              覆盖市场选择、注册路径、渠道合作、品牌本地化与 AI 诊断,
              为预算明确、合规要求高、周期较长的出海项目提供战略判断与执行指引。
            </p>

            {/* 目标读者 */}
            <div className="mt-6 flex flex-wrap gap-2">
              {['中药制药', '保健食品', '汉方护肤', '功能性产品', '医疗器械'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#2F5D57]/20 bg-[#2F5D57]/5 px-3 py-1 text-xs text-[#2F5D57] font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 右侧:下一步 CTA */}
          <div className="rounded-2xl border border-[#2F5D57]/15 bg-white p-6 lg:p-8 shadow-[0_4px_20px_rgba(31,42,32,0.06)]">
            <div className="inline-flex items-center gap-1.5 mb-4">
              <BookOpen className="h-4 w-4 text-[#C2473B]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C2473B]">
                深入了解
              </span>
            </div>

            <p className="text-base font-medium text-[#1B2520] leading-relaxed">
              分享你的项目背景,<br />申请更深度的专家评估。
            </p>

            <p className="mt-3 text-sm text-[#5b6661] leading-relaxed">
              AI 诊断帮助早期判断;正式合作依赖顾问复盘与当地法规评估。
            </p>

            <Link
              to="/expert"
              onClick={() => tracking.click('footer_consultation', 'footer')}
              className="mt-6 flex w-full items-center justify-between rounded-xl border border-[#C2473B]/40 bg-[#C2473B] px-5 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#A93B30] hover:border-[#A93B30]/60"
            >
              申请专家评估
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/diagnose"
              onClick={() => tracking.click('footer_ai_diagnosis', 'footer')}
              className="mt-3 flex w-full items-center justify-between rounded-xl border border-[#2F5D57]/25 bg-transparent px-5 py-3.5 text-sm font-semibold text-[#2F5D57] transition-all hover:bg-[#2F5D57]/5"
            >
              先做 3 分钟 AI 诊断
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
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2F5D57]/25 bg-[#2F5D57] text-white">
                <Globe2 className="h-[18px] w-[18px]" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#C2473B]" />
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#2F5D57]/60">
                  {t('brand.name', '岐黄四海')}
                </div>
                <div className="text-sm font-semibold tracking-tight text-[#1B2520]">
                  {t('brand.tagline', '出海决策伙伴')}
                </div>
              </div>
            </Link>

            <p className="text-sm leading-[1.75] text-[#5b6661]">
              专注于中医药与汉方品牌的全球增长,
              帮助团队做出市场进入决策、设计合规路径、构建渠道与本地化品牌叙事。
            </p>

            <div className="mt-5 space-y-2 text-sm text-[#5b6661]">
              <div className="flex items-start gap-2.5">
                <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2F5D57]" />
                <span>定位:中医药全球市场进入与增长咨询</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPinned className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2F5D57]" />
                <span>优先覆盖:日本、欧盟、东南亚、中东、澳洲、北美</span>
              </div>
            </div>
          </div>

          {/* 导航组 */}
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#2F5D57]/60 flex items-center gap-2">
                <span className="h-[1px] w-4 bg-[#2F5D57]/40" />
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
                          ? 'text-[#2F5D57] font-medium hover:text-[#C2473B]'
                          : 'text-[#5b6661] hover:text-[#1B2520]'
                      }`}
                    >
                      {(link as any).isAdmin ? (
                        <ShieldCheck className="h-3 w-3 text-[#2F5D57] group-hover:text-[#C2473B] transition-colors" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-[#2F5D57]/40 group-hover:text-[#2F5D57] transition-colors" />
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
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#2F5D57]/50">
              同体系平台
            </span>
            <span className="h-[1px] flex-1 bg-[#2F5D57]/10" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {affiliatedPlatforms.map((platform) => (
              <a
                key={platform.href}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => tracking.click(`footer_${platform.label}`, 'footer_affiliated')}
                className="group flex items-center justify-between rounded-xl border border-[#2F5D57]/12 bg-white px-5 py-4 transition-all hover:border-[#2F5D57]/30 hover:shadow-sm"
              >
                <div>
                  <div className="text-sm font-semibold text-[#1B2520]">{platform.label}</div>
                  <div className="mt-0.5 text-xs text-[#5b6661]">{platform.description}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#2F5D57]/40 group-hover:text-[#2F5D57] group-hover:translate-x-1 transition-all" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 底部版权 */}
      <div className="border-t border-[#2F5D57]/10 py-5">
        <div className="container mx-auto flex flex-col gap-1 px-6 text-center text-xs text-[#8a938e] md:flex-row md:items-center md:justify-between">
          <div>© 2026 岐黄四海 Qihuang Sihai. 保留所有权利。</div>
          <div className="text-[10px] tracking-wide">
            TCM全球出海 · 咨询方法论 + AI 诊断系统
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
