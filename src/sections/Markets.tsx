/**
 * 35 国市场页 — 岐黄四海全球市场图鉴
 *
 * 设计思路: 东方出版社风格,墨青+朱砂,温暖纸质感
 * 与全站一致的字体系统与色板,不炫技,重内容
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Globe2,
  BookOpen,
  MapPin,
  TrendingUp,
  Clock,
  DollarSign,
  ShieldCheck,
  Search,
  Star,
  ArrowUpRight,
} from 'lucide-react';

import { RESEARCH_REPORTS } from '@/data/researchReports';

gsap.registerPlugin(ScrollTrigger);

// ─── Region ───────────────────────────────────────────────────────────────────
type RegionId =
  | 'all'
  | 'eastasia'
  | 'southeastasia'
  | 'oceania'
  | 'northamerica'
  | 'europe'
  | 'middleeast'
  | 'africa';

interface Region {
  id: RegionId;
  label: string;
  labelEn: string;
  color: string;
}

const REGIONS: Region[] = [
  { id: 'all', label: '全部', labelEn: 'All', color: '#2F5D57' },
  { id: 'eastasia', label: '东亚', labelEn: 'East Asia', color: '#8B5CF6' },
  { id: 'southeastasia', label: '东南亚', labelEn: 'SE Asia', color: '#10B981' },
  { id: 'oceania', label: '大洋洲', labelEn: 'Oceania', color: '#06B6D4' },
  { id: 'northamerica', label: '北美', labelEn: 'N. America', color: '#F59E0B' },
  { id: 'europe', label: '欧洲', labelEn: 'Europe', color: '#6366F1' },
  { id: 'middleeast', label: '中东', labelEn: 'M. East', color: '#EF4444' },
  { id: 'africa', label: '非洲', labelEn: 'Africa', color: '#84CC16' },
];

// ─── Market ───────────────────────────────────────────────────────────────────
type Tier = '一线' | '二线' | '细分';
type TierEn = 'Tier 1' | 'Tier 2' | 'Niche';
type Difficulty = '高' | '中' | '低';
type DifficultyEn = 'High' | 'Medium' | 'Low';

interface Market {
  id: string;
  name: string;
  nameEn: string;
  flag: string;
  region: RegionId;
  tier: Tier;
  tierEn: TierEn;
  difficulty: Difficulty;
  difficultyEn: DifficultyEn;
  timeline: string;
  timelineEn: string;
  cost: string;
  description: string;
  descriptionEn: string;
  // 核心合规信息
  pathway: string;
  pathwayEn: string;
}

const MARKETS: Market[] = [
  // ── 东亚 ──────────────────────────────────────────────────────────────────
  {
    id: 'japan',
    name: '日本',
    nameEn: 'Japan',
    flag: '🇯🇵',
    region: 'eastasia',
    tier: '一线',
    tierEn: 'Tier 1',
    difficulty: '高',
    difficultyEn: 'High',
    timeline: '12–18月',
    timelineEn: '12–18 mo',
    cost: '$80K–250K',
    description: '全球最大汉方市场，消费者品质要求极高，品牌溢价空间大',
    descriptionEn: 'World\'s largest Kampo market; extremely high quality bar, strong brand premium',
    pathway: '医药品承认申请 / 规格承认 / 健字号备案',
    pathwayEn: 'Drug Approval / Spec Recognition / Health Food Filing',
  },
  {
    id: 'korea',
    name: '韩国',
    nameEn: 'S. Korea',
    flag: '🇰🇷',
    region: 'eastasia',
    tier: '二线',
    tierEn: 'Tier 2',
    difficulty: '中',
    difficultyEn: 'Medium',
    timeline: '6–10月',
    timelineEn: '6–10 mo',
    cost: '$25K–60K',
    description: '文化相近，KFDA 审批周期适中，是东亚出海的重要跳板',
    descriptionEn: 'Cultural proximity, moderate KFDA timeline, important East Asia stepping stone',
    pathway: 'KFDA 医药外品注册 / 健康功能食品申报',
    pathwayEn: 'KFDA Quasi-drug / Health Functional Food Registration',
  },
  {
    id: 'taiwan',
    name: '中国台湾',
    nameEn: 'Taiwan',
    flag: '🇹🇼',
    region: 'eastasia',
    tier: '细分',
    tierEn: 'Niche',
    difficulty: '中',
    difficultyEn: 'Medium',
    timeline: '4–8月',
    timelineEn: '4–8 mo',
    cost: '$12K–35K',
    description: '文化相通，语言无障碍，市场熟悉度高，是验证华人市场的好起点',
    descriptionEn: 'Cultural affinity, no language barrier, ideal testing ground for Chinese-heritage markets',
    pathway: 'TFDA 药剂/胶囊/锭剂注册 / 健康食品认证',
    pathwayEn: 'TFDA Drug/Capsule/Tablet Registration / Health Food Certification',
  },
  {
    id: 'hongkong',
    name: '中国香港',
    nameEn: 'Hong Kong',
    flag: '🇭🇰',
    region: 'eastasia',
    tier: '细分',
    tierEn: 'Niche',
    difficulty: '低',
    difficultyEn: 'Low',
    timeline: '2–4月',
    timelineEn: '2–4 mo',
    cost: '$8K–25K',
    description: '进入门槛最低，中成药/保健食品可直接以一般贸易进口',
    descriptionEn: 'Lowest barrier; TCM/Health supplements can enter via general trade',
    pathway: '一般贸易进口 / 中成药注册（HKP）',
    pathwayEn: 'General Trade Import / TCM Registration (HKP)',
  },
  // ── 东南亚 ────────────────────────────────────────────────────────────────
  {
    id: 'singapore',
    name: '新加坡',
    nameEn: 'Singapore',
    flag: '🇸🇬',
    region: 'southeastasia',
    tier: '一线',
    tierEn: 'Tier 1',
    difficulty: '低',
    difficultyEn: 'Low',
    timeline: '3–6月',
    timelineEn: '3–6 mo',
    cost: '$15K–40K',
    description: '东南亚金融中心，HSA 监管清晰，是进入东南亚的优质样板市场',
    descriptionEn: 'SE Asian financial hub; HSA regulations clear, ideal proof-of-concept for SE Asia',
    pathway: 'HSA 药品监管评估 / 补充健康产品 (THM) 通知',
    pathwayEn: 'HSA Drug Regulatory Evaluation / Traditional Remedy (THM) Notification',
  },
  {
    id: 'malaysia',
    name: '马来西亚',
    nameEn: 'Malaysia',
    flag: '🇲🇾',
    region: 'southeastasia',
    tier: '二线',
    tierEn: 'Tier 2',
    difficulty: '低',
    difficultyEn: 'Low',
    timeline: '3–6月',
    timelineEn: '3–6 mo',
    cost: '$12K–35K',
    description: '多元文化市场，清真认证优势，是进入伊斯兰市场的关键跳板',
    descriptionEn: 'Multicultural market with halal certification edge, key gateway to Islamic markets',
    pathway: 'NPRA 药品注册 / NPRA 保健品注册 / 清真认证 (JAKIM)',
    pathwayEn: 'NPRA Drug Registration / NPRA Health Supplement / Halal (JAKIM)',
  },
  {
    id: 'thailand',
    name: '泰国',
    nameEn: 'Thailand',
    flag: '🇹🇭',
    region: 'southeastasia',
    tier: '二线',
    tierEn: 'Tier 2',
    difficulty: '中',
    difficultyEn: 'Medium',
    timeline: '4–8月',
    timelineEn: '4–8 mo',
    cost: '$15K–40K',
    description: '东南亚第二大市场，泰药监管相对宽松，华人消费者占比较高',
    descriptionEn: '2nd largest SE Asian market; moderate Thai FDA rules, large Chinese-heritage consumer base',
    pathway: 'Thai FDA 中成药注册 / 食品补充剂通知',
    pathwayEn: 'Thai FDA TCM Registration / Food Supplement Notification',
  },
  {
    id: 'indonesia',
    name: '印度尼西亚',
    nameEn: 'Indonesia',
    flag: '🇮🇩',
    region: 'southeastasia',
    tier: '二线',
    tierEn: 'Tier 2',
    difficulty: '高',
    difficultyEn: 'High',
    timeline: '8–14月',
    timelineEn: '8–14 mo',
    cost: '$30K–80K',
    description: '2.7 亿人口市场，BPOM 注册复杂，清真认证是核心门槛',
    descriptionEn: '270M population; BPOM registration complex, halal certification is the key gate',
    pathway: 'BPOM 药品/传统药品注册 / MUI 清真认证',
    pathwayEn: 'BPOM Drug/Traditional Drug Registration / MUI Halal Certification',
  },
  {
    id: 'vietnam',
    name: '越南',
    nameEn: 'Vietnam',
    flag: '🇻🇳',
    region: 'southeastasia',
    tier: '细分',
    tierEn: 'Niche',
    difficulty: '中',
    difficultyEn: 'Medium',
    timeline: '6–12月',
    timelineEn: '6–12 mo',
    cost: '$18K–45K',
    description: '中等收入国家，中医药认知基础好，法规框架正在完善中',
    descriptionEn: 'Middle-income country with good TCM awareness base; regulatory framework maturing',
    pathway: '越南 FDA 药品注册 / 保健品注册',
    pathwayEn: 'Vietnam FDA Drug Registration / Health Supplement Registration',
  },
  {
    id: 'philippines',
    name: '菲律宾',
    nameEn: 'Philippines',
    flag: '🇵🇭',
    region: 'southeastasia',
    tier: '细分',
    tierEn: 'Niche',
    difficulty: '低',
    difficultyEn: 'Low',
    timeline: '3–6月',
    timelineEn: '3–6 mo',
    cost: '$10K–30K',
    description: '门槛最低的东南亚市场之一，以食品/膳食补充剂路径进入最经济',
    descriptionEn: 'One of the lowest-barrier SE Asian markets; food/supplement route most cost-effective',
    pathway: 'FDA Philippines 食品注册 / 膳食补充剂通知',
    pathwayEn: 'FDA Philippines Food Registration / Dietary Supplement Notification',
  },
  // ── 大洋洲 ────────────────────────────────────────────────────────────────
  {
    id: 'australia',
    name: '澳大利亚',
    nameEn: 'Australia',
    flag: '🇦🇺',
    region: 'oceania',
    tier: '一线',
    tierEn: 'Tier 1',
    difficulty: '中',
    difficultyEn: 'Medium',
    timeline: '6–12月',
    timelineEn: '6–12 mo',
    cost: '$30K–80K',
    description: '监管清晰，TGA 路径明确，是进入大洋洲的优质跳板',
    descriptionEn: 'Clear TGA pathway; excellent gateway to Oceania, strong pharma channel network',
    pathway: 'TGA 登记 (AUST L) / 注册 (AUST R) / 补充药品',
    pathwayEn: 'TGA Listing (AUST L) / Registration (AUST R) / Complementary Medicine',
  },
  {
    id: 'newzealand',
    name: '新西兰',
    nameEn: 'New Zealand',
    flag: '🇳🇿',
    region: 'oceania',
    tier: '细分',
    tierEn: 'Niche',
    difficulty: '低',
    difficultyEn: 'Low',
    timeline: '3–6月',
    timelineEn: '3–6 mo',
    cost: '$12K–30K',
    description: '小而精的市场，澳大利亚 TGA 批准通常可互认进入新西兰',
    descriptionEn: 'Small but premium market; TGA approval in Australia often grants NZ access via mutual recognition',
    pathway: 'Medsafe 药品注册（参考 TGA 批准路径）',
    pathwayEn: 'Medsafe Drug Registration (TGA cross-reference pathway)',
  },
  // ── 北美 ──────────────────────────────────────────────────────────────────
  {
    id: 'usa',
    name: '美国',
    nameEn: 'United States',
    flag: '🇺🇸',
    region: 'northamerica',
    tier: '一线',
    tierEn: 'Tier 1',
    difficulty: '高',
    difficultyEn: 'High',
    timeline: '12–24月',
    timelineEn: '12–24 mo',
    cost: '$50K–150K',
    description: '全球最大市场，FDA 审批最严格，回报潜力最高',
    descriptionEn: 'World\'s largest market; strictest FDA bar, but highest long-term return potential',
    pathway: '膳食补充剂 (DS) / NDA 新药申请 / GRAS 成分认证',
    pathwayEn: 'Dietary Supplement (DS) / NDA / GRAS Ingredient Certification',
  },
  {
    id: 'canada',
    name: '加拿大',
    nameEn: 'Canada',
    flag: '🇨🇦',
    region: 'northamerica',
    tier: '二线',
    tierEn: 'Tier 2',
    difficulty: '中',
    difficultyEn: 'Medium',
    timeline: '6–12月',
    timelineEn: '6–12 mo',
    cost: '$25K–65K',
    description: '市场体量适中，Health Canada 监管比 FDA 稍宽松，NPN/NPN-HC 路径清晰',
    descriptionEn: 'Moderate market size; Health Canada slightly less restrictive than FDA, clear NPN/NPN-HC pathways',
    pathway: 'Health Canada NPN 天然健康产品 / 食品补充剂 / 药品 (TPD)',
    pathwayEn: 'Health Canada NPN Natural Health Product / Supplement / TPD Drug',
  },
  // ── 欧洲 ──────────────────────────────────────────────────────────────────
  {
    id: 'germany',
    name: '德国',
    nameEn: 'Germany',
    flag: '🇩🇪',
    region: 'europe',
    tier: '一线',
    tierEn: 'Tier 1',
    difficulty: '高',
    difficultyEn: 'High',
    timeline: '12–24月',
    timelineEn: '12–24 mo',
    cost: '$60K–180K',
    description: '欧洲最大市场，标准严格，进入后可凭 EMA 集中审批辐射欧盟全境',
    descriptionEn: 'Largest European market; strict BfArM/EMA standards, EMA central approval gives EU-wide access',
    pathway: '传统草药注册 (THR) / EMA 集中审批 / 食品补充剂 (Novel Food)',
    pathwayEn: 'Traditional Herbal Registration (THR) / EMA Central / Food Supplement (Novel Food)',
  },
  {
    id: 'uk',
    name: '英国',
    nameEn: 'United Kingdom',
    flag: '🇬🇧',
    region: 'europe',
    tier: '一线',
    tierEn: 'Tier 1',
    difficulty: '中',
    difficultyEn: 'Medium',
    timeline: '8–14月',
    timelineEn: '8–14 mo',
    cost: '$40K–100K',
    description: '脱欧后独立 MHRA 体系，审批效率比 EMA 高，是欧洲数字营销的优质起点',
    descriptionEn: 'Post-Brexit independent MHRA system; faster than EMA, great for European digital marketing launch',
    pathway: 'MHRA 传统草药注册 (THR) / 食品补充剂 / 药品注册',
    pathwayEn: 'MHRA THR / Food Supplement / Drug Registration',
  },
  {
    id: 'france',
    name: '法国',
    nameEn: 'France',
    flag: '🇫🇷',
    region: 'europe',
    tier: '二线',
    tierEn: 'Tier 2',
    difficulty: '高',
    difficultyEn: 'High',
    timeline: '12–20月',
    timelineEn: '12–20 mo',
    cost: '$50K–120K',
    description: '欧洲第二大国，ANSM 审批严格，欧盟 THR 路径可覆盖法国',
    descriptionEn: '2nd largest European country; strict ANSM; EU THR pathway covers France',
    pathway: '欧盟 THR 路径 / 食品补充剂通知 (ANSES) / ANSM 药品注册',
    pathwayEn: 'EU THR / Food Supplement Notification (ANSES) / ANSM Drug Registration',
  },
  {
    id: 'netherlands',
    name: '荷兰',
    nameEn: 'Netherlands',
    flag: '🇳🇱',
    region: 'europe',
    tier: '二线',
    tierEn: 'Tier 2',
    difficulty: '低',
    difficultyEn: 'Low',
    timeline: '4–8月',
    timelineEn: '4–8 mo',
    cost: '$20K–50K',
    description: '欧洲市场门户，CBG 审批效率高，鹿特丹港是进入欧洲的物流枢纽',
    descriptionEn: 'Gateway to Europe; high CBG efficiency; Rotterdam port is the logistics hub',
    pathway: 'CBG-MEB 药品注册 / 欧盟 THR / 食品补充剂',
    pathwayEn: 'CBG-MEB Drug Registration / EU THR / Food Supplement',
  },
  // ── 中东 ──────────────────────────────────────────────────────────────────
  {
    id: 'uae',
    name: '阿联酋',
    nameEn: 'UAE',
    flag: '🇦🇪',
    region: 'middleeast',
    tier: '二线',
    tierEn: 'Tier 2',
    difficulty: '低',
    difficultyEn: 'Low',
    timeline: '3–6月',
    timelineEn: '3–6 mo',
    cost: '$20K–50K',
    description: '中东门户市场，MOHAP 审批效率高，迪拜是区域物流与金融枢纽',
    descriptionEn: 'Middle East gateway; high MOHAP efficiency; Dubai is regional logistics and financial hub',
    pathway: 'MOHAP 药品注册 / 保健品注册 / UAE 医疗器械',
    pathwayEn: 'MOHAP Drug Registration / Health Supplement / UAE Medical Device',
  },
  {
    id: 'saudiarabia',
    name: '沙特阿拉伯',
    nameEn: 'Saudi Arabia',
    flag: '🇸🇦',
    region: 'middleeast',
    tier: '二线',
    tierEn: 'Tier 2',
    difficulty: '中',
    difficultyEn: 'Medium',
    timeline: '6–12月',
    timelineEn: '6–12 mo',
    cost: '$25K–60K',
    description: '中东最大单一市场，SFDA 注册严格，清真认证是核心前提',
    descriptionEn: 'Largest single Middle Eastern market; strict SFDA, halal certification is core prerequisite',
    pathway: 'SFDA 药品注册 / SFDA 保健品注册 / SASO 清真认证',
    pathwayEn: 'SFDA Drug Registration / Health Supplement / SASO Halal',
  },
  {
    id: 'israel',
    name: '以色列',
    nameEn: 'Israel',
    flag: '🇮🇱',
    region: 'middleeast',
    tier: '细分',
    tierEn: 'Niche',
    difficulty: '中',
    difficultyEn: 'Medium',
    timeline: '6–10月',
    timelineEn: '6–10 mo',
    cost: '$20K–45K',
    description: '高收入市场，科技与医疗创新中心，消费者对天然健康产品接受度高',
    descriptionEn: 'High-income market; tech/medical innovation hub; high consumer receptivity to natural health',
    pathway: 'MOH 以色列卫生部药品注册 / 保健品注册',
    pathwayEn: 'MOH Israel Drug Registration / Health Supplement',
  },
  // ── 非洲 ──────────────────────────────────────────────────────────────────
  {
    id: 'southafrica',
    name: '南非',
    nameEn: 'South Africa',
    flag: '🇿🇦',
    region: 'africa',
    tier: '细分',
    tierEn: 'Niche',
    difficulty: '中',
    difficultyEn: 'Medium',
    timeline: '6–12月',
    timelineEn: '6–12 mo',
    cost: '$15K–40K',
    description: '非洲最发达市场，SAHPRA 审批周期适中，是进入非洲的战略起点',
    descriptionEn: 'Most developed African market; moderate SAHPRA timeline; strategic first step into Africa',
    pathway: 'SAHPRA 药品注册 / Complementary Medicine 注册',
    pathwayEn: 'SAHPRA Drug Registration / Complementary Medicine',
  },
];

// ─── Report per region ────────────────────────────────────────────────────────
const REGION_REPORTS = [
  {
    region: 'eastasia' as RegionId,
    label: '东亚市场',
    labelEn: 'East Asia Markets',
    reportIds: ['japan-kampo-hegemony-2026', 'japan-dtc-site-handbook-2026'],
    color: '#8B5CF6',
    desc: '日本汉方格局解码 · 日本选品 · DTC 独立站搭建',
    descEn: 'Japan Kampo landscape · Japan selection · DTC site handbook',
  },
  {
    region: 'southeastasia' as RegionId,
    label: '东南亚市场',
    labelEn: 'SE Asia Markets',
    reportIds: ['food-medicine-homology-2026'],
    color: '#10B981',
    desc: '食药同源全赛道产业尽调 · 东南亚法规与渠道',
    descEn: 'Food-medicine homology industry · SE Asian regulations & channels',
  },
  {
    region: 'northamerica' as RegionId,
    label: '北美市场',
    labelEn: 'N. America Markets',
    reportIds: ['usa-consumer-2026'],
    color: '#F59E0B',
    desc: '美国消费市场选品报告 · 跨境电商路径',
    descEn: 'USA consumer market report · Cross-border e-commerce pathways',
  },
  {
    region: 'europe' as RegionId,
    label: '欧洲市场',
    labelEn: 'Europe Markets',
    reportIds: ['food-medicine-homology-2026'],
    color: '#6366F1',
    desc: '欧盟 THR 路径 · 德国/荷兰准入 · 食药同源',
    descEn: 'EU THR pathway · DE/NL entry · Food-medicine homology',
  },
];

// ─── Difficulty badge ───────────────────────────────────────────────────────────
const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; labelEn: string; color: string; bg: string }> = {
  低: { label: '低', labelEn: 'Low', color: '#059669', bg: '#D1FAE5' },
  中: { label: '中', labelEn: 'Medium', color: '#D97706', bg: '#FEF3C7' },
  高: { label: '高', labelEn: 'High', color: '#DC2626', bg: '#FEE2E2' },
};

const TIER_CONFIG: Record<Tier, { label: string; labelEn: string; color: string }> = {
  一线: { label: '一线', labelEn: 'Tier 1', color: '#2F5D57' },
  二线: { label: '二线', labelEn: 'Tier 2', color: '#B8860B' },
  细分: { label: '细分', labelEn: 'Niche', color: '#8B5CF6' },
};

// ─── Component ─────────────────────────────────────────────────────────────────
const Markets = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const sectionRef = useRef<HTMLElement>(null);
  const [activeRegion, setActiveRegion] = useState<RegionId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll reveal
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.market-card',
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.05,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 68%' },
        }
      );
      gsap.fromTo(
        '.report-card',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: '#reports-section', start: 'top 72%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [activeRegion, searchQuery]);

  // Filtered markets
  const filtered = useMemo(() => {
    return MARKETS.filter((m) => {
      const matchesRegion = activeRegion === 'all' || m.region === activeRegion;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.nameEn.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.descriptionEn.toLowerCase().includes(q);
      return matchesRegion && matchesSearch;
    });
  }, [activeRegion, searchQuery]);

  // Stats
  const tier1Count = filtered.filter((m) => m.tier === '一线').length;
  const tier2Count = filtered.filter((m) => m.tier === '二线').length;
  const nicheCount = filtered.filter((m) => m.tier === '细分').length;

  const regionCounts = REGIONS.map((r) => ({
    ...r,
    count: r.id === 'all' ? MARKETS.length : MARKETS.filter((m) => m.region === r.id).length,
  }));

  return (
    <section id="markets" ref={sectionRef} className="relative overflow-hidden">

      {/* ══ PAGE HERO ══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-b border-[#2F5D57]/10">
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 20% 90%, rgba(47,93,87,0.07), transparent 55%), radial-gradient(ellipse at 80% 10%, rgba(194,71,59,0.04), transparent 50%)',
          }}
        />

        <div className="relative container mx-auto px-6 pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="max-w-2xl">
            <div className="volume-mark mb-5">
              {isZh ? '卷肆 · 全球市场' : 'Vol. IV — Global Markets'}
            </div>
            <h1 className="text-[2.5rem] md:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-[#1B2520]">
              {isZh ? (
                <>
                  出海目的地
                  <span className="block text-gradient-primary">完整图鉴</span>
                </>
              ) : (
                <>
                  Complete{' '}
                  <span className="text-gradient-primary">Global Market</span>
                  {' '}Atlas
                </>
              )}
            </h1>
            <p className="mt-5 text-base md:text-lg leading-[1.75] text-[#4a554f] max-w-xl">
              {isZh
                ? '21 个目标市场的准入路径、合规门槛与成本区间 — 按区域和准入难度分层。帮助你在启动前看清每条路的真实代价。'
                : 'Entry pathways, compliance bars and cost ranges for 21 target markets — tiered by region and difficulty. See the real cost of each path before you start.'}
            </p>
          </div>

          {/* Hero trust strip */}
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { icon: Globe2, text: `${MARKETS.length} ${isZh ? '个目标市场' : 'Target Markets'}` },
              { icon: ShieldCheck, text: isZh ? '含合规路径说明' : 'Entry Pathways Included' },
              { icon: DollarSign, text: isZh ? '含成本区间估算' : 'Cost Range Estimates' },
              { icon: Clock, text: isZh ? '含周期估算' : 'Timeline Estimates' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="inline-flex items-center gap-2 rounded-full border border-[#2F5D57]/15 bg-white px-4 py-2 text-sm text-[#3a4540] shadow-sm"
              >
                <Icon className="h-4 w-4 text-[#2F5D57]" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FILTER BAR ════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-20 border-b border-[#2F5D57]/10 bg-[#FAF8F3]/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-6 py-3.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Region tabs */}
            <div className="flex flex-wrap gap-1.5">
              {regionCounts.filter(r => r.id !== 'all' || r.count > 0).map((region) => {
                const isActive = activeRegion === region.id;
                return (
                  <button
                    key={region.id}
                    onClick={() => setActiveRegion(region.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'text-white shadow-sm'
                        : 'border border-[#2F5D57]/20 bg-white text-[#3a4540] hover:border-[#2F5D57]/40'
                    }`}
                    style={isActive ? { backgroundColor: region.color, borderColor: region.color } : {}}
                  >
                    <span>{isZh ? region.label : region.labelEn}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#2F5D57]/10 text-[#2F5D57]'
                      }`}
                    >
                      {region.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2F5D57]/45" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isZh ? '搜索市场 / 产品 / 路径…' : 'Search market, product, pathway…'}
                className="w-full rounded-full border border-[#2F5D57]/20 bg-white py-2 pl-10 pr-4 text-sm text-[#1B2520] placeholder:text-[#5b6661]/60 focus:border-[#2F5D57]/50 focus:outline-none focus:ring-2 focus:ring-[#2F5D57]/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5b6661] hover:text-[#1B2520]"
                >
                  <span className="text-sm">✕</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats row */}
          {filtered.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#5b6661]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2F5D57]" />
                {isZh ? '筛选结果' : 'Results'}: {filtered.length} {isZh ? '个市场' : 'markets'}
              </span>
              {activeRegion === 'all' && (
                <>
                  <span className="text-[#2F5D57] font-semibold">{tier1Count}×Tier 1</span>
                  <span className="text-[#B8860B] font-semibold">{tier2Count}×Tier 2</span>
                  <span className="text-[#8B5CF6] font-semibold">{nicheCount}×Niche</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══ MARKET GRID ══════════════════════════════════════════════════════ */}
      <div className="container mx-auto px-6 py-12 md:py-16">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Globe2 className="mx-auto h-12 w-12 text-[#2F5D57]/30 mb-4" />
            <p className="text-[#5b6661]">{isZh ? '暂无匹配的市场' : 'No matching markets found'}</p>
            <button
              onClick={() => { setActiveRegion('all'); setSearchQuery(''); }}
              className="mt-4 text-sm text-[#2F5D57] underline"
            >
              {isZh ? '清除筛选' : 'Clear filters'}
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((market) => {
              const tierCfg = TIER_CONFIG[market.tier];
              const diffCfg = DIFFICULTY_CONFIG[market.difficulty];
              const regionCfg = REGIONS.find((r) => r.id === market.region)!;

              return (
                <Link
                  key={market.id}
                  to={`/country-assessment?market=${market.id}`}
                  className="market-card pub-card card-hover group relative flex flex-col rounded-2xl border border-[#2F5D57]/10 bg-white p-6"
                >
                  {/* Hover accent */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                      boxShadow: `inset 3px 0 0 ${regionCfg.color}`,
                      background: `${regionCfg.color}05`,
                    }}
                  />

                  {/* Header */}
                  <div className="relative mb-4 flex items-start gap-3">
                    <span className="text-3xl leading-none">{market.flag}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-[#1B2520] tracking-tight leading-snug truncate">
                        {isZh ? market.name : market.nameEn}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                          style={{ backgroundColor: `${tierCfg.color}15`, color: tierCfg.color }}
                        >
                          {isZh ? tierCfg.label : tierCfg.labelEn}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                          style={{ backgroundColor: diffCfg.bg, color: diffCfg.color }}
                        >
                          <span
                            className="h-1 w-1 rounded-full"
                            style={{ backgroundColor: diffCfg.color }}
                          />
                          {isZh ? diffCfg.label : diffCfg.labelEn}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="relative flex-1 text-sm leading-relaxed text-[#4a554f] line-clamp-2">
                    {isZh ? market.description : market.descriptionEn}
                  </p>

                  {/* Pathway */}
                  <div className="relative mt-4 rounded-xl border border-[#2F5D57]/10 bg-[#FAF8F3] px-3.5 py-2.5">
                    <div className="text-[9px] uppercase tracking-widest text-[#2F5D57]/60 font-bold mb-1">
                      {isZh ? '核心路径' : 'Core Pathway'}
                    </div>
                    <p className="text-xs leading-relaxed text-[#1B2520] line-clamp-2">
                      {isZh ? market.pathway : market.pathwayEn}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="relative mt-4 flex items-center justify-between border-t border-[#2F5D57]/8 pt-3.5">
                    <div className="flex items-center gap-3 text-xs text-[#5b6661]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {isZh ? market.timeline : market.timelineEn}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {market.cost}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-[#2F5D57] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>{isZh ? '评估详情' : 'Assess'}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ REGIONAL REPORTS ═════════════════════════════════════════════════ */}
      <div id="reports-section" className="border-t border-[#2F5D57]/10 bg-[#EDE8DC]">
        <div className="container mx-auto px-6 py-16 md:py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <div className="volume-mark mb-4">
                {isZh ? '卷肆 · 深度报告' : 'Vol. IV — Deep Dives'}
              </div>
              <h2 className="text-[2rem] md:text-[2.5rem] font-semibold leading-[1.15] tracking-tight text-[#1B2520]">
                {isZh ? '区域深度报告' : 'Regional Deep-Dive Reports'}
              </h2>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-[#4a554f]">
                {isZh
                  ? '每个区域都有系统性研究报告 — 从选品、监管到渠道,给你进入前的完整背景。'
                  : 'Each region has systematic research reports — from selection and regulation to channels — giving you complete context before entry.'}
              </p>
            </div>
            <Link
              to="/research"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-[#2F5D57] hover:text-[#1B2520] transition-colors"
            >
              {isZh ? '查看全部报告' : 'All Reports'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {REGION_REPORTS.map((rr) => {
              const reports = rr.reportIds
                .map((id) => RESEARCH_REPORTS.find((r) => r.id === id))
                .filter(Boolean) as typeof RESEARCH_REPORTS;

              return (
                <div key={rr.region} className="report-card rounded-2xl border border-[#2F5D57]/15 bg-white p-6 shadow-sm">
                  <div
                    className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: rr.color }}
                  >
                    <MapPin className="h-3 w-3" />
                    {isZh ? rr.label : rr.labelEn}
                  </div>
                  {reports.map((report) => (
                    <div key={report.id}>
                      <h3 className="text-sm font-semibold text-[#1B2520] leading-snug mb-1 line-clamp-2">
                        {report.title}
                      </h3>
                      <p className="text-xs text-[#5b6661] mb-3">{report.subtitle}</p>
                      <div className="mb-3 grid grid-cols-2 gap-2">
                        {report.metrics?.slice(0, 2).map((m) => (
                          <div key={m.label} className="rounded-xl border border-[#2F5D57]/10 bg-[#FAF8F3] px-3 py-2 text-center">
                            <div className="text-lg font-bold text-[#2F5D57]">{m.value}</div>
                            <div className="text-[9px] uppercase tracking-wider text-[#5b6661]">{m.label}</div>
                          </div>
                        ))}
                      </div>
                      <a
                        href={report.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2F5D57] hover:text-[#1B2520] transition-colors"
                      >
                        {isZh ? '阅读报告' : 'Read Report'}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-[#2F5D57]/8">
                    <p className="text-xs text-[#5b6661]">{isZh ? rr.desc : rr.descEn}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/research"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#2F5D57]"
            >
              {isZh ? '查看全部报告' : 'All Reports'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ══ AI ASSESSMENT CTA ═════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 50% 100%, rgba(47,93,87,0.08), transparent 60%)',
          }}
        />
        <div className="relative container mx-auto px-6 py-16 md:py-20 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="volume-mark mb-5 justify-center">
              {isZh ? '下一步' : 'Next Step'}
            </div>
            <h2 className="text-[2rem] md:text-[2.75rem] font-semibold leading-[1.15] tracking-tight text-[#1B2520]">
              {isZh ? (
                <>
                  不确定从哪
                  <span className="text-gradient-seal">3 个市场</span>
                  开始?
                </>
              ) : (
                <>
                  Not sure which{' '}
                  <span className="text-gradient-seal">3 markets</span>
                  {' '}to start?
                </>
              )}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#4a554f]">
              {isZh
                ? '使用岐黄四海的 AI 国别评估系统 — 输入你的产品和预算,系统会在 3 分钟内给出一个优先进入 3 个市场的排序,并说明每个市场的核心门槛。'
                : 'Use the QihuangSihai AI Country Assessment — input your product and budget, and get a ranked priority of the top 3 markets in 3 minutes, with clear gates for each.'}
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/country-assessment"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-[#C2473B] px-8 py-4 text-base font-semibold text-white shadow-[0_8px_22px_rgba(194,71,59,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#A93B30] hover:shadow-[0_12px_28px_rgba(194,71,59,0.3)]"
              >
                <TrendingUp className="h-5 w-5" />
                {isZh ? '开始 AI 国别评估' : 'Start AI Country Assessment'}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/diagnose"
                className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-[#2F5D57] bg-white px-8 py-4 text-base font-semibold text-[#2F5D57] transition-all hover:-translate-y-0.5 hover:bg-[#2F5D57] hover:text-white"
              >
                <Star className="h-5 w-5" />
                {isZh ? '先做 3 分钟 AI 诊断' : '3-min AI Diagnosis First'}
              </Link>
            </div>

            <p className="mt-5 text-xs text-[#5b6661]">
              {isZh
                ? '无需注册 · 完全免费 · 隐私本地处理'
                : 'No registration · Completely free · Privacy-first, local processing'}
            </p>
          </div>
        </div>
      </div>

      {/* ══ COMPARE CTA ═══════════════════════════════════════════════════════ */}
      <div className="border-t border-[#2F5D57]/10 bg-[#FAF8F3]">
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-sm text-[#5b6661]">
            {isZh
              ? '想比较多个市场?'
              : 'Want to compare multiple markets?'}
            {' '}
            <Link to="/country-assessment" className="font-medium text-[#2F5D57] underline underline-offset-2 hover:text-[#1B2520]">
              {isZh
                ? '使用国别评估工具，一次最多比较 6 个市场 →'
                : 'Use the Country Assessment tool, compare up to 6 markets at once →'}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Markets;
