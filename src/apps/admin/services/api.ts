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
const DEV_BYPASS = (import.meta as any).env?.VITE_DEV_BYPASS === '1';

// Simple hash function matching the backend (qhs_admin_salt_2026)
function hashPassword(password: string): string {
  let hash = 0;
  const salt = 'qhs_admin_salt_2026';
  const str = salt + password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'v1_' + Math.abs(hash).toString(16).padStart(12, '0');
}

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
    // Dev bypass mode - return mock data for testing
    if (DEV_BYPASS && this.token === 'dev_bypass_token_2026') {
      return this.getMockData(endpoint) as T;
    }

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

  // Mock data for dev bypass mode
  private getMockData(endpoint: string): any {
    const mockVisitors = [
      { id: 'v1', visitor_id: 'v1abc123', contact_name: '张三', company_name: '北京科技有限公司', email: 'zhangsan@example.com', country: 'CN', city: '北京', device_type: 'desktop', visit_count: 5, first_visit: '2026-09-10T08:00:00Z', last_visit: '2026-09-17T14:30:00Z' },
      { id: 'v2', visitor_id: 'v2def456', contact_name: '李四', company_name: '上海贸易集团', email: 'lisi@example.com', country: 'CN', city: '上海', device_type: 'mobile', visit_count: 3, first_visit: '2026-09-12T10:00:00Z', last_visit: '2026-09-16T09:00:00Z' },
      { id: 'v3', visitor_id: 'v3ghi789', contact_name: '王五', company_name: '广州制药厂', email: 'wangwu@example.com', country: 'CN', city: '广州', device_type: 'desktop', visit_count: 8, first_visit: '2026-09-05T12:00:00Z', last_visit: '2026-09-17T11:00:00Z' },
    ];

    const mockSubmissions = [
      { id: 's1', name: '陈经理', email: 'chen@example.com', phone: '13800138001', company: '杭州中医药集团', status: 'new', country: 'CN', created_at: '2026-09-17T08:00:00Z', product_stage: 'exploring', target_markets: '日本,新加坡', message: '希望了解中医药出口日本的法规要求' },
      { id: 's2', name: '刘总监', email: 'liu@example.com', phone: '13800138002', company: '深圳保健品公司', status: 'contacted', country: 'CN', created_at: '2026-09-15T10:30:00Z', product_stage: 'pilot', target_markets: '澳大利亚,新西兰', message: '保健品出口澳大利亚需要哪些认证' },
      { id: 's3', name: '赵总', email: 'zhao@example.com', phone: '13800138003', company: '成都本草健康', status: 'qualified', country: 'CN', created_at: '2026-09-10T14:00:00Z', product_stage: 'launch', target_markets: '东南亚', message: '已准备好所有材料，希望尽快启动项目' },
    ];

    if (endpoint.startsWith('/analytics')) {
      return {
        today: { visitors: 12, submissions: 2 },
        total: { visitors: 156, submissions: 28, conversionRate: 17.95 },
        trend: Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          return {
            date: d.toISOString().split('T')[0],
            visitors: Math.floor(Math.random() * 20) + 5,
            submissions: Math.floor(Math.random() * 5) + 1,
          };
        }),
        topCountries: [
          { country: 'CN', visitors: 89 },
          { country: 'US', visitors: 23 },
          { country: 'SG', visitors: 15 },
          { country: 'AU', visitors: 12 },
          { country: 'JP', visitors: 8 },
        ],
        topMarkets: [
          { market_id: 'japan', market_name: '日本市场', count: 45 },
          { market_id: 'southeast-asia', market_name: '东南亚市场', count: 38 },
          { market_id: 'australia', market_name: '澳大利亚', count: 22 },
        ],
        statusBreakdown: { new: 12, contacted: 8, qualified: 5, closed: 3 },
        recentReports: [
          { id: 'r1', market_id: 'japan', market_name: '日本市场', country: 'JP', qualification_decision: { leadTier: 'L1' }, created_at: '2026-09-16T10:00:00Z', diagnosis_report: { opportunityScore: 82 } },
          { id: 'r2', market_id: 'southeast-asia', market_name: '东南亚市场', country: 'SG', qualification_decision: { leadTier: 'L2' }, created_at: '2026-09-15T14:00:00Z', diagnosis_report: { opportunityScore: 65 } },
        ],
      };
    }

    if (endpoint.startsWith('/submissions')) {
      return {
        total: mockSubmissions.length,
        page: 1,
        limit: 20,
        totalPages: 1,
        data: mockSubmissions,
      };
    }

    if (endpoint.startsWith('/visitors')) {
      return {
        total: mockVisitors.length,
        page: 1,
        limit: 20,
        totalPages: 1,
        data: mockVisitors,
      };
    }

    if (endpoint.startsWith('/comments')) {
      return {
        total: 15,
        page: 1,
        limit: 20,
        totalPages: 1,
        data: [
          { id: 'c1', user_name: '健康爱好者', user_email: 'user1@example.com', content: '这篇文章很有帮助！', timestamp: '2026-09-17T10:00:00Z', likes: 12, status: 'approved', geo_country: 'CN', geo_region: '北京', geo_city: '北京', lang: 'zh' },
          { id: 'c2', user_name: '出海顾问', user_email: 'user2@example.com', content: '补充一下日本市场的最新法规变化', timestamp: '2026-09-16T15:00:00Z', likes: 8, status: 'pending', geo_country: 'JP', geo_region: '东京', geo_city: '东京', lang: 'ja' },
        ],
      };
    }

    if (endpoint.startsWith('/reports')) {
      return {
        total: 5,
        page: 1,
        limit: 20,
        totalPages: 1,
        data: [
          { id: 'r1', market_id: 'japan', market_name: '日本市场', category: '中成药', product_type: '颗粒剂', country: 'JP', diagnosis_report: { opportunityScore: 82, summary: '日本市场机会评分高', recommendation: '推荐进入', goToMarketDecision: '可直接出口', recommendedPath: '药品注册路径' }, qualification_decision: { leadTier: 'L1', reviewFit: '高度适配', escalationReason: '', blockers: [] }, created_at: '2026-09-16T10:00:00Z' },
          { id: 'r2', market_id: 'southeast-asia', market_name: '东南亚市场', category: '保健食品', product_type: '膳食补充剂', country: 'SG', diagnosis_report: { opportunityScore: 65, summary: '市场机会中等', recommendation: '可考虑', goToMarketDecision: '需进一步评估', recommendedPath: '保健食品备案' }, qualification_decision: { leadTier: 'L2', reviewFit: '中度适配', escalationReason: '', blockers: [] }, created_at: '2026-09-15T14:00:00Z' },
        ],
      };
    }

    if (endpoint.startsWith('/client-intake')) {
      return {
        total: 8,
        page: 1,
        limit: 20,
        totalPages: 1,
        data: [
          { id: 1, company_name: '北京本草制药', contact_name: '孙经理', contact_email: 'sun@example.com', industry: 'tcm', overseas_stage: 'pilot', target_markets: '日本,韩国', budget: '500w-2000w', status: 'new', created_at: '2026-09-17T08:00:00Z' },
          { id: 2, company_name: '上海健康科技', contact_name: '周总监', contact_email: 'zhou@example.com', industry: 'healthcare', overseas_stage: 'exploring', target_markets: '东南亚', budget: '200w-500w', status: 'contacted', created_at: '2026-09-15T10:00:00Z' },
        ],
      };
    }

    if (endpoint.startsWith('/research-analytics')) {
      return {
        overview: {
          todayPageviews: 234,
          todayVisitors: 89,
          totalPageviews: 12456,
          totalUniqueVisitors: 4521,
          totalCountries: 28,
          totalReports: 12,
          avgReadTime: 180,
        },
        reports: [
          { id: 'rep1', title: '日本中成药市场准入指南', region: '日本', category: '中成药', pageviews: 1256, unique_visitors: 892, countries_reached: 15, sources_count: 8, opens: 234, downloads: 45, externals: 12, refreshes: 28, back_to_hub: 67 },
          { id: 'rep2', title: '东南亚保健食品市场分析', region: '东南亚', category: '保健食品', pageviews: 892, unique_visitors: 623, countries_reached: 12, sources_count: 6, opens: 156, downloads: 32, externals: 8, refreshes: 19, back_to_hub: 45 },
        ],
        trafficSources: [
          { traffic_source: 'Google', pageviews: 4567, visitors: 1234 },
          { traffic_source: '直接访问', pageviews: 2345, visitors: 2345 },
          { traffic_source: '微信', pageviews: 1234, visitors: 890 },
          { traffic_source: 'LinkedIn', pageviews: 567, visitors: 234 },
        ],
        devices: [
          { device_type: 'desktop', pageviews: 6234 },
          { device_type: 'mobile', pageviews: 4567 },
          { device_type: 'tablet', pageviews: 1234 },
        ],
      };
    }

    if (endpoint.startsWith('/report-interactions')) {
      return {
        success: true,
        days: 30,
        totals: { likes: 456, shares: 123, views: 8765, read_sessions: 2341, unique_visitors: 1823 },
        items: [
          { report_id: 'rep-japan-001', likes: 89, shares: 23, views: 1234, unique_visitors: 567, read_sessions: 234, avg_read_seconds: 245, max_read_seconds: 890, avg_scroll: 72 },
          { report_id: 'rep-sea-002', likes: 67, shares: 18, views: 987, unique_visitors: 423, read_sessions: 189, avg_read_seconds: 198, max_read_seconds: 678, avg_scroll: 65 },
        ],
      };
    }

    if (endpoint.startsWith('/report-comments')) {
      return {
        success: true,
        comments: [
          { id: 1, report_id: 'rep-japan-001', nickname: '本草爱好者', content: '非常专业的分析，期待更多日本市场内容', ip: '1.2.3.4', country: 'CN', region: '北京', city: '北京', status: 'visible', created_at: '2026-09-17T10:00:00Z' },
          { id: 2, report_id: 'rep-sea-002', nickname: '出海新手', content: '请问有新加坡的具体准入要求吗？', ip: '5.6.7.8', country: 'SG', region: '', city: '新加坡', status: 'visible', created_at: '2026-09-16T15:00:00Z' },
        ],
        stats: { total: 45, visible: 38, hidden: 5, reports: 2 },
        days: 30,
      };
    }

    return { error: 'Unknown endpoint' };
  }

  // ============ Auth ============
  async login(email: string, password: string, totpToken?: string): Promise<LoginResponse> {
    // Dev bypass mode
    if (DEV_BYPASS) {
      const devToken = 'dev_bypass_token_2026';
      this.setToken(devToken);
      return { success: true, token: devToken, role: 'super_admin' };
    }

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
