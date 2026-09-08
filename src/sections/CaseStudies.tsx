import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Search, X, BadgeCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CaseStudy {
  id: string;
  slug?: string;
  company: string;
  companyEn: string;
  industry: string;
  industryEn: string;
  industryCategory: string;
  decisionType: DecisionType;
  flag: string;
  markets: string[];
  marketsEn: string[];
  challenge: string;
  challengeEn: string;
  solution: string;
  solutionEn: string;
  result: string;
  resultEn: string;
  insight: string;
  insightEn: string;
  metrics: { label: string; labelEn: string; value: string }[];
}

type DecisionType = 'market' | 'compliance' | 'channel' | 'resource';

const CASE_CATEGORIES = [
  { id: 'all' },
  { id: 'market' },
  { id: 'compliance' },
  { id: 'channel' },
  { id: 'resource' },
];

const cases: CaseStudy[] = [
  {
    id: 'case1',
    slug: 'southeast-asia-three-country-entry',
    company: '某百年制药企业', companyEn: 'A Century-Old Pharmaceutical Co.',
    industry: '中成药', industryEn: 'Chinese Patent Medicine', industryCategory: 'tcm',
    decisionType: 'compliance',
    flag: '🇸🇬',
    markets: ['新加坡', '马来西亚', '泰国'], marketsEn: ['Singapore', 'Malaysia', 'Thailand'],
    challenge: '对东南亚市场法规不了解，担心产品合规问题', challengeEn: 'Unfamiliar with SE Asian regulations',
    solution: '通过风险评估确定优先市场，完成新加坡 HAS 认证后复制到马来西亚和泰国',
    solutionEn: 'Prioritized markets through risk assessment, then used Singapore HAS certification as the wedge into Malaysia and Thailand',
    result: '6个月完成3国准入，首年海外收入突破500万',
    resultEn: 'Completed 3-country entry in 6 months, with first-year overseas revenue above RMB 5M',
    insight: '先拿法规最清晰的小市场做样板，再复制到区域市场。',
    insightEn: 'Use the clearest regulatory market as the first proof point, then replicate regionally.',
    metrics: [
      { label: '进入时间', labelEn: 'Entry Time', value: '6个月' },
      { label: '覆盖国家', labelEn: 'Countries', value: '3个' },
      { label: '首年收入', labelEn: 'Revenue', value: '500万+' },
    ],
  },
  {
    id: 'case2',
    slug: 'australia-tga-supplement-entry',
    company: '某中药饮片企业', companyEn: 'A TCM Decoction Company',
    industry: '中药饮片', industryEn: 'TCM Decoction Pieces', industryCategory: 'tcm',
    decisionType: 'compliance',
    flag: '🇦🇺',
    markets: ['澳大利亚', '新西兰'], marketsEn: ['Australia', 'New Zealand'],
    challenge: '产品定位不清晰，不确定以食品还是药品形式进入', challengeEn: 'Unclear product positioning',
    solution: '通过 TGA 咨询确定以补充药品形式进入，并搭配本地专业渠道',
    solutionEn: 'Used TGA pathway analysis to position the product as complementary medicine and pair it with local professional channels',
    result: '获得 TGA 登记号，进入澳洲主流连锁药店',
    resultEn: 'Obtained TGA registration and entered major Australian pharmacy chains',
    insight: '品类定位本身就是路径设计，错一步会拖慢整个项目。',
    insightEn: 'Product classification is itself pathway design; a wrong choice can slow the entire project.',
    metrics: [
      { label: '认证时间', labelEn: 'Certification', value: '9个月' },
      { label: '合作连锁', labelEn: 'Chains', value: '5家' },
      { label: '市场占有率', labelEn: 'Market Share', value: '15%' },
    ],
  },
  {
    id: 'case3',
    slug: 'eu-supplement-thr-preparation',
    company: '某保健品集团', companyEn: 'A Health Supplements Group',
    industry: '保健食品', industryEn: 'Health Supplements', industryCategory: 'supplement',
    decisionType: 'channel',
    flag: '🇩🇪',
    markets: ['德国', '法国', '荷兰'], marketsEn: ['Germany', 'France', 'Netherlands'],
    challenge: '欧盟传统草药注册门槛高，周期长', challengeEn: 'High EU traditional herbal registration barriers',
    solution: '先按食品补充剂进入，同时为 THR 做中长期准备',
    solutionEn: 'Entered first through the supplement category while preparing a longer-term THR route',
    result: '食品补充剂渠道月销10万欧元，并为 THR 积累基础数据',
    resultEn: 'Reached EUR 100K monthly sales in the supplement channel while building a base for THR',
    insight: '先找能跑通的商业路径，再决定是否进入高门槛法规路径。',
    insightEn: 'Find the commercial path that can move first, then decide whether the higher-barrier regulatory path is justified.',
    metrics: [
      { label: '月销额', labelEn: 'Monthly Sales', value: '10万€' },
      { label: '准备周期', labelEn: 'Timeline', value: '2年' },
      { label: '预计ROI', labelEn: 'Expected ROI', value: '300%' },
    ],
  },
  {
    id: 'case4',
    slug: 'japan-kampo-skincare-launch',
    company: '某护肤品企业', companyEn: 'A Skincare Company',
    industry: '护肤产品', industryEn: 'Skincare Products', industryCategory: 'cosmetic',
    decisionType: 'market',
    flag: '🇯🇵',
    markets: ['日本', '韩国'], marketsEn: ['Japan', 'South Korea'],
    challenge: '日本药妆市场竞争激烈，品牌认知度为零', challengeEn: 'Intense Japanese cosmetics competition, zero brand awareness',
    solution: '以"汉方护肤"定位切入，并用内容种草 + 独立站承接验证需求',
    solutionEn: 'Entered with a Hanfang skincare angle and used content + DTC infrastructure to validate demand',
    result: '小红书自然流量月引3万访客，独立站月销8000美元',
    resultEn: 'Generated 30K monthly visitors from Xiaohongshu and USD 8K monthly DTC sales',
    insight: '在高竞争市场，定位差异化往往比铺渠道更早决定成败。',
    insightEn: 'In highly competitive markets, positioning differentiation often matters before channel scale.',
    metrics: [
      { label: '月访客', labelEn: 'Monthly Visitors', value: '3万' },
      { label: '月销额', labelEn: 'Sales', value: '$8000' },
      { label: '复购率', labelEn: 'Repeat Rate', value: '28%' },
    ],
  },
];

const categoryBadgeLabel: Record<string, string> = {
  market: '市场',
  compliance: '合规',
  channel: '渠道',
  resource: '资源',
};

const categoryBadgeLabelEn: Record<string, string> = {
  market: 'Market',
  compliance: 'Compliance',
  channel: 'Channel',
  resource: 'Resource',
};

const CaseStudies = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = useMemo(
    () =>
      cases.filter((c) => {
        const matchesCategory = activeCategory === 'all' || c.decisionType === activeCategory;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !q ||
          c.company.toLowerCase().includes(q) ||
          c.companyEn.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.industryEn.toLowerCase().includes(q) ||
          c.markets.some((m) => m.toLowerCase().includes(q)) ||
          c.marketsEn.some((m) => m.toLowerCase().includes(q));
        return matchesCategory && matchesSearch;
      }),
    [activeCategory, searchQuery]
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.pub-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [filteredCases.length]);

  const catLabel = (id: string) =>
    t(`cases.cat_${id}`, id === 'all' ? t('cases.cat_all') : id);

  return (
    <section id="cases" ref={sectionRef} className="section-cases relative overflow-hidden py-24 md:py-32">
      {/* Volume mark — editorial chapter marker */}
      <div className="relative z-10 container mx-auto px-6">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <div className="volume-mark">
              <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#2F5D57]">
                {isZh ? '卷首 · 案例选读' : 'Vol. I — Case Studies'}
              </span>
            </div>
            <h2 className="mt-3 text-[2.25rem] md:text-5xl font-semibold leading-[1.18] tracking-tight text-[#1B2520] serif-editorial">
              {t('cases.badgeTitle', '不是案例库,是陪跑过的真实判断')}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4a554f]">
              {t(
                'cases.desc',
                '每一个案例都是我们陪客户从立项迷茫走到出海落地的真实过程。看到过程,你才能判断这套陪跑到底适不适合你。'
              )}
            </p>
          </div>

          {/* Editorial badge on the right */}
          <div className="hidden md:flex flex-col items-end gap-3">
            <div className="badge badge-seal">
              {isZh ? '过往判断' : 'Proven Cases'}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[#5b6661]">
              <BadgeCheck className="h-3.5 w-3.5 text-[#2F5D57]" />
              <span>{t('cases.showCount', { n: filteredCases.length })}</span>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2.5">
            {CASE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`badge ${activeCategory === category.id ? 'badge-seal-active' : 'badge-seal-outline'}`}
              >
                {catLabel(category.id)}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2F5D57]/50" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('cases.searchPlaceholder', '搜索案例 / 行业 / 市场...')}
              className="w-full rounded-2xl border border-[#2F5D57]/20 bg-white py-3 pl-11 pr-11 text-sm text-[#1B2520] placeholder:text-[#5b6661]/70 focus:border-[#2F5D57]/40 focus:outline-none focus:ring-2 focus:ring-[#2F5D57]/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5b6661] hover:text-[#1B2520]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Magazine-style 2-column grid with alternating weight */}
        <div className="mt-12 grid gap-8 xl:grid-cols-2">
          {filteredCases.map((item, idx) => (
            <article
              key={item.id}
              className={`pub-card card-seal card-hover group relative rounded-2xl border border-[#2F5D57]/18 bg-[#FDFCF8] shadow-sm transition-all duration-300 ${
                idx % 3 === 0 ? 'xl:col-span-2' : ''
              }`}
            >
              {/* Ruled-lines hover overlay */}
              <div className="notebook-lines pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <Link to={`/cases/${item.slug}`} className="relative z-10 block p-8">
                {/* Card header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    {/* Flag + industry as muted label */}
                    <div className="flex items-center gap-2 text-sm text-[#5b6661]">
                      <span className="text-base leading-none opacity-70">{item.flag}</span>
                      <span className="text-xs tracking-wider text-[#5b6661]/70">
                        {isZh ? item.industry : item.industryEn}
                      </span>
                    </div>

                    {/* Serif title */}
                    <h3 className="mt-3 text-2xl font-semibold text-[#1B2520] serif-editorial leading-snug">
                      {isZh ? item.company : item.companyEn}
                    </h3>

                    {/* Market chips */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(isZh ? item.markets : item.marketsEn).map((m) => (
                        <span
                          key={m}
                          className="inline-flex items-center text-xs text-[#4a554f]"
                        >
                          {m}
                          {m !== (isZh ? item.markets : item.marketsEn).at(-1) && (
                            <span className="mx-1.5 text-[#2F5D57]/30">·</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Category badge */}
                  <span className="badge badge-seal shrink-0">
                    {isZh
                      ? categoryBadgeLabel[item.decisionType]
                      : categoryBadgeLabelEn[item.decisionType]}
                  </span>
                </div>

                {/* Client & advisor dialogue */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-xl bg-[#EDE8DC]/60 border border-[#2F5D57]/8 px-4 py-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#5b6661]/15 flex items-center justify-center text-[10px] font-bold text-[#5b6661]">
                      客
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[#5b6661]/60 font-bold mb-1">
                        {t('cases.industry', '客户当下')}
                      </div>
                      <p className="text-sm leading-relaxed text-[#3a4540] italic">
                        "{isZh ? item.challenge : item.challengeEn}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-[#2F5D57]/15 bg-[#2F5D57]/5 px-4 py-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#2F5D57] flex items-center justify-center text-[10px] font-bold text-white">
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                        <path d="M8 2L10 6H14L11 9L12.5 13L8 10.5L3.5 13L5 9L2 6H6L8 2Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] uppercase tracking-widest text-[#2F5D57]/70 font-bold mb-1">
                        {t('cases.pathway', '我们做的事')}
                      </div>
                      <p className="text-sm leading-relaxed text-[#1B2520]">
                        {isZh ? item.solution : item.solutionEn}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#C2473B]/5 border border-[#C2473B]/15 px-4 py-3">
                    <div className="text-[10px] uppercase tracking-widest text-[#C2473B]/80 font-bold mb-1">
                      {t('cases.outcome', '结果 · 和客户一起做到的')}
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-[#1B2520]">
                      {isZh ? item.result : item.resultEn}
                    </p>
                  </div>
                </div>

                {/* Insight 手记 */}
                <div className="mt-5 rounded-2xl border-l-4 border-[#C2473B] bg-[#FAF8F3] px-4 py-3.5 shadow-sm">
                  <div className="text-[10px] uppercase tracking-widest text-[#C2473B]/70 font-bold mb-1">
                    手记 · {t('cases.insight', '顾问判断')}
                  </div>
                  <p className="text-sm leading-relaxed text-[#1B2520] font-medium italic">
                    "{isZh ? item.insight : item.insightEn}"
                  </p>
                </div>

                {/* Metrics row */}
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {item.metrics.map((metric) => (
                    <div
                      key={metric.label + metric.value}
                      className="rounded-2xl border border-[#2F5D57]/10 bg-[#EDE8DC]/40 px-4 py-4 text-center"
                    >
                      <div className="stat-num text-2xl font-bold text-[#2F5D57]">
                        {metric.value}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#5b6661]">
                        {isZh ? metric.label : metric.labelEn}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#C2473B] group-hover:text-[#A93B30]">
                  {isZh ? '查看完整陪跑过程' : 'View full case analysis'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </article>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <div className="mt-20 text-center text-[#5b6661]">
            <p className="text-lg">{isZh ? '暂无匹配案例' : 'No matching cases found'}</p>
          </div>
        )}
      </div>

      <style>{`
        .section-cases {
          background-color: #EDE8DC;
        }

        .volume-mark {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .volume-mark::before {
          content: '';
          display: inline-block;
          width: 2rem;
          height: 1px;
          background-color: #2F5D57;
          opacity: 0.5;
        }

        .serif-editorial {
          font-family: 'Noto Serif SC', 'Source Serif Pro', Georgia, 'Songti SC', serif;
        }

        .pub-card {
          position: relative;
          overflow: hidden;
        }

        .pub-card.card-seal {
          border-left: 3px solid #2F5D57;
        }

        .pub-card.card-hover {
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
        }

        .pub-card.card-hover:hover {
          border-color: #2F5D57;
          box-shadow: 0 8px 32px rgba(47, 93, 87, 0.12);
          transform: translateY(-2px);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          border-radius: 9999px;
          padding: 0.25rem 0.75rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: all 0.2s ease;
        }

        .badge-seal {
          background-color: #2F5D57;
          color: #ffffff;
          border: 1px solid #2F5D57;
        }

        .badge-seal-outline {
          background-color: transparent;
          color: #2F5D57;
          border: 1px solid #2F5D57/25;
        }

        .badge-seal-active {
          background-color: #2F5D57;
          color: #ffffff;
        }

        .stat-num {
          font-variant-numeric: tabular-nums;
        }

        /* Subtle ruled-notebook lines on hover */
        .notebook-lines {
          background-image: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 27px,
            rgba(47, 93, 87, 0.07) 27px,
            rgba(47, 93, 87, 0.07) 28px
          );
          background-size: 100% 28px;
        }
      `}</style>
    </section>
  );
};

export default CaseStudies;
