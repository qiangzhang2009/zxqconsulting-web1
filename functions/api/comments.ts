const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
};

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
const err = (msg: string, status = 500) =>
  new Response(JSON.stringify({ error: msg }), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

function uuid4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function stripMarkdown(text: string) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*_]{3,}\s*$/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function detectLang(text: string) {
  const chinese = (text || '').match(/[\u4e00-\u9fff]/g) || [];
  return chinese.length / Math.max((text || '').length, 1) > 0.3 ? 'zh' : 'en';
}

function getClientIp(request: Request) {
  return (request.headers as Headers).get('cf-connecting-ip') ||
    (request.headers as Headers).get('x-real-ip') ||
    (request.headers as Headers).get('x-forwarded-for')?.split(',')[0].trim() || '';
}

function getGeoFromCf(request: Request) {
  return {
    country: (request.headers as Headers).get('cf-ipcountry') || '',
    region: (request.headers as Headers).get('cf-region') || '',
    city: (request.headers as Headers).get('cf-ipcity') || '',
  };
}

interface Env {
  zxqconsulting_comments: D1Database;
  DEEPSEEK_API_KEY: string;
}

export async function onRequest(context: { request: Request; env: Env; ctx: ExecutionContext }) {
  const { request, env, ctx } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  // GET /api/comments
  if (path === '/api/comments' && method === 'GET') {
    if (!env.zxqconsulting_comments) return ok({ success: true, comments: [], total: 0, totalPages: 0 });
    const sort = url.searchParams.get('sort') || 'latest';
    const order = sort === 'popular' ? 'likes DESC' : 'timestamp DESC';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const page = parseInt(url.searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    try {
      const countResult = await env.zxqconsulting_comments
        .prepare(`SELECT COUNT(*) as cnt FROM comments WHERE status = 'approved'`)
        .first() as { cnt: number } | null;
      const total = countResult?.cnt || 0;
      const results = await env.zxqconsulting_comments
        .prepare(`SELECT id, user_name, user_email, content, timestamp, likes, liked_by, replies, status, geo_country, geo_region, geo_city, lang FROM comments WHERE status = 'approved' ORDER BY ${order} LIMIT ? OFFSET ?`)
        .bind(limit, offset)
        .all();
      const totalPages = Math.ceil(total / limit);
      return ok({ success: true, comments: results.results || [], total, totalPages });
    } catch (e: unknown) {
      return ok({ success: true, comments: [], total: 0, totalPages: 0, _error: (e as Error).message });
    }
  }

  // POST /api/comments
  if (path === '/api/comments' && method === 'POST') {
    if (!env.zxqconsulting_comments) return err('Database not configured', 503);
    try {
      const body = await request.json() as { content?: string; user_name?: string; user_email?: string };
      if (!body.content?.trim()) return err('Content is required', 400);
      if (body.content.length > 2000) return err('Content too long (max 2000 chars)', 400);

      const geo = getGeoFromCf(request);
      const lang = detectLang(body.content);
      const id = uuid4();
      const timestamp = new Date().toISOString();
      const userName = (body.user_name || '').trim().slice(0, 50) || '游客';

      await env.zxqconsulting_comments
        .prepare(`INSERT INTO comments (id, user_name, user_email, content, timestamp, likes, liked_by, replies, status, geo_country, geo_region, geo_city, lang)
                  VALUES (?, ?, ?, ?, ?, 0, '[]', '[]', 'approved', ?, ?, ?, ?)`)
        .bind(id, userName, (body.user_email || '').trim().slice(0, 100), body.content.trim(), timestamp, geo.country, geo.region, geo.city, lang)
        .run();

      if (env.DEEPSEEK_API_KEY) {
        ctx.waitUntil(triggerAiReply(env, id, body.content, lang));
      }

      return ok({ success: true, id, timestamp }, 201);
    } catch (e: unknown) { return err((e as Error).message, 500); }
  }

  // PUT /api/comments/:id/like
  const likeMatch = path.match(/^\/api\/comments\/([^/]+)\/like$/);
  if (likeMatch && method === 'PUT') {
    if (!env.zxqconsulting_comments) return err('Database not configured', 503);
    const id = likeMatch[1];
    const ip = getClientIp(request);
    const userId = `guest_${ip.replace(/[^a-z0-9]/gi, '').slice(-8) || 'anon'}`;
    try {
      const row = await env.zxqconsulting_comments.prepare('SELECT * FROM comments WHERE id = ?').bind(id).first() as Record<string, unknown> | null;
      if (!row) return err('Not found', 404);

      const likedBy = JSON.parse((row.liked_by || '[]') as string);
      const idx = likedBy.indexOf(userId);
      if (idx >= 0) likedBy.splice(idx, 1);
      else likedBy.push(userId);
      const newLikes = (row.likes as number) + (idx >= 0 ? -1 : 1);

      await env.zxqconsulting_comments.prepare('UPDATE comments SET likes = ?, liked_by = ? WHERE id = ?')
        .bind(newLikes, JSON.stringify(likedBy), id).run();

      return ok({ success: true, liked: idx < 0, likes: newLikes });
    } catch (e: unknown) { return err((e as Error).message, 500); }
  }

  return err('Not found', 404);
}

async function triggerAiReply(env: Env, commentId: string, content: string, lang: string) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return;
  try {
    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: lang === 'en' ? 'You are a professional international trade consultant. Reply in the same language as the question. No Markdown formatting.' : '你是一位专业的外贸进出口商务顾问。禁止使用Markdown格式字符，用纯文本直接回复。' },
          { role: 'user', content },
        ],
        max_tokens: 600,
        temperature: 0.65,
      }),
    });
    if (!upstream.ok) return;
    const data = await upstream.json() as { choices?: { message?: { content?: string } }[] };
    const replyContent = (data.choices || [])[0]?.message?.content || '';
    if (!replyContent) return;

    const reply = {
      id: uuid4(),
      user_name: 'AI 商务顾问',
      content: stripMarkdown(replyContent),
      timestamp: Date.now(),
      is_admin: false,
      is_system: false,
      is_agent: true,
    };

    const row = await env.zxqconsulting_comments.prepare('SELECT replies FROM comments WHERE id = ?').bind(commentId).first() as Record<string, unknown> | null;
    if (row) {
      const existing = JSON.parse((row.replies || '[]') as string);
      existing.unshift(reply);
      await env.zxqconsulting_comments.prepare('UPDATE comments SET replies = ? WHERE id = ?').bind(JSON.stringify(existing), commentId).run();
    }
  } catch (_) {}
}
