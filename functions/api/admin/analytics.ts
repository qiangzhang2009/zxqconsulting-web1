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

import { verifySession, authResponse, corsPreflight } from './auth';

interface Env {
  DB: D1Database;
  ADMIN_KV: KVNamespace;
}

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const session = await verifySession({ request, env });
  if (!session) return authResponse();

  try {
    const url = new URL(request.url);
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const days = parseInt(url.searchParams.get('days') || '30');

    const today = new Date().toISOString().split('T')[0];
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const todayVisitorsResult = await env.DB.prepare(
      `SELECT COUNT(DISTINCT visitor_id) as count FROM visitors WHERE website_id = ? AND date(created_at) >= ?`
    ).bind(websiteId, today).first() as { count: number };

    const todaySubmissionsResult = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM submissions WHERE website_id = ? AND date(created_at) >= ?`
    ).bind(websiteId, today).first() as { count: number };

    const totalVisitorsResult = await env.DB.prepare(
      `SELECT COUNT(DISTINCT visitor_id) as count FROM visitors WHERE website_id = ?`
    ).bind(websiteId).first() as { count: number };

    const totalSubmissionsResult = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM submissions WHERE website_id = ?`
    ).bind(websiteId).first() as { count: number };

    const trendResult = await env.DB.prepare(`
      SELECT date(created_at) as date, COUNT(DISTINCT visitor_id) as visitors
      FROM visitors
      WHERE website_id = ? AND created_at >= ?
      GROUP BY date(created_at)
      ORDER BY date
    `).bind(websiteId, sinceDate).all() as { results: Array<{ date: string; visitors: number }> };

    const submissionsTrendResult = await env.DB.prepare(`
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
      const existing = trendMap.get(r.date) || { visitors: 0 };
      existing.submissions = r.submissions;
      trendMap.set(r.date, existing);
    });

    const trend = Array.from(trendMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topPagesResult = await env.DB.prepare(`
      SELECT source_page as page, COUNT(*) as views
      FROM submissions
      WHERE website_id = ? AND source_page IS NOT NULL AND created_at >= ?
      GROUP BY source_page
      ORDER BY views DESC
      LIMIT 10
    `).bind(websiteId, sinceDate).all() as { results: Array<{ page: string; views: number }> };

    const topCountriesResult = await env.DB.prepare(`
      SELECT country, COUNT(DISTINCT visitor_id) as visitors
      FROM visitors
      WHERE website_id = ? AND country IS NOT NULL
      GROUP BY country
      ORDER BY visitors DESC
      LIMIT 10
    `).bind(websiteId).all() as { results: Array<{ country: string; visitors: number }> };

    const topSourcesResult = await env.DB.prepare(`
      SELECT source, COUNT(DISTINCT visitor_id) as count
      FROM visitors
      WHERE website_id = ? AND source IS NOT NULL AND source != ''
      GROUP BY source
      ORDER BY count DESC
      LIMIT 6
    `).bind(websiteId).all() as { results: Array<{ source: string; count: number }> };

    const statusBreakdownResult = await env.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM submissions
      WHERE website_id = ?
      GROUP BY status
    `).bind(websiteId).all() as { results: Array<{ status: string; count: number }> };

    const statusBreakdown: Record<string, number> = {};
    statusBreakdownResult.results?.forEach(r => {
      statusBreakdown[r.status] = r.count;
    });

    const recentReportsResult = await env.DB.prepare(`
      SELECT id, market_id, market_name, market_name_en, category, product_type,
             diagnosis_input, diagnosis_report, qualification_decision,
             country, region, visitor_id, created_at
      FROM diagnosis_reports
      WHERE website_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).bind(websiteId).all();

    const recentReports = (recentReportsResult.results || []).map((r: any) => {
      let di = {}, dr = {}, qd = {};
      try { di = r.diagnosis_input ? JSON.parse(r.diagnosis_input) : {}; } catch(e) { /* ignore malformed JSON */ }
      try { dr = r.diagnosis_report ? JSON.parse(r.diagnosis_report) : {}; } catch(e) { /* ignore malformed JSON */ }
      try { qd = r.qualification_decision ? JSON.parse(r.qualification_decision) : {}; } catch(e) { /* ignore malformed JSON */ }
      return { ...r, diagnosis_input: di, diagnosis_report: dr, qualification_decision: qd };
    });

    const topMarketsResult = await env.DB.prepare(`
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

    return new Response(JSON.stringify({
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
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
