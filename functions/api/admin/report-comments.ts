/**
 * 报告留言管理 API（admin auth）
 * GET /api/admin/report-comments?days=30&report_id=xxx&q=keyword
 * DELETE /api/admin/report-comments?id=N
 * POST /api/admin/report-comments { id, action: 'restore'|'hide' }
 */

import { verifySession, corsPreflight } from './auth';

interface Env {
  DB: D1Database;
  zxqconsulting_comments?: D1Database;
  ADMIN_KV?: KVNamespace;
}

function getDB(env: Env): D1Database | null {
  return env.DB || env.zxqconsulting_comments || null;
}

const corsBase = { 'Access-Control-Allow-Origin': 'https://www.zxqconsulting.com' };
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...corsBase } });

async function ensureTable(DB: D1Database): Promise<void> {
  await DB.prepare(
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
  ).run();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return json({ error: 'Unauthorized' }, 401);
  const db = getDB(env);
  if (!db) return json({ error: 'Database not configured' }, 503);
  await ensureTable(db);

  const url = new URL(request.url);
  const days = Math.max(1, Math.min(parseInt(url.searchParams.get('days') || '30') || 30, 365));
  const reportId = (url.searchParams.get('report_id') || '').trim();
  const q = (url.searchParams.get('q') || '').trim();
  const since = Date.now() - days * 86_400_000;

  const conds: string[] = ['created_at >= ?'];
  const binds: Array<string | number> = [since];
  if (reportId) { conds.push('report_id = ?'); binds.push(reportId); }
  if (q) {
    conds.push('(nickname LIKE ? OR content LIKE ?)');
    binds.push(`%${q}%`, `%${q}%`);
  }
  const where = conds.join(' AND ');

  const rows = await db.prepare(
    `SELECT id, report_id, nickname, content, ip, ip_hash, country, region, city, ua, status, created_at
       FROM report_comments WHERE ${where} ORDER BY created_at DESC LIMIT 500`,
  ).bind(...binds).all();

  const stats = await db.prepare(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN status = 'visible' THEN 1 ELSE 0 END) as visible,
       SUM(CASE WHEN status = 'hidden' THEN 1 ELSE 0 END) as hidden,
       COUNT(DISTINCT report_id) as reports,
       COUNT(DISTINCT ip_hash) as unique_users
     FROM report_comments WHERE created_at >= ?`,
  ).bind(since).first();

  const topReports = await db.prepare(
    `SELECT report_id, COUNT(*) as cnt FROM report_comments
      WHERE created_at >= ? AND status = 'visible'
      GROUP BY report_id ORDER BY cnt DESC LIMIT 10`,
  ).bind(since).all();

  const daily = await db.prepare(
    `SELECT strftime('%Y-%m-%d', created_at/1000, 'unixepoch') as day, COUNT(*) as cnt
       FROM report_comments WHERE created_at >= ? AND status = 'visible'
       GROUP BY day ORDER BY day`,
  ).bind(since).all();

  return json({
    success: true,
    comments: (rows.results || []).map((r: Record<string, unknown>) => ({
      ...r,
      created_at: new Date(Number(r.created_at)).toISOString(),
    })),
    stats,
    top_reports: topReports.results || [],
    daily: daily.results || [],
    days,
  });
}

export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return json({ error: 'Unauthorized' }, 401);
  const db = getDB(env);
  if (!db) return json({ error: 'Database not configured' }, 503);
  await ensureTable(db);

  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id') || '0', 10);
  if (!id) return json({ error: 'id required' }, 400);

  await db.prepare(`UPDATE report_comments SET status = 'hidden' WHERE id = ?`).bind(id).run();
  return json({ success: true, id });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return json({ error: 'Unauthorized' }, 401);
  const db = getDB(env);
  if (!db) return json({ error: 'Database not configured' }, 503);
  await ensureTable(db);

  const body = await request.json().catch(() => ({})) as { id?: number; action?: string };
  if (!body.id) return json({ error: 'id required' }, 400);

  if (body.action === 'restore') {
    await db.prepare(`UPDATE report_comments SET status = 'visible' WHERE id = ?`).bind(body.id).run();
    return json({ success: true, id: body.id, restored: true });
  }
  await db.prepare(`UPDATE report_comments SET status = 'hidden' WHERE id = ?`).bind(body.id).run();
  return json({ success: true, id: body.id, hidden: true });
}

export async function onRequestOptions() {
  return corsPreflight();
}