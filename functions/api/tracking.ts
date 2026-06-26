/**
 * 行为追踪 API
 * POST /api/tracking
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequest(context: { request: Request; env: unknown }) {
  const { request } = context;
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const eventType = body.event_type || body.event;
    const visitorId = body.visitor_id || body.visitorId;
    const sessionId = body.session_id || body.sessionId;

    if (!eventType) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const vid = (visitorId as string) || `v_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const sid = (sessionId as string) || `s_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    return new Response(JSON.stringify({
      success: true,
      visitor_id: vid,
      session_id: sid,
      event_type: eventType,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch {
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
