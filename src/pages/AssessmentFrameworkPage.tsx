/**
 * 出海国别选址评估体系完整展示页 - 简化版
 */

import { useState } from 'react';
import {
  Globe,
  Target,
  Shield,
  Users,
  TrendingUp,
  Building2,
  Database,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
} from 'lucide-react';

import {
  DIMENSIONS,
  PROFILES,
  READINESS_DIMENSIONS,
  HARD_GATES,
  ENTRY_MODES,
  INFO_DOMAINS,
  SCORE_LEVELS,
  EVIDENCE_LEVELS,
  COUNTRIES,
  type ProfileId,
} from '@/data/countryAssessment';

// 维度颜色
const DIMENSION_COLORS: Record<string, string> = {
  fit: '#6366f1',
  demand: '#f97316',
  access: '#10b981',
  competition: '#f59e0b',
  regulation: '#ef4444',
  macro: '#8b5cf6',
  economics: '#06b6d4',
  operations: '#84cc16',
  talent: '#ec4899',
  tax: '#14b8a6',
  esg: '#a855f7',
};

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm mb-8">
          <Globe className="w-4 h-4" />
          出海战略决策基础设施
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
            企业出海
          </span>
          <br />
          国别选址完整评估体系
        </h1>
        
        <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
          基于 11 个核心维度、7 套行业模板、6 项硬门槛机制，构建系统化、可审计的国家级进入决策框架
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {[
            { icon: Target, label: '11 评估维度', color: '#6366f1' },
            { icon: Users, label: '7 行业模板', color: '#f97316' },
            { icon: Shield, label: '6 硬门槛', color: '#10b981' },
            { icon: Database, label: '7 数据来源', color: '#8b5cf6' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
              <span className="text-white font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="inline-block p-6 rounded-2xl backdrop-blur-sm" style={{ backgroundColor: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.5)' }}>
          <div className="text-xs uppercase tracking-widest text-slate-400 mb-3">评分核心公式</div>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div>
              <div className="text-slate-500 mb-1">原始机会分</div>
              <div className="text-emerald-400 font-mono">O = Σ wᵢ × (rᵢ/5)</div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">可信度调整分</div>
              <div className="text-orange-400 font-mono">Oᶜ = Σ wᵢ × [cᵢ·(rᵢ/5) + (1-cᵢ)·0.5]</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 维度卡片
function DimensionCard({ dimension, index }: { dimension: typeof DIMENSIONS[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const color = DIMENSION_COLORS[dimension.id] || '#6366f1';
  
  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-300 hover:border-white/20"
      style={{ background: `linear-gradient(135deg, ${color}15 0%, rgba(15, 23, 42, 0.95) 100%)`, borderColor: 'rgba(255,255,255,0.1)' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center gap-4 text-left"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
          style={{ backgroundColor: `${color}30`, color }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1">{dimension.name}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{dimension.question}</p>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-5 pb-5 space-y-4 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">核心指标</div>
              <p className="text-sm text-slate-200">{dimension.metrics}</p>
            </div>
            <div className="p-3 rounded-xl md:col-span-2" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">最低证据要求</div>
              <p className="text-sm text-slate-200">{dimension.evidence}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 行业模板卡片
function ProfileCard({ id, profile, onClick, isActive }: { id: string; profile: typeof PROFILES.general; onClick: () => void; isActive: boolean }) {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl border cursor-pointer transition-all"
      style={{ 
        backgroundColor: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
        borderColor: isActive ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'
      }}
    >
      <h4 className="text-white font-semibold mb-2">{profile.name}</h4>
      <p className="text-sm text-slate-400 mb-4">{profile.note}</p>
      <div className="flex flex-wrap gap-1">
        {DIMENSIONS.slice(0, 4).map((d) => (
          <span
            key={d.id}
            className="px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: `${DIMENSION_COLORS[d.id]}30`, color: DIMENSION_COLORS[d.id] }}
          >
            {d.name.slice(0, 4)} {profile.weights[d.id as keyof typeof profile.weights]}%
          </span>
        ))}
      </div>
    </div>
  );
}

// 硬门槛卡片
function HardGateCard({ gate, index }: { gate: typeof HARD_GATES[0]; index: number }) {
  return (
    <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'rgba(127,29,29,0.5)', borderColor: 'rgba(239,68,68,0.2)' }}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.2)' }}>
          <XCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
        </div>
        <div className="flex-1">
          <div className="text-xs mb-1" style={{ color: 'rgba(239,68,68,0.6)' }}>HARD GATE {String(index + 1).padStart(2, '0')}</div>
          <h4 className="text-white font-semibold mb-2">{gate.name}</h4>
          <p className="text-sm text-slate-400 mb-3">{gate.detail}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.5)' }}>
            <Users className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-300">{gate.owner}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 评分等级
function ScoreLevelBadge({ level }: { level: typeof SCORE_LEVELS[0] }) {
  const color = level.value >= 4 ? '#10b981' : level.value >= 3 ? '#f59e0b' : '#ef4444';
  return (
    <div className="p-4 rounded-xl border" style={{ 
      backgroundColor: `${color}15`, 
      borderColor: `${color}30` 
    }}>
      <div className="text-2xl font-bold mb-1" style={{ color }}>{level.value}</div>
      <div className="text-sm text-white font-medium">{level.label.split('·')[1]?.trim() || level.label}</div>
      <div className="text-xs text-slate-400 mt-1">{level.hint}</div>
    </div>
  );
}

// 证据等级
function EvidenceLevelBadge({ level }: { level: typeof EVIDENCE_LEVELS[0] }) {
  const colors: Record<number, { bg: string; label: string }> = {
    0.95: { bg: '#10b981', label: 'A' },
    0.8: { bg: '#3b82f6', label: 'B' },
    0.65: { bg: '#f59e0b', label: 'C' },
    0.4: { bg: '#ef4444', label: 'D' },
  };
  const config = colors[level.value] || colors[0.65];

  return (
    <div className="p-4 rounded-xl border" style={{ 
      backgroundColor: `${config.bg}15`, 
      borderColor: `${config.bg}30` 
    }}>
      <div className="text-2xl font-bold mb-1" style={{ color: config.bg }}>{config.label}</div>
      <div className="text-sm text-white font-medium">{level.label.split('·')[1]?.trim()}</div>
      <div className="text-xs text-slate-400 mt-1">{level.hint}</div>
    </div>
  );
}

// 进入模式卡片
function EntryModeCard({ mode }: { mode: typeof ENTRY_MODES[0] }) {
  return (
    <div className="p-5 rounded-2xl border transition-all hover:border-indigo-500/30" style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
      <h4 className="text-white font-semibold mb-3">{mode.name}</h4>
      <div className="space-y-3">
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(16,185,129,0.8)' }}>优势</div>
          <p className="text-sm text-slate-300">{mode.advantages}</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(245,158,11,0.8)' }}>风险</div>
          <p className="text-sm text-slate-300">{mode.risks}</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(99,102,241,0.8)' }}>适用场景</div>
          <p className="text-sm text-slate-300">{mode.fit}</p>
        </div>
      </div>
    </div>
  );
}

// 数据来源
function InfoDomainCard({ domain }: { domain: typeof INFO_DOMAINS[0] }) {
  return (
    <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(30,41,59,0.3)', borderColor: 'rgba(255,255,255,0.05)' }}>
      <h4 className="text-white font-medium mb-2">{domain.domain}</h4>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-slate-500">数据源：</span>
          <span className="text-slate-300">{domain.sources}</span>
        </div>
        <div>
          <span className="text-slate-500">用途：</span>
          <span className="text-slate-300">{domain.use}</span>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Database className="w-3 h-3 text-indigo-400" />
          <span className="text-indigo-400 text-xs">{domain.cadence}</span>
        </div>
      </div>
    </div>
  );
}

// 决策矩阵
function DecisionMatrix() {
  const matrix = [
    { score: '≥75', readiness: '≥70', rec: '规模化进入', color: '#10b981', detail: '机会、证据与组织条件均较强，可进入分阶段拨款并保留退出触发器' },
    { score: '68-74', readiness: '55-69', rec: '验证性试点', color: '#3b82f6', detail: '具备进入潜力，但必须用真实客户、价格、履约和回款数据关闭关键假设' },
    { score: '≥68', readiness: '<55', rec: '补能力后进入', color: '#f59e0b', detail: '市场有吸引力，先补产品、渠道、合规或团队准备度短板' },
    { score: '55-67', readiness: '≥60', rec: '轻资产期权', color: '#8b5cf6', detail: '企业较有能力但国家吸引力一般，控制不可逆投入' },
    { score: '<55', readiness: '<60', rec: '暂缓观察', color: '#64748b', detail: '机会与准备度均不足，先关闭关键数据缺口' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <th className="text-left p-3 text-xs uppercase tracking-wider text-slate-500">调整分</th>
            <th className="text-left p-3 text-xs uppercase tracking-wider text-slate-500">准备度</th>
            <th className="text-left p-3 text-xs uppercase tracking-wider text-slate-500">结论</th>
            <th className="text-left p-3 text-xs uppercase tracking-wider text-slate-500">说明</th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i} className="border-b hover:bg-white/5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <td className="p-3 text-white font-mono">{row.score}</td>
              <td className="p-3 text-white font-mono">{row.readiness}</td>
              <td className="p-3">
                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${row.color}20`, color: row.color }}>
                  {row.rec}
                </span>
              </td>
              <td className="p-3 text-sm text-slate-400">{row.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 国家区域
function CountriesGrid() {
  const regions: Record<string, { name: string; countries: typeof COUNTRIES }> = {
    'eastasia': { name: '东北亚', countries: COUNTRIES.filter(c => c.region === 'eastasia') },
    'southeastasia': { name: '东南亚', countries: COUNTRIES.filter(c => c.region === 'southeastasia') },
    'middleast': { name: '中东', countries: COUNTRIES.filter(c => c.region === 'middleast') },
    'europe': { name: '欧洲', countries: COUNTRIES.filter(c => c.region === 'europe') },
    'northamerica': { name: '北美', countries: COUNTRIES.filter(c => c.region === 'northamerica') },
    'oceania': { name: '大洋洲', countries: COUNTRIES.filter(c => c.region === 'oceania') },
    'latinamerica': { name: '拉美', countries: COUNTRIES.filter(c => c.region === 'latinamerica') },
    'africa': { name: '非洲', countries: COUNTRIES.filter(c => c.region === 'africa') },
  };

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {Object.entries(regions).map(([key, region]) => (
        <div key={key} className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(30,41,59,0.3)', borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="text-sm font-medium mb-3" style={{ color: '#6366f1' }}>{region.name}</div>
          <div className="flex flex-wrap gap-2">
            {region.countries.map(c => (
              <span key={c.id} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(51,65,85,0.5)', color: '#cbd5e1' }}>
                {c.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 主页面
export function AssessmentFrameworkPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedProfile, setSelectedProfile] = useState<ProfileId>('general');

  const sections = [
    { id: 'overview', label: '体系概览', icon: Globe },
    { id: 'dimensions', label: '11 评估维度', icon: Target },
    { id: 'profiles', label: '行业模板', icon: Building2 },
    { id: 'readiness', label: '企业准备度', icon: Users },
    { id: 'gates', label: '硬门槛机制', icon: Shield },
    { id: 'evidence', label: '评分与证据', icon: Database },
    { id: 'modes', label: '进入模式', icon: TrendingUp },
    { id: 'data', label: '数据来源', icon: Database },
    { id: 'matrix', label: '决策矩阵', icon: Shield },
    { id: 'countries', label: '支持国家', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#020617' }}>
      {/* Hero */}
      <HeroSection />

      {/* 导航 */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ backgroundColor: 'rgba(2,6,23,0.8)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto py-4 gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all"
                style={{
                  backgroundColor: activeSection === section.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: activeSection === section.id ? '#a5b4fc' : '#94a3b8',
                  border: activeSection === section.id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                }}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 内容区 */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-20">
        
        {/* 体系概览 */}
        {activeSection === 'overview' && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">体系架构</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                从战略适配到落地执行的完整决策框架，确保每个出海决策都经过系统化、可审计的评估
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { step: 1, label: '企业准备度自评', desc: '6 维度能力诊断', color: '#6366f1' },
                { step: 2, label: '选择行业模板', desc: '7 套权重配置', color: '#f97316' },
                { step: 3, label: '候选国家评分', desc: '11 维度 1-5 分', color: '#10b981' },
                { step: 4, label: '硬门槛检查', desc: '6 项一票否决', color: '#ef4444' },
                { step: 5, label: '生成决策报告', desc: '排序 + 清单', color: '#8b5cf6' },
              ].map((item, i) => (
                <div key={item.step} className="flex items-center">
                  <div className="w-48 p-4 rounded-2xl border text-center" style={{ borderColor: `${item.color}30`, backgroundColor: `${item.color}10` }}>
                    <div className="w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${item.color}30`, color: item.color }}>
                      {item.step}
                    </div>
                    <div className="text-white font-medium text-sm">{item.label}</div>
                    <div className="text-slate-400 text-xs mt-1">{item.desc}</div>
                  </div>
                  {i < 4 && <ChevronRight className="w-6 h-6 text-slate-600 mx-2" />}
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-4 gap-4 mt-12">
              {[
                { label: '评估维度', value: '11', unit: '个', color: '#6366f1', icon: Target },
                { label: '行业模板', value: '7', unit: '套', color: '#f97316', icon: Building2 },
                { label: '支持国家', value: COUNTRIES.length.toString(), unit: '个', color: '#10b981', icon: Globe },
                { label: '数据来源', value: '7', unit: '类', color: '#8b5cf6', icon: Database },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 rounded-2xl border text-center"
                  style={{ borderColor: `${stat.color}20`, backgroundColor: `${stat.color}10` }}
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: stat.color }} />
                  <div className="text-4xl font-bold text-white mb-1">
                    {stat.value}
                    <span className="text-lg text-slate-400 ml-1">{stat.unit}</span>
                  </div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 11 评估维度 */}
        {activeSection === 'dimensions' && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">11 个核心评估维度</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                每个维度包含核心问题、关键指标和最低证据要求，确保评估的系统性和完整性
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {DIMENSIONS.map((dimension, index) => (
                <DimensionCard key={dimension.id} dimension={dimension} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* 行业模板 */}
        {activeSection === 'profiles' && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">7 套行业权重模板</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                针对不同行业特性预配置的权重方案，可直接使用或在此基础上自定义调整
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(PROFILES).map(([id, profile]) => (
                <ProfileCard
                  key={id}
                  id={id}
                  profile={profile}
                  onClick={() => setSelectedProfile(id as ProfileId)}
                  isActive={selectedProfile === id}
                />
              ))}
            </div>

            {selectedProfile && (
              <div className="mt-8 p-6 rounded-2xl border" style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <h3 className="text-lg font-semibold text-white mb-4">权重详情：{PROFILES[selectedProfile].name}</h3>
                <div className="space-y-3">
                  {DIMENSIONS.map((d) => (
                    <div key={d.id} className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DIMENSION_COLORS[d.id] }} />
                      <span className="text-slate-300 w-40">{d.name}</span>
                      <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: 'rgba(51,65,85,0.5)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${PROFILES[selectedProfile].weights[d.id as keyof typeof PROFILES.general.weights]}%`, backgroundColor: DIMENSION_COLORS[d.id] }}
                        />
                      </div>
                      <span className="text-white w-12 text-right">{PROFILES[selectedProfile].weights[d.id as keyof typeof PROFILES.general.weights]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 企业准备度 */}
        {activeSection === 'readiness' && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">企业准备度 6 维度</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                从产品、渠道、合规、交付、组织到资本的全面能力评估
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <h3 className="text-lg font-semibold text-white mb-6">准备度概览</h3>
                <div className="space-y-4">
                  {READINESS_DIMENSIONS.map((dim, idx) => (
                    <div key={dim.id} className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(30,41,59,0.3)', borderColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{dim.name}</span>
                        <span className="text-indigo-400 font-semibold">{dim.weight}%</span>
                      </div>
                      <p className="text-xs text-slate-400">{dim.test}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-indigo-400" />
                    <h4 className="text-indigo-200 font-semibold">准备度测试</h4>
                  </div>
                  <p className="text-sm text-indigo-200/80">
                    每个维度都有明确的"测试问题"，帮助企业自我诊断当前的能力水平。
                  </p>
                </div>
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-emerald-200 font-semibold">权重说明</h4>
                  </div>
                  <p className="text-sm text-emerald-200/80">
                    产品与获客能力各占 20%，是最关键的准备度指标。
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 硬门槛 */}
        {activeSection === 'gates' && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">6 项硬门槛一票否决</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                任何一项触发即停止推进，不可被市场规模或利润预期抵消
              </p>
            </div>

            <div className="p-4 rounded-2xl border flex items-start gap-4 mb-8" style={{ backgroundColor: 'rgba(127,29,29,0.3)', borderColor: 'rgba(239,68,68,0.3)' }}>
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-200 font-semibold mb-1">硬门槛原则</h4>
                <p className="text-sm text-red-200/80">
                  硬门槛是绝对底线，任何市场机会都不能凌驾于合规、安全或资本安全之上。
                  触发硬门槛后，必须明确责任人、解决路径和截止日期，方可重启评估。
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HARD_GATES.map((gate, index) => (
                <HardGateCard key={gate.id} gate={gate} index={index} />
              ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl border" style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <h3 className="text-lg font-semibold text-white mb-6">硬门槛状态流转</h3>
              <div className="flex items-center justify-center gap-4">
                {[
                  { label: '已通过', color: '#10b981' },
                  { label: '待验证', color: '#f59e0b' },
                  { label: '已触发', color: '#ef4444' },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }}>
                      {item.label === '已通过' && <CheckCircle2 className="w-4 h-4" style={{ color: item.color }} />}
                      {item.label === '待验证' && <Lightbulb className="w-4 h-4" style={{ color: item.color }} />}
                      {item.label === '已触发' && <XCircle className="w-4 h-4" style={{ color: item.color }} />}
                      <span className="text-sm" style={{ color: item.color }}>{item.label}</span>
                    </div>
                    {i < 2 && <ChevronRight className="w-5 h-5 text-slate-600 mx-2" />}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 评分与证据 */}
        {activeSection === 'evidence' && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">评分体系与证据等级</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                1-5 分制评分配合 A-D 证据等级，确保分数真实反映可验证的市场现实
              </p>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                评分等级（1-5 分）
              </h3>
              <div className="grid md:grid-cols-5 gap-4">
                {SCORE_LEVELS.map((level) => (
                  <ScoreLevelBadge key={level.value} level={level} />
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-400" />
                证据等级（可信度系数）
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                {EVIDENCE_LEVELS.map((level) => (
                  <EvidenceLevelBadge key={level.value} level={level} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 进入模式 */}
        {activeSection === 'modes' && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">7 种进入模式</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                从轻资产跨境直销到重资产并购，匹配不同阶段和风险偏好的战略选择
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ENTRY_MODES.map((mode) => (
                <EntryModeCard key={mode.id} mode={mode} />
              ))}
            </div>
          </section>
        )}

        {/* 数据来源 */}
        {activeSection === 'data' && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">7 类数据来源</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                明确的证据来源和更新频率，确保评估结论可追溯、可验证
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INFO_DOMAINS.map((domain) => (
                <InfoDomainCard key={domain.domain} domain={domain} />
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl border flex items-start gap-3" style={{ backgroundColor: 'rgba(120,53,15,0.3)', borderColor: 'rgba(245,158,11,0.3)' }}>
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-amber-200 font-semibold mb-1">证据质量警示</h4>
                <p className="text-sm text-amber-200/80">
                  单一来源或缺乏现场验证的证据只能作为 C 级假设使用。
                  任何进入规模化的决策，必须有至少 B 级（多源交叉验证）的证据支撑。
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 决策矩阵 */}
        {activeSection === 'matrix' && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">决策矩阵</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                基于调整分和企业准备度的标准化决策结论
              </p>
            </div>

            <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <DecisionMatrix />
            </div>
          </section>
        )}

        {/* 支持国家 */}
        {activeSection === 'countries' && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">已覆盖 {COUNTRIES.length} 个目标市场</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                涵盖全球主要经济体的出海目的地，支持按区域快速筛选
              </p>
            </div>

            <CountriesGrid />

            <div className="mt-12 p-6 rounded-2xl border" style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <h3 className="text-lg font-semibold text-white mb-6">区域战略定位参考</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { region: '东南亚', focus: '电商/消费品/制造业转移', color: '#10b981' },
                  { region: '中东', focus: '新能源/基建/奢侈品', color: '#f59e0b' },
                  { region: '欧洲', focus: '高端制造/B2B/品牌', color: '#3b82f6' },
                  { region: '北美', focus: '科技/消费品/资本布局', color: '#8b5cf6' },
                ].map((item) => (
                  <div key={item.region} className="p-4 rounded-xl border" style={{ borderColor: `${item.color}20`, backgroundColor: `${item.color}10` }}>
                    <div className="font-semibold mb-2" style={{ color: item.color }}>{item.region}</div>
                    <p className="text-sm text-slate-300">{item.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t py-12 mt-20" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-indigo-400" />
            <span className="text-white font-semibold">出海国别选址评估体系</span>
          </div>
          <p className="text-slate-400 text-sm">系统化 · 可审计 · 决策驱动</p>
          <p className="text-slate-500 text-xs mt-4">© 2026 张小强咨询团队 · 保留所有权利</p>
        </div>
      </footer>
    </div>
  );
}

export default AssessmentFrameworkPage;
