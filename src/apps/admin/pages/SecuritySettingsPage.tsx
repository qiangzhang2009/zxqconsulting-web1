// SecuritySettingsPage — 安全设置（数据源: /api/admin/sessions + /api/admin/whitelist + /api/admin/me）
import { useState } from 'react';
import { Shield, Monitor, Smartphone, Trash2, Plus, Eye, EyeOff, QrCode, Activity, ChevronRight, RefreshCw, Globe, AlertTriangle, Loader2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { useActiveSessions, useWhitelist, useMe } from '../hooks/useAdminData';
import { api } from '../services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { fmtRelative } from '@/apps/admin/lib/format';

export default function SecuritySettingsPage() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [newIp, setNewIp] = useState('');
  const [newIpLabel, setNewIpLabel] = useState('');
  const [newIpNote, setNewIpNote] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showTerminateAll, setShowTerminateAll] = useState(false);
  const [adding, setAdding] = useState(false);

  const { data: sessionsData, loading: sessionsLoading, refetch: refetchSessions } = useActiveSessions();
  const { data: whitelistData, loading: whitelistLoading, refetch: refetchWhitelist } = useWhitelist();
  const { data: meData } = useMe();

  const sessions = sessionsData?.sessions || [];
  const whitelist = whitelistData?.whitelist || [];
  const otherCount = sessions.filter((s) => !s.current).length;

  const handleTerminate = async (token: string) => {
    try {
      await api.terminateSession(token);
      toast.success('会话已下线');
      setShowDeleteModal(null);
      refetchSessions();
    } catch (err) {
      toast.error((err as Error).message || '下线失败');
    }
  };

  const handleTerminateAll = async () => {
    try {
      const result = await api.terminateAllOtherSessions();
      toast.success(`已下线 ${result.count} 个其它会话`);
      setShowTerminateAll(false);
      refetchSessions();
    } catch (err) {
      toast.error((err as Error).message || '批量下线失败');
    }
  };

  const handleAddIp = async () => {
    if (!newIp.trim()) {
      toast.error('请输入 IP 或网段');
      return;
    }
    setAdding(true);
    try {
      await api.addWhitelist({ pattern: newIp.trim(), label: newIpLabel.trim() || newIp.trim(), note: newIpNote.trim() });
      toast.success('已添加');
      setNewIp('');
      setNewIpLabel('');
      setNewIpNote('');
      refetchWhitelist();
    } catch (err) {
      toast.error((err as Error).message || '添加失败');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveIp = async (id: string, pattern: string) => {
    try {
      await api.removeWhitelist(id);
      toast.success(`已移除 ${pattern}`);
      refetchWhitelist();
    } catch (err) {
      toast.error((err as Error).message || '删除失败');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="系统安全"
        title="安全设置"
        icon={<Shield size={20} />}
        description="管理账户安全、会话、2FA 和访问控制"
        actions={
          <button className="admin-btn ghost sm" onClick={() => { refetchSessions(); refetchWhitelist(); }}>
            <RefreshCw size={13} />
            刷新
          </button>
        }
      />

      <div className="flex flex-col gap-5 max-w-2xl">
        {/* 当前管理员信息 */}
        {meData?.admin && (
          <div className="admin-card" style={{ padding: '16px 20px' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Shield size={16} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{meData.admin.email}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  {meData.admin.role} · 累计登录 {meData.admin.loginCount} 次
                  {meData.admin.lastLoginAt && ` · 上次 ${fmtRelative(meData.admin.lastLoginAt)}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 会话管理 ── */}
        <section>
          <div className="admin-section-title" style={{ marginBottom: 12 }}>
            <Monitor size={13} />
            当前活跃会话
            {otherCount > 0 && (
              <button
                onClick={() => setShowTerminateAll(true)}
                className="ml-auto admin-btn danger sm"
                style={{ padding: '4px 10px', fontSize: 11 }}
              >
                下线其它 ({otherCount})
              </button>
            )}
          </div>

          {sessionsLoading && sessions.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-xs text-zinc-500">
              <Loader2 size={14} className="animate-spin mr-2" />
              加载中...
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon={<Monitor size={26} />}
              title="暂无活跃会话"
              description="登录后会话将显示在此处"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {sessions.map((session) => (
                <div key={session.token} className="admin-card flex items-center justify-between gap-3 flex-wrap" style={{ padding: '13px 16px' }}>
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
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5 flex-wrap">
                        <span className="font-mono">IP {session.ip}</span>
                        <span className="flex items-center gap-1">
                          <Globe size={11} />
                          {session.location}
                        </span>
                        {session.last_active !== '-' && <span>最后活跃：{session.last_active}</span>}
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      className="admin-btn danger sm"
                      onClick={() => setShowDeleteModal(session.token)}
                    >
                      <Trash2 size={13} />
                      强制下线
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="admin-divider" />

        {/* ── 2FA 设置 ── */}
        <section>
          <div className="admin-section-title" style={{ marginBottom: 12 }}>
            <Smartphone size={13} />
            双因素认证（2FA）
          </div>
          <div className="admin-card" style={{ padding: '18px 20px' }}>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-4">
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/80 leading-relaxed">
                2FA 通过 Cloudflare 环境变量 <code className="font-mono">ADMIN_2FA_SECRET</code> 配置。启用后登录需要 Authenticator 验证码。
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-sm font-semibold text-white">启用两步验证</div>
                <div className="text-xs text-zinc-500 mt-0.5">使用 Authenticator 应用生成一次性验证码</div>
              </div>
              <button
                role="switch"
                aria-checked={twoFAEnabled}
                onClick={() => setTwoFAEnabled((v) => !v)}
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
                      onClick={() => setShowSecret((v) => !v)}
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
              {whitelistLoading && whitelist.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-xs text-zinc-500">
                  <Loader2 size={14} className="animate-spin mr-2" />
                  加载中...
                </div>
              ) : whitelist.length === 0 ? (
                <EmptyState
                  icon={<Shield size={20} />}
                  title="尚未配置白名单"
                  description="留空则不限制 IP"
                />
              ) : (
                whitelist.map((ip) => (
                  <div key={ip.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                    <div>
                      <code className="text-sm font-mono text-cyan-400">{ip.pattern}</code>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5 flex-wrap">
                        <span>{ip.label}</span>
                        {ip.note && <><span>·</span><span>{ip.note}</span></>}
                      </div>
                    </div>
                    <button
                      className="admin-btn danger sm"
                      onClick={() => handleRemoveIp(ip.id, ip.pattern)}
                    >
                      <Trash2 size={13} />
                      删除
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  className="admin-input"
                  placeholder="例如：192.168.1.0/24 或 10.0.*.*"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                />
                <input
                  className="admin-input"
                  placeholder="标签（选填）"
                  value={newIpLabel}
                  onChange={(e) => setNewIpLabel(e.target.value)}
                />
                <input
                  className="admin-input"
                  placeholder="备注（选填）"
                  value={newIpNote}
                  onChange={(e) => setNewIpNote(e.target.value)}
                />
              </div>
              <button className="admin-btn primary self-start" onClick={handleAddIp} disabled={adding}>
                {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                添加
              </button>
            </div>
            <p className="text-xs text-zinc-600 mt-2">留空则所有登录 IP 均放行；配置后仅白名单内 IP 可访问管理后台</p>
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
            href="#/admin/audit-log"
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
            <button className="admin-btn danger" onClick={() => showDeleteModal && handleTerminate(showDeleteModal)}>
              确认下线
            </button>
          </>
        }
      >
        <p className="text-sm text-zinc-300">
          确定要强制该会话下线吗？该操作将立即终止目标设备的登录状态。
        </p>
      </Modal>

      {/* Terminate all modal */}
      <Modal
        open={showTerminateAll}
        onClose={() => setShowTerminateAll(false)}
        title="下线其它所有会话"
        size="sm"
        footer={
          <>
            <button className="admin-btn ghost" onClick={() => setShowTerminateAll(false)}>取消</button>
            <button className="admin-btn danger" onClick={handleTerminateAll}>
              确认下线 {otherCount} 个会话
            </button>
          </>
        }
      >
        <p className="text-sm text-zinc-300">
          将下线除当前浏览器外的 {otherCount} 个其它会话。这不会影响您当前的登录。
        </p>
      </Modal>
    </div>
  );
}
