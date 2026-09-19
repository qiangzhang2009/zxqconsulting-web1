/**
 * 活跃会话管理 API
 *
 * GET    /api/admin/sessions         - 列出当前 email 的所有活跃 session
 * DELETE /api/admin/sessions?token=X - 终止指定 session
 * DELETE /api/admin/sessions?action=terminate-all - 终止除当前 token 外所有
 *
 * 数据来源: KV `session:<token>`
 */

import { verifySession, authResponse, corsPreflight } from './auth';

interface Env {
  ADMIN_KV?: KVNamespace;
}

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();
  if (!env.ADMIN_KV) return json({ error: 'ADMIN_KV not configured' }, 503);

  try {
    const currentToken = extractToken(request);
    const list = await env.ADMIN_KV.list({ prefix: 'session:', limit: 500 });

    const sessions: Array<{
      token: string;
      device: string;
      browser: string;
      os: string;
      ip: string;
      country: string;
      city: string;
      location: string;
      created_at: string;
      last_active: string;
      current: boolean;
    }> = [];

    for (const k of list.keys) {
      const raw = await env.ADMIN_KV.get(k.name);
      if (!raw) continue;
      let entry: {
        email?: string;
        ip?: string;
        userAgent?: string;
        ua?: string;
        device?: string;
        browser?: string;
        os?: string;
        country?: string;
        city?: string;
        location?: string;
        createdAt?: number;
        lastActiveAt?: number;
        expiresAt?: number;
      };
      try { entry = JSON.parse(raw); } catch { continue; }
      if (entry.email !== session.email) continue;
      if (entry.expiresAt && entry.expiresAt < Date.now()) continue;

      const token = k.name.replace(/^session:/, '');
      const ua = entry.userAgent || entry.ua || '';
      const { browser, os } = parseUA(ua);

      sessions.push({
        token,
        device: entry.device || (ua ? `${browser} on ${os}` : 'Unknown'),
        browser,
        os,
        ip: entry.ip || '-',
        country: entry.country || '',
        city: entry.city || '',
        location: entry.location || (entry.country ? `${entry.country}${entry.city ? ' · ' + entry.city : ''}` : '-'),
        created_at: entry.createdAt ? new Date(entry.createdAt).toISOString().replace('T', ' ').slice(0, 16) : '-',
        last_active: entry.lastActiveAt ? new Date(entry.lastActiveAt).toISOString().replace('T', ' ').slice(0, 16) : '-',
        current: token === currentToken,
      });
    }

    // 排序: 当前在前,然后按最后活跃时间倒序
    sessions.sort((a, b) => {
      if (a.current !== b.current) return a.current ? -1 : 1;
      return (b.last_active || '').localeCompare(a.last_active || '');
    });

    return json({ success: true, sessions });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}

export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();
  if (!env.ADMIN_KV) return json({ error: 'ADMIN_KV not configured' }, 503);

  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const action = url.searchParams.get('action');

    const currentToken = extractToken(request);

    if (action === 'terminate-all') {
      const list = await env.ADMIN_KV.list({ prefix: 'session:', limit: 500 });
      let count = 0;
      for (const k of list.keys) {
        const t = k.name.replace(/^session:/, '');
        if (t === currentToken) continue;
        const raw = await env.ADMIN_KV.get(k.name);
        if (!raw) continue;
        try {
          const e = JSON.parse(raw);
          if (e.email === session.email) {
            await env.ADMIN_KV.delete(k.name);
            count++;
          }
        } catch { /* skip */ }
      }
      return json({ success: true, count });
    }

    if (!token) return json({ error: 'token required' }, 400);
    if (token === currentToken) return json({ error: '不能下线当前会话' }, 400);

    const raw = await env.ADMIN_KV.get(`session:${token}`);
    if (!raw) return json({ success: true, message: '会话已不存在' });
    try {
      const e = JSON.parse(raw);
      if (e.email !== session.email) return json({ error: '无权终止该会话' }, 403);
    } catch { /* proceed */ }

    await env.ADMIN_KV.delete(`session:${token}`);
    return json({ success: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}

function extractToken(req: Request): string | null {
  const h = req.headers.get('Authorization') || '';
  if (!h.startsWith('Bearer ')) return null;
  return h.substring(7);
}

function parseUA(ua: string): { browser: string; os: string } {
  const lc = (ua || '').toLowerCase();
  let browser = 'Unknown Browser';
  if (lc.includes('chrome') && !lc.includes('edg')) browser = 'Chrome';
  else if (lc.includes('firefox')) browser = 'Firefox';
  else if (lc.includes('safari') && !lc.includes('chrome')) browser = 'Safari';
  else if (lc.includes('edg')) browser = 'Edge';
  else if (lc.includes('curl')) browser = 'curl';
  else if (lc.includes('postman')) browser = 'Postman';

  let os = 'Unknown OS';
  if (lc.includes('mac os') || lc.includes('macintosh')) os = 'macOS';
  else if (lc.includes('windows')) os = 'Windows';
  else if (lc.includes('iphone')) os = 'iPhone';
  else if (lc.includes('ipad')) os = 'iPad';
  else if (lc.includes('android')) os = 'Android';
  else if (lc.includes('linux')) os = 'Linux';

  return { browser, os };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
