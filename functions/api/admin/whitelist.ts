/**
 * IP 白名单管理 API
 *
 * GET    /api/admin/whitelist            - 列出当前 admin 的 IP 白名单
 * POST   /api/admin/whitelist            - 新增条目 { pattern, label, note? }
 * DELETE /api/admin/whitelist?id=X       - 删除条目
 *
 * 数据来源: KV `admin:<email>` 记录中的 ipWhitelist 字段（由 auth.ts 读取校验）
 */

import { verifySession, authResponse, corsPreflight } from './auth';

interface Env {
  ADMIN_KV?: KVNamespace;
}

interface WhitelistEntry {
  id: string;
  pattern: string;
  label: string;
  note: string;
  added_at: string;
}

interface AdminRecord {
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  twoFactorEnabled?: boolean;
  ipWhitelist?: string[];
  ipWhitelistMeta?: WhitelistEntry[];
}

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();
  if (!env.ADMIN_KV) return json({ error: 'ADMIN_KV not configured' }, 503);

  const admin = await readAdmin(env, session.email);
  if (!admin) return json({ success: true, whitelist: [] });

  const meta = admin.ipWhitelistMeta || [];
  const patterns = admin.ipWhitelist || [];
  // 合并：meta 优先（带 label / note），对只存 pattern 没 meta 的补默认
  const merged: WhitelistEntry[] = patterns.map((p) => {
    const m = meta.find((x) => x.pattern === p);
    return m || {
      id: hashPattern(p),
      pattern: p,
      label: p,
      note: '',
      added_at: '-',
    };
  });

  return json({ success: true, whitelist: merged });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();
  if (session.role !== 'super_admin' && session.role !== 'admin') {
    return json({ error: '仅管理员可修改白名单' }, 403);
  }
  if (!env.ADMIN_KV) return json({ error: 'ADMIN_KV not configured' }, 503);

  try {
    const body = await request.json().catch(() => ({})) as {
      pattern?: string;
      label?: string;
      note?: string;
    };
    const pattern = (body.pattern || '').trim();
    if (!pattern) return json({ error: 'pattern 必填' }, 400);
    if (!isValidPattern(pattern)) {
      return json({ error: '格式无效，支持 CIDR (192.168.0.0/24) 或通配 (10.0.*.*)' }, 400);
    }

    const admin = (await readAdmin(env, session.email)) || {
      email: session.email,
      role: session.role,
    };

    const patterns = Array.from(new Set([...(admin.ipWhitelist || []), pattern]));
    const meta = [
      ...(admin.ipWhitelistMeta || []).filter((m) => m.pattern !== pattern),
      {
        id: hashPattern(pattern),
        pattern,
        label: (body.label || pattern).trim(),
        note: (body.note || '').trim(),
        added_at: new Date().toISOString(),
      },
    ];

    await writeAdmin(env, session.email, {
      ...admin,
      ipWhitelist: patterns,
      ipWhitelistMeta: meta,
    });

    return json({ success: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}

export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();
  if (session.role !== 'super_admin' && session.role !== 'admin') {
    return json({ error: '仅管理员可修改白名单' }, 403);
  }
  if (!env.ADMIN_KV) return json({ error: 'ADMIN_KV not configured' }, 503);

  try {
    const url = new URL(request.url);
    const id = (url.searchParams.get('id') || '').trim();
    const patternParam = (url.searchParams.get('pattern') || '').trim();
    if (!id && !patternParam) return json({ error: 'id 或 pattern 必填' }, 400);

    const admin = await readAdmin(env, session.email);
    if (!admin) return json({ success: true });

    const meta = (admin.ipWhitelistMeta || []).filter((m) => {
      if (id && patternParam) return !(m.id === id && m.pattern === patternParam);
      if (id) return m.id !== id;
      return m.pattern !== patternParam;
    });
    const patterns = (admin.ipWhitelist || []).filter((p) =>
      meta.some((m) => m.pattern === p)
    );

    await writeAdmin(env, session.email, {
      ...admin,
      ipWhitelist: patterns,
      ipWhitelistMeta: meta,
    });

    return json({ success: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}

async function readAdmin(env: Env, email: string): Promise<AdminRecord | null> {
  if (!env.ADMIN_KV) return null;
  const raw = await env.ADMIN_KV.get(`admin:${email}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function writeAdmin(env: Env, email: string, record: AdminRecord): Promise<void> {
  if (!env.ADMIN_KV) return;
  await env.ADMIN_KV.put(`admin:${email}`, JSON.stringify(record));
}

function hashPattern(p: string): string {
  let h = 0;
  for (let i = 0; i < p.length; i++) {
    h = (h << 5) - h + p.charCodeAt(i);
    h |= 0;
  }
  return 'wl_' + Math.abs(h).toString(36).slice(0, 10);
}

function isValidPattern(p: string): boolean {
  if (/^[\d./*]+$/.test(p)) {
    return true;
  }
  return false;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
