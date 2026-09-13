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
      customers:   { icon: Users,      accent: 'text-rose-300',   bg: 'bg-rose-400/15',   border: 'border-rose-400/35',   text: 'text-rose-50/95' },
      suppliers:   { icon: Building2,  accent: 'text-teal-300',   bg: 'bg-teal-400/15',   border: 'border-teal-400/35',   text: 'text-teal-50/95' },
      investors:   { icon: TrendingUp, accent: 'text-amber-300',  bg: 'bg-amber-400/15',  border: 'border-amber-400/35',  text: 'text-amber-50/95' },
      competitors: { icon: Target,     accent: 'text-slate-200',  bg: 'bg-slate-300/15',  border: 'border-slate-300/35',  text: 'text-slate-100/95' },
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
      className="relative overflow-hidden py-24 md:py-32 bg-[#1B2520] text-white"
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(94,234,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,0.03) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(94,234,212,0.2) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* 章节标题 */}
        <div className="mx-auto max-w-3xl text-center mb-16 case-header">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5eead4]/20 bg-[#5eead4]/10 px-4 py-2 text-sm text-[#5eead4] mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">算法案例</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.15] tracking-tight">
            <span className="text-[#5eead4]">专属算法</span>
            <span className="block text-white mt-2">赋能顶级研究报告</span>
          </h2>
          <p className="mt-6 text-lg leading-[1.8] text-[#aab8d6] max-w-2xl mx-auto">
            我们的专属订制算法已成功应用于多个行业研究项目,
            以下是使用相同方法论为客户发现关键资源的真实案例。
          </p>
        </div>

        {/* 案例卡片 */}
        <div ref={casesRef} className="grid gap-8 lg:grid-cols-2">
          {cases.map((caseStudy) => (
            <article
              key={caseStudy.id}
              className="case-card group relative rounded-[1.5rem] bg-[#0a1124] border border-[#5eead4]/10 p-8 hover:border-[#5eead4]/30 transition-all duration-300"
            >
              {/* 顶部渐变条 */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[1.5rem] bg-gradient-to-r from-[#5eead4] via-[#22d3ee] to-[#a78bfa]" />

              {/* 公司图标和名称 */}
              <div className="flex items-start gap-4 mb-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#5eead4]/10 text-[#5eead4]">
                  {caseStudy.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{caseStudy.company}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#aab8d6]">
                    <span>{caseStudy.companyEn}</span>
                    <span className="text-[#5eead4]/50">·</span>
                    <span className="text-[#5eead4]">{caseStudy.tagline}</span>
                  </div>
                </div>
              </div>

              {/* 亮点描述 */}
              <p className="text-sm leading-relaxed text-[#aab8d6] mb-6">
                {caseStudy.highlight}
              </p>

              {/* 关键指标 */}
              <div className="flex flex-wrap gap-3 mb-6">
                {caseStudy.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-lg bg-[#5eead4]/5 border border-[#5eead4]/15 px-4 py-2"
                  >
                    <div className="text-lg font-bold text-[#5eead4]">{metric.value}</div>
                    <div className="text-xs text-[#aab8d6]">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* 算法发现的四大资源 */}
              <div className="space-y-2 mb-6">
                <div className="text-xs font-semibold text-[#5eead4] mb-3 flex items-center gap-2">
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
              <div className="flex items-center justify-between pt-4 border-t border-[#5eead4]/10">
                <Link
                  to={caseStudy.href}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#5eead4] hover:text-[#22d3ee] transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  阅读完整研究报告
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-[#aab8d6]">
                  <Lock className="h-3 w-3" />
                  <span>需密码访问</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 底部 CTA */}
        <div className="mt-16 text-center case-header">
          <p className="text-base text-[#aab8d6] mb-6">
            想用同样的算法为您的项目发现关键资源?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/diagnose"
              className="inline-flex items-center gap-3 rounded-2xl bg-[#5eead4] hover:bg-[#22d3ee] px-7 py-4 text-base font-semibold text-[#020617] shadow-[0_10px_30px_rgba(94,234,212,0.25)] transition-all hover:-translate-y-0.5"
            >
              <Brain className="h-5 w-5" />
              开始智能诊断
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/research"
              className="inline-flex items-center gap-3 rounded-2xl border-2 border-[#5eead4]/40 bg-transparent px-7 py-4 text-base font-semibold text-[#5eead4] transition-all hover:bg-[#5eead4]/10 hover:-translate-y-0.5"
            >
              <BookOpen className="h-5 w-5" />
              浏览更多研究报告
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlgorithmCases;
