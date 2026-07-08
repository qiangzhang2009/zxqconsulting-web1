/**
 * 研究报告数据分析 API
 * GET /api/admin/research-analytics?days=30
 * 认证方式：Bearer session_token
 */

import { verifySession, authResponse, corsPreflight } from './auth';

interface Env {
  DB: D1Database;
  ADMIN_KV: KVNamespace;
}

export async function onRequestOptions() {
  return corsPreflight();
}

// 6 份报告的元数据（与 researchReports.ts 保持同步）
const REPORT_META: Record<string, { title: string; region: string; category: string }> = {
  'japan-consumer-2026':   { title: '日本消费市场全息选品研究报告', region: '日本', category: '消费市场' },
  'italy-channel-2026':    { title: '意大利针灸诊所获客渠道情报报告', region: '意大利', category: '渠道策略' },
  'eu-regulatory-2026':    { title: '欧盟医疗器械监管合规报告', region: '欧盟', category: '监管合规' },
  'sea-channel-2026':      { title: '东南亚渠道策略报告', region: '东南亚', category: '渠道策略' },
  'germany-channel-2026':  { title: '德国针灸市场渠道策略报告', region: '德国', category: '渠道策略' },
  'china-acupuncturist':   { title: '中国针灸师海外发展市场调研与决策建议报告', region: '全球', category: '市场调研' },
};

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const session = await verifySession({ request, env });
  if (!session) return authResponse();

  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // ── 1. 各报告 PV/UV 统计 ────────────────────────────────────────────
    const pvResult = await env.DB.prepare(`
      SELECT
        report_id,
        COUNT(*) as pageviews,
        COUNT(DISTINCT visitor_id) as unique_visitors,
        COUNT(DISTINCT country) as countries_reached,
        COUNT(DISTINCT traffic_source) as sources_count
      FROM research_pageviews
      WHERE website_id = ? AND created_at >= ?
      GROUP BY report_id
      ORDER BY pageviews DESC
    `).bind(websiteId, sinceDate).all() as { results: Array<{
      report_id: string;
      pageviews: number;
      unique_visitors: number;
      countries_reached: number;
      sources_count: number;
    }> };

    // ── 2. 各报告每日趋势 ────────────────────────────────────────────────
    const trendResult = await env.DB.prepare(`
      SELECT date(created_at) as date, report_id, COUNT(*) as pageviews
      FROM research_pageviews
      WHERE website_id = ? AND created_at >= ?
      GROUP BY date(created_at), report_id
      ORDER BY date ASC
    `).bind(websiteId, sinceDate).all() as { results: Array<{
      date: string;
      report_id: string;
      pageviews: number;
    }> };

    // ── 3. 各报告页内行为统计 ────────────────────────────────────────────
    const behaviorResult = await env.DB.prepare(`
      SELECT report_id, action, COUNT(*) as count
      FROM research_behaviors
      WHERE website_id = ? AND created_at >= ?
      GROUP BY report_id, action
    `).bind(websiteId, sinceDate).all() as { results: Array<{
      report_id: string;
      action: string;
      count: number;
    }> };

    // ── 4. 总体数据 ───────────────────────────────────────────────────────
    const totalResult = await env.DB.prepare(`
      SELECT
        COUNT(*) as total_pageviews,
        COUNT(DISTINCT visitor_id) as total_unique_visitors,
        COUNT(DISTINCT country) as total_countries
      FROM research_pageviews
      WHERE website_id = ? AND created_at >= ?
    `).bind(websiteId, sinceDate).first() as {
      total_pageviews: number;
      total_unique_visitors: number;
      total_countries: number;
    };

    // ── 5. 今日数据 ───────────────────────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const todayResult = await env.DB.prepare(`
      SELECT COUNT(*) as pageviews, COUNT(DISTINCT visitor_id) as unique_visitors
      FROM research_pageviews
      WHERE website_id = ? AND date(created_at) = ?
    `).bind(websiteId, today).first() as {
      pageviews: number;
      unique_visitors: number;
    };

    // ── 6. 流量来源分布 ──────────────────────────────────────────────────
    const sourcesResult = await env.DB.prepare(`
      SELECT traffic_source, COUNT(*) as pageviews, COUNT(DISTINCT visitor_id) as visitors
      FROM research_pageviews
      WHERE website_id = ? AND created_at >= ?
      GROUP BY traffic_source
      ORDER BY pageviews DESC
      LIMIT 6
    `).bind(websiteId, sinceDate).all() as { results: Array<{
      traffic_source: string;
      pageviews: number;
      visitors: number;
    }> };

    // ── 7. 设备分布 ──────────────────────────────────────────────────────
    const deviceResult = await env.DB.prepare(`
      SELECT device_type, COUNT(*) as pageviews
      FROM research_pageviews
      WHERE website_id = ? AND created_at >= ?
      GROUP BY device_type
      ORDER BY pageviews DESC
    `).bind(websiteId, sinceDate).all() as { results: Array<{
      device_type: string;
      pageviews: number;
    }> };

    // ── 8. 近期访客列表 ──────────────────────────────────────────────────
    const recentVisitorsResult = await env.DB.prepare(`
      SELECT visitor_id, report_id, country, region, city, device_type, browser, traffic_source, created_at
      FROM research_pageviews
      WHERE website_id = ? AND created_at >= ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(websiteId, sinceDate).all();

    // ── 组装报告数据 ─────────────────────────────────────────────────────
    const reports = REPORT_META;
    const pvMap = new Map((pvResult.results || []).map(r => [r.report_id, r]));

    const reportStats = Object.entries(reports).map(([id, meta]) => {
      const pv = pvMap.get(id);
      const behaviors = (behaviorResult.results || [])
        .filter(b => b.report_id === id)
        .reduce((acc, b) => { acc[b.action] = b.count; return acc; }, {} as Record<string, number>);

      return {
        id,
        ...meta,
        pageviews: pv?.pageviews || 0,
        unique_visitors: pv?.unique_visitors || 0,
        countries_reached: pv?.countries_reached || 0,
        sources_count: pv?.sources_count || 0,
        // 行为数据
        opens: behaviors['open'] || 0,
        downloads: behaviors['download'] || 0,
        externals: behaviors['external'] || 0,
        refreshes: behaviors['refresh'] || 0,
        back_to_hub: behaviors['back'] || 0,
      };
    }).sort((a, b) => b.pageviews - a.pageviews);

    // ── 组装趋势数据 ──────────────────────────────────────────────────────
    const trendMap = new Map<string, Record<string, number>>();
    (trendResult.results || []).forEach(r => {
      if (!trendMap.has(r.date)) trendMap.set(r.date, {});
      trendMap.get(r.date)![r.report_id] = r.pageviews;
    });
    const trend = Array.from(trendMap.entries())
      .map(([date, byReport]) => ({ date, ...byReport }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const todayPageviews = todayResult?.pageviews || 0;
    const todayVisitors = todayResult?.unique_visitors || 0;
    const totalPageviews = totalResult?.total_pageviews || 0;
    const totalUniqueVisitors = totalResult?.total_unique_visitors || 0;
    const totalCountries = totalResult?.total_countries || 0;

    return new Response(JSON.stringify({
      // 概览 KPI
      overview: {
        todayPageviews,
        todayVisitors,
        totalPageviews,
        totalUniqueVisitors,
        totalCountries,
        totalReports: Object.keys(reports).length,
        avgReadTime: null, // 需要在研究页内 JS 计算后上报，暂不支持
      },
      // 各报告明细
      reports: reportStats,
      // 趋势
      trend,
      // 流量来源
      trafficSources: sourcesResult.results || [],
      // 设备分布
      devices: deviceResult.results || [],
      // 近期访客
      recentVisitors: recentVisitorsResult.results || [],
      isRealData: true,
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Research Analytics error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
