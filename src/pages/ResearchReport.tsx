import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronUp, Loader2, RefreshCw, ExternalLink, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tracking } from '../lib/tracking';
import { RESEARCH_REPORTS } from '../data/researchReports';

export default function ResearchReport() {
  const { id = '' } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTop, setShowTop] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [srcDoc, setSrcDoc] = useState<string>('');
  const [nonce, setNonce] = useState(0);
  const report = useMemo(() => RESEARCH_REPORTS.find((r) => r.id === id), [id]);

  // 切到 iframe 模式时锁定 body 滚动，归还时恢复
  useEffect(() => {
    if (!report) return;
    document.title = `${report.title} · Qihuang Sihai`;
    tracking.pageView({ page_title: document.title });

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [id, report]);

  // 通过 fetch 抓取 HTML 内容，再通过 srcDoc 注入 iframe
  // 旧方案：给 iframe body 注入 padding-top 以避开 SPA navbar
  // 新方案：整个 ResearchReport 用 fixed inset-0 z-[60] 覆盖整个屏幕（高于 navbar 的 z-50），
  //         iframe 内的报告 header 不再被遮挡，因此不再需要 padding-top 注入。
  useEffect(() => {
    if (!report) return;
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
  }, [report, nonce]);

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

  const sourceUrl = report.href; // 例如 /research/japan-consumer-2026.html

  // 计算预计阅读时间（45 分钟阅读 × 200 字/分钟 = ~9,000 字 = 滚动到末尾的近似时间）
  const estimatedScrollMinutes = Math.max(8, Math.round(report.readMinutes * 0.85));

  const handleRefresh = () => {
    setNonce((n) => n + 1);
    tracking.click(`research_refresh_${id}`, 'research_report');
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
      </div>
    </main>
  );
}
