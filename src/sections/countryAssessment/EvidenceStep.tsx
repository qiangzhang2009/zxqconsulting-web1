/**
 * 国家评估第 4 步：逐维评分 + 硬门槛状态
 *
 * 按国家分组，每个国家独立打分；评分等级 1–5，证据等级 A/B/C/D，
 * 硬门槛按钮状态 pass / pending / triggered。
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { COUNTRIES, HARD_GATES } from '@/data/countryAssessment';
import type {
  CountryRowValue,
} from './CountriesStep';
import { EVIDENCE_OPTIONS, GATE_OPTIONS, SCORE_OPTIONS } from './options';

interface EvidenceStepProps {
  rows: CountryRowValue[];
  onChange: (rows: CountryRowValue[]) => void;
  requiredGateIds: string[];
}

export function EvidenceStep({ rows, onChange, requiredGateIds }: EvidenceStepProps) {
  const { t } = useTranslation();

  const updateRow = (countryId: string, patch: Partial<CountryRowValue>) => {
    onChange(
      rows.map((row) => (row.countryId === countryId ? { ...row, ...patch } : row)),
    );
  };

  const scoreAnchors = useMemo(
    () => [
      { score: 5, label: '显著优势', hint: '位于同组前 20%，已用一手证据或真实交易验证' },
      { score: 4, label: '有利', hint: '高于中位数，多源证据，剩余风险可控' },
      { score: 3, label: '中性', hint: '达最低可接受标准；不要把"缺数据"当作 3 分' },
      { score: 2, label: '偏弱', hint: '低于中位数，存在实质障碍或较高补救成本' },
      { score: 1, label: '显著不利', hint: '处于后 20%、障碍接近不可逆' },
    ],
    [],
  );

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-sm text-slate-300">
        {t('countryAssessment.evidenceNoCountries', '请先选择至少 1 个候选国家，再填评分与硬门槛。')}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-white">
          {t('countryAssessment.evidenceTitle', '为每个国家填写评分、证据与硬门槛')}
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          {t(
            'countryAssessment.evidenceSubtitle',
            '分数代表"市场能不能做"，证据等级代表"我们对分数有多少证据"，硬门槛状态代表"必须立刻决定放不放行"。',
          )}
        </p>
      </header>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-slate-400">
        <div className="grid gap-2 md:grid-cols-2">
          {scoreAnchors.map((anchor) => (
            <div key={anchor.score} className="flex items-start gap-2">
              <span className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 text-emerald-200">
                {anchor.score}
              </span>
              <div>
                <div className="text-sm font-medium text-white">{anchor.label}</div>
                <div>{anchor.hint}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {rows.map((row) => {
        const country = COUNTRIES.find((c) => c.id === row.countryId);
        if (!country) return null;
        const requiredGates = HARD_GATES.filter((gate) =>
          requiredGateIds.includes(gate.id),
        );
        const triggers = row.gates;
        const triggeredCount = requiredGates.filter(
          (gate) => triggers[gate.id] === 'triggered',
        ).length;
        const pendingCount = requiredGates.filter(
          (gate) => triggers[gate.id] === 'pending',
        ).length;

        return (
          <section
            key={row.countryId}
            className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-white">{country.name}</div>
                <div className="text-xs text-slate-400">{country.nameEn}</div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {triggeredCount > 0 ? (
                  <span className="rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1 text-red-200">
                    {t('countryAssessment.gateTriggeredCount', '{{count}} 项硬门槛已触发', {
                      count: triggeredCount,
                    })}
                  </span>
                ) : null}
                {pendingCount > 0 ? (
                  <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-amber-100">
                    {t('countryAssessment.gatePendingCount', '{{count}} 项硬门槛待验证', {
                      count: pendingCount,
                    })}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {(['demand', 'access', 'competition', 'regulation', 'economics', 'operations'] as const).map(
                (key) => (
                  <DimensionRow
                    key={key}
                    dimensionKey={key}
                    row={row}
                    onChange={updateRow}
                  />
                ),
              )}
            </div>

            {requiredGates.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-white">
                  {t('countryAssessment.gateStatusTitle', '硬门槛状态')}
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {requiredGates.map((gate) => {
                    const status = triggers[gate.id] ?? 'pass';
                    return (
                      <div
                        key={gate.id}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-white/[0.06] bg-black/20 p-3"
                      >
                        <div>
                          <div className="text-sm text-white">{gate.name}</div>
                          <div className="mt-1 text-xs text-slate-500">{gate.detail}</div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {GATE_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                updateRow(row.countryId, {
                                  gates: { ...row.gates, [gate.id]: option.value },
                                })
                              }
                              className={`rounded-full border px-3 py-1 text-xs transition ${
                                status === option.value
                                  ? status === 'triggered'
                                    ? 'border-red-400/60 bg-red-500/10 text-red-200'
                                    : status === 'pending'
                                      ? 'border-amber-400/60 bg-amber-400/10 text-amber-100'
                                      : 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
                                  : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20'
                              }`}
                              aria-pressed={status === option.value}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="rounded-2xl border border-white/[0.06] bg-black/20 p-3 text-xs text-slate-500">
                {t(
                  'countryAssessment.noRequiredGate',
                  '当前模板没有强制评估的硬门槛；建议至少手动确认制裁与牌照两条。',
                )}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

interface DimensionRowProps {
  dimensionKey:
    | 'demand'
    | 'access'
    | 'competition'
    | 'regulation'
    | 'economics'
    | 'operations';
  row: CountryRowValue;
  onChange: (countryId: string, patch: Partial<CountryRowValue>) => void;
}

function DimensionRow({ dimensionKey, row, onChange }: DimensionRowProps) {
  const { t } = useTranslation();
  const labels: Record<DimensionRowProps['dimensionKey'], string> = {
    demand: '需求与市场质量',
    access: '客户可达性与渠道',
    competition: '竞争结构与差异化',
    regulation: '政策、准入与合规',
    economics: '单位经济与现金回报',
    operations: '运营、供应链与数字基础',
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-white">{labels[dimensionKey]}</div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {SCORE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              onChange(row.countryId, {
                scores: { ...row.scores, [dimensionKey]: option.value },
              })
            }
            className={`rounded-full border px-3 py-1 text-xs transition ${
              row.scores[dimensionKey] === option.value
                ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
                : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20'
            }`}
            aria-pressed={row.scores[dimensionKey] === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {EVIDENCE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              onChange(row.countryId, {
                confidence: { ...row.confidence, [dimensionKey]: option.value },
              })
            }
            className={`rounded-full border px-3 py-1 text-xs transition ${
              row.confidence[dimensionKey] === option.value
                ? 'border-blue-400/60 bg-blue-400/10 text-blue-200'
                : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20'
            }`}
            aria-pressed={row.confidence[dimensionKey] === option.value}
          >
            {option.label}
          </button>
        ))}
        <span className="ml-1 text-[10px] text-slate-500">
          {t('countryAssessment.evidenceNote', '证据等级越低，分数会自动收缩到中性值')}
        </span>
      </div>
    </div>
  );
}
