/**
 * 获取表单提交列表 API - D1 版本
 * GET /api/admin/submissions?page=1&limit=20&status=&search=&website_id=
 * 获取所有联系表单提交列表，支持分页和搜索
 * 认证方式：Bearer session_token（登录后获取）
 */

import { verifySession, authResponse, corsPreflight, getDB } from './auth';

interface Env {
  DB?: D1Database;
  zxqconsulting_comments?: D1Database;
  ADMIN_KV?: KVNamespace;
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
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1') || 1);
    const limit = Math.max(1, Math.min(parseInt(url.searchParams.get('limit') || '20') || 20, 200));
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status');
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const offset = (page - 1) * limit;
    
    const DB = getDB(env);
    
    if (!DB) {
      return new Response(JSON.stringify({
        total: 0,
        page,
        limit,
        data: [],
        totalPages: 0
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let whereClause = 'WHERE website_id = ?';
    const params: any[] = [websiteId];
    
    if (search) {
      whereClause += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?)`;
      const safeSearch = search.length > 100 ? search.slice(0, 100) : search;
      const searchTerm = `%${safeSearch}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    const countResult = await DB.prepare(
      `SELECT COUNT(*) as total FROM submissions ${whereClause}`
    ).bind(...params).first() as { total: number };
    const total = countResult?.total || 0;
    
    const dataResult = await DB.prepare(`
      SELECT id, visitor_id, name, email, phone, company,
             product_stage, target_markets, timeline, challenge, budget, has_validation,
             message, source_page, country, status, notes, assigned_to, created_at
      FROM submissions 
      ${whereClause}
      ORDER BY created_at DESC, id DESC
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
    console.error('Get Submissions API error:', error);
    return new Response(JSON.stringify({
      error: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 更新表单状态 API
 * PATCH /api/admin/submissions?id=
 */
export async function onRequestPatch(context: { request: Request; env: Env }) {
  const { env, request } = context;

  const session = await verifyAuth(request, env);
  if (!session) return authResponse();
  if (!['super_admin', 'admin', 'editor'].includes(session.role)) {
    return new Response(JSON.stringify({ error: '需要编辑权限' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const body = await request.json();
    const { status, notes, assigned_to } = body;
    
    const DB = getDB(env);
    
    if (!DB) {
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
    if (typeof id !== 'string' || id.length > 128) {
      return new Response(JSON.stringify({ error: 'Invalid id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await DB.prepare(`
      UPDATE submissions
      SET status = COALESCE(?, status),
          notes = COALESCE(?, notes),
          assigned_to = COALESCE(?, assigned_to),
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      status !== undefined ? status : null,
      notes !== undefined ? notes : null,
      assigned_to !== undefined ? assigned_to : null,
      id
    ).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: '状态已更新'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Update Submission API error:', error);
    return new Response(JSON.stringify({
      error: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * DELETE /api/admin/submissions?id=
 * 删除单条线索 (需要 admin 权限)
 */
export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { env, request } = context;
  const session = await verifyAuth(request, env);
  if (!session) return authResponse();
  if (!['super_admin', 'admin'].includes(session.role)) {
    return new Response(JSON.stringify({ error: '需要管理员权限' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ error: 'id required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
    if (typeof id !== 'string' || id.length > 128) {
      return new Response(JSON.stringify({ error: 'invalid id' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const DB = getDB(env);
    if (!DB) return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });

    const existing = await DB.prepare('SELECT id, name FROM submissions WHERE id = ?').bind(id).first();
    if (!existing) return new Response(JSON.stringify({ error: '线索不存在' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    });

    await DB.prepare('DELETE FROM submissions WHERE id = ?').bind(id).run();
    console.log(`[Admin] Deleted submission: ${id} by ${session.email}`);

    return new Response(JSON.stringify({ success: true, message: '线索已删除' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete Submission API error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
