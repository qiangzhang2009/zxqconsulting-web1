/**
 * 样例报告预览 — 放在结果页最顶部，激发用户填写真实数据
 *
 * 显示一个虚构企业"张小强本草集团"的护肝保健食品评估结果，
 * 用真实的引擎逻辑生成数据，确保数字口径与网站一致。
 * 带有"示例数据"水印，点击"填写我的真实数据"后消失。
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Eye, FileText, Lightbulb, MapPin, Target, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  COUNTRIES,
  ENTRY_MODES,
  PROFILES,
  type DimensionId,
  type EvidenceLevel,
  type ReadinessId,
  type ScoreLevel,
} from '@/data/countryAssessment';
import type { CountryResult } from '@/lib/countryAssessmentEngine';
import { evaluateCountry } from '@/lib/countryAssessmentEngine';

// ═══════════════════════════════════════════════════
// 虚构评估数据 — 由引擎生成，口径与生产环境一致
// ═══════════════════════════════════════════════════

const SAMPLE_PROFILE_ID = 'consumer' as const;

const SAMPLE_READINESS = {
  offer: 4 as ScoreLevel,
  gtm: 3 as ScoreLevel,
  compliance: 3 as ScoreLevel,
  delivery: 4 as ScoreLevel,
  organization: 3 as ScoreLevel,
  capital: 3 as ScoreLevel,
} satisfies Record<ReadinessId, ScoreLevel>;

// 日本分数：监管、宏观、经济偏弱；需求、竞争中等
const JAPAN_SCORES = {
  fit: 4 as ScoreLevel, demand: 4 as ScoreLevel, access: 3 as ScoreLevel, competition: 3 as ScoreLevel,
  regulation: 2 as ScoreLevel, macro: 3 as ScoreLevel, economics: 2 as ScoreLevel, operations: 3 as ScoreLevel,
  talent: 3 as ScoreLevel, tax: 3 as ScoreLevel, esg: 4 as ScoreLevel,
} satisfies Record<DimensionId, ScoreLevel>;
const JAPAN_CONFIDENCE = {
  fit: 0.8 as EvidenceLevel, demand: 0.8 as EvidenceLevel, access: 0.65 as EvidenceLevel, competition: 0.65 as EvidenceLevel,
  regulation: 0.95 as EvidenceLevel, macro: 0.8 as EvidenceLevel, economics: 0.65 as EvidenceLevel, operations: 0.65 as EvidenceLevel,
  talent: 0.65 as EvidenceLevel, tax: 0.8 as EvidenceLevel, esg: 0.95 as EvidenceLevel,
} satisfies Record<DimensionId, EvidenceLevel>;
const JAPAN_GATES = {
  sanctions: 'pass' as const,
  license: 'pending' as const,
  data: 'pass' as const,
  safety: 'pass' as const,
  economics: 'pending' as const,
  capitalControl: 'pass' as const,
};

// 新加坡：监管、经济、渠道有利；竞争激烈
const SINGAPORE_SCORES = {
  fit: 4 as ScoreLevel, demand: 4 as ScoreLevel, access: 4 as ScoreLevel, competition: 2 as ScoreLevel,
  regulation: 4 as ScoreLevel, macro: 5 as ScoreLevel, economics: 5 as ScoreLevel, operations: 4 as ScoreLevel,
  talent: 4 as ScoreLevel, tax: 5 as ScoreLevel, esg: 5 as ScoreLevel,
} satisfies Record<DimensionId, ScoreLevel>;
const SINGAPORE_CONFIDENCE = {
  fit: 0.95 as EvidenceLevel, demand: 0.95 as EvidenceLevel, access: 0.8 as EvidenceLevel, competition: 0.8 as EvidenceLevel,
  regulation: 0.95 as EvidenceLevel, macro: 0.95 as EvidenceLevel, economics: 0.8 as EvidenceLevel, operations: 0.8 as EvidenceLevel,
  talent: 0.8 as EvidenceLevel, tax: 0.95 as EvidenceLevel, esg: 0.95 as EvidenceLevel,
} satisfies Record<DimensionId, EvidenceLevel>;
const SINGAPORE_GATES = {
  sanctions: 'pass' as const,
  license: 'pass' as const,
  data: 'pass' as const,
  safety: 'pass' as const,
  economics: 'pass' as const,
  capitalControl: 'pass' as const,
};

function buildSampleResult(countryId: string): CountryResult {
  const scores = countryId === 'japan' ? JAPAN_SCORES : SINGAPORE_SCORES;
  const confidence = countryId === 'japan' ? JAPAN_CONFIDENCE : SINGAPORE_CONFIDENCE;
  const gates = countryId === 'japan' ? JAPAN_GATES : SINGAPORE_GATES;
  const entryMode = countryId === 'japan' ? 'direct_entity' : 'cross_border_direct';
  return evaluateCountry({
    profileId: SAMPLE_PROFILE_ID,
    country: {
      countryId,
      entryMode,
      scores,
      confidence,
      gates,
      notes: '',
    },
    readinessScores: SAMPLE_READINESS,
  });
}

const SAMPLE_RESULTS = [buildSampleResult('singapore'), buildSampleResult('japan')];

// ═══════════════════════════════════════════════════
// 子组件
// ═══════════════════════════════════════════════════

const RECOMMENDATION_LABELS: Record<string, { zh: string; en: string; tone: string }> = {
  scale: { zh: '优先进入规模化', en: 'Scale', tone: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200' },
  pilot: { zh: '90–180天验证性试点', en: 'Pilot', tone: 'bg-blue-500/20 border-blue-400/30 text-blue-200' },
  'build-capability': { zh: '先补能力再进入', en: 'Build First', tone: 'bg-amber-500/20 border-amber-400/30 text-amber-200' },
  hold: { zh: '暂缓观察', en: 'Hold', tone: 'bg-slate-500/20 border-slate-400/30 text-slate-300' },
  stop: { zh: '停止推进', en: 'Stop', tone: 'bg-red-500/20 border-red-400/30 text-red-200' },
};

function RecommendationBadge({ rec }: { rec: string }) {
  const meta = RECOMMENDATION_LABELS[rec] ?? { zh: rec, en: rec, tone: 'bg-slate-500/20 border-slate-400/30 text-slate-300' };
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${meta.tone}`}>
      {meta.zh}
    </span>
  );
}

function ScoreBar({ label, value, max = 100, color = 'bg-emerald-400' }: {
  label: string;
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium text-white">{value.toFixed(0)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CountryCard({ result, rank }: { result: CountryResult; rank: number }) {
  const country = COUNTRIES.find((c) => c.id === result.countryId);
  const entryMode = ENTRY_MODES.find((m) => m.id === result.entryMode);
  const isTop = rank === 1;

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isTop
          ? 'border-emerald-400/40 bg-emerald-400/5'
          : 'border-white/[0.06] bg-white/[0.02]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {isTop && (
              <span className="rounded-full border border-emerald-400/50 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                首选
              </span>
            )}
            <div className="text-base font-semibold text-white">{country?.name}</div>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {country?.nameEn} · {country?.regionLabel}
            {entryMode ? ` · ${entryMode.name}` : ''}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <RecommendationBadge rec={result.overallRecommendation} />
          <div className="text-lg font-bold text-white">{result.adjustedScore.toFixed(0)}</div>
          <div className="text-[10px] text-slate-500">可信度调整分</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <ScoreBar label="原始机会分" value={result.rawScore} color="bg-slate-400" />
        <ScoreBar label="企业准备度" value={result.readinessScore} color="bg-blue-400" />
        <ScoreBar label="证据可信度" value={Math.round(result.weightedConfidence * 100)} max={100} color="bg-purple-400" />
        <ScoreBar label="证据等级" value={result.confidenceGrade === 'A' ? 95 : result.confidenceGrade === 'B' ? 78 : result.confidenceGrade === 'C' ? 60 : 40} max={100} color="bg-amber-400" />
      </div>

      {result.triggeredGates.length > 0 && (
        <div className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-200">
            <span>⚑</span>
            硬门槛触发：{result.triggeredGates.map((g) => g.id).join('、')}
          </div>
        </div>
      )}

      {result.pendingGates.length > 0 && (
        <div className="mt-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-200">
            <span>?</span>
            待验证硬门槛：{result.pendingGates.map((g) => g.id).join('、')}
          </div>
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-slate-300">
        {result.recommendationDetail}
      </p>
    </div>
  );
}

function ChecklistPreview({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-[9px] font-bold text-amber-300">
            {i + 1}
          </span>
          {item}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════

interface SampleReportProps {
  onDismiss: () => void;
}

export default function SampleReport({ onDismiss }: SampleReportProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const topResult = SAMPLE_RESULTS[0];
  const countryCount = SAMPLE_RESULTS.length;
  const profileName = PROFILES[SAMPLE_PROFILE_ID]?.name ?? '消费品';

  const topChecks = topResult.checklist.slice(0, 5).map((item) => item.title);
  const totalChecks = topResult.checklist.length;

  return (
    <div className="space-y-3">
      {/* 主卡片 */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/8 via-emerald-500/3 to-transparent">
        {/* 背景光效 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        {/* 水印标识 */}
        <div className="absolute right-4 top-4">
          <div className="flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1">
            <Eye className="h-3 w-3 text-amber-300" />
            <span className="text-[10px] font-medium uppercase tracking-widest text-amber-200">
              示例数据
            </span>
          </div>
        </div>

        <div className="relative p-6 md:p-8">
          {/* 标题区 */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                <Zap className="h-3 w-3" />
                评估预览
              </div>
              <h3 className="text-xl font-semibold text-white">
                填写后您将看到这样的结果
              </h3>
              <p className="max-w-xl text-sm text-slate-400">
                以下是一份虚构的护肝保健食品企业对日本、新加坡两国的评估示例。点击任意位置展开完整预览，或直接填写真实数据获取您专属的报告。
              </p>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={onDismiss}
              className="shrink-0 gap-2 bg-emerald-400 text-slate-950 hover:bg-emerald-300"
            >
              <FileText className="h-4 w-4" />
              填写我的真实数据
            </Button>
          </div>

          {/* 样例信息 */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { icon: '🏢', label: '张小强本草集团' },
              { icon: '💊', label: '护肝保健食品' },
              { icon: '🌏', label: `评估 ${countryCount} 个候选国` },
              { icon: '📊', label: `模板：${profileName}` },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
              >
                <span>{icon}</span>
                {label}
              </span>
            ))}
          </div>

          {/* 核心分数对比 */}
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {SAMPLE_RESULTS.map((result, idx) => (
              <CountryCard key={result.countryId} result={result} rank={idx + 1} />
            ))}
          </div>

          {/* 展开完整内容 */}
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs text-slate-400 transition hover:border-emerald-400/30 hover:text-emerald-300"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                收起完整样例（{totalChecks} 项数据采集清单）
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                查看完整样例（含 {totalChecks} 项数据采集清单 + AI 简报）
              </>
            )}
          </button>

          {expanded && (
            <div className="mt-4 space-y-5">
              {/* 决策建议 */}
              <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <Target className="h-4 w-4 text-emerald-300" />
                  决策建议
                </div>
                <div className="space-y-3">
                  {SAMPLE_RESULTS.map((result, idx) => {
                    const country = COUNTRIES.find((c) => c.id === result.countryId);
                    return (
                      <div key={result.countryId} className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                          idx === 0
                            ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200'
                            : 'border-white/20 bg-white/5 text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{country?.name}</span>
                            <RecommendationBadge rec={result.overallRecommendation} />
                          </div>
                          <p className="mt-0.5 text-xs text-slate-400">{result.recommendationDetail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 优先数据采集清单 */}
              <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <Lightbulb className="h-4 w-4 text-amber-300" />
                  优先验证事项（前 {topChecks.length} 项）
                </div>
                <ChecklistPreview items={topChecks} />
                {totalChecks > topChecks.length && (
                  <p className="mt-2 text-xs text-slate-500">
                    +还有 {totalChecks - topChecks.length} 项数据采集清单…
                  </p>
                )}
              </section>

              {/* 跨维度优势与短板 */}
              <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="mb-3 text-sm font-semibold text-emerald-200">🏆 新加坡主要优势</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {topResult.topStrengths.map((s) => (
                      <li key={s.dimension} className="flex items-start gap-2">
                        <span className="mt-0.5 text-emerald-300">✓</span>
                        <span>
                          {DIMENSIONS.find((d) => d.id === s.dimension)?.name} · {s.score}/5
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="mb-3 text-sm font-semibold text-amber-200">⚠ 日本关键短板</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {SAMPLE_RESULTS[1]?.topGaps.map((g) => (
                      <li key={g.dimension} className="flex items-start gap-2">
                        <span className="mt-0.5 text-amber-300">!</span>
                        <span>
                          {DIMENSIONS.find((d) => d.id === g.dimension)?.name} · {g.score}/5
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* AI 简报示例 */}
              <section className="rounded-2xl border border-purple-400/20 bg-purple-500/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-purple-200">
                  <span className="text-base">✨</span>
                  AI 战略简报（示例）
                </div>
                <div className="space-y-2 text-sm leading-7 text-slate-200">
                  <p>
                    新加坡是目前最优目标市场。其准入路径清晰（食品类不需要药品注册）、获客渠道成熟（电商 + 线下健康店均可），
                    且法治与资金流动风险低。建议以跨境电商直销作为切入点，6 个月内完成首单验证，再根据回款数据决定是否在新加坡设立本地实体。
                  </p>
                  <p>
                    日本具备长期战略价值，但当前阶段建议先以试点形式观察药事法规修订动向，
                    特别是 2024 年功能标识食品（FFC）制度的完善程度。优先验证竞争格局（当地汉方制剂已占据心智）和获客 CAC。
                  </p>
                  <p className="text-xs italic text-slate-500">
                    90–180 天验证顺序：①新加坡电商平台入驻 → ②日本经销商意向访谈 → ③新加坡物流与支付测试
                  </p>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* 底部 CTA */}
      <div className="flex items-center justify-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <Button
          variant="default"
          onClick={onDismiss}
          className="gap-2 bg-emerald-400 text-slate-950 hover:bg-emerald-300"
        >
          <MapPin className="h-4 w-4" />
          {t('countryAssessment.startRealAssessment', '开始填写我的真实数据 →')}
        </Button>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
}

// 避免 lint 错误
void evaluateCountry;

// 维度名称映射（用于样例展示）
const DIMENSIONS = [
  { id: 'fit', name: '战略适配' },
  { id: 'demand', name: '需求质量' },
  { id: 'access', name: '渠道可达' },
  { id: 'competition', name: '竞争结构' },
  { id: 'regulation', name: '准入合规' },
  { id: 'macro', name: '宏观政治' },
  { id: 'economics', name: '单位经济' },
  { id: 'operations', name: '运营供应链' },
  { id: 'talent', name: '人才组织' },
  { id: 'tax', name: '税务法律' },
  { id: 'esg', name: 'ESG安全' },
];
