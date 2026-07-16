/**
 * 国家评估第 2 步：候选国家与进入假设
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  COUNTRIES,
  ENTRY_MODES,
  type CountryRegion,
  type DimensionId,
  type EvidenceLevel,
  type GateStatus,
  type ScoreLevel,
} from '@/data/countryAssessment';

export interface CountryRowValue {
  countryId: string;
  entryMode: string;
  scores: Record<DimensionId, ScoreLevel>;
  confidence: Record<DimensionId, EvidenceLevel>;
  gates: Record<string, GateStatus>;
  notes: string;
}

interface CountriesStepProps {
  rows: CountryRowValue[];
  onChange: (rows: CountryRowValue[]) => void;
}

const MIN_COUNTRIES = 1;

export function CountriesStep({ rows, onChange }: CountriesStepProps) {
  const { t } = useTranslation();
  const selectedIds = useMemo(() => new Set(rows.map((row) => row.countryId)), [rows]);

  const grouped = useMemo(() => {
    const map = new Map<CountryRegion, typeof COUNTRIES[number][]>();
    for (const country of COUNTRIES) {
      const list = map.get(country.region) ?? [];
      list.push(country);
      map.set(country.region, list);
    }
    return Array.from(map.entries());
  }, []);

  const toggleCountry = (countryId: string) => {
    if (selectedIds.has(countryId)) {
      onChange(rows.filter((row) => row.countryId !== countryId));
      return;
    }
    onChange([
      ...rows,
      {
        countryId,
        entryMode: 'cross_border_direct',
        scores: makeEmptyScores(),
        confidence: makeEmptyConfidence(),
        gates: makeAllPassingGates(),
        notes: '',
      },
    ]);
  };

  const updateRow = (countryId: string, patch: Partial<CountryRowValue>) => {
    onChange(
      rows.map((row) => (row.countryId === countryId ? { ...row, ...patch } : row)),
    );
  };

  const validCount = rows.length;

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold text-white">
          {t('countryAssessment.countriesTitle', '选择候选国家与进入假设')}
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          {t(
            'countryAssessment.countriesSubtitle',
            '至少选 1 个国家，最多 5 个。每个国家独立选择进入模式；下一步会要求逐维度打分与硬门槛状态。',
          )}
        </p>
        <p className="mt-2 text-xs text-emerald-300/80">
          {t('countryAssessment.countriesCounter', {
            defaultValue: '已选择 {{count}} / 5 个候选国家',
            count: validCount,
          })}
        </p>
      </header>

      <section className="space-y-6">
        {grouped.map(([region, list]) => (
          <div key={region}>
            <div className="mb-3 text-xs uppercase tracking-[0.18em] text-emerald-300/80">
              {list[0].regionLabel}
            </div>
            <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
              {list.map((country) => {
                const selected = selectedIds.has(country.id);
                return (
                  <button
                    key={country.id}
                    type="button"
                    onClick={() => toggleCountry(country.id)}
                    aria-pressed={selected}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                      selected
                        ? 'border-emerald-400/50 bg-emerald-400/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-slate-200 hover:border-white/30'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium">{country.name}</div>
                      <div className="text-xs text-slate-500">{country.nameEn}</div>
                    </div>
                    <div className="text-xs text-slate-400">{country.currency}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {rows.length > 0 ? (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            {t('countryAssessment.entryModeTitle', '为每个候选国家选择进入模式')}
          </h3>
          <div className="space-y-3">
            {rows.map((row) => {
              const country = COUNTRIES.find((c) => c.id === row.countryId);
              if (!country) return null;
              return (
                <div
                  key={row.countryId}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{country.name}</div>
                      <div className="text-xs text-slate-500">
                        {country.regionLabel} · {country.currency}
                      </div>
                    </div>
                    <Select
                      value={row.entryMode}
                      onValueChange={(value) => updateRow(row.countryId, { entryMode: value })}
                    >
                      <SelectTrigger className="w-full md:w-64">
                        <SelectValue placeholder={t('countryAssessment.selectPlease', '请选择')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>
                            {t('countryAssessment.entryMode', '进入模式')}
                          </SelectLabel>
                          {ENTRY_MODES.map((mode) => (
                            <SelectItem key={mode.id} value={mode.id}>
                              {mode.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-3 text-xs text-slate-400">
                    {ENTRY_MODES.find((mode) => mode.id === row.entryMode)?.fit ??
                      t('countryAssessment.entryModeHint', '选择进入模式后会显示适配提示')}
                  </div>
                  <Input
                    className="mt-3"
                    value={row.notes}
                    onChange={(event) =>
                      updateRow(row.countryId, { notes: event.target.value })
                    }
                    placeholder={t(
                      'countryAssessment.notesPh',
                      '市场假设 / 客户线索 / 客户接洽进度（可选）',
                    )}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {validCount > MIN_COUNTRIES && validCount > 5 ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
          {t(
            'countryAssessment.tooMany',
            '候选国家太多会稀释区分度，建议聚焦在最具机会的 3–5 国。',
          )}
        </p>
      ) : null}
    </div>
  );
}

function makeEmptyScores(): Record<DimensionId, ScoreLevel> {
  return {
    fit: 3,
    demand: 3,
    access: 3,
    competition: 3,
    regulation: 3,
    macro: 3,
    economics: 3,
    operations: 3,
    talent: 3,
    tax: 3,
    esg: 3,
  };
}

function makeEmptyConfidence(): Record<DimensionId, EvidenceLevel> {
  return {
    fit: 0.65,
    demand: 0.65,
    access: 0.65,
    competition: 0.65,
    regulation: 0.65,
    macro: 0.65,
    economics: 0.65,
    operations: 0.65,
    talent: 0.65,
    tax: 0.65,
    esg: 0.65,
  };
}

function makeAllPassingGates(): Record<string, GateStatus> {
  return {
    sanctions: 'pass',
    license: 'pass',
    data: 'pass',
    safety: 'pass',
    economics: 'pass',
    capitalControl: 'pass',
  };
}
