/**
 * 管理后台 API - 清理测试数据
 *
 * DELETE /api/admin/cleanup-test-data?prefix=burst-
 *   删除 report_id 以指定前缀开头的所有交互记录
 *
 * 仅 super_admin 可调用。生产环境清理测试噪音。
 *
 * 认证：Bearer qhs_<session_token>
 */
import { verifySession, corsPreflight, getDB, authResponse, forbiddenResponse } from './auth';

interface Env {
  DB?: D1Database;
  zxqconsulting_comments?: D1Database;
  ADMIN_KV?: KVNamespace;
}

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://www.zxqconsulting.com' },
  });

const err = (msg: string, status = 400) =>
  new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://www.zxqconsulting.com' },
  });

export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();
  if (session.role !== 'super_admin') return forbiddenResponse('Only super_admin can run cleanup');

  const db = getDB(env);
  if (!db) return err('Database not configured', 503);

  const url = new URL(request.url);
  const prefix = (url.searchParams.get('prefix') || '').trim().slice(0, 32);
  if (!prefix) return err('prefix required (e.g. ?prefix=burst-)', 400);

  // 安全闸门:拒绝过宽的删除
  const bannedPrefixes = ['', '%', '_', 'ALL'];
  if (bannedPrefixes.includes(prefix.toUpperCase())) {
    return err('Refusing to delete with empty/wildcard prefix', 403);
  }

  try {
    // 先数一行,确认有数据 + 防止严重破坏
    const cnt = await db.prepare(
      `SELECT COUNT(*) as n FROM report_interactions WHERE report_id LIKE ?`
    ).bind(`${prefix}%`).first() as { n: number };

    if (cnt.n === 0) {
      return ok({ success: true, deleted: 0, message: 'no rows matched' });
    }

    // 安全闸 — 单次最多删 5000 行,避免误删
    if (cnt.n > 5000) {
      return err(`Refusing to delete ${cnt.n} rows in one call (max 5000). Narrow the prefix.`, 400);
    }

    const result = await db.prepare(
      `DELETE FROM report_interactions WHERE report_id LIKE ?`
    ).bind(`${prefix}%`).run();

    return ok({
      success: true,
      deleted: result.meta?.changes ?? cnt.n,
      matched: cnt.n,
      prefix,
    });
  } catch (e) {
    return err((e as Error).message, 500);
  }
}

export async function onRequestOptions() {
  return corsPreflight();
}