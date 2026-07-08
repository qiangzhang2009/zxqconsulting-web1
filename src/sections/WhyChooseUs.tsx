import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scale, Bot, BookOpen, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Option {
  label: string;
  labelEn: string;
  icon: React.ReactNode;
  color: string;
  accent: string;
  speed: string;
  speedEn: string;
  cost: string;
  costEn: string;
  scope: string;
  scopeEn: string;
  verdict: string;
  verdictEn: string;
  pros: string[];
  cons: string[];
}

const WhyChooseUs = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const options: Option[] = [
    {
      label: '麦肯锡 / 德勤 / 本地咨询公司',
      labelEn: 'McKinsey / Deloitte / Local Consulting Firms',
      icon: <Scale className="h-7 w-7" />,
      color: 'border-white/10 bg-white/[0.03]',
      accent: 'text-slate-400',
      speed: '4-12 周',
      speedEn: '4-12 weeks',
      cost: '50万+ / 项目',
      costEn: 'RMB 500K+ / project',
      scope: '定制报告 + 执行陪跑',
      scopeEn: 'Custom report + execution support',
      verdict: '高质量，但不适合立项前初判',
      verdictEn: 'High quality, but not suitable for early-stage go/no-go decisions',
      pros: [isZh ? '专业顾问团队' : 'Professional consultant team', isZh ? '定制化战略' : 'Customized strategy', isZh ? '执行陪跑' : 'Execution support'],
      cons: [isZh ? '周期长（数月）' : 'Long timeline (months)', isZh ? '费用高（50万起）' : 'High cost (from 500K RMB)', isZh ? '适合项目推进期，不适合立项前判断' : 'Good for execution, not for pre-entry decisions'],
    },
    {
      label: 'DeepSeek / ChatGPT / 通用的 AI 助手',
      labelEn: 'DeepSeek / ChatGPT / Generic AI Assistants',
      icon: <Bot className="h-7 w-7" />,
      color: 'border-blue-500/20 bg-blue-500/5',
      accent: 'text-blue-300',
      speed: '即时响应',
      speedEn: 'Instant',
      cost: '免费 - 低成本',
      costEn: 'Free - low cost',
      scope: '通用问答',
      scopeEn: 'General Q&A',
      verdict: '快而泛，但缺乏垂直领域上下文',
      verdictEn: 'Fast and broad, but lacks vertical domain context',
      pros: [isZh ? '即时可用' : 'Instantly available', isZh ? '无成本门槛' : 'No cost barrier', isZh ? '覆盖广' : 'Broad coverage'],
      cons: [isZh ? '不知道市场具体准入规则' : 'Does not know specific market entry rules', isZh ? '不知道不同品类的法规差异' : 'Does not know regulatory differences by category', isZh ? '不知道禁忌成分或标签要求' : 'Does not know prohibited ingredients or labeling requirements'],
    },
    {
      label: '自己研究 / DIY 查资料',
      labelEn: 'Do-It-Yourself Research',
      icon: <BookOpen className="h-7 w-7" />,
      color: 'border-amber-500/20 bg-amber-500/5',
      accent: 'text-amber-300',
      speed: '2-6 个月',
      speedEn: '2-6 months',
      cost: '人力成本',
      costEn: 'Staff time cost',
      scope: '碎片化信息',
      scopeEn: 'Fragmented information',
      verdict: '成本最低，但风险最高',
      verdictEn: 'Lowest cost, but highest risk',
      pros: [isZh ? '完全掌控' : 'Full control', isZh ? '无外部依赖' : 'No external dependencies', isZh ? '适合学习阶段' : 'Good for learning phase'],
      cons: [isZh ? '法规信息不完整，易踩坑' : 'Incomplete regulatory info, easy to hit pitfalls', isZh ? '不知道哪些信息是关键' : 'Do not know which information is critical', isZh ? '决策质量依赖个人经验' : 'Decision quality depends on individual experience'],
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.whyus-heading',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );
      gsap.fromTo(
        '.whyus-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 75%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [isZh]);

  return (
    <section id="why-choose-us" ref={sectionRef} className="relative bg-[#07111a] py-24">
      {/* Decorative botanical background element */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]">
        <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
          <g stroke="#10b981" fill="none" strokeWidth="1">
            <path d="M0 200 Q200 100 400 200 Q600 300 800 200" />
            <path d="M0 250 Q200 150 400 250 Q600 350 800 250" />
            <path d="M100 0 Q150 100 100 200 Q50 300 100 400" />
            <path d="M300 0 Q350 100 300 200 Q250 300 300 400" />
            <path d="M500 0 Q550 100 500 200 Q450 300 500 400" />
            <path d="M700 0 Q750 100 700 200 Q650 300 700 400" />
          </g>
        </svg>
      </div>

      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="whyus-heading mx-auto mb-16 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            <Scale className="h-4 w-4" />
            {isZh ? '为什么是岐黄四海？' : 'Why QihuangSihai?'}
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-white md:text-5xl">
            {isZh
              ? '岐黄四海 vs 其他选择'
              : 'QihuangSihai vs Other Options'}
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            {isZh
              ? '每种选择都有其适用场景。岐黄四海的定位是：在立项前完成可执行的出海判断。'
              : 'Every approach has its place. QihuangSihai\'s position: deliver actionable globalization decisions before resources are committed.'}
          </p>
        </div>

        {/* Comparison cards */}
        <div ref={cardsRef} className="grid gap-6 lg:grid-cols-3">
          {options.map((opt, index) => (
            <div
              key={opt.label}
              className={`whyus-card rounded-[2rem] border ${opt.color} p-7`}
            >
              <div className={`mb-5 inline-flex rounded-2xl border ${opt.color} p-3 ${opt.accent}`}>
                {opt.icon}
              </div>
              <h3 className="text-xl font-semibold text-white">{opt.label}</h3>
              <h3 className="text-lg font-medium text-slate-400">{opt.labelEn}</h3>

              {/* Quick stats */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
                    {isZh ? '速度' : 'Speed'}
                  </div>
                  <div className="mt-1 text-sm font-medium text-white">{opt.speed}</div>
                  <div className="text-xs text-slate-500">{opt.speedEn}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
                    {isZh ? '成本' : 'Cost'}
                  </div>
                  <div className="mt-1 text-sm font-medium text-white">{opt.cost}</div>
                  <div className="text-xs text-slate-500">{opt.costEn}</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  {isZh ? '输出范围' : 'Output Scope'}
                </div>
                <div className="mt-1 text-sm font-medium text-white">{opt.scope}</div>
                <div className="text-xs text-slate-500">{opt.scopeEn}</div>
              </div>

              {/* Verdict */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-[#0c1722] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <X className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                    {isZh ? '局限性' : 'Limitation'}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{opt.verdict}</p>
                <p className="mt-1 text-xs text-slate-500">{opt.verdictEn}</p>
              </div>

              {/* Pros & Cons */}
              <div className="mt-5 grid gap-4">
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400">
                    {isZh ? '优势' : 'Pros'}
                  </div>
                  <ul className="space-y-1.5">
                    {opt.pros.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-red-400">
                    {isZh ? '劣势' : 'Cons'}
                  </div>
                  <ul className="space-y-1.5">
                    {opt.cons.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-red-400" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}

          {/* QihuangSihai card */}
          <div className="whyus-card rounded-[2rem] border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent p-7">
            <div className="mb-5 inline-flex rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-emerald-300">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="14" cy="14" r="6" stroke="currentColor" strokeWidth="1" />
                <circle cx="14" cy="14" r="2" fill="currentColor" />
                <path d="M14 2 L14 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M14 22 L14 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M2 14 L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M22 14 L26 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">岐黄四海 · 决策操作系统</h3>
            <h3 className="text-lg font-medium text-emerald-300">QihuangSihai · Decision OS</h3>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                <div className="text-xs uppercase tracking-[0.15em] text-emerald-400/70">
                  {isZh ? '速度' : 'Speed'}
                </div>
                <div className="mt-1 text-sm font-semibold text-emerald-200">3-5 分钟</div>
                <div className="text-xs text-emerald-400/60">3-5 minutes</div>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                <div className="text-xs uppercase tracking-[0.15em] text-emerald-400/70">
                  {isZh ? '成本' : 'Cost'}
                </div>
                <div className="mt-1 text-sm font-semibold text-emerald-200">
                  {isZh ? 'AI 诊断免费' : 'AI diagnosis free'}
                </div>
                <div className="text-xs text-emerald-400/60">
                  {isZh ? '专家评审按需' : 'Expert by need'}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
              <div className="text-xs uppercase tracking-[0.15em] text-emerald-400/70">
                {isZh ? '输出范围' : 'Output Scope'}
              </div>
              <div className="mt-1 text-sm font-semibold text-emerald-200">
                {isZh ? '市场优先级 + 合规路径 + 风险暴露 + 行动建议' : 'Market priority + Compliance path + Risk + Action'}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <CheckIcon />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400">
                  {isZh ? '核心价值' : 'Core Value'}
                </span>
              </div>
              <p className="text-sm text-emerald-100">
                {isZh
                  ? '立项前先完成可执行的出海判断。不是告诉你做什么，而是告诉你值不值得做、风险在哪、最优路径是什么。'
                  : 'Make actionable globalization decisions before committing resources. Not what to do, but whether it\'s worth doing, where the risks are, and what the optimal path is.'}
              </p>
            </div>

            <div className="mt-5 space-y-2">
              {[
                isZh ? '垂直领域市场数据与合规规则库' : 'Vertical domain market data + regulatory rules',
                isZh ? '结构化决策框架（不是泛泛的建议）' : 'Structured decision frameworks (not generic advice)',
                isZh ? 'AI 初判 + 专家兜底的分层服务' : 'AI first pass + Expert fallback',
              ].map((p) => (
                <div key={p} className="flex items-start gap-2 text-sm text-slate-200">
                  <CheckIcon />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CheckIcon = () => (
  <svg className="h-4 w-4 shrink-0 text-emerald-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,8 6,12 14,4" />
  </svg>
);

export default WhyChooseUs;
