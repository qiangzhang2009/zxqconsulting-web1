/**
 * Projects 客户出海项目档案
 *
 * 后台核心模块 — 每个客户的出海项目独立档案
 * 包含:项目元数据、阶段、文档、协作记录、关键里程碑
 */

import { useState, useMemo, useEffect } from 'react';
import {
  Briefcase, Plus, Search, Filter, Calendar, User, MapPin, DollarSign,
  Target, Globe2, FileText, Clock, MoreHorizontal, TrendingUp, Building2,
  CheckCircle2, AlertCircle, XCircle, Edit3, Download, Trash2, ChevronRight,
  Star, MessageSquare, Link as LinkIcon, Bell, ChevronLeft, Archive, Layers,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { tracking as adminTracking } from '@/lib/tracking';

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'done' | 'overdue';
  assignee?: string;
  notes?: string;
}

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'compliance_doc' | 'research' | 'report' | 'other';
  uploadedAt: string;
  uploadedBy: string;
  size?: string;
}

interface Activity {
  id: string;
  type: 'note' | 'meeting' | 'milestone' | 'document' | 'status_change' | 'email';
  title: string;
  description?: string;
  by: string;
  at: string;
}

interface Project {
  id: string;
  name: string;
  code: string; // 项目编号
  client: string;
  clientEn?: string;
  industry: 'tcm' | 'supplement' | 'cosmetic' | 'medical' | 'other';
  status: 'exploring' | 'committed' | 'in_progress' | 'launched' | 'on_hold' | 'completed';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  targetMarkets: string[];
  category: string;
  startDate: string;
  expectedLaunchDate?: string;
  budget: string;
  budgetAmount?: number;
  currency: 'CNY' | 'USD' | 'EUR' | 'JPY';
  advisor: string;
  source: string; // 来源 (网站诊断/客户介绍/展会)
  milestones: Milestone[];
  documents: Document[];
  activities: Activity[];
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG = {
  exploring: { label: '探索阶段', color: 'text-zinc-400', bg: 'bg-zinc-500/10', icon: Compass },
  committed: { label: '已立项', color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Target },
  in_progress: { label: '进行中', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: TrendingUp },
  launched: { label: '已落地', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  on_hold: { label: '暂停', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
  completed: { label: '已完成', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Star },
};

const PRIORITY_CONFIG = {
  urgent: { label: '紧急', color: 'text-red-400', bg: 'bg-red-500/10' },
  high: { label: '高', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  medium: { label: '中', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  low: { label: '低', color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
};

const INDUSTRY_CONFIG = {
  tcm: { label: '中医药与本草', icon: '🌿' },
  supplement: { label: '保健食品', icon: '💊' },
  cosmetic: { label: '汉方护肤', icon: '✨' },
  medical: { label: '医疗与器械', icon: '🩺' },
  other: { label: '其他', icon: '📦' },
};

// ============================================================
// 示例数据 — 实际生产环境由 API 提供
// ============================================================
const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: '某百年药企东南亚三国准入',
    code: 'TCM-2026-001',
    client: '某百年制药企业',
    industry: 'tcm',
    status: 'in_progress',
    priority: 'high',
    targetMarkets: ['新加坡', '马来西亚', '泰国'],
    category: '中成药',
    startDate: '2026-01-15',
    expectedLaunchDate: '2026-07-30',
    budget: '¥80-120 万',
    budgetAmount: 1000000,
    currency: 'CNY',
    advisor: '张强',
    source: '网站 AI 诊断',
    tags: ['复盘案例', '东南亚', '中成药'],
    milestones: [
      { id: 'm1', title: '新加坡 HAS 认证', dueDate: '2026-03-30', status: 'done', assignee: '张强' },
      { id: 'm2', title: '马来西亚注册', dueDate: '2026-05-15', status: 'in_progress', assignee: '张强' },
      { id: 'm3', title: '泰国注册', dueDate: '2026-07-15', status: 'pending', assignee: '张强' },
    ],
    documents: [
      { id: 'd1', name: 'HAS 认证文件.pdf', type: 'compliance_doc', uploadedAt: '2026-03-28', uploadedBy: '张强', size: '2.3 MB' },
      { id: 'd2', name: '客户合同 v2.pdf', type: 'contract', uploadedAt: '2026-01-20', uploadedBy: '系统', size: '450 KB' },
    ],
    activities: [
      { id: 'a1', type: 'milestone', title: '完成新加坡 HAS 认证', by: '张强', at: '2026-03-28' },
      { id: 'a2', type: 'meeting', title: '客户周会', description: '讨论马来西亚注册进度', by: '张强', at: '2026-04-05' },
      { id: 'a3', type: 'note', title: '备注', description: '客户希望加快马来西亚注册速度,已与本地代理沟通', by: '张强', at: '2026-04-10' },
    ],
    createdAt: '2026-01-15',
    updatedAt: '2026-04-10',
  },
  {
    id: 'proj-002',
    name: '汉方护肤日本市场启动',
    code: 'SKN-2026-002',
    client: '某本草护肤品牌',
    industry: 'cosmetic',
    status: 'committed',
    priority: 'medium',
    targetMarkets: ['日本'],
    category: '汉方功效护肤',
    startDate: '2026-03-01',
    expectedLaunchDate: '2026-12-01',
    budget: '$50-80 万',
    budgetAmount: 600000,
    currency: 'USD',
    advisor: '李静',
    source: '客户介绍',
    tags: ['日本', 'DTC', '汉方'],
    milestones: [
      { id: 'm1', title: '产品本地化包装', dueDate: '2026-05-01', status: 'in_progress', assignee: '李静' },
      { id: 'm2', title: '独立站搭建', dueDate: '2026-07-01', status: 'pending', assignee: '李静' },
    ],
    documents: [
      { id: 'd1', name: '产品资料册.pdf', type: 'other', uploadedAt: '2026-03-05', uploadedBy: '客户', size: '8.5 MB' },
    ],
    activities: [
      { id: 'a1', type: 'meeting', title: '首次客户对接会议', by: '李静', at: '2026-03-01' },
    ],
    createdAt: '2026-03-01',
    updatedAt: '2026-04-12',
  },
  {
    id: 'proj-003',
    name: '保健品欧盟双轨进入',
    code: 'SUP-2026-003',
    client: '某保健品集团',
    industry: 'supplement',
    status: 'in_progress',
    priority: 'high',
    targetMarkets: ['德国', '法国', '荷兰'],
    category: '保健食品',
    startDate: '2025-09-15',
    expectedLaunchDate: '2027-09-30',
    budget: '€50-100 万',
    budgetAmount: 750000,
    currency: 'EUR',
    advisor: '张强',
    source: '网站 AI 诊断',
    tags: ['欧盟', '双轨', 'THR', '保健食品'],
    milestones: [
      { id: 'm1', title: '食品补充剂渠道进入', dueDate: '2026-05-01', status: 'done', assignee: '张强' },
      { id: 'm2', title: '月销 €10万 达成', dueDate: '2026-08-30', status: 'in_progress', assignee: '张强' },
      { id: 'm3', title: 'THR 基础数据收集', dueDate: '2026-12-31', status: 'pending', assignee: '张强' },
    ],
    documents: [
      { id: 'd1', name: '食品补充剂合规资料.zip', type: 'compliance_doc', uploadedAt: '2026-04-20', uploadedBy: '张强', size: '15.2 MB' },
      { id: 'd2', name: '客户合同.pdf', type: 'contract', uploadedAt: '2025-09-20', uploadedBy: '系统', size: '780 KB' },
    ],
    activities: [
      { id: 'a1', type: 'milestone', title: '月销达成 €10 万', by: '张强', at: '2026-04-20' },
      { id: 'a2', type: 'note', title: '备注', description: '客户对 THR 路径持开放态度,建议同步准备', by: '张强', at: '2026-04-25' },
    ],
    createdAt: '2025-09-15',
    updatedAt: '2026-04-25',
  },
];

// ============================================================
// 主组件
// ============================================================
export function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const projects = SAMPLE_PROJECTS;

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || p.priority === priorityFilter;
      const matchesIndustry = industryFilter === 'all' || p.industry === industryFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesIndustry;
    });
  }, [projects, search, statusFilter, priorityFilter, industryFilter]);

  useEffect(() => {
    adminTracking.pageView({ page: 'admin/projects' });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="客户出海项目档案"
        description={`共 ${projects.length} 个项目 · 进行中 ${projects.filter(p => p.status === 'in_progress').length} · 已立项 ${projects.filter(p => p.status === 'committed').length}`}
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30"
          >
            <Plus size={16} />
            新建项目
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索项目、客户或编号..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown
            label="状态"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: '全部' },
              ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
            ]}
          />
          <FilterDropdown
            label="优先级"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: 'all', label: '全部' },
              ...Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
            ]}
          />
          <FilterDropdown
            label="行业"
            value={industryFilter}
            onChange={setIndustryFilter}
            options={[
              { value: 'all', label: '全部' },
              ...Object.entries(INDUSTRY_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
            ]}
          />
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="总项目" value={projects.length} icon={Briefcase} />
        <StatCard
          label="进行中"
          value={projects.filter(p => p.status === 'in_progress').length}
          icon={TrendingUp}
          color="text-blue-400"
        />
        <StatCard
          label="紧急项目"
          value={projects.filter(p => p.priority === 'urgent' || p.priority === 'high').length}
          icon={AlertCircle}
          color="text-orange-400"
        />
        <StatCard
          label="累计跟进客户"
          value={`${projects.length}+`}
          icon={Building2}
          color="text-emerald-400"
        />
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={28} />}
          title="暂无项目"
          description="点击右上角「新建项目」开始创建第一个客户出海项目"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
// ============================================================
// Project Card
// ============================================================
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const statusConfig = STATUS_CONFIG[project.status];
  const priorityConfig = PRIORITY_CONFIG[project.priority];
  const StatusIcon = statusConfig.icon;
  const industryConfig = INDUSTRY_CONFIG[project.industry];

  const completedMilestones = project.milestones.filter(m => m.status === 'done').length;
  const totalMilestones = project.milestones.length;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 p-5 transition-all hover:border-emerald-500/30 hover:bg-zinc-900/70"
    >
      {/* Top Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="font-mono">{project.code}</span>
            <span>·</span>
            <span>{industryConfig.icon} {industryConfig.label}</span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-white truncate">{project.name}</h3>
          <p className="mt-1 text-sm text-zinc-400">{project.client}</p>
        </div>
        <div className={cn(
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium',
          priorityConfig.bg, priorityConfig.color
        )}>
          {priorityConfig.label}
        </div>
      </div>

      {/* Status & Markets */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className={cn(
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium',
          statusConfig.bg, statusConfig.color
        )}>
          <StatusIcon size={12} />
          {statusConfig.label}
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <Globe2 size={12} />
          {project.targetMarkets.join(', ')}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>里程碑进度</span>
          <span className="font-medium text-zinc-300">
            {completedMilestones}/{totalMilestones}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="mt-4 flex items-center justify-between border-t border-zinc-800/50 pt-3">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-1">
            <User size={12} />
            {project.advisor}
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={12} />
            {project.budget}
          </div>
        </div>
        <ChevronRight size={16} className="text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-emerald-400" />
      </div>
    </div>
  );
}

// ============================================================
// Project Detail Modal
// ============================================================
function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'milestones' | 'documents' | 'activities'>('overview');
  const statusConfig = STATUS_CONFIG[project.status];
  const industryConfig = INDUSTRY_CONFIG[project.industry];
  const StatusIcon = statusConfig.icon;

  return (
    <Modal open={true} onClose={onClose} size="xl" title={project.name}>
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex flex-wrap items-start gap-4 border-b border-zinc-800 pb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="font-mono">{project.code}</span>
              <span>·</span>
              <span>{industryConfig.icon} {industryConfig.label}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">{project.client}</p>
          </div>
          <div className={cn(
            'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold',
            statusConfig.bg, statusConfig.color
          )}>
            <StatusIcon size={14} />
            {statusConfig.label}
          </div>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetaItem icon={MapPin} label="目标市场" value={project.targetMarkets.join(', ')} />
          <MetaItem icon={Calendar} label="开始日期" value={project.startDate} />
          <MetaItem
            icon={Calendar}
            label="预计上线"
            value={project.expectedLaunchDate || '待定'}
          />
          <MetaItem icon={DollarSign} label="预算" value={project.budget} />
          <MetaItem icon={User} label="负责顾问" value={project.advisor} />
          <MetaItem icon={Globe2} label="来源" value={project.source} />
          <MetaItem icon={Building2} label="品类" value={project.category} />
          <MetaItem icon={Clock} label="更新于" value={project.updatedAt} />
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {project.tags.map(tag => (
              <span
                key={tag}
                className="rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-xs text-zinc-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-zinc-800">
          {[
            { id: 'overview', label: '概览', count: 0 },
            { id: 'milestones', label: '里程碑', count: project.milestones.length },
            { id: 'documents', label: '文档', count: project.documents.length },
            { id: 'activities', label: '协作记录', count: project.activities.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm transition-colors',
                tab === t.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px]',
                  tab === t.id ? 'bg-emerald-500/20' : 'bg-zinc-800'
                )}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'overview' && (
          <div className="space-y-4">
            {project.notes && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="text-xs font-medium text-zinc-500">备注</div>
                <p className="mt-2 text-sm text-zinc-300">{project.notes}</p>
              </div>
            )}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-xs font-medium text-zinc-500">项目进展</div>
              <div className="mt-3 grid grid-cols-3 gap-4">
                <MetricItem label="完成里程碑" value={`${project.milestones.filter(m => m.status === 'done').length}/${project.milestones.length}`} />
                <MetricItem label="上传文档" value={`${project.documents.length} 个`} />
                <MetricItem label="协作记录" value={`${project.activities.length} 条`} />
              </div>
            </div>
          </div>
        )}

        {tab === 'milestones' && (
          <div className="space-y-3">
            {project.milestones.map((m) => (
              <MilestoneRow key={m.id} milestone={m} />
            ))}
            {project.milestones.length === 0 && (
              <EmptyState icon={<Target size={28} />} title="暂无里程碑" description="点击右下角按钮添加第一个里程碑" />
            )}
          </div>
        )}

        {tab === 'documents' && (
          <div className="space-y-2">
            {project.documents.map((d) => (
              <DocumentRow key={d.id} doc={d} />
            ))}
            {project.documents.length === 0 && (
              <EmptyState icon={<FileText size={28} />} title="暂无文档" description="上传第一份项目文档" />
            )}
          </div>
        )}

        {tab === 'activities' && (
          <div className="space-y-3">
            {project.activities.map((a) => (
              <ActivityRow key={a.id} activity={a} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ============================================================
// Create Project Modal
// ============================================================
function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: '',
    client: '',
    industry: 'tcm',
    status: 'exploring',
    priority: 'medium',
    targetMarkets: '',
    category: '',
    budget: '',
    advisor: '张强',
    source: '网站 AI 诊断',
  });

  return (
    <Modal open={true} onClose={onClose} size="lg" title="新建客户出海项目">
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="项目名称" required>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="如：某百年药企东南亚三国准入"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </FormField>
          <FormField label="客户名称" required>
            <input
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </FormField>
          <FormField label="品类">
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="中成药 / 保健食品 / 汉方护肤"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </FormField>
          <FormField label="行业">
            <select
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              {Object.entries(INDUSTRY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="状态">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="优先级">
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="目标市场">
            <input
              value={form.targetMarkets}
              onChange={(e) => setForm({ ...form, targetMarkets: e.target.value })}
              placeholder="如: 日本, 韩国, 澳大利亚"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </FormField>
          <FormField label="预算">
            <input
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="如: ¥80-120 万"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </FormField>
          <FormField label="负责顾问">
            <input
              value={form.advisor}
              onChange={(e) => setForm({ ...form, advisor: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </FormField>
          <FormField label="来源">
            <input
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            取消
          </button>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white"
          >
            创建项目
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================================
// Sub-components
// ============================================================
function FilterDropdown({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
    >
      <option value="all">{label}: 全部</option>
      {options.filter(o => o.value !== 'all').map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function StatCard({
  label, value, icon: Icon, color = 'text-white',
}: {
  label: string; value: number | string; icon: React.ElementType; color?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-500">{label}</div>
        <Icon className={cn('h-4 w-4', color)} />
      </div>
      <div className={cn('mt-2 text-2xl font-bold', color)}>{value}</div>
    </div>
  );
}

function MetaItem({
  icon: Icon, label, value,
}: {
  icon: React.ElementType; label: string; value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Icon size={12} />
        {label}
      </div>
      <div className="mt-1 text-sm text-white">{value}</div>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function MilestoneRow({ milestone }: { milestone: Milestone }) {
  const statusStyle = {
    done: 'border-emerald-500/30 bg-emerald-500/10',
    in_progress: 'border-blue-500/30 bg-blue-500/10',
    pending: 'border-zinc-700 bg-zinc-900/40',
    overdue: 'border-red-500/30 bg-red-500/10',
  }[milestone.status];

  const statusIcon = {
    done: <CheckCircle2 size={16} className="text-emerald-400" />,
    in_progress: <Clock size={16} className="text-blue-400" />,
    pending: <Target size={16} className="text-zinc-500" />,
    overdue: <AlertCircle size={16} className="text-red-400" />,
  }[milestone.status];

  return (
    <div className={cn('flex items-center gap-4 rounded-xl border p-4', statusStyle)}>
      {statusIcon}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white">{milestone.title}</h4>
        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
          <span>截止: {milestone.dueDate}</span>
          {milestone.assignee && <span>负责人: {milestone.assignee}</span>}
        </div>
      </div>
    </div>
  );
}

function DocumentRow({ doc }: { doc: Document }) {
  const docIcon = {
    contract: <FileText size={16} />,
    compliance_doc: <FileText size={16} />,
    research: <FileText size={16} />,
    report: <FileText size={16} />,
    other: <FileText size={16} />,
  }[doc.type];

  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 hover:bg-zinc-900/70 transition-colors">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
        {docIcon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{doc.name}</div>
        <div className="text-xs text-zinc-500">
          {doc.uploadedAt} · {doc.uploadedBy} · {doc.size}
        </div>
      </div>
      <button className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
        <Download size={16} />
      </button>
    </div>
  );
}

function ActivityRow({ activity }: { activity: Activity }) {
  const iconMap = {
    note: MessageSquare,
    meeting: Calendar,
    milestone: Target,
    document: FileText,
    status_change: TrendingUp,
    email: MessageSquare,
  };
  const Icon = iconMap[activity.type];

  return (
    <div className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-emerald-400">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white">{activity.title}</h4>
        {activity.description && (
          <p className="mt-1 text-sm text-zinc-400">{activity.description}</p>
        )}
        <div className="mt-2 text-xs text-zinc-500">
          {activity.by} · {activity.at}
        </div>
      </div>
    </div>
  );
}

function FormField({
  label, required, children,
}: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

// 自定义 Compass 图标(用于项目状态)
function Compass({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

export default ProjectsPage;