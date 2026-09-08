/**
 * 统计分析 API - Cloudflare D1 版本
 * GET /api/admin/analytics?website_id=&days=30
 * 认证方式：Bearer session_token（登录后获取）
 *
 * 返回数据:
 * - 今日/总 KPI（访客、提交、评论、诊断）
 * - 趋势数据（访客+提交 按日）
 * - 流量来源分布
 * - 设备分布（桌面/移动/平板）
 * - 浏览器分布
 * - 国家/地区分布
 * - 热门页面
 * - 状态分布
 * - 最近报告
 * - 热门市场
 */

import { verifySession, authResponse, corsPreflight, getDB } from './auth';

interface Env {
  DB?: D1Database;
  zxqconsulting_comments?: D1Database;
  ADMIN_KV?: KVNamespace;
}

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const session = await verifySession({ request, env });
  if (!session) return authResponse();

  const DB = getDB(env);
  if (!DB) {
    return jsonResponse({
      today: { visitors: 0, submissions: 0 },
      total: { visitors: 0, submissions: 0, conversionRate: 0 },
      trend: [],
      topPages: [],
      topCountries: [],
      topSources: [],
      topMarkets: [],
      statusBreakdown: { new: 0, contacted: 0, qualified: 0, closed: 0 },
      recentReports: [],
      warning: 'D1 database binding not configured',
    });
  }

  try {
    const url = new URL(request.url);
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const days = parseInt(url.searchParams.get('days') || '30');

    const today = new Date().toISOString().split('T')[0];
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const todayVisitorsResult = await DB.prepare(
      `SELECT COUNT(DISTINCT visitor_id) as count FROM visitors WHERE website_id = ? AND date(created_at) >= ?`
    ).bind(websiteId, today).first() as { count: number };

    const todaySubmissionsResult = await DB.prepare(
      `SELECT COUNT(*) as count FROM submissions WHERE website_id = ? AND date(created_at) >= ?`
    ).bind(websiteId, today).first() as { count: number };

    const totalVisitorsResult = await DB.prepare(
      `SELECT COUNT(DISTINCT visitor_id) as count FROM visitors WHERE website_id = ?`
    ).bind(websiteId).first() as { count: number };

    const totalSubmissionsResult = await DB.prepare(
      `SELECT COUNT(*) as count FROM submissions WHERE website_id = ?`
    ).bind(websiteId).first() as { count: number };

    const trendResult = await DB.prepare(`
      SELECT date(created_at) as date, COUNT(DISTINCT visitor_id) as visitors
      FROM visitors
      WHERE website_id = ? AND created_at >= ?
      GROUP BY date(created_at)
      ORDER BY date
    `).bind(websiteId, sinceDate).all() as { results: Array<{ date: string; visitors: number }> };

    const submissionsTrendResult = await DB.prepare(`
      SELECT date(created_at) as date, COUNT(*) as submissions
      FROM submissions
      WHERE website_id = ? AND created_at >= ?
      GROUP BY date(created_at)
      ORDER BY date
    `).bind(websiteId, sinceDate).all() as { results: Array<{ date: string; submissions: number }> };

    const trendMap = new Map<string, { visitors: number; submissions: number }>();
    trendResult.results?.forEach(r => {
      trendMap.set(r.date, { visitors: r.visitors || 0, submissions: 0 });
    });
    submissionsTrendResult.results?.forEach(r => {
      const existing = trendMap.get(r.date);
      if (existing) existing.submissions = r.submissions || 0;
      else trendMap.set(r.date, { visitors: 0, submissions: r.submissions || 0 });
    });
    const trend = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));

    // 实际 schema: visitors 表只有 source 列，没有 page_url/source_url
    const topPagesResult = { results: [] as Array<{ page_url: string; visits: number }> };

    const topCountriesResult = await DB.prepare(`
      SELECT country, COUNT(DISTINCT visitor_id) as visitors
      FROM visitors
      WHERE website_id = ? AND created_at >= ? AND country IS NOT NULL AND country != ''
      GROUP BY country
      ORDER BY visitors DESC
      LIMIT 10
    `).bind(websiteId, sinceDate).all() as { results: Array<{ country: string; visitors: number }> };

    const topSourcesResult = await DB.prepare(`
      SELECT source, COUNT(*) as visits
      FROM visitors
      WHERE website_id = ? AND created_at >= ? AND source IS NOT NULL AND source != ''
      GROUP BY source
      ORDER BY visits DESC
      LIMIT 10
    `).bind(websiteId, sinceDate).all() as { results: Array<{ source: string; visits: number }> };

    const statusBreakdownResult = await DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM submissions
      WHERE website_id = ?
      GROUP BY status
    `).bind(websiteId).all() as { results: Array<{ status: string; count: number }> };

    const statusBreakdown: Record<string, number> = { new: 0, contacted: 0, qualified: 0, closed: 0 };
    statusBreakdownResult.results?.forEach(r => {
      statusBreakdown[r.status] = r.count;
    });

    const recentReportsResult = await DB.prepare(`
      SELECT * FROM diagnosis_reports
      WHERE website_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(websiteId).all() as { results: any[] };

    const recentReports = (recentReportsResult.results || []).map(r => {
      let di = {}, dr = {}, qd = {};
      try { di = r.diagnosis_input ? JSON.parse(r.diagnosis_input) : {}; } catch(e) { /* ignore malformed JSON */ }
      try { dr = r.diagnosis_report ? JSON.parse(r.diagnosis_report) : {}; } catch(e) { /* ignore malformed JSON */ }
      try { qd = r.qualification_decision ? JSON.parse(r.qualification_decision) : {}; } catch(e) { /* ignore malformed JSON */ }
      return { ...r, diagnosis_input: di, diagnosis_report: dr, qualification_decision: qd };
    });

    const topMarketsResult = await DB.prepare(`
      SELECT market_id, market_name, COUNT(*) as count
      FROM diagnosis_reports
      WHERE website_id = ? AND market_name IS NOT NULL
      GROUP BY market_id, market_name
      ORDER BY count DESC
      LIMIT 10
    `).bind(websiteId).all() as { results: Array<{ market_id: string; market_name: string; count: number }> };

    const totalV = totalVisitorsResult?.count || 0;
    const totalS = totalSubmissionsResult?.count || 0;
    const conversionRate = totalV > 0 ? Number(((totalS / totalV) * 100).toFixed(2)) : 0;

    return jsonResponse({
      today: {
        visitors: todayVisitorsResult?.count || 0,
        submissions: todaySubmissionsResult?.count || 0
      },
      total: {
        visitors: totalV,
        submissions: totalS,
        conversionRate
      },
      trend,
      topPages: topPagesResult.results || [],
      topCountries: topCountriesResult.results || [],
      topSources: topSourcesResult.results || [],
      topMarkets: topMarketsResult.results || [],
      statusBreakdown,
      recentReports
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return jsonResponse({ error: (error as Error).message }, 500);
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}