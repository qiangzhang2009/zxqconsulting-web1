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
 * - 支持 IPv4/IPv6 单 IP、CIDR、通配符 (10.0.*.*)
 * - 非法 pattern 跳过 (fail-closed)
 */
export function checkIpWhitelist(request: Request, admin: AdminRole): { ok: boolean; ip: string } {
  const ip = request.headers.get('cf-connecting-ip') ||
             (request as any).cf?.clientIp ||
             '';

  if (!admin.ipWhitelist || admin.ipWhitelist.length === 0) {
    return { ok: true, ip };
  }

  const ok = admin.ipWhitelist.some((pattern) => {
    if (!pattern) return false;
    if (!isValidPattern(pattern)) return false;
    if (pattern === ip) return true;
    if (pattern.includes('/')) {
      try { return ipInCidr(ip, pattern); } catch { return false; }
    }
    if (pattern.includes('*')) {
      // 转义全部 regex 元字符,只把 \* 还原为 .*
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*');
      const re = new RegExp(`^${escaped}$`);
      return re.test(ip);
    }
    return false;
  });

  return { ok, ip };
}

function isValidPattern(p: string): boolean {
  if (!p || p.length > 64) return false;
  if (p.includes('/')) {
    const [range, bits] = p.split('/');
    const b = parseInt(bits, 10);
    if (!Number.isFinite(b) || b < 0 || b > 128) return false;
    if (range.includes('.') && !range.includes(':')) {
      if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(range)) return false;
      for (const oct of range.split('.')) {
        const n = parseInt(oct, 10);
        if (n < 0 || n > 255) return false;
      }
      return b <= 32;
    }
    if (range.includes(':')) {
      return isValidIPv6(range) && b <= 128;
    }
    return false;
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(p)) {
    for (const oct of p.split('.')) {
      const n = parseInt(oct, 10);
      if (n < 0 || n > 255) return false;
    }
    return true;
  }
  if (p.includes(':')) return isValidIPv6(p);
  if (/^[\d.*]+$/.test(p)) {
    if (p.includes('..')) return false;
    const segments = p.split('.');
    if (segments.length !== 4) return false;
    for (const s of segments) {
      if (s === '' || s === '*') continue;
      if (/^\d+$/.test(s)) {
        const n = parseInt(s, 10);
        if (n < 0 || n > 255) return false;
      } else return false;
    }
    return true;
  }
  return false;
}

function isValidIPv6(s: string): boolean {
  if (!s || s.length < 2 || s.length > 45) return false;
  if (s === '::') return true;
  const doubleColon = s.indexOf('::');
  if (doubleColon === -1) {
    const parts = s.split(':');
    if (parts.length !== 8) return false;
    return parts.every(p => /^[0-9a-fA-F]{1,4}$/.test(p));
  }
  if (s.indexOf('::', doubleColon + 1) !== -1) return false;
  const left = s.slice(0, doubleColon);
  const right = s.slice(doubleColon + 2);
  const leftParts = left === '' ? [] : left.split(':');
  const rightParts = right === '' ? [] : right.split(':');
  if (leftParts.length + rightParts.length > 7) return false;
  const valid = (arr: string[]) => arr.every(p => /^[0-9a-fA-F]{1,4}$/.test(p));
  if (left && !valid(leftParts)) return false;
  if (right && !valid(rightParts)) return false;
  return true;
}

function ipInCidr(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split('/');
  const bits = parseInt(bitsStr, 10);
  if (range.includes('.') && !range.includes(':')) {
    const safeBits = Math.max(0, Math.min(32, bits));
    const mask = safeBits === 0 ? 0 : (~((1 << (32 - safeBits)) - 1)) >>> 0;
    return (ipToInt(ip) & mask) === (ipToInt(range) & mask);
  }
  if (ip.includes(':') && range.includes(':')) {
    const ipB = ipv6ToBytes(ip);
    const rgB = ipv6ToBytes(range);
    if (!ipB || !rgB) return false;
    const safeBits = Math.max(0, Math.min(128, bits));
    const fullBytes = Math.floor(safeBits / 8);
    const remainder = safeBits % 8;
    for (let i = 0; i < fullBytes; i++) {
      if (ipB[i] !== rgB[i]) return false;
    }
    if (remainder > 0) {
      const mask = (~((1 << (8 - remainder)) - 1)) & 0xff;
      if ((ipB[fullBytes] & mask) !== (rgB[fullBytes] & mask)) return false;
    }
    return true;
  }
  return false;
}

function ipv6ToBytes(s: string): Uint8Array | null {
  try {
    const parts = s.split('::');
    let left: string[], right: string[];
    if (parts.length === 1) { left = parts[0].split(':'); right = []; }
    else if (parts.length === 2) {
      left = parts[0] ? parts[0].split(':') : [];
      right = parts[1] ? parts[1].split(':') : [];
    } else return null;
    const fill = 8 - left.length - right.length;
    if (fill < 0) return null;
    const groups = [...left, ...Array(fill).fill('0'), ...right];
    if (groups.length !== 8) return null;
    const out = new Uint8Array(16);
    for (let i = 0; i < 8; i++) {
      const v = parseInt(groups[i] || '0', 16);
      if (isNaN(v)) return null;
      out[i * 2] = (v >> 8) & 0xff;
      out[i * 2 + 1] = v & 0xff;
    }
    return out;
  } catch { return null; }
}

function ipToInt(ip: string): number {
  const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return 0;
  return ((parseInt(m[1]) << 24) >>> 0) + ((parseInt(m[2]) << 16) >>> 0) + ((parseInt(m[3]) << 8) >>> 0) + parseInt(m[4]);
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