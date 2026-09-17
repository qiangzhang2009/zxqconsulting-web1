# PRD — 岐黄四海品牌叙事重塑与全站改版

**作者**:品牌叙事重塑专案组
**版本**:v1.0 · 2026-09-13
**目标上线日期**:本 PRD 批准后 1 个工作日内

---

## 0. 背景

`zxqconsulting.com` 当前的核心叙事问题是**"做了很多事,但读起来像同一份 PPT 的不同页面"**。
本次改版锁定 12 个具体可执行项,把"做事"翻译成"故事"。

> **核心命题(本次唯一要打穿的一句话)**:岐黄四海不是一家中医出海咨询公司,而是**让世界重新认识中医药的一群人**。

> **品牌金句(必须出现在 5 处以上)**:`一脉岐黄。四海安康。`

---

## 1. 影响范围(scope)

| 层级 | 涉及文件 | 风险等级 |
|---|---|---|
| 文案 | `src/sections/*.tsx` × 11 | 低(纯文案) |
| 文案 | `src/locales/{zh,en,ja,ko}.json` × 4 | 中(i18n 联动) |
| 视觉 | Hero 网格重构 | 中(响应式) |
| 视觉 | Testimonials / Contact 配色统一 | 中 |
| 视觉 | 羊驼 InteractiveAvatar 尺寸重排 | 低(已有 compact 模式) |
| 工程 | 不改路由,不改 data,不改 build pipeline | — |

> **不在本期范围**:后台系统、admin、D1 数据库、worker 函数。

---

## 2. 12 项交付物详述(可验收)

### Item 1 — `brand.slogan` 金句露出

**现状**:`"一脉岐黄。四海安康。"` 仅在 `src/locales/zh.json:7` 静态定义,全站无视觉化引用。
**改动**:在以下 5 处显式露出
1. Hero 主标下方副位(小字 + 朱砂线分隔)
2. About 引言前(章节符 + slogan 居中)
3. Footer 主标上方(朱砂分隔条旁)
4. `index.html` `<title>` 后追加" — 一脉岐黄·四海安康"
5. 自定义 404 体验(创建一个 `NotFoundPage.tsx` 承载)

**验收**:`grep -r "一脉岐黄" src/ public/ index.html` 命中 ≥ 5。

---

### Item 2 — Hero 羊驼重新编排(保留作为吉祥物)

**现状**:`HomePage.tsx` 注释自承"InteractiveAvatar 属于工具审美,不符合品牌定位",但羊驼仍作为 Hero 第二列的核心视觉元素,体积过大(360px),喧宾夺主。
**改动**:
- 位置:从中列(360px)迁移到**右下角浮动吉祥物**,尺寸 80×80px ~ 120×120px,作为品牌差异化符号保留。
- 交互:点击展开"陪跑档案"浮层,展示 1 条真实客户合影(占位图)+ 项目编号 + 数字结果。
- 视觉:圆形头像 + 朱砂环 + 浮动呼吸动画,与品牌色一致。
- 保留:羊驼的鼠标交互帧动画(完整保留 `InteractiveAvatar` 组件)。

**验收**:桌面端羊驼不进入首屏主视觉区(视口 < 1280px 不显示,避免挤占文案);仅 1280+ 显示为右下角浮动锚点。

---

### Item 3 — Hero H1 改写为"判断承诺"

**现状**:`海外市场BD · 用算法 7 天为您打开海外市场` — 纯功能描述。
**改动**:
- 主标:`把出海判断,做到敢交给董事会。`
- 副标:`AI 7 天,1 万家候选,1 张敢签的判断书`
- 信任锚点改为:7 天交付 · 92% 入选率 · 算法 + 顾问 · 全程陪跑

**验收**:首屏加载后,前 3 秒内读者能用一句话复述这个承诺。

---

### Item 4 — CoreAdvantages 文案重构

**现状**:`专属订制算法 · 发现四大关键资源` — 标题 B2B 化,案例用"某"。
**改动**:
- 大标题:`我们做的事,只剩一件:陪你想清楚,要不要走这一步。`
- 四象限副标题改为**「下游 · 谁会买」/「上游 · 谁会供」/「资本 · 谁会投」/「对手 · 谁也在做」**(主谓结构)
- 加 1 个"我们拒绝的事"模块:`我们不卖报告 / 我们不做平台型陈列 / 我们不接不熟悉品类的项目`
- 案例占位从"某中药制药企业"改为带品牌口吻的化名:"某沪上百年中成药厂(经客户授权化名)"

---

### Item 5 — AlgorithmCases 增加中医消费品案例

**现状**:两个案例都是生物医药(insitro、易赛腾),与中医消费品客户错位。
**改动**:
- 保留 insitro(算法深度背书)
- 保留 易赛腾(本土+硬科技)
- **新增 1 个**真正属于中医药/汉方/本草消费品的案例,例如:某百年老字号本草品牌 × 日本药妆渠道(2026)。可在 `src/data/` 追加案例数据 + 在 `AlgorithmCases.tsx` 增加第 3 张卡。

> **注意**:本期不新增研究报告 PDF,只新增 AlgorithmCases 中的卡片展示。详细报告链接指向 `/research` 既有路由。

---

### Item 6 — OverseasBD 改为客户叙事特写

**现状**:与 Hero 视觉、文案、CTA、动画几乎完全重复(10,000+ → 50 → 12 → 3 出现 3 次)。
**改动**:
- 大标题:`陪一家百年老字号,7 天找到 32 个日本合伙人。`
- 内容从"4 步流程"重写为**单一案例的深挖**:客户画像 → 卡点 → 算法如何定位 → 7 天过程 → 最终签约。
- 移除 Hero 已有的功能介绍,保留一个**点击展开的细节面板**(避免重复阅读)。

---

### Item 7 — Services 四步情绪化改写

**现状**:`壹 · 智能诊断 / 贰 · 资源发现 / 叁 · 顾问陪跑 / 肆 · 持续支持` — 像 SOP。
**改动**:
- 壹 · `先帮你看清,这条路该不该走。`
- 贰 · `再看清楚,谁会陪你走。`
- 叁 · `然后陪着你,走到能签下来。`
- 肆 · `最后送你一程,直到它自己长起来。`

---

### Item 8 — About 加创始人独白/品牌起源

**现状**:直接进"我们是谁 + 价值观矩阵",缺故事。
**改动**:在价值观矩阵之前,加一段 200 字左右的开场独白:

```
我们看过一家中药老字号,把 800 万扔进日本市场,两年颗粒无收。
我们也陪过另一个老字号,7 天找到 32 家合伙人,3 家签 MOU。
差别不在资源,在路径。
这就是我们做岐黄四海的原因。
```

---

### Item 9 — CaseStudies 加强真实感

**现状**:4 个案例都用"某百年制药企业",且指标只给"进入时间"。
**改动**:
- 案例编号改为 `经客户授权化名` 标记
- 每个案例补 1 个 ROI / 复购率 / 客户续约数据(占位即可,如"客户续约 2 次")
- 案例分类标签后增加 `判断类型:进/退/留/换` 二级标签

---

### Item 10 — Testimonials 绑定 3 种客户画像

**现状**:3 条引言都是泛泛的"一站式顺畅",名字是"王晓明/李婷/张伟",头像路径不存在。
**改动**:改为 3 个真实出海客户画像的引言:
- 一位中药老字号 CEO(进入日本)
- 一位汉方护肤新锐创始人(进入欧美)
- 一位本草食品初创 CMO(进入东南亚)

每段引言强调"判断被验证"而非"服务顺畅"。

> 引言素材:`src/locales/zh.json:testimonials.items` 替换为新文案。**不引用虚构真名**;用"某百年老字号负责人"等合规化名。

视觉:把 dark navy 背景改为墨青+朱砂,与全站一致。

---

### Item 11 — 配色系统统一

**现状**:4 套主色并存
- 主站:墨青 #2F5D57 + 朱砂 #C2473B + 米白 #FAF8F3
- Hero 算法漏斗 / OverseasBD:amber/gold
- AlgorithmCases:dark navy + teal
- Testimonials / Contact:dark slate + emerald

**改动**:全站收编到 **「墨青 + 朱砂 + 米白」** + **dark mode(墨青背景 + 朱砂点缀)**两套
- Hero 算法漏斗:amber → 墨青+朱砂的明暗变体
- OverseasBD:amber → 墨青渐变 + 朱砂点
- AlgorithmCases:dark navy → 墨青暗底 + 朱砂点缀
- Testimonials:dark slate → 墨青暗底 + 朱砂
- Contact:dark slate → 墨青暗底 + 朱砂

---

### Item 12 — i18n 文案润色 + slogan 翻译

**现状**:`brand.slogan` 16 个语种只有 zh 写,其它语种 fallback 到 zh。
**改动**:补全以下语种的 slogan:
- en:`One lineage of Qihuang. Wellbeing across four seas.`
- ja:`岐黄の一脈、四海に安康を`
- ko:`기황의 한 맥, 사해에 안강을`
- de:`Eine Linie der Qihuang. Wohlsein über vier Meere.`
- fr:`Un souffle de Qihuang. Le bien-être aux quatre mers.`
- es:`Un linaje de Qihuang. Bienestar en los cuatro mares.`

**验收**:`grep -l "Four seas\|四海安康\|安康" src/locales/*.json | wc -l` ≥ 7

---

## 3. 部署与验证 SOP

每完成一项 → `npm run build` 本地校验 → `node scripts/verify-bundle.mjs` 通过 → 累积 commit → push `main`。
最后一并 commit 推送,触发 GitHub Actions(推 gh-pages)+ Cloudflare Pages GitHub 集成(推 www.zxqconsulting.com)。

部署完成后用 `scripts/deploy.sh` 直推兜底(若 webhook 卡住)。

---

## 4. 风险与回滚

- 风险点:Hero 网格重构可能影响响应式断点。已用 `lg:` `xl:` 双重断点保护,小屏单列堆叠不变。
- 风险点:i18n 文案可能未在 14 国全部翻译。先保 zh/en/ja/ko 四语,其余 fallback 到 en。
- 回滚:`git revert HEAD~1` + `git push --force-with-lease` 不动 gh-pages。

---

## 5. 验收清单(go-live)

- [ ] 12 项文案/视觉改动全部落地
- [ ] 浏览器截图(桌面 + 移动)视觉通过
- [ ] `npm run build` 通过
- [ ] `node scripts/verify-bundle.mjs` 通过
- [ ] git commit + push main 成功
- [ ] `curl https://www.zxqconsulting.com/ | grep index-` hash 与本地一致
- [ ] `https://www.zxqconsulting.com/` 加载首页能看到金句"一脉岐黄·四海安康"
