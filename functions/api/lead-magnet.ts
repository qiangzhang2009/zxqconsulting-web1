/**
 * Lead Magnet 下载留资 API
 * POST /api/lead-magnet
 *
 * 用户下载《35 国出海指南》时的留资
 * 1. 记录到本地后台
 * 2. 触发邮件培育序列 (Day 0 / Day 3 / Day 7 / Day 14)
 * 3. 返回下载链接
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  BACKEND_URL: string;
  RESEND_API_KEY: string;
}

interface LeadMagnetRequest {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  resource_slug?: string; // 比如 'tcm-global-guide-35-countries'
}

const DOWNLOAD_LINKS: Record<string, string> = {
  'tcm-global-guide-35-countries':
    'https://zxqconsulting.com/downloads/tcm-global-guide-35-countries.pdf',
};

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    const body: LeadMagnetRequest = await request.json();

    if (!body.email || !body.name) {
      return new Response(
        JSON.stringify({ success: false, error: 'name and email are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const slug = body.resource_slug || 'tcm-global-guide-35-countries';
    const downloadUrl = DOWNLOAD_LINKS[slug] || DOWNLOAD_LINKS['tcm-global-guide-35-countries'];

    // 获取客户端信息
    const cf = (request as any).cf || {};
    const ipAddress = cf.clientIp || '';
    const country = cf.country || '';
    const city = cf.city || '';

    // ============================================================
    // 1. 转发到本地后台 — 记录留资
    // ============================================================
    const backendUrl = env.BACKEND_URL || 'https://websites-admin.zxqconsulting.com';

    try {
      await fetch(`${backendUrl}/api/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'lead_magnet_download',
          tenant_slug: 'zxqconsulting',
          visitor_id: null,
          event_data: {
            form_name: 'lead_magnet_form',
            resource_slug: slug,
            fields: {
              name: body.name,
              email: body.email,
              company: body.company,
              phone: body.phone,
              ip_address: ipAddress,
              country,
              city,
            },
            submit_result: 'success',
          },
        }),
      });
    } catch (err) {
      console.error('[Lead Magnet] Backend forward failed:', err);
    }

    // ============================================================
    // 2. 触发邮件培育序列 (如果 RESEND_API_KEY 已配置)
    // ============================================================
    if (env.RESEND_API_KEY) {
      try {
        // Day 0: 立即发送 PDF 下载链接
        await sendEmail(env.RESEND_API_KEY, {
          to: body.email,
          subject: '《中医药出海35国国别指南》下载链接',
          html: buildDay0Email(body.name, downloadUrl),
        });

        // Day 3 / Day 7 / Day 14 通过 Resend Audiences 添加到培育列表
        await fetch('https://api.resend.com/audiences/nurture/leads', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: body.email,
            first_name: body.name,
            last_name: '',
            unsubscribed: false,
            data: {
              resource_slug: slug,
              source: 'lead_magnet',
              company: body.company || '',
              phone: body.phone || '',
              signup_date: new Date().toISOString(),
            },
          }),
        });
      } catch (err) {
        console.error('[Lead Magnet] Email send failed:', err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Download link sent',
        download_url: downloadUrl,
        email_sent: !!env.RESEND_API_KEY,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Lead Magnet] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ============================================================
// 邮件模板 — Day 0
// ============================================================
function buildDay0Email(name: string, downloadUrl: string): string {
  return `
<!doctype html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #07111a; color: #ffffff; padding: 32px;">
<div style="max-width: 600px; margin: 0 auto; background: #0d1f30; border-radius: 16px; padding: 40px;">
  <h1 style="font-size: 28px; margin: 0 0 16px;">${name} 您好,</h1>
  <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
    感谢您下载《中医药出海 35 国国别指南》。这份指南由岐黄四海团队历时 12 个月整理,覆盖日本、欧盟、美国、澳大利亚、东南亚等 35 个目标市场的准入政策、成本区间、渠道现状与风险提示。
  </p>
  <p style="text-align: center; margin: 32px 0;">
    <a href="${downloadUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #14b8a6); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600;">
      点击下载 PDF 指南
    </a>
  </p>
  <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
    <strong style="color: #10b981;">后续 14 天</strong>,您将陆续收到 3 封配套邮件:
  </p>
  <ul style="color: #cbd5e1; line-height: 1.8;">
    <li><strong>Day 3:</strong> 路径决策树详解 —— 药品 / 食品 / 化妆品该如何选择</li>
    <li><strong>Day 7:</strong> 重点 5 国进入策略深度分析</li>
    <li><strong>Day 14:</strong> 出海实战案例集 —— 真实项目的路径与结果</li>
  </ul>
  <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1; margin-top: 32px;">
    如果您希望跳过阅读阶段,直接进入决策环节,可以<a href="https://zxqconsulting.com/diagnose" style="color: #10b981;">点击这里开始 AI 诊断</a>。
  </p>
  <p style="font-size: 14px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 24px;">
    岐黄四海 QihuangSihai · 中医药出海决策操作系统<br/>
    <a href="https://zxqconsulting.com" style="color: #10b981;">zxqconsulting.com</a>
  </p>
</div>
</body>
</html>
  `;
}

// ============================================================
// Resend 邮件发送
// ============================================================
async function sendEmail(
  apiKey: string,
  options: { to: string; subject: string; html: string }
): Promise<void> {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'QihuangSihai <noreply@zxqconsulting.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    }),
  });
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