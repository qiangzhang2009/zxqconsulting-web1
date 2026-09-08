/**
 * 管理后台 API - 访客列表（KV session 鉴权 + D1 fallback）
 * GET /api/admin/visitors
 * 认证方式：Bearer qhs_<session_token>
 */

import { verifySession, authResponse, corsPreflight, getDB } from './auth';

interface Env {
  DB?: D1Database;
  zxqconsulting_comments?: D1Database;
  ADMIN_KV?: KVNamespace;
}

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const session = await verifySession({ request, env });
  if (!session) return authResponse();

  const DB = getDB(env);
  if (!DB) {
    return json({
      total: 0, page: 1, limit: 20, totalPages: 0, data: [],
      warning: 'D1 database binding not configured',
    });
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const offset = (page - 1) * limit;

    let data, total;

    if (search) {
      const result = await DB.prepare(`
        SELECT * FROM visitors
        WHERE website_id = ? AND (contact_name LIKE ? OR company_name LIKE ? OR phone LIKE ?)
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).bind(websiteId, `%${search}%`, `%${search}%`, `%${search}%`, limit, offset).all();

      const countResult = await DB.prepare(`
        SELECT COUNT(*) as total FROM visitors
        WHERE website_id = ? AND (contact_name LIKE ? OR company_name LIKE ? OR phone LIKE ?)
      `).bind(websiteId, `%${search}%`, `%${search}%`, `%${search}%`).first() as { total: number };

      data = result.results || [];
      total = countResult?.total || 0;
    } else {
      const result = await DB.prepare(`
        SELECT * FROM visitors
        WHERE website_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).bind(websiteId, limit, offset).all();

      const countResult = await DB.prepare(`
        SELECT COUNT(*) as total FROM visitors WHERE website_id = ?
      `).bind(websiteId).first() as { total: number };

      data = result.results || [];
      total = countResult?.total || 0;
    }

    const visitors = (data || []).map((v: any) => ({
      ...v,
      visit_count: v.visit_count ?? 1,
      selected_markets: (() => {
        if (!v.selected_markets) return [];
        if (Array.isArray(v.selected_markets)) return v.selected_markets;
        try { return JSON.parse(v.selected_markets); }
        catch { return []; }
      })(),
    }));

    return json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: visitors,
    });

  } catch (error) {
    console.error('Get Visitors error:', error);
    return json({ error: (error as Error).message }, 500);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}