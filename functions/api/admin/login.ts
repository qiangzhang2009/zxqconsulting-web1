/**
 * POST /api/admin/login
 * 请求体: { email: string; password: string; totpToken?: string }
 * 成功返回: { success: true, token: string, role: string }
 * 2FA 检查: { success: false, requiresTwoFactor: true }
 * 失败返回: { success: false, error: string }
 */

interface Env {
  ADMIN_KV: KVNamespace;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD_HASH: string;
  ADMIN_ROLE?: string;
  ADMIN_2FA_SECRET?: string;
  ADMIN_IP_WHITELIST?: string;
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

function verifyTOTP(token: string, secret: string, window = 1): boolean {
  if (!token || !secret) return false;
  const step = 30;
  const counter = Math.floor(Date.now() / 1000 / step);
  for (let i = -window; i <= window; i++) {
    const t = counter + i;
    const expected = generateTOTP(secret, t);
    if (expected === token) return true;
  }
  return false;
}

function generateTOTP(secret: string, counter: number): string {
  let h = 0;
  const str = secret + counter;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString().padStart(10, '0').substring(0, 6).padStart(6, '0');
}

function checkIpWhitelist(request: Request, whitelistStr?: string): boolean {
  if (!whitelistStr || whitelistStr.trim() === '') return true;
  const whitelist = whitelistStr.split(',').map(s => s.trim()).filter(Boolean);
  if (whitelist.length === 0) return true;
  const ip = request.headers.get('cf-connecting-ip') || (request as any).cf?.clientIp || '';
  if (!ip) return true;
  return whitelist.some(pattern => {
    if (pattern === ip) return true;
    if (pattern.includes('*')) {
      const re = new RegExp(pattern.replace(/\./g, '\\.').replace(/\*/g, '.*'));
      return re.test(ip);
    }
    return false;
  });
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

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

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const body = await request.json() as { email?: string; password?: string; totpToken?: string };

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
      // 通用错误以防账号探测
      return json({ success: false, error: '账号或密码错误' }, 401);
    }

    const inputHash = hashPassword(password);
    const valid = inputHash === expectedPasswordHash;
    if (!valid) {
      // 记录失败审计
      const failIp = request.headers.get('cf-connecting-ip') || '';
      await env.ADMIN_KV.put(
        `audit:login:${email}:${Date.now()}`,
        JSON.stringify({ email, ip: failIp, role: 'unknown', success: false, timestamp: Date.now() }),
        { expirationTtl: 30 * 24 * 60 * 60 }
      ).catch(() => { /* 不阻塞主流程 */ });
      return json({ success: false, error: '账号或密码错误' }, 401);
    }

    // 1. IP 白名单检查
    if (!checkIpWhitelist(request, env.ADMIN_IP_WHITELIST)) {
      console.warn(`[Admin Login] IP rejected for ${email}`);
      return json({ success: false, error: 'IP 不在白名单内' }, 403);
    }

    // 2. 2FA 检查
    if (env.ADMIN_2FA_SECRET) {
      if (!body.totpToken) {
        return json({ success: false, requiresTwoFactor: true, error: '需要 2FA 验证码' }, 200);
      }
      if (!verifyTOTP(body.totpToken, env.ADMIN_2FA_SECRET)) {
        return json({ success: false, error: '2FA 验证码错误' }, 401);
      }
    }

    // 3. 生成 token 并存会话
    const token = generateToken();
    const role = env.ADMIN_ROLE || 'admin';
    const ua = request.headers.get('User-Agent') || '';
    const ip = request.headers.get('cf-connecting-ip') || (request as any).cf?.clientIp || '';
    const country = request.headers.get('cf-ipcountry') || '';
    const city = (request as any).cf?.city || '';

    const sessionData = JSON.stringify({
      email,
      role,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      userAgent: ua,
      ip,
      country,
      city,
    });

    await env.ADMIN_KV.put(`session:${token}`, sessionData, {
      expirationTtl: 7 * 24 * 60 * 60,
    });

    // 4. 记录审计
    await env.ADMIN_KV.put(
      `audit:login:${email}:${Date.now()}`,
      JSON.stringify({ email, ip, totp: !!env.ADMIN_2FA_SECRET, role, success: true, timestamp: Date.now() }),
      { expirationTtl: 30 * 24 * 60 * 60 }
    );

    return json({ success: true, token, role }, 200);

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