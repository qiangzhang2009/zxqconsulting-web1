/**
 * 管理后台 API - Cloudflare D1 版本
 * GET /api/admin/visitors - 获取访客列表
 * GET /api/admin/submissions - 获取表单提交列表  
 * 认证方式：Bearer base64("email:password")
 */

interface Env {
  DB: D1Database;
}

function verifyAuth(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7);
  try {
    const decoded = atob(token);
    const [email, password] = decoded.split(':');
    return !!(email && password);
  } catch {
    return false;
  }
}

/**
 * 获取访客列表
 * GET /api/admin/visitors?page=1&limit=20&search=&website_id=
 */
export async function onRequestGet(context: { request: Request; params: any; env: Env }) {
  const { request, env } = context;
  
  if (!verifyAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
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
      // 带搜索的查询
      const result = await env.DB.prepare(`
        SELECT * FROM visitors 
        WHERE website_id = ? AND (contact_name LIKE ? OR company_name LIKE ? OR phone LIKE ?)
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).bind(websiteId, `%${search}%`, `%${search}%`, `%${search}%`, limit, offset).all();
      
      const countResult = await env.DB.prepare(`
        SELECT COUNT(*) as total FROM visitors 
        WHERE website_id = ? AND (contact_name LIKE ? OR company_name LIKE ? OR phone LIKE ?)
      `).bind(websiteId, `%${search}%`, `%${search}%`, `%${search}%`).first() as { total: number };
      
      data = result.results || [];
      total = countResult?.total || 0;
    } else {
      // 无搜索的查询
      const result = await env.DB.prepare(`
        SELECT * FROM visitors 
        WHERE website_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).bind(websiteId, limit, offset).all();
      
      const countResult = await env.DB.prepare(`
        SELECT COUNT(*) as total FROM visitors WHERE website_id = ?
      `).bind(websiteId).first() as { total: number };
      
      data = result.results || [];
      total = countResult?.total || 0;
    }
    
    // 解析 selected_markets JSON（可能是字符串或数组）
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
    
    return new Response(JSON.stringify({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: visitors
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get Visitors error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
