// SecuritySettingsPage — 安全设置
import { useState } from 'react';
import { Shield, Monitor, Smartphone, Trash2, Plus, Eye, EyeOff, QrCode, Activity, ChevronRight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/ui/Modal';
import { cn } from '@/lib/utils';

const SESSIONS = [
  { id: 1, device: 'Chrome on macOS',    ip: '223.71.xx.xx', location: '上海市',   lastActive: '2026-09-03 19:30', current: true },
  { id: 2, device: 'Safari on iPhone',   ip: '223.71.xx.xx', location: '上海市',   lastActive: '2026-09-03 18:00', current: false },
  { id: 3, device: 'Chrome on Windows',  ip: '185.44.xx.xx', location: '海外节点', lastActive: '2026-09-02 11:00', current: false },
];

const WHITEIPS = [
  { id: 1, ip: '223.71.0.0/16', label: '公司内网', note: '国内办公网络' },
  { id: 2, ip: '10.0.0.0/8',   label: '办公网段', note: '内网服务器' },
];

export default function SecuritySettingsPage() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [newIp, setNewIp] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [sessions, setSessions] = useState(SESSIONS);

  const handleTerminate = (id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setShowDeleteModal(null);
  };

  return (
    <div>
      <PageHeader
        eyebrow="系统安全"
        title="安全设置"
        icon={<Shield size={20} />}
        description="管理账户安全、会话、2FA 和访问控制"
      />

      <div className="flex flex-col gap-5 max-w-2xl">

        {/* ── 会话管理 ── */}
        <section>
          <div className="admin-section-title" style={{ marginBottom: 12 }}>
            <Monitor size={13} />
            当前活跃会话
          </div>
          <div className="flex flex-col gap-2">
            {sessions.map(session => (
              <div key={session.id} className="admin-card flex items-center justify-between gap-3 flex-wrap" style={{ padding: '13px 16px' }}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center',
                    session.current ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.04] text-zinc-500'
                  )}>
                    <Monitor size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{session.device}</span>
                      {session.current && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          当前
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                      <span>IP {session.ip}</span>
                      <span>{session.location}</span>
                      <span>最后活跃：{session.lastActive}</span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <button
                    className="admin-btn danger sm"
                    onClick={() => setShowDeleteModal(session.id)}
                  >
                    <Trash2 size={13} />
                    强制下线
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

      <div className="admin-divider" />

        {/* ── 2FA 设置 ── */}
        <section>
          <div className="admin-section-title" style={{ marginBottom: 12 }}>
            <Smartphone size={13} />
            双因素认证（2FA）
          </div>
          <div className="admin-card" style={{ padding: '18px 20px' }}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-sm font-semibold text-white">启用两步验证</div>
                <div className="text-xs text-zinc-500 mt-0.5">使用 Authenticator 应用生成一次性验证码，增强账户安全</div>
              </div>
              {/* Toggle */}
              <button
                role="switch"
                aria-checked={twoFAEnabled}
                onClick={() => setTwoFAEnabled(v => !v)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors duration-200 border border-transparent',
                  twoFAEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
                    twoFAEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>

            {twoFAEnabled && (
              <div className="flex items-start gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                {/* QR placeholder */}
                <div className="w-24 h-24 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                  <QrCode size={36} className="text-zinc-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-zinc-400 mb-1.5">备用密钥（请妥善保存）</div>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="text-sm font-mono text-emerald-400 tracking-widest bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                      {showSecret ? 'JBSWY3DPEHPK3PXP' : '••••••••••••••••'}
                    </code>
                    <button
                      className="admin-btn subtle sm"
                      onClick={() => setShowSecret(v => !v)}
                    >
                      {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  <div className="text-xs text-zinc-600">使用 Google Authenticator 或 Authy 扫描上方二维码绑定</div>
                </div>
              </div>
            )}
          </div>
        </section>

      <div className="admin-divider" />

        {/* ── IP 白名单 ── */}
        <section>
          <div className="admin-section-title" style={{ marginBottom: 12 }}>
            <Shield size={13} />
            IP 白名单
          </div>
          <div className="admin-card" style={{ padding: '18px 20px' }}>
            <div className="flex flex-col gap-2 mb-4">
              {WHITEIPS.map(ip => (
                <div key={ip.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                  <div>
                    <code className="text-sm font-mono text-cyan-400">{ip.ip}</code>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                      <span>{ip.label}</span>
                      <span>·</span>
                      <span>{ip.note}</span>
                    </div>
                  </div>
                  <button className="admin-btn danger sm">
                    <Trash2 size={13} />
                    删除
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                className="admin-input"
                placeholder="例如：192.168.1.0/24"
                value={newIp}
                onChange={e => setNewIp(e.target.value)}
              />
              <button className="admin-btn primary">
                <Plus size={14} />
                添加
              </button>
            </div>
            <p className="text-xs text-zinc-600 mt-2">留空则仅允许白名单 IP 访问管理后台</p>
          </div>
        </section>

      <div className="admin-divider" />

        {/* ── 操作日志入口 ── */}
        <section>
          <div className="admin-section-title" style={{ marginBottom: 12 }}>
            <Activity size={13} />
            操作日志
          </div>
          <a
            href="#/audit-log"
            className="admin-card flex items-center justify-between group"
            style={{ padding: '16px 20px', textDecoration: 'none' }}
          >
            <div>
              <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                查看完整审计日志
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">包含所有管理员操作记录、登录历史和安全事件</div>
            </div>
            <ChevronRight size={16} className="text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </a>
        </section>

      </div>

      {/* Force logout confirm modal */}
      <Modal
        open={showDeleteModal !== null}
        onClose={() => setShowDeleteModal(null)}
        title="确认强制下线"
        size="sm"
        footer={
          <>
            <button className="admin-btn ghost" onClick={() => setShowDeleteModal(null)}>取消</button>
            <button className="admin-btn danger" onClick={() => showDeleteModal !== null && handleTerminate(showDeleteModal!)}>
              确认下线
            </button>
          </>
        }
      >
        <p className="text-sm text-zinc-300">
          确定要强制该会话下线吗？该操作将立即终止目标设备的登录状态。
        </p>
      </Modal>
    </div>
  );
}
