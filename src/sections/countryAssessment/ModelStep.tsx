/**
 * 国家评估第 3 步：模型定制（权重、硬门槛）
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DIMENSIONS,
  DIMENSION_WEIGHT_SUM,
  HARD_GATES,
  PROFILES,
  type DimensionId,
  type GateId,
  type ProfileId,
} from '@/data/countryAssessment';

import { GATE_OPTIONS } from './options';

interface ModelStepProps {
  profileId: ProfileId;
  weights: Record<DimensionId, number>;
  gates: Record<GateId, 'required' | 'optional' | 'ignored'>;
  onProfileChange: (next: ProfileId) => void;
  onWeightsChange: (next: Record<DimensionId, number>) => void;
  onGatesChange: (next: Record<GateId, 'required' | 'optional' | 'ignored'>) => void;
}

export function ModelStep({
  profileId,
  weights,
  gates,
  onProfileChange,
  onWeightsChange,
  onGatesChange,
}: ModelStepProps) {
  const { t } = useTranslation();

  const weightSum = useMemo(
    () =>
      DIMENSIONS.reduce((sum, dimension) => sum + (weights[dimension.id] ?? 0), 0),
    [weights],
  );

  const weightIsValid = Math.round(weightSum * 100) / 100 === DIMENSION_WEIGHT_SUM;

  const applyProfile = (next: ProfileId) => {
    onProfileChange(next);
    onWeightsChange({ ...PROFILES[next].weights });
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold text-white">
          {t('countryAssessment.modelTitle', '自定义权重与硬门槛')}
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          {t(
            'countryAssessment.modelSubtitle',
            '选择业务模型模板作为起点，然后针对企业具体能力微调权重（合计必须等于 100%）。',
          )}
        </p>
      </header>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">
              {t('countryAssessment.profileTemplate', '业务模型模板')}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {PROFILES[profileId].note}
            </p>
          </div>
          <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
            {PROFILES[profileId].name}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(PROFILES) as ProfileId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => applyProfile(id)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                id === profileId
                  ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
                  : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20'
              }`}
              aria-pressed={id === profileId}
            >
              {PROFILES[id].name}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {t('countryAssessment.dimensionWeights', '维度权重')}
          </h3>
          <span
            className={`rounded-full border px-3 py-1 text-xs ${
              weightIsValid
                ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                : 'border-amber-400/40 bg-amber-400/10 text-amber-100'
            }`}
          >
            {t('countryAssessment.weightSum', '合计 {{sum}} / 100', {
              sum: Math.round(weightSum * 10) / 10,
            })}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {DIMENSIONS.map((dimension) => (
            <div
              key={dimension.id}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{dimension.name}</div>
                  <div className="mt-1 text-xs text-slate-400">{dimension.question}</div>
                </div>
                <div className="text-sm font-semibold text-emerald-300">
                  {(weights[dimension.id] ?? 0).toFixed(1)}%
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={0.5}
                value={weights[dimension.id] ?? 0}
                onChange={(event) =>
                  onWeightsChange({
                    ...weights,
                    [dimension.id]: Number(event.target.value),
                  })
                }
                className="mt-3 w-full accent-emerald-400"
                aria-label={`${dimension.name} weight`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">
          {t('countryAssessment.hardGates', '硬门槛（任何一项触发都会停止推进）')}
        </h3>
        <p className="text-sm text-slate-400">
          {t(
            'countryAssessment.hardGatesHint',
            '选择"必须确认"会让用户在下一步为该国标注状态；"先不验证"会把该项暂时移出硬门槛集合。',
          )}
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          {HARD_GATES.map((gate) => {
            const status = gates[gate.id] ?? 'required';
            return (
              <div
                key={gate.id}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{gate.name}</div>
                    <div className="mt-1 text-xs text-slate-400">{gate.detail}</div>
                    <div className="mt-2 text-xs text-slate-500">
                      {t('countryAssessment.owner', '责任角色')}：{gate.owner}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(
                    [
                      { value: 'required', label: t('countryAssessment.gateRequired', '必须确认') },
                      { value: 'optional', label: t('countryAssessment.gateOptional', '软提醒') },
                      { value: 'ignored', label: t('countryAssessment.gateIgnored', '忽略') },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        onGatesChange({
                          ...gates,
                          [gate.id]: option.value,
                        })
                      }
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        status === option.value
                          ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
                          : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20'
                      }`}
                      aria-pressed={status === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  {GATE_OPTIONS[0]?.short} {t('countryAssessment.gatePass', '通过')} ·{' '}
                  {GATE_OPTIONS[1]?.short} {t('countryAssessment.gatePending', '待验证')} ·{' '}
                  {GATE_OPTIONS[2]?.short} {t('countryAssessment.gateTriggered', '触发')}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
