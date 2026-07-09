/**
 * 市场调研范例
 *
 * 在这里新增研究成果。
 * - id: 唯一 slug，用作路由参数
 * - href: 报告文件路径（public 下，部署后可直接访问）
 * - fullHref: 可选完整版入口，缺省与 href 相同
 * - date / region / category: 列表卡片展示用
 * - i18n key: 文档内读 page.research.report_<id>_*；缺省会 fallback 到 fields.*
 */
export type ResearchReport = {
  id: string;
  title: string;
  subtitle: string;
  date: string; // YYYY-MM-DD
  region: string; // 例如：日本 / 欧洲 / 东南亚
  category: string; // 例如：选品 / 监管 / 渠道
  readMinutes: number;
  chapters: number;
  href: string; // 已发布的 HTML 文件
  fullHref?: string;
  highlights: string[]; // 报告亮点，3-5 条
  metrics?: { label: string; value: string }[]; // KPI 数字
  cover?: string; // 列表卡片缩略图（可选）
};

export const RESEARCH_REPORTS: ResearchReport[] = [
  {
    id: 'bencao-cultural-revival-2026',
    title: '本草文明 · 创意复兴',
    subtitle: '中医药文创产业战略全景报告 — 十二大战略维度 · 五十个核心洞察 · 解码万亿级市场',
    date: '2026-07-09',
    region: '中国',
    category: '情报',
    readMinutes: 55,
    chapters: 12,
    href: '/_reports/bencao-cultural-revival-2026.html',
    highlights: [
      '市场规模 4,820 亿元(+23.5% YoY) · 2028 年突破 1.24 万亿,三年 CAGR 28.7%',
      '出海覆盖 89 国 · 日韩 / 东南亚 / 北美占 74% · TikTok 中医药标签破 480 亿次',
      '本草美妆 1,205 亿(占 25%) · TOP10 IP 授权费 / 长尾 IP 47 倍断层',
      '数字文创增速 +180% · 本草 + 茶饮新开 5.8 万家 · AI 设计工具渗透 47%',
      '政策窗口期 2025-2030 · 国家级补贴累计 320 亿已落地',
    ],
    metrics: [
      { label: '市场规模', value: '4,820 亿' },
      { label: '出海国家', value: '89 个' },
      { label: '本草美妆', value: '1,205 亿' },
      { label: '数字文创增速', value: '+180%' },
    ],
  },
  {
    id: 'japan-kampo-hegemony-2026',
    title: '汉方霸权 · 中医药出海战略情报报告',
    subtitle: '解码日本如何收割全球中药市场 — 中医药出海的十二道破局处方与十年战略路线图',
    date: '2026-07-08',
    region: '日本',
    category: '情报',
    readMinutes: 50,
    chapters: 6,
    href: '/_reports/japan-kampo-hegemony-2026.html',
    highlights: [
      '日本汉方药占全球高端市场 90% / OTC 汉方制剂 100% / 中国品牌海外渗透仅 0.3%',
      '汉方帝国五重护城河：标准 · 循证 · 品牌 · 渠道 · 监管的飞轮效应',
      '中日韩三国中医药产业横向对比 · 中国仅 35 分 vs 日本 88 分',
      '12 道可执行破局处方 · 4 象限作战地图（国家战略 / 产业基础 / 品牌资产 / 渠道战术）',
      '十年三阶段路线图：2035 年中国全球中药份额 2% → 25%+',
    ],
    metrics: [
      { label: '全球中药市场', value: '$1,247 亿' },
      { label: '日本汉方份额', value: '90%' },
      { label: '中国品牌海外渗透', value: '0.3%' },
      { label: '处方数', value: '12 道' },
    ],
  },
  {
    id: 'japan-dtc-site-handbook-2026',
    title: '中医出海独立站设计搭建指导手册',
    subtitle: '全球 DTC 品牌方法论：从阴阳五行到 Shopify Plus，2026 年独立站设计、转化与合规全指南',
    date: '2026-07-08',
    region: '全球',
    category: '全流程',
    readMinutes: 50,
    chapters: 9,
    href: '/_reports/japan-dtc-site-handbook-2026.html',
    highlights: [
      '9 大章节 · 50+ 标杆数据点 · 30+ 设计组件 · 12 项合规清单',
      '12 个头部品牌拆解：Yinova · WTHN · ORA · Solstice · Cha Ling 等',
      '视觉设计系统：三套东方色彩板 · 中西字体混排 · 视觉符号国际化演绎',
      '技术架构：Shopify Plus · Headless · SEO/GEO/AEO 三引擎 · 跨境支付物流',
      '翻译矩阵：38 个缩写速查 · 中医核心概念 Western-ready 翻译系统',
    ],
    metrics: [
      { label: '全球TCM市场', value: 'USD 282B' },
      { label: 'CAGR', value: '+6.87%' },
      { label: 'DTC毛利率', value: '70%' },
      { label: '北美溢价意愿', value: '73%' },
    ],
  },
  {
    id: 'china-global-handbook-2026',
    title: '中国企业出海全流程手册',
    subtitle: '完整系统化操作指南：8大阶段、100+关键环节、500+执行细节',
    date: '2026-07-07',
    region: '全球',
    category: '全流程',
    readMinutes: 60,
    chapters: 8,
    href: '/_reports/china-global-handbook-2026.html',
    highlights: [
      '8大核心阶段：从战略规划到持续运营全覆盖',
      '100+关键环节：法律合规、税务筹划、本地化运营',
      '500+执行细节：含服务商推荐与时间线参考',
      '全行业全规模适用：制造业/电商/App/消费品等',
    ],
    metrics: [
      { label: '核心阶段', value: '8' },
      { label: '关键环节', value: '100+' },
      { label: '执行细节', value: '500+' },
      { label: '服务领域', value: '12' },
    ],
  },
  {
    id: 'japan-2026',
    title: '日本消费市场全息选品研究报告',
    subtitle: '基于 4,691 条日语一手 UGC 数据的战略级选品决策框架',
    date: '2026-07-04',
    region: '日本',
    category: '选品',
    readMinutes: 45,
    chapters: 12,
    href: '/_reports/japan-consumer-2026.html?v=2',
    highlights: [
      '4,691 条日语一手 UGC 数据 · 量化人群与场景',
      'Top 30 选品清单 · 含价格带 / 人群 / 渠道 / 合规',
      '关东 × 关西区域差异战略 · 36 月趋势研判',
    ],
    metrics: [
      { label: '一手 UGC 样本', value: '4,691' },
      { label: '选品条目', value: 'Top 30' },
      { label: '对标品牌', value: '40' },
      { label: '趋势预测', value: '36 月 / 8 大' },
    ],
  },
  {
    id: 'syrebo-founder-briefing-2026',
    title: 'Syrebo · 赛道深度尽调与机会地图',
    subtitle: '致 Syrebo 创始人的会前简报 — 产品矩阵、全球坐标、监管时钟与定价金矿',
    date: '2026-07-06',
    region: '全球',
    category: '尽调',
    readMinutes: 25,
    chapters: 8,
    href: '/_reports/syrebo-founder-briefing-2026.html',
    highlights: [
      '产品矩阵 8 个章节 · 监管分水岭年诊断',
      '$350 → $18,000 定价金矿 · 全球玩家坐标',
      '社媒 + 官网实地诊断 · 3 个开放问题',
    ],
    metrics: [
      { label: '国家覆盖', value: '80+' },
      { label: '医院装机', value: '4,000+' },
      { label: '监管证卡', value: 'FDA+CE+NMPA' },
      { label: '章节', value: '8' },
    ],
  },
  {
    id: 'crnmc-ultra-pure-metals-2026',
    title: 'CRNMC · 超高纯金属行业赛道深度报告',
    subtitle: '工业隐形冠军赛道：行业全景、寡头格局、标杆拆解、CRNMC 战略路线图',
    date: '2026-07-06',
    region: '中国',
    category: '赛道',
    readMinutes: 30,
    chapters: 10,
    href: '/_reports/crnmc-ultra-pure-metals-2026.html',
    highlights: [
      '6 大下游赛道 · 半导体 / OLED / 航天 / 光伏 / 医疗 / 量子计算',
      '全球 4 家中亚洲唯一量产 · 92% 寡头格局拆解',
      'CRNMC SWOT 4×4 + 12/36/60 月战略路线图',
    ],
    metrics: [
      { label: '全球市场', value: '$1,000 亿' },
      { label: 'CAGR', value: '7.5%' },
      { label: '钽出口涨幅', value: '+47%' },
      { label: '章节', value: '10' },
    ],
  },
  {
    id: 'loreal-nantong-delay-2026',
    title: '欧莱雅中国南通智能运营中心延期情报研究报告',
    subtitle: '南通项目从"2024动工/2025投运"延期至"2026下半年启动"的事实核实、驱动因素与战略影响',
    date: '2026-07-06',
    region: '中国',
    category: '情报',
    readMinutes: 20,
    chapters: 6,
    href: '/_reports/loreal-nantong-delay-2026.html',
    highlights: [
      '"延期"事实核实 · 2026年4-6月官方多渠道确认推进',
      '延期2年：原计划2024动工→实际最早2027-2028投运',
      '驱动因素分析：战略重组、电商增速放缓、土地规划审批',
    ],
    metrics: [
      { label: '延期幅度', value: '约 2 年' },
      { label: '覆盖时间窗', value: '2023-2026' },
      { label: '情报来源', value: '12+' },
      { label: '章节', value: '6' },
    ],
  },
  {
    id: 'usa-consumer-2026',
    title: '美国消费市场全息选品研究报告',
    subtitle: '基于 28 个同行案例 + 60 单元格热力图的 Etsy + Amazon 跨境选品决策框架',
    date: '2026-07-06',
    region: '北美',
    category: '选品',
    readMinutes: 40,
    chapters: 16,
    href: '/_reports/usa-consumer-2026.html',
    highlights: [
      '$1.2T 美国 EC 市场 · De Minimis 终结后供给侧重组',
      '12 赛道 × 5 场景热力图 · 微型粘土珠宝 / 刻字个性化首饰双主推',
      '5 窗口 roadmap：BF / CM / Mother\'s Day / Easter / Graduation',
    ],
    metrics: [
      { label: '美国 EC 规模', value: '$1.2T' },
      { label: 'De Minimis', value: '已停征' },
      { label: '同行案例', value: 'n=28' },
      { label: '章节', value: '16' },
    ],
  },
  {
    id: 'tcm-global-2026',
    title: '中医药出海全息产业情报研究报告',
    subtitle: '10 大章节覆盖赛道全景、全球区域市场格局、产业链结构、合规图谱、商业模式、玩家图谱与趋势研判',
    date: '2026-07-03',
    region: '全球',
    category: '情报',
    readMinutes: 60,
    chapters: 10,
    href: '/_reports/tcm-global-2026.html',
    highlights: [
      '10 大章节 · 50+ 子章节 · 产业链结构 / 合规图谱 / 玩家图谱',
      '北美 / 欧盟 / 东南亚 / 澳新 / 日本区域市场深度分析',
      'AI 中医辨证 / 跨境远程诊疗 / 数字疗法 / 区块链溯源等前沿趋势',
    ],
    metrics: [
      { label: '总章节', value: '10 大章' },
      { label: '覆盖区域', value: '6 大区' },
      { label: '商业模式', value: '5 种' },
      { label: '趋势研判', value: '10 大方向' },
    ],
  },
];
