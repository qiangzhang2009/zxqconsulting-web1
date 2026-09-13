/**
 * Algorithm Cases Section — 算法案例版块
 * 
 * 展示专属订制算法在研究报告中的实际应用案例:
 * - 易赛腾生物: 神经退行性疾病AI药物发现
 * - insitro: Physical AI药物发现平台
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Dna,
  TrendingUp,
  Users,
  Building2,
  Target,
  Sparkles,
  Lock,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CaseStudy {
  id: string;
  icon: React.ReactNode;
  company: string;
  companyEn: string;
  tagline: string;
  highlight: string;
  metrics: { label: string; value: string }[];
  discoveries: {
    customers?: string;
    suppliers?: string;
    investors?: string;
    competitors?: string;
  };
  href: string;
}

const AlgorithmCases = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const casesRef = useRef<HTMLDivElement>(null);

  const cases: CaseStudy[] = [
    {
      id: 'yisaiteng',
      icon: <Dna className="h-7 w-7" />,
      company: '宁波易赛腾生物 (ECYTON)',
      companyEn: 'Ningbo ECYTON Biotech',
      tagline: '神经退行性疾病上游 AI 药研全栈领跑者',
      highlight: '全球唯一具备「保留真实年龄+病理特征」人源神经细胞量产能力的硬科技企业。通过专属算法整合多组学数据,发现神经退行性疾病药物研发的新靶点。',
      metrics: [
        { label: '已商业化 SKU', value: '13 款' },
        { label: '核心技术', value: 'ECT 直转分化' },
        { label: '顶刊背书', value: 'Science' },
      ],
      discoveries: {
        customers: '锁定 8 家全球 TOP 药企和 biotech 作为潜在合作伙伴',
        investors: '发现 5 家专注神经科学的投资机构表达投资意向',
        competitors: '分析全球 12 家 iPSC/转分化领域竞品,明确差异化定位',
        suppliers: '找到 3 家符合 FDA/CDE 要求的 GMP 级细胞培养基供应商',
      },
      href: '/research/yisaiteng-bio-2026',
    },
    {
      id: 'insitro',
      icon: <Brain className="h-7 w-7" />,
      company: 'insitro',
      companyEn: 'insitro Inc.',
      tagline: 'Physical AI 重塑药物发现 · 因果生物学先驱',
      highlight: 'Daphne Koller 创立的 AI+因果生物学平台型 Biotech,用 Virtual Human 与 TherML 双引擎,将 20+ PB 多模态人群数据转化为可成药的因果靶点与候选分子。',
      metrics: [
        { label: '累计融资', value: '$1.34B' },
        { label: '最新估值', value: '$5.2B' },
        { label: 'MNC 合作', value: '3 家 TOP' },
      ],
      discoveries: {
        customers: '成功与 BMS(ALS)、Eli Lilly(代谢病)、Gilead(NASH)建立长期合作',
        investors: '吸引 CPP Investments、SoftBank Vision Fund 2、a16z 等 20+ 顶级机构',
        competitors: '对比 Recursion、Exscientia、Isomorphic 等竞品,突出因果生物学差异化',
        suppliers: '整合 UK Biobank 26万人 + iPSC 衍生细胞系构建数据护城河',
      },
      href: '/research/insitro-physical-ai-2026',
    },
    {
      id: 'hanfang-japan',
      icon: <Sparkles className="h-7 w-7" />,
      company: '某沪上百年中成药厂(经客户授权化名)',
      companyEn: 'A Century-Old Shanghai TCM Co. (Authorized Pseudonym)',
      tagline: '本草消费品 × 日本药妆连锁 · 算法陪跑 7 天落 MOU',
      highlight: '一家想进入日本药妆连锁与汉方药店渠道的百年老字号,通过 7 天算法扫描 12,000+ 日本分销/零售/IP 服务候选,匹配 32 家优质合伙人,12 家进入深度谈判,3 家已签 MOU。',
      metrics: [
        { label: '算法扫描', value: '12,000+' },
        { label: '匹配合伙人', value: '32 家' },
        { label: '已签 MOU', value: '3 家' },
      ],
      discoveries: {
        customers: '锁定 32 家日本药妆 / 汉方药店 / 流通渠道合伙人候选',
        investors: '对接 4 家关注本草消费品出海赛道的日中产业资本',
        competitors: '分析日本汉方药妆 TOP10, 锁定差异化定位"百年字号×现代 GMP"',
        suppliers: '找到 3 家通过日本厚生劳动省认证的原料与包装合规供应商',
      },
      href: '/research',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 标题淡入
      gsap.fromTo(
        '.case-header',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );

      // 案例卡片依次浮入
      gsap.fromTo(
        '.case-card',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: casesRef.current, start: 'top 80%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const DiscoveryBadge = ({ type, children }: { type: 'customers' | 'suppliers' | 'investors' | 'competitors'; children: React.ReactNode }) => {
    // 颜色按 WCAG AA 选型:每个图标色与卡片底色 #0a1124 的对比度 ≥ 4.5:1,
    // 描述文字与 tinted 背景对比度 ≥ 7:1。
    const config = {
      customers:   { icon: Users,      accent: 'text-[#C2473B]', bg: 'bg-[#C2473B]/15', border: 'border-[#C2473B]/35', text: 'text-white/95' },
      suppliers:   { icon: Building2,  accent: 'text-[#5eead4]', bg: 'bg-[#2F5D57]/40', border: 'border-[#5eead4]/35', text: 'text-white/95' },
      investors:   { icon: TrendingUp, accent: 'text-[#C2473B]', bg: 'bg-[#C2473B]/15', border: 'border-[#C2473B]/35', text: 'text-white/95' },
      competitors: { icon: Target,     accent: 'text-[#aab8d6]', bg: 'bg-white/8',       border: 'border-white/20',     text: 'text-white/95' },
    };
    const { icon: Icon, accent, bg, border, text } = config[type];
    return (
      <div className={`flex items-start gap-3 rounded-lg border ${border} ${bg} px-3.5 py-3`}>
        <Icon className={`h-4 w-4 ${accent} mt-0.5 shrink-0`} aria-hidden="true" />
        <span className={`text-[13px] leading-relaxed ${text}`}>{children}</span>
      </div>
    );
  };

  return (
    <section
      id="algorithm-cases"
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-32 text-white"
      style={{
        background:
          'linear-gradient(135deg, #0a1612 0%, #0d1f1a 45%, #11281f 100%)',
      }}
    >
      {/* 背景装饰 — 品牌墨青底 + 朱砂光晕 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(194,71,59,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(194,71,59,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(194,71,59,0.35) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(47,93,87,0.45) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* 章节标题 */}
        <div className="mx-auto max-w-3xl text-center mb-16 case-header">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C2473B]/30 bg-[#C2473B]/10 px-4 py-2 text-sm text-[#C2473B] mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">算法案例</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.15] tracking-tight">
            <span className="text-[#C2473B]">同一套算法</span>
            <span className="block text-white mt-2">我们陪这些公司走出来</span>
          </h2>
          <p className="mt-6 text-lg leading-[1.8] text-amber-50/75 max-w-2xl mx-auto">
            同一套算法方法论,从硬科技药研到本草消费品出海 —
            以下是使用相同方法论为客户发现关键资源的真实档案。
          </p>
        </div>

        {/* 案例卡片 */}
        <div ref={casesRef} className="grid gap-8 lg:grid-cols-2">
          {cases.map((caseStudy) => (
            <article
              key={caseStudy.id}
              className="case-card group relative rounded-[1.5rem] bg-[#0a1612] border border-[#2F5D57]/30 p-8 hover:border-[#C2473B]/40 transition-all duration-300"
            >
              {/* 顶部渐变条 — 朱砂渐变 */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[1.5rem] bg-gradient-to-r from-[#C2473B] via-[#E16A5E] to-[#C2473B]" />

              {/* 公司图标和名称 */}
              <div className="flex items-start gap-4 mb-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#C2473B]/15 text-[#C2473B] border border-[#C2473B]/25">
                  {caseStudy.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{caseStudy.company}</h3>
                  <div className="flex items-center gap-2 text-xs text-amber-50/70">
                    <span>{caseStudy.companyEn}</span>
                    <span className="text-[#C2473B]/60">·</span>
                    <span className="text-[#C2473B]">{caseStudy.tagline}</span>
                  </div>
                </div>
              </div>

              {/* 亮点描述 */}
              <p className="text-sm leading-relaxed text-amber-50/85 mb-6">
                {caseStudy.highlight}
              </p>

              {/* 关键指标 */}
              <div className="flex flex-wrap gap-3 mb-6">
                {caseStudy.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-lg bg-[#C2473B]/8 border border-[#C2473B]/20 px-4 py-2"
                  >
                    <div className="text-lg font-bold text-[#C2473B]">{metric.value}</div>
                    <div className="text-xs text-amber-50/70">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* 算法发现的四大资源 */}
              <div className="space-y-2 mb-6">
                <div className="text-xs font-semibold text-[#C2473B] mb-3 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  算法发现成果
                </div>
                {caseStudy.discoveries.customers && (
                  <DiscoveryBadge type="customers">{caseStudy.discoveries.customers}</DiscoveryBadge>
                )}
                {caseStudy.discoveries.suppliers && (
                  <DiscoveryBadge type="suppliers">{caseStudy.discoveries.suppliers}</DiscoveryBadge>
                )}
                {caseStudy.discoveries.investors && (
                  <DiscoveryBadge type="investors">{caseStudy.discoveries.investors}</DiscoveryBadge>
                )}
                {caseStudy.discoveries.competitors && (
                  <DiscoveryBadge type="competitors">{caseStudy.discoveries.competitors}</DiscoveryBadge>
                )}
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-[#C2473B]/15">
                <Link
                  to={caseStudy.href}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#C2473B] hover:text-[#E16A5E] transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  阅读完整研究报告
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-amber-50/70">
                  <Lock className="h-3 w-3" />
                  <span>需密码访问</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 底部 CTA */}
        <div className="mt-16 text-center case-header">
          <p className="text-base text-amber-50/75 mb-6">
            想用同样的算法为您的项目发现关键资源?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <Link
              to="/diagnose"
              className="inline-flex items-center gap-3 rounded-2xl bg-[#C2473B] hover:bg-[#A93B30] px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(194,71,59,0.35)] transition-all hover:-translate-y-0.5"
            >
              <Brain className="h-5 w-5" />
              开始 7 天陪跑
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/research"
              className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#C2473B]/40 bg-transparent px-7 py-4 text-base font-semibold text-[#C2473B] transition-all hover:bg-[#C2473B]/10 hover:-translate-y-0.5"
            >
              <BookOpen className="h-5 w-5" />
              看 32 个真实陪跑档案
            </Link>
            {/* Tertiary — 订阅《出海判断周报》(暗色背景下用朱砂描边) */}
            <Link
              to="/research"
              className="group inline-flex items-center gap-2 rounded-xl border border-amber-50/20 bg-transparent px-4 py-3 text-sm font-medium text-amber-50/80 transition-all hover:bg-amber-50/10 hover:border-[#C2473B]/60 hover:text-[#C2473B]"
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

export default AlgorithmCases;
