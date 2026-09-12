# PocketArk-Docs

[PocketArk](https://github.com/hmilyld/PocketArk) 的官方文档站：从 clone 到改名，从第一个
插件到打包发布。中文为主、英文同步。

基于 **Astro 7 + Starlight** 构建，输出纯静态站点。

## 本地开发

```bash
pnpm install
pnpm dev            # 开发服务器
pnpm build          # 类型检查 + 构建到 dist/
pnpm preview        # 预览构建产物
pnpm check          # Astro 类型 / 内容诊断
```

## 特性

- **中英双语**：中文在根路径 `/`，英文在 `/en/`，两侧同结构、同 slug、全量对齐。
- **默认亮色**：首屏亮色（`#f7f7f9` + 深靛蓝），可切换暗色「指挥台」主题。
- **产品化主题**：直接沿用应用自身的 token（`--sl-color-*` / `--ark-*`）、发丝线、
  紧凑圆角与等宽坐标；标题 Space Grotesk、正文 IBM Plex Sans、代码 JetBrains Mono，
  中文走系统字体。字体自托管在 `@fontsource-variable`。
- **能力矩阵**：落地页可搜索 / 筛选的 25 项框架能力一览（数据与 PocketArk 的
  `AGENTS.md` 能力索引一致）。
- **站内搜索**：Starlight 内置 Pagefind。

## 目录结构

```text
src/
├── components/
│   ├── CapabilityMatrix.astro   # 落地页签名组件（能力矩阵）
│   └── SiteTitle.astro          # 顶栏 logo + 站名覆盖组件
├── content/
│   ├── docs/                    # 中文内容（根路径）
│   │   └── en/                  # 英文内容（/en/）
│   └── i18n/                    # UI 文案覆盖（默认用 Starlight 内置翻译）
├── plugins/
│   └── rehype-table-wrapper.mjs # 给 Markdown 表格包滚动容器
├── styles/custom.css            # 主题 token、字体、表格与落地页样式
└── content.config.ts            # docs / i18n 内容集合
astro.config.mjs                 # Starlight 配置、i18n、侧栏、md 处理器
```

## 新增内容页

1. 在 `src/content/docs/<section>/<slug>.md` 新建中文页。
2. 在 `src/content/docs/en/<section>/<slug>.md` 新建对应英文页（slug 保持一致）。
3. 在 `astro.config.mjs` 的 `sidebar` 对应分组里追加 slug（如 `'section/slug'`）。
   分组标签用 `translations: { en: '...' }` 提供英文名；条目名取自页面 `title`。

## 部署

`pnpm build` 生成 `dist/`，可部署到任意静态托管（GitHub Pages / Cloudflare Pages /
Netlify / Nginx 等）。部署前把 `astro.config.mjs` 的 `site` 改成真实域名。

## 相关仓库

- 应用本体：[hmilyld/PocketArk](https://github.com/hmilyld/PocketArk)
