/**
 * 管理后台 API - 报告交互分析
 *
 * GET /api/admin/report-interactions                  - 默认返回按报告聚合
 *   ?days=30                                         - 时间窗（默认 30）
 *   ?report_id=xxx                                   - 单报告详细 (含阅读会话列表)
 *
 * 认证：Bearer qhs_<session_token>（与现有 admin 一致）
 */

import { verifySession, corsPreflight, getDB } from './auth';

interface Env {
  DB?: D1Database;
  zxqconsulting_comments?: D1Database;
  ADMIN_KV?: KVNamespace;
}

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://www.zxqconsulting.com' } });

const err = (msg: string, status = 500) =>
  new Response(JSON.stringify({ error: msg }), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://www.zxqconsulting.com' } });

async function ensureTable(DB: D1Database): Promise<void> {
  await DB.prepare(
    `CREATE TABLE IF NOT EXISTS report_interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id TEXT NOT NULL,
      session_id TEXT,
      visitor_id TEXT,
      ip TEXT,
      event_type TEXT NOT NULL,
      action TEXT NOT NULL,
      duration_seconds INTEGER,
      max_scroll INTEGER,
      country TEXT,
      region TEXT,
      city TEXT,
      ua TEXT,
      referrer TEXT,
      created_at INTEGER NOT NULL
    )`
  ).run();
  await DB.batch([
    DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ri_report ON report_interactions(report_id, event_type)`),
    DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ri_created ON report_interactions(created_at)`),
    DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ri_ip ON report_interactions(report_id, ip, event_type)`),
  ]);
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://www.zxqconsulting.com' } });
  }
  if (!getDB(env)) return err('Database not configured', 503);
  const db = getDB(env)!;
  await ensureTable(db);

  const url = new URL(request.url);
  const days = Math.max(1, Math.min(parseInt(url.searchParams.get('days') || '30') || 30, 365));
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const reportId = (url.searchParams.get('report_id') || '').trim();

  // 单报告明细
  if (reportId) {
    const summary = await db.prepare(
      `SELECT
         SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) as views,
         COUNT(DISTINCT CASE WHEN event_type = 'view' THEN ip END) as unique_visitors,
         SUM(CASE WHEN event_type = 'share' THEN 1 ELSE 0 END) as shares,
         (SELECT COUNT(DISTINCT ip) FROM report_interactions r2 WHERE r2.report_id = r.report_id AND r2.event_type = 'like') as likes_proxy
       FROM report_interactions r
       WHERE report_id = ? AND created_at >= ?`
    ).bind(reportId, since).first() as Record<string, number> | null;

    // likes 实际计算：按 IP 末次状态
    const likeRows = await db.prepare(
      `SELECT ip, event_type, id FROM report_interactions WHERE report_id = ? AND event_type IN ('like','unlike') AND created_at >= ? ORDER BY id DESC`
    ).bind(reportId, since).all();
    const ipLastLike = new Map<string, string>();
    for (const r of (likeRows.results || []) as Array<{ ip: string; event_type: string }>) {
      if (!ipLastLike.has(r.ip)) ipLastLike.set(r.ip, r.event_type);
    }
    let likes = 0;
    for (const v of ipLastLike.values()) if (v === 'like') likes++;

    const readStats = await db.prepare(
      `SELECT
         COUNT(*) as sessions,
         COALESCE(AVG(duration_seconds), 0) as avg_duration,
         COALESCE(MAX(duration_seconds), 0) as max_duration,
         COALESCE(AVG(max_scroll), 0) as avg_scroll
       FROM report_interactions WHERE report_id = ? AND event_type = 'read' AND created_at >= ?`
    ).bind(reportId, since).first() as Record<string, number> | null;

    const sessions = await db.prepare(
      `SELECT id, session_id, ip, country, region, city, duration_seconds, max_scroll, created_at FROM report_interactions WHERE report_id = ? AND event_type = 'read' AND created_at >= ? ORDER BY duration_seconds DESC LIMIT 100`
    ).bind(reportId, since).all();

    const recentEvents = await db.prepare(
      `SELECT id, event_type, action, ip, country, duration_seconds, max_scroll, created_at FROM report_interactions WHERE report_id = ? AND created_at >= ? ORDER BY id DESC LIMIT 200`
    ).bind(reportId, since).all();

    const topCountries = await db.prepare(
      `SELECT country, COUNT(DISTINCT ip) as visitors FROM report_interactions WHERE report_id = ? AND country <> '' AND created_at >= ? GROUP BY country ORDER BY visitors DESC LIMIT 10`
    ).bind(reportId, since).all();

    return ok({
      success: true,
      report_id: reportId,
      days,
      summary: {
        likes,
        shares: summary?.shares || 0,
        views: summary?.views || 0,
        unique_visitors: summary?.unique_visitors || 0,
        read_sessions: readStats?.sessions || 0,
        avg_read_seconds: Math.round(readStats?.avg_duration || 0),
        max_read_seconds: readStats?.max_duration || 0,
        avg_scroll: Math.round((readStats?.avg_scroll as number) || 0),
      },
      sessions: sessions.results || [],
      recent_events: recentEvents.results || [],
      top_countries: topCountries.results || [],
    });
  }

  // 聚合：按 report_id
  const events = await db.prepare(
    `SELECT report_id, event_type, ip, duration_seconds, max_scroll, created_at
     FROM report_interactions WHERE created_at >= ?`
  ).bind(since).all();

  const agg = new Map<string, { likes: number; shares: number; views: number; uniqueVisitors: Set<string>; reads: number; totalRead: number; maxRead: number; scrolls: number[] }>();

  const ipLikeState = new Map<string, Map<string, string>>(); // reportId -> (ip -> last event)

  for (const e of (events.results || []) as Array<{ report_id: string; event_type: string; ip: string; duration_seconds: number; max_scroll: number; created_at: number }>) {
    if (!agg.has(e.report_id)) {
      agg.set(e.report_id, { likes: 0, shares: 0, views: 0, uniqueVisitors: new Set(), reads: 0, totalRead: 0, maxRead: 0, scrolls: [] });
    }
    const a = agg.get(e.report_id)!;
    if (e.ip) a.uniqueVisitors.add(e.ip);
    if (e.event_type === 'view') a.views++;
    else if (e.event_type === 'share') a.shares++;
    else if (e.event_type === 'read') {
      a.reads++;
      a.totalRead += e.duration_seconds || 0;
      if ((e.duration_seconds || 0) > a.maxRead) a.maxRead = e.duration_seconds || 0;
      if (typeof e.max_scroll === 'number' && e.max_scroll > 0) a.scrolls.push(e.max_scroll);
    } else if (e.event_type === 'like' || e.event_type === 'unlike') {
      if (!ipLikeState.has(e.report_id)) ipLikeState.set(e.report_id, new Map());
      const ipMap = ipLikeState.get(e.report_id)!;
      // 注意：events 已 ORDER BY id DESC，但这里未排序；我们用 updated map（最新 set 生效）
      if (!ipMap.has(e.ip)) ipMap.set(e.ip, e.event_type);
    }
  }

  // 重跑 like 计算：按 created_at desc 取每 IP 最新状态
  const allLikeEvents = await db.prepare(
    `SELECT report_id, ip, event_type, created_at FROM report_interactions WHERE event_type IN ('like','unlike') AND created_at >= ? ORDER BY id DESC`
  ).bind(since).all();
  for (const e of (allLikeEvents.results || []) as Array<{ report_id: string; ip: string; event_type: string }>) {
    if (!ipLikeState.has(e.report_id)) ipLikeState.set(e.report_id, new Map());
    const ipMap = ipLikeState.get(e.report_id)!;
    if (!ipMap.has(e.ip)) ipMap.set(e.ip, e.event_type);
  }
  for (const [reportId, ipMap] of ipLikeState) {
    let n = 0;
    for (const v of ipMap.values()) if (v === 'like') n++;
    if (agg.has(reportId)) agg.get(reportId)!.likes = n;
  }

  const items = Array.from(agg.entries()).map(([reportId, a]) => ({
    report_id: reportId,
    likes: a.likes,
    shares: a.shares,
    views: a.views,
    unique_visitors: a.uniqueVisitors.size,
    read_sessions: a.reads,
    avg_read_seconds: a.reads ? Math.round(a.totalRead / a.reads) : 0,
    max_read_seconds: a.maxRead,
    avg_scroll: a.scrolls.length ? Math.round(a.scrolls.reduce((s, n) => s + n, 0) / a.scrolls.length) : 0,
  })).sort((x, y) => (y.likes + y.shares + y.views) - (x.likes + x.shares + x.views));

  // 总独立访客：全局去重（同一个 IP 读了多份报告只算一次）
  const globalUnique = new Set<string>();
  for (const a of agg.values()) {
    for (const ip of a.uniqueVisitors) globalUnique.add(ip);
  }

  const totals = items.reduce((acc, it) => ({
    likes: acc.likes + it.likes,
    shares: acc.shares + it.shares,
    views: acc.views + it.views,
    read_sessions: acc.read_sessions + it.read_sessions,
    unique_visitors: globalUnique.size,
  }), { likes: 0, shares: 0, views: 0, read_sessions: 0, unique_visitors: 0 });

  return ok({
    success: true,
    days,
    since,
    totals,
    items,
  });
}

export async function onRequestOptions() {
  return corsPreflight();
}