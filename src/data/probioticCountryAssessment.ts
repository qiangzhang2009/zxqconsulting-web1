/**
 * 益生菌产品出海国家评估定制化配置
 * 
 * 基于 enterprise-global-country-assessment 11维评估体系定制
 * 
 * 【益生菌产品特性分析】
 * 1. 保健食品/功能性食品，监管类别复杂（保健品/食品/药品/特医食品）
 * 2. 需关注活菌数、货架期、存储条件（冷链 vs 常温）
 * 3. 肠道健康、免疫力、美容等功效宣称受严格限制
 * 4. 消费者教育成本高，专业渠道（药店/医院/营养师）vs 大众渠道
 * 5. 供应链要求：温控运输、BRC/FSSC 22000认证、临床证据
 * 
 * 【核心定制逻辑】
 * - 准入(regulation+access)：权重大幅提升，因为各国监管差异极大
 * - 需求(demand)：强调肠道健康认知度、功能食品市场成熟度
 * - 竞争(competition)：关注功能性酸奶/竞品益生菌品牌格局
 * - 运营(operations)：冷链物流、仓储条件是核心约束
 * - 经济(economics)：单位成本高，定价空间与消费者支付意愿敏感
 */

import type { DimensionId } from './countryAssessment';

// ============================================================
// 一、益生菌专用行业 Profile ID
// ============================================================

export type ProbioticProfileId = 
  | 'probiotic_general'           // 通用益生菌
  | 'probiotic_cold_chain'        // 冷链益生菌（需低温保存）
  | 'probiotic_medical'           // 药用级/特医益生菌
  | 'probiotic_infant'            // 婴幼儿益生菌
  | 'probiotic_pet';              // 宠物益生菌

// ============================================================
// 二、益生菌定制11维权重配置
// ============================================================

export interface ProbioticDimensionWeights {
  /** 产品-市场适配度：当地消费者对益生菌的健康认知与功能需求匹配 */
  fit: number;
  /** 市场需求量：肠道健康意识、功能性食品市场成熟度 */
  demand: number;
  /** 市场准入难度：保健品/食品注册路径复杂度与审批周期 */
  access: number;
  /** 竞争格局：现有益生菌品牌、功能性酸奶、替代品的竞争强度 */
  competition: number;
  /** 监管环境：功效宣称限制、广告审查、标签法规严格度 */
  regulation: number;
  /** 宏观环境：经济增长、汇率稳定性、与中国的外交关系 */
  macro: number;
  /** 单位经济效益：到岸成本、定价空间、CAC、回收期 */
  economics: number;
  /** 运营难度：冷链物流、BRC认证、仓储条件、退换货处理 */
  operations: number;
  /** 人才供给：营养师、药师、医学顾问等专业人才的可用性 */
  talent: number;
  /** 税务负担：关税（益生菌原料/成品）、增值税、所得税优惠 */
  tax: number;
  /** ESG风险：环保包装要求、可持续供应链、动物福利（婴幼儿/宠物线）*/
  esg: number;
}

export const PROBIOTIC_PROFILES: Record<ProbioticProfileId, {
  name: string;
  nameEn: string;
  note: string;
  productType: string;
  weights: ProbioticDimensionWeights;
  criticalFactors: string[];    // 该类别的关键成功因素
  redFlags: string[];           // 危险信号
}> = {
  probiotic_general: {
    name: '通用益生菌（成人/大众线）',
    nameEn: 'General Probiotic (Adult/Consumer)',
    note: '适用于调理肠胃、提升免疫力的通用成人益生菌产品',
    productType: '保健食品/功能性食品',
    weights: {
      fit: 9,           // 功能定位与当地健康需求匹配
      demand: 16,       // 肠道健康市场成熟度
      access: 14,       // 蓝帽子/注册路径（中国出口需保健食品备案）
      competition: 11,  // 品牌竞争激烈度
      regulation: 12,  // 功效宣称限制
      macro: 6,        // 汇率与外交关系
      economics: 12,   // 冷链成本与定价空间
      operations: 10,  // 温控仓储要求
      talent: 4,       // 专业销售渠道人才
      tax: 4,          // 关税与增值税
      esg: 2,          // 环保包装趋势
    },
    criticalFactors: [
      '当地肠道健康消费者教育程度',
      '药店/超市等现代零售渠道覆盖率',
      '竞品价格带与品牌格局',
    ],
    redFlags: [
      '功效宣称被严格禁止',
      '无可靠冷链物流基础设施',
      '同类产品已由跨国品牌垄断',
    ],
  },

  probiotic_cold_chain: {
    name: '冷链益生菌（需2-8°C保存）',
    nameEn: 'Cold-Chain Probiotic',
    note: '活菌数要求高，必须全程冷链运输的高端产品',
    productType: '冷藏保健食品',
    weights: {
      fit: 8,
      demand: 14,
      access: 15,       // 冷链产品准入更严格
      competition: 9,
      regulation: 13,   // 冷链监管额外要求
      macro: 6,
      economics: 13,   // 冷链成本占比高
      operations: 15,  // 温控是核心竞争力
      talent: 4,
      tax: 2,
      esg: 1,
    },
    criticalFactors: [
      '全程冷链覆盖率（生产-仓储-运输-终端）',
      '冷链基础设施投资成本',
      '末端零售冷柜配置率',
    ],
    redFlags: [
      '最后一公里冷链不可控',
      '终端冷柜配置率<60%',
      '停电/制冷故障风险高',
    ],
  },

  probiotic_medical: {
    name: '药用级/特医益生菌',
    nameEn: 'Medical/FSMP Probiotic',
    note: '需临床证据、医生推荐，用于治疗特定疾病的益生菌',
    productType: '特医食品/处方药',
    weights: {
      fit: 10,
      demand: 12,
      access: 18,       // 药品注册难度最高
      competition: 7,
      regulation: 22,  // 药品监管最严格
      macro: 5,
      economics: 10,
      operations: 8,
      talent: 5,        // 医学事务人才
      tax: 2,
      esg: 1,
    },
    criticalFactors: [
      '临床试验数据与循证医学证据',
      '医生/药师渠道教育',
      '医保覆盖可能性',
    ],
    redFlags: [
      '药品注册路径不通',
      '临床试验要求不可承受',
      '医学专业人才严重匮乏',
    ],
  },

  probiotic_infant: {
    name: '婴幼儿益生菌',
    nameEn: 'Infant Probiotic',
    note: '要求最高、安全标准最严，适合0-3岁婴幼儿',
    productType: '婴幼儿保健食品/特医食品',
    weights: {
      fit: 11,         // 安全性与信任度是核心
      demand: 13,
      access: 16,      // 婴幼儿食品准入极严格
      competition: 10,
      regulation: 18, // 宣称限制、安全标准最严
      macro: 5,
      economics: 9,
      operations: 9,
      talent: 4,
      tax: 3,
      esg: 2,          // 儿童安全包装
    },
    criticalFactors: [
      '菌株安全性（卫健委名单）',
      '临床证据等级（随机对照试验）',
      '儿科医生/育儿KOL背书',
    ],
    redFlags: [
      '菌株不在批准名单',
      '功效宣称违反广告法',
      '出现任何食品安全事件',
    ],
  },

  probiotic_pet: {
    name: '宠物益生菌',
    nameEn: 'Pet Probiotic',
    note: '宠物肠道健康产品，监管相对宽松但消费者要求高',
    productType: '宠物保健品',
    weights: {
      fit: 10,
      demand: 15,      // 宠物经济蓬勃发展
      access: 10,      // 宠物保健品监管较松
      competition: 12, // 宠物益生菌品牌激增
      regulation: 8,   // 监管相对宽松
      macro: 6,
      economics: 13,   // 宠物主支付意愿强
      operations: 8,
      talent: 5,       // 宠物医学/营养人才
      tax: 5,
      esg: 8,          // 动物福利、可持续包装
    },
    criticalFactors: [
      '宠物电商渠道渗透率',
      '兽医渠道推荐影响力',
      '宠物主人健康意识',
    ],
    redFlags: [
      '电商平台监管收紧',
      '竞品价格战压缩利润',
      '宠物食品安全事件影响行业',
    ],
  },
};

// ============================================================
// 三、益生菌专用硬门槛配置
// ============================================================

export type ProbioticGateId = 
  | 'probiotic_registration'      // 保健食品/食品注册可行性
  | 'cold_chain_feasibility'      // 冷链物流可行性
  | 'claim_restriction'          // 功效宣称可行性
  | 'strain_approval'            // 菌株审批状态
  | 'safety_incident_risk'        // 食品安全事件风险
  | 'market_demand_verified';     // 市场需求已验证

export const PROBIOTIC_HARD_GATES: Array<{
  id: ProbioticGateId;
  name: string;
  nameEn: string;
  detail: string;
  detailEn: string;
  owner: string;
  productType: ProbioticProfileId[]; // 适用产品类型
  severity: 'critical' | 'high' | 'medium';
}> = [
  {
    id: 'probiotic_registration',
    name: '保健食品/食品注册路径不可行',
    nameEn: 'Health food/food registration pathway not viable',
    detail: '目标市场无法以合理成本（时间<18个月，费用<500万RMB）完成保健食品注册或食品备案，导致产品无法合法销售',
    detailEn: 'Target market cannot complete health food registration or food filing at reasonable cost (time<18 months, cost<5M RMB), making legal sales impossible',
    owner: '法规事务 / 业务负责人',
    productType: ['probiotic_general', 'probiotic_cold_chain', 'probiotic_medical', 'probiotic_infant'],
    severity: 'critical',
  },
  {
    id: 'cold_chain_feasibility',
    name: '全程冷链物流不可实现',
    nameEn: 'End-to-end cold chain logistics not feasible',
    detail: '冷链益生菌在目标市场的仓储、运输、终端冷柜覆盖不完整，产品活性无法保证（活菌数到货检测<宣称值）',
    detailEn: 'Cold-chain probiotic cold storage, transportation, and retail cold cabinet coverage incomplete in target market; product activity cannot be guaranteed',
    owner: '供应链 / 运营',
    productType: ['probiotic_cold_chain'],
    severity: 'critical',
  },
  {
    id: 'claim_restriction',
    name: '功效宣称被全面禁止',
    nameEn: 'Health claims completely prohibited',
    detail: '目标市场禁止任何益生菌健康功效宣称（如改善肠道、增强免疫），且无科学证据豁免路径，导致产品无法建立差异化价值',
    detailEn: 'Target market prohibits all probiotic health claims (e.g., improve gut, boost immunity) with no scientific evidence exemption path, making product differentiation impossible',
    owner: '法规事务 / 市场',
    productType: ['probiotic_general', 'probiotic_cold_chain', 'probiotic_infant', 'probiotic_pet'],
    severity: 'high',
  },
  {
    id: 'strain_approval',
    name: '核心菌株未获批准或存在安全争议',
    nameEn: 'Core strain not approved or has safety concerns',
    detail: '产品使用的核心菌株（如某特定乳杆菌、双歧杆菌菌株）在目标市场未列入批准名单，或存在安全性争议/召回历史',
    detailEn: 'Core strain used in product (e.g., specific Lactobacillus or Bifidobacterium strain) not on approved list in target market, or has safety concerns/recall history',
    owner: '研发 / 法规事务',
    productType: ['probiotic_general', 'probiotic_cold_chain', 'probiotic_medical', 'probiotic_infant'],
    severity: 'critical',
  },
  {
    id: 'safety_incident_risk',
    name: '食品安全事件历史或高风险',
    nameEn: 'Food safety incident history or high risk',
    detail: '目标市场近期发生过益生菌/保健食品相关安全事件，或当地监管机构对中国益生菌产品有负面记录，导致消费者信任度极低',
    detailEn: 'Target market has recent probiotic/health food safety incidents, or local regulators have negative records of Chinese probiotic products, leading to extremely low consumer trust',
    owner: '质量 / 法务',
    productType: ['probiotic_general', 'probiotic_cold_chain', 'probiotic_medical', 'probiotic_infant', 'probiotic_pet'],
    severity: 'high',
  },
  {
    id: 'market_demand_verified',
    name: '市场需求无法验证或规模不足',
    nameEn: 'Market demand unverified or insufficient scale',
    detail: '目标市场消费者对益生菌认知度极低（<10%），或功能食品市场规模<5000万美元，无法支撑商业化运营',
    detailEn: 'Target market consumer awareness of probiotics extremely low (<10%), or functional food market size <$50M, unable to support commercial operations',
    owner: '市场 / 战略',
    productType: ['probiotic_general', 'probiotic_cold_chain', 'probiotic_pet'],
    severity: 'medium',
  },
];

// ============================================================
// 四、益生菌定制评估问题（替换原始11维问题）
// ============================================================

export const PROBIOTIC_DIMENSION_QUESTIONS: Record<DimensionId, {
  question: string;          // 核心评估问题
  questionEn: string;
  metrics: string;          // 关键指标
  metricsEn: string;
  evidence: string;         // 最低证据要求
  evidenceEn: string;
  probioticSpecific: string; // 益生菌特有的关注点
  probioticSpecificEn: string;
}> = {
  fit: {
    question: '该市场的消费者肠道健康需求与产品功能定位是否高度匹配？',
    questionEn: 'Do local consumer gut health needs highly match the product positioning?',
    metrics: '消费者益生菌认知度、功能诉求优先级、健康投资意愿、品牌信任度',
    metricsEn: 'Consumer probiotic awareness, functional priority, health investment willingness, brand trust',
    evidence: '消费者调研、品牌搜索趋势、社交媒体健康话题热度',
    evidenceEn: 'Consumer surveys, brand search trends, social media health topic volume',
    probioticSpecific: '是否针对当地常见肠道问题（如亚洲高发的乳糖不耐、幽门螺旋杆菌感染）有科学证据支持的产品方案',
    probioticSpecificEn: 'Whether product has scientific evidence supporting solutions for local common gut issues (e.g., lactose intolerance, H. pylori infection common in Asia)',
  },
  demand: {
    question: '目标市场的功能食品/益生菌细分市场规模、增速、支付意愿是否支撑商业化？',
    questionEn: 'Is the functional food/probiotic segment market size, growth rate, and payment willingness sufficient?',
    metrics: '益生菌市场规模（USD）、年增速、CAGR、细分渗透率、人均消费额',
    metricsEn: 'Probiotic market size (USD), YoY growth, CAGR, segment penetration, per capita spending',
    evidence: 'Euromonitor/Statista报告、海关进口数据、竞品销量、电商平台销售数据',
    evidenceEn: 'Euromonitor/Statista reports, customs import data, competitor sales, e-commerce platform data',
    probioticSpecific: '当地肠道疾病发病率（IBS、IBD、抗生素相关腹泻）与中国市场差异，这决定了潜在用户基数',
    probioticSpecificEn: 'Local incidence of gut diseases (IBS, IBD, antibiotic-associated diarrhea) vs China, determining potential user base',
  },
  access: {
    question: '产品能否通过合法渠道进入目标市场并触达消费者？',
    questionEn: 'Can the product legally enter the target market and reach consumers through viable channels?',
    metrics: '注册周期、注册成功率、注册费用、准入渠道数量、渠道渗透率',
    metricsEn: 'Registration timeline, success rate, cost, channel count, channel penetration',
    evidence: '注册法规文本、已注册产品清单、渠道合作协议、药店/超市进场合同',
    evidenceEn: 'Registration regulations, registered product list, channel agreements, pharmacy/supermarket access contracts',
    probioticSpecific: '保健食品注册 vs 普通食品备案的路径选择，各路径的周期与成本对比，以及跨境电商直邮的可持续性',
    probioticSpecificEn: 'Registration pathway options (health food registration vs regular food filing), timeline and cost comparison, sustainability of cross-border e-commerce direct shipping',
  },
  competition: {
    question: '在目标市场的竞争格局中，产品的差异化优势是否可防御？',
    questionEn: 'Is the product differentiation defensible in the competitive landscape?',
    metrics: '市场集中度（CR3/CR5）、价格带分布、竞品份额、本地品牌 vs 跨国品牌',
    metricsEn: 'Market concentration (CR3/CR5), price band distribution, competitor share, local vs MNC brands',
    evidence: '竞品价格监测、货架调研、消费者选择调研、竞品营销投入',
    evidenceEn: 'Competitor price monitoring, shelf research, consumer choice surveys, competitor marketing spend',
    probioticSpecific: '当地益生菌品牌是否已建立"原籍国原产菌株"的信任壁垒，以及竞品是否在功效宣称上已占位',
    probioticSpecificEn: 'Whether local probiotic brands have established "origin country origin strain" trust barrier, and whether competitors have already positioned on efficacy claims',
  },
  regulation: {
    question: '目标市场的功效宣称法规是否允许产品建立差异化价值主张？',
    questionEn: 'Do local claim regulations allow product to establish differentiated value proposition?',
    metrics: '宣称可允许度、广告审查严格度、标签法规合规成本、违规处罚力度',
    metricsEn: 'Claim permissibility, ad review strictness, label compliance cost, violation penalties',
    evidence: '功效宣称法规原文、违规案例分析、监管机构执法记录',
    evidenceEn: 'Claim regulation text, violation case analysis, regulatory enforcement records',
    probioticSpecific: '特定功效宣称（如改善肠道菌群、增强免疫力）是否被允许，以及需要什么级别的证据支持',
    probioticSpecificEn: 'Whether specific claims (e.g., improve gut flora, boost immunity) are permitted and what level of evidence is required',
  },
  macro: {
    question: '宏观经济与双边关系是否支持中国益生菌品牌的长期市场进入？',
    questionEn: 'Do macro-economics and bilateral relations support long-term market entry for Chinese probiotic brands?',
    metrics: 'GDP增速、汇率稳定性、中外关系指数、贸易便利化程度',
    metricsEn: 'GDP growth, exchange rate stability, China-foreign relations index, trade facilitation',
    evidence: 'IMF/世界银行数据、外交关系评估、贸易协定条款、制裁/限制清单',
    evidenceEn: 'IMF/World Bank data, diplomatic relations assessment, trade agreement terms, sanctions/restriction lists',
    probioticSpecific: '目标市场是否对"中国制造"的保健食品有额外的审查或限制，这可能影响消费者信任和监管态度',
    probioticSpecificEn: 'Whether target market has additional scrutiny or restrictions on "Made in China" health foods, affecting consumer trust and regulatory attitude',
  },
  economics: {
    question: '在真实到岸成本、定价空间和渠道分润下，单位经济模型是否成立？',
    questionEn: 'Does the unit economics hold under real landed cost, pricing, and channel margin?',
    metrics: '到岸成本、终端定价空间、渠道分润比例、CAC、LTV/CAC、回收期',
    metricsEn: 'Landed cost, retail pricing space, channel margin ratio, CAC, LTV/CAC, payback period',
    evidence: '成本结构拆解、定价测试、渠道分润谈判、竞品价格带对比',
    evidenceEn: 'Cost structure breakdown, pricing test, channel margin negotiation, competitor price band comparison',
    probioticSpecific: '冷链成本占比（冷链产品可达售价15-25%）、关税（原料vs成品差异）、以及益生菌原料的进口配额',
    probioticSpecificEn: 'Cold chain cost ratio (15-25% of selling price for cold-chain products), tariffs (raw material vs finished product), import quotas for probiotic strains',
  },
  operations: {
    question: '能否在目标市场稳定交付符合质量标准的产品？',
    questionEn: 'Can stable delivery of quality-compliant products be achieved in target market?',
    metrics: '仓储温控达标率、物流时效、退换货率、BRC/FSSC 22000认证覆盖率',
    metricsEn: 'Warehouse temperature compliance, logistics timeliness, return rate, BRC/FSSC 22000 certification coverage',
    evidence: '仓储审计报告、物流商资质、3PL报价、真实小单测试',
    evidenceEn: 'Warehouse audit reports, logistics provider credentials, 3PL quotes, real small-order testing',
    probioticSpecific: '活菌数到货检测达标率（应>90%）、温控记录完整度、以及面对退换货时的产品处置成本',
    probioticSpecificEn: 'Live bacteria count on-arrival compliance rate (should be >90%), temperature record completeness, product disposal cost for returns',
  },
  talent: {
    question: '能否在目标市场组建具备益生菌/功能性食品专业知识的本地团队？',
    questionEn: 'Can a local team with probiotic/functional food expertise be assembled?',
    metrics: '专业人才可用性、薪资水平、猎头难度、关键岗位招聘周期',
    metricsEn: 'Professional talent availability, salary level, recruitment difficulty, key position hiring timeline',
    evidence: '薪酬调研报告、猎头访谈、LinkedIn人才库、候选人漏斗数据',
    evidenceEn: 'Salary survey reports, headhunter interviews, LinkedIn talent pool, candidate funnel data',
    probioticSpecific: '是否需要组建"医学事务"团队来支撑专业渠道的HCP（医护人员）教育，这显著增加运营成本',
    probioticSpecificEn: 'Whether need to build "medical affairs" team to support HCP (healthcare professional) education for professional channels, significantly increasing operational cost',
  },
  tax: {
    question: '整体税负结构是否允许产品保持价格竞争力和合理利润空间？',
    questionEn: 'Does overall tax structure allow competitive pricing and reasonable profit margin?',
    metrics: '进口关税（益生菌原料/成品）、增值税、退税政策、企业所得税',
    metricsEn: 'Import tariffs (probiotic raw materials/finished products), VAT, export rebate policy, corporate income tax',
    evidence: '海关税则、税务顾问备忘录、进出口统计、双边税收协定',
    evidenceEn: 'Customs tariff schedule, tax advisor memo, import/export statistics, bilateral tax treaty',
    probioticSpecific: '益生菌原料（如菌株冻干粉）的进口关税税率 vs 成品的差异，这影响是在当地灌装还是原瓶进口的成本决策',
    probioticSpecificEn: 'Import tariff rate difference between probiotic raw materials (e.g., freeze-dried strain powder) vs finished products, affecting cost decision of local filling vs imported finished goods',
  },
  esg: {
    question: '进入该市场是否符合企业ESG承诺，并可承受公众与利益相关方审视？',
    questionEn: 'Does entering the market align with corporate ESG commitments and withstand stakeholder scrutiny?',
    metrics: '环保包装要求、可持续供应链标准、动物福利法规、品牌声誉风险',
    metricsEn: 'Eco-packaging requirements, sustainable supply chain standards, animal welfare regulations, brand reputation risk',
    evidence: 'ESG评级报告、供应商审计、媒体报道、利益相关方反馈',
    evidenceEn: 'ESG rating reports, supplier audits, media coverage, stakeholder feedback',
    probioticSpecific: '婴幼儿益生菌的菌株来源是否涉及伦理问题（如粪便菌群移植来源），宠物益生菌的动物福利标准',
    probioticSpecificEn: 'Whether infant probiotic strain source has ethical issues (e.g., FMT source), pet probiotic animal welfare standards',
  },
};

// ============================================================
// 五、益生菌数据采集清单（按评估维度组织）
// ============================================================

export interface ProbioticDataCollectionItem {
  dimension: DimensionId;
  dataPoint: string;        // 数据点名称
  dataPointEn: string;
  collectionMethod: string;  // 采集方法
  collectionMethodEn: string;
  source: string;           // 数据来源
  sourceEn: string;
  frequency: string;         // 更新频率
  priority: 'critical' | 'high' | 'medium' | 'low';
  cost: 'free' | 'low' | 'medium' | 'high';
  effort: 'quick' | 'moderate' | 'extensive';
  probioticSpecific?: string; // 益生菌特有说明
  probioticSpecificEn?: string;
}

export const PROBIOTIC_DATA_COLLECTION: ProbioticDataCollectionItem[] = [
  // ---- fit (产品-市场适配度) ----
  {
    dimension: 'fit',
    dataPoint: '消费者益生菌认知度调研',
    dataPointEn: 'Consumer probiotic awareness survey',
    collectionMethod: '在线问卷 + 焦点小组访谈，覆盖1000+样本',
    collectionMethodEn: 'Online survey + focus groups, 1000+ sample',
    source: '当地市场调研公司 / SurveyMonkey / Qualtrics',
    sourceEn: 'Local market research firm / SurveyMonkey / Qualtrics',
    frequency: '年度',
    priority: 'high',
    cost: 'medium',
    effort: 'moderate',
    probioticSpecific: '需区分"听说过益生菌" vs "使用过益生菌" vs "定期使用"的三级转化漏斗',
    probioticSpecificEn: 'Need to distinguish awareness levels: "heard of probiotics" vs "used probiotics" vs "regular user" three-stage funnel',
  },
  {
    dimension: 'fit',
    dataPoint: '本地化产品方案需求访谈',
    dataPointEn: 'Localized product solution need interviews',
    collectionMethod: '针对目标用户的深度1对1访谈，至少30个',
    collectionMethodEn: 'In-depth 1-on-1 interviews with target users, at least 30',
    source: '本地用户招募 + 翻译支持',
    sourceEn: 'Local user recruitment + translation support',
    frequency: '进入前一次性',
    priority: 'high',
    cost: 'medium',
    effort: 'extensive',
    probioticSpecific: '了解当地消费者对菌株偏好（如亚洲偏好双歧杆菌 vs 欧美偏好乳杆菌）',
    probioticSpecificEn: 'Understand local consumer strain preferences (e.g., Asia prefers Bifidobacterium vs Europe/US prefers Lactobacillus)',
  },
  {
    dimension: 'fit',
    dataPoint: '社交媒体/搜索趋势分析',
    dataPointEn: 'Social media/search trend analysis',
    collectionMethod: 'Google Trends / 当地社交平台热度分析',
    collectionMethodEn: 'Google Trends / local social platform trend analysis',
    source: 'Google Trends / Brandwatch / 当地社交平台分析工具',
    sourceEn: 'Google Trends / Brandwatch / local social platform analytics',
    frequency: '季度',
    priority: 'medium',
    cost: 'free',
    effort: 'quick',
  },

  // ---- demand (市场需求) ----
  {
    dimension: 'demand',
    dataPoint: '益生菌市场规模与增速（USD）',
    dataPointEn: 'Probiotic market size and growth (USD)',
    collectionMethod: '购买Euromonitor/Grand View Research等权威报告',
    collectionMethodEn: 'Purchase Euromonitor/Grand View Research authoritative reports',
    source: 'Euromonitor International / Grand View Research / Mordor Intelligence',
    sourceEn: 'Euromonitor International / Grand View Research / Mordor Intelligence',
    frequency: '年度',
    priority: 'critical',
    cost: 'high',
    effort: 'quick',
  },
  {
    dimension: 'demand',
    dataPoint: '益生菌细分市场数据（按剂型/菌株/功效）',
    dataPointEn: 'Probiotic segment data (by form/strain/function)',
    collectionMethod: '行业报告 + 电商平台数据爬取',
    collectionMethodEn: 'Industry reports + e-commerce platform data scraping',
    source: '行业白皮书 / Amazon / Lazada / Shopee等平台数据',
    sourceEn: 'Industry whitepapers / Amazon / Lazada / Shopee platform data',
    frequency: '半年度',
    priority: 'high',
    cost: 'low',
    effort: 'moderate',
    probioticSpecific: '重点关注：针对肠道健康、免疫、皮肤、情绪等功效的细分市场规模',
    probioticSpecificEn: 'Focus on: gut health, immunity, skin, mood and other functional segment market sizes',
  },
  {
    dimension: 'demand',
    dataPoint: '当地肠道疾病发病率统计',
    dataPointEn: 'Local gut disease incidence statistics',
    collectionMethod: '官方卫生统计数据 + 医学文献综述',
    collectionMethodEn: 'Official health statistics + medical literature review',
    source: 'WHO / 当地卫生部 / PubMed医学文献',
    sourceEn: 'WHO / local Ministry of Health / PubMed medical literature',
    frequency: '年度',
    priority: 'high',
    cost: 'free',
    effort: 'moderate',
    probioticSpecific: 'IBS、IBD、抗生素相关腹泻、SIBO等与益生菌高度相关的疾病发病率',
    probioticSpecificEn: 'Incidence of IBS, IBD, antibiotic-associated diarrhea, SIBO and other probiotic-relevant conditions',
  },
  {
    dimension: 'demand',
    dataPoint: '消费者支付意愿（WTP）调研',
    dataPointEn: 'Consumer Willingness to Pay (WTP) survey',
    collectionMethod: '价格敏感度测试（PSM）+ 联合分析法（Conjoint）',
    collectionMethodEn: 'Price Sensitivity Meter (PSM) + Conjoint Analysis',
    source: '市场调研公司定制调研',
    sourceEn: 'Custom research by market research firm',
    frequency: '进入前一次性 + 年度跟踪',
    priority: 'critical',
    cost: 'high',
    effort: 'extensive',
    probioticSpecific: '需测试不同价格带（低/中/高）对购买转化率的影响，益生菌定价空间通常在竞品70-130%',
    probioticSpecificEn: 'Need to test different price bands impact on purchase conversion, probiotic pricing typically 70-130% of competitors',
  },

  // ---- access (市场准入) ----
  {
    dimension: 'access',
    dataPoint: '保健食品/食品注册法规原文',
    dataPointEn: 'Health food/food registration regulation full text',
    collectionMethod: '获取官方法规文件 + 当地律师解读',
    collectionMethodEn: 'Obtain official regulation documents + local lawyer interpretation',
    source: '当地食药监局/卫生部官网 + 法规事务所',
    sourceEn: 'Local FDA/Ministry of Health official website + law firm',
    frequency: '进入前一次性 + 法规变化即时更新',
    priority: 'critical',
    cost: 'medium',
    effort: 'extensive',
  },
  {
    dimension: 'access',
    dataPoint: '已注册益生菌产品清单与注册时间',
    dataPointEn: 'List of registered probiotic products and registration timeline',
    collectionMethod: '监管机构数据库查询 + 第三方合规平台',
    collectionMethodEn: 'Regulatory database query + third-party compliance platform',
    source: '当地食药监局数据库 / RegASK / Chem形象的',
    sourceEn: 'Local FDA database / RegASK / Chem形象',
    frequency: '季度',
    priority: 'critical',
    cost: 'low',
    effort: 'quick',
    probioticSpecific: '通过已注册产品数量和时间判断注册难度，近年加速说明审批友好',
    probioticSpecificEn: 'Judging registration difficulty by number of registered products and timeline; recent acceleration indicates approval-friendly',
  },
  {
    dimension: 'access',
    dataPoint: '注册周期与成本基准数据',
    dataPointEn: 'Registration timeline and cost benchmark data',
    collectionMethod: '咨询已有注册经验的企业 + 律所报价',
    collectionMethodEn: 'Consult companies with registration experience + law firm quotes',
    source: '行业协会 / 律所 / 认证机构',
    sourceEn: 'Industry association / law firm / certification body',
    frequency: '进入前一次性',
    priority: 'critical',
    cost: 'low',
    effort: 'moderate',
  },
  {
    dimension: 'access',
    dataPoint: '零售渠道渗透率与准入门槛',
    dataPointEn: 'Retail channel penetration and access threshold',
    collectionMethod: '渠道实地调研 + 神秘采购',
    collectionMethodEn: 'Channel field research + mystery shopping',
    source: '尼尔森/凯度渠道报告 + 实地走访',
    sourceEn: 'Nielsen/Kantar channel reports + field visits',
    frequency: '半年度',
    priority: 'high',
    cost: 'medium',
    effort: 'moderate',
    probioticSpecific: '重点关注：药店/医院等专业渠道 vs 超市/电商等大众渠道的准入差异',
    probioticSpecificEn: 'Focus on: pharmacy/hospital professional channel vs supermarket/e-commerce mass channel access differences',
  },

  // ---- competition (竞争格局) ----
  {
    dimension: 'competition',
    dataPoint: 'TOP 20益生菌品牌市场份额与价格带',
    dataPointEn: 'TOP 20 probiotic brand market share and price bands',
    collectionMethod: '市场报告 + 电商平台数据 + 货架调研',
    collectionMethodEn: 'Market reports + e-commerce data + shelf research',
    source: 'Euromonitor / 电商平台API / 实地货架调研',
    sourceEn: 'Euromonitor / e-commerce platform API / field shelf research',
    frequency: '季度',
    priority: 'critical',
    cost: 'medium',
    effort: 'moderate',
    probioticSpecific: '识别"原籍国原产"品牌占主导还是"全球品牌"占主导，影响差异化策略',
    probioticSpecificEn: 'Identify whether "country of origin" brands or "global brands" dominate, affecting differentiation strategy',
  },
  {
    dimension: 'competition',
    dataPoint: '竞品功效宣称与配方对比分析',
    dataPointEn: 'Competitor claim and formula comparative analysis',
    collectionMethod: '竞品购买 + 标签分析 + 竞品官网/社交媒体监控',
    collectionMethodEn: 'Competitor product purchase + label analysis + competitor website/social media monitoring',
    source: '竞品样品 + 电商评论 + 社交媒体',
    sourceEn: 'Competitor samples + e-commerce reviews + social media',
    frequency: '季度',
    priority: 'high',
    cost: 'low',
    effort: 'moderate',
    probioticSpecific: '竞品使用的菌株种类、活菌数、CFU标注方式的对比，识别监管套利机会',
    probioticSpecificEn: 'Competitor strain types, live bacteria count, CFU labeling comparison, identifying regulatory arbitrage opportunities',
  },
  {
    dimension: 'competition',
    dataPoint: '消费者品牌偏好与选择驱动因素',
    dataPointEn: 'Consumer brand preference and choice drivers',
    collectionMethod: '消费者选择调研 + 购买决策访谈',
    collectionMethodEn: 'Consumer choice survey + purchase decision interviews',
    source: '消费者调研公司',
    sourceEn: 'Consumer research firm',
    frequency: '年度',
    priority: 'high',
    cost: 'medium',
    effort: 'moderate',
    probioticSpecific: '驱动购买的TOP因素：品牌知名度/医生推荐/价格/功效证据/包装，识别切入机会',
    probioticSpecificEn: 'TOP purchase drivers: brand awareness/doctor recommendation/price/efficacy evidence/packaging, identifying entry opportunities',
  },

  // ---- regulation (监管环境) ----
  {
    dimension: 'regulation',
    dataPoint: '益生菌功效宣称允许清单与限制条款',
    dataPointEn: 'Probiotic allowed claim list and restrictions',
    collectionMethod: '法规原文研读 + 当地律师确认',
    collectionMethodEn: 'Regulation text study + local lawyer confirmation',
    source: '当地食药监局/广告法 + 法规事务所',
    sourceEn: 'Local FDA/advertising law + law firm',
    frequency: '进入前一次性 + 法规变化即时',
    priority: 'critical',
    cost: 'medium',
    effort: 'extensive',
    probioticSpecific: '各国宣称法规差异极大：日本允许特定健康声称，欧盟需EFSA批准，美国需FDA批准',
    probioticSpecificEn: 'Huge claim regulation differences: Japan allows specific health claims, EU needs EFSA approval, US needs FDA approval',
  },
  {
    dimension: 'regulation',
    dataPoint: '广告审查案例与违规处罚记录',
    dataPointEn: 'Advertising review cases and violation penalty records',
    collectionMethod: '监管机构处罚公告 + 律师提供案例库',
    collectionMethodEn: 'Regulatory penalty announcements + lawyer case library',
    source: '当地食药监局公告 + 律所',
    sourceEn: 'Local FDA announcements + law firm',
    frequency: '年度',
    priority: 'high',
    cost: 'low',
    effort: 'quick',
    probioticSpecific: '中国品牌在当地的违规历史记录，影响消费者信任和监管态度',
    probioticSpecificEn: 'Chinese brand violation history in market, affecting consumer trust and regulatory attitude',
  },
  {
    dimension: 'regulation',
    dataPoint: '菌株批准名单与安全评估要求',
    dataPointEn: 'Approved strain list and safety assessment requirements',
    collectionMethod: '官方菌株数据库查询 + 法规事务所确认',
    collectionMethodEn: 'Official strain database query + law firm confirmation',
    source: '当地食药监局/QPS列表/EFSA名单',
    sourceEn: 'Local FDA/QPS list/EFSA list',
    frequency: '进入前一次性 + 年度更新',
    priority: 'critical',
    cost: 'low',
    effort: 'moderate',
    probioticSpecific: '各国对菌株审批差异：中国有"可用于保健食品的菌种名单"，欧盟有QPS系统',
    probioticSpecificEn: 'Strain approval differences: China has "approved strains for health food" list, EU has QPS system',
  },

  // ---- macro (宏观环境) ----
  {
    dimension: 'macro',
    dataPoint: 'GDP增速、汇率稳定性、消费信心指数',
    dataPointEn: 'GDP growth, exchange rate stability, consumer confidence index',
    collectionMethod: 'IMF/世界银行数据 + 央行报告',
    collectionMethodEn: 'IMF/World Bank data + central bank reports',
    source: 'IMF / World Bank / 各国央行',
    sourceEn: 'IMF / World Bank / central banks',
    frequency: '季度',
    priority: 'medium',
    cost: 'free',
    effort: 'quick',
  },
  {
    dimension: 'macro',
    dataPoint: '中国-目标市场外交关系评估',
    dataPointEn: 'China-target market diplomatic relations assessment',
    collectionMethod: '双边关系数据库 + 智库报告',
    collectionMethodEn: 'Bilateral relations database + think tank reports',
    source: 'Lowy Institute / ASPI / 外交部数据',
    sourceEn: 'Lowy Institute / ASPI / Ministry of Foreign Affairs data',
    frequency: '年度',
    priority: 'high',
    cost: 'free',
    effort: 'quick',
    probioticSpecific: '若外交关系紧张，保健食品作为"中国制造"可能面临额外审查和消费者抵触',
    probioticSpecificEn: 'If diplomatic relations tense, health food as "Made in China" may face extra scrutiny and consumer resistance',
  },

  // ---- economics (单位经济) ----
  {
    dimension: 'economics',
    dataPoint: '到岸成本拆解（原料+生产+物流+关税+渠道）',
    dataPointEn: 'Landed cost breakdown (raw material+production+logistics+tariff+channel)',
    collectionMethod: '供应商报价 + 物流商报价 + 关税查询',
    collectionMethodEn: 'Supplier quotes + logistics quotes + tariff lookup',
    source: '供应商 / 3PL / 海关税则',
    sourceEn: 'Suppliers / 3PL / customs tariff schedule',
    frequency: '进入前一次性 + 年度更新',
    priority: 'critical',
    cost: 'low',
    effort: 'moderate',
    probioticSpecific: '冷链产品的温控成本可占售价15-25%，是盈亏平衡的关键变量',
    probioticSpecificEn: 'Cold-chain product temperature control cost can be 15-25% of selling price, key variable for break-even',
  },
  {
    dimension: 'economics',
    dataPoint: '竞品价格带与定价空间分析',
    dataPointEn: 'Competitor price bands and pricing space analysis',
    collectionMethod: '电商/货架价格监测 + 消费者WTP调研',
    collectionMethodEn: 'E-commerce/shelf price monitoring + consumer WTP survey',
    source: '电商数据爬取 / 货架调研 / 调研公司',
    sourceEn: 'E-commerce data scraping / shelf research / research firm',
    frequency: '季度',
    priority: 'critical',
    cost: 'low',
    effort: 'moderate',
    probioticSpecific: '益生菌定价通常在竞品价格带的80-120%，过高则需强品牌支撑',
    probioticSpecificEn: 'Probiotic pricing typically 80-120% of competitor price band; higher requires strong brand support',
  },
  {
    dimension: 'economics',
    dataPoint: '渠道分润结构与净到手价',
    dataPointEn: 'Channel margin structure and net received price',
    collectionMethod: '渠道谈判 + 竞品渠道成本调研',
    collectionMethodEn: 'Channel negotiation + competitor channel cost research',
    source: '渠道合作伙伴 / 行业报告',
    sourceEn: 'Channel partners / industry reports',
    frequency: '进入前一次性 + 年度重谈',
    priority: 'high',
    cost: 'low',
    effort: 'moderate',
    probioticSpecific: '药店渠道：毛利要求30-40%；电商平台：佣金5-20%；经销商：毛利15-25%',
    probioticSpecificEn: 'Pharmacy channel: margin requirement 30-40%; e-commerce platform: commission 5-20%; distributor: margin 15-25%',
  },

  // ---- operations (运营难度) ----
  {
    dimension: 'operations',
    dataPoint: '冷链基础设施覆盖率与质量评估',
    dataPointEn: 'Cold chain infrastructure coverage and quality assessment',
    collectionMethod: '实地考察 + 冷链物流商审计',
    collectionMethodEn: 'Field inspection + cold chain logistics provider audit',
    source: '冷链物流商 + 行业协会报告',
    sourceEn: 'Cold chain logistics providers + industry association reports',
    frequency: '进入前一次性 + 年度复核',
    priority: 'critical',
    cost: 'medium',
    effort: 'extensive',
    probioticSpecific: '验证冷链"最后一公里"可行性，这是活菌数达标的关键',
    probioticSpecificEn: 'Verify cold chain "last mile" feasibility, key to live bacteria count compliance',
  },
  {
    dimension: 'operations',
    dataPoint: '仓储条件认证要求（BRC/FSSC 22000）',
    dataPointEn: 'Warehouse condition certification requirements (BRC/FSSC 22000)',
    collectionMethod: '认证机构咨询 + 仓库实地审计',
    collectionMethodEn: 'Certification body consultation + warehouse field audit',
    source: 'SGS/BV/TÜV等认证机构',
    sourceEn: 'SGS/BV/TÜV certification bodies',
    frequency: '进入前一次性 + 年度审计',
    priority: 'high',
    cost: 'high',
    effort: 'moderate',
  },
  {
    dimension: 'operations',
    dataPoint: '活菌数到货检测达标率',
    dataPointEn: 'Live bacteria count on-arrival compliance rate',
    collectionMethod: '小批量试运 + 到货检测',
    collectionMethodEn: 'Trial shipments + on-arrival testing',
    source: '第三方检测机构',
    sourceEn: 'Third-party testing labs',
    frequency: '试运阶段',
    priority: 'critical',
    cost: 'medium',
    effort: 'moderate',
    probioticSpecific: '冷链产品活菌数到货检测应>90%达标率，否则冷链不可行',
    probioticSpecificEn: 'Cold-chain product live bacteria count on-arrival compliance should be >90%, otherwise cold chain not feasible',
  },

  // ---- talent (人才供给) ----
  {
    dimension: 'talent',
    dataPoint: '营养师/药师/医学顾问可用性与薪资水平',
    dataPointEn: 'Nutritionist/pharmacist/medical consultant availability and salary level',
    collectionMethod: '猎头访谈 + LinkedIn数据 + 薪酬调研',
    collectionMethodEn: 'Headhunter interviews + LinkedIn data + salary survey',
    source: '猎头 / LinkedIn / 薪酬调研报告',
    sourceEn: 'Headhunters / LinkedIn / salary survey reports',
    frequency: '进入前一次性',
    priority: 'medium',
    cost: 'low',
    effort: 'moderate',
    probioticSpecific: '专业渠道（药店/医院）需要HCP教育人才，这增加本地团队组建成本',
    probioticSpecificEn: 'Professional channels (pharmacy/hospital) need HCP education talent, increasing local team building cost',
  },
  {
    dimension: 'talent',
    dataPoint: '医学事务团队组建成本评估',
    dataPointEn: 'Medical affairs team building cost assessment',
    collectionMethod: '招聘成本 + 薪资 + 培训成本综合估算',
    collectionMethodEn: 'Recruitment + salary + training cost comprehensive estimate',
    source: 'HR + 医学事务顾问',
    sourceEn: 'HR + medical affairs consultants',
    frequency: '进入前一次性',
    priority: 'medium',
    cost: 'low',
    effort: 'moderate',
    probioticSpecific: '药用级/婴幼儿益生菌必须组建医学事务团队，估算3-5人规模，年成本200-500万RMB',
    probioticSpecificEn: 'Medical/infant probiotics must build medical affairs team, estimate 3-5 people, annual cost 2-5M RMB',
  },

  // ---- tax (税务负担) ----
  {
    dimension: 'tax',
    dataPoint: '益生菌原料与成品的进口关税税率',
    dataPointEn: 'Import tariff rates for probiotic raw materials and finished products',
    collectionMethod: '海关税则查询 + 税务顾问确认',
    collectionMethodEn: 'Customs tariff lookup + tax advisor confirmation',
    source: '海关总署 / WTO / 税务顾问',
    sourceEn: 'Customs / WTO / tax advisors',
    frequency: '进入前一次性 + 政策变化即时',
    priority: 'high',
    cost: 'low',
    effort: 'quick',
    probioticSpecific: '原料（如冻干菌粉）关税 vs 成品关税差异，影响是当地灌装还是原瓶进口的决策',
    probioticSpecificEn: 'Raw material (freeze-dried bacteria powder) vs finished product tariff difference affects local filling vs imported decision',
  },
  {
    dimension: 'tax',
    dataPoint: '出口退税率与增值税抵扣政策',
    dataPointEn: 'Export rebate rate and VAT deduction policy',
    collectionMethod: '税务局咨询 + 税务顾问备忘录',
    collectionMethodEn: 'Tax bureau consultation + tax advisor memo',
    source: '国家税务总局 / 税务顾问',
    sourceEn: 'State Tax Administration / tax advisors',
    frequency: '进入前一次性',
    priority: 'medium',
    cost: 'low',
    effort: 'quick',
  },

  // ---- esg (ESG风险) ----
  {
    dimension: 'esg',
    dataPoint: '环保包装法规与消费者偏好',
    dataPointEn: 'Eco-packaging regulations and consumer preferences',
    collectionMethod: '法规调研 + 消费者偏好调研',
    collectionMethodEn: 'Regulation research + consumer preference survey',
    source: '当地环保法规 + 消费者调研',
    sourceEn: 'Local environmental regulations + consumer surveys',
    frequency: '进入前一次性',
    priority: 'low',
    cost: 'low',
    effort: 'quick',
    probioticSpecific: '欧盟要求可回收包装；婴幼儿产品需考虑包装安全（防误食）',
    probioticSpecificEn: 'EU requires recyclable packaging; infant products need packaging safety (child-resistant)',
  },
  {
    dimension: 'esg',
    dataPoint: '菌株来源伦理与可持续性评估',
    dataPointEn: 'Strain source ethics and sustainability assessment',
    collectionMethod: '供应链审查 + 伦理评估',
    collectionMethodEn: 'Supply chain audit + ethics assessment',
    source: '供应商审计 + 伦理咨询',
    sourceEn: 'Supplier audit + ethics consultation',
    frequency: '进入前一次性 + 年度复核',
    priority: 'medium',
    cost: 'low',
    effort: 'moderate',
    probioticSpecific: '若使用粪便菌群移植(FMT)来源的菌株，需特别关注伦理合规；宠物益生菌关注动物福利标准',
    probioticSpecificEn: 'If using FMT-derived strains, need special ethics compliance; pet probiotics care about animal welfare standards',
  },
];

// ============================================================
// 六、推荐国家优先级（针对益生菌产品）
// ============================================================

export interface ProbioticCountryRecommendation {
  countryId: string;
  countryName: string;
  region: string;
  priority: 'tier1' | 'tier2' | 'tier3';
  rationale: string;
  rationaleEn: string;
  keyOpportunity: string;
  keyOpportunityEn: string;
  keyChallenge: string;
  keyChallengeEn: string;
  entryMode: string;
  timeToMarket: string;       // 预计进入时间
  estimatedInvestment: string; // 预计投资规模
}

export const PROBIOTIC_COUNTRY_RECOMMENDATIONS: ProbioticCountryRecommendation[] = [
  {
    countryId: 'singapore',
    countryName: '新加坡',
    region: '东南亚',
    priority: 'tier1',
    rationale: '东南亚最高的消费者健康意识、成熟的保健食品监管体系（HSA）、亲商环境',
    rationaleEn: 'Highest consumer health awareness in Southeast Asia, mature health product regulation (HSA), business-friendly environment',
    keyOpportunity: '东南亚益生菌市场领导者，可辐射整个东盟',
    keyOpportunityEn: 'Probiotic market leader in Southeast Asia, can radiate across ASEAN',
    keyChallenge: '市场规模有限，需作为区域枢纽而非单一市场运营',
    keyChallengeEn: 'Limited market size, need to operate as regional hub not single market',
    entryMode: '设立区域总部 + 跨境电商 + 经销商合作',
    timeToMarket: '12-18个月',
    estimatedInvestment: '500-800万RMB',
  },
  {
    countryId: 'japan',
    countryName: '日本',
    region: '东北亚',
    priority: 'tier1',
    rationale: '全球最大益生菌市场之一，消费者教育成熟，对中国草本/汉方概念有一定接受度',
    rationaleEn: 'One of the largest probiotic markets globally, mature consumer education, some acceptance of Chinese herbal/Kampo concepts',
    keyOpportunity: '特定细分人群（如肠道敏感、更年期女性）对功能性原料有高接受度',
    keyOpportunityEn: 'Specific segments (gut-sensitive, menopausal women) have high acceptance of functional ingredients',
    keyChallenge: '品牌信任壁垒极高，消费者偏好本国品牌，功效宣称限制严格',
    keyChallengeEn: 'Extremely high brand trust barrier, consumer preference for domestic brands, strict claim restrictions',
    entryMode: '先通过跨境电商建立认知，再寻求功能性食品/特医食品注册路径',
    timeToMarket: '24-36个月',
    estimatedInvestment: '800-1500万RMB',
  },
  {
    countryId: 'australia',
    countryName: '澳大利亚',
    region: '大洋洲',
    priority: 'tier1',
    rationale: '消费者对益生菌认知度高，监管相对清晰（TGA），华人社区渠道可作为早期切入',
    rationaleEn: 'High consumer probiotic awareness, relatively clear regulation (TGA), Chinese community channels for early entry',
    keyOpportunity: '华人社区作为早期采用者，逐步向主流市场渗透',
    keyOpportunityEn: 'Chinese community as early adopters, gradually penetrate mainstream market',
    keyChallenge: '本地品牌（如Life-Space）已建立强势地位，竞争激烈',
    keyChallengeEn: 'Local brands (e.g., Life-Space) have established strong position, intense competition',
    entryMode: 'TGA注册 + 药店/超市渠道 + 华人社区营销',
    timeToMarket: '18-24个月',
    estimatedInvestment: '600-1000万RMB',
  },
  {
    countryId: 'usa',
    countryName: '美国',
    region: '北美',
    priority: 'tier1',
    rationale: '全球最大保健食品市场，益生菌品类成熟，消费者支付意愿高，监管相对清晰（FDA/Dietary Supplement）',
    rationaleEn: 'Largest global health supplement market, mature probiotic category, high consumer WTP, relatively clear regulation (FDA/Dietary Supplement)',
    keyOpportunity: '特定细分人群（肠易激、情绪健康、运动恢复）对功能益生菌需求旺盛',
    keyOpportunityEn: 'Specific segments (IBS, mental health, sports recovery) have strong demand for functional probiotics',
    keyChallenge: '品牌建设成本高，获客成本高，竞品营销投入巨大',
    keyChallengeEn: 'High brand building cost, high CAC, huge competitor marketing investment',
    entryMode: 'NDI通知/GRAS认定 + 亚马逊DTC + 专业渠道（维生素商店）',
    timeToMarket: '18-30个月',
    estimatedInvestment: '1000-2000万RMB',
  },
  {
    countryId: 'uk',
    countryName: '英国',
    region: '欧洲',
    priority: 'tier2',
    rationale: '欧洲第二大保健食品市场，消费者健康意识高，监管框架清晰（MHRA/FSA）',
    rationaleEn: 'Second largest European health supplement market, high consumer health awareness, clear regulatory framework (MHRA/FSA)',
    keyOpportunity: 'NHS对特定益生菌的认可，可作为医疗渠道切入点',
    keyOpportunityEn: 'NHS recognition of specific probiotics, can be entry point for medical channel',
    keyChallenge: '脱欧后监管独立，认证流程可能与欧盟不同',
    keyChallengeEn: 'Post-Brexit independent regulation, certification may differ from EU',
    entryMode: 'THR医药认证 + 药店渠道 + 跨境电商',
    timeToMarket: '24-36个月',
    estimatedInvestment: '800-1200万RMB',
  },
  {
    countryId: 'southkorea',
    countryName: '韩国',
    region: '东北亚',
    priority: 'tier2',
    rationale: '功能食品市场成熟，消费者对本国品牌忠诚度高，与中国文化相近',
    rationaleEn: 'Mature functional food market, high consumer loyalty to domestic brands, similar culture to China',
    keyOpportunity: 'K-beauty/健康风潮影响下，功能性食品接受度高',
    keyOpportunityEn: 'Under K-beauty/health trend influence, high acceptance of functional foods',
    keyChallenge: 'KFTC垄断地位，本地品牌竞争激烈',
    keyChallengeEn: 'KFTC monopoly position, intense competition from local brands',
    entryMode: 'MFDS食品注册 + 化妆品店/健康店渠道',
    timeToMarket: '18-24个月',
    estimatedInvestment: '500-800万RMB',
  },
  {
    countryId: 'germany',
    countryName: '德国',
    region: '欧洲',
    priority: 'tier2',
    rationale: '欧洲最大保健食品市场，消费者品质要求高，对中国品牌有偏见但可通过品质突破',
    rationaleEn: 'Largest European health supplement market, high consumer quality requirements, bias against Chinese brands but can break through with quality',
    keyOpportunity: '高端细分市场（有机、临床级）对功效证据有需求，中国原料优势',
    keyOpportunityEn: 'Premium segment (organic, clinical-grade) demands efficacy evidence, Chinese ingredient advantage',
    keyChallenge: '德语区（德国、奥地利、瑞士）品牌忠诚度极高',
    keyChallengeEn: 'German-speaking region (Germany, Austria, Switzerland) has extremely high brand loyalty',
    entryMode: 'Novel Food注册 + 药店/有机店渠道',
    timeToMarket: '24-36个月',
    estimatedInvestment: '800-1200万RMB',
  },
  {
    countryId: 'thailand',
    countryName: '泰国',
    region: '东南亚',
    priority: 'tier2',
    rationale: '东南亚第二大市场，消费者对草药/传统医药接受度高，华人社区规模大',
    rationaleEn: 'Second largest Southeast Asian market, high consumer acceptance of herbal/traditional medicine, large Chinese community',
    keyOpportunity: '华人社区 + 旅游零售作为早期渠道',
    keyOpportunityEn: 'Chinese community + tourism retail as early channels',
    keyChallenge: '注册周期较长，腐败风险影响合规',
    keyChallengeEn: 'Longer registration timeline, corruption risk affects compliance',
    entryMode: 'Thai FDA注册 + 药店/旅游零售渠道',
    timeToMarket: '18-24个月',
    estimatedInvestment: '400-700万RMB',
  },
  {
    countryId: 'uae',
    countryName: '阿联酋',
    region: '中东',
    priority: 'tier3',
    rationale: '中东最开放市场，高消费力，健康意识提升，迪拜作为区域物流枢纽',
    rationaleEn: 'Most open market in Middle East, high purchasing power, rising health awareness, Dubai as regional logistics hub',
    keyOpportunity: '辐射海湾六国 + 非洲市场，高端定位机会',
    keyOpportunityEn: 'Radiate to Gulf 6 + Africa, premium positioning opportunity',
    keyChallenge: '宗教文化对产品成分的敏感性，HALAL认证成本',
    keyChallengeEn: 'Religious/cultural sensitivity to product ingredients, HALAL certification cost',
    entryMode: 'HALAL认证 + 免税店/高端超市渠道',
    timeToMarket: '12-18个月',
    estimatedInvestment: '300-600万RMB',
  },
  {
    countryId: 'malaysia',
    countryName: '马来西亚',
    region: '东南亚',
    priority: 'tier3',
    rationale: '穆斯林市场入口，HALAL认证可覆盖广大穆斯林市场，华人社区渠道成熟',
    rationaleEn: 'Gateway to Muslim market, HALAL certification covers wider Muslim market, mature Chinese community channels',
    keyOpportunity: 'HALAL认证 + 穆斯林渠道 + 辐射印尼穆斯林市场',
    keyOpportunityEn: 'HALAL certification + Muslim channels + radiate to Indonesian Muslim market',
    keyChallenge: '与新加坡相比市场规模有限，需与区域战略配合',
    keyChallengeEn: 'Limited market size compared to Singapore, need regional strategy alignment',
    entryMode: 'NPRA注册 + HALAL认证 + 药店/清真超市渠道',
    timeToMarket: '12-18个月',
    estimatedInvestment: '300-500万RMB',
  },
];

// ============================================================
// 七、工具函数
// ============================================================

/**
 * 根据产品类型获取益生菌Profile
 */
export function getProbioticProfile(id: ProbioticProfileId) {
  return PROBIOTIC_PROFILES[id] ?? PROBIOTIC_PROFILES.probiotic_general;
}

/**
 * 获取益生菌专用硬门槛（按产品类型筛选）
 */
export function getProbioticGatesForProduct(productType: ProbioticProfileId) {
  return PROBIOTIC_HARD_GATES.filter(
    (gate) => gate.productType.includes(productType)
  );
}

/**
 * 获取某国家针对益生菌产品的推荐优先级
 */
export function getProbioticCountryRecommendation(countryId: string) {
  return PROBIOTIC_COUNTRY_RECOMMENDATIONS.find((c) => c.countryId === countryId);
}

/**
 * 获取益生菌维度评估问题（替换通用问题）
 */
export function getProbioticDimensionQuestion(dimensionId: DimensionId) {
  return PROBIOTIC_DIMENSION_QUESTIONS[dimensionId] ?? null;
}

/**
 * 导出与通用评估体系兼容的格式
 * 将益生菌专用配置映射到通用11维权重
 */
export function mapProbioticWeightsToGeneric(
  productType: ProbioticProfileId,
  customAdjustments?: Partial<Record<DimensionId, number>>
): Record<DimensionId, number> {
  const profile = getProbioticProfile(productType);
  const baseWeights = profile.weights;
  
  if (!customAdjustments) {
    return baseWeights as Record<DimensionId, number>;
  }
  
  return Object.fromEntries(
    Object.entries(baseWeights).map(([key, value]) => [
      key,
      customAdjustments[key as DimensionId] ?? value,
    ])
  ) as Record<DimensionId, number>;
}
