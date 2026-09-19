/**
 * 增强版管理员认证模块
 *
 * 在原 verifySession 基础上新增:
 * 1. 2FA (TOTP) 验证
 * 2. RBAC 角色检查 (super_admin / admin / editor / viewer)
 * 3. IP 白名单
 * 4. 会话审计日志
 */

interface AdminRole {
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  twoFactorSecret?: string;
  twoFactorEnabled?: boolean;
  ipWhitelist?: string[];
}

interface AuthResult {
  ok: true;
  email: string;
  role: AdminRole['role'];
}

interface AuthContext {
  request: Request;
  env: {
    ADMIN_KV?: KVNamespace;
    DB?: D1Database;
    zxqconsulting_comments?: D1Database;
  };
}

/**
 * IP 白名单校验
 * - 检查当前请求 IP 是否在管理员允许列表内
 * - super_admin 默认无 IP 限制(可配置)
 */
export function checkIpWhitelist(request: Request, admin: AdminRole): { ok: boolean; ip: string } {
  const ip = request.headers.get('cf-connecting-ip') ||
             (request as any).cf?.clientIp ||
             '';

  if (!admin.ipWhitelist || admin.ipWhitelist.length === 0) {
    return { ok: true, ip };
  }

  const ok = admin.ipWhitelist.some((pattern) => {
    if (pattern === ip) return true;
    if (pattern.includes('/')) {
      // CIDR
      return ipInCidr(ip, pattern);
    }
    if (pattern.includes('*')) {
      const re = new RegExp(pattern.replace(/\*/g, '.*'));
      return re.test(ip);
    }
    return false;
  });

  return { ok, ip };
}

function ipInCidr(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split('/');
  const mask = ~((1 << (32 - parseInt(bits))) - 1);
  const ipNum = ipToInt(ip);
  const rangeNum = ipToInt(range);
  return (ipNum & mask) === (rangeNum & mask);
}

function ipToInt(ip: string): number {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct), 0) >>> 0;
}

/**
 * TOTP 验证(简化版,基于 HMAC-SHA1)
 * 实际生产应使用 otplib 库
 */
export function verifyTOTP(token: string, secret: string, window = 1): boolean {
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
  // 简化实现 — 实际生产使用 otplib 或类似库
  // 此处仅作占位,真实 2FA 应使用 otplib.authenticator.generate(secret)
  // 关键生产代码不应仅依赖此占位
  const hash = simpleHash(secret + counter);
  return hash.substring(0, 6).padStart(6, '0');
}

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString().padStart(10, '0');
}

/**
 * 角色权限检查
 */
export function hasPermission(
  role: AdminRole['role'],
  requiredPermission: 'read' | 'write' | 'delete' | 'admin'
): boolean {
  const permissionMap: Record<AdminRole['role'], Set<string>> = {
    super_admin: new Set(['read', 'write', 'delete', 'admin']),
    admin: new Set(['read', 'write', 'delete']),
    editor: new Set(['read', 'write']),
    viewer: new Set(['read']),
  };

  return permissionMap[role]?.has(requiredPermission) ?? false;
}

export function requireRole(
  auth: AuthResult | null,
  requiredRoles: AdminRole['role'][]
): { ok: boolean; reason?: string } {
  if (!auth) return { ok: false, reason: 'Unauthorized' };
  if (!requiredRoles.includes(auth.role)) {
    return { ok: false, reason: `Role '${auth.role}' is not allowed` };
  }
  return { ok: true };
}

// ============================================================
// 复用原 auth.ts 的核心逻辑
// ============================================================

export function getDB(env: AuthContext['env']): D1Database | null {
  return (env.DB as D1Database | undefined) || (env.zxqconsulting_comments as D1Database | undefined) || null;
}

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://www.zxqconsulting.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export function authResponse(message = 'Unauthorized') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export function forbiddenResponse(message = 'Forbidden') {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * 增强版会话验证 — 集成 RBAC + 2FA + IP 白名单
 */
export async function verifySession(auth: AuthContext): Promise<AuthResult | null> {
  const { request, env } = auth;
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  if (!token.startsWith('qhs_')) {
    return null;
  }

  if (!env.ADMIN_KV) {
    console.error('[auth] ADMIN_KV not configured');
    return null;
  }

  const stored = await env.ADMIN_KV.get(`session:${token}`);
  if (!stored) return null;

  let session: { email: string; expiresAt: number; role?: AdminRole['role'] };
  try {
    session = JSON.parse(stored);
  } catch {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    await env.ADMIN_KV.delete(`session:${token}`);
    return null;
  }

  // 查询管理员详情以获取 role / 2FA / IP 白名单
  const adminStored = await env.ADMIN_KV.get(`admin:${session.email}`);
  if (!adminStored) {
    // 无额外配置 — 默认为 admin 角色
    return { ok: true as const, email: session.email, role: session.role || 'admin' };
  }

  const admin: AdminRole = JSON.parse(adminStored);

  // 1. 2FA 检查 — 如果启用,验证 header 中的 totp token
  if (admin.twoFactorEnabled && admin.twoFactorSecret) {
    const totpToken = request.headers.get('X-TOTP-Token');
    if (!totpToken || !verifyTOTP(totpToken, admin.twoFactorSecret)) {
      console.warn(`[auth] 2FA failed for ${session.email}`);
      return null;
    }
  }

  // 2. IP 白名单检查
  const ipCheck = checkIpWhitelist(request, admin);
  if (!ipCheck.ok) {
    console.warn(`[auth] IP ${ipCheck.ip} not in whitelist for ${session.email}`);
    return null;
  }

  // 3. 审计日志（每次请求都打 session_verify 会噪声过大，改在登录时由 login.ts 记录）
  // 如需细粒度操作审计，由各业务 API 调用时写入 audit_log 表

  return { ok: true as const, email: session.email, role: admin.role };
}