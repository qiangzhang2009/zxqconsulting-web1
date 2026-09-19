// API Client for Admin Dashboard
// Compatible with Cloudflare Workers backend (KV-based sessions)
import type {
  LoginResponse,
  AnalyticsData,
  SubmissionsResponse,
  DiagnosisResponse,
  VisitorsResponse,
  CommentsResponse,
  ResearchAnalyticsData,
  Submission,
  Comment,
  ReportInteractionsResponse,
  ReportInteractionDetail,
} from '../types/admin';

const API_BASE = '/api/admin';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('qhs_admin_token', token);
    } else {
      localStorage.removeItem('qhs_admin_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('qhs_admin_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/admin/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // ============ Auth ============
  async login(email: string, password: string, totpToken?: string): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, totpToken }),
    });

    if (data.success && data.token) {
      this.setToken(data.token);
    }

    return data;
  }

  logout() {
    this.setToken(null);
  }

  // ============ Analytics ============
  async getAnalytics(params?: { website_id?: string; days?: number }): Promise<AnalyticsData> {
    const query = new URLSearchParams();
    if (params?.website_id) query.set('website_id', params.website_id);
    if (params?.days) query.set('days', params.days.toString());

    return this.request<AnalyticsData>(`/analytics?${query}`);
  }

  // ============ Submissions ============
  async getSubmissions(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<SubmissionsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);

    return this.request<SubmissionsResponse>(`/submissions?${query}`);
  }

  async updateSubmission(id: string, data: Partial<Submission>): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/submissions?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSubmission(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/submissions?id=${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Diagnoses ============
  async getDiagnoses(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<DiagnosisResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);

    return this.request<DiagnosisResponse>(`/reports?${query}`);
  }

  // ============ Visitors ============
  async getVisitors(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<VisitorsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);

    return this.request<VisitorsResponse>(`/visitors?${query}`);
  }

  // ============ Comments ============
  async getComments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<CommentsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);

    return this.request<CommentsResponse>(`/comments?${query}`);
  }

  async updateComment(id: string, status: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/comments?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteComment(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/comments?id=${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Client Intake ============
  async getClientIntake(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    data: import('../types/admin').ClientIntake[];
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);

    return this.request<{
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      data: import('../types/admin').ClientIntake[];
    }>(`/client-intake?${query}`);
  }

  async updateClientIntake(id: string, data: Partial<import('../types/admin').ClientIntake>): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/client-intake?id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ============ Research Analytics ============
  async getResearchAnalytics(params?: {
    website_id?: string;
    days?: number;
  }): Promise<ResearchAnalyticsData> {
    const query = new URLSearchParams();
    if (params?.website_id) query.set('website_id', params.website_id);
    if (params?.days) query.set('days', params.days.toString());

    return this.request<ResearchAnalyticsData>(`/research-analytics?${query}`);
  }

  // ============ Report Interactions ============
  async getReportInteractions(params?: { days?: number; report_id?: string }): Promise<ReportInteractionsResponse | ReportInteractionDetail> {
    const query = new URLSearchParams();
    if (params?.days) query.set('days', params.days.toString());
    if (params?.report_id) query.set('report_id', params.report_id);
    return this.request<ReportInteractionsResponse | ReportInteractionDetail>(`/report-interactions?${query}`);
  }

  // ============ Report Comments ============
  async getReportComments(params?: { days?: number; report_id?: string; q?: string }): Promise<{
    success: boolean;
    comments: Array<{
      id: number;
      report_id: string;
      nickname: string;
      content: string;
      ip: string;
      ip_hash: string;
      country: string;
      region: string;
      city: string;
      ua: string;
      status: string;
      created_at: string;
    }>;
    stats: { total: number; visible: number; hidden: number; reports: number; unique_users: number };
    top_reports: Array<{ report_id: string; cnt: number }>;
    daily: Array<{ day: string; cnt: number }>;
    days: number;
  }> {
    const query = new URLSearchParams();
    if (params?.days) query.set('days', params.days.toString());
    if (params?.report_id) query.set('report_id', params.report_id);
    if (params?.q) query.set('q', params.q);
    return this.request(`/report-comments?${query}`);
  }

  async hideReportComment(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/report-comments?id=${id}`, { method: 'DELETE' });
  }

  async restoreReportComment(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/report-comments`, {
      method: 'POST',
      body: JSON.stringify({ id, action: 'restore' }),
    });
  }

  // ============ Audit Log ============
  async getAuditLog(params?: {
    days?: number;
    action?: string;
    limit?: number;
  }): Promise<{
    success: boolean;
    days: number;
    logs: Array<{
      id: string;
      action: string;
      target: string;
      user_email: string;
      user_role: string;
      ip: string;
      status: string;
      timestamp: string;
      metadata?: Record<string, unknown>;
    }>;
    stats: {
      total: number;
      today: number;
      success: number;
      failed: number;
      logins: number;
      dataChanges: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params?.days) query.set('days', params.days.toString());
    if (params?.action) query.set('action', params.action);
    if (params?.limit) query.set('limit', params.limit.toString());
    return this.request(`/audit-log?${query}`);
  }

  // ============ Active Sessions ============
  async getActiveSessions(): Promise<{
    success: boolean;
    sessions: Array<{
      token: string;
      device: string;
      browser: string;
      os: string;
      ip: string;
      country: string;
      city: string;
      location: string;
      created_at: string;
      last_active: string;
      current: boolean;
    }>;
  }> {
    return this.request('/sessions');
  }

  async terminateSession(token: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/sessions?token=${encodeURIComponent(token)}`, {
      method: 'DELETE',
    });
  }

  async terminateAllOtherSessions(): Promise<{ success: boolean; count: number }> {
    return this.request<{ success: boolean; count: number }>('/sessions?action=terminate-all', {
      method: 'DELETE',
    });
  }

  // ============ IP Whitelist ============
  async getWhitelist(): Promise<{
    success: boolean;
    whitelist: Array<{
      id: string;
      pattern: string;
      label: string;
      note: string;
      added_at: string;
    }>;
  }> {
    return this.request('/whitelist');
  }

  async addWhitelist(entry: { pattern: string; label: string; note?: string }): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/whitelist', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async removeWhitelist(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/whitelist?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // ============ Current Admin (me) ============
  async getMe(): Promise<{
    success: boolean;
    admin: {
      email: string;
      name: string;
      role: 'super_admin' | 'admin' | 'editor' | 'viewer';
      twoFactorEnabled: boolean;
      createdAt: string;
      lastLoginAt: string | null;
      loginCount: number;
    };
  }> {
    return this.request('/me');
  }

  async updateMe(data: { name?: string }): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ============ Notifications ============
  async getNotifications(): Promise<{
    success: boolean;
    items: Array<{
      id: string;
      type: 'lead' | 'report' | 'comment' | 'client' | 'system';
      title: string;
      description: string;
      href: string;
      icon: 'inbox' | 'brain' | 'message' | 'user' | 'shield';
      timestamp: string;
      unread: boolean;
    }>;
    unread_count: number;
  }> {
    return this.request('/notifications');
  }

  // ============ Tasks ============
  async getTasks(): Promise<{
    success: boolean;
    tasks: Array<{
      id: string;
      title: string;
      source: '线索管理' | 'AI 诊断' | '客户采集' | '网站评论' | '报告留言';
      source_href: string;
      source_id: string;
      priority: 'high' | 'medium' | 'low';
      status: 'pending' | 'in_progress' | 'completed';
      created_at: string;
      due_date: string | null;
      assignee: string;
    }>;
    counts: {
      total: number;
      pending: number;
      in_progress: number;
      completed: number;
      urgent: number;
    };
  }> {
    return this.request('/tasks');
  }

  async updateTaskStatus(id: string, status: 'pending' | 'in_progress' | 'completed'): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/tasks', {
      method: 'PATCH',
      body: JSON.stringify({ id, status }),
    });
  }

  // ============ Projects ============
  async getProjects(): Promise<{
    success: boolean;
    projects: Array<{
      id: string;
      code: string;
      name: string;
      client: string;
      industry: string;
      status: string;
      priority: string;
      target_markets: string[];
      category: string;
      start_date: string;
      expected_launch_date: string | null;
      budget: string;
      advisor: string;
      source: string;
      tags: string[];
      milestones: Array<{
        id: string;
        title: string;
        due_date: string;
        status: string;
        assignee: string;
      }>;
      created_at: string;
      updated_at: string;
    }>;
  }> {
    return this.request('/projects');
  }

  async createProject(data: {
    name: string;
    client: string;
    industry: string;
    target_markets: string[];
    budget: string;
    advisor: string;
    source?: string;
    category?: string;
    priority?: string;
    notes?: string;
  }): Promise<{ success: boolean; id?: string; code?: string }> {
    return this.request<{ success: boolean; id?: string; code?: string }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Record<string, unknown>): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/projects?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/projects?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // ============ Whitepapers ============
  async getWhitepapers(): Promise<{
    success: boolean;
    whitepapers: Array<{
      id: string;
      title: string;
      stage: 'draft' | 'writing' | 'review' | 'published';
      author: string;
      updated_at: string;
      word_count: number;
      priority: 'high' | 'medium' | 'low';
    }>;
  }> {
    return this.request('/whitepapers');
  }

  async createWhitepaper(data: {
    title: string;
    author: string;
    stage: 'draft' | 'writing' | 'review' | 'published';
    priority: 'high' | 'medium' | 'low';
    word_count?: number;
  }): Promise<{ success: boolean; id?: string }> {
    return this.request<{ success: boolean; id?: string }>('/whitepapers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWhitepaperStage(id: string, stage: 'draft' | 'writing' | 'review' | 'published'): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/whitepapers?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    });
  }

  async deleteWhitepaper(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/whitepapers?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
export default api;
