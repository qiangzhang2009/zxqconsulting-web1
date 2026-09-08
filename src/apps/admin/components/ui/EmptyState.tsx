// EmptyState — illustrated empty placeholders
import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="admin-empty">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-zinc-800 flex items-center justify-center text-zinc-600">
        {icon ?? <Inbox size={26} />}
      </div>
      <div>
        <div className="text-sm font-semibold text-zinc-300">{title}</div>
        {description && <div className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">{description}</div>}
      </div>
      {action}
    </div>
  );
}

export default EmptyState;
