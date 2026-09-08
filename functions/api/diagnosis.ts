/**
 * 保存诊断报告 API
 * POST /api/diagnosis
 *
 * 保存用户在 /diagnose 页面的诊断结果到 D1 数据库
 */

interface Env {
  DB?: D1Database;
  zxqconsulting_comments?: D1Database;
}

function getDB(env: Env): D1Database | null {
  return env.DB || env.zxqconsulting_comments || null;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const {
      website_id,
      visitor_id,
      market_id,
      market_name,
      market_name_en,
      category,
      product_type,
      diagnosis_input,
      diagnosis_report,
      qualification_decision,
      evidence_blocks,
    } = body;

    if (!market_id || !category) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cf = (request as any).cf || {};
    const ipAddress = cf.clientIp || '';
    const country = cf.country || '';
    const region = cf.region || '';
    const city = cf.city || '';

    const id = crypto.randomUUID();

    const DB = getDB(env);
    if (!DB) {
      return new Response(JSON.stringify({ error: 'D1 database not configured', id }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await DB
      .prepare(
        `INSERT INTO diagnosis_reports
          (id, website_id, visitor_id, market_id, market_name, market_name_en,
           category, product_type, diagnosis_input, diagnosis_report,
           qualification_decision, evidence_blocks, country, region, city, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        website_id || 'zxqconsulting',
        visitor_id || null,
        market_id,
        market_name || null,
        market_name_en || null,
        category,
        product_type || null,
        JSON.stringify(diagnosis_input || {}),
        JSON.stringify(diagnosis_report || {}),
        JSON.stringify(qualification_decision || {}),
        JSON.stringify(evidence_blocks || []),
        country,
        region,
        city,
        ipAddress
      )
      .run();

    return new Response(
      JSON.stringify({ success: true, id }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Diagnosis] Save error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
