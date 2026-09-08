// Navigation metadata — single source of truth for menu, command palette, mobile nav
import {
  LayoutDashboard,
  ClipboardList,
  Brain,
  Users,
  BarChart3,
  Heart,
  MessageSquare,
  Settings,
  CheckSquare,
  Search,
  Inbox,
  ScrollText,
  Shield,
  FileText,
  Activity,
  Briefcase,
  Globe2,
  type LucideIcon,
} from 'lucide-react';

export type NavKey =
  | 'dashboard'
  | 'tasks'
  | 'submissions'
  | 'client-intake'
  | 'diagnoses'
  | 'projects'
  | 'research'
  | 'report-analytics'
  | 'report-comments'
  | 'visitors'
  | 'comments'
  | 'whitepapers'
  | 'audit-log'
  | 'security'
  | 'settings';

export interface NavItem {
  key: NavKey;
  label: string;
  icon: LucideIcon;
  path: string;
  description?: string;
  /** Quick keyboard shortcut letter (used in Cmd-K palette) */
  shortcut?: string;
  /** Permissions required to view (matches useAuth role permissions) */
  permission?: 'read' | 'write' | 'delete' | 'admin';
}

export interface NavSection {
  key: string;
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    key: 'workspace',
    label: '工作台',
    items: [
      {
        key: 'dashboard',
        label: '概览',
        icon: LayoutDashboard,
        path: '/admin',
        description: '业务概览与关键指标',
        shortcut: 'G D',
      },
      {
        key: 'tasks',
        label: '任务中心',
        icon: CheckSquare,
        path: '/admin/tasks',
        description: '从真实数据派生的待办事项',
        shortcut: 'G T',
      },
    ],
  },
  {
    key: 'customer',
    label: '客户',
    items: [
      {
        key: 'submissions',
        label: '线索管理',
        icon: Inbox,
        path: '/admin/submissions',
        description: '网站表单提交的线索',
        shortcut: 'G L',
      },
      {
        key: 'client-intake',
        label: '客户采集',
        icon: ClipboardList,
        path: '/admin/client-intake',
        description: '完整企业出海信息采集表',
        shortcut: 'G C',
      },
      {
        key: 'diagnoses',
        label: 'AI 诊断报告',
        icon: Brain,
        path: '/admin/diagnoses',
        description: '智能诊断报告分级与归档',
        shortcut: 'G A',
      },
      {
        key: 'projects',
        label: '客户项目',
        icon: Briefcase,
        path: '/admin/projects',
        description: '出海项目档案与里程碑',
        shortcut: 'G P',
      },
    ],
  },
  {
    key: 'analytics',
    label: '分析',
    items: [
      {
        key: 'research',
        label: '研究报告',
        icon: Search,
        path: '/admin/research',
        description: '研究报告阅读数据',
        shortcut: 'G R',
      },
      {
        key: 'report-analytics',
        label: '报告互动',
        icon: Heart,
        path: '/admin/report-analytics',
        description: '点赞 · 分享 · 阅读时长',
      },
      {
        key: 'report-comments',
        label: '报告留言',
        icon: MessageSquare,
        path: '/admin/report-comments',
        description: '报告评论审核',
      },
      {
        key: 'visitors',
        label: '访客分析',
        icon: Users,
        path: '/admin/visitors',
        description: '访客画像与行为',
        shortcut: 'G V',
      },
      {
        key: 'comments',
        label: '网站评论',
        icon: MessageSquare,
        path: '/admin/comments',
        description: '网站底部评论审核',
      },
    ],
  },
  {
    key: 'content',
    label: '内容运营',
    items: [
      {
        key: 'whitepapers',
        label: '白皮书流水线',
        icon: FileText,
        path: '/admin/whitepapers',
        description: '报告草稿 → 多语言发布',
      },
    ],
  },
  {
    key: 'system',
    label: '系统',
    items: [
      {
        key: 'audit-log',
        label: '操作日志',
        icon: ScrollText,
        path: '/admin/audit-log',
        description: '全站操作审计追踪',
        permission: 'admin',
      },
      {
        key: 'security',
        label: '安全设置',
        icon: Shield,
        path: '/admin/security',
        description: '管理员 · 2FA · IP 白名单',
        permission: 'admin',
      },
      {
        key: 'settings',
        label: '系统设置',
        icon: Settings,
        path: '/admin/settings',
        description: '站点与通知配置',
        permission: 'admin',
      },
    ],
  },
];

export const NAV_FOOTER_ITEMS: NavItem[] = [
  {
    key: 'settings',
    label: '站点设置',
    icon: Settings,
    path: '/admin/settings',
    permission: 'admin',
  },
];

/** Flat list of all nav items, used by command palette & search */
export const NAV_ITEMS_FLAT: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export function findNavItem(pathname: string): NavItem | null {
  if (pathname === '/admin' || pathname === '/admin/') {
    return NAV_ITEMS_FLAT.find((i) => i.key === 'dashboard') || null;
  }
  return (
    NAV_ITEMS_FLAT.find(
      (i) => pathname === i.path || pathname.startsWith(`${i.path}/`)
    ) || null
  );
}

export const ROLE_LABELS: Record<string, string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  editor: '编辑',
  viewer: '查看员',
};

export const ROLE_BADGE: Record<string, string> = {
  super_admin: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  admin: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  editor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  viewer: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
};
