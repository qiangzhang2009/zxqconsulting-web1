// Admin Auth Context — RBAC + 2FA
// Authenticates against /api/admin/login. Session persisted in localStorage.
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

type Role = 'super_admin' | 'admin' | 'editor' | 'viewer';

interface AuthContextValue {
  token: string | null;
  email: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresTwoFactor: boolean;
  login: (email: string, password: string, totpToken?: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  hasPermission: (permission: 'read' | 'write' | 'delete' | 'admin') => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const getInitialToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('qhs_admin_token');
  };

  const initialToken = getInitialToken();
  if (initialToken) api.setToken(initialToken);

  const [token, setToken] = useState<string | null>(initialToken);
  const [email, setEmail] = useState<string | null>(
    initialToken ? localStorage.getItem('qhs_admin_email') : null
  );
  const [role, setRole] = useState<Role | null>(
    (localStorage.getItem('qhs_admin_role') as Role | null) || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  const login = async (
    loginEmail: string,
    password: string,
    totpToken?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.login(loginEmail, password, totpToken);
      if (response.success && response.token) {
        setToken(response.token);
        setEmail(loginEmail);
        setRole(response.role || 'admin');
        localStorage.setItem('qhs_admin_email', loginEmail);
        localStorage.setItem('qhs_admin_role', response.role || 'admin');
        setRequiresTwoFactor(false);
        setIsLoading(false);
        return true;
      } else if (response.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setIsLoading(false);
        return false;
      } else {
        setError(response.error || '登录失败');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '网络错误';
      setError(msg === 'Unauthorized' ? '账号或密码错误' : msg);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    api.logout();
    setToken(null);
    setEmail(null);
    setRole(null);
    localStorage.removeItem('qhs_admin_token');
    localStorage.removeItem('qhs_admin_email');
    localStorage.removeItem('qhs_admin_role');
  };

  const clearError = () => setError(null);

  const hasPermission = (permission: 'read' | 'write' | 'delete' | 'admin'): boolean => {
    if (!role) return false;
    const map: Record<Role, Set<string>> = {
      super_admin: new Set(['read', 'write', 'delete', 'admin']),
      admin: new Set(['read', 'write', 'delete']),
      editor: new Set(['read', 'write']),
      viewer: new Set(['read']),
    };
    return map[role]?.has(permission) ?? false;
  };

  const value: AuthContextValue = {
    token,
    email,
    role,
    isAuthenticated: !!token,
    isLoading,
    error,
    requiresTwoFactor,
    login,
    logout,
    clearError,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

// 权限 Hook
export function usePermission(permission: 'read' | 'write' | 'delete' | 'admin'): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}