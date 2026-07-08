// Admin Auth Context
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

interface AuthContextValue {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage synchronously to prevent flash of login screen
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (loginEmail: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.login(loginEmail, password);
      if (response.success && response.token) {
        setToken(response.token);
        setEmail(loginEmail);
        localStorage.setItem('qhs_admin_email', loginEmail);
        setIsLoading(false);
        return true;
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
    localStorage.removeItem('qhs_admin_email');
  };

  const clearError = () => setError(null);

  const value: AuthContextValue = {
    token,
    email,
    isAuthenticated: !!token,
    isLoading,
    error,
    login,
    logout,
    clearError,
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