/**
 * 操作审计日志 API
 *
 * GET /api/admin/audit-log?days=30&action=&limit=200
 *
 * 数据来源（按优先级合并）:
 * 1. KV `audit:login:<email>:<ts>` — 登录 / 登录失败 事件
 * 2. D1 `audit_log` 表 — 通用 admin 动作（由其它 API 调用时写入）
 * 3. D1 `submissions` / `comments` 表 — 状态变更可推导
 *
 * 返回字段保持与前端 AuditLogPage 期望一致:
 * { id, action, target, user_email, user_role, ip, status, timestamp, metadata }
 */

import { verifySession, authResponse, corsPreflight, getDB } from './auth';

interface Env {
  ADMIN_KV?: KVNamespace;
  DB?: D1Database;
  zxqconsulting_comments?: D1Database;
}

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();

  try {
    const url = new URL(request.url);
    const days = Math.max(1, Math.min(parseInt(url.searchParams.get('days') || '30') || 30, 365));
    const actionFilter = (url.searchParams.get('action') || '').trim();
    const limit = Math.max(1, Math.min(parseInt(url.searchParams.get('limit') || '200') || 200, 1000));
    const sinceMs = Date.now() - days * 86_400_000;
    const todayKey = new Date().toISOString().split('T')[0];

    const logs: Array<{
      id: string;
      action: string;
      target: string;
      user_email: string;
      user_role: string;
      ip: string;
      status: string;
      timestamp: string;
      metadata?: Record<string, unknown>;
    }> = [];

    // ── 1) 读取 KV 中的登录审计（按 LIST `audit:login:` 前缀） ──
    if (env.ADMIN_KV) {
      try {
        const list = await env.ADMIN_KV.list({ prefix: 'audit:login:', limit: 500 });
        for (const key of list.keys) {
          const value = await env.ADMIN_KV.get(key.name);
          if (!value) continue;
          let entry: { email?: string; ip?: string; role?: string; success?: boolean; timestamp?: number; totp?: boolean };
          try { entry = JSON.parse(value); } catch { continue; }
          if (!entry.timestamp || entry.timestamp < sinceMs) continue;

          // key 格式: audit:login:<email>:<ts>
          const parts = key.name.split(':');
          const actionLabel = entry.success === false ? '登录失败' : '登录';

          if (actionFilter && actionFilter !== actionLabel) continue;

          logs.push({
            id: key.name,
            action: actionLabel,
            target: entry.totp ? '使用 2FA 验证' : '-',
            user_email: entry.email || '-',
            user_role: entry.role || '管理员',
            ip: entry.ip || '-',
            status: entry.success === false ? 'failed' : 'success',
            timestamp: new Date(entry.timestamp).toISOString().replace('T', ' ').slice(0, 19),
            metadata: { totp: !!entry.totp },
          });
        }
      } catch (e) {
        console.warn('[audit-log] KV list failed:', (e as Error).message);
      }
    }

    // ── 2) 读取 D1 `audit_log` 表（如存在） ──
    const DB = getDB(env);
    if (DB) {
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
        await DB.prepare(`CREATE INDEX IF NOT EXISTS idx_al_email ON audit_log(email, timestamp)`).run();
        await DB.prepare(`CREATE INDEX IF NOT EXISTS idx_al_action ON audit_log(action, timestamp)`).run();

        const sinceIso = new Date(sinceMs).toISOString();
        const rows = await DB.prepare(
          `SELECT id, email, action, target, ip_address, status, metadata, timestamp
             FROM audit_log WHERE timestamp >= ? ORDER BY timestamp DESC LIMIT 500`
        ).bind(new Date(sinceMs).getTime()).all() as {
          results: Array<{
            id: number;
            email: string;
            action: string;
            target: string | null;
            ip_address: string | null;
            status: string | null;
            metadata: string | null;
            timestamp: number;
          }>;
        };

        for (const r of rows.results || []) {
          const actionLabel = r.action || '操作';
          if (actionFilter && actionFilter !== actionLabel) continue;

          let metadata: Record<string, unknown> = {};
          if (r.metadata) {
            try { metadata = JSON.parse(r.metadata); } catch { /* ignore */ }
          }

          logs.push({
            id: `db-${r.id}`,
            action: actionLabel,
            target: r.target || '-',
            user_email: r.email,
            user_role: (metadata as { role?: string }).role || '管理员',
            ip: r.ip_address || '-',
            status: r.status || 'success',
            timestamp: new Date(r.timestamp).toISOString().replace('T', ' ').slice(0, 19),
            metadata,
          });
        }
      } catch (e) {
        console.warn('[audit-log] D1 query failed:', (e as Error).message);
      }

      // ── 3) 推导 submissions 状态变更 ──
      try {
        const subs = await DB.prepare(
          `SELECT id, name, status, updated_at, assigned_to FROM submissions
             WHERE updated_at IS NOT NULL AND updated_at >= ?
             ORDER BY updated_at DESC LIMIT 200`
        ).bind(new Date(sinceMs).toISOString()).all() as {
          results: Array<{ id: string; name: string; status: string; updated_at: string; assigned_to: string | null }>;
        };

        for (const s of subs.results || []) {
          const actionLabel = '修改状态';
          if (actionFilter && actionFilter !== actionLabel) continue;

          logs.push({
            id: `sub-${s.id}`,
            action: actionLabel,
            target: `${s.name || '线索'} (${s.id}) → ${s.status}${s.assigned_to ? ` · 分配给 ${s.assigned_to}` : ''}`,
            user_email: session.email,
            user_role: session.role,
            ip: '-',
            status: 'success',
            timestamp: String(s.updated_at).replace('T', ' ').slice(0, 19),
            metadata: { kind: 'submission', submission_id: s.id, status: s.status },
          });
        }
      } catch (e) {
        console.warn('[audit-log] submissions derive failed:', (e as Error).message);
      }

      // ── 4) 推导 comments 状态变更 ──
      try {
        const comments = await DB.prepare(
          `SELECT id, user_name, status FROM comments WHERE status != 'pending' LIMIT 200`
        ).all() as { results: Array<{ id: string; user_name: string; status: string }> };

        for (const c of comments.results || []) {
          const actionLabel = '审核评论';
          if (actionFilter && actionFilter !== actionLabel) continue;

          logs.push({
            id: `cmt-${c.id}`,
            action: actionLabel,
            target: `评论 #${c.id} (${c.user_name || ''}) → ${c.status}`,
            user_email: session.email,
            user_role: session.role,
            ip: '-',
            status: 'success',
            timestamp: '-',
            metadata: { kind: 'comment', comment_id: c.id },
          });
        }
      } catch (e) {
        console.warn('[audit-log] comments derive failed:', (e as Error).message);
      }
    }

    // ── 排序 + 截断 ──
    logs.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    const sliced = logs.slice(0, limit);

    const stats = {
      total: logs.length,
      today: logs.filter((l) => l.timestamp.startsWith(todayKey)).length,
      success: logs.filter((l) => l.status === 'success').length,
      failed: logs.filter((l) => l.status === 'failed').length,
      logins: logs.filter((l) => l.action === '登录' || l.action === '登录失败').length,
      dataChanges: logs.filter((l) => l.action !== '登录' && l.action !== '登录失败').length,
    };

    return jsonResponse({ success: true, days, logs: sliced, stats });
  } catch (err) {
    console.error('[audit-log] error:', err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
}

/**
 * POST /api/admin/audit-log
 * 写入一条审计日志（其它 admin API 调用即可记录动作）
 * body: { action, target?, status?, metadata? }
 */
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();
  const DB = getDB(env);
  if (!DB) return jsonResponse({ error: 'Database not configured' }, 503);

  try {
    const body = await request.json().catch(() => ({})) as {
      action?: string;
      target?: string;
      status?: string;
      metadata?: Record<string, unknown>;
    };
    if (!body.action) return jsonResponse({ error: 'action required' }, 400);

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

    const ip = request.headers.get('cf-connecting-ip') || '';
    await DB.prepare(`
      INSERT INTO audit_log (email, action, target, ip_address, status, metadata, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      session.email,
      body.action,
      body.target || null,
      ip,
      body.status || 'success',
      body.metadata ? JSON.stringify(body.metadata) : null,
      Date.now()
    ).run();

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
}

export async function onRequestOptionsPost() {
  return corsPreflight();
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
