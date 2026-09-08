// StatusBadge — unified status pill with semantic colors
import { cn } from '@/lib/utils';

export const SUBMISSION_STATUSES = ['new', 'contacted', 'qualified', 'closed'] as const;
export const COMMENT_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];
export type CommentStatus = (typeof COMMENT_STATUSES)[number];

const LABELS: Record<string, { label: string; cls: string }> = {
  new:        { label: '新线索',     cls: 'new' },
  contacted:  { label: '已联系',     cls: 'contacted' },
  qualified:  { label: '已合格',     cls: 'qualified' },
  closed:     { label: '已关闭',     cls: 'closed' },
  pending:    { label: '待审核',     cls: 'pending' },
  approved:   { label: '已通过',     cls: 'approved' },
  rejected:   { label: '已拒绝',     cls: 'rejected' },
  draft:      { label: '草稿',       cls: 'draft' },
  translating:{ label: '翻译中',     cls: 'translating' },
  review:     { label: '审核中',     cls: 'review' },
  scheduled:  { label: '已排期',     cls: 'scheduled' },
  published:  { label: '已发布',     cls: 'published' },
  todo:       { label: '待办',       cls: 'pending' },
  in_progress:{ label: '进行中',     cls: 'info' },
  done:       { label: '已完成',     cls: 'approved' },
  active:     { label: '活跃',       cls: 'approved' },
  suspended:  { label: '已停用',     cls: 'rejected' },
  exploring:  { label: '探索中',     cls: 'pending' },
  committed:  { label: '已立项',     cls: 'info' },
  launched:   { label: '已落地',     cls: 'approved' },
  on_hold:    { label: '暂停',       cls: 'warning' },
  completed:  { label: '已完成',     cls: 'approved' },
  success:    { label: '成功',       cls: 'approved' },
  failed:     { label: '失败',       cls: 'rejected' },
  urgent:     { label: '紧急',       cls: 'danger' },
  high:       { label: '高',         cls: 'warning' },
  medium:     { label: '中',         cls: 'pending' },
  low:        { label: '低',         cls: 'neutral' },
};

interface Props {
  status: string;
  /** Override label */
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, className, size = 'md' }: Props) {
  const conf = LABELS[status] ?? { label: status, cls: 'neutral' };
  return (
    <span className={cn('admin-badge', conf.cls, className)} style={size === 'sm' ? { padding: '2px 7px', fontSize: 10 } : undefined}>
      {label ?? conf.label}
    </span>
  );
}

export function statusLabel(status: string): string {
  return LABELS[status]?.label ?? status;
}

export default StatusBadge;
