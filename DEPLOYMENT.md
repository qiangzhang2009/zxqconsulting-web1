# 部署指南（zxqconsulting-web1）

> **核实于 2026-10-12。** 本文是对线上现状的实测结论,取代此前通篇教 `vercel deploy` 的 Vercel 时代版本。
> **强制规则见 `.cursor/rules/deployment.mdc`**(与本文冲突时以规则文件为准)。

---

## 〇、TL;DR

- **生产站点由 Cloudflare Pages 托管,不是 Vercel,也不是 Cloudflare Tunnel。**
- **发布 = `git push origin main`**,GitHub Actions 自动构建并部署。无需本地跑 `vercel`,无需碰 tunnel。
- 验线上**一律用 `www.zxqconsulting.com`**(裸域落后,见 § 二)。

```bash
# 发布
cd /Users/john/zxqconsulting-web1
npx tsc -b --noEmit && npm run build && node scripts/verify-bundle.mjs
git add <明确的文件路径...> && git commit -m "[P0/P1/P2]: 描述"
git push origin main          # 推送即部署
```

---

## 一、平台拓扑(实测)

**Vercel 已下线** —— 生产 URL `https://zxqconsulting-web1-....vercel.app` 返回 `410 GONE`。仓库里若还有 `vercel deploy` 相关指引,一律作废。

**Cloudflare Tunnel 未托管主站** —— `~/.cloudflared/config.yml` 虽然把 `zxqconsulting.com` 指向 `localhost:3006`,但 **3006 端口无服务监听**(实测 `curl` 返回 `000`),该映射实际不生效。Tunnel 仍在运行,只服务本机的兄弟站/开发站:

`xizi.zxqconsulting.com`(:3001)、`zhi.ji`/`zero`(:3003)、`quotation-japan`(:3004)、`webhub`(:3005)、`sourcebridge`(:8003)、`tradehub`(:8000)、`global2china`(:3010)、`africa`(:3011)、`backend-admin`(:3020)、`prismatic`(:3030)、`asiabridge`(:3040)、`mycelink`(:8030)、`japandata`(:8040)、`sop`(:8080)。

**主站真实托管方 = Cloudflare Pages**,项目 `qiangzhang2009-zxqconsulting-web1`(由 `wrangler.toml` 的 `name` / `pages_build_output_dir` 与 CI 部署日志确认)。

### 同时部署的两个目标

| 目标 | 部署方式 | 说明 |
| --- | --- | --- |
| Cloudflare Pages | CI `wrangler-action` 步骤 | 主站,生产入口 |
| GitHub Pages(`gh-pages` 分支) | CI `peaceiris/actions-gh-pages` 步骤 | 镜像 |

两者都由 push `main` 触发。

---

## 二、⚠️ 裸域与 www 不是同一个版本

实测(2026-10-12):

| 入口 | 构建 chunk | index.html meta | 状态 |
| --- | --- | --- | --- |
| `zxqconsulting.com`(裸域) | `index-BduvQaB_.js` | 旧文案 | **落后**,响应头带 `x-robots-tag: noindex` |
| `www.zxqconsulting.com` | `index-CaUgDHY7.js` | 新文案(= 当前 HEAD) | 最新 |

CI 只部署 `www` 侧那个 Pages 项目,**裸域不随之更新**。

**因此:验证线上改动必须用 `www.` 域名**,否则会把"已生效"误判成"没生效"。裸域的新旧差异是既有技术债,不要在普通功能改动里顺手修。

---

## 三、部署流程

`.github/workflows/deploy.yml` 触发条件:`push` 到 `main`,或手动 `workflow_dispatch`。

```bash
git push origin main
  └─ CI: npm ci → npm run build → node scripts/verify-bundle.mjs
        → GitHub Pages (peaceiris) + Cloudflare Pages (wrangler-action)
```

### 发布前本地校验(与 CI 同一套,任一失败勿推)

```bash
npx tsc -b --noEmit           # TS 0 错误
npm run build                  # Vite 构建
node scripts/verify-bundle.mjs # 必须全绿
```

### 提交

工作区常有大批与任务无关的未跟踪文件,**必须显式 `git add <路径>`,禁止 `git add .`**(尤其不能带上 `.env.production` / `.env.vercel`)。

### 推送后验证(约 1–2 分钟)

```bash
gh run list --workflow=deploy.yml --limit 1          # CI 结果
gh run view <run-id> --log | grep "Deployment complete"

# 用 www 验证:线上 chunk 应与本地 dist/index.html 一致
curl -sL https://www.zxqconsulting.com/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js' | head -1
grep -o 'assets/index-[A-Za-z0-9_-]*\.js' dist/index.html
```

### CF Pages 卡住时(>10 分钟未更新)

不要干等,直接本地直推:

```bash
./scripts/deploy.sh              # build + verify + wrangler pages deploy
./scripts/deploy.sh --check-token # 先验 token
./scripts/deploy.sh --skip-build   # 已 build 过,只推
```

---

## 四、新增一篇报告的完整清单

1. 报告 HTML 放进 `public/_reports/<slug>.html`;
2. 在 `src/data/researchReports.ts` 的 `RESEARCH_REPORTS` 加一条(`id` 为小写 slug,路由即 `/research/<id>`);
3. 需密码则加 `passwordHash: '<SHA-256(明文) 小写hex>'`;
4. 把新 `id` 追加进 `.github/deploy-asserts.json` 的 `reportIds`;
5. 本地 `npm run build` 后 `grep -c "<id>" dist/assets/researchReports-*.js` 必须 ≥ 1;
6. 提交推送,再按 § 三 验证。

---

## 五、相关文件

| 文件 | 作用 |
| --- | --- |
| `.cursor/rules/deployment.mdc` | **强制规则**(部署铁律,含历史踩坑) |
| `.github/workflows/deploy.yml` | CI 部署流程 |
| `.github/deploy-asserts.json` | bundle 内容断言 |
| `wrangler.toml` | Cloudflare Pages / D1 / KV 配置 |
| `scripts/deploy.sh` | 本地直推 SOP |
| `scripts/verify-bundle.mjs` | 构建产物 sanity check |
| `scripts/e2e-prod-smoke.mjs` | 生产端到端冒烟 |

---

## 六、已知限制

**报告密码只是前端门槛。** `passwordHash` 随前端 bundle 发布,且 `/_reports/*.html` 本身位于可公开访问的静态路径。它挡的是随手点开,不是真正的访问控制 —— 知道 URL 的人可绕过 UI 直接下载。真正受控需把文件移出 `public/`(后端函数或 R2 鉴权),属另一套架构改动。
