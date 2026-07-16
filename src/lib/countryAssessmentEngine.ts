/**
 * 出海目标国家评估规则引擎
 *
 * 纯函数实现，所有可序列化的输入都能跑出可审计的结果。
 * 核心公式与口径来自 enterprise-global-country-assessment.canvas.tsx：
 *  - 原始机会分 O = Σ wᵢ · (rᵢ/5)
 *  - 可信度调整分 Oᶜ = Σ wᵢ · [cᵢ · (rᵢ/5) + (1 - cᵢ) · 0.5]
 *  - 企业准备度 R = Σ wᵢ · (rᵢ/5)
 *  - 硬门槛触发时结论始终为"停止 / 关闭红旗"
 *
 * 该模块只输出结构和数值，不渲染 UI，也不调用网络。
 */

import {
  COUNTRIES,
  DIMENSIONS,
  DIMENSION_WEIGHT_SUM,
  EVIDENCE_LEVELS,
  HARD_GATES,
  PROFILES,
  READINESS_DIMENSIONS,
  SCORE_LEVELS,
  type DimensionId,
  type EvidenceLevel,
  type GateId,
  type GateStatus,
  type ProfileId,
  type ReadinessId,
  type ScoreLevel,
} from "@/data/countryAssessment";

// ----------------------------- 类型 -----------------------------

export interface CountryAssessmentInput {
  /** 企业层面准备度评分 1–5，企业准备度维度上的得分 */
  readinessScores: Record<ReadinessId, ScoreLevel>;
  /** 每个候选国家的评分与证据 */
  countries: Array<{
    countryId: string;
    entryMode?: string;
    /** 11 维度评分 1–5，未填默认 3，但 dataset 层级仍返回 "neutral" 提示用户确认 */
    scores: Record<DimensionId, ScoreLevel>;
    /** 11 维度证据等级，可信度对应系数；缺省按 C（0.65）处理 */
    confidence: Record<DimensionId, EvidenceLevel>;
    /** 6 个硬门槛状态：pass=已通过、pending=待验证、triggered=已触发 */
    gates: Record<GateId, GateStatus>;
    /** 客户/团队对该国的初始判断，作为轻度调整，不影响硬门槛 */
    notes?: string;
  }>;
}

export interface DimensionScore {
  weight: number; // 权重 %
  score: ScoreLevel;
  confidence: EvidenceLevel;
  /** 可信度调整后折算到 0–1 的分量（在 w% 归一化之前的 0–5 等价值） */
  effectiveScore: number;
}

export interface GateEvaluation {
  id: GateId;
  status: GateStatus;
  triggered: boolean;
  pending: boolean;
  passed: boolean;
}

export interface CountryResult {
  countryId: string;
  entryMode?: string;
  rawScore: number;
  adjustedScore: number;
  weightedConfidence: number; // 0–1
  confidenceGrade: "A" | "B" | "C" | "D";
  readinessScore: number;
  overallRecommendation: "scale" | "pilot" | "build-capability" | "option" | "hold" | "stop";
  recommendationDetail: string;
  triggeredGates: GateEvaluation[];
  pendingGates: GateEvaluation[];
  passedGates: GateEvaluation[];
  topStrengths: Array<{ dimension: DimensionId; score: ScoreLevel }>;
  topGaps: Array<{ dimension: DimensionId; score: ScoreLevel }>;
  confidence: "high" | "medium" | "low";
  checklist: ChecklistItem[];
  totalDimensions: number;
}

export interface ChecklistItem {
  /** 优先级，越小越靠前 */
  priority: number;
  dimension?: DimensionId;
  gateId?: GateId;
  type: "low-confidence" | "pending-gate" | "evidence-gap" | "model-hygiene";
  title: string;
  rationale: string;
  source: string;
  cadence: string;
  minimumAction: string;
  responsibleRole: string;
}

export interface AssessmentSummary {
  profileId: ProfileId;
  profileName: string;
  profileNote: string;
  weightSum: number;
  weightIsValid: boolean;
  /** 全部候选国家的横向排序（按 adjustedScore 降序，触发硬门槛置底） */
  countryResults: CountryResult[];
  readinessScore: number;
  /** 整体准备度维度级明细，便于 UI 显示 */
  readinessBreakdown: Array<{ id: ReadinessId; name: string; weight: number; score: ScoreLevel }>;
  /** 跨国家汇总的关键风险与关键证据缺口（不重复按国家清单里的内容） */
  crossCuttingRisks: string[];
}

// ----------------------------- 工具 -----------------------------

const NEUTRAL_SCORE_VALUE = 0.5; // 可信度为 0 时整体分量收敛到 0.5（即 2.5/5）

function sumWeights(weights: Record<DimensionId, number>): number {
  return DIMENSIONS.reduce((total, dimension) => total + (weights[dimension.id] ?? 0), 0);
}

function completenessOf<Id extends string>(
  values: Record<Id, ScoreLevel | EvidenceLevel>,
  ids: ReadonlyArray<Id>,
): number {
  if (ids.length === 0) return 0;
  let present = 0;
  for (const id of ids) {
    const value = values[id];
    if (typeof value === "number" && Number.isFinite(value)) present += 1;
  }
  return present / ids.length;
}

function gradeFromConfidence(weighted: number): "A" | "B" | "C" | "D" {
  if (weighted >= 0.85) return "A";
  if (weighted >= 0.72) return "B";
  if (weighted >= 0.55) return "C";
  return "D";
}

function pickTop<T extends { score: ScoreLevel }>(
  items: Array<{ id: string; score: ScoreLevel }>,
  direction: "high" | "low",
  limit: number,
): Array<{ dimension: DimensionId; score: ScoreLevel }> {
  const sorted = [...items].sort((a, b) =>
    direction === "high" ? b.score - a.score : a.score - b.score,
  );
  return sorted.slice(0, limit).map(({ id, score }) => ({
    dimension: id as DimensionId,
    score,
  }));
}

// ----------------------------- 评分 -----------------------------

export function validateWeights(weights: Record<DimensionId, number>) {
  const total = sumWeights(weights);
  const rounded = Math.round(total * 100) / 100;
  return {
    total,
    weightIsValid: rounded === DIMENSION_WEIGHT_SUM,
    rounded,
  };
}

export function normalizeWeights(
  weights: Record<DimensionId, number>,
): Record<DimensionId, number> {
  const total = sumWeights(weights);
  if (total <= 0) {
    const equal = DIMENSION_WEIGHT_SUM / DIMENSIONS.length;
    return DIMENSIONS.reduce(
      (acc, dimension) => ({ ...acc, [dimension.id]: equal }),
      {} as Record<DimensionId, number>,
    );
  }
  return DIMENSIONS.reduce(
    (acc, dimension) => ({
      ...acc,
      [dimension.id]: (weights[dimension.id] ?? 0) * (DIMENSION_WEIGHT_SUM / total),
    }),
    {} as Record<DimensionId, number>,
  );
}

export function calculateOpportunityScore(
  weights: Record<DimensionId, number>,
  scores: Record<DimensionId, ScoreLevel>,
  confidence?: Record<DimensionId, EvidenceLevel>,
) {
  let raw = 0;
  let adjusted = 0;
  let weightedConfidence = 0;
  for (const dimension of DIMENSIONS) {
    const w = weights[dimension.id] ?? 0;
    const r = scores[dimension.id] ?? 3;
    const c = confidence?.[dimension.id] ?? 0.65;
    const neutralComponent = c * (r / 5) + (1 - c) * NEUTRAL_SCORE_VALUE;
    raw += w * (r / 5);
    adjusted += w * neutralComponent;
    weightedConfidence += w * c;
  }
  // 权重 wᵢ 是百分比（合计 100），rᵢ/5 是 0–1 之间的小数，因此结果已经是 0–100 分制
  return {
    rawScore: raw,
    adjustedScore: adjusted,
    weightedConfidence,
  };
}

export function calculateReadinessScore(scores: Record<ReadinessId, ScoreLevel>): number {
  return READINESS_DIMENSIONS.reduce((sum, dimension) => {
    const value = scores[dimension.id] ?? 3;
    return sum + dimension.weight * (value / 5);
  }, 0);
}

// ----------------------------- 硬门槛 -----------------------------

export function evaluateGates(statuses: Record<GateId, GateStatus>): GateEvaluation[] {
  return HARD_GATES.map((gate) => {
    const status = statuses[gate.id] ?? "pass";
    return {
      id: gate.id,
      status,
      triggered: status === "triggered",
      pending: status === "pending",
      passed: status === "pass",
    };
  });
}

export function countTriggeredAndPending(gates: GateEvaluation[]) {
  let triggered = 0;
  let pending = 0;
  for (const gate of gates) {
    if (gate.triggered) triggered += 1;
    else if (gate.pending) pending += 1;
  }
  return { triggered, pending };
}

// ----------------------------- 推荐与清单 -----------------------------

export function deriveRecommendation(
  adjustedScore: number,
  readinessScore: number,
  triggeredGateCount: number,
): {
  overallRecommendation: CountryResult["overallRecommendation"];
  recommendationDetail: string;
} {
  if (triggeredGateCount > 0) {
    return {
      overallRecommendation: "stop",
      recommendationDetail:
        "硬门槛不能被市场分数抵消。仅在责任人、解决路径与截止日期明确后重启。",
    };
  }
  if (adjustedScore >= 75 && readinessScore >= 70) {
    return {
      overallRecommendation: "scale",
      recommendationDetail:
        "机会、证据与组织条件均较强，可进入分阶段拨款并保留退出触发器。",
    };
  }
  if (adjustedScore >= 68 && readinessScore >= 55) {
    return {
      overallRecommendation: "pilot",
      recommendationDetail:
        "具备进入潜力，但必须用真实客户、价格、履约和回款数据关闭关键假设。",
    };
  }
  if (adjustedScore >= 68) {
    return {
      overallRecommendation: "build-capability",
      recommendationDetail:
        "市场有吸引力，先补产品、渠道、合规或团队准备度短板，避免把好市场做成坏生意。",
    };
  }
  if (adjustedScore >= 55 && readinessScore >= 60) {
    return {
      overallRecommendation: "option",
      recommendationDetail:
        "企业较有能力但国家吸引力一般，控制不可逆投入，以触发器决定是否加码。",
    };
  }
  return {
    overallRecommendation: "hold",
    recommendationDetail:
      "机会与准备度均不足，先关闭关键数据缺口，等结构性触发器再评估。",
  };
}

const CHECKLIST_SOURCE_BY_DIMENSION: Record<DimensionId, { source: string; cadence: string; role: string; action: string }> = {
  fit: {
    source: "管理层议题 + 区域网络图",
    cadence: "评估启动前",
    role: "战略 / 业务负责人",
    action: "明确企业目标与该国家角色的关联，比较至少 3 个候选国家的同一种角色。",
  },
  demand: {
    source: "海关、官方统计、客户访谈",
    cadence: "桌面阶段 + 试点期间",
    role: "市场 / 业务负责人",
    action: "至少 15–30 个 ICP 访谈、5–10 个输单/竞品客户访谈，获取意向书或试单。",
  },
  access: {
    source: "渠道访谈 + 客户引用核验",
    cadence: "桌面 + 试点",
    role: "销售 / 渠道",
    action: "列出候选渠道并核验活跃度，验证至少一个伙伴通过共同商机完成首单。",
  },
  competition: {
    source: "竞品价格 + 客户赢输",
    cadence: "每月更新",
    role: "市场 / 产品",
    action: "完成 5–8 个赢输案例复盘与至少 3 家竞品神秘采购，记录反击概率。",
  },
  regulation: {
    source: "当地律师 + 监管机构原文",
    cadence: "法规变化即时",
    role: "法务 / 合规",
    action: "拿到书面意见、牌照甘特图与税务备忘录，所有时间/费用/前置依赖落档。",
  },
  macro: {
    source: "IMF/世界银行 + 央行",
    cadence: "季度",
    role: "战略 / 财务",
    action: "压力情景测试（汇率、利率、社会稳定），记录情景对收入和现金峰值的冲击。",
  },
  economics: {
    source: "价格测试 + 物流 / 工资 / 租金",
    cadence: "试点实时",
    role: "财务 / 业务",
    action: "建净到手收入、CM2、回收期和现金峰值模型，做基准 / 下行 / 上行三情景。",
  },
  operations: {
    source: "3PL/支付网关 + 真实小单",
    cadence: "试点期间",
    role: "运营 / 供应链",
    action: "跑通端到端：下单—清关—履约—退换—售后—收款，确认 SLA 和异常成本。",
  },
  talent: {
    source: "薪酬调查 + 猎头访谈",
    cadence: "评估 + 启动前",
    role: "HR / 业务负责人",
    action: "识别关键岗位和后备候选人，确认总部支持容量与跨时区协作机制。",
  },
  tax: {
    source: "法律税务备忘录 + 双边税约",
    cadence: "启动前",
    role: "财务 / 法务",
    action: "确认实体、IP、转让定价和资金汇回路径，做交易流模型与银行开户验证。",
  },
  esg: {
    source: "制裁清单 + 媒体扫描 + 供应商审计",
    cadence: "持续监控",
    role: "风控 / ESG",
    action: "完成 KYB / 制裁筛查、ESG 风险评估和声誉扫描，记录主要风险与缓解责任人。",
  },
};

const GATE_HARDENED_DEFAULT: Record<GateId, { source: string; cadence: string; role: string; action: string }> = {
  sanctions: {
    source: "制裁 / 出口管制清单",
    cadence: "即刻",
    role: "法务 / 合规 / 安全",
    action: "列出制裁暴露对象（产品 / 技术 / 主体 / 资金路径），并指定解除或退出路径。",
  },
  license: {
    source: "当地律师 + 监管原文",
    cadence: "即时",
    role: "法务 / 业务负责人",
    action: "对比牌照 / 认证甘特图与窗口期，不可行时记录替代进入模式或退出。",
  },
  data: {
    source: "数据 / 安全技术评估",
    cadence: "即时",
    role: "安全 / 技术 / 法务",
    action: "完成数据流映射、加密与跨境传输评估，与预算和能力现状对照。",
  },
  safety: {
    source: "ESG / 风险登记册",
    cadence: "即时",
    role: "风控 / ESG / 董事会",
    action: "把安全 / 伦理 / 声誉风险与底线对照，记录红线和拒绝条件。",
  },
  economics: {
    source: "三情景经济模型 + 现金峰值",
    cadence: "即时",
    role: "财务 / 业务负责人",
    action: "把下行情景最大亏损 / 现金峰值与止损线对比，超出即拒绝或延后。",
  },
  capitalControl: {
    source: "财务 + 法务备忘录",
    cadence: "即时",
    role: "财务 / 法务 / 投委会",
    action: "验证利润汇回路径、少数股东治理和资产暴露，关键风险不能缓解则停止。",
  },
};

export function buildChecklist(
  profile: ProfileId,
  scores: Record<DimensionId, ScoreLevel>,
  confidence: Record<DimensionId, EvidenceLevel>,
  gates: GateEvaluation[],
): ChecklistItem[] {
  const weights = (PROFILES[profile] ?? PROFILES.general).weights;
  const items: ChecklistItem[] = [];
  let priority = 0;

  // 硬门槛：triggered 优先；pending 次之
  for (const gate of gates) {
    if (!gate.triggered && !gate.pending) continue;
    const meta = GATE_HARDENED_DEFAULT[gate.id];
    items.push({
      priority: priority++,
      gateId: gate.id,
      type: gate.triggered ? "pending-gate" : "pending-gate",
      title: `${gate.triggered ? "关闭" : "验证"}硬门槛：${HARD_GATES.find((definition) => definition.id === gate.id)?.name ?? gate.id}`,
      rationale: gate.triggered
        ? "硬门槛已触发，必须先关闭红旗，再考虑任何进入动作。"
        : "硬门槛尚未验证，未关闭前不能进入加权评分。",
      source: meta.source,
      cadence: meta.cadence,
      minimumAction: meta.action,
      responsibleRole: meta.role,
    });
  }

  // 维度级证据 / 短板：按"高权重 + 低可信度 / 偏低分数"排序
  const enriched = DIMENSIONS.map((dimension) => ({
    id: dimension.id,
    weight: weights[dimension.id] ?? 0,
    score: scores[dimension.id] ?? 3,
    confidence: confidence[dimension.id] ?? 0.65,
  })).sort((a, b) => {
    // 优先级：触发硬门槛 > 低分；同分时按权重与低可信度排序
    const worst = (item: typeof a) => (item.score <= 2 ? 2 : item.confidence <= 0.65 ? 1 : 0);
    return worst(b) - worst(a) || b.weight - a.weight;
  });

  for (const entry of enriched) {
    const dimension = DIMENSIONS.find((definition) => definition.id === entry.id);
    if (!dimension) continue;
    const meta = CHECKLIST_SOURCE_BY_DIMENSION[entry.id];
    const lowConfidence = entry.confidence <= 0.65;
    const lowScore = entry.score <= 2;

    if (lowScore) {
      items.push({
        priority: priority++,
        dimension: entry.id,
        type: "evidence-gap",
        title: `维度"${dimension.name}"评分偏低（${entry.score}/5），需要补证据或调整假设`,
        rationale: `权重 ${entry.weight}%，低分会显著拉低调整分；当前证据等级 ${labelConfidence(entry.confidence)}。`,
        source: meta.source,
        cadence: meta.cadence,
        minimumAction: meta.action,
        responsibleRole: meta.role,
      });
    } else if (lowConfidence) {
      items.push({
        priority: priority++,
        dimension: entry.id,
        type: "low-confidence",
        title: `维度"${dimension.name}"证据等级偏低（${labelConfidence(entry.confidence)}）`,
        rationale: `评分 ${entry.score}/5 暂未交叉验证；可信度 ${entry.confidence} 会让调整分向 2.5/5 收缩。`,
        source: meta.source,
        cadence: meta.cadence,
        minimumAction: meta.action,
        responsibleRole: meta.role,
      });
    }
  }

  // 模型治理：把"权重合 100%、每个 country 评分完整度"也写成清单常驻项
  items.push({
    priority: priority++,
    type: "model-hygiene",
    title: "冻结评估权重与硬门槛口径",
    rationale:
      "任何权重 / 阈值 / 数据口径调整都要记录版本与理由，投委会确认前不能修改结论。",
    source: "评估制度",
    cadence: "评估启动前 + 每次复盘",
    minimumAction: "在评估启动会议上确认权重、硬门槛和比较组，并签字存档。",
    responsibleRole: "战略 / 投委会",
  });

  return items;
}

function labelConfidence(value: EvidenceLevel): string {
  return EVIDENCE_LEVELS.find((level) => level.value === value)?.label ?? "C";
}

function labelScore(value: ScoreLevel): string {
  return SCORE_LEVELS.find((level) => level.value === value)?.label ?? String(value);
}

// ----------------------------- 主入口 -----------------------------

export function evaluateCountry(input: {
  profileId: ProfileId;
  country: CountryAssessmentInput["countries"][number];
  readinessScores: Record<ReadinessId, ScoreLevel>;
}): CountryResult {
  const { profileId, country, readinessScores } = input;
  const profile = PROFILES[profileId] ?? PROFILES.general;
  const weights = profile.weights;

  const scoreCalc = calculateOpportunityScore(weights, country.scores, country.confidence);
  const readinessScore = calculateReadinessScore(readinessScores);
  const gates = evaluateGates(country.gates);
  const { triggered } = countTriggeredAndPending(gates);

  const confidenceGrade = gradeFromConfidence(scoreCalc.weightedConfidence / DIMENSION_WEIGHT_SUM);
  const confidenceLevel: "high" | "medium" | "low" =
    confidenceGrade === "A" || confidenceGrade === "B"
      ? "high"
      : confidenceGrade === "C"
        ? "medium"
        : "low";

  const { overallRecommendation, recommendationDetail } = deriveRecommendation(
    scoreCalc.adjustedScore,
    readinessScore,
    triggered,
  );

  const triggerList = gates.filter((gate) => gate.triggered);
  const pendingList = gates.filter((gate) => gate.pending);
  const passList = gates.filter((gate) => gate.passed);

  const dimensionScores = DIMENSIONS.map((dimension) => ({
    id: dimension.id,
    score: country.scores[dimension.id] ?? 3,
    confidence: country.confidence[dimension.id] ?? 0.65,
  }));

  const topStrengths = pickTop(dimensionScores, "high", 3);
  const topGaps = pickTop(dimensionScores, "low", 3);

  const checklist = buildChecklist(profileId, country.scores, country.confidence, gates);

  return {
    countryId: country.countryId,
    entryMode: country.entryMode,
    rawScore: roundOne(scoreCalc.rawScore),
    adjustedScore: roundOne(scoreCalc.adjustedScore),
    weightedConfidence: roundTwo(scoreCalc.weightedConfidence / DIMENSION_WEIGHT_SUM),
    confidenceGrade,
    readinessScore: roundOne(readinessScore),
    overallRecommendation,
    recommendationDetail,
    triggeredGates: triggerList,
    pendingGates: pendingList,
    passedGates: passList,
    topStrengths,
    topGaps,
    confidence: confidenceLevel,
    checklist,
    totalDimensions: DIMENSIONS.length,
  };
}

export function evaluateAssessment(input: {
  profileId: ProfileId;
  countries: CountryAssessmentInput["countries"];
  readinessScores: Record<ReadinessId, ScoreLevel>;
  customWeights?: Record<DimensionId, number>;
}): AssessmentSummary {
  const profile = (PROFILES[input.profileId] ?? PROFILES.general);
  const effectiveWeights = input.customWeights ?? profile.weights;
  const readinessScore = calculateReadinessScore(input.readinessScores);

  const countryResults = input.countries
    .map((country) =>
      evaluateCountry({ profileId: input.profileId, country, readinessScores: input.readinessScores }),
    )
    .sort((a, b) => {
      // 触发硬门槛的沉底；否则按调整分排序
      if ((a.triggeredGates.length > 0) !== (b.triggeredGates.length > 0)) {
        return a.triggeredGates.length > 0 ? 1 : -1;
      }
      return b.adjustedScore - a.adjustedScore;
    });

  const { weightIsValid, total } = validateWeights(effectiveWeights);

  const crossCuttingRisks: string[] = [];
  if (countryResults.some((result) => result.triggeredGates.length > 1)) {
    crossCuttingRisks.push("多个候选国家同时触发硬门槛，需要法务 / 合规介入复核整体进入集合。");
  }
  if (countryResults.length > 0 && countryResults.every((result) => result.confidence === "low")) {
    crossCuttingRisks.push("所有国家证据等级都为 D / C，结论应被视为假设，下一步必须转化为试点实验。");
  }
  if (!weightIsValid) {
    crossCuttingRisks.push(`评估权重合计 ${roundOne(total)}%，不等于 100%；评分前必须归一化或冻结当前分配。`);
  }
  if (readinessScore < 55) {
    crossCuttingRisks.push("企业准备度低于 55 分，先解决产品、合规、团队或资本短板，再追加国家承诺。");
  }

  return {
    profileId: input.profileId,
    profileName: profile.name,
    profileNote: profile.note,
    weightSum: roundOne(total),
    weightIsValid,
    countryResults,
    readinessScore: roundOne(readinessScore),
    readinessBreakdown: READINESS_DIMENSIONS.map((dimension) => ({
      id: dimension.id,
      name: dimension.name,
      weight: dimension.weight,
      score: input.readinessScores[dimension.id] ?? 3,
    })),
    crossCuttingRisks,
  };
}

// ----------------------------- 数字格式化 -----------------------------

function roundOne(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

function roundTwo(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

export { completenessOf };
