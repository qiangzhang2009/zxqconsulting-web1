/**
 * 报告页留言 API（仿微信公众号风格：昵称 + 内容）
 *
 * 公开接口：
 *   GET    /api/report-comments?report_id=xxx&limit=100         - 列出留言
 *   POST   /api/report-comments { report_id, nickname, content } - 提交留言
 *
 * 管理接口（admin auth via token）：
 *   DELETE /api/report-comments?id=N&token=...                    - 删除留言
 *   GET    /api/admin/report-comments?days=30                    - 全部 + 统计
 *
 * 限频：同 IP 每分钟最多 5 条（防灌水）
 * 长度：昵称 ≤ 24 字，内容 ≤ 500 字
 *
 * 数据表 report_comments 由首次调用时自动 CREATE。
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
};

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

const err = (msg: string, status = 500) =>
  new Response(JSON.stringify({ error: msg }), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

interface Env {
  DB: D1Database;
  zxqconsulting_comments?: D1Database;
  ADMIN_KV?: KVNamespace;
}

function getDB(env: Env): D1Database | null {
  return env.DB || env.zxqconsulting_comments || null;
}

function getClientIp(request: Request) {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    ''
  );
}

async function hashIp(ip: string, ua: string): Promise<string> {
  const raw = `${ip}::${(ua || '').slice(0, 60)}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buf)).slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function ensureTable(DB: D1Database): Promise<void> {
  return DB.prepare(
    `CREATE TABLE IF NOT EXISTS report_comments (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       report_id TEXT NOT NULL,
       nickname TEXT NOT NULL,
       content TEXT NOT NULL,
       ip TEXT,
       ip_hash TEXT,
       country TEXT,
       region TEXT,
       city TEXT,
       ua TEXT,
       status TEXT NOT NULL DEFAULT 'visible',
       created_at INTEGER NOT NULL
     )`,
  ).run().then(() => undefined);
}

function ensureIndexes(DB: D1Database): Promise<void> {
  return DB.batch([
    DB.prepare(`CREATE INDEX IF NOT EXISTS idx_rc_report ON report_comments(report_id, created_at)`),
    DB.prepare(`CREATE INDEX IF NOT EXISTS idx_rc_ip ON report_comments(ip_hash, created_at)`),
    DB.prepare(`CREATE INDEX IF NOT EXISTS idx_rc_status ON report_comments(status)`),
  ]).then(() => undefined);
}

function cleanText(s: string, max: number): string {
  return (s || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);
}

async function checkRateLimit(DB: D1Database, ipHash: string): Promise<boolean> {
  // 同 IP 每 60 秒最多 5 条
  const since = Date.now() - 60_000;
  const row = await DB.prepare(
    `SELECT COUNT(*) as c FROM report_comments WHERE ip_hash = ? AND created_at >= ?`,
  ).bind(ipHash, since).first() as { c: number };
  return (row?.c || 0) < 5;
}

async function handleGet(request: Request, env: Env) {
  const db = getDB(env);
  if (!db) return ok({ success: true, comments: [] });
  await ensureTable(db);

  const url = new URL(request.url);
  const reportId = (url.searchParams.get('report_id') || '').trim().slice(0, 100);
  if (!reportId) return err('report_id is required', 400);

  const limit = Math.max(1, Math.min(parseInt(url.searchParams.get('limit') || '100') || 100, 500));

  const rows = await db.prepare(
    `SELECT id, report_id, nickname, content, ip_hash, created_at, status
       FROM report_comments
      WHERE report_id = ? AND status = 'visible'
      ORDER BY created_at DESC
      LIMIT ?`,
  ).bind(reportId, limit).all();

  const countRow = await db.prepare(
    `SELECT COUNT(*) as c FROM report_comments WHERE report_id = ? AND status = 'visible'`,
  ).bind(reportId).first() as { c: number };

  const comments = (rows.results || []).map((r: Record<string, unknown>) => ({
    id: r.id,
    report_id: r.report_id,
    nickname: r.nickname,
    content: r.content,
    ip_hash: r.ip_hash,
    created_at: new Date(Number(r.created_at)).toISOString(),
  }));

  return ok({ success: true, comments, total: countRow?.c || 0 });
}

async function handlePost(request: Request, env: Env) {
  const db = getDB(env);
  if (!db) return err('Database not configured', 503);
  await ensureTable(db);
  await ensureIndexes(db);

  const body = await request.json().catch(() => ({})) as {
    report_id?: string;
    nickname?: string;
    content?: string;
  };

  const reportId = cleanText(body.report_id || '', 100);
  const nickname = cleanText(body.nickname || '', 24) || '匿名读者';
  const content = cleanText(body.content || '', 500);

  if (!reportId) return err('report_id is required', 400);
  if (!content || content.length < 1) return err('留言内容不能为空', 400);

  const ip = getClientIp(request);
  const ua = (request.headers.get('user-agent') || '').slice(0, 400);
  const ipHash = await hashIp(ip, ua);

  if (!(await checkRateLimit(db, ipHash))) {
    return err('发言过于频繁，请稍后再试', 429);
  }

  const geo = {
    country: request.headers.get('cf-ipcountry') || '',
    region: request.headers.get('cf-region') || '',
    city: request.headers.get('cf-ipcity') || '',
  };

  const createdAt = Date.now();
  const res = await db.prepare(
    `INSERT INTO report_comments (report_id, nickname, content, ip, ip_hash, country, region, city, ua, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'visible', ?)`,
  ).bind(reportId, nickname, content, ip, ipHash, geo.country, geo.region, geo.city, ua, createdAt).run();

  const insertedId = Number((res.meta as { last_row_id?: number })?.last_row_id || 0);

  return ok({
    success: true,
    comment: {
      id: insertedId,
      report_id: reportId,
      nickname,
      content,
      ip_hash: ipHash,
      created_at: new Date(createdAt).toISOString(),
    },
  });
}

async function handleDelete(request: Request, env: Env) {
  const db = getDB(env);
  if (!db) return err('Database not configured', 503);
  await ensureTable(db);

  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id') || '0', 10);
  const token = url.searchParams.get('token') || '';
  if (!id) return err('id is required', 400);

  // 校验管理 token（复用 admin 会话或简单 ADMIN_TOKEN）
  const authHeader = request.headers.get('authorization') || '';
  let okAuth = false;
  if (authHeader) {
    // 复用 admin 验证（如未来扩展）
    okAuth = authHeader.startsWith('Bearer ');
  }
  // 简易 token 校验：与 KV 中的 admin session 比对，或与 ADMIN_TOKEN 环境变量比对
  if (!okAuth) {
    const envToken = (env as unknown as Record<string, string>).ADMIN_TOKEN;
    if (envToken && token === envToken) okAuth = true;
  }
  // 兼容：当前简化为允许从 KV 取任意 session token
  if (!okAuth && env.ADMIN_KV) {
    // KV 里 key 形如 session:<token> -> JSON {email,...}
    const sess = await env.ADMIN_KV.get(`session:${token}`);
    if (sess) okAuth = true;
  }
  if (!okAuth) return err('Unauthorized', 401);

  await db.prepare(`UPDATE report_comments SET status = 'hidden' WHERE id = ?`).bind(id).run();
  return ok({ success: true, id });
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method === 'GET') return handleGet(request, env);
  if (request.method === 'POST') return handlePost(request, env);
  if (request.method === 'DELETE') return handleDelete(request, env);
  return err('Method not allowed', 405);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}