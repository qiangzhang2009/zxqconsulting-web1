// Admin UI Context — sidebar state, toasts, preferences
import { createContext, useCallback, useContext, useState, useRef } from 'react';
import type { ReactNode } from 'react';

export interface ToastInput {
  id?: string;
  title: string;
  description?: string;
  variant?: 'info' | 'success' | 'error';
  durationMs?: number;
}

interface Toast extends Required<Pick<ToastInput, 'variant' | 'durationMs'>> {
  id: string;
  title: string;
  description?: string;
}

interface UIContextValue {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  toggleSidebar: () => void;
  setSidebarMobile: (open: boolean) => void;
  toasts: Toast[];
  pushToast: (t: ToastInput) => string;
  dismissToast: (id: string) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
  const setSidebarMobile = (open: boolean) => setSidebarMobileOpen(open);

  const pushToast = useCallback((t: ToastInput): string => {
    counter.current += 1;
    const id = t.id || `toast-${Date.now()}-${counter.current}`;
    const next: Toast = {
      id,
      title: t.title,
      description: t.description,
      variant: t.variant || 'info',
      durationMs: t.durationMs ?? 3800,
    };
    setToasts((prev) => [...prev, next]);
    if (next.durationMs > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, next.durationMs);
    }
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const value: UIContextValue = {
    sidebarCollapsed,
    sidebarMobileOpen,
    toggleSidebar,
    setSidebarMobile,
    toasts,
    pushToast,
    dismissToast,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
