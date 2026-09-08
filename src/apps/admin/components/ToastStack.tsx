// ToastStack — Global admin toasts wired to UIContext
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useUI } from '../stores/UIContext';

const VARIANT = {
  info: { icon: Info, accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  success: { icon: CheckCircle2, accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  error: { icon: AlertCircle, accent: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
} as const;

export function ToastStack() {
  const { toasts, dismissToast } = useUI();
  if (!toasts.length) return null;
  return (
    <div className="admin-toast-stack">
      {toasts.map((t) => {
        const v = VARIANT[t.variant];
        const Icon = v.icon;
        return (
          <div
            key={t.id}
            className="admin-toast"
            role="status"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${v.accent}`}>
              <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{t.title}</div>
              {t.description && (
                <div className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{t.description}</div>
              )}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-zinc-500 hover:text-white"
              aria-label="关闭"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastStack;
