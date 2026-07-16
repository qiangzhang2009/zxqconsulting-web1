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
import { ChevronLeft, ChevronRight, Compass } from 'lucide-react';

import { tracking } from '@/lib/tracking';
import type {
  DimensionId,
  GateId,
  ProfileId,
} from '@/data/countryAssessment';
import { DIMENSION_WEIGHT_SUM, HARD_GATES, PROFILES } from '@/data/countryAssessment';

import { CountriesStep, type CountryRowValue } from './countryAssessment/CountriesStep';
import { EvidenceStep } from './countryAssessment/EvidenceStep';
import { ModelStep } from './countryAssessment/ModelStep';
import { ProfileStep, type ProfileFormValue } from './countryAssessment/ProfileStep';
import SampleReport from './countryAssessment/SampleReport';
import { ResultStep } from './countryAssessment/ResultStep';

type StepId = 'profile' | 'countries' | 'model' | 'evidence' | 'result';

const STEPS: Array<{ id: StepId; labelKey: string; fallback: string }> = [
  { id: 'profile', labelKey: 'countryAssessment.stepProfile', fallback: '企业与产品' },
  { id: 'countries', labelKey: 'countryAssessment.stepCountries', fallback: '候选国家' },
  { id: 'model', labelKey: 'countryAssessment.stepModel', fallback: '权重与门槛' },
  { id: 'evidence', labelKey: 'countryAssessment.stepEvidence', fallback: '评分与证据' },
  { id: 'result', labelKey: 'countryAssessment.stepResult', fallback: '结果读数' },
];

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

export default function CountryAssessmentHub() {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = t('countryAssessment.pageTitle', '出海目标国家评估 · 岐黄四海');
  }, [t]);
  const [step, setStep] = useState<StepId>('profile');
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
    if (!validation.canProceed) return;
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
    setStep('profile');
    tracking.toolInteraction('country_assessment', 'reset', {});
  };

  return (
    <div className="min-h-screen bg-[#07111a] pb-24">
      <div className="mx-auto max-w-6xl px-6 pt-12 text-slate-100">
        <header className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
            <Compass className="h-3.5 w-3.5" />
            {t('countryAssessment.kicker', '出海决策工具 · 公开版')}
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
            {t('countryAssessment.heroTitle', '先判断再去哪，再决定怎么做')}
          </h1>
          <p className="max-w-3xl text-base text-slate-300">
            {t(
              'countryAssessment.heroSubtitle',
              '为中医药、保健食品、汉方护肤与企业出海项目定制权重、硬门槛与数据采集清单；规则引擎负责所有分数与建议，AI 仅用于生成解释性战略简报。本地即可跑完评估，不需要企业信息先录入即可使用。',
            )}
          </p>
        </header>

        <nav
          aria-label={t('countryAssessment.stepNav', '评估步骤')}
          className="mt-10 grid gap-2 md:grid-cols-5"
        >
          {STEPS.map((item, idx) => {
            const isActive = step === item.id;
            const isComplete = idx < stepIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (idx <= stepIndex) {
                    setShowSampleReport(false);
                    setStep(item.id);
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
                  {t('countryAssessment.stepNumber', '步骤 {{count}}', { count: idx + 1 })}
                </div>
                <div className="mt-1 font-medium">{t(item.labelKey, item.fallback)}</div>
              </button>
            );
          })}
        </nav>

        <div className="mt-10 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-10">
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

        <StepFooter
          step={step}
          stepIndex={stepIndex}
          validation={validation}
          onBack={goBack}
          onNext={goNext}
        />
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
  const { t } = useTranslation();
  const isResult = step === 'result';
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5">
      <button
        type="button"
        onClick={onBack}
        disabled={stepIndex === 0}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition disabled:opacity-40 hover:border-emerald-400/40 hover:text-emerald-200"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('countryAssessment.back', '上一步')}
      </button>

      {isResult ? (
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
        disabled={!validation.canProceed || isResult}
        className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t('countryAssessment.next', '下一步')}
        <ChevronRight className="h-4 w-4" />
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
