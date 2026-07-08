-- 研究报告页访问记录表
CREATE TABLE IF NOT EXISTS research_pageviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  report_id TEXT NOT NULL,
  page_url TEXT,
  page_title TEXT,
  traffic_source TEXT,
  device_type TEXT,
  browser TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  website_id TEXT DEFAULT 'zxqconsulting',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 研究报告页内行为记录表（点击、下载等）
CREATE TABLE IF NOT EXISTS research_behaviors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  report_id TEXT NOT NULL,
  action TEXT NOT NULL,
  page_url TEXT,
  metadata TEXT,
  website_id TEXT DEFAULT 'zxqconsulting',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_rpv_report ON research_pageviews(report_id);
CREATE INDEX IF NOT EXISTS idx_rpv_created ON research_pageviews(created_at);
CREATE INDEX IF NOT EXISTS idx_rpv_visitor ON research_pageviews(visitor_id);
CREATE INDEX IF NOT EXISTS idx_rpv_website ON research_pageviews(website_id);
CREATE INDEX IF NOT EXISTS idx_rba_report ON research_behaviors(report_id);
CREATE INDEX IF NOT EXISTS idx_rba_visitor ON research_behaviors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_rba_action ON research_behaviors(action);
CREATE INDEX IF NOT EXISTS idx_rba_created ON research_behaviors(created_at);
