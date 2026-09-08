/**
 * AI 翻译自动化 API
 * POST /api/translate
 *
 * 用于自动翻译 Tier 2 语言(ko, de, fr, es, pt)的内容
 * 基于 DeepSeek API,通过 zh.json 源文件翻译
 *
 * 调用方式:
 *   POST /api/translate
 *   Body: { source_lang, target_lang, content }
 *
 * 内部使用:
 *   - 自动缓存到 KV(避免重复翻译成本)
 *   - 后台 Cron 触发: 每周一次批量同步新内容
 */

interface Env {
  DEEPSEEK_API_KEY: string;
  TRANSLATE_CACHE: KVNamespace; // 可选
}

interface TranslateRequest {
  source_lang?: string;
  target_lang: string;
  content: Record<string, unknown>; // i18n namespace object
}

interface TranslateResponse {
  success: boolean;
  translated?: Record<string, unknown>;
  cached?: boolean;
  error?: string;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    const body: TranslateRequest = await request.json();
    const { source_lang = 'zh', target_lang, content } = body;

    if (!target_lang || !content) {
      return new Response(
        JSON.stringify({ success: false, error: 'target_lang and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ============================================================
    // 1. 检查 KV 缓存
    // ============================================================
    if (env.TRANSLATE_CACHE) {
      const cacheKey = `translate:${source_lang}:${target_lang}:${hashContent(content)}`;
      const cached = await env.TRANSLATE_CACHE.get(cacheKey, 'json');
      if (cached) {
        return new Response(JSON.stringify({ success: true, translated: cached, cached: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // ============================================================
    // 2. 调用 DeepSeek API 翻译
    // ============================================================
    if (!env.DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'DEEPSEEK_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `你是一位专业的国际化本地化翻译专家。请将以下 JSON 对象的所有值翻译为${targetLangName(target_lang)}(${target_lang})。
要求:
1. 保持 JSON 结构与键名完全一致,只翻译值
2. 保留所有占位符(如 {{n}}, {count})与 HTML 标签
3. 翻译要地道、符合目标语言表达习惯
4. 专业术语要准确(如 "TCM" 应翻译为当地对中医的标准说法)
5. 输出必须是合法 JSON

输入 JSON:
${JSON.stringify(content, null, 2)}

只输出翻译后的 JSON,不要其他说明。`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a professional i18n localization translator.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const translatedText = aiResponse.choices?.[0]?.message?.content;

    if (!translatedText) {
      throw new Error('Empty AI response');
    }

    // 解析 JSON
    let translated: Record<string, unknown>;
    try {
      // 去除 markdown 包裹
      const cleaned = translatedText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      translated = JSON.parse(cleaned);
    } catch (err) {
      throw new Error(`Failed to parse AI response as JSON: ${err}`);
    }

    // ============================================================
    // 3. 缓存翻译结果(7 天)
    // ============================================================
    if (env.TRANSLATE_CACHE) {
      const cacheKey = `translate:${source_lang}:${target_lang}:${hashContent(content)}`;
      await env.TRANSLATE_CACHE.put(cacheKey, JSON.stringify(translated), {
        expirationTtl: 7 * 24 * 60 * 60,
      });
    }

    return new Response(JSON.stringify({ success: true, translated, cached: false }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Translate] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function targetLangName(code: string): string {
  const map: Record<string, string> = {
    en: 'English',
    zh: 'Chinese (Simplified)',
    ja: 'Japanese',
    ko: 'Korean',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    pt: 'Portuguese',
    ar: 'Arabic',
    ru: 'Russian',
    vi: 'Vietnamese',
    th: 'Thai',
    id: 'Indonesian',
    ms: 'Malay',
    it: 'Italian',
    lo: 'Lao',
  };
  return map[code] || code;
}

function hashContent(content: Record<string, unknown>): string {
  // 简单的内容哈希,用于缓存 key
  const str = JSON.stringify(content);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
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