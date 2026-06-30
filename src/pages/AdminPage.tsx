import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DiagnosisReport {
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

interface DiagnosisInput {
  projectStage: string;
  budget: string;
  validationStatus: string;
  targetMarketsCount: string;
  keyQuestion: string;
}

interface DiagnosisReportData {
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

interface QualificationDecisionData {
  leadTier: string;
  reviewFit: string;
  escalationReason: string;
  blockers: string[];
  requiredBeforeExpert: string[];
}

interface Submission {
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
  status: string;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
}

interface Visitor {
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

interface AnalyticsData {
  today: { visitors: number; submissions: number };
  total: { visitors: number; submissions: number; conversionRate: string };
  trend: Array<{ date: string; visitors: number; submissions: number }>;
  topCountries: Array<{ country: string; visitors: number }>;
  topMarkets: Array<{ market_id: string; market_name: string; count: number }>;
  topSources: Array<{ source: string; count: number }>;
  statusBreakdown: Record<string, number>;
  recentReports: DiagnosisReport[];
  isRealData: boolean;
}

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

const AUTH_KEY = 'qhs_admin_auth';

function encodeAuth(email: string, password: string) {
  return btoa(`${email}:${password}`);
}

function apiFetch(path: string, email: string, password: string, opts: RequestInit = {}) {
  return fetch(path, {
    ...opts,
    headers: {
      ...opts.headers,
      Authorization: `Bearer ${encodeAuth(email, password)}`,
      'Content-Type': 'application/json',
    },
  }).then(r => r.json());
}

// ─── Date / Status Helpers ────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}天前`;
  return fmtDate(iso);
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  new:        { label: '新提交',    color: 'text-blue-400',    bg: 'bg-blue-500/15',    dot: 'bg-blue-400',    border: 'border-blue-500/30' },
  contacted:  { label: '已联系',    color: 'text-amber-400',   bg: 'bg-amber-500/15',   dot: 'bg-amber-400',   border: 'border-amber-500/30' },
  qualified:  { label: '已合格',    color: 'text-emerald-400', bg: 'bg-emerald-500/15', dot: 'bg-emerald-400', border: 'border-emerald-500/30' },
  closed:     { label: '已关闭',    color: 'text-slate-400',   bg: 'bg-slate-500/15',   dot: 'bg-slate-500',   border: 'border-slate-500/30' },
};

const DECISION_META: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  self_serve:          { label: '自助',      color: 'text-slate-400',  bg: 'bg-slate-500/15',  border: 'border-slate-500/30', icon: '◇' },
  prepare_then_apply:  { label: '准备后申请', color: 'text-amber-400', bg: 'bg-amber-500/15',  border: 'border-amber-500/30', icon: '◈' },
  expert_review:       { label: '专家评审',   color: 'text-emerald-400',bg: 'bg-emerald-500/15',border: 'border-emerald-500/30', icon: '◆' },
};

const LEAD_TIER_META: Record<string, { label: string; color: string; bg: string; border: string; score: number }> = {
  L1: { label: '潜在线索',  color: 'text-blue-400',   bg: 'bg-blue-500/15',   border: 'border-blue-500/30',   score: 1 },
  L2: { label: '意向线索',  color: 'text-amber-400',   bg: 'bg-amber-500/15',  border: 'border-amber-500/30',  score: 2 },
  L3: { label: '高价值线索',color: 'text-emerald-400', bg: 'bg-emerald-500/15',border: 'border-emerald-500/30',score: 3 },
};

const STAGE_LABEL: Record<string, string> = {
  idea: '构思阶段', pilot: '试点阶段', launch: '上市阶段', scale: '规模化',
  exploring: '探索中', committed: '已立项', testing: '测试中', expanding: '扩张中',
};
const BUDGET_LABEL: Record<string, string> = {
  'below-500k': '<50万', '500k-2m': '50-200万', '2m-5m': '200-500万', 'above-5m': '>500万',
  below500k: '<50万', '500k2m': '50-200万', '2m5m': '200-500万', above5m: '>500万',
};
const VALIDATION_LABEL: Record<string, string> = {
  none: '无', 'domestic-only': '仅国内', 'some-testing': '部分测试', 'existing-overseas': '已有海外',
  idea: '概念阶段', domestic: '国内验证', overseas: '海外测试', business: '已有商业化',
};

function stageLabel(v: string) { return STAGE_LABEL[v] || v || '—'; }
function budgetLabel(v: string) { return BUDGET_LABEL[v] || v || '—'; }
function validationLabel(v: string) { return VALIDATION_LABEL[v] || v || '—'; }

// ─── Icons ───────────────────────────────────────────────────────────────────

const Icons = {
  grid: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  file: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 3h10v8H3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M6 6h4M6 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  diamond: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L2 5v6l6 3 6-3V5L8 2z" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8 2v11M2 5l6 3 6-3" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  users: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="11.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M14 13c0-1.7-1-3-2.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  logout: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 11l3-3-3-3M13 8H6M6 5H3a1 1 0 00-1 1v4a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  search: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  refresh: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7a5 5 0 015-5 5 5 0 014.3 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M12 7a5 5 0 01-5 5 5 5 0 01-4.3-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M11 3l1.5 2.5L14 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 11L1.5 8.5 0 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  globe: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M7 1.5c-2 2-2 7 0 9M7 1.5c2 2 2 7 0 9M1.5 7h11" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  chart: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 10l3-3 3 2 4-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  funnel: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 3h10l-3.5 5v3l-3 1V8L2 3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  ),
  eye: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="8" rx="6" ry="4" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  x: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  check: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  arrowUp: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  arrowDown: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 2v8M10 6L6 10 2 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  star: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9l-3 1.5.5-3.5L1 4.5l3.5-.5L6 1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    </svg>
  ),
};

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (e: string, p: string) => void }) {
  const [email, setEmail] = useState('zxq@qq.com');
  const [password, setPassword] = useState('zxq2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError('请输入账号和密码'); return; }
    setLoading(true);
    localStorage.setItem(AUTH_KEY, encodeAuth(email.trim(), password.trim()));
    onLogin(email.trim(), password.trim());
  };

  return (
    <div className="min-h-screen bg-[#090e1a] flex items-center justify-center p-4">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/[0.03] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/[0.03] blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20 mb-5 shadow-2xl shadow-emerald-500/10">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path d="M15 4L4 10v10l11 6 11-6V10L15 4z" stroke="#34d399" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M15 4v20M4 10l11 6 11-6" stroke="#34d399" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">岐黄四海</h1>
          <p className="text-sm text-slate-500 mt-2">Intelligence Platform · 管理后台</p>
        </div>

        {/* Form */}
        <form onSubmit={handle} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">账号</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full bg-[#0f1929] border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition backdrop-blur"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">密码</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0f1929] border border-white/8 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition backdrop-blur pr-12"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition p-1">
                {showPwd ? <Icons.x /> : <Icons.eye />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-semibold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                验证中...
              </span>
            ) : '进入后台'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-8">
          © 2026 岐黄四海 · Qihuang Sihai Intelligence Platform
        </p>
      </div>
    </div>
  );
}

// ─── Animated Number ─────────────────────────────────────────────────────────

function AnimatedNumber({ value, duration = 600 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const start = startRef.current;
    const animate = (ts: number) => {
      if (start === null) { startRef.current = ts; }
      const progress = Math.min((ts - (startRef.current ?? ts)) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ data, color = '#34d399', height = 40 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return <div style={{ height }} />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });
  const fillPts = `0,${height} ${pts.join(' ')} ${w},${height}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, meta }: { status: string; meta: typeof STATUS_META[string] }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function DecisionBadge({ decision }: { decision: string }) {
  const meta = DECISION_META[decision] || DECISION_META.self_serve;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
      <span>{meta.icon}</span>
      {meta.label}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const meta = LEAD_TIER_META[tier] || LEAD_TIER_META.L1;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
      {meta.label}
    </span>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.04] rounded-lg ${className}`} />;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, accent = 'text-white', trend }: {
  label: string; value: number | string; sub?: string;
  icon?: React.ReactNode; accent?: string; trend?: number[];
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent p-5 hover:border-white/[0.12] transition-colors">
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-emerald-500/[0.04] -translate-y-1/2 translate-x-1/2" />
      <div className="flex items-start justify-between mb-4">
        <div className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">{label}</div>
        {icon && <div className="text-slate-600">{icon}</div>}
      </div>
      <div className={`text-3xl font-bold ${accent} tracking-tight`}>
        {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
      </div>
      {sub && <div className="text-xs text-slate-500 mt-1.5">{sub}</div>}
      {trend && trend.length > 1 && (
        <div className="mt-3 h-10">
          <Sparkline data={trend} color={accent === 'text-emerald-400' ? '#34d399' : accent === 'text-blue-400' ? '#60a5fa' : '#94a3b8'} />
        </div>
      )}
    </div>
  );
}

// ─── Trend Chart ─────────────────────────────────────────────────────────────

function TrendChart({ data }: { data: Array<{ date: string; visitors: number; submissions: number }> }) {
  if (!data.length) return <div className="h-44 flex items-center justify-center text-slate-600 text-xs">暂无数据</div>;
  const maxV = Math.max(...data.map(d => d.visitors), 1);
  const maxS = Math.max(...data.map(d => d.submissions), 1);
  const max = Math.max(maxV, maxS);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 h-44">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end items-center gap-0.5 group/bar">
            <div className="w-full flex flex-col justify-end items-center gap-0.5">
              <div
                className="w-full rounded-t-sm bg-emerald-500/60 group-hover/bar:bg-emerald-400 transition-all duration-200"
                style={{ height: `${Math.max((d.visitors / max) * 100, 3)}%` }}
                title={`访客: ${d.visitors}`}
              />
              <div
                className="w-[55%] rounded-t-sm bg-blue-400/60 group-hover/bar:bg-blue-300 transition-all duration-200"
                style={{ height: `${Math.max((d.submissions / max) * 100, 2)}%` }}
                title={`申请: ${d.submissions}`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-slate-600">
        <span>{data[0]?.date ? fmtDate(data[0].date) : ''}</span>
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 rounded-sm bg-emerald-500/60 inline-block" />访客</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-1.5 rounded-sm bg-blue-400/60 inline-block" />申请</span>
        </span>
        <span>{data[data.length - 1]?.date ? fmtDate(data[data.length - 1].date) : ''}</span>
      </div>
    </div>
  );
}

// ─── Funnel ──────────────────────────────────────────────────────────────────

function FunnelChart({ total, breakdown }: { total: number; breakdown: Record<string, number> }) {
  const stages = ['new', 'contacted', 'qualified', 'closed'];
  const labels: Record<string, string> = { new: '新提交', contacted: '已联系', qualified: '已合格', closed: '已关闭' };
  const colors: Record<string, string> = {
    new: '#60a5fa',
    contacted: '#fbbf24',
    qualified: '#34d399',
    closed: '#64748b',
  };
  const max = Math.max(...stages.map(s => breakdown[s] || 0), 1);

  return (
    <div className="space-y-3">
      {stages.map(s => {
        const count = breakdown[s] || 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={s} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">{labels[s]}</span>
              <span className="text-white font-medium">{count} <span className="text-slate-600 font-normal">({pct.toFixed(0)}%)</span></span>
            </div>
            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: colors[s] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Donut Chart (CSS-based) ─────────────────────────────────────────────────

function DonutChart({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="text-slate-600 text-xs text-center py-8">暂无数据</div>;

  let cumulative = 0;
  const segments = data.map(d => {
    const pct = (d.value / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { ...d, pct, start, end: cumulative };
  });

  const r = 40;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;

  const describeArc = (startPct: number, endPct: number) => {
    const start = ((startPct / 100) * circumference);
    const end = ((endPct / 100) * circumference);
    return `M ${cx} ${cy - r} A ${r} ${r} 0 ${endPct - startPct > 50 ? 1 : 0} 1 ${cx + r * Math.sin((end / circumference) * 2 * Math.PI)} ${cy - r * Math.cos((end / circumference) * 2 * Math.PI)}`;
  };

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90 shrink-0">
        {segments.map((s, i) => (
          <path key={i}
            d={describeArc(s.start, s.end)}
            fill="none"
            stroke={s.color}
            strokeWidth="8"
            opacity="0.85"
          />
        ))}
        <circle cx={cx} cy={cy} r={r - 5} fill="#0f1929" />
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white" fontSize="10" fontWeight="bold">{total}</text>
        <text x={cx} y={cy + 7} textAnchor="middle" className="fill-slate-500" fontSize="5">总数</text>
      </svg>
      <div className="flex-1 space-y-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-slate-400 flex-1 truncate">{s.label}</span>
            <span className="text-white font-medium">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Submission Detail Modal ─────────────────────────────────────────────────

function SubmissionDetailModal({ sub, email, password, onClose, onUpdate }: {
  sub: Submission; email: string; password: string;
  onClose: () => void; onUpdate: () => void;
}) {
  const [status, setStatus] = useState(sub.status);
  const [notes, setNotes] = useState(sub.notes || '');
  const [saving, setSaving] = useState(false);
  const meta = STATUS_META[status] || STATUS_META.new;

  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/submissions?id=${sub.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${encodeAuth(email, password)}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    setSaving(false);
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-[#0f1929] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700/60 to-slate-800/40 border border-white/8 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-300">{(sub.name || 'A')[0].toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{sub.name || '匿名访客'}</h2>
              <p className="text-xs text-slate-500">{sub.company || '—'} · {fmt(sub.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={sub.status} meta={meta} />
            <button onClick={onClose} className="text-slate-500 hover:text-white transition p-1 rounded-lg hover:bg-white/5">
              <Icons.x />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '邮箱', value: sub.email },
              { label: '电话', value: sub.phone },
              { label: '公司', value: sub.company },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{item.label}</div>
                <div className="text-sm text-white truncate">{item.value || '—'}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-medium">项目信息</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '项目阶段', value: stageLabel(sub.product_stage || '') },
                { label: '目标市场', value: sub.target_markets || '—' },
                { label: '时间线', value: sub.timeline || '—' },
                { label: '预算范围', value: budgetLabel(sub.budget || '') },
                { label: '已有认证', value: validationLabel(sub.has_validation || '') },
                { label: '来源页面', value: sub.source_page || '/' },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{item.label}</div>
                  <div className="text-sm text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {sub.message && (
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-medium">留言内容</div>
              <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4">
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{sub.message}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-medium">处理状态</div>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className={`w-full appearance-none rounded-xl border px-4 py-3 text-sm font-medium ${meta.bg} ${meta.color} border-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500/30 cursor-pointer`}
              >
                {Object.entries(STATUS_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-medium">负责人</div>
              <input
                defaultValue={sub.assigned_to || ''}
                placeholder="分配给..."
                className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/30 transition"
              />
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-medium">内部备注</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="添加处理备注..."
              className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/30 transition resize-none"
            />
          </div>

          <div className="flex gap-2 text-xs text-slate-600">
            <span className="flex items-center gap-1"><Icons.globe /> {sub.country || '—'}</span>
            <span>·</span>
            <span>{sub.region || '—'}</span>
            <span>·</span>
            <span>{sub.city || '—'}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/8 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition rounded-xl">
            取消
          </button>
          <button onClick={save} disabled={saving}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-semibold text-sm rounded-xl transition">
            {saving ? '保存中...' : '保存更新'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Diagnosis Report Detail Modal ───────────────────────────────────────────

function ReportDetailModal({ report, onClose }: { report: DiagnosisReport; onClose: () => void }) {
  const dr = report.diagnosis_report;
  const qd = report.qualification_decision;
  const di = report.diagnosis_input;
  const qMeta = DECISION_META[qd?.reviewFit || ''] || DECISION_META.self_serve;
  const tMeta = LEAD_TIER_META[qd?.leadTier || ''] || LEAD_TIER_META.L1;

  const scoreColor = (s: number) => {
    if (s >= 70) return 'text-emerald-400';
    if (s >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-3xl bg-[#0f1929] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="#34d399" strokeWidth="1.2"/>
                <path d="M10 10v8M3 6l7 4 7-4" stroke="#34d399" strokeWidth="1.2"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">AI 诊断报告</h2>
              <p className="text-xs text-slate-500">{report.market_name || report.market_name_en || report.market_id} · {report.category} · {fmt(report.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DecisionBadge decision={qd?.reviewFit || 'self_serve'} />
            <TierBadge tier={qd?.leadTier || 'L1'} />
            <button onClick={onClose} className="text-slate-500 hover:text-white transition p-1 rounded-lg hover:bg-white/5 ml-1">
              <Icons.x />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {dr && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '市场机会', value: dr.opportunityScore, suffix: '/100' },
                { label: '合规复杂度', value: dr.complexityScore, suffix: '/100' },
                { label: '预算压力', value: dr.budgetPressure === 'low' ? '低' : dr.budgetPressure === 'medium' ? '中' : '高', suffix: '' },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/8 p-4 text-center">
                  <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-widest">{item.label}</div>
                  <div className={`text-2xl font-bold ${item.suffix ? scoreColor(item.value as number) : 'text-white'}`}>
                    {item.value}{item.suffix}
                  </div>
                </div>
              ))}
            </div>
          )}

          {dr && (
            <div className={`rounded-2xl border p-5 ${dr.goToMarketDecision === 'expert_review' ? 'border-emerald-500/30 bg-emerald-500/5' : dr.goToMarketDecision === 'prepare_first' ? 'border-amber-500/30 bg-amber-500/5' : 'border-blue-500/30 bg-blue-500/5'}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${dr.goToMarketDecision === 'expert_review' ? 'bg-emerald-400' : dr.goToMarketDecision === 'prepare_first' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                  {dr.goToMarketDecision === 'expert_review' ? '建议专家评审' : dr.goToMarketDecision === 'prepare_first' ? '建议准备' : '建议立即进入'}
                </span>
              </div>
              <p className="text-sm text-white leading-relaxed mb-2">{dr.summary}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{dr.recommendation}</p>
              {dr.primaryBlocker && (
                <div className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
                  <div className="text-xs text-amber-400 font-medium mb-1">主要障碍</div>
                  <div className="text-sm text-amber-100">{dr.primaryBlocker}</div>
                </div>
              )}
            </div>
          )}

          {di && (
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-medium">用户输入</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '项目阶段', value: stageLabel(di.projectStage) },
                  { label: '预算', value: budgetLabel(di.budget) },
                  { label: '认证状态', value: validationLabel(di.validationStatus) },
                  { label: '目标市场数', value: di.targetMarketsCount || '—' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="text-sm text-white">{item.value}</div>
                  </div>
                ))}
              </div>
              {di.keyQuestion && (
                <div className="mt-2 rounded-xl bg-white/[0.03] border border-white/8 p-3">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">核心问题</div>
                  <div className="text-sm text-slate-300">{di.keyQuestion}</div>
                </div>
              )}
            </div>
          )}

          {qd && (
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-medium">资格评估</div>
              <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4 space-y-3">
                <p className="text-sm text-slate-300 leading-relaxed">{qd.escalationReason}</p>
                {qd.blockers && qd.blockers.length > 0 && (
                  <div>
                    <div className="text-xs text-amber-400 font-medium mb-2">当前障碍</div>
                    <div className="flex flex-wrap gap-2">
                      {qd.blockers.map((b, i) => (
                        <span key={i} className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full">{b}</span>
                      ))}
                    </div>
                  </div>
                )}
                {qd.requiredBeforeExpert && qd.requiredBeforeExpert.length > 0 && (
                  <div>
                    <div className="text-xs text-blue-400 font-medium mb-2">专家评审前需完成</div>
                    <div className="flex flex-wrap gap-2">
                      {qd.requiredBeforeExpert.map((r, i) => (
                        <span key={i} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full">{r}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 text-xs text-slate-600">
            <span className="flex items-center gap-1"><Icons.globe /> {report.country || '—'}</span>
            <span>·</span><span>{report.region || '—'}</span>
            <span>·</span><span>{report.city || '—'}</span>
            {report.visitor_id && <><span>·</span><span>ID: {report.visitor_id.slice(0, 8)}...</span></>}
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-white/8 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm rounded-xl transition">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

function VisitorDetailModal({ visitor, onClose }: { visitor: Visitor; onClose: () => void }) {
  const markets = visitor.selected_markets || [];
  const country = visitor.country || '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-[#0f1929] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 flex items-center justify-center">
              <span className="text-base font-bold text-blue-300">{(visitor.contact_name || visitor.email || 'V')[0].toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{visitor.contact_name || '匿名访客'}</h2>
              <p className="text-xs text-slate-500">{visitor.company_name || '—'} · {fmt(visitor.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs bg-white/5 border border-white/10 text-slate-400 px-2.5 py-1 rounded-lg">
              访问 {visitor.visit_count || 1} 次
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition p-1 rounded-lg hover:bg-white/5">
              <Icons.x />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '邮箱', value: visitor.email || '—' },
              { label: '电话', value: visitor.contact_phone || visitor.phone || '—' },
              { label: '公司', value: visitor.company_name || '—' },
              { label: '来源', value: visitor.source || 'website' },
              { label: '国家/地区', value: country },
              { label: '首次访问', value: fmt(visitor.created_at) },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{item.label}</div>
                <div className="text-sm text-white truncate">{item.value}</div>
              </div>
            ))}
          </div>

          {markets.length > 0 && (
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-medium">目标市场</div>
              <div className="flex flex-wrap gap-2">
                {markets.map((m: string, i: number) => (
                  <span key={i} className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full">{m}</span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-medium">访问轨迹</div>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>首次访问</span>
                <span className="text-slate-300">{fmt(visitor.first_visit || visitor.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>最后访问</span>
                <span className="text-slate-300">{fmt(visitor.last_visit || visitor.updated_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>总访问次数</span>
                <span className="text-slate-300">{visitor.visit_count || 1} 次</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/8 shrink-0 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm rounded-xl transition">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Data Tables ─────────────────────────────────────────────────────────────

function SubmissionRow({ sub, email, password, onUpdate, onClick }: {
  sub: Submission; email: string; password: string;
  onUpdate: () => void; onClick: () => void;
}) {
  const [updating, setUpdating] = useState(false);
  const meta = STATUS_META[sub.status] || STATUS_META.new;

  const quickUpdate = async (status: string) => {
    setUpdating(true);
    await fetch(`/api/admin/submissions?id=${sub.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${encodeAuth(email, password)}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setUpdating(false);
    onUpdate();
  };

  return (
    <tr className="group hover:bg-white/[0.02] transition cursor-pointer" onClick={onClick}>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700/60 to-slate-800/40 border border-white/8 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-slate-300">{(sub.name || 'A')[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">{sub.name || '匿名'}</div>
            <div className="text-xs text-slate-500 truncate">{sub.company || ''}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 hidden xl:table-cell">
        <div className="text-xs text-slate-300 truncate max-w-[150px]">{sub.email || '—'}</div>
        <div className="text-xs text-slate-600">{sub.phone || ''}</div>
      </td>
      <td className="px-4 py-3.5">
        <select
          value={sub.status}
          disabled={updating}
          onChange={e => { e.stopPropagation(); quickUpdate(e.target.value); }}
          onClick={e => e.stopPropagation()}
          className={`appearance-none text-xs font-medium pl-3 pr-7 py-1.5 rounded-lg cursor-pointer focus:outline-none ${meta.bg} ${meta.color}`}
        >
          {Object.entries(STATUS_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <div className="text-xs text-slate-400 max-w-[130px] truncate">
          {stageLabel(sub.product_stage || '')} {sub.target_markets ? `· ${sub.target_markets}` : ''}
        </div>
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell max-w-[180px]">
        <div className="text-xs text-slate-400 truncate">{sub.message || '—'}</div>
      </td>
      <td className="px-4 py-3.5">
        <div className="text-xs text-slate-500">{fmtRelative(sub.created_at)}</div>
      </td>
      <td className="px-4 py-3.5">
        <button onClick={onClick} className="opacity-0 group-hover:opacity-100 text-xs text-emerald-400 hover:text-emerald-300 transition whitespace-nowrap flex items-center gap-0.5">
          查看 <Icons.chevronRight />
        </button>
      </td>
    </tr>
  );
}

function ReportRow({ report, onClick }: {
  report: DiagnosisReport; onClick: () => void;
}) {
  const qd = report.qualification_decision;

  return (
    <tr className="group hover:bg-white/[0.02] transition cursor-pointer" onClick={onClick}>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-blue-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L2 5v6l6 3 6-3V5L8 2z" stroke="#34d399" strokeWidth="1.2"/>
              <path d="M8 2v11M2 5l6 3 6-3" stroke="#34d399" strokeWidth="1.2"/>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {report.market_name || report.market_name_en || report.market_id}
            </div>
            <div className="text-xs text-slate-500">{report.category}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <div className="text-xs text-slate-300">
          {report.diagnosis_input ? stageLabel(report.diagnosis_input.projectStage) : '—'}
        </div>
      </td>
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <div className="text-xs text-slate-300">
          {report.diagnosis_input ? budgetLabel(report.diagnosis_input.budget) : '—'}
        </div>
      </td>
      <td className="px-4 py-3.5">
        <TierBadge tier={qd?.leadTier || 'L1'} />
      </td>
      <td className="px-4 py-3.5">
        <DecisionBadge decision={qd?.reviewFit || 'self_serve'} />
      </td>
      <td className="px-4 py-3.5 hidden lg:table-cell max-w-[200px]">
        <div className="text-xs text-slate-400 truncate">
          {qd?.escalationReason || report.diagnosis_report?.summary || '—'}
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="text-xs text-slate-500">{fmtRelative(report.created_at)}</div>
      </td>
      <td className="px-4 py-3.5">
        <button onClick={onClick} className="opacity-0 group-hover:opacity-100 text-xs text-emerald-400 hover:text-emerald-300 transition flex items-center gap-0.5">
          查看 <Icons.chevronRight />
        </button>
      </td>
    </tr>
  );
}

function VisitorRow({ visitor, onClick }: { visitor: Visitor; onClick: () => void }) {
  return (
    <tr className="group hover:bg-white/[0.02] transition cursor-pointer" onClick={onClick}>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-blue-300">{(visitor.contact_name || visitor.email || 'V')[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">{visitor.contact_name || visitor.email || '匿名访客'}</div>
            <div className="text-xs text-slate-500 truncate">{visitor.company_name || ''}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 hidden xl:table-cell">
        <div className="text-xs text-slate-300 truncate max-w-[160px]">{visitor.email || '—'}</div>
        <div className="text-xs text-slate-600">{visitor.phone || ''}</div>
      </td>
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {(visitor.selected_markets || []).slice(0, 3).map((m, i) => (
            <span key={i} className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">{m}</span>
          ))}
          {(visitor.selected_markets || []).length > 3 && (
            <span className="text-[10px] text-slate-500">+{visitor.selected_markets.length - 3}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Icons.globe />
          {visitor.country || '—'}
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="text-xs text-slate-500">{fmtRelative(visitor.created_at)}</div>
      </td>
      <td className="px-4 py-3.5">
        <button onClick={onClick} className="opacity-0 group-hover:opacity-100 text-xs text-emerald-400 hover:text-emerald-300 transition flex items-center gap-0.5">
          查看 <Icons.chevronRight />
        </button>
      </td>
    </tr>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [auth, setAuth] = useState<{ email: string; password: string } | null>(
    () => {
      const s = localStorage.getItem(AUTH_KEY);
      if (!s) return null;
      try {
        const [email, password] = atob(s).split(':');
        return { email, password };
      } catch { return null; }
    }
  );

  const handleLogin = (email: string, password: string) => setAuth({ email, password });
  const handleLogout = () => { localStorage.removeItem(AUTH_KEY); setAuth(null); };

  if (!auth) return <LoginScreen onLogin={handleLogin} />;
  return <Dashboard email={auth.email} password={auth.password} onLogout={handleLogout} />;
}

function Dashboard({ email, password, onLogout }: { email: string; password: string; onLogout: () => void }) {
  const [tab, setTab] = useState<'overview' | 'submissions' | 'diagnoses' | 'visitors'>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Analytics
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Submissions
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subPage, setSubPage] = useState(1);
  const [subTotal, setSubTotal] = useState(0);
  const [subLoading, setSubLoading] = useState(false);
  const [subFilter, setSubFilter] = useState('');
  const [subSearch, setSubSearch] = useState('');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  // Diagnosis Reports
  const [reports, setReports] = useState<DiagnosisReport[]>([]);
  const [repPage, setRepPage] = useState(1);
  const [repTotal, setRepTotal] = useState(0);
  const [repLoading, setRepLoading] = useState(false);
  const [repFilter, setRepFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState<DiagnosisReport | null>(null);

  // Visitors
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [visPage, setVisPage] = useState(1);
  const [visTotal, setVisTotal] = useState(0);
  const [visLoading, setVisLoading] = useState(false);
  const [visSearch, setVisSearch] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  const LIMIT = 15;

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    const data = await apiFetch('/api/admin/analytics', email, password) as AnalyticsData;
    setAnalytics(data);
    setAnalyticsLoading(false);
  }, [email, password]);

  const loadSubmissions = useCallback(async (page = 1, status = '', search = '') => {
    setSubLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    const data = await apiFetch(`/api/admin/submissions?${params}`, email, password) as any;
    setSubmissions(data.data || []);
    setSubTotal(data.total || 0);
    setSubPage(page);
    setSubLoading(false);
  }, [email, password]);

  const loadReports = useCallback(async (page = 1, reviewFit = '') => {
    setRepLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (reviewFit) params.set('review_fit', reviewFit);
    const data = await apiFetch(`/api/admin/reports?${params}`, email, password) as any;
    setReports(data.data || []);
    setRepTotal(data.total || 0);
    setRepPage(page);
    setRepLoading(false);
  }, [email, password]);

  const loadVisitors = useCallback(async (page = 1, search = '') => {
    setVisLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (search) params.set('search', search);
    const data = await apiFetch(`/api/admin/visitors?${params}`, email, password) as any;
    setVisitors(data.data || []);
    setVisTotal(data.total || 0);
    setVisPage(page);
    setVisLoading(false);
  }, [email, password]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);
  useEffect(() => { if (tab === 'submissions') loadSubmissions(1, subFilter, subSearch); }, [tab]);
  useEffect(() => { if (tab === 'diagnoses') loadReports(1, repFilter); }, [tab]);
  useEffect(() => { if (tab === 'visitors') loadVisitors(1, visSearch); }, [tab]);

  const handleTab = (t: typeof tab) => {
    setTab(t);
    if (t === 'submissions') loadSubmissions(1, subFilter, subSearch);
    if (t === 'diagnoses') loadReports(1, repFilter);
    if (t === 'visitors') loadVisitors(1, visSearch);
  };

  const totalPages = (total: number) => Math.ceil(total / LIMIT);
  const subBadge = subTotal > 0 ? subTotal : null;
  const visBadge = visTotal > 0 ? visTotal : null;

  const TABS = [
    { key: 'overview',    label: '总览',      icon: Icons.grid,    badge: null },
    { key: 'submissions', label: '专家申请',  icon: Icons.file,    badge: subBadge },
    { key: 'diagnoses',   label: 'AI 诊断',   icon: Icons.diamond, badge: null },
    { key: 'visitors',    label: '访客列表',  icon: Icons.users,   badge: visBadge },
  ] as const;

  const visitorTrend = (analytics?.trend ?? []).map(t => t.visitors);
  const submissionTrend = (analytics?.trend ?? []).map(t => t.submissions);
  const statusBreakdown = analytics?.statusBreakdown || {};
  const totalStatus = Object.values(statusBreakdown).reduce((s, v) => s + (v as number), 0);

  const sourceColors = ['#60a5fa', '#34d399', '#f59e0b', '#a78bfa', '#f472b6', '#22d3ee'];
  const sourceData = (analytics?.topSources || []).map((s, i) => ({
    label: s.source || '直接访问',
    value: s.count,
    color: sourceColors[i % sourceColors.length],
  }));

  return (
    <div className="min-h-screen bg-[#090e1a] text-white flex">
      {/* ── Sidebar ── */}
      <aside className={`flex flex-col shrink-0 border-r border-white/[0.07] bg-[#0b1422] min-h-screen sticky top-0 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
        {/* Logo */}
        <div className={`flex items-center border-b border-white/[0.07] ${sidebarCollapsed ? 'justify-center px-0 py-5' : 'px-5 py-5 gap-3'}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L2 6v6l7 4 7-4V6L9 2z" stroke="#34d399" strokeWidth="1.2"/>
                  <path d="M9 2v12M2 6l7 4 7-4" stroke="#34d399" strokeWidth="1.2"/>
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">岐黄四海</div>
                <div className="text-[10px] text-slate-500">Management Console</div>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L2 6v6l7 4 7-4V6L9 2z" stroke="#34d399" strokeWidth="1.2"/>
                <path d="M9 2v12M2 6l7 4 7-4" stroke="#34d399" strokeWidth="1.2"/>
              </svg>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => handleTab(t.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                tab === t.key
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
              title={sidebarCollapsed ? t.label : undefined}
            >
              <span className="shrink-0">{t.icon()}</span>
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">{t.label}</span>
                  {t.badge !== null && t.badge > 0 && (
                    <span className="ml-auto text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full">
                      {t.badge > 99 ? '99+' : t.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/[0.07] space-y-0.5">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/[0.04] transition ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
            title={sidebarCollapsed ? '退出登录' : undefined}
          >
            <Icons.logout />
            {!sidebarCollapsed && <span>退出登录</span>}
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:text-slate-400 hover:bg-white/[0.04] transition ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}>
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!sidebarCollapsed && <span>收起</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#090e1a]/90 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-base font-semibold text-white">
                {TABS.find(t => t.key === tab)?.label || '总览'}
              </h1>
              {!analyticsLoading && analytics && !analytics.isRealData && (
                <span className="text-[11px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                  演示模式
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={loadAnalytics} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-400 transition px-3 py-1.5 rounded-lg hover:bg-white/[0.04]">
                <Icons.refresh />
                <span className="hidden sm:block">刷新</span>
              </button>
              <div className="text-xs text-slate-600">{email}</div>
            </div>
          </div>
        </header>

        <div className="p-6 flex-1">
          {/* ════════════════════════════════════════ OVERVIEW ══ */}
          {tab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* KPI Row */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <KpiCard
                  label="今日访客" value={analyticsLoading ? 0 : analytics?.today?.visitors ?? 0}
                  accent="text-emerald-400" icon={<Icons.eye />}
                  trend={visitorTrend.length > 1 ? visitorTrend.slice(-14) : undefined}
                />
                <KpiCard
                  label="今日申请" value={analyticsLoading ? 0 : analytics?.today?.submissions ?? 0}
                  accent="text-blue-400" icon={<Icons.file />}
                  trend={submissionTrend.length > 1 ? submissionTrend.slice(-14) : undefined}
                />
                <KpiCard
                  label="总访客数" value={analyticsLoading ? 0 : analytics?.total?.visitors ?? 0}
                  accent="text-white" icon={<Icons.users />}
                />
                <KpiCard
label="总申请数" value={analyticsLoading ? 0 : analytics?.total?.submissions ?? 0}
                    sub={`转化率 ${analyticsLoading ? '—' : (analytics?.total?.conversionRate ?? '0')}%`}
                  accent="text-amber-400" icon={<Icons.chart />}
                />
              </div>

              {/* Middle Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Trend */}
                <div className="lg:col-span-2 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-medium">近30天趋势</div>
                    <button onClick={loadAnalytics} className="text-xs text-slate-600 hover:text-emerald-400 transition flex items-center gap-1">
                      <Icons.refresh /> 刷新
                    </button>
                  </div>
                  {analyticsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-44 w-full" />
                    </div>
                  ) : (
                    <TrendChart data={analytics?.trend || []} />
                  )}
                </div>

                {/* Funnel */}
                <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent p-5">
                  <div className="text-xs text-slate-500 uppercase tracking-widest mb-4 font-medium">线索漏斗</div>
                  {analyticsLoading ? (
                    <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
                  ) : totalStatus > 0 ? (
                    <FunnelChart total={totalStatus} breakdown={statusBreakdown} />
                  ) : (
                    <div className="text-slate-600 text-xs text-center py-8">暂无数据</div>
                  )}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Countries */}
                <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent p-5">
                  <div className="text-xs text-slate-500 uppercase tracking-widest mb-4 font-medium">访客来源 TOP</div>
                  <div className="space-y-3">
                    {analyticsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)
                    ) : (analytics?.topCountries || []).length > 0 ? (
                      (analytics?.topCountries || []).slice(0, 8).map((c, i) => {
                        const maxV = Math.max(...(analytics?.topCountries || []).map(t => t.visitors), 1);
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-600 w-4 text-right">{i + 1}</span>
                            <span className="text-xs text-slate-300 flex-1 truncate flex items-center gap-1.5">
                              <Icons.globe /> {c.country || '未知'}
                            </span>
                            <div className="w-24 bg-white/5 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500/60 to-emerald-400/40 transition-all"
                                style={{ width: `${Math.min((c.visitors / maxV) * 100, 100)}%` }} />
                            </div>
                            <span className="text-xs text-slate-500 w-8 text-right">{c.visitors}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-slate-600 text-xs text-center py-6">暂无数据</div>
                    )}
                  </div>
                </div>

                {/* Sources Donut */}
                <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent p-5">
                  <div className="text-xs text-slate-500 uppercase tracking-widest mb-4 font-medium">流量来源</div>
                  {analyticsLoading ? (
                    <div className="flex gap-6 items-center">
                      <Skeleton className="w-28 h-28 rounded-full" />
                      <div className="flex-1 space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
                      </div>
                    </div>
                  ) : (
                    <DonutChart data={sourceData} />
                  )}
                </div>
              </div>

              {/* Top Markets */}
              {(analytics?.topMarkets || []).length > 0 && (
                <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent p-5">
                  <div className="text-xs text-slate-500 uppercase tracking-widest mb-4 font-medium">热门目标市场</div>
                  <div className="flex flex-wrap gap-2">
                    {(analytics?.topMarkets || []).map((m, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/8 px-3 py-2 hover:bg-white/[0.07] transition">
                        <span className="text-[10px] text-slate-600 font-medium">#{i + 1}</span>
                        <span className="text-sm text-white">{m.market_name || m.market_id}</span>
                        <span className="text-xs text-emerald-400">{m.count}次</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-medium">最近诊断</div>
                  <button onClick={() => handleTab('diagnoses')} className="text-xs text-emerald-400 hover:text-emerald-300 transition flex items-center gap-0.5">
                    查看全部 <Icons.chevronRight />
                  </button>
                </div>
                <div className="space-y-2">
                  {analyticsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
                  ) : (analytics?.recentReports || []).length === 0 ? (
                    <div className="text-center text-slate-600 text-xs py-8">暂无数据</div>
                  ) : (
                    (analytics?.recentReports || []).map((r: DiagnosisReport) => {
                      const qd = r.qualification_decision;
                      return (
                        <div key={r.id}
                          className="flex items-center gap-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/8 px-4 py-3 transition cursor-pointer"
                          onClick={() => { setSelectedReport(r); setTab('diagnoses'); }}>
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-blue-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M7 1L1 4v6l6 3 6-3V4L7 1z" stroke="#34d399" strokeWidth="1.1"/>
                              <path d="M7 1v12M1 4l6 3 6-3" stroke="#34d399" strokeWidth="1.1"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white truncate">
                                {r.market_name || r.market_name_en || r.market_id} · {r.category}
                              </span>
                              <TierBadge tier={qd?.leadTier || 'L1'} />
                            </div>
                            <div className="text-xs text-slate-500 truncate">{qd?.escalationReason || r.diagnosis_report?.summary}</div>
                          </div>
                          <div className="text-xs text-slate-500 shrink-0">{fmtRelative(r.created_at)}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════ SUBMISSIONS ══ */}
          {tab === 'submissions' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icons.search /></span>
                  <input
                    value={subSearch}
                    onChange={e => { setSubSearch(e.target.value); setSubPage(1); }}
                    onKeyDown={e => { if (e.key === 'Enter') loadSubmissions(1, subFilter, subSearch); }}
                    placeholder="搜索姓名、公司、邮箱..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0f1929] border border-white/8 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/30 transition"
                  />
                </div>
                <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/8">
                  {['', 'new', 'contacted', 'qualified', 'closed'].map(s => (
                    <button key={s} onClick={() => { setSubFilter(s); setSubPage(1); loadSubmissions(1, s, subSearch); }}
                      className={`px-3 py-1.5 text-xs rounded-lg transition ${subFilter === s ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
                      {s === '' ? '全部' : STATUS_META[s]?.label || s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 text-left text-[10px] text-slate-600 uppercase tracking-widest font-medium">
                      <th className="px-4 py-3">申请人</th>
                      <th className="px-4 py-3 hidden xl:table-cell">联系方式</th>
                      <th className="px-4 py-3">状态</th>
                      <th className="px-4 py-3 hidden lg:table-cell">项目信息</th>
                      <th className="px-4 py-3 hidden md:table-cell">留言</th>
                      <th className="px-4 py-3">时间</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan={7} className="px-4 py-6"><Skeleton className="h-8 w-full" /></td></tr>
                      ))
                    ) : submissions.length === 0 ? (
                      <tr><td colSpan={7} className="text-center text-slate-600 py-16 text-xs">暂无数据</td></tr>
                    ) : (
                      submissions.map(s => (
                        <SubmissionRow key={s.id} sub={s} email={email} password={password}
                          onUpdate={() => loadSubmissions(subPage, subFilter, subSearch)}
                          onClick={() => setSelectedSub(s)} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {subTotal > LIMIT && (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">共 {subTotal} 条</div>
                  <div className="flex items-center gap-2">
                    <button disabled={subPage <= 1} onClick={() => loadSubmissions(subPage - 1, subFilter, subSearch)}
                      className="px-4 py-2 text-xs bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-slate-300 transition">
                      ← 上一页
                    </button>
                    <span className="text-xs text-slate-500">{subPage} / {totalPages(subTotal)}</span>
                    <button disabled={subPage >= totalPages(subTotal)} onClick={() => loadSubmissions(subPage + 1, subFilter, subSearch)}
                      className="px-4 py-2 text-xs bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-slate-300 transition">
                      下一页 →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════ DIAGNOSES ══ */}
          {tab === 'diagnoses' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/8">
                  {['', 'self_serve', 'prepare_then_apply', 'expert_review'].map(s => (
                    <button key={s} onClick={() => { setRepFilter(s); setRepPage(1); loadReports(1, s); }}
                      className={`px-3 py-1.5 text-xs rounded-lg transition ${repFilter === s ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
                      {s === '' ? '全部' : DECISION_META[s]?.label || s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 text-left text-[10px] text-slate-600 uppercase tracking-widest font-medium">
                      <th className="px-4 py-3">市场 / 类别</th>
                      <th className="px-4 py-3 hidden sm:table-cell">阶段</th>
                      <th className="px-4 py-3 hidden sm:table-cell">预算</th>
                      <th className="px-4 py-3">线索等级</th>
                      <th className="px-4 py-3">资格</th>
                      <th className="px-4 py-3 hidden lg:table-cell">评估摘要</th>
                      <th className="px-4 py-3">时间</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {repLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan={8} className="px-4 py-6"><Skeleton className="h-8 w-full" /></td></tr>
                      ))
                    ) : reports.length === 0 ? (
                      <tr><td colSpan={8} className="text-center text-slate-600 py-16 text-xs">暂无诊断数据</td></tr>
                    ) : (
                      reports.map(r => (
                        <ReportRow key={r.id} report={r} onClick={() => setSelectedReport(r)} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {repTotal > LIMIT && (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">共 {repTotal} 条</div>
                  <div className="flex items-center gap-2">
                    <button disabled={repPage <= 1} onClick={() => loadReports(repPage - 1, repFilter)}
                      className="px-4 py-2 text-xs bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-slate-300 transition">
                      ← 上一页
                    </button>
                    <span className="text-xs text-slate-500">{repPage} / {totalPages(repTotal)}</span>
                    <button disabled={repPage >= totalPages(repTotal)} onClick={() => loadReports(repPage + 1, repFilter)}
                      className="px-4 py-2 text-xs bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-slate-300 transition">
                      下一页 →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════ VISITORS ══ */}
          {tab === 'visitors' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icons.search /></span>
                  <input
                    value={visSearch}
                    onChange={e => { setVisSearch(e.target.value); setVisPage(1); }}
                    onKeyDown={e => { if (e.key === 'Enter') loadVisitors(1, visSearch); }}
                    placeholder="搜索联系人、公司..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#0f1929] border border-white/8 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/30 transition"
                  />
                </div>
                <button onClick={() => loadVisitors(1, visSearch)}
                  className="px-3 py-2 text-xs bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition flex items-center gap-1.5">
                  <Icons.refresh /> 刷新
                </button>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 text-left text-[10px] text-slate-600 uppercase tracking-widest font-medium">
                      <th className="px-4 py-3">访客</th>
                      <th className="px-4 py-3 hidden xl:table-cell">联系方式</th>
                      <th className="px-4 py-3 hidden lg:table-cell">目标市场</th>
                      <th className="px-4 py-3 hidden md:table-cell">来源</th>
                      <th className="px-4 py-3">访问时间</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {visLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan={6} className="px-4 py-6"><Skeleton className="h-8 w-full" /></td></tr>
                      ))
                    ) : visitors.length === 0 ? (
                      <tr><td colSpan={6} className="text-center text-slate-600 py-16 text-xs">暂无访客数据</td></tr>
                    ) : (
                      visitors.map(v => (
                        <VisitorRow key={v.id} visitor={v} onClick={() => setSelectedVisitor(v)} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {visTotal > LIMIT && (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">共 {visTotal} 条</div>
                  <div className="flex items-center gap-2">
                    <button disabled={visPage <= 1} onClick={() => loadVisitors(visPage - 1, visSearch)}
                      className="px-4 py-2 text-xs bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-slate-300 transition">
                      ← 上一页
                    </button>
                    <span className="text-xs text-slate-500">{visPage} / {totalPages(visTotal)}</span>
                    <button disabled={visPage >= totalPages(visTotal)} onClick={() => loadVisitors(visPage + 1, visSearch)}
                      className="px-4 py-2 text-xs bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-slate-300 transition">
                      下一页 →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedSub && (
        <SubmissionDetailModal
          sub={selectedSub} email={email} password={password}
          onClose={() => setSelectedSub(null)}
          onUpdate={() => loadSubmissions(subPage, subFilter, subSearch)} />
      )}
      {selectedReport && (
        <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
      {selectedVisitor && (
        <VisitorDetailModal visitor={selectedVisitor} onClose={() => setSelectedVisitor(null)} />
      )}
    </div>
  );
}
