/**
 * 评分选项的中文展示常量。集中避免重复字面量，并保证前端显示与引擎测试共用。
 */

import type { EvidenceLevel, ScoreLevel } from '@/data/countryAssessment';

export const SCORE_OPTIONS: ReadonlyArray<{ value: ScoreLevel; label: string }> = [
  { value: 5, label: '5 · 显著优势' },
  { value: 4, label: '4 · 有利' },
  { value: 3, label: '3 · 中性' },
  { value: 2, label: '2 · 偏弱' },
  { value: 1, label: '1 · 显著不利' },
];

export const EVIDENCE_OPTIONS: ReadonlyArray<{
  value: EvidenceLevel;
  label: string;
  short: string;
}> = [
  { value: 0.95, short: 'A', label: 'A · 一手验证' },
  { value: 0.8, short: 'B', label: 'B · 多源交叉' },
  { value: 0.65, short: 'C', label: 'C · 单一间接' },
  { value: 0.4, short: 'D', label: 'D · 假设' },
];

export const GATE_OPTIONS: ReadonlyArray<{
  value: 'pass' | 'pending' | 'triggered';
  label: string;
  short: string;
}> = [
  { value: 'pass', short: 'PASS', label: '已通过' },
  { value: 'pending', short: '?', label: '待验证' },
  { value: 'triggered', short: 'X', label: '已触发' },
];
