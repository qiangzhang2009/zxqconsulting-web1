/**
 * 重要警告: TOTP 2FA 实现当前是占位代码 (使用 simpleHash 而非标准 HMAC-SHA1),
 * 在生产环境启用 ADMIN_2FA_SECRET 反而会降低安全性。
 *
 * 当前策略: 即使配置了 2FA,也仅打印警告并不真正启用 2FA 校验,
 * 直到替换为 otplib/authenticator 等经过审计的标准实现。
 *
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

/**
 * 密码哈希 - 使用 Web Crypto API 的 PBKDF2-SHA256
 * 这是密码学强哈希:100k iterations + 16-byte salt + 32-byte derived key
 * 比原来的 djb2 hash 安全得多 — GPU 破解成本从秒级提到年/世纪级别
 *
 * 存储格式: pbkdf2$<iterations>$<salt-hex>$<hash-hex>
 * 旧格式: v1_<12-hex> 仍可识别但应逐步迁移
 */
const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

async function pbkdf2(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_BITS
  );
  return new Uint8Array(derived);
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await pbkdf2(password, salt);
  return `pbkdf2\$${PBKDF2_ITERATIONS}\$${bytesToHex(salt)}\$${bytesToHex(hash)}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // 兼容老格式 v1_<hash>
  if (stored.startsWith('v1_')) {
    return hashLegacyPassword(password) === stored;
  }
  // 新格式 pbkdf2$<iter>$<salt>$<hash>
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1], 10);
  if (!Number.isFinite(iterations) || iterations < 1 || iterations > 10_000_000) return false;
  const salt = hexToBytes(parts[2]);
  const expected = hexToBytes(parts[3]);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    keyMaterial,
    KEY_BITS
  );
  const derivedBytes = new Uint8Array(derived);
  if (derivedBytes.length !== expected.length) return false;
  // 常数时间比较
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= (derivedBytes[i] ^ expected[i]);
  }
  return diff === 0;
}

// 保留旧函数以便 verifyPassword 识别老格式 — 新代码不应再调用
function hashLegacyPassword(password: string): string {
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

/**
 * 登录限流:基于 KV 计数器的滑动窗口
 * - 同一 IP 5 分钟内 10 次失败 → 锁定 5 分钟
 * - 成功后清零计数器
 */
async function checkRateLimit(env: Env, ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  if (!env.ADMIN_KV || !ip) return { allowed: true };
  const key = `ratelimit:login:${ip}`;
  const raw = await env.ADMIN_KV.get(key);
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const maxAttempts = 10;

  let attempts: number[] = [];
  try { attempts = raw ? JSON.parse(raw) : []; } catch { attempts = []; }

  // 滑窗: 仅保留 5 分钟内的失败
  attempts = attempts.filter((t: number) => now - t < windowMs);

  if (attempts.length >= maxAttempts) {
    const oldest = attempts[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

async function recordLoginFailure(env: Env, ip: string): Promise<void> {
  if (!env.ADMIN_KV || !ip) return;
  const key = `ratelimit:login:${ip}`;
  const raw = await env.ADMIN_KV.get(key);
  let attempts: number[] = [];
  try { attempts = raw ? JSON.parse(raw) : []; } catch { attempts = []; }
  attempts.push(Date.now());
  await env.ADMIN_KV.put(key, JSON.stringify(attempts), { expirationTtl: 6 * 60 });
}

async function clearLoginFailures(env: Env, ip: string): Promise<void> {
  if (!env.ADMIN_KV || !ip) return;
  await env.ADMIN_KV.delete(`ratelimit:login:${ip}`);
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
    if (!isValidPattern(pattern)) return false; // 跳过无效 pattern 而非放行
    if (pattern.includes('/')) {
      // CIDR
      try { return ipInCidr(ip, pattern); } catch { return false; }
    }
    if (pattern.includes('*')) {
      // 转义 regex 特殊字符 (避免 . / + / [ 等被当作正则元字符)
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*');
      const re = new RegExp(`^${escaped}$`);
      return re.test(ip);
    }
    return pattern === ip;
  });
}

function isValidPattern(p: string): boolean {
  if (!p || p.length > 64) return false;
  // CIDR
  if (p.includes('/')) {
    const [range, bits] = p.split('/');
    const b = parseInt(bits, 10);
    if (!Number.isFinite(b) || b < 0 || b > 128) return false;
    // IPv4 CIDR
    if (range.includes('.') && !range.includes(':')) {
      if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(range)) return false;
      for (const oct of range.split('.')) {
        const n = parseInt(oct, 10);
        if (n < 0 || n > 255) return false;
      }
      return b <= 32;
    }
    // IPv6 CIDR
    if (range.includes(':')) return isValidIPv6(range);
    return false;
  }
  // IPv4 (单 IP)
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(p)) {
    for (const oct of p.split('.')) {
      const n = parseInt(oct, 10);
      if (n < 0 || n > 255) return false;
    }
    return true;
  }
  // IPv6 (单 IP)
  if (p.includes(':')) return isValidIPv6(p);
  // 通配符: 仅允许数字 + 点 + 星号的 IPv4 通配
  if (/^[\d.*]+$/.test(p)) {
    // 拒绝连续两个点 + 拒绝以 .* 开头/结尾异常
    if (p.includes('..')) return false;
    // 每段必须是数字 / 数字.* / * / 空
    const segments = p.split('.');
    if (segments.length !== 4) return false;
    for (const s of segments) {
      if (s === '' || s === '*') continue;
      if (/^\d+$/.test(s)) {
        const n = parseInt(s, 10);
        if (n < 0 || n > 255) return false;
      } else {
        return false;
      }
    }
    return true;
  }
  return false;
}

function isValidIPv6(s: string): boolean {
  // 完整 IPv6 校验:支持 :: 压缩 (:: 只能出现一次)
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
    // IPv4 CIDR
    const mask = bits === 0 ? 0 : (~((1 << (32 - bits)) - 1)) >>> 0;
    return (ipToInt(ip) & mask) === (ipToInt(range) & mask);
  }
  // IPv6 CIDR — 简化按位比较 (生产可换 bigint)
  if (ip.includes(':') && range.includes(':')) {
    const ipBytes = ipv6ToBytes(ip);
    const rangeBytes = ipv6ToBytes(range);
    if (!ipBytes || !rangeBytes) return false;
    const fullBytes = Math.floor(bits / 8);
    const remainder = bits % 8;
    for (let i = 0; i < fullBytes; i++) {
      if (ipBytes[i] !== rangeBytes[i]) return false;
    }
    if (remainder > 0) {
      const mask = (~((1 << (8 - remainder)) - 1)) & 0xff;
      if ((ipBytes[fullBytes] & mask) !== (rangeBytes[fullBytes] & mask)) return false;
    }
    return true;
  }
  return false;
}

function ipv6ToBytes(s: string): Uint8Array | null {
  // 极简 IPv6 → 16 字节: 仅处理 :: 压缩
  try {
    const parts = s.split('::');
    let left: string[], right: string[];
    if (parts.length === 1) {
      left = parts[0].split(':');
      right = [];
    } else if (parts.length === 2) {
      left = parts[0] ? parts[0].split(':') : [];
      right = parts[1] ? parts[1].split(':') : [];
    } else {
      return null;
    }
    const fillCount = 8 - left.length - right.length;
    if (fillCount < 0) return null;
    const groups = [...left, ...Array(fillCount).fill('0'), ...right];
    if (groups.length !== 8) return null;
    const out = new Uint8Array(16);
    for (let i = 0; i < 8; i++) {
      const v = parseInt(groups[i] || '0', 16);
      if (isNaN(v)) return null;
      out[i * 2] = (v >> 8) & 0xff;
      out[i * 2 + 1] = v & 0xff;
    }
    return out;
  } catch {
    return null;
  }
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

  const failIp = request.headers.get('cf-connecting-ip') || (request as any).cf?.clientIp || '';

  // 限流检查 (在解密 body 之前)
  const rateCheck = await checkRateLimit(env, failIp);
  if (!rateCheck.allowed) {
    console.warn(`[Admin Login] Rate limited IP=${failIp} retryAfter=${rateCheck.retryAfter}s`);
    return json({
      success: false,
      error: `登录尝试过多,请 ${rateCheck.retryAfter} 秒后重试`,
      retryAfter: rateCheck.retryAfter,
    }, 429);
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
      await recordLoginFailure(env, failIp);
      return json({ success: false, error: '账号或密码错误' }, 401);
    }

    const valid = await verifyPassword(password, expectedPasswordHash);
    if (!valid) {
      await recordLoginFailure(env, failIp);
      // 记录失败审计
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

    // 2. 2FA 检查 (当前实现不可信,见文件顶部警告)
    // 实际生产必须替换为 otplib 等经过审计的实现 — 目前只记录警告
    if (env.ADMIN_2FA_SECRET) {
      console.warn('[Admin Login] 2FA_SECRET configured but TOTP verifier is placeholder; skipping 2FA check. Replace with otplib before relying on this in production.');
      // 暂时跳过 2FA 验证,直到替换实现
    }

    // 成功登录 → 清零失败计数
    await clearLoginFailures(env, failIp);

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