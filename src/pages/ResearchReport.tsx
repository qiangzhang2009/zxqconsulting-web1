import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ChevronUp, Loader2, Lock, RefreshCw, ExternalLink, Download,
  ThumbsUp, MessageCircle, X, Send,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tracking } from '../lib/tracking';
import { RESEARCH_REPORTS } from '../data/researchReports';
import { reportInteractions } from '../lib/reportInteractions';

// 客户端比对密码:SHA-256(input) === report.passwordHash
// 这只是访问门槛,密码校验在浏览器完成;真正严密的保护需要后端签名/水印。
async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function ResearchReport() {
  const params = useParams<{ reportId?: string; id?: string }>();
  const id = params.reportId ?? params.id ?? '';
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTop, setShowTop] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [srcDoc, setSrcDoc] = useState<string>('');
  const [nonce, setNonce] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Awaited<ReturnType<typeof reportInteractions.fetchComments>>>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentNickname, setCommentNickname] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentSending, setCommentSending] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [passwordUnlocked, setPasswordUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);
  const [passwordChecking, setPasswordChecking] = useState(false);
  const report = useMemo(() => RESEARCH_REPORTS.find((r) => r.id === id), [id]);
  const needsPassword = !!report?.passwordHash;

  // 切到 iframe 模式时锁定 body 滚动，归还时恢复
  useEffect(() => {
    if (!report) return;
    document.title = `${report.title} · Qihuang Sihai`;
    tracking.pageView({ page_title: document.title });

    // 切换报告时,重置密码解锁态(每份报告都要重新输密码)
    setPasswordUnlocked(false);
    setPasswordInput('');
    setPasswordErrorMsg(null);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 启动阅读时长追踪
    const tracker = reportInteractions.createReportTracker(report.id);

    // 拉取当前点赞数
    reportInteractions.fetchStats(report.id).then((stats) => {
      if (!stats) return;
      setLikeCount(stats.likes || 0);
    });

    // 拉取留言总数（用于顶栏徽标）
    fetch(`/api/report-comments?report_id=${encodeURIComponent(report.id)}&limit=1`, { cache: 'no-cache' })
      .then((r) => r.ok ? r.json() : { total: 0 })
      .then((d: { total?: number }) => setCommentsCount(d.total || 0))
      .catch(() => undefined);

    return () => {
      tracker.destroy();
      document.body.style.overflow = prevOverflow;
    };
  }, [id, report]);

  // 通过 fetch 抓取 HTML 内容，再通过 srcDoc 注入 iframe
  // 旧方案：给 iframe body 注入 padding-top 以避开 SPA navbar
  // 新方案：整个 ResearchReport 用 fixed inset-0 z-[60] 覆盖整个屏幕（高于 navbar 的 z-50），
  //         iframe 内的报告 header 不再被遮挡，因此不再需要 padding-top 注入。
  useEffect(() => {
    if (!report) return;
    if (needsPassword && !passwordUnlocked) return; // 密码未解锁前不下载报告内容
    let aborted = false;
    setLoading(true);
    setIframeError(false);

    (async () => {
      try {
        const res = await fetch(report.href, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let html = await res.text();
        if (aborted) return;
        setSrcDoc(html);
      } catch {
        if (!aborted) {
          setIframeError(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      aborted = true;
    };
  }, [report, nonce, needsPassword, passwordUnlocked]);

  // 监听 iframe 内部滚动 → 控制返回顶部按钮
  useEffect(() => {
    const onIframeLoad = () => {
      try {
        const win = iframeRef.current?.contentWindow;
        if (!win) return;
        const onScroll = () => setShowTop(win.scrollY > 480);
        win.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      } catch {
        // 跨域：忽略
      }
    };

    const iframe = iframeRef.current;
    iframe?.addEventListener('load', onIframeLoad);
    return () => iframe?.removeEventListener('load', onIframeLoad);
  }, [srcDoc]);

  if (!report) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07111a] px-4 text-slate-100">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
          <div className="text-5xl">🔍</div>
          <h1 className="mt-4 text-2xl font-semibold text-white">
            {t('research.notFoundTitle', '没找到这份报告')}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {t(
              'research.notFoundDesc',
              '这份研究报告可能尚未发布，或者链接已失效。',
            )}
          </p>
          <Link
            to="/research"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-emerald-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('research.backToHub', '回到报告库')}
          </Link>
        </div>
      </main>
    );
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report?.passwordHash) return;
    setPasswordChecking(true);
    setPasswordErrorMsg(null);
    try {
      const hash = await sha256(passwordInput);
      if (hash === report.passwordHash) {
        setPasswordUnlocked(true);
        setPasswordErrorMsg(null);
        tracking.click(`research_password_unlock_${id}`, 'research_report');
      } else {
        setPasswordErrorMsg('密码错误,请重试');
        setPasswordInput('');
      }
    } catch {
      setPasswordErrorMsg('浏览器不支持密码校验,请升级浏览器');
    } finally {
      setPasswordChecking(false);
    }
  };

  // 密码门:输入正确密码之前,只显示锁屏 UI,绝对不下载报告内容
  if (needsPassword && !passwordUnlocked) {
    return (
      <main className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-[#07111a] text-slate-100">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />
        </div>
        <div className="relative w-full max-w-md px-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-xl">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="mt-6 text-2xl font-semibold text-white">受密码保护</h1>
            <p className="mt-2 text-sm text-slate-400">请输入阅读密码以查看此报告</p>
            <div className="mt-3 text-xs text-slate-500">
              {report.title}
            </div>

            <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="阅读密码"
                autoFocus
                disabled={passwordChecking}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm text-white placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none disabled:opacity-50"
              />
              {passwordErrorMsg && (
                <div className="text-xs text-rose-300">{passwordErrorMsg}</div>
              )}
              <button
                type="submit"
                disabled={passwordChecking || !passwordInput}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500"
              >
                {passwordChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                解锁报告
              </button>
            </form>

            <Link
              to="/research"
              onClick={() => tracking.click(`research_back_${id}`, 'research_report')}
              className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              返回报告库
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const sourceUrl = report.href; // 例如 /research/japan-consumer-2026.html

  // 计算预计阅读时间（45 分钟阅读 × 200 字/分钟 = ~9,000 字 = 滚动到末尾的近似时间）
  const estimatedScrollMinutes = Math.max(8, Math.round(report.readMinutes * 0.85));

  const handleRefresh = () => {
    setNonce((n) => n + 1);
    tracking.click(`research_refresh_${id}`, 'research_report');
  };

  const handleLike = async () => {
    if (!report) return;
    tracking.click(`research_like_${id}`, 'research_report', { liked: !liked });
    const res = await fetch('/api/report-interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_id: report.id,
        event_type: liked ? 'unlike' : 'like',
        session_id: '',
        visitor_id: '',
      }),
    });
    if (res.ok) {
      const data = await res.json() as { likes: number; liked: boolean };
      setLiked(data.liked);
      setLikeCount(data.likes);
    } else {
      // 离线/失败时仍给视觉反馈
      setLiked((v) => !v);
      setLikeCount((c) => c + (liked ? -1 : 1));
    }
  };

  const loadComments = async () => {
    if (!report) return;
    const list = await reportInteractions.fetchComments(report.id, 100);
    setComments(list);
  };

  const openComments = () => {
    tracking.click(`research_comments_open_${id}`, 'research_report');
    setCommentsOpen(true);
    loadComments();
  };

  const submitComment = async () => {
    if (!report) return;
    const text = commentContent.trim();
    if (!text) {
      setCommentError('留言内容不能为空');
      return;
    }
    setCommentSending(true);
    setCommentError(null);
    const nickname = commentNickname.trim().slice(0, 24) || '匿名读者';
    const res = await reportInteractions.postComment(report.id, nickname, text);
    setCommentSending(false);
    if (!res.ok) {
      setCommentError(res.error || '提交失败，请稍后再试');
      return;
    }
    setCommentContent('');
    setCommentNickname('');
    setCommentsCount((c) => c + 1);
    setComments((prev) => [res.comment, ...prev]);
    tracking.click(`research_comment_submit_${id}`, 'research_report');
  };

  const formatRelative = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return '刚刚';
    if (min < 60) return `${min} 分钟前`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} 小时前`;
    const day = Math.floor(hr / 24);
    if (day < 30) return `${day} 天前`;
    return new Date(iso).toLocaleDateString('zh-CN');
  };

  const nicknameColor = (name: string) => {
    const palette = ['bg-emerald-400/20 text-emerald-300', 'bg-sky-400/20 text-sky-300', 'bg-rose-400/20 text-rose-300', 'bg-amber-400/20 text-amber-300', 'bg-violet-400/20 text-violet-300'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return palette[h % palette.length];
  };

  return (
    // 覆盖整个屏幕（z-[60] > navbar 的 z-50），避免 SPA navbar 遮挡阅读器内容
    <main className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#0a0e14] text-slate-100">
      {/* Top bar */}
      <div className="sticky top-0 z-30 shrink-0 border-b border-white/[0.08] bg-[#07111a]/92 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/research"
              onClick={() => tracking.click(`research_back_${id}`, 'research_report')}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('research.researchAll', '报告库')}</span>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('research.liveDoc', '在线阅读中')}
              </div>
              <h1 className="truncate text-sm font-semibold text-white sm:text-base">{report.title}</h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Like button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition ${
                liked
                  ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300'
                  : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white'
              }`}
              title={liked ? '已点赞' : '点赞'}
            >
              <ThumbsUp className={`h-3.5 w-3.5 ${liked ? 'fill-emerald-400' : ''}`} />
              <span className="tabular-nums">{likeCount}</span>
            </button>

            <button
              onClick={openComments}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              title="留言区"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="tabular-nums">{commentsCount}</span>
            </button>

            <div className="mx-1 hidden h-5 w-px bg-white/10 sm:block" />
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => tracking.click(`research_external_${id}`, 'research_report')}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              title={t('research.openInNewTab', '在新窗口打开')}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{t('research.openInNewTab', '新窗口')}</span>
            </a>
            <a
              href={sourceUrl}
              download
              onClick={() => tracking.click(`research_download_${id}`, 'research_report')}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              title={t('research.saveHtml', '保存 HTML')}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden md:inline">HTML</span>
            </a>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              title={t('research.refresh', '刷新')}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Document meta strip */}
      <div className="shrink-0 border-b border-white/[0.06] bg-[#0a1320]/80">
        <div className="container mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-xs text-slate-400 sm:px-6">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-500">📍</span> {report.region} · {report.category}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-500">📅</span> {report.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-500">⏱</span> 约 {estimatedScrollMinutes} 分钟阅读
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-500">📚</span> {report.chapters} 个章节
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {t('research.confidentialNote', '仅供专业评估用')}
          </span>
        </div>
      </div>

      {/* Iframe reading area — flex-1 占据剩余视口高度 */}
      <div className="relative flex-1 min-h-0">
        {iframeError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
            <div className="text-4xl">⚠️</div>
            <div className="text-lg font-semibold text-white">
              {t('research.loadError', '报告加载失败，请稍后再试')}
            </div>
            <div className="max-w-md text-sm text-slate-400">
              {t(
                'research.loadErrorDesc',
                '可能因为临时网络问题。请点击右上角刷新，或在新窗口打开报告原文。',
              )}
            </div>
            <button
              onClick={handleRefresh}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900"
            >
              <RefreshCw className="h-4 w-4" />
              {t('research.retry', '重新加载')}
            </button>
          </div>
        ) : (
          <>
            {loading && (
              <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0a0e14]">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-300" />
                <div className="text-sm font-medium text-slate-300">
                  {t('research.loading', '正在加载研究报告…')}
                </div>
                <div className="text-xs text-slate-500">{report.title}</div>
              </div>
            )}
            <iframe
              key={nonce}
              ref={iframeRef}
              srcDoc={srcDoc}
              title={report.title}
              className="absolute inset-0 h-full w-full border-0 bg-[#0a0e14]"
              onLoad={() => setLoading(false)}
              onError={() => {
                setIframeError(true);
                setLoading(false);
              }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </>
        )}

        {/* Back to top — scrolls inside iframe via contentWindow */}
        {showTop && !iframeError && (
          <button
            onClick={() => {
              try {
                iframeRef.current?.contentWindow?.scrollTo({ top: 0, behavior: 'smooth' });
              } catch {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="fixed bottom-6 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#0e1c2c]/90 text-white shadow-lg backdrop-blur transition hover:border-emerald-400/50 hover:bg-emerald-400/10"
            title={t('research.backTop', '回到顶部')}
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        )}

        {/* Comments panel — WeChat-style bottom sheet */}
        {commentsOpen && (
          <>
            <div
              className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm"
              onClick={() => setCommentsOpen(false)}
            />
            <div className="fixed inset-x-0 bottom-0 z-[71] flex h-[78vh] max-h-[680px] flex-col overflow-hidden rounded-t-2xl border-t border-white/10 bg-[#0a1320] text-slate-100 shadow-2xl">
              <div className="flex shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#07111a]/90 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-emerald-300" />
                  <h2 className="text-sm font-semibold text-white">读者留言</h2>
                  <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    {commentsCount}
                  </span>
                </div>
                <button
                  onClick={() => setCommentsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                  title="关闭"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Composer — WeChat style */}
              <div className="shrink-0 border-b border-white/[0.07] bg-[#0d1a2c]/60 p-4">
                <div className="flex items-center gap-2">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${nicknameColor(commentNickname.trim() || '我')}`}>
                    {(commentNickname.trim() || '我').slice(0, 1).toUpperCase()}
                  </div>
                  <input
                    value={commentNickname}
                    onChange={(e) => setCommentNickname(e.target.value.slice(0, 24))}
                    placeholder="昵称（选填，默认匿名读者）"
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none"
                    maxLength={24}
                  />
                </div>
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value.slice(0, 500))}
                  placeholder="留下你的看法、问题或建议…（最多 500 字）"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none"
                />
                {commentError && (
                  <div className="mt-2 text-[11px] text-rose-300">{commentError}</div>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {commentContent.length} / 500
                  </span>
                  <button
                    onClick={submitComment}
                    disabled={commentSending || !commentContent.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 px-4 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500"
                  >
                    {commentSending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    发送
                  </button>
                </div>
              </div>

              {/* Comments list */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {comments.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
                    <div className="text-3xl">💬</div>
                    <div className="text-sm font-medium text-slate-300">还没有留言</div>
                    <div className="text-xs text-slate-500">做第一个分享想法的读者</div>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {comments.map((c) => (
                      <li key={c.id} className="flex gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${nicknameColor(c.nickname)}`}>
                          {c.nickname.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-xs font-semibold text-slate-200">{c.nickname}</span>
                            <span className="shrink-0 text-[10px] text-slate-500">{formatRelative(c.created_at)}</span>
                          </div>
                          <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-slate-300">
                            {c.content}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
