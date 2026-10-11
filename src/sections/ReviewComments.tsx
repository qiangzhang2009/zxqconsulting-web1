import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface Reply {
  id: string;
  user_name: string;
  content: string;
  timestamp: number;
  is_admin: boolean;
  is_system: boolean;
  is_agent?: boolean;
  agent_id?: string;
  user_emoji?: string;
  user_gradient?: string;
  user_role?: string;
}

interface Comment {
  id: string;
  user_name: string;
  user_email: string;
  content: string;
  timestamp: string;
  likes: number;
  liked_by: string;
  replies: string;
  geo_country: string;
  geo_region: string;
  geo_city: string;
}

// ─── Geo & Agent helpers ────────────────────────────────────────────────────────

const GEO_FLAG: Record<string, string> = {
  CN: '🇨🇳', HK: '🇭🇰', TW: '🇹🇼', SG: '🇸🇬', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪',
  JP: '🇯🇵', KR: '🇰🇷', AU: '🇦🇺', FR: '🇫🇷', MY: '🇲🇾', TH: '🇹🇭', IN: '🇮🇳',
  AE: '🇦🇪', CA: '🇨🇦', NL: '🇳🇱', CH: '🇨🇭', BR: '🇧🇷', MX: '🇲🇽', ID: '🇮🇩',
  SA: '🇸🇦', NZ: '🇳🇿', PH: '🇵🇭', VN: '🇻🇳', LK: '🇱🇰', MM: '🇲🇲',
};

// 国家/地区名走 Intl.DisplayNames, 自动适配当前语言, 无需维护 15 份对照表。
function geoName(code: string, lang: string): string {
  if (!code) return '';
  try {
    const dn = new Intl.DisplayNames([lang || 'zh'], { type: 'region' });
    return dn.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

const AGENT_BADGE_KEY: Record<string, string> = {
  consultant: 'reviews2.agentConsultant',
  legal: 'reviews2.agentLegal',
  finance: 'reviews2.agentFinance',
  logistics: 'reviews2.agentLogistics',
};
const AGENT_INFO: Record<string, { emoji: string; badge: string; color: string }> = {
  consultant: { emoji: '💼', badge: '商务顾问', color: '#3b82f6' },
  legal:      { emoji: '⚖️', badge: '法律顾问', color: '#10b981' },
  finance:    { emoji: '💰', badge: '财税顾问', color: '#f59e0b' },
  logistics:  { emoji: '🚢', badge: '物流顾问', color: '#06b6d4' },
};

// ─── Time formatting ────────────────────────────────────────────────────────────

// 这些函数在模块作用域, 拿不到 hook —— 读 i18n.language 当前值即可,
// 不要用 'languageChanged' 事件: 首次加载事件早于本模块订阅, 会漏掉。
const LOCALE_TAG: Record<string, string> = {
  zh: 'zh-CN', en: 'en-US', ja: 'ja-JP', ko: 'ko-KR', de: 'de-DE', fr: 'fr-FR',
  es: 'es-ES', pt: 'pt-BR', it: 'it-IT', id: 'id-ID', ms: 'ms-MY', vi: 'vi-VN',
  ru: 'ru-RU', th: 'th-TH', ar: 'ar-SA',
};
const localeTag = () => LOCALE_TAG[i18n.language] ?? LOCALE_TAG[i18n.language?.split('-')[0]] ?? 'zh-CN';

// Intl.RelativeTimeFormat 自带各语言语法, 不必手写 "x分钟前"。
function fmtRelative(isoOrTs: string | number): string {
  let ms: number;
  if (typeof isoOrTs === 'string') ms = new Date(isoOrTs).getTime();
  else ms = isoOrTs;
  const diff = Date.now() - ms;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(localeTag(), { numeric: 'auto' });
  const MIN = 60_000, HOUR = 3_600_000, DAY = 86_400_000;
  if (abs < MIN) return rtf.format(0, 'second');
  if (abs < HOUR) return rtf.format(Math.round(diff / MIN), 'minute');
  if (abs < DAY) return rtf.format(Math.round(diff / HOUR), 'hour');
  if (abs < 30 * DAY) return rtf.format(Math.round(diff / DAY), 'day');
  return new Date(ms).toLocaleDateString(localeTag(), { month: 'short', day: 'numeric' });
}

function fmtAbsolute(isoOrTs: string | number): string {
  const d = new Date(typeof isoOrTs === 'string' ? isoOrTs : Number(isoOrTs));
  return d.toLocaleString(localeTag(), {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

// ─── Avatar component ────────────────────────────────────────────────────────

function hashColor(name: string) {
  const colors = [
    ['#3b82f6', '#8b5cf6'], ['#22c55e', '#06b6d4'], ['#f59e0b', '#eab308'],
    ['#ef4444', '#f97316'], ['#ec4899', '#f43f5e'], ['#14b8a6', '#06b6d4'],
    ['#a855f7', '#6366f1'], ['#0ea5e9', '#0284c7'],
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return colors[Math.abs(h) % colors.length];
}

function Avatar({ name, size = 36, isAgent = false, agentId, gradient }:
  { name: string; size?: number; isAgent?: boolean; agentId?: string; gradient?: string }) {
  const [c1, c2] = hashColor(name || '?');
  const info = agentId ? AGENT_INFO[agentId] : null;
  const bg = gradient || (info ? `linear-gradient(135deg, ${info.color}, ${info.color}99)` : `linear-gradient(135deg, ${c1}, ${c2})`);

  if (isAgent) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.42, flexShrink: 0,
        boxShadow: info ? `0 0 12px ${info.color}40` : 'none',
        border: info ? `2px solid ${info.color}60` : 'none',
      }}>
        {info?.emoji || name[0]}
      </div>
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: size * 0.42, flexShrink: 0,
    }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

// ─── Time tooltip ────────────────────────────────────────────────────────────

function TimeBadge({ time }: { time: string | number }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      <span style={{ fontSize: '0.72rem', color: '#4a6080', cursor: 'default' }}>
        {fmtRelative(time)}
      </span>
      {show && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          background: '#0d1a2a', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8, padding: '6px 10px', fontSize: '0.72rem', color: '#8899aa',
          whiteSpace: 'nowrap', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}>
          {fmtAbsolute(time)}
        </div>
      )}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ReviewComments() {
  const { t, i18n } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const loadComments = useCallback(async () => {
    console.log('[ReviewComments] loadComments called, sort:', sort, 'page:', page, 'pageSize:', pageSize);
    try {
      const r = await fetch(`https://www.zxqconsulting.com/api/comments?sort=${sort}&page=${page}&limit=${pageSize}`);
      const data = await r.json();
      console.log('[ReviewComments] API response:', { total: data.total, count: Array.isArray(data) ? data.length : data.comments?.length });
      const list = Array.isArray(data) ? data : (data.comments || []);
      console.log('[ReviewComments] Setting comments:', list.length);
      setComments(list);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error('[ReviewComments] Error:', e);
    }
  }, [sort, page, pageSize]);

  useEffect(() => {
    console.log('[ReviewComments] useEffect triggered');
    loadComments().then(() => {
      console.log('[ReviewComments] loadComments completed');
      setLoading(false);
      console.log('[ReviewComments] loading set to false');
    });
  }, [loadComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setSubmitMsg('');
    try {
      // Direct call to the API worker
      const r = await fetch('https://www.zxqconsulting.com/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), user_name: guestName.trim() || '游客' }),
      });
      if (r.ok) {
        setContent('');
        setSubmitMsg('发布成功！AI 顾问正在准备专业回复…');
        setPage(1);
        await loadComments();
        let pollCount = 0;
        const pollTimer = setInterval(async () => {
          pollCount++;
          await loadComments();
          if (pollCount >= 6) clearInterval(pollTimer);
        }, 1500);
        setTimeout(() => { clearInterval(pollTimer); setSubmitMsg(''); }, 12000);
      } else {
        const d = await r.json();
        setSubmitMsg(`发布失败: ${d.error || '未知错误'}`);
      }
    } catch { setSubmitMsg('网络错误，请重试'); }
    finally { setSubmitting(false); }
  }

  async function handleLike(comment: Comment) {
    try {
      const r = await fetch(`https://www.zxqconsulting.com/api/comments/${comment.id}/like`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      if (r.ok) {
        const d = await r.json();
        setComments(prev => prev.map(c => c.id === comment.id ? { ...c, likes: d.likes } : c));
      }
    } catch {}
  }

  function parseReplies(comment: Comment): Reply[] {
    try { return JSON.parse(comment.replies || '[]'); } catch { return []; }
  }

  const countries = new Set(comments.map(c => c.geo_country)).size;

  return (
    <section id="reviews" style={{ background: '#F5F1E8', padding: '80px 0' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(47, 93, 87, 0.08)', border: '1px solid rgba(47, 93, 87, 0.2)',
            borderRadius: 999, padding: '6px 16px', fontSize: '0.78rem', color: '#2F5D57',
            fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12,
          }}>
            💬 {t('reviews2.tagline', 'Global user Q&A · AI advisor reply')}
          </div>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: '#1B2520',
            letterSpacing: '-0.02em', marginBottom: 12, fontFamily: 'Georgia, serif'
          }}>
            {t('reviews2.title', 'Talk with Qihuang Sihai users')}
          </h2>
          <p style={{ color: '#5b6661', maxWidth: 520, margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.7 }}>
            {t('reviews2.subtitle', 'Share your TCM going-global experience or ask about compliance, markets, logistics, tax and more. An AI advisor replies automatically.')}
          </p>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} style={{
          background: '#FFFFFF', border: '1px solid rgba(47, 93, 87, 0.15)',
          borderRadius: 16, padding: 28, marginBottom: 40, boxShadow: '0 4px 16px rgba(47, 93, 87, 0.06)',
        }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <Avatar name={guestName || '游客'} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <input
                  type="text" placeholder={t('reviews2.namePlaceholder', 'Your nickname (optional)')} maxLength={50}
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  style={{ flex: 1, background: '#FAF8F3',
                    border: '1px solid rgba(47, 93, 87, 0.15)', borderRadius: 8,
                    padding: '8px 14px', color: '#1B2520', fontSize: '0.88rem',
                    outline: 'none', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#5b6661', padding: '0 4px' }}>
                  <span style={{ color: content.length > 1800 ? '#C2473B' : '#5b6661', fontWeight: content.length > 1800 ? 600 : 400 }}>{content.length}</span>
                  <span>/ 2000</span>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                placeholder={t('reviews2.contentPlaceholder', 'Share your TCM going-global experience or ask specific questions — the AI advisor replies automatically.')}
                maxLength={2000} value={content}
                onChange={e => setContent(e.target.value)} rows={4}
                style={{ width: '100%', background: '#FAF8F3',
                  border: '1px solid rgba(47, 93, 87, 0.15)', borderRadius: 10,
                  padding: '12px 14px', color: '#1B2520', fontSize: '0.9rem',
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: '0.78rem', color: '#5b6661' }}>{t('reviews2.policy', 'Be respectful, no personal attacks · messages are public')}</span>
                <button type="submit" disabled={submitting || !content.trim()}
                  style={{ background: (submitting || !content.trim()) ? 'rgba(47, 93, 87, 0.3)' : '#2F5D57',
                    border: 'none', borderRadius: 10, padding: '10px 24px',
                    color: 'white', fontWeight: 700, fontSize: '0.88rem',
                    cursor: (submitting || !content.trim()) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s', fontFamily: 'inherit' }}>
                  {submitting ? t('reviews2.submitting', 'Submitting...') : t('reviews2.submit', 'Post message')}
                </button>
              </div>
              {submitMsg && (
                <div style={{ marginTop: 10, fontSize: '0.85rem', color: submitMsg.includes('失败') || submitMsg.includes('错误') ? '#f87171' : '#10b981' }}>
                  {submitMsg}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Sort Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: '0.9rem', color: '#5b6661' }}>
            {t('reviews2.total', 'All messages')} <span style={{ color: '#2F5D57', fontWeight: 700 }}>{total}</span> {t('reviews2.totalUnit', 'in total')}
            <span style={{ marginLeft: 12, fontSize: '0.75rem', color: '#5b6661' }}>
              {t('reviews2.fromWorld', 'From {{count}} countries and regions', { count: countries })}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {(['latest', 'popular'] as const).map(s => (
              <button key={s} onClick={() => { setSort(s); setPage(1); }}
                style={{ padding: '5px 16px', borderRadius: 8, border: 'none',
                  background: sort === s ? '#2F5D57' : 'rgba(47, 93, 87, 0.08)',
                  color: sort === s ? 'white' : '#5b6661',
                  fontSize: '0.82rem', fontWeight: sort === s ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                {s === 'latest' ? t('reviews2.latest', 'Latest') : t('reviews2.popular', 'Popular')}
              </button>
            ))}
          </div>
        </div>

        {/* Comment List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50, color: '#5b6661' }}>{t('reviews2.loading', 'Loading...')}</div>
        ) : comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#5b6661', background: '#FAF8F3', borderRadius: 16, border: '1px dashed rgba(47, 93, 87, 0.2)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{t('reviews2.emptyEmoji', '💬')}</div>
            <div style={{ fontSize: '0.9rem' }}>{t('reviews2.empty', 'No messages yet — be the first to share.')}</div>
          </div>
        ) : (
          <div>
            {comments.map(comment => {
              const replies = parseReplies(comment);
              const flag = GEO_FLAG[comment.geo_country] || '';
              const countryName = geoName(comment.geo_country, i18n.language);
              const location = [flag, countryName, comment.geo_region, comment.geo_city].filter(Boolean).join(' ');

              return (
                <div key={comment.id} style={{ padding: '18px 0', borderBottom: '1px solid rgba(47, 93, 87, 0.08)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <Avatar name={comment.user_name} size={38} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Header: name + location + time */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: '#1B2520', fontSize: '0.88rem' }}>
                          {comment.user_name || '游客'}
                        </span>
                        {location && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            fontSize: '0.72rem', color: '#5b6661',
                            background: '#FAF8F3',
                            border: '1px solid rgba(47, 93, 87, 0.12)',
                            borderRadius: 999, padding: '2px 8px',
                          }}>
                            {flag} {location}
                          </span>
                        )}
                        <TimeBadge time={comment.timestamp} />
                      </div>

                      {/* Content */}
                      <div style={{ color: '#3a4540', fontSize: '0.9rem', lineHeight: 1.75, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                        {comment.content}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'center' }}>
                        <button onClick={() => handleLike(comment)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4,
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: comment.likes > 0 ? '#C2473B' : '#5b6661',
                            fontSize: '0.8rem', padding: '2px 6px', borderRadius: 6,
                            transition: 'all 0.15s' }}>
                          <span>👍</span>
                          <span>{comment.likes > 0 ? comment.likes : t('reviews2.like', 'Like')}</span>
                        </button>
                        {replies.length > 0 && (
                          <span style={{ fontSize: '0.75rem', color: '#5b6661' }}>
                            💬 {t('reviews2.replyCount', '{{count}} replies', { count: replies.length })}
                          </span>
                        )}
                      </div>

                      {/* AI Replies */}
                      {replies.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          {replies.map((reply, idx) => {
                            const isAgent = reply.is_agent || false;
                            const agentInfo = reply.agent_id ? AGENT_INFO[reply.agent_id] : null;

                            return (
                              <div key={reply.id || idx} style={{
                                marginTop: idx > 0 ? 10 : 0,
                                paddingLeft: 14,
                                borderLeft: `2px solid ${agentInfo?.color || 'rgba(16,185,129,0.3)'}`,
                              }}>
                                <div style={{ marginLeft: 38, marginTop: 10 }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: agentInfo ? agentInfo.color : '#2F5D57' }}>
                                    {reply.user_name}
                                  </span>
                                  {isAgent && agentInfo && (
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 3,
                                      background: `${agentInfo.color}14`,
                                      border: `1px solid ${agentInfo.color}40`,
                                      color: agentInfo.color,
                                      borderRadius: 999, padding: '1px 8px',
                                      fontSize: '0.68rem', fontWeight: 600, marginLeft: 6,
                                    }}>
                                      {agentInfo.emoji} {t(AGENT_BADGE_KEY[reply.agent_id!] || 'reviews2.agentConsultant')}
                                    </span>
                                  )}
                                </div>
                                <div style={{
                                  marginLeft: 38,
                                  color: isAgent ? '#1B2520' : '#3a4540',
                                  fontSize: '0.88rem', lineHeight: 1.7,
                                  marginTop: 4,
                                  wordBreak: 'break-word', whiteSpace: 'pre-wrap',
                                  background: '#FAF8F3',
                                  padding: '10px 14px',
                                  borderRadius: 8,
                                  border: '1px solid rgba(47, 93, 87, 0.08)',
                                }}>
                                  {reply.content}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, flexWrap: 'wrap', gap: 12 }}>
            {/* Page size selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.78rem', color: '#4a6080' }}>每页</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '5px 10px', color: '#c0d0e0', fontSize: '0.82rem',
                  outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <option value={10}>10 条</option>
                <option value={20}>20 条</option>
                <option value={50}>50 条</option>
              </select>
            </div>

            {/* Page info + nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.8rem', color: '#4a6080' }}>
                第 <span style={{ color: '#10b981', fontWeight: 600 }}>{page}</span> / {totalPages} 页
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  style={{ padding: '5px 12px', borderRadius: 8, border: 'none',
                    background: page <= 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                    color: page <= 1 ? '#2a3a50' : '#8899aa',
                    fontSize: '0.82rem', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s', fontFamily: 'inherit' }}
                >
                  ‹ 上一页
                </button>
                {/* Page number dots */}
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 7) {
                    p = i + 1;
                  } else if (page <= 4) {
                    p = i + 1;
                    if (i === 6) p = totalPages;
                  } else if (page >= totalPages - 3) {
                    p = i === 0 ? 1 : totalPages - 6 + i;
                  } else {
                    const pages = [1, page - 2, page - 1, page, page + 1, page + 2, totalPages];
                    p = pages[i];
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{ padding: '5px 10px', borderRadius: 8, border: 'none',
                        background: page === p ? '#10b981' : 'rgba(255,255,255,0.06)',
                        color: page === p ? 'white' : '#8899aa',
                        fontSize: '0.82rem', fontWeight: page === p ? 600 : 400,
                        cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                        minWidth: 34 }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  style={{ padding: '5px 12px', borderRadius: 8, border: 'none',
                    background: page >= totalPages ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                    color: page >= totalPages ? '#2a3a50' : '#8899aa',
                    fontSize: '0.82rem', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s', fontFamily: 'inherit' }}
                >
                  下一页 ›
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
