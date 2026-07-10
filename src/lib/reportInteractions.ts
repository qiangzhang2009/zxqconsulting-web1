/**
 * 报告页交互 Hook
 *
 * - 点赞 / 转发：调用 POST /api/report-interactions
 * - 阅读时长：visibilitychange + 定期心跳调用 'read' 事件（session 级别去重）
 * - 页面访问：进入时调用 'view' 事件
 */

const SESSION_KEY = 'qhs_report_session';
const VISITOR_KEY = 'qhs_report_visitor';

function getOrCreateSession() {
  if (typeof window === 'undefined') return '';
  let s = sessionStorage.getItem(SESSION_KEY);
  if (!s) {
    s = `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

function getOrCreateVisitor() {
  if (typeof window === 'undefined') return '';
  let v = localStorage.getItem(VISITOR_KEY);
  if (!v) {
    v = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(VISITOR_KEY, v);
  }
  return v;
}

async function postEvent(payload: Record<string, unknown>) {
  try {
    const res = await fetch('/api/report-interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    if (!res.ok) return null;
    return await res.json() as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function fetchStats(reportId: string) {
  try {
    const res = await fetch(`/api/report-interactions?report_id=${encodeURIComponent(reportId)}`, { cache: 'no-cache' });
    if (!res.ok) return null;
    return await res.json() as {
      likes: number;
      shares: number;
      views: number;
      unique_readers: number;
      unique_visitors: number;
      avg_read_seconds: number;
      max_read_seconds: number;
      read_count: number;
    };
  } catch {
    return null;
  }
}

export type ReportStats = Awaited<ReturnType<typeof fetchStats>>;

export function createReportTracker(reportId: string) {
  const sessionId = getOrCreateSession();
  const visitorId = getOrCreateVisitor();
  let startedAt = Date.now();
  let activeMs = 0;
  let lastActiveAt: number | null = null;
  let maxScroll = 0;
  let flushed = false;

  // 进入即记录 view
  postEvent({
    report_id: reportId,
    event_type: 'view',
    session_id: sessionId,
    visitor_id: visitorId,
    referrer: document.referrer || '',
  });

  function markActive() {
    if (lastActiveAt === null) lastActiveAt = Date.now();
  }

  function markInactive() {
    if (lastActiveAt !== null) {
      activeMs += Date.now() - lastActiveAt;
      lastActiveAt = null;
    }
  }

  function trackScroll() {
    try {
      const win = document.querySelector('iframe')?.contentWindow;
      if (!win) return;
      const h = Math.max(win.document.documentElement.scrollHeight, 1);
      const top = win.scrollY || 0;
      const pct = Math.min(100, Math.round((top / h) * 100));
      if (pct > maxScroll) maxScroll = pct;
    } catch {
      // 跨域 ignore
    }
  }

  function flushRead(reason: string) {
    if (flushed) return;
    markInactive();
    const dur = Math.round((activeMs + (lastActiveAt ? Date.now() - lastActiveAt : 0)) / 1000);
    if (dur < 1 && reason === 'interval') return;
    postEvent({
      report_id: reportId,
      event_type: 'read',
      session_id: sessionId,
      visitor_id: visitorId,
      duration_seconds: dur,
      max_scroll: maxScroll,
    });
  }

  // 定时心跳：每 20s 推送一次 read
  const interval = window.setInterval(() => {
    trackScroll();
    flushRead('interval');
  }, 20000);

  // 监听可见性
  const onVis = () => {
    if (document.hidden) markInactive();
    else markActive();
  };
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('blur', onVis);
  window.addEventListener('focus', onVis);
  window.addEventListener('scroll', trackScroll, { passive: true });

  // 离开前最后一次推送
  const onHide = () => {
    trackScroll();
    flushRead('hide');
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) onHide(); });
  window.addEventListener('pagehide', onHide);
  window.addEventListener('beforeunload', onHide);

  markActive();

  return {
    like: () => postEvent({
      report_id: reportId,
      event_type: 'like',
      session_id: sessionId,
      visitor_id: visitorId,
    }),
    unlike: () => postEvent({
      report_id: reportId,
      event_type: 'unlike',
      session_id: sessionId,
      visitor_id: visitorId,
    }),
    share: () => postEvent({
      report_id: reportId,
      event_type: 'share',
      session_id: sessionId,
      visitor_id: visitorId,
    }),
    flush: () => { flushRead('manual'); },
    destroy: () => {
      flushRead('destroy');
      flushed = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onVis);
      window.removeEventListener('focus', onVis);
      window.removeEventListener('scroll', trackScroll);
      window.removeEventListener('pagehide', onHide);
      window.removeEventListener('beforeunload', onHide);
    },
  };
}

export const reportInteractions = {
  fetchStats,
  createReportTracker,
  fetchComments,
  postComment,
  deleteComment,
};

export type ReportComment = {
  id: number;
  report_id: string;
  nickname: string;
  content: string;
  created_at: string;
  ip_hash: string;
};

async function fetchComments(reportId: string, limit = 100) {
  try {
    const res = await fetch(
      `/api/report-comments?report_id=${encodeURIComponent(reportId)}&limit=${limit}`,
      { cache: 'no-cache' },
    );
    if (!res.ok) return [];
    const data = await res.json() as { comments: ReportComment[] };
    return Array.isArray(data.comments) ? data.comments : [];
  } catch {
    return [];
  }
}

async function postComment(reportId: string, nickname: string, content: string) {
  try {
    const res = await fetch('/api/report-comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_id: reportId,
        nickname,
        content,
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return { ok: false as const, error: txt || `HTTP ${res.status}` };
    }
    const data = await res.json() as { comment: ReportComment };
    return { ok: true as const, comment: data.comment };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
}

async function deleteComment(commentId: number, token: string) {
  try {
    const res = await fetch(
      `/api/report-comments?id=${encodeURIComponent(String(commentId))}&token=${encodeURIComponent(token)}`,
      { method: 'DELETE' },
    );
    return res.ok;
  } catch {
    return false;
  }
}