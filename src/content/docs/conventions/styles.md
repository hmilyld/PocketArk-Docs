---
title: 样式、主题与代码风格
description: 语义色、lucide 图标、主题三处同步与 prettier 代码风格。
---

## 样式

使用 shadcn-vue 语义色（`bg-primary`、`text-muted-foreground` 等），**禁止硬编码色值**。
已有 `text-success` / `text-warning` / `text-info`、`bg-console` 等 token。

## 图标

只允许 `@lucide/vue`（`lucide-vue-next` 已弃用，勿再引入）。

## 代码风格

prettier：单引号、100 列、尾逗号 `es5`。提交前跑：

```bash
pnpm format
```

`src/components/ui/**` 是 shadcn-vue CLI 生成物：可改样式，勿改结构 / 逻辑。

## 主题

- **主题色**：设置页可切 6 档；新增自定义色需同步三处：
  `assets/index.css` 的 accent class → `core/theme` 的 `ACCENTS` → `index.html` 防闪白脚本。
- **默认主题色 / 默认主题**：改 `core/theme/index.ts` 的 `DEFAULT_ACCENT` / `DEFAULT_THEME`
  （`pnpm scaffold` 也可交互式设置）。
- **根字号**：设置页三档（小 13 / 正常 14 / 大 15），全部 UI 等比缩放；
  档位刻度定义见 `assets/index.css` 的注释表。
- **暗色基调**：默认暗色（深空蓝灰），亮色同步维护；修改色板对照 `index.css` 中
  `:root` / `.dark` 两段及 `core/theme` 的 `NATIVE_BG`（原生窗口底色）。

:::danger[跟随系统必须清除外观覆盖]
`applyTheme` 会同步 NSWindow.appearance / NSWindow.backgroundColor（macOS）。强制
darkAqua / aqua 会把 webview 的 `prefers-color-scheme` 钉死在对应外观上——「跟随系统」
必须传 `dark: null` 清除覆盖（见 `set_window_appearance` 三态设计）。
:::

:::caution[字号别硬编码 px]
所有 UI 均随设置缩放；若发现未跟随的界面，多半是硬编码了 px——改用 `rem` / 语义 token
（`text-sm`、`h-9` 等）。
:::
