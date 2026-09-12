# PocketArk-Docs — AGENTS.md

PocketArk 的文档站（Astro 7 + Starlight）。中文在根路径、英文在 `/en/`。
上游应用仓库：[hmilyld/PocketArk](https://github.com/hmilyld/PocketArk)。

## 常用命令

```bash
pnpm dev            # 开发服务器
pnpm build          # 构建到 dist/（改内容后必须跑）
pnpm preview        # 预览构建产物
pnpm check          # astro check：类型 / 内容诊断（改代码或内容后跑）
```

约定：改动后至少跑 `pnpm check && pnpm build`。

## 目录速览

```text
src/content/docs/          # 中文内容（根路径 /）
src/content/docs/en/       # 英文内容（/en/，slug 与中文一一对应）
src/components/            # CapabilityMatrix（落地页）、SiteTitle（顶栏覆盖）
src/plugins/               # rehype 插件（表格滚动容器）
src/styles/custom.css      # 主题 token / 字体 / 表格 / 落地页样式
astro.config.mjs           # Starlight、i18n、sidebar、markdown 处理器
```

## 关键约定与易错点（改前必读）

- **Markdown 处理器**：Astro 7 默认处理器是 Sätteri，`markdown.remarkPlugins` /
  `rehypePlugins` 已废弃。本项目用 `markdown.processor: unified({ rehypePlugins: [...] })`
  （`unified` 来自 `@astrojs/markdown-remark`，已作为依赖安装）。不要改回
  `markdown.rehypePlugins`，否则会触发弃用告警且行为不确定。
- **表格铺满 + 自适应**：Starlight 给正文表格设了 `display: block`，表内匿名表格会
  收缩到内容宽度（宽窗右侧留白）；而 `overflow` 在 `display: table` 盒上不生效，
  所以纯 CSS 无法「铺满 + 可滚动」两全。方案是二者配合，**不可只改其一**：
  - `src/plugins/rehype-table-wrapper.mjs` 给每个 `<table>` 包一层 `<div class="md-table">`；
  - `custom.css` 里表格 `display: table; width: 100%`，单元格 `overflow-wrap: anywhere`，
    仅 4 列及以上宽表设 `min-width: 34rem`（窄屏由 `.md-table` 横向滚动）。
- **i18n 默认语言**：`locales` 的默认项 key 必须是 `root`（`defaultLocale: 'root'`），
  中文才会落在根路径。若用命名 key（如 `zh`）会导致默认语言也被加上路径前缀、内容错位。
- **默认亮色**：Starlight 服务端默认渲染 `data-theme="dark"`，靠 `astro.config.mjs`
  `head` 里的内联脚本（在主题脚本之前写入 `localStorage['starlight-theme'] = 'light'`）
  实现首屏亮色。不要删除该脚本。
- **顶栏 Logo**：不要用 Starlight 的 `logo` 配置加载 SVG——Astro 7（Rolldown）会把导入的
  SVG 内联成 data URL，构建期报 `Unknown module format: image/svg+xml`。本项目改为覆盖
  `SiteTitle.astro`，用内联主题化 SVG。
- **主题与字体**：颜色只走 `custom.css` 的 `--sl-color-*` / `--ark-*`，不要在内容里硬编码
  色值。字体由 `@fontsource-variable/*` 在 `custom.css` 顶部 `@import` 自托管；中文走
  系统 CJK 字体（不下载数 MB 中文字体）。
- **能力矩阵数据**：`src/components/CapabilityMatrix.astro` 的能力清单需与 PocketArk 的
  `AGENTS.md`「框架能力索引」保持一致；上游新增能力时同步更新。
- **frontmatter 引号**：`description` 等字段含 `:` 时必须用引号包裹，否则 YAML 解析失败。

## 内容规范

- 中文为主、英文同步：新增页面须同时提供 `docs/...` 与 `docs/en/...` 两份，slug 一致；
  并在 `astro.config.mjs` 的 `sidebar` 里追加条目。
- 侧栏分组标签用 `translations: { en: '...' }`；条目名取自页面 `title`，无需重复配置。
- 只改 `src/`；`dist/`、`.astro/`、`node_modules/` 均为生成物，勿手改、勿提交。
