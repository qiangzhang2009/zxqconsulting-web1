/**
 * Admin: 评论管理 API
 * GET /api/admin/comments - 获取所有评论
 * PATCH /api/admin/comments?id= - 更新评论状态
 * DELETE /api/admin/comments?id= - 删除评论
 * 认证方式：Bearer session_token（登录后获取）
 */

import { verifySession, authResponse, corsPreflight } from './auth';

interface Env {
  DB: D1Database;
  ADMIN_KV: KVNamespace;
}

function verifyAuth(request: Request, env: Env) {
  return verifySession({ request, env });
}

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env, request } = context;

  const session = await verifyAuth(request, env);
  if (!session) return authResponse();

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status') || '';
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    if (!env.DB) {
      return new Response(JSON.stringify({ total: 0, data: [], page, limit, totalPages: 0 }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let whereClause = '1=1';
    const params: any[] = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (user_name LIKE ? OR content LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM comments WHERE ${whereClause}`
    ).bind(...params).first() as { total: number };

    const total = countResult?.total || 0;

    const dataResult = await env.DB.prepare(`
      SELECT id, user_name, user_email, content, timestamp, likes, status,
             geo_country, geo_region, geo_city, lang, replies
      FROM comments
      WHERE ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all();

    return new Response(JSON.stringify({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: dataResult.results || []
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Admin Comments API error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPatch(context: { request: Request; env: Env }) {
  const { env, request } = context;

  const session = await verifyAuth(request, env);
  if (!session) return authResponse();

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const body = await request.json();
    const { status } = body;

    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await env.DB.prepare(`
      UPDATE comments SET status = ? WHERE id = ?
    `).bind(status, id).run();

    return new Response(JSON.stringify({ success: true, message: 'Status updated' }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Admin Update Comment API error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { env, request } = context;

  const session = await verifyAuth(request, env);
  if (!session) return authResponse();

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if comment exists
    const existing = await env.DB.prepare('SELECT id FROM comments WHERE id = ?').bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Comment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
    console.log(`[Admin] Deleted comment: ${id}`);

    return new Response(JSON.stringify({ success: true, message: 'Comment deleted' }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Admin Delete Comment API error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
