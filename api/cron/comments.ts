import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Env {
  DB: any;
  DEEPSEEK_API_KEY: string;
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
  return 'en';
}

async function generateReply(apiKey: string, content: string, lang: string): Promise<string> {
  const systemPrompts: Record<string, string> = {
    zh: '你是一位专业的外贸进出口商务顾问。请用中文回复，禁止使用Markdown格式字符，用纯文本直接回复。回复要专业、简洁、有实际帮助。',
    en: 'You are a professional international trade consultant. Reply in English in a professional and helpful manner. No Markdown formatting.'
  };

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompts[lang] || systemPrompts['en'] },
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // This endpoint is called by Vercel Cron every 15 minutes
  // Only allow cron requests
  if (req.headers['x-vercel-signature'] !== 'cron') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('[Cron] DEEPSEEK_API_KEY not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // This endpoint needs DB access - for now return success
    // In production, this would query D1 via REST API
    console.log('[Cron] Comment reply job triggered');

    return res.status(200).json({
      success: true,
      message: 'Cron job executed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Cron] Job error:', error);
    return res.status(500).json({ error: (error as Error).message });
  }
}
