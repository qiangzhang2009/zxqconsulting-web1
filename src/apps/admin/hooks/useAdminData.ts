// Custom hooks for admin data
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type {
  AnalyticsData,
  SubmissionsResponse,
  DiagnosisResponse,
  VisitorsResponse,
  CommentsResponse,
  ResearchAnalyticsData,
  Submission,
  Comment,
} from '../types/admin';

// Generic fetch hook
function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(deps)]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}

// Analytics
export function useAnalytics(days = 30) {
  return useFetch<AnalyticsData>(
    () => api.getAnalytics({ days }),
    [days]
  );
}

// Submissions
export function useSubmissions(params: { page?: number; limit?: number; search?: string; status?: string }) {
  return useFetch<SubmissionsResponse>(
    () => api.getSubmissions(params),
    [params.page, params.limit, params.search, params.status]
  );
}

export async function updateSubmission(id: string, data: Partial<Submission>) {
  return api.updateSubmission(id, data);
}

export async function deleteSubmission(id: string) {
  return api.deleteSubmission(id);
}

// Diagnoses
export function useDiagnoses(params: { page?: number; limit?: number; search?: string }) {
  return useFetch<DiagnosisResponse>(
    () => api.getDiagnoses(params),
    [params.page, params.limit, params.search]
  );
}

// Visitors
export function useVisitors(params: { page?: number; limit?: number; search?: string }) {
  return useFetch<VisitorsResponse>(
    () => api.getVisitors(params),
    [params.page, params.limit, params.search]
  );
}

// Comments
export function useComments(params: { page?: number; limit?: number; search?: string; status?: string }) {
  return useFetch<CommentsResponse>(
    () => api.getComments(params),
    [params.page, params.limit, params.search, params.status]
  );
}

export async function updateComment(id: string, status: string) {
  return api.updateComment(id, status);
}

export async function deleteComment(id: string) {
  return api.deleteComment(id);
}

// Research
export function useResearchAnalytics(days = 30) {
  return useFetch<ResearchAnalyticsData>(
    () => api.getResearchAnalytics({ days }),
    [days]
  );
}

// ── Audit Log ──
export function useAuditLog(params: { days?: number; action?: string; limit?: number } = {}) {
  return useFetch(
    () => api.getAuditLog(params),
    [params.days, params.action, params.limit]
  );
}

// ── Active Sessions ──
export function useActiveSessions() {
  return useFetch(() => api.getActiveSessions(), []);
}

// ── IP Whitelist ──
export function useWhitelist() {
  return useFetch(() => api.getWhitelist(), []);
}

// ── Current Admin (me) ──
export function useMe() {
  return useFetch(() => api.getMe(), []);
}

// ── Notifications ──
export function useNotifications() {
  return useFetch(() => api.getNotifications(), []);
}

// ── Tasks ──
export function useTasks() {
  return useFetch(() => api.getTasks(), []);
}

// ── Projects ──
export function useProjects() {
  return useFetch(() => api.getProjects(), []);
}

// ── Whitepapers ──
export function useWhitepapers() {
  return useFetch(() => api.getWhitepapers(), []);
}
