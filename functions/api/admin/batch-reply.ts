/**
 * Batch Reply Worker - Uses DeepSeek API to reply to missing comments
 * POST /api/admin/batch-reply
 * 认证方式：Bearer session_token（登录后获取）
 */

import { verifySession, authResponse, corsPreflight } from './auth';

interface Env {
  DB: D1Database;
  DEEPSEEK_API_KEY: string;
  ADMIN_KV: KVNamespace;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return corsPreflight();
}

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
  if (chinese.length / Math.max((text || '').length, 1) > 0.3) return 'zh';
  const german = (text || '').match(/[äöüßÄÖÜ]/g) || [];
  if (german.length > 0) return 'de';
  return 'en';
}

async function generateReply(apiKey: string, content: string, lang: string): Promise<string> {
  const systemPrompts: Record<string, string> = {
    zh: '你是一位专业的外贸进出口商务顾问。请用中文回复，禁止使用Markdown格式字符，用纯文本直接回复。回复要专业、简洁、有实际帮助。',
    de: 'Sie sind ein professioneller internationaler Handelsberater. Bitte antworten Sie auf Deutsch in einem professionellen und hilfreichen Stil. Keine Markdown-Formatierung.',
    en: 'You are a professional international trade consultant. Reply in English in a professional and helpful manner. No Markdown formatting.'
  };

  const system = systemPrompts[lang] || systemPrompts['en'];

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content }
      ],
      max_tokens: 600,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  return stripMarkdown((data.choices || [])[0]?.message?.content || '');
}

async function getAgentInfo(lang: string) {
  const agentMap: Record<string, { name: string; role: string; emoji: string; gradient: string }> = {
    zh: { name: '商务顾问', role: '外贸进出口 · 商务谈判 · 合作撮合', emoji: '💼', gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
    de: { name: 'Business Consultant', role: 'International Trade · Business Negotiation', emoji: '💼', gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
    en: { name: 'Business Consultant', role: 'International Trade · Business Negotiation', emoji: '💼', gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }
  };
  return agentMap[lang] || agentMap['en'];
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const session = await verifySession({ request, env });
  if (!session) return authResponse();

  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'DeepSeek API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    // Find comments without replies
    const commentsResult = await env.DB.prepare(`
      SELECT id, user_name, content, timestamp 
      FROM comments 
      WHERE status = 'approved' 
        AND (replies IS NULL OR replies = '' OR replies = '[]')
      ORDER BY timestamp ASC
      LIMIT 10
    `).all();

    const comments = commentsResult.results || [];
    
    if (comments.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        processed: 0,
        message: 'All comments have replies'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const results: { id: string; user_name: string; success: boolean; error?: string }[] = [];

    for (const row of comments) {
      const comment = row as { id: string; user_name: string; content: string; timestamp: string };
      const lang = detectLang(comment.content);

      console.log(`Processing comment ${comment.id} (${comment.user_name}, lang: ${lang})`);

      try {
        const replyContent = await generateReply(apiKey, comment.content, lang);
        const agent = await getAgentInfo(lang);

        const reply = {
          id: `r-${uuid4().replace(/-/g, '').slice(0, 12)}`,
          user_name: agent.name,
          user_emoji: agent.emoji,
          user_gradient: agent.gradient,
          user_role: agent.role,
          is_agent: true,
          agent_id: 'consultant',
          content: replyContent,
          timestamp: Date.now(),
          is_admin: false,
          is_system: false
        };

        await env.DB.prepare(`
          UPDATE comments SET replies = ? WHERE id = ?
        `).bind(JSON.stringify([reply]), comment.id).run();

        results.push({ id: comment.id, user_name: comment.user_name, success: true });
        console.log(`✓ Replied to ${comment.id}`);
      } catch (err) {
        const error = (err as Error).message;
        console.error(`✗ Failed to reply to ${comment.id}: ${error}`);
        results.push({ id: comment.id, user_name: comment.user_name, success: false, error });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      results
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('Batch reply error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const session = await verifySession({ request: context.request, env });
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });

  // Get count of comments without replies
  const result = await context.env.DB.prepare(`
    SELECT COUNT(*) as cnt FROM comments 
    WHERE status = 'approved' 
      AND (replies IS NULL OR replies = '' OR replies = '[]')
  `).first() as { cnt: number };

  return new Response(JSON.stringify({
    missing_replies: result?.cnt || 0
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
