#!/usr/bin/env node
// 为 ADMIN_PASSWORD_HASH 生成新的 PBKDF2-SHA256 哈希
// 使用方法: ADMIN_PASSWORD=YourNewPass node scripts/hash-admin-password.mjs
// 然后把输出的哈希字符串设置到 Cloudflare Pages 的环境变量 ADMIN_PASSWORD_HASH

const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const enc = new TextEncoder();
  const km = await crypto.subtle.importKey(
    'raw', enc.encode(password),
    { name: 'PBKDF2' }, false, ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    km,
    KEY_BITS
  );
  const hash = new Uint8Array(derived);
  return `pbkdf2\$${ITERATIONS}\$${bytesToHex(salt)}\$${bytesToHex(hash)}`;
}

(async () => {
  const password = process.env.ADMIN_PASSWORD || process.argv[2];
  if (!password) {
    console.error('Usage: ADMIN_PASSWORD=YourPass node scripts/hash-admin-password.mjs');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }
  const hash = await hashPassword(password);
  console.log(hash);
})();