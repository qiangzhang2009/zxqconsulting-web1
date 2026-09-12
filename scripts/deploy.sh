#!/usr/bin/env bash
# ------------------------------------------------------------------------------
# scripts/deploy.sh — 一键部署 SOP(2026-07-10 实战总结)
#
# 背景:Cloudflare Pages GitHub 集成 webhook 偶尔卡住,Actions workflow 里 wrangler
# step 也可能因 token 失效挂掉。本脚本绕开这两条通道,把本地 dist 直接推到
# Cloudflare Pages production,作为应急 fallback。
#
# 用法:
#   ./scripts/deploy.sh                # 完整:build + verify + deploy
#   ./scripts/deploy.sh --skip-build   # 跳过 build(已 build 过)
#   ./scripts/deploy.sh --dry-run      # 只跑 verify,不上传
#   ./scripts/deploy.sh --check-token  # 只检查 wrangler auth 是否有效
#
# 前置条件:
#   - CLOUDFLARE_API_TOKEN 已设置(export 或写 ~/.bashrc)
#   - npm i 已跑过
# ------------------------------------------------------------------------------
set -euo pipefail

# ---------- args ----------
SKIP_BUILD=0
DRY_RUN=0
CHECK_TOKEN=0
for arg in "$@"; do
  case "$arg" in
    --skip-build)  SKIP_BUILD=1 ;;
    --dry-run)     DRY_RUN=1 ;;
    --check-token) CHECK_TOKEN=1 ;;
    -h|--help)
      sed -n '2,20p' "$0"
      exit 0
      ;;
  esac
done

# ---------- constants ----------
PROJECT="qiangzhang2009-zxqconsulting-web1"
BRANCH="main"
PROD_URL="https://www.zxqconsulting.com"

# ---------- helpers ----------
color() { printf "\033[%sm%s\033[0m\n" "$1" "$2"; }
info()  { color "1;34" "▶ $*"; }
ok()    { color "1;32" "✓ $*"; }
warn()  { color "1;33" "⚠ $*"; }
err()   { color "1;31" "✗ $*"; }

# ---------- check token ----------
if [ "$CHECK_TOKEN" -eq 1 ]; then
  info "检查 wrangler auth..."
  if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
    err "CLOUDFLARE_API_TOKEN 未设置"
    echo "   export CLOUDFLARE_API_TOKEN=..."
    exit 1
  fi
  wrangler pages project list 2>&1 | grep -q "$PROJECT" && \
    ok "wrangler auth OK, project '$PROJECT' 可见" || \
    { err "wrangler 无法访问 project '$PROJECT'"; exit 1; }
  exit 0
fi

# ---------- 1. build ----------
if [ "$SKIP_BUILD" -eq 0 ]; then
  info "Step 1/4: npm run build"
  npm run build 2>&1 | tail -10
  ok "build 完成"
else
  info "Step 1/4: skip-build 模式,假设 dist/ 已存在"
fi

# ---------- 2. verify-bundle ----------
info "Step 2/4: bundle 校验(数据没被 tree-shake)"
if [ -f scripts/verify-bundle.mjs ]; then
  if node scripts/verify-bundle.mjs; then
    ok "verify-bundle 通过"
  else
    err "verify-bundle 失败,中止部署!"
    exit 1
  fi
else
  warn "scripts/verify-bundle.mjs 不存在,跳过"
fi

# ---------- 3. deploy ----------
# Token & wrangler 检查只放在真正 deploy 前(dry-run 不需要)
if [ "$DRY_RUN" -eq 1 ]; then
  ok "dry-run 模式,跳过 wrangler deploy(也不需要 token)"
  info "Step 3/4: skipped"
  info "Step 4/4: skipped"
  exit 0
fi

[ -z "${CLOUDFLARE_API_TOKEN:-}" ] && { err "CLOUDFLARE_API_TOKEN 未设置,export 后重试"; exit 1; }
command -v wrangler >/dev/null 2>&1 || { err "wrangler 未安装(npx wrangler 也行)"; exit 1; }

info "Step 3/4: wrangler pages deploy dist → production"
PREVIEW_URL=$(wrangler pages deploy dist \
  --project-name="$PROJECT" \
  --branch="$BRANCH" \
  --commit-dirty=true 2>&1 | tee /tmp/deploy.log | grep -oE 'https://[a-f0-9]+\.[^ ]+' | tail -1 || true)

if [ -z "$PREVIEW_URL" ]; then
  err "wrangler deploy 输出里找不到 preview URL,看 /tmp/deploy.log"
  exit 1
fi
ok "部署成功,preview: $PREVIEW_URL"
ok "wrangler 已自动把它提升为 production"

# ---------- 4. verify production ----------
info "Step 4/4: 验证生产 CDN 是否吃到新 bundle"
sleep 3  # CF CDN 通常 1-2s,但保险

LIVE_BUNDLE=$(curl -sS "$PROD_URL/" 2>/dev/null | grep -oE 'index-[A-Za-z0-9_-]+\.js' | head -1 || true)
LOCAL_BUNDLE=$(ls dist/assets/ 2>/dev/null | grep -oE 'index-[A-Za-z0-9_-]+\.js' | head -1 || true)

if [ -z "$LIVE_BUNDLE" ] || [ -z "$LOCAL_BUNDLE" ]; then
  warn "无法拉取 bundle hash,可能是 CDN 缓存。手动验证:"
  echo "   curl -sS $PROD_URL/ | grep index-"
  exit 0
fi

echo "   local  : $LOCAL_BUNDLE"
echo "   live   : $LIVE_BUNDLE"

if [ "$LIVE_BUNDLE" = "$LOCAL_BUNDLE" ]; then
  ok "生产 bundle == 本地 bundle,部署完成"
else
  warn "生产 bundle 与本地不一致,可能 CF CDN 还在刷新(再等 30s 重试)"
fi

# ---------- 5. 顺便验证报告数据 ----------
echo ""
info "顺便验证研究报告数据是否在 bundle 里"

# 动态从 dist 取当前 bundle hash,避免 build 后 hash 变了脚本失效
RESEARCH_BUNDLE=$(ls -1 dist/assets/researchReports-*.js 2>/dev/null | head -1 | xargs -I{} basename {})
if [ -z "$RESEARCH_BUNDLE" ]; then
  warn "  未找到 dist/assets/researchReports-*.js,跳过验证"
else
  for id in bencao-cultural-revival-2026 japan-kampo-hegemony-2026 tcm-global-2026; do
    count=$(curl -sS "$PROD_URL/assets/$RESEARCH_BUNDLE" 2>/dev/null | grep -c "$id" || echo 0)
    if [ "$count" -gt 0 ]; then
      ok "  $id ✓"
    else
      warn "  $id 未在 live bundle 里(可能被 tree-shake)"
    fi
  done
fi

echo ""
ok "全部完成!打开 $PROD_URL/research 验证"