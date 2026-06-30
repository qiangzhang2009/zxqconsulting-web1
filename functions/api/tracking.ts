/**
 * 行为追踪 API
 * POST /api/tracking - 接收追踪事件，写入 D1 数据库
 *
 * 支持的事件类型：
 * - page_view: 页面浏览
 * - form_submit: 表单提交（含访客信息）
 * - custom: 自定义事件
 */

interface Env {
  DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function getCFInfo(request: Request) {
  const cf = (request as any).cf || {};
  return {
    country: cf.country || '',
    region: cf.region || '',
    city: cf.city || '',
    clientIp: cf.clientIp || '',
  };
}

function getDeviceInfo(userAgent: string): { deviceType: string; browser: string; os: string } {
  const ua = userAgent.toLowerCase();
  let deviceType = 'desktop';
  if (/mobile|android|iphone|ipad/i.test(ua)) deviceType = /tablet|ipad/i.test(ua) ? 'tablet' : 'mobile';

  let browser = 'unknown';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/chrome\/[0-9]/i.test(ua) && !/opr\//i.test(ua)) browser = 'Chrome';
  else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox\//i.test(ua)) browser = 'Firefox';

  let os = 'unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac os|macintosh/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';

  return { deviceType, browser, os };
}

function extractFields(eventData: Record<string, unknown>): {
  name: string; email: string; phone: string; company: string; message: string;
  targetMarket: string; productType: string;
} {
  const f = eventData?.fields as Record<string, unknown> || eventData as Record<string, unknown> || {};
  return {
    name: String(f.visitor_name || f.name || f['姓名'] || ''),
    email: String(f.visitor_email || f.email || f['邮箱'] || ''),
    phone: String(f.visitor_phone || f.phone || f['电话'] || ''),
    company: String(f.company_name || f.company || f['公司'] || ''),
    message: String(f.message || f['需求'] || f['询价内容'] || ''),
    targetMarket: String(f.target_market || f.targetMarket || f['目标市场'] || ''),
    productType: String(f.product_type || f.productType || f['产品类型'] || ''),
  };
}

async function upsertVisitor(
  db: D1Database,
  visitorId: string,
  fields: ReturnType<typeof extractFields>,
  cf: { country: string; region: string; city: string },
  deviceInfo: { deviceType: string },
  websiteUrl: string,
) {
  // 检查是否已存在
  const existing = await db
    .prepare('SELECT id, visit_count FROM visitors WHERE visitor_id = ? AND website_id = ?')
    .bind(visitorId, 'zxqconsulting')
    .first() as { id: string; visit_count: number } | null;

  if (existing) {
    // 更新：追加联系方式（取非空值）
    await db
      .prepare(`
        UPDATE visitors SET
          contact_name = COALESCE(NULLIF(contact_name, ''), ?),
          email = COALESCE(NULLIF(email, ''), ?),
          phone = COALESCE(NULLIF(phone, ''), ?),
          company_name = COALESCE(NULLIF(company_name, ''), ?),
          visit_count = visit_count + 1,
          last_visit = CURRENT_TIMESTAMP,
          country = COALESCE(NULLIF(country, ''), ?),
          region = COALESCE(NULLIF(region, ''), ?),
          city = COALESCE(NULLIF(city, ''), ?),
          device_type = COALESCE(NULLIF(device_type, ''), ?),
          selected_markets = COALESCE(NULLIF(selected_markets, '[]'), ?),
          updated_at = CURRENT_TIMESTAMP
        WHERE visitor_id = ? AND website_id = ?
      `)
      .bind(
        fields.name || null,
        fields.email || null,
        fields.phone || null,
        fields.company || null,
        cf.country || null,
        cf.region || null,
        cf.city || null,
        deviceInfo.deviceType || null,
        fields.targetMarket ? JSON.stringify([fields.targetMarket]) : null,
        visitorId,
        'zxqconsulting',
      )
      .run();
  } else {
    // 新建
    const id = crypto.randomUUID();
    await db
      .prepare(`
        INSERT INTO visitors (
          id, visitor_id, website_id, contact_name, email, phone, company_name,
          country, region, city, device_type, source,
          selected_markets, visit_count, first_visit, last_visit, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
      .bind(
        id,
        visitorId,
        'zxqconsulting',
        fields.name || '匿名访客',
        fields.email || null,
        fields.phone || null,
        fields.company || null,
        cf.country || null,
        cf.region || null,
        cf.city || null,
        deviceInfo.deviceType || null,
        'website',
        fields.targetMarket ? JSON.stringify([fields.targetMarket]) : '[]',
      )
      .run();
  }
}

async function insertBehavior(
  db: D1Database,
  visitorId: string,
  eventType: string,
  pageUrl: string,
  pageTitle: string,
  metadata: Record<string, unknown>,
  sessionId: string,
  cf: { country: string; region: string; city: string },
  deviceInfo: { deviceType: string },
  durationMs?: number,
) {
  const id = crypto.randomUUID();
  await db
    .prepare(`
      INSERT INTO behaviors (id, visitor_id, website_id, session_id, event_type, event_category, page_url, country, region, city, device_type, duration_seconds, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      visitorId,
      'zxqconsulting',
      sessionId,
      eventType,
      eventType === 'page_view' ? 'engagement' : eventType === 'form_submit' ? 'conversion' : 'custom',
      pageUrl || '',
      cf.country || null,
      cf.region || null,
      cf.city || null,
      deviceInfo.deviceType || null,
      durationMs ? Math.round(durationMs / 1000) : null,
      JSON.stringify(metadata || {}),
    )
    .run();
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const eventType = String(body.event_type || body.event || 'unknown');
    const visitorId = String(body.visitor_id || body.visitorId || `v_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`);
    const sessionId = String(body.session_id || body.sessionId || `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`);
    const pageUrl = String(body.page_url || body.pageUrl || '');
    const pageTitle = String(body.page_title || body.pageTitle || '');
    const eventData = (body.event_data || body.metadata || {}) as Record<string, unknown>;

    const cf = getCFInfo(request);
    const userAgent = request.headers.get('user-agent') || '';
    const deviceInfo = getDeviceInfo(userAgent);

    // 提取表单字段（如果有）
    const fields = extractFields(eventData);
    const hasContactInfo = !!(fields.name || fields.email || fields.phone || fields.company);

    // 1. 处理访客 upsert
    if (eventType === 'form_submit' || hasContactInfo) {
      await upsertVisitor(env.DB, visitorId, fields, cf, deviceInfo, pageUrl);
    }

    // 2. 记录行为事件
    await insertBehavior(env.DB, visitorId, eventType, pageUrl, pageTitle, {
      website_url: body.website_url || '',
      referrer: body.referrer || '',
      user_agent: userAgent,
      traffic_source: body.traffic_source || body.trafficSource || '',
      ...eventData,
    }, sessionId, cf, deviceInfo);

    return new Response(JSON.stringify({
      success: true,
      visitor_id: visitorId,
      session_id: sessionId,
      event_type: eventType,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    // 追踪失败不影响前端，静默返回成功
    console.error('[Tracking] Error:', error);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
