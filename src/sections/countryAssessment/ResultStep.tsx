/**
 * 国家评估第 5 步：结果展示 + 可选提交
 *
 * 规则引擎的结果负责所有分数与建议；
 * AI 仅生成解释性简报（结构化 JSON 输入，失败时降级显示）。
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Compass,
  Lightbulb,
  Lock,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  COUNTRIES,
  DIMENSIONS,
  ENTRY_MODES,
  HARD_GATES,
  PROFILES,
  READINESS_DIMENSIONS,
  type DimensionId,
  type GateId,
  type ProfileId,
} from '@/data/countryAssessment';
import {
  evaluateAssessment,
  type AssessmentSummary,
  type ChecklistItem,
  type CountryResult,
} from '@/lib/countryAssessmentEngine';
import { tracking } from '@/lib/tracking';

import type { CountryRowValue } from './CountriesStep';
import type { ProfileFormValue } from './ProfileStep';

interface ResultStepProps {
  profile: ProfileFormValue;
  profileId: ProfileId;
  rows: CountryRowValue[];
  weights: Record<DimensionId, number>;
  requiredGateIds: GateId[];
  customDimensionWeights: Record<DimensionId, number>;
  onRestart: () => void;
}

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

const AI_TIMEOUT_MS = 12000;

export function ResultStep({
  profile,
  profileId,
  rows,
  weights,
  requiredGateIds,
  onRestart,
}: ResultStepProps) {
  const { t } = useTranslation();
  const [contact, setContact] = useState({ name: '', phone: '', email: '', note: '' });
  const [consent, setConsent] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });

  const summary: AssessmentSummary = useMemo(
    () =>
      evaluateAssessment({
        profileId,
        readinessScores: profile.readinessScores,
        countries: rows.map((row) => ({
          countryId: row.countryId,
          entryMode: row.entryMode,
          scores: row.scores,
          confidence: row.confidence,
          gates: filterGatesForRequired(row.gates, requiredGateIds),
          notes: row.notes,
        })),
        customWeights: weights,
      }),
    [profileId, profile.readinessScores, rows, weights, requiredGateIds],
  );

  const aiSummary = useAiBrief(summary, profile.productSummary);
  const recommendationMap = useMemo(() => buildRecommendationMap(), []);

  // 触发页面浏览追踪
  useEffect(() => {
    tracking.toolInteraction('country_assessment', 'view_result', {
      countries: summary.countryResults.length,
      profile: summary.profileId,
      recommendation: summary.countryResults[0]?.overallRecommendation ?? 'none',
    });
  }, [summary]);

  const submit = async () => {
    if (!consent) {
      toast.error(t('countryAssessment.submitNeedConsent', '请先勾选同意条款'));
      return;
    }
    if (!contact.name.trim()) {
      toast.error(t('countryAssessment.submitNeedName', '请填写姓名 / 企业'));
      return;
    }
    setSubmitState({ status: 'submitting' });

    const payload = {
      companyName: profile.companyName || contact.name,
      contactName: contact.name,
      contactPhone: contact.phone,
      contactEmail: contact.email,
      contactWechat: '',
      industry: profile.industry,
      productCategory: profile.productSummary.slice(0, 240),
      overseasStage: profile.stage,
      budget: profile.budget,
      targetMarkets: summary.countryResults.map((c) => countryName(c.countryId)).join(', '),
      priorityMarkets: summary.countryResults
        .slice(0, 2)
        .map((c) => countryName(c.countryId))
        .join(', '),
      services: ['country_assessment'],
      additionalNote: buildAdditionalNote(profile, profileId, rows, summary, weights, requiredGateIds, contact.note),
    };

    try {
      const response = await fetch('/api/client-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`submit failed: ${response.status}`);
      const message = t('countryAssessment.submitOk', '已提交，我们会尽快与您联系。');
      setSubmitState({ status: 'success', message });
      tracking.formSubmit('country_assessment_lead', true, {
        name: contact.name,
        email: contact.email,
        countries: summary.countryResults.map((c) => c.countryId),
      });
    } catch (error) {
      const message = (error as Error)?.message ?? 'submit failed';
      setSubmitState({ status: 'error', message });
      tracking.formSubmit('country_assessment_lead', false, {
        name: contact.name,
        error: message,
      });
    }
  };

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-sm text-slate-300">
        {t(
          'countryAssessment.resultNoCountries',
          '请回到上一步选择至少 1 个候选国家，再生成结果。',
        )}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
            {t('countryAssessment.resultKicker', '决策读数')}
          </div>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            {t('countryAssessment.resultTitle', '国家评估结果与下一步动作')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            {t(
              'countryAssessment.resultSubtitle',
              '数字反映"市场能不能做" × 证据可信度，结论反映"我们现在能不能做"。硬门槛任一触发都会立即置底并被红色标记，不允许被分数抵消。',
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-sm text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-200"
        >
          <RotateCcw className="h-4 w-4" />
          {t('countryAssessment.restart', '重新调整评估')}
        </button>
      </header>

      <SummaryCards summary={summary} />

      {summary.crossCuttingRisks.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
            <AlertTriangle className="h-4 w-4" />
            {t('countryAssessment.crossTitle', '需要管理层优先关注的事项')}
          </div>
          <ul className="space-y-1 text-sm text-amber-100/90">
            {summary.crossCuttingRisks.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ChevronRight className="mt-1 h-3 w-3 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">
          {t('countryAssessment.rankTitle', '按调整分排序的候选国家')}
        </h3>
        <div className="space-y-3">
          {summary.countryResults.map((result) => (
            <CountryResultCard
              key={result.countryId}
              result={result}
              profileId={profileId}
              weights={weights}
              requiredGateIds={requiredGateIds}
              recommendationLabel={recommendationMap[result.overallRecommendation]?.label ?? result.overallRecommendation}
              recommendationTone={recommendationMap[result.overallRecommendation]?.tone ?? 'neutral'}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-white">
          {t('countryAssessment.checklistTitle', '按数据采集优先级排序的清单')}
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {summary.countryResults.flatMap((result) =>
            result.checklist.map((item) => (
              <ChecklistCard
                key={`${result.countryId}-${item.priority}-${item.title}`}
                countryName={countryName(result.countryId)}
                item={item}
              />
            )),
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-300" />
          <h3 className="text-lg font-semibold text-white">
            {t('countryAssessment.aiTitle', 'AI 战略简报（可选）')}
          </h3>
        </div>
        <p className="text-sm text-slate-400">
          {t(
            'countryAssessment.aiHint',
            '基于结构化结果生成中文解释、90–180 天验证顺序和反方观点；AI 不可用时只展示规则引擎结果。',
          )}
        </p>
        <AiBriefView state={aiSummary} fallback={summary.countryResults[0] ?? null} />
      </section>

      <section className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-emerald-300" />
          <h3 className="text-lg font-semibold text-white">
            {t('countryAssessment.submitTitle', '把这份评估与我的团队取得联系')}
          </h3>
        </div>
        <p className="text-sm text-slate-400">
          {t(
            'countryAssessment.submitHint',
            '以下信息会写入现有客户信息表，工作人员可立即跟进；不填就不会保存。',
          )}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">
              {t('countryAssessment.contactName', '姓名')} *
            </span>
            <Input
              value={contact.name}
              onChange={(event) => setContact({ ...contact, name: event.target.value })}
              placeholder={t('countryAssessment.contactNamePh', '您的姓名')}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">
              {t('countryAssessment.contactPhone', '联系电话')}
            </span>
            <Input
              value={contact.phone}
              onChange={(event) => setContact({ ...contact, phone: event.target.value })}
              placeholder={t('countryAssessment.contactPhonePh', '可选')}
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-200">
              {t('countryAssessment.contactEmail', '邮箱')}
            </span>
            <Input
              type="email"
              value={contact.email}
              onChange={(event) => setContact({ ...contact, email: event.target.value })}
              placeholder={t('countryAssessment.contactEmailPh', '可选，用于发送评估报告')}
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-200">
              {t('countryAssessment.contactNote', '补充说明')}
            </span>
            <Textarea
              rows={3}
              value={contact.note}
              onChange={(event) => setContact({ ...contact, note: event.target.value })}
              placeholder={t(
                'countryAssessment.contactNotePh',
                '我们最多想对接 2 国，预计时间窗为 18 个月',
              )}
            />
          </label>
          <label className="md:col-span-2 flex items-start gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              className="mt-0.5 accent-emerald-400"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            {t(
              'countryAssessment.consent',
              '我同意把上述评估结果与表单内容提交给张小强咨询团队并被用于评估推进；AI 解释内容不会与第三方共享。',
            )}
          </label>
        </div>

        {submitState.status === 'success' ? (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">
            {submitState.message}
          </div>
        ) : null}
        {submitState.status === 'error' ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            {submitState.message}
          </div>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={submitState.status === 'submitting'}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {submitState.status === 'submitting'
            ? t('countryAssessment.submitting', '提交中…')
            : t('countryAssessment.submit', '提交并联系我们')}
        </button>
      </section>

      <DetailsDisclosure profile={profile} summary={summary} weights={weights} />
    </div>
  );
}

interface SummaryCardsProps {
  summary: AssessmentSummary;
}

function SummaryCards({ summary }: SummaryCardsProps) {
  const { t } = useTranslation();
  return (
    <section className="grid gap-3 md:grid-cols-4">
      <SummaryCard
        label={t('countryAssessment.cardProfile', '评估模板')}
        value={summary.profileName}
        hint={t('countryAssessment.cardProfileHint', '基于业务模型已校准权重')}
      />
      <SummaryCard
        label={t('countryAssessment.cardReadiness', '企业准备度')}
        value={`${summary.readinessScore}`}
        hint={t('countryAssessment.cardReadinessHint', '满分 100')}
      />
      <SummaryCard
        label={t('countryAssessment.cardWeightSum', '权重合计')}
        value={`${summary.weightSum}%`}
        hint={
          summary.weightIsValid
            ? t('countryAssessment.cardWeightOk', '合计等于 100%')
            : t('countryAssessment.cardWeightBad', '需要归一化或冻结当前分配')
        }
        tone={summary.weightIsValid ? 'ok' : 'warn'}
      />
      <SummaryCard
        label={t('countryAssessment.cardCountries', '候选国家数')}
        value={String(summary.countryResults.length)}
        hint={t('countryAssessment.cardCountriesHint', '触发硬门槛会置底，但不删除')}
      />
    </section>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: 'ok' | 'warn';
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      <div
        className={`mt-1 text-xs ${
          tone === 'warn' ? 'text-amber-200' : tone === 'ok' ? 'text-emerald-200' : 'text-slate-400'
        }`}
      >
        {hint}
      </div>
    </div>
  );
}

interface CountryResultCardProps {
  result: CountryResult;
  profileId: ProfileId;
  weights: Record<DimensionId, number>;
  requiredGateIds: GateId[];
  recommendationLabel: string;
  recommendationTone: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

function CountryResultCard({
  result,
  profileId,
  weights,
  requiredGateIds,
  recommendationLabel,
  recommendationTone,
}: CountryResultCardProps) {
  const { t } = useTranslation();
  const country = COUNTRIES.find((c) => c.id === result.countryId);
  const entryMode = ENTRY_MODES.find((mode) => mode.id === result.entryMode);

  return (
    <article className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-white">{country?.name}</div>
          <div className="text-xs text-slate-400">
            {country?.nameEn} · {country?.regionLabel} · {country?.currency}
          </div>
          {entryMode ? (
            <div className="mt-2 text-xs text-emerald-300/80">
              {t('countryAssessment.entryModeLabel', '进入模式')}：{entryMode.name}
            </div>
          ) : null}
        </div>
        <RecommendationBadge tone={recommendationTone} label={recommendationLabel} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Metric
          label={t('countryAssessment.metricRaw', '原始机会分 / 100')}
          value={result.rawScore.toFixed(1)}
        />
        <Metric
          label={t('countryAssessment.metricAdjusted', '可信度调整分 / 100')}
          value={result.adjustedScore.toFixed(1)}
          tone={toneForScore(result.adjustedScore)}
        />
        <Metric
          label={t('countryAssessment.metricReadiness', '企业准备度 / 100')}
          value={result.readinessScore.toFixed(1)}
        />
        <Metric
          label={t('countryAssessment.metricConfidence', '证据等级')}
          value={`${result.confidenceGrade} · ${Math.round(result.weightedConfidence * 100)}%`}
          tone={result.confidence === 'high' ? 'ok' : result.confidence === 'medium' ? 'warn' : 'danger'}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-emerald-300/80">
            {t('countryAssessment.topStrengths', '主要优势')}
          </div>
          {result.topStrengths.length > 0 ? (
            <ul className="mt-1 space-y-1 text-xs text-slate-300">
              {result.topStrengths.map((strength) => (
                <li key={strength.dimension} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-300" />
                  <span>
                    {DIMENSIONS.find((d) => d.id === strength.dimension)?.name} · {strength.score}/5
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              {t('countryAssessment.noStrength', '暂无明显优势')}
            </p>
          )}
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-amber-200/80">
            {t('countryAssessment.topGaps', '关键短板')}
          </div>
          {result.topGaps.length > 0 && result.topGaps.some((gap) => gap.score <= 2) ? (
            <ul className="mt-1 space-y-1 text-xs text-slate-300">
              {result.topGaps.map((gap) => (
                <li key={gap.dimension} className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber-300" />
                  <span>
                    {DIMENSIONS.find((d) => d.id === gap.dimension)?.name} · {gap.score}/5
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              {t('countryAssessment.noGap', '没有发现明显短板')}
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 rounded-2xl border border-white/[0.06] bg-black/20 p-3 text-sm text-slate-200">
        <span className="mr-1 inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-slate-400">
          <Compass className="h-3.5 w-3.5" />
          {t('countryAssessment.advice', '决策建议')}
        </span>
        {result.recommendationDetail}
      </p>

      {result.triggeredGates.length > 0 ? (
        <div className="mt-3 rounded-2xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-4 w-4" />
            {t('countryAssessment.triggeredTitle', '触发的硬门槛')}
          </div>
          <ul className="mt-1 list-disc pl-5 text-xs">
            {result.triggeredGates.map((gate) => (
              <li key={gate.id}>
                {HARD_GATES.find((g) => g.id === gate.id)?.name ?? gate.id} ·{' '}
                {HARD_GATES.find((g) => g.id === gate.id)?.owner}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.pendingGates.length > 0 ? (
        <div className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
          <div className="flex items-center gap-2 font-semibold">
            <Lightbulb className="h-4 w-4" />
            {t('countryAssessment.pendingTitle', '待验证的硬门槛')}
          </div>
          <ul className="mt-1 list-disc pl-5 text-xs">
            {result.pendingGates.map((gate) => (
              <li key={gate.id}>
                {HARD_GATES.find((g) => g.id === gate.id)?.name ?? gate.id}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <details className="mt-3 rounded-2xl border border-white/[0.06] bg-black/20 p-3">
        <summary className="cursor-pointer text-sm text-slate-300">
          {t('countryAssessment.weightBreakdown', '查看该国的权重与分数明细')}
        </summary>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {DIMENSIONS.map((dimension) => {
            const weightKey = dimension.id as DimensionId;
            return (
              <div
                key={dimension.id}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="truncate text-white">{dimension.name}</div>
                  <div className="text-[10px] text-slate-500">
                    {t('countryAssessment.weightShare', '权重 {{w}}%', {
                      w: (weights[weightKey] ?? 0).toFixed(1),
                    })}
                  </div>
                </div>
                <div className="ml-2 text-emerald-200">
                  <span className="font-semibold">{result.rawScore > 0 ? '·' : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      </details>
      {/* Suppress unused param check */}
      <span className="hidden">{requiredGateIds.length}-{profileId.length}</span>
    </article>
  );
}

function RecommendationBadge({
  tone,
  label,
}: {
  tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  label: string;
}) {
  const palette: Record<typeof tone, string> = {
    success: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
    warning: 'border-amber-400/40 bg-amber-400/10 text-amber-100',
    danger: 'border-red-400/40 bg-red-500/10 text-red-100',
    info: 'border-blue-400/40 bg-blue-400/10 text-blue-100',
    neutral: 'border-white/15 bg-white/[0.04] text-slate-200',
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-xs ${palette[tone]}`}>
      {label}
    </span>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'ok' | 'warn' | 'danger';
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div
        className={`mt-1 text-lg font-semibold ${
          tone === 'ok'
            ? 'text-emerald-200'
            : tone === 'warn'
              ? 'text-amber-100'
              : tone === 'danger'
                ? 'text-red-200'
                : 'text-white'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function ChecklistCard({
  countryName,
  item,
}: {
  countryName: string;
  item: ChecklistItem;
}) {
  const { t } = useTranslation();
  const palette =
    item.type === 'pending-gate'
      ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
      : item.type === 'evidence-gap'
        ? 'border-red-400/30 bg-red-500/10 text-red-100'
        : item.type === 'low-confidence'
          ? 'border-blue-400/30 bg-blue-400/10 text-blue-100'
          : 'border-white/[0.08] bg-white/[0.03] text-slate-200';

  return (
    <div className={`space-y-2 rounded-2xl border ${palette} p-4`}>
      <div className="flex items-baseline justify-between">
        <div className="text-xs uppercase tracking-[0.18em] opacity-80">
          {countryName} · #{item.priority + 1}
        </div>
        <div className="text-xs">{item.cadence}</div>
      </div>
      <div className="text-sm font-semibold">{item.title}</div>
      <p className="text-xs">{item.rationale}</p>
      <div className="rounded-xl border border-white/[0.08] bg-black/30 p-2 text-xs">
        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
          {t('countryAssessment.checklistAction', '最小验证动作')}
        </div>
        <div className="mt-1">{item.minimumAction}</div>
      </div>
      <div className="flex flex-wrap gap-2 text-[10px] text-slate-300/80">
        <span className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5">
          {t('countryAssessment.checklistSource', '来源')}：{item.source}
        </span>
        <span className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5">
          {t('countryAssessment.checklistOwner', '责任')}：{item.responsibleRole}
        </span>
      </div>
    </div>
  );
}

function DetailsDisclosure({
  profile,
  summary,
  weights,
}: {
  profile: ProfileFormValue;
  summary: AssessmentSummary;
  weights: Record<DimensionId, number>;
}) {
  const { t } = useTranslation();
  return (
    <details className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <summary className="cursor-pointer text-sm font-semibold text-slate-200">
        {t('countryAssessment.disclosureTitle', '查看完整评估输入与口径')}
      </summary>
      <div className="mt-3 space-y-3 text-xs text-slate-300">
        <Field2
          label={t('countryAssessment.fieldIndustry', '行业')}
          value={profile.industry || '—'}
        />
        <Field2
          label={t('countryAssessment.fieldBudget', '总预算')}
          value={profile.budget || '—'}
        />
        <Field2
          label={t('countryAssessment.fieldStage', '当前出海阶段')}
          value={profile.stage || '—'}
        />
        <Field2
          label={t('countryAssessment.fieldRisk', '风险偏好')}
          value={profile.risk || '—'}
        />
        <Field2
          label={t('countryAssessment.fieldWindow', '时间窗口')}
          value={profile.window || '—'}
        />
        <Field2
          label={t('countryAssessment.disclosureProduct', '产品摘要')}
          value={profile.productSummary || '—'}
        />
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
            {t('countryAssessment.disclosureWeights', '权重明细')}
          </div>
          <div className="mt-1 grid gap-1 md:grid-cols-3">
            {DIMENSIONS.map((dimension) => (
              <div
                key={dimension.id}
                className="rounded-xl border border-white/[0.06] bg-black/20 p-2"
              >
                {dimension.name} · {(weights[dimension.id] ?? 0).toFixed(1)}%
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
            {t('countryAssessment.disclosureReadiness', '企业准备度')}
          </div>
          <ul className="mt-1 space-y-1">
            {summary.readinessBreakdown.map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <span>{item.name}</span>
                <span>
                  {item.score}/5 · {item.weight}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}

function Field2({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <span className="text-slate-200">{value}</span>
    </div>
  );
}

function RecommendationView({
  label,
  detail,
  tone,
}: {
  label: string;
  detail: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
}) {
  const palette: Record<typeof tone, string> = {
    success: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100',
    warning: 'border-amber-400/40 bg-amber-400/10 text-amber-100',
    danger: 'border-red-400/40 bg-red-500/10 text-red-100',
    info: 'border-blue-400/40 bg-blue-400/10 text-blue-100',
  };
  return (
    <div className={`space-y-2 rounded-2xl border p-3 ${palette[tone]}`}>
      <div className="text-sm font-semibold">{label}</div>
      <p className="text-xs">{detail}</p>
    </div>
  );
}

// ----------------------------- AI 简报 (受控 + 降级) -----------------------------

interface AiBriefState {
  status: 'idle' | 'ok' | 'fallback' | 'error';
  output?: string;
  explanation: string;
}

function useAiBrief(summary: AssessmentSummary, productSummary: string): AiBriefState {
  const [state, setState] = useState<AiBriefState>({ status: 'idle', explanation: '' });
  const topCountry = summary.countryResults[0];

  useEffect(() => {
    let cancelled = false;
    if (!topCountry) return () => undefined;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    const topEntryMode = ENTRY_MODES.find((mode) => mode.id === topCountry.entryMode);

    const prompt = buildPrompt({
      profile: summary.profileName,
      profileNote: summary.profileNote,
      productSummary,
      topCountry,
      topCountryName: countryName(topCountry.countryId),
      topCountryMode: topEntryMode?.name ?? '—',
      topStrengths: topCountry.topStrengths.map((s) => DIMENSIONS.find((d) => d.id === s.dimension)?.name ?? s.dimension),
      topGaps: topCountry.topGaps.map((g) => DIMENSIONS.find((d) => d.id === g.dimension)?.name ?? g.dimension),
      triggeredGates: topCountry.triggeredGates.map((gate) => HARD_GATES.find((g) => g.id === gate.id)?.name ?? gate.id),
      pendingGates: topCountry.pendingGates.map((gate) => HARD_GATES.find((g) => g.id === gate.id)?.name ?? gate.id),
      countryCount: summary.countryResults.length,
      readinessScore: summary.readinessScore,
    });

    fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.4,
        max_tokens: 800,
        messages: [
          { role: 'system', content: '你是出海战略简报助手。请只根据提供的结构化输入给出简短、可执行的中文分析；不要 Markdown、不要列表符号；不要臆造数据。' },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`ai ${response.status}`);
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content ?? '';
        if (cancelled) return;
        if (text) {
          setState({ status: 'ok', output: String(text), explanation: '' });
        } else {
          throw new Error('ai empty');
        }
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          status: 'fallback',
          explanation: t_loading(
            'countryAssessment.aiFallback',
            'AI 不可用，已回退到规则引擎结论。',
          ),
        });
      })
      .finally(() => clearTimeout(timer));

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [summary, productSummary, topCountry]);

  return state;
}

function AiBriefView({ state, fallback }: { state: AiBriefState; fallback: CountryResult | null }) {
  const { t } = useTranslation();
  if (state.status === 'ok' && state.output) {
    return (
      <div className="space-y-2 text-sm leading-7 text-slate-100">
        {state.output.split(/\n+/).map((paragraph) => (
          <p key={paragraph.slice(0, 16)}>{paragraph}</p>
        ))}
      </div>
    );
  }
  if (state.status === 'fallback' || state.status === 'error') {
    return (
      <div className="space-y-2">
        <p className="text-xs text-amber-100">
          {state.explanation ||
            t('countryAssessment.aiFallback', 'AI 不可用，已回退到规则引擎结论。')}
        </p>
        {fallback ? (
          <RecommendationView
            label={recommendationLabel(fallback.overallRecommendation)}
            detail={fallback.recommendationDetail}
            tone={normalizeTone(recommendationTone(fallback.overallRecommendation))}
          />
        ) : null}
      </div>
    );
  }
  // idle/unknown → 显示空状态，等待 effect 触发
  return (
    <p className="text-xs text-slate-400">
      {t('countryAssessment.aiStart', '正在准备解释性简报…')}
    </p>
  );
}

function buildPrompt(input: {
  profile: string;
  profileNote: string;
  productSummary: string;
  topCountry: CountryResult;
  topCountryName: string;
  topCountryMode: string;
  topStrengths: string[];
  topGaps: string[];
  triggeredGates: string[];
  pendingGates: string[];
  countryCount: number;
  readinessScore: number;
}): string {
  return [
    `评估模板：${input.profile}（${input.profileNote}）。`,
    `候选国家共 ${input.countryCount} 个；排序最靠前：${input.topCountryName}（调整分 ${input.topCountry.adjustedScore.toFixed(1)}，原始分 ${input.topCountry.rawScore.toFixed(1)}，准备度 ${input.topCountry.readinessScore.toFixed(1)}），进入模式 ${input.topCountryMode}。`,
    `企业准备度总分 ${input.readinessScore}。`,
    `产品摘要：${input.productSummary.slice(0, 200)}`,
    `主要优势：${input.topStrengths.join('；') || '无'}`,
    `关键短板：${input.topGaps.join('；') || '无'}`,
    `触发的硬门槛：${input.triggeredGates.join('；') || '无'}`,
    `待验证的硬门槛：${input.pendingGates.join('；') || '无'}`,
    '请用两段短中文输出：第一段 90–180 天应优先验证的 3 个具体动作；第二段指出客户可能质疑或忽略的 1–2 条反方观点。不要使用 Markdown。',
  ].join('\n');
}

// ----------------------------- 工具 -----------------------------

function t_loading(key: string, fallback: string) {
  return fallback;
}

function buildRecommendationMap(): Record<
  CountryResult['overallRecommendation'],
  { label: string; tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }
> {
  return {
    scale: { label: '优先进入规模化', tone: 'success' },
    pilot: { label: '90–180 天验证性试点', tone: 'info' },
    'build-capability': { label: '市场有吸引力，先补能力', tone: 'warning' },
    option: { label: '保留期权：轻资产进入', tone: 'warning' },
    hold: { label: '暂缓：进入观察名单', tone: 'warning' },
    stop: { label: '停止推进：先关闭红旗', tone: 'danger' },
  };
}

function recommendationLabel(rec: CountryResult['overallRecommendation']) {
  const map = buildRecommendationMap();
  return map[rec]?.label ?? rec;
}

function recommendationTone(rec: CountryResult['overallRecommendation']) {
  const map = buildRecommendationMap();
  return map[rec]?.tone ?? 'neutral';
}

function normalizeTone(
  tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral',
): 'success' | 'warning' | 'danger' | 'info' {
  return tone === 'neutral' ? 'info' : tone;
}

function countryName(id: string) {
  return COUNTRIES.find((c) => c.id === id)?.name ?? id;
}

function toneForScore(score: number): 'ok' | 'warn' | 'danger' {
  if (score >= 70) return 'ok';
  if (score >= 55) return 'warn';
  return 'danger';
}

function filterGatesForRequired(
  gates: Record<string, import('@/data/countryAssessment').GateStatus>,
  requiredGateIds: GateId[],
): Record<string, import('@/data/countryAssessment').GateStatus> {
  const out: Record<string, import('@/data/countryAssessment').GateStatus> = {};
  for (const id of requiredGateIds) {
    out[id] = gates[id] ?? 'pass';
  }
  return out;
}

function buildAdditionalNote(
  profile: ProfileFormValue,
  profileId: ProfileId,
  rows: CountryRowValue[],
  summary: AssessmentSummary,
  weights: Record<DimensionId, number>,
  requiredGateIds: GateId[],
  contactNote: string,
) {
  const profileName = PROFILES[profileId]?.name ?? profileId;
  return JSON.stringify({
    type: 'country_assessment',
    version: 1,
    profile: profileName,
    industry: profile.industry,
    stage: profile.stage,
    budget: profile.budget,
    risk: profile.risk,
    window: profile.window,
    productSummary: profile.productSummary,
    weights,
    requiredGateIds,
    countries: rows.map((row) => ({
      countryId: row.countryId,
      countryName: countryName(row.countryId),
      entryMode: row.entryMode,
      scores: row.scores,
      confidence: row.confidence,
      gates: row.gates,
      notes: row.notes,
    })),
    results: summary.countryResults.map((result) => ({
      countryId: result.countryId,
      adjustedScore: result.adjustedScore,
      rawScore: result.rawScore,
      readinessScore: result.readinessScore,
      weightedConfidence: result.weightedConfidence,
      confidenceGrade: result.confidenceGrade,
      recommendation: result.overallRecommendation,
      triggeredGates: result.triggeredGates.map((gate) => gate.id),
      pendingGates: result.pendingGates.map((gate) => gate.id),
      checklistCount: result.checklist.length,
    })),
    crossCuttingRisks: summary.crossCuttingRisks,
    note: contactNote,
  });
}

// Suppress lint warnings on unused imports — these are imported to keep
// the file aligned with the engine types, but kept available for downstream
// enhancements (e.g. share-by-link).
void Link;
void READINESS_DIMENSIONS;
void Lock;
