// Admin Dashboard Types

// ============ Auth ============
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
  requiresTwoFactor?: boolean;
  role?: 'super_admin' | 'admin' | 'editor' | 'viewer';
}

export interface Session {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'analyst' | 'moderator';
  createdAt: string;
}

// ============ Analytics ============
export interface RecentReport {
  id: string;
  market_id: string;
  market_name: string | null;
  market_name_en: string | null;
  category: string;
  diagnosis_input: DiagnosisInput;
  diagnosis_report: DiagnosisReportData;
  qualification_decision: QualificationDecisionData;
  country: string | null;
  region: string | null;
  city: string | null;
  visitor_id: string | null;
  created_at: string;
}

export interface AnalyticsData {
  today: {
    visitors: number;
    submissions: number;
  };
  total: {
    visitors: number;
    submissions: number;
    conversionRate: number;
  };
  trend: Array<{
    date: string;
    visitors: number;
    submissions: number;
  }>;
  topCountries: Array<{ country: string; visitors: number }>;
  topMarkets: Array<{ market_id: string; market_name: string; count: number }>;
  topSources: Array<{ source: string; count: number }>;
  statusBreakdown: Record<string, number>;
  recentReports: RecentReport[];
  isRealData: boolean;
}

// ============ Submissions ============
export interface Submission {
  id: string;
  visitor_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  product_stage: string | null;
  target_markets: string | null;
  timeline: string | null;
  challenge: string | null;
  budget: string | null;
  has_validation: string | null;
  source_page: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
}

export interface SubmissionsResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Submission[];
}

// ============ Diagnosis Reports ============
export interface DiagnosisInput {
  projectStage: string;
  budget: string;
  validationStatus: string;
  targetMarketsCount: string;
  keyQuestion: string;
}

export interface DiagnosisReportData {
  summary: string;
  recommendation: string;
  goToMarketDecision: string;
  opportunityScore: number;
  complexityScore: number;
  budgetPressure: string;
  recommendedPath: string;
  firstMarketLabel: string;
  primaryBlocker: string;
}

export interface QualificationDecisionData {
  leadTier: 'L1' | 'L2' | 'L3';
  reviewFit: string;
  escalationReason: string;
  blockers: string[];
  requiredBeforeExpert: string[];
}

export interface DiagnosisReport {
  id: string;
  visitor_id: string | null;
  market_id: string;
  market_name: string | null;
  market_name_en: string | null;
  category: string;
  product_type: string | null;
  diagnosis_input: DiagnosisInput;
  diagnosis_report: DiagnosisReportData;
  qualification_decision: QualificationDecisionData;
  country: string | null;
  region: string | null;
  city: string | null;
  created_at: string;
}

export interface DiagnosisResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: DiagnosisReport[];
}

// ============ Visitors ============
export interface Visitor {
  id: string;
  visitor_id: string | null;
  contact_name: string | null;
  company_name: string | null;
  contact_phone: string | null;
  phone: string | null;
  email: string | null;
  selected_markets: string[];
  country: string | null;
  region: string | null;
  city: string | null;
  device: string | null;
  device_type: string | null;
  source: string | null;
  visit_count: number | null;
  first_visit: string | null;
  last_visit: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface VisitorsResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Visitor[];
}

// ============ Comments ============
export interface Comment {
  id: string;
  user_name: string;
  user_email: string;
  content: string;
  timestamp: string;
  likes: number;
  status: 'approved' | 'pending' | 'rejected';
  geo_country: string;
  geo_region: string;
  geo_city: string;
  lang: string;
  replies: string;
}

export interface CommentsResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Comment[];
}

// ============ Research Analytics ============
export interface ReportStats {
  id: string;
  title: string;
  region: string;
  category: string;
  pageviews: number;
  unique_visitors: number;
  countries_reached: number;
  sources_count: number;
  opens: number;
  downloads: number;
  externals: number;
  refreshes: number;
  back_to_hub: number;
}

export interface ResearchAnalyticsData {
  overview: {
    todayPageviews: number;
    todayVisitors: number;
    totalPageviews: number;
    totalUniqueVisitors: number;
    totalCountries: number;
    totalReports: number;
    avgReadTime: number | null;
  };
  reports: ReportStats[];
  trend: Array<Record<string, number | string>>;
  trafficSources: Array<{ traffic_source: string; pageviews: number; visitors: number }>;
  devices: Array<{ device_type: string; pageviews: number }>;
  recentVisitors: Array<{
    visitor_id: string;
    report_id: string;
    country: string;
    region: string;
    city: string;
    device_type: string;
    browser: string;
    traffic_source: string;
    created_at: string;
  }>;
  isRealData: boolean;
}

// ============ Client Intake ============
export interface ClientIntake {
  id: number;
  // 企业基本信息
  company_name: string | null;
  company_name_en: string | null;
  unified_code: string | null;
  company_type: string | null;
  establish_date: string | null;
  registered_capital: string | null;
  industry: string | null;
  product_category: string | null;
  company_intro: string | null;
  contact_name: string | null;
  contact_title: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_wechat: string | null;
  // 出海现状
  overseas_stage: string | null;
  has_branch: string | null;
  branch_details: string | null;
  has_revenue: string | null;
  overseas_revenue: string | null;
  revenue_ratio: string | null;
  overseas_experience: string | null;
  // 目标市场
  target_markets: string | null;
  priority_markets: string | null;
  market_timeline: string | null;
  market_factors: string | null;
  // 商业模式
  business_model: string | null;
  product_detail: string | null;
  avg_price: string | null;
  supply_capacity: string | null;
  has_cert: string | null;
  cert_detail: string | null;
  supply_chain: string | null;
  // 服务需求
  services: string | null;
  service_detail: string | null;
  existing_partners: string | null;
  // 预算时间
  budget: string | null;
  budget_focus: string | null;
  start_date: string | null;
  end_date: string | null;
  urgency: string | null;
  // 财务状况
  annual_revenue: string | null;
  profit_rate: string | null;
  available_funds: string | null;
  finance_need: string | null;
  financial_note: string | null;
  // 竞争分析
  competitors: string | null;
  advantages: string | null;
  key_factors: string | null;
  // 风险挑战
  challenges: string | null;
  past_problems: string | null;
  risk_tolerance: string | null;
  // 资料提交
  docs: string | null;
  additional_note: string | null;
  // 元数据
  ip_address: string | null;
  country: string | null;
  status: string | null;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ClientIntakeResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ClientIntake[];
}

// ============ UI State ============
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FilterState {
  search: string;
  status: string;
  dateRange: {
    from: string | null;
    to: string | null;
  };
}

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

// ============ Report Interactions (likes / shares / read time) ============
export interface ReportInteractionItem {
  report_id: string;
  likes: number;
  shares: number;
  views: number;
  unique_visitors: number;
  read_sessions: number;
  avg_read_seconds: number;
  max_read_seconds: number;
  avg_scroll: number;
}

export interface ReportInteractionsResponse {
  success: boolean;
  days: number;
  since: number;
  totals: {
    likes: number;
    shares: number;
    views: number;
    read_sessions: number;
    unique_visitors: number;
  };
  items: ReportInteractionItem[];
}

export interface ReportInteractionDetail {
  success: boolean;
  report_id: string;
  days: number;
  summary: {
    likes: number;
    shares: number;
    views: number;
    unique_visitors: number;
    read_sessions: number;
    avg_read_seconds: number;
    max_read_seconds: number;
    avg_scroll: number;
  };
  sessions: Array<{
    id: number;
    session_id: string;
    ip: string;
    country: string;
    region: string;
    city: string;
    duration_seconds: number;
    max_scroll: number;
    created_at: number;
  }>;
  recent_events: Array<{
    id: number;
    event_type: string;
    action: string;
    ip: string;
    country: string;
    duration_seconds: number;
    max_scroll: number;
    created_at: number;
  }>;
  top_countries: Array<{ country: string; visitors: number }>;
}
