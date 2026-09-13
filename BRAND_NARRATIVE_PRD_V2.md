# PRD v2 — 品牌叙事深化 + 羊驼吉祥物升级 + 部署上线

**作者**:品牌叙事重塑专案组(基于 v1 PRD 评估报告)
**版本**:v2.0 · 2026-09-13
**目标上线日期**:本 PRD 批准后 1 个工作日内

---

## 0. 背景

v1 PRD 12 项交付物已落地 82%。**v2 聚焦"叙事最后一公里"——把品牌从"页面正确"推到"读者能复述"**。

> **v2 唯一要打穿的命题**:让品牌有一句话,读者会拿去跟朋友讲。

> **3 个候选主视觉金句**(任选 1 做海报):
> 1. `把出海判断,做到敢交给董事会。`(Hero H1)
> 2. `差别不在资源,在路径。`(About 独白)
> 3. `我们不卖报告,我们不接不熟悉品类的项目。`(CoreAdvantages)

---

## 1. 范围(scope)

| 层级 | 涉及文件 | 风险 |
|---|---|---|
| 文案 | `src/sections/{Hero,About,CoreAdvantages,Services,AlgorithmCases,OverseasBD,Testimonials,Footer}.tsx` × 8 | 低(纯文案/视觉调整) |
| 文案 | `src/locales/{ar,de,en,es,fr,id,it,ja,ko,lo,ms,pt,ru,th,vi,zh}.json` × 16 | 中(i18n 联动) |
| 视觉 | Hero 羊驼吉祥物升级(尺寸 + 位置 + 显示断点) | 中(响应式) |
| 视觉 | Hero 产业网络图例配色统一 | 低 |
| 新增 | `src/pages/NotFoundPage.tsx` + 注册路由 | 低(已有 fallback)|
| 工程 | 不改路由路径参数名、不改 data、不改 build pipeline | — |

---

## 2. 8 项交付物(可验收)

### Item 1 — slogan 16 语种全对齐 + testimonials 真实化同步

**现状**:
- `zh.json`: `"slogan": "一脉岐黄。四海安康"` ✅
- `en.json`: `"One Pulse of Qihuang. Health Across Four Seas."` ✅
- `ja.json`: `"AI-Powered · Resource-Driven..."` ❌ 完全错位
- 其余 13 语种:缺失或 fallback

**改动**:补全 16 语种 brand.slogan,统一口径:

```
zh: "一脉岐黄。四海安康。"
en: "One Pulse of Qihuang. Health Across Four Seas."
ja: "岐黄の一脈、四海に安康を。"
ko: "기황의 한 맥, 사해에 안강을。"
de: "Eine Linie der Qihuang. Wohlsein über vier Meere."
fr: "Un souffle de Qihuang. Le bien-être aux quatre mers."
es: "Un linaje de Qihuang. Bienestar en los cuatro mares."
pt: "Um sopro de Qihuang. Bem-estar nos quatro mares."
it: "Un soffio di Qihuang. Benessere nei quattro mari."
ru: "Одна линия Цихуан. Благополучие четырёх морей."
ar: "نَسْلُ تشيهوانغ الوَحيد. عافِيَةٌ في البِحار الأربَع."
th: "สายเลือดฉีหวงหนึ่งเดียว สุขภาวะทั่วสี่ทะเล"
vi: "Một mạch Qihuang. An lành bốn bể."
id: "Satu sanur Qihuang. Kesejahteraan empat laut."
ms: "Satu salasilah Qihuang. Kesejahteraan empat laut."
lo: "ສາຍເລືອດຈືຫວາງດຽວ. ສຸຂະພາບທົ່ວສີ່ທະເລ"
```

**testimonials.items 同步**:把 zh.json 已升级的 3 个真实出海客户画像同步到 en/ja/ko(其余语种 fallback 到 en)。

**验收**:`grep -l "四海安康\|Four seas\|四海安康" src/locales/*.json | wc -l` ≥ 7

---

### Item 2 — Hero 主标下方加"岐黄"注解

**现状**:读者第一次看到"岐黄四海"会卡 0.5 秒(岐黄是谁?)
**改动**:在 Hero 主标下方、副标上方,加一行 serif 小字注解:

```
> "岐黄"二字取自岐伯、黄帝 —— 中医药的两千年源头
```

**验收**:Hero 截图肉眼可见注解行;移动端断点不变。

---

### Item 3 — 羊驼吉祥物升级(保留 + 重设计)

**现状**:仅 xl+(≥1280px)显示 112px,藏在漏斗右下角;中等屏(1024-1280px)完全不出现,丢掉了"看到第一眼就记住"的差异化机会。

**改动**:
- **显示断点**:lg+(≥1024px)即显示(去掉 `hidden xl:block`)
- **位置**:从"漏斗右下角浮动"改为 **Hero 左下角品牌锚点**(与品牌金句"一脉岐黄"形成视觉对话)
- **尺寸**:桌面端 130×130 ~ 140×140px(适度放大),中屏 110×110px
- **交互**:
  - 点击 → 展开"陪跑档案"浮层(保留现有逻辑)
  - 增加 1 个 hover 微动效(朱砂环呼吸 + 微微上浮)
  - 鼠标 hover 标签从"算法小驼驼"改为"岐黄四海的 AI 助手"
- **不变**:朱砂环、圆形头像、内部 InteractiveAvatar 组件、动画

**验收**:
- 桌面 ≥1280px 显示 140px
- 中屏 1024-1280px 显示 110px
- 移动端 <1024px 不显示(避免挤占文案)
- 视觉不抢文案主标戏

---

### Item 4 — About 创始人独白下方加"主理人说"卡

**现状**:About 段独白用"我们",没有第一人称锚点
**改动**:在 About 独白卡片下方,新增一张"主理人说"占位卡:

```
┌─────────────────────────────────┐
│  [主理人头像占位] 主理人说         │
│                                  │
│  "我们做这件事不是要给行业多一个   │
│   选择,而是要让每一个想出海的     │
│   中医药人,都敢迈出下一步。"      │
│                                  │
│  —— 张小强,岐黄四海 主理人        │
└─────────────────────────────────┘
```

**做法**:占位卡(头像位置用圆形渐变占位),先文字先到位,后期拍摄替换。

**验收**:About 截图可见"主理人说"卡;视觉与品牌调性一致。

---

### Item 5 — CTA 三层分级

**现状**:所有版块只有 2 个 CTA(开始诊断 + 看案例),缺 Tertiary "教育型订阅"层
**改动**:在每个 CTA 区追加 Tertiary 按钮(订阅《出海判断周报》),文字统一:

- 一级(主菜): `开始 7 天陪跑` / `开始智能诊断`
- 二级(沙拉): `看 32 个真实陪跑档案` / `看更多陪跑档案`
- 三级(点心): `订阅《出海判断周报》` ← **新增**

**应用到**:Hero、CoreAdvantages、Services、AlgorithmCases、OverseasBD

**样式**:Tertiary 用细描边 + 弱色,视觉权重最低,让读者愿意"免费订阅先看看"。

---

### Item 6 — Hero 产业网络图例配色统一

**现状**:Hero 底部"产业网络拓扑"图例还在用 `bg-emerald-500`(CAPITAL) 和 `bg-cyan-400`(SUPPLIER),与品牌墨青+朱砂脱节
**改动**:
- CAPITAL: `bg-emerald-500` → `bg-[#2F5D57]`(墨青)
- SUPPLIER: `bg-cyan-400` → `bg-[#C2473B]`(朱砂,作为"供应"强调)

**验收**:Hero 截图全站只有墨青+朱砂+米白三个主色,无 emerald/cyan。

---

### Item 7 — NotFoundPage 占位页(品牌金句第 5 处露出)

**现状**:`*` 通配路由 fallback 到 HomePage,没有 404 体验
**改动**:新增 `src/pages/NotFoundPage.tsx`:
- 中央:金句"一脉岐黄·四海安康" + 短引言"这一页找不到了,但你的判断不会迷路"
- 单一 CTA:回首页 / 联系顾问
- 视觉:墨青底 + 朱砂点缀,与 Testimonials 风格一致

**注册**:`src/routes.tsx` 中 `path: '*'` → element 改为 NotFoundPage

**验收**:访问 `/this-page-does-not-exist` 看到 404 + 金句 + CTA。

---

### Item 8 — 部署生产

**SOP**:
1. `npm run build` 本地校验
2. `node scripts/verify-bundle.mjs` 通过
3. `git status --short | wc -l` 确认 < 1000
4. `git add` 只 add 真实改动文件
5. `git commit -m "feat(narrative): v2 PRD 8 项交付物 - slogan 多语种 + 羊驼升级 + 主理人说 + CTA 分级 + NotFoundPage"`
6. `git push origin main`
7. 等待 CF Pages webhook(2-5 分钟)
8. `curl https://www.zxqconsulting.com/ | grep index-` hash 一致

**风险**:
- Hero 网格断点变化可能影响响应式 → 已用 lg/xl 双重断点保护
- 16 语种 JSON 改动量大 → 只动 brand.slogan 和 testimonials.items 两块,其他不动
- NotFoundPage 是新页面 → 不需要单独 chunk,直接 inline 即可

---

## 3. 风险与回滚

| 风险 | 缓解 |
|---|---|
| Hero 网格重构影响响应式 | `lg:` `xl:` 双重断点保护,小屏单列堆叠不变 |
| i18n 改动覆盖 16 文件 | 只动 `brand.slogan` 和 `testimonials.items` 两个 key,其余不动 |
| 羊驼尺寸变大可能抢戏 | 左下角位置+低调 breath 动画,文案主标仍占据视觉中心 |
| NotFoundPage 是新页面 | 用最简单结构,无外部依赖 |

**回滚**:`git revert HEAD~1` + `git push --force-with-lease`(不动 gh-pages)

---

## 4. 验收清单(go-live)

- [ ] 8 项文案/视觉改动全部落地
- [ ] Hero 在 1024px+ 显示 130~140px 羊驼吉祥物
- [ ] About 在 段独白下方显示"主理人说"卡
- [ ] 5 处版块含 Tertiary "订阅周报" CTA
- [ ] 16 语种 brand.slogan 对齐(`grep -l "四海安康\|Four seas\|安康" src/locales/*.json | wc -l` ≥ 7)
- [ ] 访问 `/notexists` 跳转 404 页面含金句
- [ ] `npm run build` 通过
- [ ] `node scripts/verify-bundle.mjs` 通过
- [ ] git commit + push main 成功
- [ ] `curl https://www.zxqconsulting.com/ | grep index-` hash 与本地一致