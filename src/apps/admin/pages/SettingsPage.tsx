// Settings Page
import { useState } from 'react';
import { Settings as SettingsIcon, Globe, Shield, Bell } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { toast } from 'sonner';

const TABS = [
  { key: 'general', label: '通用设置', icon: <SettingsIcon size={14} /> },
  { key: 'cloudflare', label: 'Cloudflare Analytics', icon: <Globe size={14} /> },
  { key: 'notifications', label: '通知设置', icon: <Bell size={14} /> },
  { key: 'security', label: '安全', icon: <Shield size={14} /> },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [siteName, setSiteName] = useState(() => localStorage.getItem('qhs_site_name') || '岐黄四海 · Qihuang Sihai');
  const [websiteId, setWebsiteId] = useState(() => localStorage.getItem('qhs_website_id') || 'zxqconsulting');
  const [cfToken, setCfToken] = useState(() => localStorage.getItem('qhs_cf_token') || '');
  const [cfZoneId, setCfZoneId] = useState(() => localStorage.getItem('qhs_cf_zone') || '');
  const [enableCF, setEnableCF] = useState(() => localStorage.getItem('qhs_cf_enabled') === '1');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyNewSubmission, setNotifyNewSubmission] = useState(true);
  const [notifyHighValue, setNotifyHighValue] = useState(true);

  const handleSave = (section: string) => {
    if (section === 'general') {
      localStorage.setItem('qhs_site_name', siteName);
      localStorage.setItem('qhs_website_id', websiteId);
    } else if (section === 'cloudflare') {
      localStorage.setItem('qhs_cf_token', cfToken);
      localStorage.setItem('qhs_cf_zone', cfZoneId);
      localStorage.setItem('qhs_cf_enabled', enableCF ? '1' : '0');
    } else if (section === 'notifications') {
      localStorage.setItem('qhs_notify_email', notifyEmail);
      localStorage.setItem('qhs_notify_submission', notifyNewSubmission ? '1' : '0');
      localStorage.setItem('qhs_notify_highvalue', notifyHighValue ? '1' : '0');
    }
    toast.success('设置已保存');
  };

  return (
    <>
      <PageHeader
        title="系统设置"
        description="配置管理后台与第三方集成"
        icon={<SettingsIcon size={18} className="text-zinc-400" />}
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--admin-card)] border border-[var(--admin-border)] mb-6 w-fit flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === 'general' && (
        <div className="admin-card max-w-2xl space-y-5">
          <h3 className="text-sm font-semibold text-white">通用设置</h3>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">站点名称</label>
            <input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--admin-card)] border border-[var(--admin-border)] text-sm text-white outline-none focus:border-emerald-500/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Website ID</label>
            <input
              value={websiteId}
              onChange={(e) => setWebsiteId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--admin-card)] border border-[var(--admin-border)] text-sm text-white font-mono outline-none focus:border-emerald-500/40"
            />
            <p className="text-xs text-zinc-500">用于区分不同站点的数据</p>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => handleSave('general')} className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors">
              保存
            </button>
          </div>
        </div>
      )}

      {/* Cloudflare */}
      {activeTab === 'cloudflare' && (
        <div className="space-y-4 max-w-2xl">
          <div className="admin-card space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={18} className="text-orange-400" />
                  <h3 className="text-sm font-semibold text-white">Cloudflare Analytics</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  集成 Cloudflare Analytics API 获取精确的访问数据，
                  包括地理位置、设备类型、性能指标等。
                </p>
              </div>
              <button
                onClick={() => setEnableCF(!enableCF)}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                  enableCF ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
              >
                <span className={`absolute top-0.5 ${enableCF ? 'left-5' : 'left-0.5'} w-5 h-5 bg-white rounded-full transition-all`} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400">API Token</label>
              <input
                type="password"
                value={cfToken}
                onChange={(e) => setCfToken(e.target.value)}
                placeholder="Cloudflare API Token"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--admin-card)] border border-[var(--admin-border)] text-sm text-white font-mono outline-none focus:border-emerald-500/40"
              />
              <p className="text-xs text-zinc-500">
                需要 Analytics:Read 权限
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400">Zone ID</label>
              <input
                value={cfZoneId}
                onChange={(e) => setCfZoneId(e.target.value)}
                placeholder="32 位 Zone ID"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--admin-card)] border border-[var(--admin-border)] text-sm text-white font-mono outline-none focus:border-emerald-500/40"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => handleSave('cloudflare')} className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors">
                保存配置
              </button>
            </div>
          </div>

          {/* Plan Notice */}
          <div className="admin-card border-orange-500/20">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Globe size={16} className="text-orange-400" />
              </div>
              <div>
                <div className="text-sm text-white font-medium">Cloudflare Analytics API 需要付费计划</div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Cloudflare GraphQL Analytics API 需要 Pro 计划（$20/月）以上才能通过 API 访问。
                  当前 <span className="text-orange-400 font-mono">zxqconsulting.com</span> 使用的是 Free 计划。
                  <br /><br />
                  你可以在{' '}
                  <a
                    href="https://dash.cloudflare.com/5fbde0c005ceb7b27c7e1f127b4f61b2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
                  >
                    Cloudflare Dashboard
                  </a>
                  {' '}手动查看 Analytics 数据。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="admin-card max-w-2xl space-y-5">
          <h3 className="text-sm font-semibold text-white">通知设置</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            当前版本的通知能力受 Cloudflare Pages 运行环境限制，暂不支持后台自动邮件/消息推送。
            后续如需接入邮件通知，建议补充 SMTP/Webhook 后端后再启用此处配置。
          </p>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="admin-card max-w-2xl space-y-5">
          <h3 className="text-sm font-semibold text-white">安全设置</h3>

          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 flex items-start gap-3">
            <Shield size={20} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm text-white font-medium">会话已加密</div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                所有 API 请求通过 Bearer Token 鉴权，Token 存储在 localStorage 中。
                建议在公共设备上使用后及时登出。
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-[var(--admin-border)]">
              <div>
                <div className="text-sm text-white font-medium">会话超时</div>
                <div className="text-xs text-zinc-500 mt-0.5">当前为静态 Token 会话，暂无自动登出机制</div>
              </div>
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">待实现</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-[var(--admin-border)]">
              <div>
                <div className="text-sm text-white font-medium">登录尝试限制</div>
                <div className="text-xs text-zinc-500 mt-0.5">当前无登录失败次数与锁定机制</div>
              </div>
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">待实现</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}