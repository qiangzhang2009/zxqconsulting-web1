/**
 * 通知中心 API
 *
 * GET /api/admin/notifications
 *
 * 从真实事件派生通知（不是硬编码）:
 * - 新提交线索 (submissions, status='new', created_at 近 7 天)
 * - 新 AI 诊断报告 (diagnosis_reports, 近 7 天)
 * - 新留言待审 (comments / report_comments, status='pending' 或 'visible' 近 7 天)
 * - 新客户采集 (client_intake, status='new', 近 7 天)
 *
 * 返回与前端 NotificationPanel 期望一致
 */

import { verifySession, authResponse, corsPreflight, getDB } from './auth';

interface Env {
  DB?: D1Database;
  zxqconsulting_comments?: D1Database;
  ADMIN_KV?: KVNamespace;
}

interface NotificationItem {
  id: string;
  type: 'lead' | 'report' | 'comment' | 'client';
  title: string;
  description: string;
  href: string;
  icon: 'inbox' | 'brain' | 'message' | 'user';
  timestamp: string;
  unread: boolean;
}

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const session = await verifySession({ request, env });
  if (!session) return authResponse();

  const DB = getDB(env);
  if (!DB) return json({ success: true, items: [], unread_count: 0 });

  try {
    const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const items: NotificationItem[] = [];

    // ── 1. 新提交线索 ──
    try {
      const subs = await DB.prepare(`
        SELECT id, name, company, created_at FROM submissions
        WHERE website_id = ? AND status = 'new' AND created_at >= ?
        ORDER BY created_at DESC LIMIT 5
      `).bind('zxqconsulting', since).all() as {
        results: Array<{ id: string; name: string; company: string | null; created_at: string }>;
      };
      for (const s of subs.results || []) {
        items.push({
          id: `lead-${s.id}`,
          type: 'lead',
          title: `新线索 · ${s.name || '匿名访客'}`,
          description: s.company ? `公司: ${s.company}` : '来自网站表单',
          href: '/admin/submissions',
          icon: 'inbox',
          timestamp: String(s.created_at),
          unread: true,
        });
      }
    } catch (e) { console.warn('[notif] submissions:', (e as Error).message); }

    // ── 2. 新 AI 诊断报告 ──
    try {
      const reports = await DB.prepare(`
        SELECT id, market_name, market_id, country, created_at FROM diagnosis_reports
        WHERE website_id = ? AND created_at >= ?
        ORDER BY created_at DESC LIMIT 5
      `).bind('zxqconsulting', since).all() as {
        results: Array<{ id: string; market_name: string | null; market_id: string; country: string | null; created_at: string }>;
      };
      for (const r of reports.results || []) {
        items.push({
          id: `report-${r.id}`,
          type: 'report',
          title: `新 AI 诊断 · ${r.market_name || r.market_id}`,
          description: r.country ? `目标市场 ${r.country}` : '来自 AI 诊断',
          href: '/admin/diagnoses',
          icon: 'brain',
          timestamp: String(r.created_at),
          unread: true,
        });
      }
    } catch (e) { console.warn('[notif] reports:', (e as Error).message); }

    // ── 3. 网站评论 ──
    try {
      const comments = await DB.prepare(`
        SELECT id, user_name, content, timestamp FROM comments
        WHERE status = 'pending' AND timestamp >= ?
        ORDER BY timestamp DESC LIMIT 3
      `).bind(since).all() as {
        results: Array<{ id: string; user_name: string; content: string; timestamp: string }>;
      };
      for (const c of comments.results || []) {
        items.push({
          id: `comment-${c.id}`,
          type: 'comment',
          title: `${c.user_name || '匿名'} 提交了新评论`,
          description: (c.content || '').slice(0, 50),
          href: '/admin/comments',
          icon: 'message',
          timestamp: String(c.timestamp),
          unread: true,
        });
      }
    } catch (e) { console.warn('[notif] comments:', (e as Error).message); }

    // ── 4. 新客户采集 ──
    try {
      const intake = await DB.prepare(`
        SELECT id, company_name, contact_name, created_at FROM client_intake
        WHERE status = 'new' AND created_at >= ?
        ORDER BY created_at DESC LIMIT 3
      `).bind(since).all() as {
        results: Array<{ id: number; company_name: string | null; contact_name: string | null; created_at: string }>;
      };
      for (const c of intake.results || []) {
        items.push({
          id: `client-${c.id}`,
          type: 'client',
          title: `客户采集 · ${c.company_name || c.contact_name || '新企业'}`,
          description: c.contact_name ? `联系人 ${c.contact_name}` : '完整企业信息已提交',
          href: '/admin/client-intake',
          icon: 'user',
          timestamp: String(c.created_at),
          unread: true,
        });
      }
    } catch (e) { console.warn('[notif] client_intake:', (e as Error).message); }

    // 按时间倒序，最多 8 条
    items.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    const top = items.slice(0, 8);

    return json({
      success: true,
      items: top,
      unread_count: items.length,
    });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
