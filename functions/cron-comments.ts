/**
 * Cron Worker - Auto-reply to unreplied comments
 * Triggered by Cloudflare Cron every 15 minutes
 * 
 * Configure in wrangler-cron.toml:
 * crons = ["0,15,30,45 * * * *"]
 */

interface Env {
  DB: D1Database;
  DEEPSEEK_API_KEY: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    await processUnrepliedComments(env);
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    
    // POST / - Trigger immediate processing
    if (request.method === 'POST' && url.pathname === '/') {
      try {
        const result = await processUnrepliedComments(env);
        return new Response(JSON.stringify({ success: true, ...result }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: (err as Error).message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // GET / - Health check
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function processUnrepliedComments(env: Env): Promise<{processed: number; failed: number}> {
  console.log('[Cron] Starting scheduled comment reply job');
  console.log('[Cron] DB binding present:', !!env.DB);
  console.log('[Cron] API key present:', !!env.DEEPSEEK_API_KEY);

  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('[Cron] DEEPSEEK_API_KEY not configured');
    return { processed: 0, failed: 0 };
  }

  // Test DB connectivity
  try {
    const testQuery = await env.DB.prepare('SELECT COUNT(*) as cnt FROM comments').first();
    console.log('[Cron] DB test query result:', JSON.stringify(testQuery));
  } catch (e) {
    console.error('[Cron] DB test query failed:', (e as Error).message);
    return { processed: 0, failed: 0 };
  }

  // Find comments without replies
  try {
    const commentsResult = await env.DB.prepare(`
      SELECT id, user_name, content, timestamp
      FROM comments
      WHERE status = 'approved'
        AND (replies IS NULL OR replies = '' OR replies = '[]')
      ORDER BY timestamp ASC
      LIMIT 10
    `).all();

      const comments = commentsResult.results || [];
      console.log(`[Cron] Found ${comments.length} comments without replies`);

      if (comments.length === 0) {
        console.log('[Cron] No comments need replies');
        return { processed: 0, failed: 0 };
      }

      let processed = 0;
      let failed = 0;

      for (const row of comments) {
        const comment = row as { id: string; user_name: string; content: string; timestamp: string };

        try {
          const lang = detectLang(comment.content);
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

          processed++;
          console.log(`[Cron] ✓ Replied to comment ${comment.id} (${comment.user_name})`);

          // Small delay between API calls to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
          failed++;
          console.error(`[Cron] ✗ Failed to reply to ${comment.id}: ${(err as Error).message}`);
        }
      }

      console.log(`[Cron] Job completed: ${processed} processed, ${failed} failed`);
      return { processed, failed };
    } catch (error) {
      console.error('[Cron] Job error:', error);
      throw error;
    }
}