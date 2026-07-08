// Status Badge Component

export type StatusType =
  | 'new' | 'contacted' | 'qualified' | 'closed'
  | 'pending' | 'approved' | 'rejected'
  | 'self_serve' | 'prepare_then_apply' | 'expert_review'
  | 'L1' | 'L2' | 'L3';

interface BadgeProps {
  status: string;
  label?: string;
  variant?: 'default' | 'soft' | 'outline';
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  // Submissions
  new:        { label: '新提交',     className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  contacted:  { label: '已联系',     className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  qualified:  { label: '已合格',     className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  closed:     { label: '已关闭',     className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' },

  // Comments
  pending:    { label: '待审核',     className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  approved:   { label: '已发布',     className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  rejected:   { label: '已拒绝',     className: 'bg-red-500/15 text-red-400 border-red-500/30' },

  // Decision
  self_serve:          { label: '自助探索',   className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' },
  prepare_then_apply:  { label: '准备后申请', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  expert_review:       { label: '专家评审',   className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },

  // Lead Tier
  L1: { label: '潜在线索',  className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  L2: { label: '意向线索',  className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  L3: { label: '高价值线索', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};

export function StatusBadge({ status, label, variant = 'default' }: BadgeProps) {
  const meta = STATUS_META[status] || { label: status, className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' };

  if (variant === 'soft') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${meta.className.split('border')[0].trim()}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
        {label || meta.label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${meta.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label || meta.label}
    </span>
  );
}

export const STATUS_OPTIONS = Object.entries(STATUS_META).map(([key, meta]) => ({
  value: key,
  label: meta.label,
}));

// Filter only submission statuses
export const SUBMISSION_STATUSES = ['new', 'contacted', 'qualified', 'closed'];
export const COMMENT_STATUSES = ['pending', 'approved', 'rejected'];