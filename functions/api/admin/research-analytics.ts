/**
 * 研究报告数据分析 API
 * GET /api/admin/research-analytics?days=30
 * 认证方式：Bearer session_token
 *
 * 数据来源：report_interactions 表（与前端 reportInteractions.ts 写入一致）
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

// 报告元数据：与前端 RESEARCH_REPORTS 保持一致
const REPORT_META: Record<string, { title: string; region: string; category: string }> = {
  'bencao-cultural-revival-2026':  { title: '本草文明 · 创意复兴', region: '中国', category: '情报' },
  'japan-consumer-2026':           { title: '日本消费市场全息选品研究报告', region: '日本', category: '消费市场' },
  'japan-kampo-hegemony-2026':     { title: '汉方霸权 · 中医药出海战略情报报告', region: '日本', category: '情报' },
  'japan-dtc-site-handbook-2026':  { title: '日本 DTC 独立站设计搭建指导手册', region: '日本', category: '实操' },
  'loreal-nantong-delay-2026':     { title: '欧莱雅中国南通智能运营中心延期情报', region: '中国', category: '情报' },
  'syrebo-founder-briefing-2026':  { title: 'Syrebo 致创始人会前简报', region: '美国', category: '情报' },
  'tcm-global-2026':               { title: '中医药出海全息产业情报研究报告', region: '全球', category: '情报' },
  'usa-consumer-2026':             { title: '美国消费市场全息选品研究报告', region: '美国', category: '消费市场' },
  'china-global-handbook-2026':    { title: '中国企业出海全流程手册 2026', region: '全球', category: '实操' },
  'crnmc-ultra-pure-metals-2026':  { title: 'CRNMC 超纯金属战略情报', region: '加拿大', category: '情报' },
  'cross-border-ich-2026':         { title: '跨境中医药 ICH 合规情报', region: '全球', category: '监管' },
  'food-medicine-homology-2026':   { title: '食药同源出海全赛道产业尽调报告', region: '中国', category: '产业' },
};

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const session = await verifySession({ request, env });
  if (!session) return authResponse();

  const DB = getDB(env);
  if (!DB) {
    return new Response(JSON.stringify({
      overview: { todayPageviews: 0, todayVisitors: 0, totalPageviews: 0, totalUniqueVisitors: 0, totalCountries: 0, totalReports: Object.keys(REPORT_META).length, avgReadTime: null },
      reports: Object.entries(REPORT_META).map(([id, meta]) => ({ id, ...meta, pageviews: 0, unique_visitors: 0, countries_reached: 0, sources_count: 0, opens: 0, downloads: 0, externals: 0, refreshes: 0, back_to_hub: 0 })),
      trend: [],
      trafficSources: [],
      devices: [],
      recentVisitors: [],
      isRealData: false,
      warning: 'D1 database binding not configured',
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const today = new Date().toISOString().split('T')[0];

    // ── 1. 确保表存在 ──────────────────────────────────────────────────────
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS report_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT NOT NULL,
        session_id TEXT,
        visitor_id TEXT,
        ip TEXT,
        event_type TEXT NOT NULL,
        action TEXT NOT NULL,
        duration_seconds INTEGER,
        max_scroll INTEGER,
        country TEXT,
        region TEXT,
        city TEXT,
        created_at INTEGER NOT NULL
      )
    `).run();
    await DB.batch([
      DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ri_report ON report_interactions(report_id, created_at)`),
      DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ri_type ON report_interactions(event_type, created_at)`),
      DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ri_visitor ON report_interactions(visitor_id, report_id)`),
    ]);

    // ── 2. 各报告 PV/UV 统计 ───────────────────────────────────────────────
    // 注意：visitor_id 在 report_interactions 表中为空（前端未填写），
    // 所以 unique_visitors 必须用 ip 去重，与 report-interactions.ts 保持一致。
    const pvResult = await DB.prepare(`
      SELECT
        report_id,
        COUNT(*) as pageviews,
        COUNT(DISTINCT ip) as unique_visitors,
        COUNT(DISTINCT country) as countries_reached
      FROM report_interactions
      WHERE event_type = 'view' AND created_at >= ?
      GROUP BY report_id
      ORDER BY pageviews DESC
    `).bind(Date.now() - days * 24 * 60 * 60 * 1000).all() as { results: Array<{
      report_id: string;
      pageviews: number;
      unique_visitors: number;
      countries_reached: number;
    }> };

    // ── 3. 行为统计（likes, shares, downloads 等） ─────────────────────────
    const behaviorResult = await DB.prepare(`
      SELECT report_id, event_type, COUNT(*) as count
      FROM report_interactions
      WHERE created_at >= ?
      GROUP BY report_id, event_type
    `).bind(Date.now() - days * 24 * 60 * 60 * 1000).all() as { results: Array<{
      report_id: string;
      event_type: string;
      count: number;
    }> };

    // ── 4. 每日趋势（按报告分组） ─────────────────────────────────────────
    const trendResult = await DB.prepare(`
      SELECT date(created_at/1000, 'unixepoch') as date, report_id, COUNT(*) as pageviews
      FROM report_interactions
      WHERE event_type = 'view' AND created_at >= ?
      GROUP BY date(created_at/1000, 'unixepoch'), report_id
      ORDER BY date ASC
    `).bind(Date.now() - days * 24 * 60 * 60 * 1000).all() as { results: Array<{
      date: string;
      report_id: string;
      pageviews: number;
    }> };

    // ── 5. 总体数据 ───────────────────────────────────────────────────────
    const totalResult = await DB.prepare(`
      SELECT
        COUNT(*) as total_pageviews,
        COUNT(DISTINCT ip) as total_unique_visitors,
        COUNT(DISTINCT country) as total_countries
      FROM report_interactions
      WHERE event_type = 'view' AND created_at >= ?
    `).bind(Date.now() - days * 24 * 60 * 60 * 1000).first() as {
      total_pageviews: number;
      total_unique_visitors: number;
      total_countries: number;
    };

    const todayResult = await DB.prepare(`
      SELECT COUNT(*) as pageviews, COUNT(DISTINCT ip) as unique_visitors
      FROM report_interactions
      WHERE event_type = 'view' AND date(created_at/1000, 'unixepoch') = ?
    `).bind(today).first() as {
      pageviews: number;
      unique_visitors: number;
    };

    // ── 6. 近期访客列表 ──────────────────────────────────────────────────
    const recentVisitorsResult = await DB.prepare(`
      SELECT visitor_id, report_id, country, region, city, event_type, action, duration_seconds, created_at
      FROM report_interactions
      WHERE event_type IN ('view', 'read') AND created_at >= ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(Date.now() - days * 24 * 60 * 60 * 1000).all();

    // ── 7. 设备分布（从 visitor_id 无法直接判断，用 report_id 聚合） ─────
    const deviceResult = { results: [] as Array<{ device_type: string; pageviews: number }> };

    // ── 组装报告数据 ──────────────────────────────────────────────────────
    const pvMap = new Map((pvResult.results || []).map(r => [r.report_id, r]));
    const behaviorMap = new Map<string, Record<string, number>>();
    (behaviorResult.results || []).forEach(b => {
      const existing = behaviorMap.get(b.report_id) || {};
      existing[b.event_type] = b.count;
      behaviorMap.set(b.report_id, existing);
    });

    // 自动发现新报告（不在 REPORT_META 中的）
    const knownIds = new Set(Object.keys(REPORT_META));
    (pvResult.results || []).forEach(r => {
      if (!knownIds.has(r.report_id)) {
        REPORT_META[r.report_id] = { title: r.report_id, region: '未知', category: '未知' };
      }
    });

    const reports = Object.entries(REPORT_META).map(([id, meta]) => {
      const pv = pvMap.get(id) || { pageviews: 0, unique_visitors: 0, countries_reached: 0 };
      const behaviors = behaviorMap.get(id) || {};
      return {
        id,
        ...meta,
        pageviews: pv.pageviews || 0,
        unique_visitors: pv.unique_visitors || 0,
        countries_reached: pv.countries_reached || 0,
        sources_count: 0,
        opens: behaviors['view'] || 0,
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

    return new Response(JSON.stringify({
      overview: {
        todayPageviews: todayResult?.pageviews || 0,
        todayVisitors: todayResult?.unique_visitors || 0,
        totalPageviews: totalResult?.total_pageviews || 0,
        totalUniqueVisitors: totalResult?.total_unique_visitors || 0,
        totalCountries: totalResult?.total_countries || 0,
        totalReports: Object.keys(REPORT_META).length,
        avgReadTime: null,
      },
      reports,
      trend,
      trafficSources: [],
      devices: deviceResult.results || [],
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