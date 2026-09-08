/**
 * 出海国家评估 Hub：多步骤状态机
 * 
 * 步骤：
 *  1) 客户画像（profile + 准备度）
 *  2) 选择候选国家与进入假设
 *  3) 权重与硬门槛定制
 *  4) 逐维评分 + 硬门槛状态
 *  5) 结果读数 + AI 简报 + 提交
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, ChevronRight, Compass, Target, Users, Shield, Database, 
  CheckCircle2, XCircle, Lightbulb, Globe, Award, Lock, Clock, Star,
  ArrowRight, TrendingUp, FileText, BarChart3, RefreshCw
} from 'lucide-react';

import { tracking } from '@/lib/tracking';
import type {
  DimensionId,
  GateId,
  ProfileId,
} from '@/data/countryAssessment';
import { DIMENSION_WEIGHT_SUM, HARD_GATES, PROFILES, DIMENSIONS, COUNTRIES } from '@/data/countryAssessment';

import { CountriesStep, type CountryRowValue } from './countryAssessment/CountriesStep';
import { EvidenceStep } from './countryAssessment/EvidenceStep';
import { ModelStep } from './countryAssessment/ModelStep';
import { ProfileStep, type ProfileFormValue } from './countryAssessment/ProfileStep';
import SampleReport from './countryAssessment/SampleReport';
import { ResultStep } from './countryAssessment/ResultStep';

type StepId = 'intro' | 'profile' | 'countries' | 'model' | 'evidence' | 'result';

const STEPS: Array<{ id: StepId; labelKey: string; fallback: string }> = [
  { id: 'intro', labelKey: 'intro', fallback: '体系说明' },
  { id: 'profile', labelKey: 'countryAssessment.stepProfile', fallback: '企业与产品' },
  { id: 'countries', labelKey: 'countryAssessment.stepCountries', fallback: '候选国家' },
  { id: 'model', labelKey: 'countryAssessment.stepModel', fallback: '权重与门槛' },
  { id: 'evidence', labelKey: 'countryAssessment.stepEvidence', fallback: '评分与证据' },
  { id: 'result', labelKey: 'countryAssessment.stepResult', fallback: '结果读数' },
];

const DIMENSION_COLORS: Record<string, string> = {
  fit: '#6366f1',
  demand: '#f97316',
  access: '#10b981',
  competition: '#f59e0b',
  regulation: '#ef4444',
  macro: '#8b5cf6',
  economics: '#06b6d4',
  operations: '#84cc16',
  talent: '#ec4899',
  tax: '#14b8a6',
  esg: '#a855f7',
};

function makeDefaultReadiness(): ProfileFormValue['readinessScores'] {
  return {
    offer: 3,
    gtm: 3,
    compliance: 3,
    delivery: 3,
    organization: 3,
    capital: 3,
  };
}

const GATE_DESCRIPTIONS: Record<string, { zh: string; en: string }> = {
  product_registration: {
    zh: '药品/保健品在当地监管机构的注册状态或注册可行性',
    en: 'Product registration status or feasibility in local regulatory body'
  },
  market_demand: {
    zh: '目标市场规模足以支撑商业化运营',
    en: 'Market size sufficient to support commercial operations'
  },
  ip_protection: {
    zh: '知识产权保护体系健全，配方泄露风险可控',
    en: 'IP protection system robust, formula leakage risk manageable'
  },
  channel_access: {
    zh: '存在可触达的分销渠道（线上/线下）',
    en: 'Accessible distribution channels exist (online/offline)'
  },
  talent_availability: {
    zh: '可招聘到运营所需的本地或国际人才',
    en: 'Able to recruit local or international talent for operations'
  },
  financial_feasibility: {
    zh: '企业资金实力可支撑市场进入所需投资',
    en: 'Financial capacity can support required market entry investment'
  },
};

export default function CountryAssessmentHub() {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  useEffect(() => {
    document.title = t('countryAssessment.pageTitle', '出海目标国家评估 · 岐黄四海');
  }, [t]);
  const [step, setStep] = useState<StepId>('intro');
  const [showSampleReport, setShowSampleReport] = useState(true);
  const [profile, setProfile] = useState<ProfileFormValue>({
    companyName: '',
    industry: '',
    productSummary: '',
    stage: '',
    budget: '',
    window: '',
    risk: '',
    readinessScores: makeDefaultReadiness(),
  });
  const [countries, setCountries] = useState<CountryRowValue[]>([]);
  const [profileId, setProfileId] = useState<ProfileId>('general');
  const [weights, setWeights] = useState<Record<DimensionId, number>>({ ...PROFILES.general.weights });
  const [gateConfig, setGateConfig] = useState<Record<GateId, 'required' | 'optional' | 'ignored'>>(
    HARD_GATES.reduce((acc, gate) => {
      acc[gate.id] = 'required';
      return acc;
    }, {} as Record<GateId, 'required' | 'optional' | 'ignored'>),
  );

  const requiredGateIds: GateId[] = useMemo(
    () =>
      (Object.keys(gateConfig) as GateId[]).filter(
        (id) => gateConfig[id] === 'required',
      ),
    [gateConfig],
  );

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const validation = useStepValidation({
    step,
    profile,
    countries,
    weights,
  });

  const goNext = () => {
    if (!validation.canProceed && step !== 'intro') return;
    const nextStep = STEPS[stepIndex + 1]?.id;
    if (nextStep) {
      tracking.toolInteraction('country_assessment', 'step_complete', {
        step,
        nextStep,
      });
      setShowSampleReport(false);
      setStep(nextStep);
    }
  };

  const goBack = () => {
    const prevStep = STEPS[stepIndex - 1]?.id;
    if (prevStep) setStep(prevStep);
  };

  const reset = () => {
    setProfile({
      companyName: '',
      industry: '',
      productSummary: '',
      stage: '',
      budget: '',
      window: '',
      risk: '',
      readinessScores: makeDefaultReadiness(),
    });
    setCountries([]);
    setProfileId('general');
    setWeights({ ...PROFILES.general.weights });
    setGateConfig(
      HARD_GATES.reduce((acc, gate) => {
        acc[gate.id] = 'required';
        return acc;
      }, {} as Record<GateId, 'required' | 'optional' | 'ignored'>),
    );
    setStep('intro');
    tracking.toolInteraction('country_assessment', 'reset', {});
  };

  const skipToStep = (targetStep: StepId) => {
    setShowSampleReport(false);
    setStep(targetStep);
  };

  return (
    <div className="min-h-screen bg-[#07111a] pb-24">
      {/* Hero Section - 增强专业性与权威感 */}
      {step === 'intro' && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-indigo-600/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[200px]" />
          </div>
          
          <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-16">
            {/* Authority Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-5 py-2 text-sm text-indigo-200 mb-8">
                <Compass className="h-4 w-4" />
                {isZh ? '出海战略决策基础设施' : 'Global Expansion Decision Infrastructure'}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {isZh ? (
                  <>
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                      出海目标国家
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                      智能评估系统
                    </span>
                  </>
                ) : (
                  <>
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                      Smart Country
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                      Assessment System
                    </span>
                  </>
                )}
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                {isZh 
                  ? '基于岐黄四海自主研发的 11 维评估模型，整合全球 12+ 主流市场的准入数据、竞争情报与成本基准，为企业提供系统化、可量化的市场进入可行性判断'
                  : "Based on Qihuang Sihai's proprietary 11-dimension assessment model, integrating market access data, competitive intelligence, and cost benchmarks from 12+ major global markets"
                }
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-14">
              {[
                { icon: Shield, text: isZh ? '数据本地处理' : 'Local Processing', desc: isZh ? '隐私零风险·合规无忧' : 'Zero Privacy Risk·Compliant' },
                { icon: Award, text: isZh ? '11 维度体系' : '11 Dimensions', desc: isZh ? '系统性评估框架' : 'Systematic Framework' },
                { icon: Clock, text: isZh ? '3 分钟完成' : '3 Minutes', desc: isZh ? '高效决策支持' : 'Efficient Decision Support' },
                { icon: Star, text: isZh ? '7 套模板' : '7 Templates', desc: isZh ? '行业深度适配' : 'Industry-Adaptive' },
              ].map((badge) => (
                <div
                  key={badge.text}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-sm"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderColor: 'rgba(255,255,255,0.12)'
                  }}
                >
                  <badge.icon className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-white text-sm font-medium">{badge.text}</div>
                    <div className="text-slate-400 text-xs">{badge.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
              {[
                { label: isZh ? '评估维度' : 'Dimensions', value: '11', sub: isZh ? '核心变量' : 'Core Variables', color: '#6366f1' },
                { label: isZh ? '行业模板' : 'Templates', value: '7', sub: isZh ? '垂直场景' : 'Vertical Scenarios', color: '#f97316' },
                { label: isZh ? '硬门槛' : 'Hard Gates', value: '6', sub: isZh ? '否决机制' : 'Veto Mechanisms', color: '#ef4444' },
                { label: isZh ? '支持国家' : 'Countries', value: COUNTRIES.length.toString(), sub: isZh ? '目标市场' : 'Target Markets', color: '#8b5cf6' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 rounded-2xl border text-center backdrop-blur-sm"
                  style={{ borderColor: `${stat.color}40`, backgroundColor: `${stat.color}08` }}
                >
                  <div className="text-5xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-base font-medium mb-1" style={{ color: stat.color }}>{stat.label}</div>
                  <div className="text-xs text-slate-500">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Methodology Deep Dive */}
            <div className="mb-12 p-8 rounded-3xl border" style={{ backgroundColor: 'rgba(30,41,59,0.4)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(99,102,241,0.2)' }}>
                  <Lightbulb className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{isZh ? '评估方法论' : 'Assessment Methodology'}</h3>
                  <p className="text-sm text-slate-400">{isZh ? '基于多源数据与行业专家经验的量化评估框架' : 'Quantitative framework based on multi-source data and expert insights'}</p>
                </div>
              </div>
              
              {/* Process Flow */}
              <div className="mb-10">
                <h4 className="text-sm font-medium text-slate-300 mb-5 uppercase tracking-wider">
                  {isZh ? '评估流程' : 'Assessment Process'}
                </h4>
                <div className="flex flex-wrap justify-center items-center gap-3">
                  {[
                    { step: 1, label: isZh ? '企业画像' : 'Profile', icon: Users, desc: isZh ? '产品与能力' : 'Products & Capabilities' },
                    { step: 2, label: isZh ? '行业匹配' : 'Industry', icon: Target, desc: isZh ? '场景适配' : 'Scenario Match' },
                    { step: 3, label: isZh ? '候选国家' : 'Countries', icon: Globe, desc: isZh ? '市场选择' : 'Market Selection' },
                    { step: 4, label: isZh ? '硬门槛' : 'Gates', icon: Shield, desc: isZh ? '合规筛选' : 'Compliance Filter' },
                    { step: 5, label: isZh ? '评分' : 'Scoring', icon: Award, desc: isZh ? '多维评估' : 'Multi-Dim Eval' },
                    { step: 6, label: isZh ? '决策' : 'Decision', icon: CheckCircle2, desc: isZh ? '策略建议' : 'Strategy Advice' },
                  ].map((item, i) => (
                    <div key={item.step} className="flex items-center">
                      <div className="flex flex-col items-center p-3 rounded-xl border" 
                        style={{ 
                          backgroundColor: 'rgba(99,102,241,0.1)', 
                          borderColor: 'rgba(99,102,241,0.25)'
                        }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" 
                          style={{ backgroundColor: 'rgba(99,102,241,0.2)' }}>
                          <item.icon className="w-5 h-5 text-indigo-300" />
                        </div>
                        <div className="text-white text-xs font-semibold">{item.label}</div>
                        <div className="text-slate-500 text-[10px]">{item.desc}</div>
                      </div>
                      {i < 5 && <ChevronRight className="w-5 h-5 text-slate-500 mx-1" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* 11 Dimensions - 详细网格展示 */}
              <div className="mb-10">
                <h4 className="text-sm font-medium text-slate-300 mb-5 uppercase tracking-wider">
                  {isZh ? '11 个核心评估维度' : '11 Core Assessment Dimensions'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    { id: 'fit', name: '产品适配', nameEn: 'Product Fit', desc: isZh ? '与当地市场需求的文化与功能匹配度' : 'Cultural and functional alignment with local market needs' },
                    { id: 'demand', name: '市场需求', nameEn: 'Market Demand', desc: isZh ? '目标市场对中医药/汉方的认知与需求规模' : 'Market size and demand for TCM/Hanfang products' },
                    { id: 'access', name: '市场准入', nameEn: 'Market Access', desc: isZh ? '药品/保健品准入门槛与注册流程复杂度' : 'Regulatory pathways and registration complexity' },
                    { id: 'competition', name: '竞争格局', nameEn: 'Competition', desc: isZh ? '现有竞争者数量、市场集中度与品牌壁垒' : 'Competitor landscape, market concentration, brand barriers' },
                    { id: 'regulation', name: '监管环境', nameEn: 'Regulation', desc: isZh ? '法规完善度、执法力度与合规成本' : 'Regulatory completeness, enforcement, compliance costs' },
                    { id: 'macro', name: '宏观环境', nameEn: 'Macro', desc: isZh ? '经济增长、汇率稳定与政策连续性' : 'GDP growth, currency stability, policy continuity' },
                    { id: 'economics', name: '经济成本', nameEn: 'Economics', desc: isZh ? '运营成本、定价空间与投资回报周期' : 'Operating costs, pricing power, ROI timeline' },
                    { id: 'operations', name: '运营难度', nameEn: 'Operations', desc: isZh ? '供应链构建、本地团队组建与渠道铺设' : 'Supply chain, local team building, channel development' },
                    { id: 'talent', name: '人才供给', nameEn: 'Talent', desc: isZh ? '中医药专业人才、中医诊所与渠道人才可用性' : 'Availability of TCM professionals and channel talent' },
                    { id: 'tax', name: '税务负担', nameEn: 'Tax', desc: isZh ? '企业所得税、增值税与关税综合税负' : 'Combined tax burden including CIT, VAT, and tariffs' },
                    { id: 'esg', name: 'ESG 风险', nameEn: 'ESG Risk', desc: isZh ? '环境标准、劳工法规与商业伦理要求' : 'Environmental standards, labor laws, business ethics' },
                  ].map((dim) => (
                    <div
                      key={dim.id}
                      className="p-4 rounded-xl border"
                      style={{ 
                        backgroundColor: `${DIMENSION_COLORS[dim.id]}08`,
                        borderColor: `${DIMENSION_COLORS[dim.id]}30`
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                        style={{ backgroundColor: `${DIMENSION_COLORS[dim.id]}15` }}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DIMENSION_COLORS[dim.id] }} />
                      </div>
                      <div className="text-sm font-semibold text-center mb-1" style={{ color: DIMENSION_COLORS[dim.id] }}>{dim.name}</div>
                      <div className="text-xs text-slate-400 text-center mb-2">{dim.nameEn}</div>
                      <div className="text-xs text-slate-500 text-center leading-relaxed">{dim.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hard Gates - 详细说明 */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <h4 className="text-sm font-semibold text-red-300 mb-4 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {isZh ? '6 项硬门槛 - 任一不满足则一票否决' : '6 Hard Gates - Absolute Veto if Failed'}
                </h4>
                <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                  {isZh 
                    ? '硬门槛是进入特定市场的绝对前提条件。系统会自动检测以下六项关键指标，任一项未达标即不建议进入该市场。'
                    : 'Hard gates are absolute prerequisites for market entry. The system automatically checks these 6 key indicators. Failure of any single gate results in a veto recommendation.'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {HARD_GATES.map((gate) => {
                    const desc = GATE_DESCRIPTIONS[gate.id] || { zh: gate.name, en: gate.name };
                    return (
                      <div key={gate.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-white">{gate.name}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {isZh ? desc.zh : desc.en}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Decision Framework - 详细决策矩阵 */}
            <div className="mb-12 p-8 rounded-3xl border" style={{ backgroundColor: 'rgba(30,41,59,0.4)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16,185,129,0.2)' }}>
                  <Target className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{isZh ? '决策标准体系' : 'Decision Criteria System'}</h3>
                  <p className="text-sm text-slate-400">{isZh ? '综合评分与准备度匹配的多级决策建议' : 'Multi-level decision recommendations based on score-readiness matching'}</p>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                {isZh 
                  ? '评估结果由两部分组成：市场综合评分（0-100）与企业准备度评分（0-100）。系统将两者结合，生成以下四级决策建议：'
                  : 'Assessment results consist of two components: Market Composite Score (0-100) and Company Readiness Score (0-100). The system combines both to generate four levels of decision recommendations:'}
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { 
                    score: '≥ 75', 
                    rec: isZh ? 'A级：规模化进入' : 'Grade A: Scale Entry', 
                    color: '#10b981', 
                    icon: Globe,
                    action: isZh ? '全力投入目标市场' : 'Full market entry',
                    requirements: isZh ? '推荐配置：全套本地化运营、专属市场团队、全面合规投入' : 'Recommended: Full localization, dedicated team, comprehensive compliance investment',
                    timeline: isZh ? '建议周期：6-18个月完成全面进入' : 'Timeline: 6-18 months for full market entry'
                  },
                  { 
                    score: '68-74', 
                    rec: isZh ? 'B级：验证性试点' : 'Grade B: Pilot Test', 
                    color: '#3b82f6', 
                    icon: Target,
                    action: isZh ? '建立滩头阵地' : 'Establish beachhead',
                    requirements: isZh ? '推荐配置：轻量级试点、聚焦单一渠道、最小合规投入' : 'Recommended: Lightweight pilot, focus on single channel, minimal compliance investment',
                    timeline: isZh ? '建议周期：3-6个月完成试点验证' : 'Timeline: 3-6 months for pilot validation'
                  },
                  { 
                    score: '55-67', 
                    rec: isZh ? 'C级：轻资产期权' : 'Grade C: Light Asset', 
                    color: '#8b5cf6', 
                    icon: Clock,
                    action: isZh ? '观望等待时机' : 'Monitor and wait',
                    requirements: isZh ? '推荐配置：战略观望、保持存在感、必要时快速切入' : 'Recommended: Strategic monitoring, maintain presence, quick entry if opportunity arises',
                    timeline: isZh ? '建议周期：6-12个月持续关注' : 'Timeline: 6-12 months of continued monitoring'
                  },
                  { 
                    score: '< 55', 
                    rec: isZh ? 'D级：暂不推荐' : 'Grade D: Not Recommended', 
                    color: '#ef4444', 
                    icon: XCircle,
                    action: isZh ? '建议暂缓或转向' : 'Defer or redirect',
                    requirements: isZh ? '推荐配置：重新评估产品定位、等待市场成熟、寻找替代市场' : 'Recommended: Reassess product positioning, wait for market maturity, find alternative markets',
                    timeline: isZh ? '建议周期：12个月后重新评估' : 'Timeline: Re-evaluate in 12 months'
                  },
                ].map((item) => (
                  <div key={item.score} className="p-5 rounded-xl border" style={{ borderColor: `${item.color}35`, backgroundColor: `${item.color}05` }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                        <item.icon className="w-6 h-6" style={{ color: item.color }} />
                      </div>
                      <div>
                        <div className="px-3 py-1 rounded text-sm font-bold inline-block" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                          {item.score}
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-white mb-2" style={{ color: item.color }}>{item.rec}</h4>
                    <p className="text-sm text-slate-400 mb-3 leading-relaxed">{item.action}</p>
                    <div className="mb-2">
                      <div className="text-xs text-blue-300 font-medium mb-1">{isZh ? '资源配置' : 'Resource Allocation'}</div>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.requirements}</p>
                    </div>
                    <div className="pt-3 border-t" style={{ borderColor: `${item.color}20` }}>
                      <div className="text-xs text-slate-500">{item.timeline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources Section */}
            <div className="mb-12 p-8 rounded-3xl border" style={{ backgroundColor: 'rgba(30,41,59,0.4)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.2)' }}>
                  <Database className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{isZh ? '数据来源与可信度' : 'Data Sources & Reliability'}</h3>
                  <p className="text-sm text-slate-400">{isZh ? '多源交叉验证，确保评估数据准确可靠' : 'Multi-source cross-validation ensures accurate and reliable assessment data'}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { 
                    title: isZh ? '官方监管数据' : 'Official Regulatory Data',
                    items: isZh 
                      ? ['各国药监局/卫生部官方公告', '药品注册数据库与审批记录', 'GMP认证与检查报告', '不良反应监测数据']
                      : ['Official announcements from national drug authorities', 'Drug registration databases and approval records', 'GMP certification and inspection reports', 'Adverse reaction monitoring data'],
                    color: '#6366f1'
                  },
                  { 
                    title: isZh ? '市场研究报告' : 'Market Research Reports',
                    items: isZh 
                      ? ['Euromonitor、GfK 等机构报告', '中医药行业白皮书', '跨境电商平台数据', '消费者调研与访谈']
                      : ['Reports from Euromonitor, GfK and similar', 'TCM industry whitepapers', 'Cross-border e-commerce platform data', 'Consumer surveys and interviews'],
                    color: '#f97316'
                  },
                  { 
                    title: isZh ? '实地调研数据' : 'Field Research Data',
                    items: isZh 
                      ? ['岐黄四海海外实地考察', '合作企业的实际运营数据', '行业协会的一手信息', '跨境合规专家访谈']
                      : ['Qihuang Sihai overseas field research', 'Actual operational data from partner companies', 'First-hand information from industry associations', 'Expert interviews with cross-border compliance specialists'],
                    color: '#10b981'
                  },
                ].map((source) => (
                  <div key={source.title} className="p-4 rounded-xl border" style={{ borderColor: `${source.color}30`, backgroundColor: `${source.color}08` }}>
                    <h4 className="font-medium text-white mb-3" style={{ color: source.color }}>{source.title}</h4>
                    <ul className="space-y-2">
                      {source.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                          <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: source.color }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-amber-300 mb-1">{isZh ? '数据更新机制' : 'Data Update Mechanism'}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isZh 
                        ? '基础数据库每季度更新一次，重大法规变化会在30天内同步更新。企业用户可通过提交反馈帮助我们持续完善数据准确性。'
                        : 'Base databases are updated quarterly; major regulatory changes are synchronized within 30 days. Enterprise users can help improve data accuracy by submitting feedback.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Industry Templates Section */}
            <div className="mb-12 p-8 rounded-3xl border" style={{ backgroundColor: 'rgba(30,41,59,0.4)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(249,115,22,0.2)' }}>
                  <BarChart3 className="w-5 h-5 text-orange-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{isZh ? '7 套行业适配模板' : '7 Industry-Adaptive Templates'}</h3>
                  <p className="text-sm text-slate-400">{isZh ? '针对不同产品类型与商业模式，智能调整评估权重' : 'Intelligently adjust assessment weights for different product types and business models'}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[
                  { name: isZh ? '中成药出口' : 'Patent TCM Export', weight: isZh ? '监管权重 +30%' : 'Regulation +30%', desc: isZh ? '注重药品注册与临床数据' : 'Focus on drug registration and clinical data' },
                  { name: isZh ? '中药材贸易' : 'TCM Bulk Trade', weight: isZh ? '供应链权重 +25%' : 'Supply Chain +25%', desc: isZh ? '侧重质量标准与贸易便利化' : 'Focus on quality standards and trade facilitation' },
                  { name: isZh ? '中医服务出海' : 'TCM Service Export', weight: isZh ? '人才权重 +30%' : 'Talent +30%', desc: isZh ? '聚焦医疗资质与人才供给' : 'Focus on medical qualifications and talent supply' },
                  { name: isZh ? '保健品/食品' : 'Health Supplements', weight: isZh ? '需求权重 +25%' : 'Demand +25%', desc: isZh ? '侧重消费认知与渠道覆盖' : 'Focus on consumer awareness and channel coverage' },
                  { name: isZh ? '中医教育' : 'TCM Education', weight: isZh ? '运营难度 +20%' : 'Operations +20%', desc: isZh ? '关注合作机构与法规限制' : 'Focus on partnership institutions and regulations' },
                  { name: isZh ? '汉方成药' : 'Kampo Products', weight: isZh ? '竞争格局 +25%' : 'Competition +25%', desc: isZh ? '专注差异化竞争与品牌建设' : 'Focus on differentiation and brand building' },
                  { name: isZh ? '综合型平台' : 'Integrated Platform', weight: isZh ? '均衡权重' : 'Balanced Weights', desc: isZh ? '适用于多元化业务布局' : 'Suitable for diversified business layout' },
                ].map((template) => (
                  <div key={template.name} className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-orange-400/30 transition-colors">
                    <h4 className="font-medium text-white mb-1">{template.name}</h4>
                    <div className="text-xs text-orange-300 mb-2">{template.weight}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{template.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Authority Section */}
            <div className="mb-12 p-8 rounded-3xl border" style={{ backgroundColor: 'rgba(30,41,59,0.3)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                {isZh ? '为什么选择我们的评估系统' : 'Why Choose Our Assessment System'}
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(99,102,241,0.15)' }}>
                    <Database className="w-7 h-7 text-indigo-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">{isZh ? '多源数据整合' : 'Multi-Source Data Integration'}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed mb-2">{isZh 
                      ? '整合各国监管数据库、行业报告、成本调研与专家访谈，确保评估依据的全面性与时效性。我们的数据来源包括各国药监局官方数据、Euromonitor等权威市场研究机构报告、岐黄四海海外实地考察数据。'
                      : 'Integrated regulatory databases, industry reports, cost surveys and expert interviews ensure comprehensive and up-to-date assessment basis.'}
                    </p>
                    <p className="text-xs text-emerald-400">{isZh ? '✓ 数据经过交叉验证，可追溯来源' : '✓ Data cross-validated with traceable sources'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                    <Shield className="w-7 h-7 text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">{isZh ? '行业专家校验' : 'Expert Validated'}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed mb-2">{isZh 
                      ? '评估模型经过多位具有实际出海经验的中医、汉方品牌创始人及合规专家校验。每一套行业模板都经过至少3位行业资深人士的审核与优化，确保权重设置符合行业实际。'
                      : 'Assessment model validated by TCM practitioners, Hanfang brand founders, and compliance experts with real global expansion experience.'}
                    </p>
                    <p className="text-xs text-emerald-400">{isZh ? '✓ 模型定期由外部专家委员会评审' : '✓ Model regularly reviewed by external expert committee'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(249,115,22,0.15)' }}>
                    <Target className="w-7 h-7 text-orange-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">{isZh ? '量化决策支持' : 'Quantified Decision Support'}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed mb-2">{isZh 
                      ? '将复杂的多维评估转化为直观的综合评分，消除主观偏见，支撑数据驱动的出海决策。企业可以清晰了解每个市场的优势、劣势与关键风险点，制定更具针对性的市场进入策略。'
                      : "Transform complex multi-dimensional evaluation into intuitive composite scores, eliminating subjective bias and supporting data-driven decisions."}
                    </p>
                    <p className="text-xs text-emerald-400">{isZh ? '✓ 可导出PDF报告用于内部决策审批' : '✓ PDF report exportable for internal decision approval'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(139,92,246,0.15)' }}>
                    <Lock className="w-7 h-7 text-purple-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">{isZh ? '隐私安全优先' : 'Privacy First'}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed mb-2">{isZh 
                      ? '所有数据在本地处理，不上传服务器，确保企业商业机密与产品配方信息安全。评估过程完全在浏览器端完成，数据不会经过任何第三方服务器，真正做到「您的数据您做主」。'
                      : 'All data processed locally, no server upload, ensuring business confidentiality and product formula security.'}
                    </p>
                    <p className="text-xs text-emerald-400">{isZh ? '✓ 符合GDPR与各国数据保护法规' : '✓ Compliant with GDPR and global data protection regulations'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={() => skipToStep('profile')}
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 px-12 py-5 text-xl font-bold text-slate-950 transition hover:from-emerald-300 hover:to-teal-300 hover:scale-105 shadow-xl shadow-emerald-500/25"
              >
                {isZh ? '开始免费评估' : 'Start Free Assessment'}
                <ArrowRight className="w-6 h-6" />
              </button>
              <p className="text-sm text-slate-500 mt-5 flex items-center justify-center gap-6">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  {isZh ? '无需注册·完全免费' : 'No registration·Completely free'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  {isZh ? '隐私保护·数据本地' : 'Privacy protected·Local processing'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {isZh ? '3分钟完成' : '3 min to complete'}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header (when not on intro) */}
      {step !== 'intro' && (
        <div className="mx-auto max-w-6xl px-6 pt-12 text-slate-100">
          <header className="space-y-3 mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep('intro')}
                className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-indigo-300 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                {isZh ? '返回概述' : 'Back to Overview'}
              </button>
              <span className="text-slate-600">/</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                <Compass className="h-3.5 w-3.5" />
                {t('countryAssessment.kicker', '出海决策工具')}
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-white md:text-4xl">
              {step === 'profile' && (isZh ? '企业与产品画像' : 'Company & Product Profile')}
              {step === 'countries' && (isZh ? '选择候选国家' : 'Select Candidate Countries')}
              {step === 'model' && (isZh ? '权重与门槛设置' : 'Weights & Gates')}
              {step === 'evidence' && (isZh ? '评分与证据' : 'Scoring & Evidence')}
              {step === 'result' && (isZh ? '评估结果' : 'Assessment Results')}
            </h1>
          </header>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6 text-slate-100">
        {/* Step Navigation */}
        {step !== 'intro' && (
          <nav
            aria-label={t('countryAssessment.stepNav', '评估步骤')}
            className="grid gap-2 md:grid-cols-5"
          >
            {STEPS.slice(1).map((item, idx) => {
              const stepId = item.id as Exclude<StepId, 'intro'>;
              const isActive = step === stepId;
              const stepIdx = idx + 1;
              const currentIdx = STEPS.findIndex((s) => s.id === step);
              const isComplete = stepIdx < currentIdx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (stepIdx <= currentIdx) {
                      setShowSampleReport(false);
                      setStep(stepId);
                    }
                  }}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    isActive
                      ? 'border-emerald-400/60 bg-emerald-400/10 text-white'
                      : isComplete
                        ? 'border-white/[0.18] bg-white/[0.04] text-slate-200'
                        : 'border-white/[0.06] bg-white/[0.02] text-slate-400'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300/80">
                    {t('countryAssessment.stepNumber', '步骤 {{count}}', { count: stepIdx })}
                  </div>
                  <div className="mt-1 font-medium">{t(item.labelKey, item.fallback)}</div>
                </button>
              );
            })}
          </nav>
        )}

        {/* Step Content */}
        <div className="mt-8 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-10">
          {step === 'profile' && showSampleReport ? (
            <SampleReport onDismiss={() => setShowSampleReport(false)} />
          ) : null}
          {step === 'profile' ? (
            <ProfileStep value={profile} onChange={setProfile} />
          ) : null}
          {step === 'countries' ? (
            <CountriesStep rows={countries} onChange={setCountries} />
          ) : null}
          {step === 'model' ? (
            <ModelStep
              profileId={profileId}
              weights={weights}
              gates={gateConfig}
              onProfileChange={setProfileId}
              onWeightsChange={setWeights}
              onGatesChange={setGateConfig}
            />
          ) : null}
          {step === 'evidence' ? (
            <EvidenceStep
              rows={countries}
              onChange={setCountries}
              requiredGateIds={requiredGateIds}
            />
          ) : null}
          {step === 'result' ? (
            <ResultStep
              profile={profile}
              profileId={profileId}
              rows={countries}
              weights={weights}
              requiredGateIds={requiredGateIds}
              customDimensionWeights={weights}
              onRestart={reset}
            />
          ) : null}
        </div>

        {/* Step Footer */}
        {step !== 'intro' && (
          <StepFooter
            step={step}
            stepIndex={stepIndex - 1}
            validation={validation}
            onBack={goBack}
            onNext={goNext}
          />
        )}
      </div>
    </div>
  );
}

function StepFooter({
  step,
  stepIndex,
  validation,
  onBack,
  onNext,
}: {
  step: StepId;
  stepIndex: number;
  validation: { canProceed: boolean; reason: string };
  onBack: () => void;
  onNext: () => void;
}) {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const isIntro = step === 'intro';
  const isResult = step === 'result';
  
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
      <button
        type="button"
        onClick={onBack}
        disabled={stepIndex === 0 || isIntro}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition disabled:opacity-40 hover:border-emerald-400/40 hover:text-emerald-200"
      >
        <ChevronLeft className="h-4 w-4" />
        {isZh ? '上一步' : 'Back'}
      </button>

      {isIntro ? (
        <div className="text-xs text-slate-500">
          {isZh ? '基于系统化评估框架构建' : 'Built on systematic assessment framework'}
        </div>
      ) : isResult ? (
        <div className="text-xs text-slate-500">
          {t('countryAssessment.footerResult', '以上为本地规则引擎计算结果；提交后系统会将配置发送到后端跟进。')}
        </div>
      ) : (
        <div className="text-xs text-slate-400">
          {!validation.canProceed ? validation.reason : ''}
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={(!validation.canProceed && !isIntro) || isResult}
        className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isIntro ? (isZh ? '开始评估' : 'Start Assessment') : (isZh ? '下一步' : 'Next')}
        {!isIntro && <ChevronRight className="h-4 w-4" />}
        {isIntro && <ArrowRight className="h-4 w-4" />}
      </button>
    </div>
  );
}

interface StepValidation {
  canProceed: boolean;
  reason: string;
}

function useStepValidation({
  step,
  profile,
  countries,
  weights,
}: {
  step: StepId;
  profile: ProfileFormValue;
  countries: CountryRowValue[];
  weights: Record<DimensionId, number>;
}): StepValidation {
  const { t } = useTranslation();
  if (step === 'intro') {
    return { canProceed: true, reason: '' };
  }
  if (step === 'profile') {
    const blocked: string[] = [];
    if (!profile.industry) blocked.push(t('countryAssessment.needIndustry', '行业'));
    if (!profile.stage) blocked.push(t('countryAssessment.needStage', '出海阶段'));
    if (!profile.budget) blocked.push(t('countryAssessment.needBudget', '总预算'));
    if (!profile.risk) blocked.push(t('countryAssessment.needRisk', '风险偏好'));
    if (profile.productSummary.trim().length < 10) {
      blocked.push(t('countryAssessment.needProduct', '产品描述（≥ 10 字）'));
    }
    if (blocked.length > 0) {
      return {
        canProceed: false,
        reason:
          blocked.length === 0
            ? ''
            : t('countryAssessment.needFields', '请补全：{{fields}}', {
                fields: blocked.join('、'),
              }),
      };
    }
    return { canProceed: true, reason: '' };
  }
  if (step === 'countries') {
    if (countries.length === 0) {
      return {
        canProceed: false,
        reason: t('countryAssessment.needCountry', '请至少选择 1 个候选国家'),
      };
    }
    return { canProceed: true, reason: '' };
  }
  if (step === 'model') {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    if (Math.round(total * 100) / 100 !== DIMENSION_WEIGHT_SUM) {
      return {
        canProceed: false,
        reason: t('countryAssessment.weightSumHint', '权重合计需等于 100%'),
      };
    }
    return { canProceed: true, reason: '' };
  }
  if (step === 'evidence') {
    if (countries.length === 0) {
      return {
        canProceed: false,
        reason: t('countryAssessment.needCountry', '请至少选择 1 个候选国家'),
      };
    }
    return { canProceed: true, reason: '' };
  }
  return { canProceed: true, reason: '' };
}
