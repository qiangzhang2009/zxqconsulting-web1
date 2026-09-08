// WhitepaperPipelinePage — 白皮书发布流水线看板
import { Plus, GripVertical } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { cn } from '@/lib/utils';
import { fmtRelative, fmtNumber } from '../lib/format';

type Stage = 'draft' | 'writing' | 'review' | 'published';
type Priority = 'high' | 'medium' | 'low';

const STAGES: { id: Stage; label: string; accent: 'blue' | 'amber' | 'purple' | 'emerald' }[] = [
  { id: 'draft',     label: '构思',    accent: 'blue' },
  { id: 'writing',   label: '撰写',    accent: 'amber' },
  { id: 'review',    label: '审核',    accent: 'purple' },
  { id: 'published', label: '发布',    accent: 'emerald' },
];

const PIPELINE_DATA = [
  { id: 1, title: '中医药欧盟注册完全指南 2026',      stage: 'writing'   as Stage, author: '张明', updated_at: '2026-09-01', wordCount: 12000, priority: 'high'   as Priority },
  { id: 2, title: '东南亚保健品市场准入白皮书',         stage: 'review'    as Stage, author: '李静', updated_at: '2026-08-28', wordCount:  8500, priority: 'medium' as Priority },
  { id: 3, title: '日本汉方制剂注册路径详解',           stage: 'draft'     as Stage, author: '王芳', updated_at: '2026-09-02', wordCount:  2000, priority: 'low'    as Priority },
  { id: 4, title: '中东医疗器械市场进入策略',            stage: 'published' as Stage, author: '赵强', updated_at: '2026-08-15', wordCount: 15000, priority: 'high'   as Priority },
];

const PRIORITY_Badge: Record<Priority, string> = {
  high:   'admin-badge high',
  medium: 'admin-badge medium',
  low:    'admin-badge low',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  high:   '高优先级',
  medium: '中优先级',
  low:    '低优先级',
};

const STAGE_BADGE_CLS: Record<Stage, string> = {
  draft:     'admin-badge draft',
  writing:   'admin-badge reviewing',
  review:    'admin-badge review',
  published: 'admin-badge published',
};

const STAGE_LABEL: Record<Stage, string> = {
  draft:     '构思',
  writing:   '撰写中',
  review:    '审核中',
  published: '已发布',
};

export function WhitepaperPipelinePage() {
  // Count per stage for PageHeader metrics
  const stageCounts = STAGES.reduce<Record<Stage, number>>((acc, s) => {
    acc[s.id] = PIPELINE_DATA.filter(w => w.stage === s.id).length;
    return acc;
  }, {} as Record<Stage, number>);

  const metrics = STAGES.map(s => ({
    label: s.label,
    value: stageCounts[s.id],
    accent: s.accent,
  }));

  return (
    <div className="admin-content">
      <PageHeader
        title="白皮书流水线"
        description="内容发布全流程管理"
        actions={
          <button className="admin-btn primary">
            <Plus size={14} />
            新建白皮书
          </button>
        }
        metrics={metrics}
      />

      {/* Kanban Board */}
      <div className="admin-grid admin-grid-4 admin-gap-4">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            whitepapers={PIPELINE_DATA.filter(w => w.stage === stage.id)}
          />
        ))}
      </div>
    </div>
  );
}

function KanbanColumn({
  stage,
  whitepapers,
}: {
  stage: (typeof STAGES)[number];
  whitepapers: typeof PIPELINE_DATA;
}) {
  return (
    <div className="admin-card admin-card-pad-lg" style={{ alignSelf: 'start' }}>
      {/* Column Header */}
      <div className="admin-flex admin-items-center admin-justify-between admin-mb-4">
        <div className="admin-flex admin-items-center admin-gap-2">
          <span className="admin-section-title admin-mb-0" style={{ padding: 0 }}>
            {stage.label}
          </span>
          <span className="admin-badge neutral" style={{ fontSize: 10, padding: '2px 7px' }}>
            {whitepapers.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="admin-flex admin-flex-col admin-gap-3">
        {whitepapers.length === 0 ? (
          <div className="admin-empty" style={{ padding: '32px 16px' }}>
            <p className="admin-text-xs admin-text-muted">暂无白皮书</p>
          </div>
        ) : (
          whitepapers.map(wp => (
            <WhitepaperCard key={wp.id} whitepaper={wp} />
          ))
        )}
      </div>

      {/* Drag hint */}
      <div
        className="admin-flex admin-items-center admin-justify-center admin-gap-1 admin-mt-3 admin-pt-3 admin-text-xs admin-text-subtle"
        style={{ borderTop: '1px solid var(--admin-divider)' }}
      >
        <GripVertical size={12} />
        拖拽移动
      </div>
    </div>
  );
}

function WhitepaperCard({ whitepaper }: { whitepaper: typeof PIPELINE_DATA[number] }) {
  return (
    <div className="admin-card admin-card-pad-sm admin-cursor-pointer admin-relative admin-overflow-hidden"
      style={{
        borderColor: 'var(--admin-border)',
        transition: 'border-color 200ms cubic-bezier(0.16,1,0.3,1)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--admin-border-strong)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--admin-border)';
      }}
    >
      {/* Gradient accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, var(--admin-primary), transparent)',
          opacity: 0.6,
        }}
      />

      {/* Priority */}
      <div className="admin-flex admin-items-center admin-justify-between admin-mb-2">
        <span className={PRIORITY_Badge[whitepaper.priority]} style={{ fontSize: 10, padding: '2px 7px' }}>
          {PRIORITY_LABEL[whitepaper.priority]}
        </span>
        <GripVertical size={12} className="admin-text-subtle" />
      </div>

      {/* Title */}
      <p
        className="admin-text-sm admin-font-semibold admin-text admin-truncate admin-mb-3"
        style={{ lineHeight: 1.4 }}
      >
        {whitepaper.title}
      </p>

      {/* Author & Date */}
      <div className="admin-flex admin-items-center admin-justify-between admin-mb-2">
        <span className="admin-text-xs admin-text-muted">{whitepaper.author}</span>
        <span className="admin-text-xs admin-text-subtle">{fmtRelative(whitepaper.updated_at)}</span>
      </div>

      {/* Word count */}
      <div className="admin-flex admin-items-center admin-gap-1">
        <span className="admin-text-xs admin-text-subtle">字数</span>
        <span className="admin-text-xs admin-font-semibold admin-text">
          {fmtNumber(whitepaper.wordCount)}
        </span>
      </div>
    </div>
  );
}

export default WhitepaperPipelinePage;
