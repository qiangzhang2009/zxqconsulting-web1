/**
 * 获取客户信息采集表列表 API - D1 版本
 * GET /api/admin/client-intake?page=1&limit=20&status=&search=
 * 认证方式：Bearer session_token
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
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status');
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

    // 确保表存在
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS client_intake (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT,
        company_name_en TEXT,
        unified_code TEXT,
        company_type TEXT,
        establish_date TEXT,
        registered_capital TEXT,
        industry TEXT,
        product_category TEXT,
        company_intro TEXT,
        contact_name TEXT,
        contact_title TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        contact_wechat TEXT,
        overseas_stage TEXT,
        has_branch TEXT,
        branch_details TEXT,
        has_revenue TEXT,
        overseas_revenue TEXT,
        revenue_ratio TEXT,
        overseas_experience TEXT,
        target_markets TEXT,
        priority_markets TEXT,
        market_timeline TEXT,
        market_factors TEXT,
        business_model TEXT,
        product_detail TEXT,
        avg_price TEXT,
        supply_capacity TEXT,
        has_cert TEXT,
        cert_detail TEXT,
        supply_chain TEXT,
        services TEXT,
        service_detail TEXT,
        existing_partners TEXT,
        budget TEXT,
        budget_focus TEXT,
        start_date TEXT,
        end_date TEXT,
        urgency TEXT,
        annual_revenue TEXT,
        profit_rate TEXT,
        available_funds TEXT,
        finance_need TEXT,
        financial_note TEXT,
        competitors TEXT,
        advantages TEXT,
        key_factors TEXT,
        challenges TEXT,
        past_problems TEXT,
        risk_tolerance TEXT,
        docs TEXT,
        additional_note TEXT,
        ip_address TEXT,
        country TEXT,
        status TEXT DEFAULT 'new',
        notes TEXT,
        assigned_to TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (search) {
      whereClause += ` AND (company_name LIKE ? OR contact_name LIKE ? OR contact_email LIKE ? OR contact_phone LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    const countResult = await DB.prepare(
      `SELECT COUNT(*) as total FROM client_intake ${whereClause}`
    ).bind(...params).first() as { total: number };
    const total = countResult?.total || 0;
    
    // 获取列表 - 选择最重要的字段展示
    const dataResult = await DB.prepare(`
      SELECT 
        id,
        company_name,
        company_name_en,
        contact_name,
        contact_title,
        contact_phone,
        contact_email,
        contact_wechat,
        industry,
        product_category,
        company_intro,
        overseas_stage,
        has_branch,
        has_revenue,
        overseas_experience,
        target_markets,
        priority_markets,
        market_timeline,
        business_model,
        product_detail,
        budget,
        services,
        service_detail,
        advantages,
        challenges,
        additional_note,
        status,
        country,
        ip_address,
        created_at
      FROM client_intake 
      ${whereClause}
      ORDER BY created_at DESC
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
    console.error('Get Client Intake API error:', error);
    return new Response(JSON.stringify({
      error: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 获取客户信息采集表明细 API
 * GET /api/admin/client-intake?id=
 */
export async function onRequestGetById(context: { request: Request; env: Env }) {
  const { env, request } = context;
  
  const session = await verifyAuth(request, env);
  if (!session) return authResponse();

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const DB = getDB(env);
    
    if (!DB) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await DB.prepare(`
      SELECT * FROM client_intake WHERE id = ?
    `).bind(id).first();
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Record not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get Client Intake Detail API error:', error);
    return new Response(JSON.stringify({
      error: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 更新客户信息采集表状态 API
 * PATCH /api/admin/client-intake?id=
 */
export async function onRequestPatch(context: { request: Request; env: Env }) {
  const { env, request } = context;
  
  const session = await verifyAuth(request, env);
  if (!session) return authResponse();

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const body = await request.json();
    const { status, notes, assigned_to } = body;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const DB = getDB(env);
    
    if (!DB) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await DB.prepare(`
      UPDATE client_intake
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
    console.error('Update Client Intake API error:', error);
    return new Response(JSON.stringify({
      error: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
