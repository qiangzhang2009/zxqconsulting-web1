import { Compass, Search, ShieldCheck, Send } from 'lucide-react';

/**
 * 算法漏斗 · 注解版
 *
 * 在原 4 条进度条下方各加一行 breakdown chips:
 * - 10,000+ 候选(电商/展会/专利/协会各占比)
 * - 50 匹配(分销/代理/零售/IP)
 * - 12 核验(日本/美国/欧盟)
 * - 3 谈判(3 家具体公司)
 *
 * 数字是真实场景的合理估算,无具体来源声明
 */

export interface BreakdownChip {
  /** 主文本 */
  label: string;
  /** 副文本(右侧灰色小字,如计数或地区) */
  meta?: string;
  /** 强调色:1=amber / 2=emerald */
  tone?: 1 | 2;
}

export interface FunnelStage {
  total: number;
  label: string;
  countLabel: string;
  chips: BreakdownChip[];
}

export const FUNNEL_DATA: Record<'scanned' | 'matched' | 'verified' | 'final', FunnelStage> = {
  scanned: {
    total: 10000,
    label: '市场全景扫描',
    countLabel: '+',
    chips: [
      { label: '电商', meta: '4,000', tone: 1 },
      { label: '展会', meta: '3,000', tone: 2 },
      { label: '专利', meta: '1,500', tone: 1 },
      { label: '协会', meta: '1,500', tone: 2 },
    ],
  },
  matched: {
    total: 50,
    label: '合伙人智能匹配',
    countLabel: '家',
    chips: [
      { label: '分销', meta: '20', tone: 1 },
      { label: '代理', meta: '15', tone: 2 },
      { label: '零售', meta: '10', tone: 1 },
      { label: 'IP', meta: '5', tone: 2 },
    ],
  },
  verified: {
    total: 12,
    label: '多维资质核验',
    countLabel: '家',
    chips: [
      { label: '日本', meta: '5', tone: 1 },
      { label: '美国', meta: '4', tone: 2 },
      { label: '欧盟', meta: '3', tone: 1 },
    ],
  },
  final: {
    total: 3,
    label: '进入深度谈判',
    countLabel: '家',
    chips: [
      { label: '横滨健康食品', meta: '日本', tone: 1 },
      { label: 'LA Natural', meta: '美国', tone: 2 },
      { label: 'Berlin Pharma', meta: '欧盟', tone: 1 },
    ],
  },
};

interface StageBlockProps {
  icon: React.ReactNode;
  stage: FunnelStage;
  accent: string;
  barClass: string;
  ringClass: string;
  /** 阶段 key(用于 GSAP counter 动画的 class selector) */
  animKey: string;
}

const StageBlock = ({ icon, stage, accent, barClass, ringClass, animKey }: StageBlockProps) => {
  return (
    <div className={`relative rounded-xl border bg-white/[0.03] p-3 transition-all ${ringClass}`}>
      {/* 顶部:数字 + 标签 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-md border bg-white/[0.04] ${ringClass} ${accent}`}
          >
            {icon}
          </span>
          <span className="text-sm font-medium text-white">{stage.label}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`funnel-counter-${animKey} text-base font-bold tabular-nums ${accent}`}>
            0
          </span>
          <span className={`text-xs ${accent}`}>{stage.countLabel}</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="relative h-2 w-full rounded-full bg-white/[0.05] overflow-hidden">
        <div
          className={`funnel-bar funnel-bar-${animKey} h-full rounded-full ${barClass} transition-all`}
          style={{ width: '0%' }}
        />
      </div>

      {/* breakdown chips */}
      <div className="mt-2 flex flex-wrap gap-1">
        {stage.chips.map((c, i) => {
          const toneCls =
            c.tone === 2
              ? 'border-emerald-300/35 text-emerald-200 bg-emerald-400/10'
              : 'border-amber-300/40 text-amber-100 bg-amber-400/10';
          return (
            <span
              key={`${c.label}-${i}`}
              className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-medium tabular-nums ${toneCls}`}
            >
              <span className="font-semibold">{c.label}</span>
              {c.meta && <span className="opacity-65">{c.meta}</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const FunnelAlgorithm = () => {
  return (
    <div className="space-y-2.5">
      <StageBlock
        animKey="1"
        icon={<Compass className="h-3.5 w-3.5" />}
        stage={FUNNEL_DATA.scanned}
        accent="text-amber-200"
        barClass="bg-amber-400/30"
        ringClass="border-amber-400/30"
      />
      <StageBlock
        animKey="2"
        icon={<Search className="h-3.5 w-3.5" />}
        stage={FUNNEL_DATA.matched}
        accent="text-amber-300"
        barClass="bg-amber-400/45"
        ringClass="border-amber-400/40"
      />
      <StageBlock
        animKey="3"
        icon={<ShieldCheck className="h-3.5 w-3.5" />}
        stage={FUNNEL_DATA.verified}
        accent="text-amber-300"
        barClass="bg-amber-400/55"
        ringClass="border-amber-400/45"
      />
      <StageBlock
        animKey="4"
        icon={<Send className="h-3.5 w-3.5" />}
        stage={FUNNEL_DATA.final}
        accent="text-amber-300"
        barClass="bg-amber-300"
        ringClass="border-amber-300"
      />
    </div>
  );
};
