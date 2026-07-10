// Settings Page - Professional System Configuration
import { useState } from 'react';
import {
  Settings as SettingsIcon, Globe, Shield, Bell, User, Database, Key,
  Monitor, Palette, Code, Save, AlertTriangle, CheckCircle, Eye, EyeOff,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'general', label: '通用', icon: <SettingsIcon size={14} /> },
  { key: 'profile', label: '个人资料', icon: <User size={14} /> },
  { key: 'integrations', label: '集成', icon: <Database size={14} /> },
  { key: 'appearance', label: '外观', icon: <Palette size={14} /> },
  { key: 'security', label: '安全', icon: <Shield size={14} /> },
  { key: 'api', label: 'API', icon: <Code size={14} /> },
];

function ToggleSwitch({ enabled, onChange, label }: {
  enabled: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors shrink-0',
        enabled ? 'bg-emerald-500' : 'bg-zinc-700'
      )}
    >
      <span className={cn(
        'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm',
        enabled ? 'left-5' : 'left-0.5'
      )} />
    </button>
  );
}

function SettingSection({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
      </div>
      <div className="space-y-5">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-zinc-800/50 last:border-0 last:pb-0 first:pt-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{label}</div>
        {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingInput({ label, value, onChange, placeholder, type = 'text' }: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-zinc-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500/40 transition-colors"
      />
    </div>
  );
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [siteName, setSiteName] = useState(() => localStorage.getItem('qhs_site_name') || '岐黄四海 · Qihuang Sihai');
  const [websiteId, setWebsiteId] = useState(() => localStorage.getItem('qhs_website_id') || 'zxqconsulting');
  const [cfToken, setCfToken] = useState(() => localStorage.getItem('qhs_cf_token') || '');
  const [cfZoneId, setCfZoneId] = useState(() => localStorage.getItem('qhs_cf_zone') || '');
  const [enableCF, setEnableCF] = useState(() => localStorage.getItem('qhs_cf_enabled') === '1');
  const [showCfToken, setShowCfToken] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const handleSave = (section: string) => {
    if (section === 'general') {
      localStorage.setItem('qhs_site_name', siteName);
      localStorage.setItem('qhs_website_id', websiteId);
    } else if (section === 'cloudflare') {
      localStorage.setItem('qhs_cf_token', cfToken);
      localStorage.setItem('qhs_cf_zone', cfZoneId);
      localStorage.setItem('qhs_cf_enabled', enableCF ? '1' : '0');
    }
    toast.success('设置已保存');
  };

  return (
    <>
      <PageHeader
        title="系统设置"
        description="配置管理后台与系统参数"
        icon={<SettingsIcon size={18} className="text-zinc-400" />}
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/50 border border-zinc-800/50 mb-6 w-fit flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="max-w-3xl space-y-6">
          <SettingSection
            title="基本信息"
            description="站点基本配置信息"
          >
            <SettingInput
              label="站点名称"
              value={siteName}
              onChange={setSiteName}
              placeholder="输入站点名称"
            />
            <SettingInput
              label="Website ID"
              value={websiteId}
              onChange={setWebsiteId}
              placeholder="唯一标识符"
            />
            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleSave('general')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-sm transition-colors"
              >
                <Save size={16} />
                保存更改
              </button>
            </div>
          </SettingSection>

          <SettingSection
            title="性能配置"
            description="系统性能相关设置"
          >
            <SettingRow
              label="数据缓存"
              description="启用后减少 API 请求次数"
            >
              <ToggleSwitch enabled={true} onChange={() => {}} />
            </SettingRow>
            <SettingRow
              label="自动刷新"
              description="页面数据自动刷新间隔"
            >
              <select className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white outline-none">
                <option value="30">30 秒</option>
                <option value="60">1 分钟</option>
                <option value="300">5 分钟</option>
                <option value="0">关闭</option>
              </select>
            </SettingRow>
          </SettingSection>
        </div>
      )}

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-3xl space-y-6">
          <SettingSection
            title="个人信息"
            description="管理您的账户信息"
          >
            <div className="flex items-center gap-4 pb-4 border-b border-zinc-800/50">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                A
              </div>
              <div>
                <button className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-white transition-colors">
                  更换头像
                </button>
                <p className="text-xs text-zinc-500 mt-2">支持 JPG、PNG，最大 2MB</p>
              </div>
            </div>
            <SettingInput
              label="显示名称"
              value="管理员"
              onChange={() => {}}
              placeholder="您的显示名称"
            />
            <SettingInput
              label="邮箱地址"
              value="admin@zxq.com"
              onChange={() => {}}
              placeholder="邮箱地址"
            />
            <SettingInput
              label="职位"
              value="系统管理员"
              onChange={() => {}}
              placeholder="您的职位"
            />
          </SettingSection>
        </div>
      )}

      {/* Integrations */}
      {activeTab === 'integrations' && (
        <div className="max-w-3xl space-y-6">
          <SettingSection
            title="Cloudflare Analytics"
            description="集成 Cloudflare Analytics API 获取精确的访问数据"
          >
            <SettingRow
              label="启用 Cloudflare"
              description="连接 Cloudflare 获取更详细的分析数据"
            >
              <ToggleSwitch enabled={enableCF} onChange={setEnableCF} />
            </SettingRow>
            {enableCF && (
              <>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-400">API Token</label>
                  <div className="relative">
                    <input
                      type={showCfToken ? 'text' : 'password'}
                      value={cfToken}
                      onChange={(e) => setCfToken(e.target.value)}
                      placeholder="Cloudflare API Token"
                      className="w-full px-4 py-2.5 pr-10 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-sm text-white font-mono placeholder-zinc-500 outline-none focus:border-emerald-500/40 transition-colors"
                    />
                    <button
                      onClick={() => setShowCfToken(!showCfToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showCfToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500">需要 Analytics:Read 权限</p>
                </div>
                <SettingInput
                  label="Zone ID"
                  value={cfZoneId}
                  onChange={setCfZoneId}
                  placeholder="32 位 Zone ID"
                />
              </>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
              <AlertTriangle size={18} className="text-orange-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="text-white font-medium">需要 Cloudflare Pro 计划</div>
                <p className="text-zinc-400 mt-1 text-xs leading-relaxed">
                  Cloudflare GraphQL Analytics API 需要 Pro 计划（$20/月）以上才能通过 API 访问。
                  当前使用的是 Free 计划。
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleSave('cloudflare')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-sm transition-colors"
              >
                <Save size={16} />
                保存配置
              </button>
            </div>
          </SettingSection>
        </div>
      )}

      {/* Appearance */}
      {activeTab === 'appearance' && (
        <div className="max-w-3xl space-y-6">
          <SettingSection
            title="主题设置"
            description="自定义界面外观"
          >
            <SettingRow
              label="深色模式"
              description="使用深色主题界面"
            >
              <ToggleSwitch enabled={darkMode} onChange={setDarkMode} />
            </SettingRow>
            <SettingRow
              label="紧凑模式"
              description="减少元素间距，显示更多内容"
            >
              <ToggleSwitch enabled={compactMode} onChange={setCompactMode} />
            </SettingRow>
            <SettingRow
              label="高对比度"
              description="增强文字与背景对比度"
            >
              <ToggleSwitch enabled={highContrast} onChange={setHighContrast} />
            </SettingRow>
          </SettingSection>

          <SettingSection
            title="侧边栏"
            description="侧边栏配置"
          >
            <SettingRow
              label="默认折叠"
              description="页面加载时自动折叠侧边栏"
            >
              <ToggleSwitch enabled={false} onChange={() => {}} />
            </SettingRow>
            <SettingRow
              label="显示图标标签"
              description="折叠时显示悬停提示"
            >
              <ToggleSwitch enabled={true} onChange={() => {}} />
            </SettingRow>
          </SettingSection>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="max-w-3xl space-y-6">
          <SettingSection
            title="安全设置"
            description="账户与系统安全配置"
          >
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm text-white font-medium">会话已加密</div>
                <p className="text-zinc-400 mt-1 text-xs leading-relaxed">
                  所有 API 请求通过 Bearer Token 鉴权，Token 存储在本地。
                  建议在公共设备上使用后及时登出。
                </p>
              </div>
            </div>
            <SettingRow
              label="双因素认证"
              description="登录时需要手机验证码"
            >
              <button className="px-3 py-1.5 rounded-lg bg-zinc-800 text-sm text-zinc-400 hover:text-white transition-colors">
                未启用
              </button>
            </SettingRow>
            <SettingRow
              label="会话超时"
              description="无操作后自动登出"
            >
              <select className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white outline-none">
                <option value="30">30 分钟</option>
                <option value="60">1 小时</option>
                <option value="240">4 小时</option>
                <option value="0">从不</option>
              </select>
            </SettingRow>
          </SettingSection>

          <SettingSection
            title="登录历史"
            description="最近的登录活动"
          >
            {[
              { device: 'Chrome on macOS', location: '上海市', time: '2026-07-10 14:28', current: true },
              { device: 'Safari on iPhone', location: '上海市', time: '2026-07-09 09:15', current: false },
              { device: 'Chrome on Windows', location: '北京市', time: '2026-07-08 16:42', current: false },
            ].map((login, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <Monitor size={14} className="text-zinc-500" />
                    <span className="text-sm text-white">{login.device}</span>
                    {login.current && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">当前</span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {login.location} · {login.time}
                  </div>
                </div>
                {!login.current && (
                  <button className="text-xs text-red-400 hover:text-red-300">移除</button>
                )}
              </div>
            ))}
          </SettingSection>
        </div>
      )}

      {/* API Settings */}
      {activeTab === 'api' && (
        <div className="max-w-3xl space-y-6">
          <SettingSection
            title="API 密钥"
            description="用于程序化访问管理后台"
          >
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-400">API Token</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value="sk_live_xxxxxxxxxxxx"
                  readOnly
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-sm text-white font-mono outline-none"
                />
                <button className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm text-white transition-colors">
                  复制
                </button>
                <button className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition-colors">
                  重新生成
                </button>
              </div>
              <p className="text-xs text-zinc-500">
                此 Token 可以访问所有管理 API，请妥善保管，不要泄露给他人。
              </p>
            </div>
          </SettingSection>

          <SettingSection
            title="Webhook"
            description="配置事件通知回调"
          >
            <SettingRow
              label="启用 Webhook"
              description="当事件发生时发送 HTTP 请求"
            >
              <ToggleSwitch enabled={false} onChange={() => {}} />
            </SettingRow>
            {false && (
              <>
                <SettingInput
                  label="Webhook URL"
                  value=""
                  onChange={() => {}}
                  placeholder="https://your-server.com/webhook"
                />
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-zinc-400 mb-2">监听事件</label>
                    <div className="flex flex-wrap gap-2">
                      {['新线索', '状态变更', '评论审核', '报告下载'].map((event) => (
                        <label key={event} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 text-sm text-zinc-300 cursor-pointer">
                          <input type="checkbox" className="rounded border-zinc-600" />
                          {event}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </SettingSection>
        </div>
      )}
    </>
  );
}
