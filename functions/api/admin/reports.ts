/**
 * 诊断报告管理 API
 * GET /api/admin/reports?page=1&limit=20&market=&category=&website_id=
 * PATCH /api/admin/reports?id=&lead_tier=&notes=
 * 认证方式：Bearer session_token（登录后获取）
 */

import { verifySession, authResponse, corsPreflight, CORS_HEADERS, getDB } from './auth';

interface Env {
  DB?: D1Database;
  zxqconsulting_comments?: D1Database;
  ADMIN_KV?: KVNamespace;
}

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env, request } = context;

  const session = await verifySession({ request, env });
  if (!session) return authResponse();

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const market = url.searchParams.get('market') || '';
    const category = url.searchParams.get('category') || '';
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const offset = (page - 1) * limit;

    const DB = getDB(env);
    if (!DB) return json({ total: 0, page, data: [], totalPages: 0 });

    const conditions: string[] = ['website_id = ?'];
    const params: any[] = [websiteId];

    if (market) { conditions.push('market_id = ?'); params.push(market); }
    if (category) { conditions.push('category = ?'); params.push(category); }

    const where = 'WHERE ' + conditions.join(' AND ');

    const countResult = await DB.prepare(
      `SELECT COUNT(*) as total FROM diagnosis_reports ${where}`
    ).bind(...params).first() as { total: number };
    const total = countResult?.total || 0;

    const dataResult = await DB.prepare(`
      SELECT id, market_id, market_name, market_name_en, category, product_type,
             diagnosis_input, diagnosis_report, qualification_decision,
             country, region, created_at
      FROM diagnosis_reports
      ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all();

    const data = (dataResult.results || []).map((r: any) => ({
      ...r,
      diagnosis_input: r.diagnosis_input ? JSON.parse(r.diagnosis_input) : {},
      diagnosis_report: r.diagnosis_report ? JSON.parse(r.diagnosis_report) : {},
      qualification_decision: r.qualification_decision ? JSON.parse(r.qualification_decision) : {},
    }));

    return json({ total, page, limit, totalPages: Math.ceil(total / limit), data });
  } catch (error) {
    console.error('[Reports] GET error:', error);
    return json({ error: (error as Error).message }, 500);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
