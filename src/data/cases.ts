/**
 * 案例库数据
 * 
 * 集中管理所有案例数据，供 CaseStudies.tsx 和 CaseDetailPage.tsx 共用
 */

export interface CaseMetric {
  label: string;
  labelEn: string;
  value: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  company: string;
  companyEn: string;
  industry: string;
  industryEn: string;
  industryCategory: string;
  decisionType: 'market' | 'compliance' | 'channel' | 'resource';
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
  metrics: CaseMetric[];
  // 详细页专用
  duration?: string;
  durationEn?: string;
  investment?: string;
  investmentEn?: string;
  keyLesson?: string;
  keyLessonEn?: string;
}

export const CASES: CaseStudy[] = [
  {
    id: 'case1',
    slug: 'southeast-asia-three-country-entry',
    company: '某百年制药企业',
    companyEn: 'A Century-Old Pharmaceutical Co.',
    industry: '中成药',
    industryEn: 'Chinese Patent Medicine',
    industryCategory: 'tcm',
    decisionType: 'compliance',
    flag: '🇸🇬',
    markets: ['新加坡', '马来西亚', '泰国'],
    marketsEn: ['Singapore', 'Malaysia', 'Thailand'],
    challenge: '对东南亚市场法规不了解，担心产品合规问题',
    challengeEn: 'Unfamiliar with SE Asian regulations',
    solution: '通过风险评估确定优先市场，完成新加坡 HAS 认证后复制到马来西亚和泰国',
    solutionEn: 'Prioritized markets through risk assessment, then used Singapore HAS certification as the wedge into Malaysia and Thailand',
    result: '6个月完成3国准入，首年海外收入突破500万',
    resultEn: 'Completed 3-country entry in 6 months, with first-year overseas revenue above RMB 5M',
    insight: '先拿法规最清晰的小市场做样板，再复制到区域市场。',
    insightEn: 'Use the clearest regulatory market as the first proof point, then replicate regionally.',
    keyLesson: '新加坡是东南亚最佳跳板市场——法规清晰、认证认可度高、进入后可在东南亚快速复制。',
    keyLessonEn: 'Singapore is the best Southeast Asia gateway — clear regulations, high certification recognition, and easy to replicate across the region after entry.',
    metrics: [
      { label: '进入时间', labelEn: 'Entry Time', value: '6个月' },
      { label: '覆盖国家', labelEn: 'Countries', value: '3个' },
      { label: '首年收入', labelEn: 'Revenue', value: '500万+' },
    ],
    duration: '6 个月',
    durationEn: '6 months',
    investment: '¥80-120 万',
    investmentEn: '¥800K-1.2M',
  },
  {
    id: 'case2',
    slug: 'australia-tga-supplement-entry',
    company: '某中药饮片企业',
    companyEn: 'A TCM Decoction Company',
    industry: '中药饮片',
    industryEn: 'TCM Decoction Pieces',
    industryCategory: 'tcm',
    decisionType: 'compliance',
    flag: '🇦🇺',
    markets: ['澳大利亚', '新西兰'],
    marketsEn: ['Australia', 'New Zealand'],
    challenge: '产品定位不清晰，不确定以食品还是药品形式进入',
    challengeEn: 'Unclear product positioning',
    solution: '通过 TGA 咨询确定以补充药品形式进入，并搭配本地专业渠道',
    solutionEn: 'Used TGA pathway analysis to position the product as complementary medicine and pair it with local professional channels',
    result: '获得 TGA 登记号，进入澳洲主流连锁药店',
    resultEn: 'Obtained TGA registration and entered major Australian pharmacy chains',
    insight: '品类定位本身就是路径设计，错一步会拖慢整个项目。',
    insightEn: 'Product classification is itself pathway design; a wrong choice can slow the entire project.',
    keyLesson: '澳洲 TGA 认证路径选择决定了渠道可进入性——补充药品(Complementary Medicine)路径最优，兼顾合规与渠道可及性。',
    keyLessonEn: 'TGA pathway choice determines channel accessibility — Complementary Medicine route is optimal, balancing compliance and channel reach.',
    metrics: [
      { label: '认证时间', labelEn: 'Certification', value: '9个月' },
      { label: '合作连锁', labelEn: 'Chains', value: '5家' },
      { label: '市场占有率', labelEn: 'Market Share', value: '15%' },
    ],
    duration: '9 个月',
    durationEn: '9 months',
    investment: '¥150-200 万',
    investmentEn: '¥1.5M-2M',
  },
  {
    id: 'case3',
    slug: 'eu-supplement-thr-preparation',
    company: '某保健品集团',
    companyEn: 'A Health Supplements Group',
    industry: '保健食品',
    industryEn: 'Health Supplements',
    industryCategory: 'supplement',
    decisionType: 'channel',
    flag: '🇩🇪',
    markets: ['德国', '法国', '荷兰'],
    marketsEn: ['Germany', 'France', 'Netherlands'],
    challenge: '欧盟传统草药注册门槛高，周期长',
    challengeEn: 'High EU traditional herbal registration barriers',
    solution: '先按食品补充剂进入，同时为 THR 做中长期准备',
    solutionEn: 'Entered first through the supplement category while preparing a longer-term THR route',
    result: '食品补充剂渠道月销10万欧元，并为 THR 积累基础数据',
    resultEn: 'Reached EUR 100K monthly sales in the supplement channel while building a base for THR',
    insight: '先找能跑通的商业路径，再决定是否进入高门槛法规路径。',
    insightEn: 'Find the commercial path that can move first, then decide whether the higher-barrier regulatory path is justified.',
    keyLesson: '欧盟食品补充剂是快速进入欧盟的低阻力路径，同时为传统草药注册(THR)积累临床数据，双轨并行策略最优。',
    keyLessonEn: 'EU food supplements are the low-barrier entry route to Europe; parallel THR preparation builds clinical data for the higher-barrier route — dual-track strategy is optimal.',
    metrics: [
      { label: '月销额', labelEn: 'Monthly Sales', value: '10万€' },
      { label: '准备周期', labelEn: 'Timeline', value: '2年' },
      { label: '预计ROI', labelEn: 'Expected ROI', value: '300%' },
    ],
    duration: '12 个月(快速进入) + 24 个月(THR)',
    durationEn: '12 months (supplement) + 24 months (THR)',
    investment: '€50-100 万',
    investmentEn: '€500K-1M',
  },
  {
    id: 'case4',
    slug: 'japan-kampo-skincare-launch',
    company: '某护肤品企业',
    companyEn: 'A Skincare Company',
    industry: '护肤产品',
    industryEn: 'Skincare Products',
    industryCategory: 'cosmetic',
    decisionType: 'market',
    flag: '🇯🇵',
    markets: ['日本', '韩国'],
    marketsEn: ['Japan', 'South Korea'],
    challenge: '日本药妆市场竞争激烈，品牌认知度为零',
    challengeEn: 'Intense Japanese cosmetics competition, zero brand awareness',
    solution: '以"汉方护肤"定位切入，并用内容种草 + 独立站承接验证需求',
    solutionEn: 'Entered with a Hanfang skincare angle and used content + DTC infrastructure to validate demand',
    result: '小红书自然流量月引3万访客，独立站月销8000美元',
    resultEn: 'Generated 30K monthly visitors from Xiaohongshu and USD 8K monthly DTC sales',
    insight: '在高竞争市场，定位差异化往往比铺渠道更早决定成败。',
    insightEn: 'In highly competitive markets, positioning differentiation often matters before channel scale.',
    keyLesson: '日本汉方护肤是差异化竞争的蓝海——中国本草文化背书 + 日本药妆品质期望 = 独特品牌定位，无需从零建立认知。',
    keyLessonEn: 'Japan Hanfang skincare is a blue ocean for differentiation — Chinese herbal heritage + Japanese quality expectations = unique positioning, no need to build awareness from scratch.',
    metrics: [
      { label: '月访客', labelEn: 'Monthly Visitors', value: '3万' },
      { label: '月销额', labelEn: 'Sales', value: '$8000' },
      { label: '复购率', labelEn: 'Repeat Rate', value: '28%' },
    ],
    duration: '8 个月(DTC验证) + 24 个月(线下渠道)',
    durationEn: '8 months (DTC) + 24 months (offline)',
    investment: '$30-60 万',
    investmentEn: '$300K-600K',
  },
];

export const CASE_CATEGORIES = [
  { id: 'all', label: '全部案例', labelEn: 'All Cases' },
  { id: 'market', label: '选市场型', labelEn: 'Market Selection' },
  { id: 'compliance', label: '解准入型', labelEn: 'Compliance Solution' },
  { id: 'channel', label: '搭渠道型', labelEn: 'Channel Building' },
  { id: 'resource', label: '找资源型', labelEn: 'Resource Matching' },
];

export function getCaseBySlug(slug: string): CaseStudy | undefined {
  return CASES.find((c) => c.slug === slug);
}

export function getCaseById(id: string): CaseStudy | undefined {
  return CASES.find((c) => c.id === id);
}