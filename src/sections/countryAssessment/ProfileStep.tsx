/**
 * 国家评估表单：客户画像
 *
 * 收集用于国家评估的企业 / 产品 / 时间窗 / 风险偏好 / 准备度信息。
 * 不收集任何非必要的 PII；联系方式仅在结果页可选输入。
 */

import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  BUDGET_OPTIONS,
  INDUSTRY_OPTIONS,
  READINESS_DIMENSIONS,
  RISK_TOLERANCE_OPTIONS,
  STAGE_OPTIONS,
  type ReadinessId,
  type ScoreLevel,
} from '@/data/countryAssessment';

import { SCORE_OPTIONS } from './options';

export interface ProfileFormValue {
  companyName: string;
  industry: string;
  productSummary: string;
  stage: string;
  budget: string;
  window: string;
  risk: string;
  readinessScores: Record<ReadinessId, ScoreLevel>;
}

interface ProfileStepProps {
  value: ProfileFormValue;
  onChange: (next: ProfileFormValue) => void;
}

export function ProfileStep({ value, onChange }: ProfileStepProps) {
  const { t } = useTranslation();
  const set = <K extends keyof ProfileFormValue>(key: K, next: ProfileFormValue[K]) =>
    onChange({ ...value, [key]: next });
  const setReadiness = (id: ReadinessId, score: ScoreLevel) =>
    onChange({
      ...value,
      readinessScores: { ...value.readinessScores, [id]: score },
    });

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold text-white">
          {t('countryAssessment.profileTitle', '企业与产品画像')}
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          {t(
            'countryAssessment.profileSubtitle',
            '先把出海命题说清楚：业务、产品、时间窗与能承担的风险。这一步的答案是后续所有评分与建议的锚点。',
          )}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label={t('countryAssessment.fieldCompany', '企业名称（可选）')}>
          <Input
            value={value.companyName}
            onChange={(event) => set('companyName', event.target.value)}
            placeholder={t('countryAssessment.fieldCompanyPh', '如：张小强本草集团')}
          />
        </Field>

        <Field label={t('countryAssessment.fieldIndustry', '行业 / 业务模式')}>
          <Select value={value.industry} onValueChange={(next) => set('industry', next)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('countryAssessment.selectPlease', '请选择')} />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        label={t('countryAssessment.fieldProduct', '产品描述（最多 200 字）')}
        hint={t(
          'countryAssessment.fieldProductHint',
          '包含目标客群、主要卖点、平均客单价与认证情况；将影响后续国家评分。',
        )}
      >
        <Textarea
          rows={4}
          maxLength={600}
          value={value.productSummary}
          onChange={(event) => set('productSummary', event.target.value)}
          placeholder={t(
            'countryAssessment.fieldProductPh',
            '例如：基于经典中药方的保健食品，主打护肝与免疫，目标客户为 30-55 岁高净值人群，平均客单价 600 元，已通过 GMP 与 ISO22000。',
          )}
        />
      </Field>

      <div className="grid gap-6 md:grid-cols-3">
        <Field label={t('countryAssessment.fieldStage', '当前出海阶段')}>
          <Select value={value.stage} onValueChange={(next) => set('stage', next)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('countryAssessment.selectPlease', '请选择')} />
            </SelectTrigger>
            <SelectContent>
              {STAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label={t('countryAssessment.fieldBudget', '总预算')}>
          <Select value={value.budget} onValueChange={(next) => set('budget', next)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('countryAssessment.selectPlease', '请选择')} />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label={t('countryAssessment.fieldRisk', '风险偏好')}>
          <Select value={value.risk} onValueChange={(next) => set('risk', next)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('countryAssessment.selectPlease', '请选择')} />
            </SelectTrigger>
            <SelectContent>
              {RISK_TOLERANCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        label={t('countryAssessment.fieldWindow', '时间窗口（自由输入）')}
        hint={t(
          'countryAssessment.fieldWindowHint',
          '描述候选国家想进入的时间窗，例如"未来 18 个月"、"2026 上半年"。',
        )}
      >
        <Input
          value={value.window}
          onChange={(event) => set('window', event.target.value)}
          placeholder={t('countryAssessment.fieldWindowPh', '18 个月 / 2026 Q3 / 按市场分阶段')}
        />
      </Field>

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {t('countryAssessment.readinessTitle', '企业准备度自评')}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {t(
              'countryAssessment.readinessHint',
              '为 6 个准备度维度打分 1–5 分。这一项衡量"我们能不能做好"，与国家机会分（市场能不能做）分开。',
            )}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {READINESS_DIMENSIONS.map((dimension) => (
            <div
              key={dimension.id}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-white">{dimension.name}</div>
                  <div className="mt-1 text-xs text-slate-400">{dimension.test}</div>
                </div>
                <div className="text-xs text-emerald-300/80">{dimension.weight}%</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {SCORE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setReadiness(dimension.id, option.value)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      value.readinessScores[dimension.id] === option.value
                        ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
                        : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20'
                    }`}
                    aria-pressed={value.readinessScores[dimension.id] === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
