/**
 * 任务中心 API — 从真实数据派生任务
 *
 * GET  /api/admin/tasks                       - 返回派生任务
 * PATCH /api/admin/tasks                      - body { id, status } 把任务推进/标记完成
 *
 * 派生规则:
 * - new 状态线索           → "跟进 X 客户首次沟通"（pending / high）
 * - contacted 状态线索      → "回访 X 已联系线索"（pending / medium）
 * - diagnosis_reports 近 3 天 → "审核 X 报告分级"（pending / medium）
 * - client_intake 状态 new   → "审阅 X 客户采集表"（pending / high）
 * - comments.status='pending' → "审核 X 评论"（pending / low）
 *
 * 任务状态用 KV `task:<email>:<source_id>` 记录，前端 PATCH 时变更
 */

import { verifySession, authResponse, corsPreflight, getDB } from './auth';

interface Env {
  DB?: D1Database;
  zxqconsulting_comments?: D1Database;
  ADMIN_KV?: KVNamespace;
}

type TaskStatus = 'pending' | 'in_progress' | 'completed';
type Priority = 'high' | 'medium' | 'low';

interface TaskItem {
  id: string;
  title: string;
  source: '线索管理' | 'AI 诊断' | '客户采集' | '网站评论' | '报告留言';
  source_href: string;
  source_id: string;
  priority: Priority;
  status: TaskStatus;
  created_at: string;
  due_date: string | null;
  assignee: string;
}

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();

  const DB = getDB(env);
  if (!DB) {
    return json({ success: true, tasks: [], counts: emptyCounts() });
  }

  try {
    const tasks: TaskItem[] = [];

    // 读取该 email 的任务状态覆盖（KV）
    const overrides = await readTaskOverrides(env, session.email);

    // ── 1. new 状态线索 ──
    try {
      const subs = await DB.prepare(`
        SELECT id, name, company, created_at FROM submissions
        WHERE website_id = ? AND status = 'new'
        ORDER BY created_at DESC LIMIT 10
      `).bind('zxqconsulting').all() as {
        results: Array<{ id: string; name: string; company: string | null; created_at: string }>;
      };
      for (const s of subs.results || []) {
        const id = `lead:${s.id}`;
        tasks.push({
          id,
          title: `跟进 ${s.name || s.company || '匿名'} 客户首次沟通`,
          source: '线索管理',
          source_href: '/admin/submissions',
          source_id: s.id,
          priority: 'high',
          status: overrides[id]?.status || 'pending',
          created_at: String(s.created_at),
          due_date: dueDateFromNow(2),
          assignee: session.email,
        });
      }
    } catch (e) { console.warn('[tasks] submissions:', (e as Error).message); }

    // ── 2. contacted 状态线索 ──
    try {
      const subs = await DB.prepare(`
        SELECT id, name, company, updated_at FROM submissions
        WHERE website_id = ? AND status = 'contacted'
        ORDER BY updated_at DESC LIMIT 10
      `).bind('zxqconsulting').all() as {
        results: Array<{ id: string; name: string; company: string | null; updated_at: string | null }>;
      };
      for (const s of subs.results || []) {
        const id = `contact:${s.id}`;
        tasks.push({
          id,
          title: `回访 ${s.name || s.company || '匿名'} 已联系线索`,
          source: '线索管理',
          source_href: '/admin/submissions',
          source_id: s.id,
          priority: 'medium',
          status: overrides[id]?.status || 'pending',
          created_at: String(s.updated_at || ''),
          due_date: dueDateFromNow(5),
          assignee: session.email,
        });
      }
    } catch (e) { console.warn('[tasks] contacted:', (e as Error).message); }

    // ── 3. 新诊断报告 ──
    try {
      const reports = await DB.prepare(`
        SELECT id, market_name, market_id, created_at FROM diagnosis_reports
        WHERE website_id = ? AND created_at >= ?
        ORDER BY created_at DESC LIMIT 10
      `).bind('zxqconsulting', new Date(Date.now() - 7 * 86_400_000).toISOString()).all() as {
        results: Array<{ id: string; market_name: string | null; market_id: string; created_at: string }>;
      };
      for (const r of reports.results || []) {
        const id = `report:${r.id}`;
        tasks.push({
          id,
          title: `审核 ${r.market_name || r.market_id || '未命名'} AI 诊断分级`,
          source: 'AI 诊断',
          source_href: '/admin/diagnoses',
          source_id: r.id,
          priority: 'medium',
          status: overrides[id]?.status || 'pending',
          created_at: String(r.created_at),
          due_date: dueDateFromNow(3),
          assignee: session.email,
        });
      }
    } catch (e) { console.warn('[tasks] reports:', (e as Error).message); }

    // ── 4. 新客户采集 ──
    try {
      const intake = await DB.prepare(`
        SELECT id, company_name, contact_name, created_at FROM client_intake
        WHERE status = 'new'
        ORDER BY created_at DESC LIMIT 10
      `).all() as {
        results: Array<{ id: number; company_name: string | null; contact_name: string | null; created_at: string }>;
      };
      for (const c of intake.results || []) {
        const id = `intake:${c.id}`;
        tasks.push({
          id,
          title: `审阅 ${c.company_name || c.contact_name || '新企业'} 客户采集表`,
          source: '客户采集',
          source_href: '/admin/client-intake',
          source_id: String(c.id),
          priority: 'high',
          status: overrides[id]?.status || 'pending',
          created_at: String(c.created_at),
          due_date: dueDateFromNow(2),
          assignee: session.email,
        });
      }
    } catch (e) { console.warn('[tasks] intake:', (e as Error).message); }

    // ── 5. 待审评论 ──
    try {
      const comments = await DB.prepare(`
        SELECT id, user_name, timestamp FROM comments
        WHERE status = 'pending'
        ORDER BY timestamp DESC LIMIT 10
      `).all() as { results: Array<{ id: string; user_name: string; timestamp: string }> };
      for (const c of comments.results || []) {
        const id = `comment:${c.id}`;
        tasks.push({
          id,
          title: `审核 ${c.user_name || '匿名'} 的网站评论`,
          source: '网站评论',
          source_href: '/admin/comments',
          source_id: c.id,
          priority: 'low',
          status: overrides[id]?.status || 'pending',
          created_at: String(c.timestamp),
          due_date: dueDateFromNow(1),
          assignee: session.email,
        });
      }
    } catch (e) { console.warn('[tasks] comments:', (e as Error).message); }

    // 按优先级 + 创建时间排序
    const priorityWeight: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    tasks.sort((a, b) => {
      const pa = priorityWeight[a.priority];
      const pb = priorityWeight[b.priority];
      if (pa !== pb) return pa - pb;
      return (b.created_at || '').localeCompare(a.created_at || '');
    });

    const counts = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      urgent: tasks.filter((t) => t.priority === 'high' && t.status === 'pending').length,
    };

    return json({ success: true, tasks, counts });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}

export async function onRequestPatch(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();
  if (!env.ADMIN_KV) return json({ error: 'ADMIN_KV not configured' }, 503);

  try {
    const body = await request.json().catch(() => ({})) as { id?: string; status?: TaskStatus };
    if (!body.id || !body.status) return json({ error: 'id / status required' }, 400);
    if (!['pending', 'in_progress', 'completed'].includes(body.status)) {
      return json({ error: 'invalid status' }, 400);
    }

    const key = `task:${session.email}:${body.id}`;
    const record = { id: body.id, status: body.status, updated_at: Date.now() };
    await env.ADMIN_KV.put(key, JSON.stringify(record), { expirationTtl: 90 * 86_400 });

    return json({ success: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}

async function readTaskOverrides(
  env: Env,
  email: string
): Promise<Record<string, { status: TaskStatus; updated_at: number }>> {
  const out: Record<string, { status: TaskStatus; updated_at: number }> = {};
  if (!env.ADMIN_KV) return out;
  try {
    const list = await env.ADMIN_KV.list({ prefix: `task:${email}:`, limit: 500 });
    for (const k of list.keys) {
      const v = await env.ADMIN_KV.get(k.name);
      if (!v) continue;
      try {
        const r = JSON.parse(v);
        const id = k.name.split(':').slice(2).join(':');
        out[id] = { status: r.status, updated_at: r.updated_at || 0 };
      } catch { /* ignore */ }
    }
  } catch (e) {
    console.warn('[tasks] override list failed:', (e as Error).message);
  }
  return out;
}

function dueDateFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().split('T')[0];
}

function emptyCounts() {
  return { total: 0, pending: 0, in_progress: 0, completed: 0, urgent: 0 };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
