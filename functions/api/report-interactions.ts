/**
 * 报告页交互事件 API
 *
 * 公开接口：
 *   POST /api/report-interactions  - 写入点赞/转发/阅读会话
 *   GET  /api/report-interactions?report_id=xxx - 读取聚合统计（公开，供前端展示点赞数/转发数）
 *
 * 管理接口（admin auth）：
 *   GET  /api/admin/report-interactions?report_id=xxx&days=30  - 详细数据
 *   GET  /api/admin/report-interactions/aggregate?days=30      - 按报告聚合
 *
 * 写入语义：
 *   - like:    按 (report_id, ip) 去重；同 IP 可切换 like/unlike
 *   - share:   累加计数（不幂等，每次点击 +1）
 *   - read:    会话级去重；同一会话最多记录一次（带 duration_seconds）
 *   - view:    页面 PV（每次进入页面 +1，用于计算独立读者数）
 *
 * 数据表 report_interactions 由 api 首次调用时自动 CREATE。
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
};

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

const err = (msg: string, status = 500) =>
  new Response(JSON.stringify({ error: msg }), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

interface Env {
  DB: D1Database;
  zxqconsulting_comments?: D1Database;
}

function getDB(env: Env): D1Database | null {
  return env.DB || env.zxqconsulting_comments || null;
}

function getClientIp(request: Request) {
  return request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '';
}

function getGeoFromCf(request: Request) {
  return {
    country: request.headers.get('cf-ipcountry') || '',
    region: request.headers.get('cf-region') || '',
    city: request.headers.get('cf-ipcity') || '',
  };
}

function ensureTable(DB: D1Database): Promise<void> {
  return DB.prepare(
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
  ).run().then(() => undefined);
}

function ensureIndexes(DB: D1Database): Promise<void> {
  return DB.batch([
    DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ri_report ON report_interactions(report_id, event_type)`),
    DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ri_created ON report_interactions(created_at)`),
    DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ri_ip ON report_interactions(report_id, ip, event_type)`),
  ]).then(() => undefined);
}

async function handlePost(request: Request, env: Env) {
  const db = getDB(env);
  if (!db) return err('Database not configured', 503);
  await ensureTable(db);
  await ensureIndexes(db);

  const body = await request.json() as {
    report_id?: string;
    event_type?: 'like' | 'unlike' | 'share' | 'read' | 'view';
    session_id?: string;
    visitor_id?: string;
    duration_seconds?: number;
    max_scroll?: number;
    referrer?: string;
  };

  const reportId = (body.report_id || '').trim().slice(0, 100);
  const eventType = body.event_type || '';
  if (!reportId) return err('report_id is required', 400);
  if (!['like', 'unlike', 'share', 'read', 'view'].includes(eventType)) {
    return err('event_type must be like|unlike|share|read|view', 400);
  }

  const ip = getClientIp(request);
  const geo = getGeoFromCf(request);
  const ua = (request.headers.get('user-agent') || '').slice(0, 400);
  const sessionId = (body.session_id || '').slice(0, 80) || `anon_${ip.replace(/[^a-z0-9]/gi, '').slice(-8) || Math.random().toString(36).slice(2, 10)}`;
  const visitorId = (body.visitor_id || '').slice(0, 80);
  const createdAt = Date.now();

  // like 行为：按 IP 去重
  if (eventType === 'like') {
    const existing = await db.prepare(
      `SELECT id, event_type FROM report_interactions WHERE report_id = ? AND ip = ? AND event_type IN ('like','unlike') ORDER BY id DESC LIMIT 1`
    ).bind(reportId, ip).first() as { id: number; event_type: string } | null;

    if (existing && existing.event_type === 'like') {
      return ok({ success: true, liked: true, likes: await getLikes(db, reportId), alreadyLiked: true });
    }

    await db.prepare(
      `INSERT INTO report_interactions (report_id, session_id, visitor_id, ip, event_type, action, country, region, city, ua, referrer, created_at)
       VALUES (?, ?, ?, ?, 'like', 'on', ?, ?, ?, ?, ?, ?)`
    ).bind(reportId, sessionId, visitorId, ip, geo.country, geo.region, geo.city, ua, (body.referrer || '').slice(0, 400), createdAt).run();

    return ok({ success: true, liked: true, likes: await getLikes(db, reportId) });
  }

  if (eventType === 'unlike') {
    await db.prepare(
      `INSERT INTO report_interactions (report_id, session_id, visitor_id, ip, event_type, action, country, region, city, ua, referrer, created_at)
       VALUES (?, ?, ?, ?, 'unlike', 'off', ?, ?, ?, ?, ?, ?)`
    ).bind(reportId, sessionId, visitorId, ip, geo.country, geo.region, geo.city, ua, (body.referrer || '').slice(0, 400), createdAt).run();

    return ok({ success: true, liked: false, likes: await getLikes(db, reportId) });
  }

  if (eventType === 'share') {
    const channel = (request.headers.get('referer') || '').slice(0, 400);
    await db.prepare(
      `INSERT INTO report_interactions (report_id, session_id, visitor_id, ip, event_type, action, country, region, city, ua, referrer, created_at)
       VALUES (?, ?, ?, ?, 'share', 'click', ?, ?, ?, ?, ?, ?)`
    ).bind(reportId, sessionId, visitorId, ip, geo.country, geo.region, geo.city, ua, channel, createdAt).run();

    return ok({ success: true, shares: await getShares(db, reportId) });
  }

  if (eventType === 'view') {
    await db.prepare(
      `INSERT INTO report_interactions (report_id, session_id, visitor_id, ip, event_type, action, country, region, city, ua, referrer, created_at)
       VALUES (?, ?, ?, ?, 'view', 'open', ?, ?, ?, ?, ?, ?)`
    ).bind(reportId, sessionId, visitorId, ip, geo.country, geo.region, geo.city, ua, (body.referrer || '').slice(0, 400), createdAt).run();

    return ok({ success: true, views: await getViews(db, reportId) });
  }

  // read: session-level upsert (按 session 记录一次最长阅读时长)
  if (eventType === 'read') {
    const duration = Math.max(0, Math.min(parseInt(String(body.duration_seconds || 0)) || 0, 86400));
    const scroll = Math.max(0, Math.min(parseInt(String(body.max_scroll || 0)) || 0, 100));

    const existing = await db.prepare(
      `SELECT id, duration_seconds, max_scroll FROM report_interactions WHERE report_id = ? AND session_id = ? AND event_type = 'read' LIMIT 1`
    ).bind(reportId, sessionId).first() as { id: number; duration_seconds: number; max_scroll: number } | null;

    if (existing) {
      const newDur = Math.max(existing.duration_seconds || 0, duration);
      const newScroll = Math.max(existing.max_scroll || 0, scroll);
      await db.prepare(`UPDATE report_interactions SET duration_seconds = ?, max_scroll = ? WHERE id = ?`).bind(newDur, newScroll, existing.id).run();
      return ok({ success: true, updated: true, duration_seconds: newDur, max_scroll: newScroll });
    }

    await db.prepare(
      `INSERT INTO report_interactions (report_id, session_id, visitor_id, ip, event_type, action, duration_seconds, max_scroll, country, region, city, ua, referrer, created_at)
       VALUES (?, ?, ?, ?, 'read', 'session', ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(reportId, sessionId, visitorId, ip, duration, scroll, geo.country, geo.region, geo.city, ua, (body.referrer || '').slice(0, 400), createdAt).run();

    return ok({ success: true, duration_seconds: duration, max_scroll: scroll });
  }

  return err('Unhandled event_type', 400);
}

async function getLikes(DB: D1Database, reportId: string): Promise<number> {
  // likes 数量 = like 数 - unlike 数（同 IP 最近一次为 unlike 则不算）
  // 这里用简化版：按 IP 计算最后状态
  const row = await DB.prepare(
    `SELECT ip, event_type, id FROM report_interactions WHERE report_id = ? AND event_type IN ('like','unlike') ORDER BY id DESC`
  ).bind(reportId).all();
  const ips = new Map<string, string>();
  for (const r of (row.results || []) as Array<{ ip: string; event_type: string }>) {
    if (!ips.has(r.ip)) ips.set(r.ip, r.event_type);
  }
  let count = 0;
  for (const v of ips.values()) if (v === 'like') count++;
  return count;
}

async function getShares(DB: D1Database, reportId: string): Promise<number> {
  const row = await DB.prepare(`SELECT COUNT(*) as c FROM report_interactions WHERE report_id = ? AND event_type = 'share'`).bind(reportId).first() as { c: number } | null;
  return row?.c || 0;
}

async function getViews(DB: D1Database, reportId: string): Promise<number> {
  const row = await DB.prepare(`SELECT COUNT(*) as c FROM report_interactions WHERE report_id = ? AND event_type = 'view'`).bind(reportId).first() as { c: number } | null;
  return row?.c || 0;
}

async function handleGet(request: Request, env: Env) {
  const db = getDB(env);
  if (!db) return ok({ success: true, likes: 0, shares: 0, views: 0, avg_read_seconds: 0 });
  await ensureTable(db);
  const url = new URL(request.url);
  const reportId = (url.searchParams.get('report_id') || '').trim();
  if (!reportId) return err('report_id is required', 400);

  const likes = await getLikes(db, reportId);
  const shares = await getShares(db, reportId);
  const views = await getViews(db, reportId);

  const durRow = await db.prepare(
    `SELECT COUNT(*) as cnt, COALESCE(AVG(duration_seconds), 0) as avg_dur, COALESCE(MAX(duration_seconds), 0) as max_dur FROM report_interactions WHERE report_id = ? AND event_type = 'read'`
  ).bind(reportId).first() as { cnt: number; avg_dur: number; max_dur: number } | null;

  const uniqueReadersRow = await db.prepare(
    `SELECT COUNT(DISTINCT session_id) as uniq FROM report_interactions WHERE report_id = ? AND event_type = 'read'`
  ).bind(reportId).first() as { uniq: number } | null;

  const uniqueVisitorsRow = await db.prepare(
    `SELECT COUNT(DISTINCT ip) as uniq FROM report_interactions WHERE report_id = ?`
  ).bind(reportId).first() as { uniq: number } | null;

  return ok({
    success: true,
    report_id: reportId,
    likes,
    shares,
    views,
    unique_readers: uniqueReadersRow?.uniq || 0,
    unique_visitors: uniqueVisitorsRow?.uniq || 0,
    avg_read_seconds: Math.round(durRow?.avg_dur || 0),
    max_read_seconds: durRow?.max_dur || 0,
    read_count: durRow?.cnt || 0,
  });
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method === 'POST') return handlePost(request, env);
  if (request.method === 'GET') return handleGet(request, env);
  return err('Method not allowed', 405);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}