/**
 * countryAssessmentEngine 单元测试
 *
 * 覆盖：
 *  - 权重校验与归一化
 *  - 原始机会分、可信度调整分、企业准备度
 *  - 硬门槛判定与"分数无法抵消红旗"
 *  - 国家排序（触发硬门槛置底）
 *  - 清单优先级：硬门槛 > 短板维度 > 低可信度
 */

import { describe, expect, it } from 'vitest';

import {
  DIMENSIONS,
  HARD_GATES,
  PROFILES,
  READINESS_DIMENSIONS,
} from '@/data/countryAssessment';
import type {
  DimensionId,
  EvidenceLevel,
  GateStatus,
  ProfileId,
  ReadinessId,
  ScoreLevel,
} from '@/data/countryAssessment';
import {
  calculateOpportunityScore,
  calculateReadinessScore,
  countTriggeredAndPending,
  evaluateAssessment,
  evaluateCountry,
  evaluateGates,
  normalizeWeights,
  validateWeights,
  type CountryAssessmentInput,
} from './countryAssessmentEngine';

const ALL_DIMENSION_IDS: DimensionId[] = DIMENSIONS.map((dim) => dim.id);
const ALL_GATE_IDS = HARD_GATES.map((gate) => gate.id);

function makeScores(map: Partial<Record<DimensionId, ScoreLevel>> = {}) {
  const defaults: Record<DimensionId, ScoreLevel> = ALL_DIMENSION_IDS.reduce(
    (acc, id) => ({ ...acc, [id]: 3 }),
    {} as Record<DimensionId, ScoreLevel>,
  );
  return { ...defaults, ...map };
}

function makeConfidence(map: Partial<Record<DimensionId, EvidenceLevel>> = {}) {
  const defaults: Record<DimensionId, EvidenceLevel> = ALL_DIMENSION_IDS.reduce(
    (acc, id) => ({ ...acc, [id]: 0.65 }),
    {} as Record<DimensionId, EvidenceLevel>,
  );
  return { ...defaults, ...map };
}

function makeGates(map: Partial<Record<(typeof ALL_GATE_IDS)[number], GateStatus>> = {}) {
  const defaults: Record<(typeof ALL_GATE_IDS)[number], GateStatus> = HARD_GATES.reduce(
    (acc, gate) => ({ ...acc, [gate.id]: "pass" }),
    {} as Record<(typeof ALL_GATE_IDS)[number], GateStatus>,
  );
  return { ...defaults, ...map };
}

function makeReadiness(map: Partial<Record<ReadinessId, ScoreLevel>> = {}) {
  const defaults: Record<ReadinessId, ScoreLevel> = READINESS_DIMENSIONS.reduce(
    (acc, dimension) => ({ ...acc, [dimension.id]: 3 }),
    {} as Record<ReadinessId, ScoreLevel>,
  );
  return { ...defaults, ...map };
}

describe('validateWeights', () => {
  it('通用模板权重总和等于 100', () => {
    const profile = PROFILES.general;
    const validation = validateWeights(profile.weights);
    expect(validation.weightIsValid).toBe(true);
    expect(validation.rounded).toBe(100);
  });

  it('每个行业模板权重总和都为 100', () => {
    for (const id of Object.keys(PROFILES) as ProfileId[]) {
      const validation = validateWeights(PROFILES[id].weights);
      expect(validation.weightIsValid, `weights invalid for ${id}`).toBe(true);
    }
  });

  it('权重总和不等于 100 时被识别为无效', () => {
    const weights = PROFILES.general.weights;
    const invalid = { ...weights, demand: (weights.demand ?? 0) + 5 } as Record<DimensionId, number>;
    const validation = validateWeights(invalid);
    expect(validation.weightIsValid).toBe(false);
  });
});

describe('normalizeWeights', () => {
  it('权重总和为正时缩放到 100', () => {
    const weights: Record<DimensionId, number> = { ...PROFILES.general.weights, demand: 28 } as Record<DimensionId, number>;
    const normalized = normalizeWeights(weights);
    const sum = Object.values(normalized).reduce((a, b) => a + b, 0);
    expect(Math.round(sum * 100) / 100).toBe(100);
  });

  it('总和非正时退化为等分', () => {
    const zeroWeights = ALL_DIMENSION_IDS.reduce(
      (acc, id) => ({ ...acc, [id]: 0 }),
      {} as Record<DimensionId, number>,
    );
    const normalized = normalizeWeights(zeroWeights);
    const equal = 100 / ALL_DIMENSION_IDS.length;
    for (const id of ALL_DIMENSION_IDS) {
      expect(normalized[id]).toBeCloseTo(equal, 4);
    }
  });
});

describe('calculateOpportunityScore', () => {
  it('所有维度全 5 分且证据 A 级时，原始 / 调整分都接近 100', () => {
    const scores = makeScores(
      ALL_DIMENSION_IDS.reduce(
        (acc, id) => ({ ...acc, [id]: 5 }),
        {} as Record<DimensionId, ScoreLevel>,
      ),
    );
    const confidence = makeConfidence(
      ALL_DIMENSION_IDS.reduce(
        (acc, id) => ({ ...acc, [id]: 0.95 }),
        {} as Record<DimensionId, EvidenceLevel>,
      ),
    );
    const { rawScore, adjustedScore, weightedConfidence } = calculateOpportunityScore(
      PROFILES.general.weights,
      scores,
      confidence,
    );
    expect(rawScore).toBeCloseTo(100, 1);
    expect(adjustedScore).toBeCloseTo(97.5, 1);
    expect(weightedConfidence).toBeGreaterThanOrEqual(95);
  });

  it('所有维度全 1 分时原始机会分接近下限', () => {
    const scores = makeScores(
      ALL_DIMENSION_IDS.reduce(
        (acc, id) => ({ ...acc, [id]: 1 }),
        {} as Record<DimensionId, ScoreLevel>,
      ),
    );
    const { rawScore } = calculateOpportunityScore(PROFILES.general.weights, scores);
    expect(rawScore).toBeLessThan(25);
  });

  it('低证据等级会把分数向中性值 2.5/5 收缩', () => {
    const scoresHigh = makeScores({ regulation: 5 });
    const scoresLow = makeScores({ regulation: 1 });

    const confidenceHigh = makeConfidence({ regulation: 0.95 });
    const confidenceLow = makeConfidence({ regulation: 0.4 });

    // 在高可信度下 5 与 1 的差应该比低可信度下更大
    const { adjustedScore: highScoreA } = calculateOpportunityScore(
      PROFILES.regulated.weights,
      scoresHigh,
      confidenceHigh,
    );
    const { adjustedScore: lowScoreA } = calculateOpportunityScore(
      PROFILES.regulated.weights,
      scoresLow,
      confidenceHigh,
    );
    const spreadAtHighConfidence = Math.abs(highScoreA - lowScoreA);

    const { adjustedScore: highScoreD } = calculateOpportunityScore(
      PROFILES.regulated.weights,
      scoresHigh,
      confidenceLow,
    );
    const { adjustedScore: lowScoreD } = calculateOpportunityScore(
      PROFILES.regulated.weights,
      scoresLow,
      confidenceLow,
    );
    const spreadAtLowConfidence = Math.abs(highScoreD - lowScoreD);

    // 低证据下极值差距应明显小于高证据下
    expect(spreadAtLowConfidence).toBeLessThan(spreadAtHighConfidence / 2);
    // 高证据下差距应超过 4 分（regulation 权重 20 × Δr/5 = 4）
    expect(spreadAtHighConfidence).toBeGreaterThan(4);
  });
});

describe('calculateReadinessScore', () => {
  it('所有准备度维度全 5 分时得 100', () => {
    const readiness = makeReadiness(
      READINESS_DIMENSIONS.reduce(
        (acc, dim) => ({ ...acc, [dim.id]: 5 }),
        {} as Record<ReadinessId, ScoreLevel>,
      ),
    );
    expect(calculateReadinessScore(readiness)).toBeCloseTo(100, 1);
  });

  it('所有准备度维度全 1 分时得 20', () => {
    const readiness = makeReadiness(
      READINESS_DIMENSIONS.reduce(
        (acc, dim) => ({ ...acc, [dim.id]: 1 }),
        {} as Record<ReadinessId, ScoreLevel>,
      ),
    );
    expect(calculateReadinessScore(readiness)).toBeCloseTo(20, 1);
  });
});

describe('evaluateGates & countTriggeredAndPending', () => {
  it('默认全部 pass，无触发 / 待验证', () => {
    const gates = evaluateGates(makeGates());
    const counts = countTriggeredAndPending(gates);
    expect(counts.triggered).toBe(0);
    expect(counts.pending).toBe(0);
    for (const gate of gates) {
      expect(gate.passed).toBe(true);
    }
  });

  it('能正确分类触发与待验证项', () => {
    const gates = evaluateGates(makeGates({
      sanctions: "triggered",
      license: "pending",
    }));
    const counts = countTriggeredAndPending(gates);
    expect(counts.triggered).toBe(1);
    expect(counts.pending).toBe(1);
    expect(gates[0].status).toBe("triggered");
  });
});

describe('evaluateCountry', () => {
  it('硬门槛触发时推荐为 stop，无论机会分多高', () => {
    const country: CountryAssessmentInput["countries"][number] = {
      countryId: "japan",
      scores: makeScores(
        ALL_DIMENSION_IDS.reduce(
          (acc, id) => ({ ...acc, [id]: 5 }),
          {} as Record<DimensionId, ScoreLevel>,
        ),
      ),
      confidence: makeConfidence(
        ALL_DIMENSION_IDS.reduce(
          (acc, id) => ({ ...acc, [id]: 0.95 }),
          {} as Record<DimensionId, EvidenceLevel>,
        ),
      ),
      gates: makeGates({ sanctions: "triggered" }),
    };
    const result = evaluateCountry({
      profileId: "general",
      country,
      readinessScores: makeReadiness(),
    });
    expect(result.overallRecommendation).toBe("stop");
    expect(result.triggeredGates.length).toBe(1);
    expect(result.rawScore).toBeGreaterThan(90);
  });

  it('硬门槛全部通过 + 高分 + 高准备度 = scale', () => {
    const country: CountryAssessmentInput["countries"][number] = {
      countryId: "japan",
      scores: makeScores(
        ALL_DIMENSION_IDS.reduce(
          (acc, id) => ({ ...acc, [id]: 4 }),
          {} as Record<DimensionId, ScoreLevel>,
        ),
      ),
      confidence: makeConfidence(
        ALL_DIMENSION_IDS.reduce(
          (acc, id) => ({ ...acc, [id]: 0.95 }),
          {} as Record<DimensionId, EvidenceLevel>,
        ),
      ),
      gates: makeGates(),
    };
    const readiness = makeReadiness(
      READINESS_DIMENSIONS.reduce(
        (acc, dim) => ({ ...acc, [dim.id]: 5 }),
        {} as Record<ReadinessId, ScoreLevel>,
      ),
    );
    const result = evaluateCountry({ profileId: "general", country, readinessScores: readiness });
    expect(result.overallRecommendation).toBe("scale");
  });

  it('清单会把硬门槛和短板维度放在前面', () => {
    const country: CountryAssessmentInput["countries"][number] = {
      countryId: "japan",
      scores: makeScores({ regulation: 1, operations: 2 }),
      confidence: makeConfidence({ demand: 0.4 }),
      gates: makeGates({ license: "pending" }),
    };
    const result = evaluateCountry({
      profileId: "general",
      country,
      readinessScores: makeReadiness(),
    });
    expect(result.checklist.length).toBeGreaterThan(2);
    expect(result.checklist[0].type).toBe("pending-gate");
    const remaining = result.checklist.map((item) => item.type);
    expect(remaining).toContain("evidence-gap");
  });
});

describe('evaluateAssessment', () => {
  it('触发硬门槛的国家在排序中靠后', () => {
    const inputs: CountryAssessmentInput = {
      readinessScores: makeReadiness(
        READINESS_DIMENSIONS.reduce(
          (acc, dim) => ({ ...acc, [dim.id]: 5 }),
          {} as Record<ReadinessId, ScoreLevel>,
        ),
      ),
      countries: [
        {
          countryId: "japan",
          scores: makeScores(
            ALL_DIMENSION_IDS.reduce(
              (acc, id) => ({ ...acc, [id]: 4 }),
              {} as Record<DimensionId, ScoreLevel>,
            ),
          ),
          confidence: makeConfidence(
            ALL_DIMENSION_IDS.reduce(
              (acc, id) => ({ ...acc, [id]: 0.95 }),
              {} as Record<DimensionId, EvidenceLevel>,
            ),
          ),
          gates: makeGates(),
        },
        {
          countryId: "germany",
          scores: makeScores(
            ALL_DIMENSION_IDS.reduce(
              (acc, id) => ({ ...acc, [id]: 4 }),
              {} as Record<DimensionId, ScoreLevel>,
            ),
          ),
          confidence: makeConfidence(
            ALL_DIMENSION_IDS.reduce(
              (acc, id) => ({ ...acc, [id]: 0.95 }),
              {} as Record<DimensionId, EvidenceLevel>,
            ),
          ),
          gates: makeGates({ sanctions: "triggered" }),
        },
      ],
    };
    const summary = evaluateAssessment({ profileId: "general", ...inputs });
    expect(summary.countryResults[0].countryId).toBe("japan");
    expect(summary.countryResults[0].overallRecommendation).toBe("scale");
    expect(summary.countryResults[1].countryId).toBe("germany");
    expect(summary.countryResults[1].overallRecommendation).toBe("stop");
  });

  it('准备度过低且国家分数一般时给出 option / hold 结论', () => {
    const inputs: CountryAssessmentInput = {
      readinessScores: makeReadiness(
        READINESS_DIMENSIONS.reduce(
          (acc, dim) => ({ ...acc, [dim.id]: 3 }),
          {} as Record<ReadinessId, ScoreLevel>,
        ),
      ),
      countries: [
        {
          countryId: "vietnam",
          scores: makeScores(
            ALL_DIMENSION_IDS.reduce(
              (acc, id) => ({ ...acc, [id]: 3 }),
              {} as Record<DimensionId, ScoreLevel>,
            ),
          ),
          confidence: makeConfidence(),
          gates: makeGates(),
        },
      ],
    };
    const summary = evaluateAssessment({ profileId: "general", ...inputs });
    expect(summary.countryResults[0].overallRecommendation).toMatch(/option|hold|pilot/);
  });

  it('行业模板 strong > general 模板时的 regulation 占比', () => {
    const regulationWeightGeneral = PROFILES.general.weights.regulation;
    const regulationWeightRegulated = PROFILES.regulated.weights.regulation;
    expect(regulationWeightRegulated).toBeGreaterThan(regulationWeightGeneral);
  });
});
