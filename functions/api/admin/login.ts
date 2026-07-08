/**
 * POST /api/admin/login
 * 请求体: { email: string; password: string }
 * 成功返回: { success: true, token: string }
 * 失败返回: { success: false, error: string }
 */

interface Env {
  ADMIN_KV: KVNamespace;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD_HASH: string;
}

function hashPassword(password: string): string {
  let hash = 0;
  const salt = 'qhs_admin_salt_2026';
  const str = salt + password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'v1_' + Math.abs(hash).toString(16).padStart(12, '0');
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'qhs_';
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  for (let i = 0; i < array.length; i++) {
    token += chars[array[i] % chars.length];
  }
  return token;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const body = await request.json() as { email?: string; password?: string };

    if (!body.email || !body.password) {
      return json({ success: false, error: '请提供账号和密码' }, 400);
    }

    const email = (body.email || '').trim().toLowerCase();
    const password = body.password;

    const expectedEmail = (env.ADMIN_EMAIL || '').toLowerCase();
    const expectedPasswordHash = env.ADMIN_PASSWORD_HASH || '';

    if (!expectedEmail || !expectedPasswordHash) {
      console.error('[Admin Login] ADMIN_EMAIL or ADMIN_PASSWORD_HASH not configured');
      return json({ success: false, error: '服务未配置管理员账号' }, 500);
    }

    if (email !== expectedEmail) {
      return json({ success: false, error: '账号或密码错误' }, 401);
    }

    const inputHash = hashPassword(password);
    const valid = inputHash === expectedPasswordHash;

    if (!valid) {
      return json({ success: false, error: '账号或密码错误' }, 401);
    }

    const token = generateToken();
    const sessionData = JSON.stringify({
      email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    await env.ADMIN_KV.put(`session:${token}`, sessionData, {
      expirationTtl: 7 * 24 * 60 * 60,
    });

    return json({ success: true, token }, 200);

  } catch (e) {
    console.error('[Admin Login] Error:', e);
    return json({ success: false, error: '登录失败' }, 500);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
