/**
 * 当前管理员信息 API
 *
 * GET  /api/admin/me      - 返回当前 email / role / 2FA / 最后登录 / 累计登录次数
 * PATCH /api/admin/me     - 更新可编辑字段 (name)
 *
 * 数据来源:
 * - email / role: KV session token (verifySession 返回)
 * - 2FA 状态 / name: KV `admin:<email>`
 * - 累计登录次数 / 最后登录: 扫 KV `audit:login:<email>:*` 的 success 事件
 */

import { verifySession, authResponse, corsPreflight } from './auth';

interface Env {
  ADMIN_KV?: KVNamespace;
}

interface AdminRecord {
  email: string;
  name?: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  twoFactorEnabled?: boolean;
  createdAt?: number;
}

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();

  let admin: AdminRecord | null = null;
  if (env.ADMIN_KV) {
    const raw = await env.ADMIN_KV.get(`admin:${session.email}`);
    if (raw) {
      try { admin = JSON.parse(raw); } catch { /* ignore */ }
    }
  }

  // 累计登录次数 + 最后登录:扫 audit:login: 前缀
  let loginCount = 0;
  let lastLoginAt: string | null = null;
  if (env.ADMIN_KV) {
    try {
      const list = await env.ADMIN_KV.list({ prefix: `audit:login:${session.email}:`, limit: 500 });
      const timestamps: number[] = [];
      for (const k of list.keys) {
        const v = await env.ADMIN_KV.get(k.name);
        if (!v) continue;
        try {
          const e = JSON.parse(v);
          if (e.success === true && typeof e.timestamp === 'number') {
            timestamps.push(e.timestamp);
          }
        } catch { /* ignore */ }
      }
      timestamps.sort((a, b) => b - a);
      loginCount = timestamps.length;
      if (timestamps[0]) lastLoginAt = new Date(timestamps[0]).toISOString();
    } catch (e) {
      console.warn('[me] audit list failed:', (e as Error).message);
    }
  }

  return json({
    success: true,
    admin: {
      email: session.email,
      name: admin?.name || deriveName(session.email),
      role: admin?.role || session.role,
      twoFactorEnabled: !!admin?.twoFactorEnabled,
      createdAt: admin?.createdAt ? new Date(admin.createdAt).toISOString() : '-',
      lastLoginAt,
      loginCount,
    },
  });
}

export async function onRequestPatch(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();
  if (!env.ADMIN_KV) return json({ error: 'ADMIN_KV not configured' }, 503);

  try {
    const body = await request.json().catch(() => ({})) as { name?: string };
    const name = (body.name || '').trim();
    if (name && name.length > 64) return json({ error: 'name 太长' }, 400);

    const key = `admin:${session.email}`;
    const raw = await env.ADMIN_KV.get(key);
    const admin: AdminRecord = raw ? JSON.parse(raw) : { email: session.email, role: session.role };
    if (name) admin.name = name;
    if (!admin.createdAt) admin.createdAt = Date.now();
    await env.ADMIN_KV.put(key, JSON.stringify(admin));

    return json({ success: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}

function deriveName(email: string): string {
  const local = (email.split('@')[0] || '管理员').trim();
  return local.length <= 16 ? local : local.slice(0, 16);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
