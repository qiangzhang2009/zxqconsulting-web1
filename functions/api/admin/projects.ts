/**
 * 客户出海项目 API
 *
 * GET    /api/admin/projects
 * POST   /api/admin/projects       - 创建项目
 * PATCH  /api/admin/projects?id=   - 更新项目（含里程碑/文档/活动）
 * DELETE /api/admin/projects?id=   - 删除项目
 *
 * D1 表 projects: 项目档案（含 JSON 字段存 milestones / documents / activities）
 */

import { verifySession, authResponse, corsPreflight, getDB } from './auth';

interface Env {
  DB?: D1Database;
  zxqconsulting_comments?: D1Database;
  ADMIN_KV?: KVNamespace;
}

interface ProjectRow {
  id: string;
  code: string;
  name: string;
  client: string;
  industry: string;
  status: string;
  priority: string;
  target_markets: string;
  category: string;
  start_date: string;
  expected_launch_date: string | null;
  budget: string;
  advisor: string;
  source: string;
  tags: string;
  milestones: string;
  documents: string;
  activities: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();

  const DB = getDB(env);
  if (!DB) return json({ success: true, projects: [] });

  try {
    await ensureTable(DB);
    const rows = await DB.prepare(
      `SELECT * FROM projects ORDER BY updated_at DESC LIMIT 500`
    ).all() as { results: ProjectRow[] };

    const projects = (rows.results || []).map(rowToProject);
    return json({ success: true, projects });
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
      name?: string;
      client?: string;
      industry?: string;
      target_markets?: string[];
      budget?: string;
      advisor?: string;
      source?: string;
      category?: string;
      priority?: string;
      notes?: string;
    };

    if (!body.name || !body.client) {
      return json({ error: 'name / client 必填' }, 400);
    }

    const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const code = await generateCode(DB, body.industry || 'OTHER');
    const now = new Date().toISOString();

    await DB.prepare(`
      INSERT INTO projects
        (id, code, name, client, industry, status, priority,
         target_markets, category, start_date, expected_launch_date,
         budget, advisor, source, tags, milestones, documents, activities, notes,
         created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      code,
      body.name,
      body.client,
      body.industry || 'other',
      'exploring',
      body.priority || 'medium',
      JSON.stringify(body.target_markets || []),
      body.category || '',
      now.split('T')[0],
      null,
      body.budget || '',
      body.advisor || session.email,
      body.source || '后台创建',
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify([]),
      body.notes || null,
      now,
      now
    ).run();

    // 写一条 audit log
    await logAudit(DB, session.email, '新建项目', `${code} ${body.name}`, request).catch(() => {});

    return json({ success: true, id, code });
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
    const allowed: Record<string, string> = {
      name: 'name',
      client: 'client',
      industry: 'industry',
      status: 'status',
      priority: 'priority',
      category: 'category',
      budget: 'budget',
      advisor: 'advisor',
      source: 'source',
      expected_launch_date: 'expected_launch_date',
      notes: 'notes',
    };
    const jsonFields = new Set(['target_markets', 'tags', 'milestones', 'documents', 'activities']);

    const sets: string[] = [];
    const binds: (string | number)[] = [];
    for (const k of Object.keys(allowed)) {
      if (body[k] !== undefined) {
        sets.push(`${allowed[k]} = ?`);
        binds.push(String(body[k]));
      }
    }
    for (const k of jsonFields) {
      if (body[k] !== undefined) {
        sets.push(`${k} = ?`);
        binds.push(JSON.stringify(body[k]));
      }
    }
    if (sets.length === 0) return json({ success: true, message: 'no changes' });

    sets.push('updated_at = ?');
    binds.push(new Date().toISOString());
    binds.push(id);

    await DB.prepare(`UPDATE projects SET ${sets.join(', ')} WHERE id = ?`).bind(...binds).run();
    await logAudit(DB, session.email, '更新项目', id, request).catch(() => {});
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

    await DB.prepare(`DELETE FROM projects WHERE id = ?`).bind(id).run();
    await logAudit(DB, session.email, '删除项目', id, request).catch(() => {});
    return json({ success: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}

async function ensureTable(DB: D1Database): Promise<void> {
  await DB.prepare(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      client TEXT NOT NULL,
      industry TEXT,
      status TEXT DEFAULT 'exploring',
      priority TEXT DEFAULT 'medium',
      target_markets TEXT,
      category TEXT,
      start_date TEXT,
      expected_launch_date TEXT,
      budget TEXT,
      advisor TEXT,
      source TEXT,
      tags TEXT,
      milestones TEXT,
      documents TEXT,
      activities TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `).run();
  await DB.prepare(`CREATE INDEX IF NOT EXISTS idx_proj_updated ON projects(updated_at)`).run();
}

async function generateCode(DB: D1Database, industry: string): Promise<string> {
  const prefix: Record<string, string> = {
    tcm: 'TCM',
    supplement: 'SUP',
    cosmetic: 'SKN',
    medical: 'MED',
    other: 'PRJ',
  };
  const year = new Date().getFullYear();
  const head = prefix[industry] || 'PRJ';
  const cnt = await DB.prepare(
    `SELECT COUNT(*) as n FROM projects WHERE code LIKE ?`
  ).bind(`${head}-${year}-%`).first() as { n: number };
  const num = String((cnt?.n || 0) + 1).padStart(3, '0');
  return `${head}-${year}-${num}`;
}

function rowToProject(r: ProjectRow) {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    client: r.client,
    industry: r.industry || 'other',
    status: r.status,
    priority: r.priority,
    target_markets: safeJson(r.target_markets, []),
    category: r.category,
    start_date: r.start_date,
    expected_launch_date: r.expected_launch_date,
    budget: r.budget,
    advisor: r.advisor,
    source: r.source,
    tags: safeJson(r.tags, []),
    milestones: safeJson(r.milestones, []),
    documents: safeJson(r.documents, []),
    activities: safeJson(r.activities, []),
    notes: r.notes,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

function safeJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
