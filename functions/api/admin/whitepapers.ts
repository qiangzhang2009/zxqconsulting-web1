/**
 * 白皮书流水线 API
 *
 * GET    /api/admin/whitepapers                  - 列表
 * POST   /api/admin/whitepapers                  - 新建白皮书
 * PATCH  /api/admin/whitepapers?id=X             - 更新 (主要用于推进 stage)
 * DELETE /api/admin/whitepapers?id=X             - 删除
 *
 * D1 表 whitepapers
 */

import { verifySession, authResponse, corsPreflight, getDB } from './auth';

interface Env {
  DB?: D1Database;
  zxqconsulting_comments?: D1Database;
  ADMIN_KV?: KVNamespace;
}

interface WhitepaperRow {
  id: string;
  title: string;
  stage: string;
  author: string;
  updated_at: string;
  word_count: number;
  priority: string;
  description: string | null;
  tags: string;
  created_at: string;
}

const VALID_STAGES = ['draft', 'writing', 'review', 'published'] as const;
type Stage = typeof VALID_STAGES[number];

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();

  const DB = getDB(env);
  if (!DB) return json({ success: true, whitepapers: [] });

  try {
    await ensureTable(DB);
    const rows = await DB.prepare(
      `SELECT * FROM whitepapers ORDER BY updated_at DESC LIMIT 500`
    ).all() as { results: WhitepaperRow[] };

    const whitepapers = (rows.results || []).map((r) => ({
      id: r.id,
      title: r.title,
      stage: r.stage,
      author: r.author,
      updated_at: r.updated_at,
      word_count: r.word_count,
      priority: r.priority,
      description: r.description,
      tags: safeJson(r.tags, []),
      created_at: r.created_at,
    }));
    return json({ success: true, whitepapers });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();
  const DB = getDB(env);
  if (!DB) return json({ error: 'Database not configured' }, 503);

  try {
    await ensureTable(DB);
    const body = await request.json().catch(() => ({})) as {
      title?: string;
      author?: string;
      stage?: string;
      priority?: string;
      word_count?: number;
      description?: string;
      tags?: string[];
    };

    if (!body.title) return json({ error: 'title 必填' }, 400);
    const stage = VALID_STAGES.includes(body.stage as Stage) ? body.stage : 'draft';

    const id = `wp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    await DB.prepare(`
      INSERT INTO whitepapers
        (id, title, stage, author, updated_at, word_count, priority, description, tags, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.title,
      stage,
      body.author || session.email,
      now,
      body.word_count || 0,
      body.priority || 'medium',
      body.description || null,
      JSON.stringify(body.tags || []),
      now
    ).run();

    await logAudit(DB, session.email, '新建白皮书', `${body.title} (${stage})`, request).catch(() => {});
    return json({ success: true, id });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}

export async function onRequestPatch(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();
  const DB = getDB(env);
  if (!DB) return json({ error: 'Database not configured' }, 503);

  try {
    await ensureTable(DB);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'id required' }, 400);

    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const sets: string[] = [];
    const binds: (string | number)[] = [];
    const fields: Record<string, string> = {
      title: 'title',
      author: 'author',
      word_count: 'word_count',
      priority: 'priority',
      description: 'description',
    };
    for (const k of Object.keys(fields)) {
      if (body[k] !== undefined) {
        sets.push(`${fields[k]} = ?`);
        binds.push(String(body[k]));
      }
    }
    if (body.stage !== undefined) {
      if (!VALID_STAGES.includes(body.stage as Stage)) {
        return json({ error: `stage 必须是 ${VALID_STAGES.join(', ')}` }, 400);
      }
      sets.push('stage = ?');
      binds.push(String(body.stage));
    }
    if (body.tags !== undefined) {
      sets.push('tags = ?');
      binds.push(JSON.stringify(body.tags));
    }
    if (sets.length === 0) return json({ success: true, message: 'no changes' });

    sets.push('updated_at = ?');
    binds.push(new Date().toISOString());
    binds.push(id);

    await DB.prepare(`UPDATE whitepapers SET ${sets.join(', ')} WHERE id = ?`).bind(...binds).run();
    await logAudit(DB, session.email, '更新白皮书', id, request).catch(() => {});
    return json({ success: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}

export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();
  const DB = getDB(env);
  if (!DB) return json({ error: 'Database not configured' }, 503);

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'id required' }, 400);

    await DB.prepare(`DELETE FROM whitepapers WHERE id = ?`).bind(id).run();
    await logAudit(DB, session.email, '删除白皮书', id, request).catch(() => {});
    return json({ success: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}

async function ensureTable(DB: D1Database): Promise<void> {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS whitepapers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      stage TEXT NOT NULL DEFAULT 'draft',
      author TEXT,
      updated_at TEXT NOT NULL,
      word_count INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      description TEXT,
      tags TEXT,
      created_at TEXT NOT NULL
    )
  `).run();
  await DB.prepare(`CREATE INDEX IF NOT EXISTS idx_wp_updated ON whitepapers(updated_at)`).run();
  await DB.prepare(`CREATE INDEX IF NOT EXISTS idx_wp_stage ON whitepapers(stage)`).run();
}

async function logAudit(DB: D1Database, email: string, action: string, target: string, request: Request): Promise<void> {
  try {
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT,
        ip_address TEXT,
        status TEXT DEFAULT 'success',
        metadata TEXT,
        timestamp INTEGER NOT NULL
      )
    `).run();
    await DB.prepare(`
      INSERT INTO audit_log (email, action, target, ip_address, status, timestamp)
      VALUES (?, ?, ?, ?, 'success', ?)
    `).bind(email, action, target, request.headers.get('cf-connecting-ip') || '', Date.now()).run();
  } catch { /* ignore */ }
}

function safeJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
