/**
 * 产业网络数据 — 基于 insitro 与 易赛腾(ECYTON) 真实尽调报告
 *
 * 数据源:
 * - /Users/john/柳明杰2026/insitro_顶级研究尽调报告.html (2026 Q3)
 * - /Users/john/柳明杰2026/易赛腾生物_顶级研究尽调报告.html (2026 Q3)
 *
 * 节点类别:
 * - focal: 焦点公司(展示中心)
 * - capital: 投资方(VC/PE/战略投资人)
 * - customer: 客户(MNC 大药企 / 中国药企)
 * - supplier: 供应商(试剂/设备/CRO)
 * - partner: 战略合作伙伴(学术/监管/渠道)
 * - competitor: 同赛道竞对
 *
 * 边类型与节点类别对应,颜色一致
 */

export type NodeCategory =
  | 'focal'
  | 'capital'
  | 'customer'
  | 'supplier'
  | 'partner'
  | 'competitor';

export interface NetworkNode {
  id: string;
  name: string;
  /** 短标签(2-3 字,显示在节点上) */
  short?: string;
  category: NodeCategory;
  /** 视觉权重 1-5,影响节点大小 */
  weight: number;
  /** 国家/地区(可选) */
  region?: string;
  /** 描述(用于 hover tooltip 或注释) */
  meta?: string;
}

export type EdgeType = 'capital' | 'customer' | 'supplier' | 'partner' | 'competitor';

export interface NetworkEdge {
  from: string;
  to: string;
  type: EdgeType;
  /** 1-3,影响线宽 */
  weight?: number;
  /** 标注金额 / 强度 / 关系描述 */
  label?: string;
}

export const NETWORK_NODES: NetworkNode[] = [
  // ============ 焦点公司 ============
  {
    id: 'insitro',
    name: 'insitro',
    short: 'insitro',
    category: 'focal',
    weight: 5,
    region: '🇺🇸',
    meta: 'Physical AI · 因果生物学 · $5.2B 估值',
  },
  {
    id: 'ecyton',
    name: '宁波易赛腾 ECYTON',
    short: 'ECYTON',
    category: 'focal',
    weight: 4,
    region: '🇨🇳',
    meta: '神经退行性疾病上游 AI 药研 · A轮 ¥3000万',
  },

  // ============ 资本方(VC/PE/战略) ============
  // insitro 系
  { id: 'a16z', name: 'a16z', short: 'a16z', category: 'capital', weight: 4, region: '🇺🇸' },
  { id: 'arch', name: 'ARCH', short: 'ARCH', category: 'capital', weight: 4, region: '🇺🇸' },
  { id: 'cpp', name: 'CPP', short: 'CPP', category: 'capital', weight: 3, region: '🇨🇦' },
  { id: 'softbank', name: 'SoftBank Vision Fund 2', short: 'SoftBank', category: 'capital', weight: 4, region: '🇯🇵' },
  { id: 'blackrock', name: 'BlackRock', short: 'BlackRock', category: 'capital', weight: 3, region: '🇺🇸' },
  { id: 'temasek', name: 'Temasek', short: 'Temasek', category: 'capital', weight: 3, region: '🇸🇬' },
  // ECYTON 系(早期投资人,A 轮 ¥3000万)
  { id: 'china_vc_1', name: '奥博资本', short: '奥博', category: 'capital', weight: 2, region: '🇨🇳' },
  { id: 'china_vc_2', name: '礼来亚洲基金', short: '礼来亚洲', category: 'capital', weight: 2, region: '🇨🇳' },

  // ============ 客户 MNC ============
  // insitro 三大客户
  { id: 'bms', name: 'Bristol Myers Squibb', short: 'BMS', category: 'customer', weight: 5, region: '🇺🇸', meta: 'ALS 三靶点 · $50M+$2B+' },
  { id: 'lilly', name: 'Eli Lilly', short: 'Lilly', category: 'customer', weight: 5, region: '🇺🇸', meta: '代谢+NDD · 3 项协议' },
  { id: 'gilead', name: 'Gilead Sciences', short: 'Gilead', category: 'customer', weight: 4, region: '🇺🇸', meta: 'NASH · $15M+$1B' },
  // ECYTON 客户(L1 MNC)
  { id: 'roche', name: 'Roche', short: 'Roche', category: 'customer', weight: 4, region: '🇨🇭', meta: 'AD/ALS' },
  { id: 'biogen', name: 'Biogen', short: 'Biogen', category: 'customer', weight: 4, region: '🇺🇸', meta: 'AD' },
  { id: '恒瑞', name: '恒瑞医药', short: '恒瑞', category: 'customer', weight: 3, region: '🇨🇳', meta: 'AD/PD 多管线' },
  { id: '绿叶', name: '绿叶制药', short: '绿叶', category: 'customer', weight: 3, region: '🇨🇳', meta: 'CNS 30%+' },
  { id: 'az', name: 'AstraZeneca', short: 'AZ', category: 'customer', weight: 3, region: '🇬🇧', meta: 'Alexion 罕见神经病' },
  { id: 'abbvie', name: 'AbbVie', short: 'AbbVie', category: 'customer', weight: 3, region: '🇺🇸', meta: 'Cerevel · Emraclidine' },

  // ============ 供应商 ============
  { id: '10x', name: '10x Genomics', short: '10x', category: 'supplier', weight: 3, region: '🇺🇸', meta: '单细胞测序' },
  { id: 'bd_bio', name: 'BD Biosciences', short: 'BD', category: 'supplier', weight: 3, region: '🇺🇸', meta: '流式细胞' },
  { id: 'qiagen', name: 'QIAGEN', short: 'QIAGEN', category: 'supplier', weight: 2, region: '🇩🇪' },
  { id: 'agilent', name: 'Agilent', short: 'Agilent', category: 'supplier', weight: 2, region: '🇺🇸', meta: '多组学仪器' },
  { id: 'opm', name: '奥浦迈', short: '奥浦迈', category: 'supplier', weight: 2, region: '🇨🇳', meta: '国产替代' },
  { id: 'yx', name: '依科赛', short: '依科赛', category: 'supplier', weight: 2, region: '🇨🇳', meta: '国产替代' },

  // ============ 战略合作伙伴 ============
  // insitro 系(学术)
  { id: 'stanford', name: 'Stanford Hsu Lab', short: 'Stanford', category: 'partner', weight: 4, region: '🇺🇸', meta: 'Patrick Hsu · Evo 模型' },
  { id: 'ukb', name: 'UK Biobank', short: 'UK Biobank', category: 'partner', weight: 3, region: '🇬🇧', meta: '62.4 万样本数据' },
  { id: 'cz', name: 'CZ Biohub', short: 'CZ Biohub', category: 'partner', weight: 3, region: '🇺🇸', meta: 'Stephen Quake 实验室' },
  // ECYTON 系
  { id: 'cas', name: '中科院神经所', short: '中科院', category: 'partner', weight: 4, region: '🇨🇳', meta: 'iPSC 神经分化顶级' },
  { id: 'wuxi', name: '药明康德 CNS', short: '药明', category: 'partner', weight: 4, region: '🇨🇳', meta: '渠道放大 30-50%' },
  { id: 'nmpa', name: 'NMPA', short: 'NMPA', category: 'partner', weight: 3, region: '🇨🇳', meta: '监管标准背书' },

  // ============ 竞对 ============
  // insitro 主要竞对(高相似度)
  { id: 'recursion', name: 'Recursion + Exscientia', short: 'Recursion', category: 'competitor', weight: 5, region: '🇺🇸', meta: 'Similarity 87 · 表型组学' },
  { id: 'insilico', name: 'Insilico Medicine', short: 'Insilico', category: 'competitor', weight: 5, region: '🇭🇰', meta: 'Phase III 已启动' },
  { id: 'schrodinger', name: 'Schrödinger', short: 'Schrödinger', category: 'competitor', weight: 4, region: '🇺🇸', meta: 'SaaS+Pipeline' },
  { id: 'isomorphic', name: 'Isomorphic Labs', short: 'Isomorphic', category: 'competitor', weight: 4, region: '🇬🇧', meta: 'AlphaFold3 · $2.7B 融资' },
  { id: 'xaira', name: 'Xaira Therapeutics', short: 'Xaira', category: 'competitor', weight: 3, region: '🇺🇸', meta: '因果虚拟细胞' },
  // ECYTON 竞对(iPSC+NDD)
  { id: 'axosim', name: 'AxoSim', short: 'AxoSim', category: 'competitor', weight: 3, region: '🇺🇸', meta: 'iPSC 神经 · 直接竞合' },
  { id: 'sigilon', name: '希格生科 Sigilon', short: '希格', category: 'competitor', weight: 2, region: '🇨🇳', meta: '晶泰孵化 · NDD' },
  { id: 'xtalpi', name: '晶泰科技 XtalPi', short: '晶泰', category: 'competitor', weight: 4, region: '🇭🇰', meta: 'CRO+自营+合作 · 已上市' },
];

export const NETWORK_EDGES: NetworkEdge[] = [
  // ============ insitro 资本流(VC → insitro) ============
  { from: 'a16z', to: 'insitro', type: 'capital', weight: 3, label: 'A/B 轮领投' },
  { from: 'arch', to: 'insitro', type: 'capital', weight: 3, label: 'A/B/C 跟投' },
  { from: 'cpp', to: 'insitro', type: 'capital', weight: 3, label: 'C 轮领投 $400M' },
  { from: 'softbank', to: 'insitro', type: 'capital', weight: 2, label: 'C 轮跟投' },
  { from: 'blackrock', to: 'insitro', type: 'capital', weight: 2, label: 'B/C 跟投' },
  { from: 'temasek', to: 'insitro', type: 'capital', weight: 2, label: 'C 轮跟投' },

  // ============ insitro 客户流(insitro → MNC) ============
  { from: 'insitro', to: 'bms', type: 'customer', weight: 3, label: 'ALS 三靶点' },
  { from: 'insitro', to: 'lilly', type: 'customer', weight: 3, label: '代谢+NDD' },
  { from: 'insitro', to: 'gilead', type: 'customer', weight: 2, label: 'NASH' },

  // ============ insitro 合作(academic) ============
  { from: 'stanford', to: 'insitro', type: 'partner', weight: 3, label: 'Daphne Koller 创立' },
  { from: 'ukb', to: 'insitro', type: 'partner', weight: 2, label: '数据上游' },
  { from: 'cz', to: 'insitro', type: 'partner', weight: 2, label: '数据合作' },

  // ============ insitro 竞对(双向,红色虚线) ============
  { from: 'insitro', to: 'recursion', type: 'competitor', weight: 3, label: 'Similarity 87' },
  { from: 'insitro', to: 'insilico', type: 'competitor', weight: 3, label: 'NDD 直接竞合' },
  { from: 'insitro', to: 'schrodinger', type: 'competitor', weight: 2, label: '同 MNC 客户' },
  { from: 'insitro', to: 'isomorphic', type: 'competitor', weight: 2, label: '共同 Lilly' },
  { from: 'insitro', to: 'xaira', type: 'competitor', weight: 2, label: '方法论同源' },

  // ============ ECYTON 资本流 ============
  { from: 'china_vc_1', to: 'ecyton', type: 'capital', weight: 2, label: 'A 轮 ¥1500万' },
  { from: 'china_vc_2', to: 'ecyton', type: 'capital', weight: 2, label: 'A 轮 ¥1500万' },

  // ============ ECYTON 客户流 ============
  { from: 'ecyton', to: 'lilly', type: 'customer', weight: 3, label: 'AD/PD 候选' },
  { from: 'ecyton', to: 'roche', type: 'customer', weight: 3, label: 'AD/ALS' },
  { from: 'ecyton', to: 'biogen', type: 'customer', weight: 2, label: 'AD' },
  { from: 'ecyton', to: '恒瑞', type: 'customer', weight: 2, label: '本土 BD' },
  { from: 'ecyton', to: '绿叶', type: 'customer', weight: 2, label: '本土 BD' },
  { from: 'ecyton', to: 'az', type: 'customer', weight: 2, label: 'Alexion 罕见' },
  { from: 'ecyton', to: 'abbvie', type: 'customer', weight: 2, label: 'Cerevel' },

  // ============ ECYTON 上游供应商 ============
  { from: 'bd_bio', to: 'ecyton', type: 'supplier', weight: 2, label: '流式细胞' },
  { from: '10x', to: 'ecyton', type: 'supplier', weight: 2, label: '单细胞' },
  { from: 'qiagen', to: 'ecyton', type: 'supplier', weight: 1, label: '试剂' },
  { from: 'agilent', to: 'ecyton', type: 'supplier', weight: 1, label: '多组学' },
  { from: 'opm', to: 'ecyton', type: 'supplier', weight: 1, label: '国产替代' },
  { from: 'yx', to: 'ecyton', type: 'supplier', weight: 1, label: '国产替代' },

  // ============ ECYTON 战略合作伙伴 ============
  { from: 'cas', to: 'ecyton', type: 'partner', weight: 3, label: 'iPSC 顶级' },
  { from: 'wuxi', to: 'ecyton', type: 'partner', weight: 2, label: 'CNS 渠道' },
  { from: 'nmpa', to: 'ecyton', type: 'partner', weight: 2, label: '监管合作' },

  // ============ ECYTON 竞对 ============
  { from: 'ecyton', to: 'axosim', type: 'competitor', weight: 2, label: 'iPSC 神经' },
  { from: 'ecyton', to: 'sigilon', type: 'competitor', weight: 1, label: 'NDD 自营' },
  { from: 'ecyton', to: 'xtalpi', type: 'competitor', weight: 2, label: 'CRO+自营' },
  // ECYTON 也视 insitro 为竞对(同一赛道)
  { from: 'ecyton', to: 'insitro', type: 'competitor', weight: 2, label: 'AI 制药对标' },
];
