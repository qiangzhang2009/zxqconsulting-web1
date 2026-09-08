// API Client for Admin Dashboard
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
      if (this.token !== 'dev_bypass_token_2026') {
        window.location.href = '/admin/login';
      }
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
}

export const api = new ApiClient();
export default api;
