---
title: 前端页面与布局
description: 用 ToolShell 包裹页面、用 Panel 包裹模块，用 Tailwind 原生 12 栅格组织居中列与分栏。
---

所有 UI 视觉与交互同时遵循[设计规范](/design/overview/)（token、组件语义、三态、文案、反例清单）。

## ToolShell

每个工具页用 `@/components/tool/ToolShell` 包裹，它提供**页头**（标题 / 说明 / 动作按钮）
与**全幅内容区**：

```vue
<template>
  <ToolShell title="我的工具" description="说明文字">
    <template #actions>
      <Button>操作</Button>
    </template>

    <!-- 内容区全幅铺满 -->
  </ToolShell>
</template>
```

- Props：`title`、`description`
- 插槽：`actions`、默认插槽

## 用 Panel 包裹每个功能模块

页面里每个功能模块（设置 / 输入 / 输出 / 结果 / 列表）一律用
`@/components/tool/Panel` 包裹（外框 + 头部条标题 + 右上角动作 + 正文），
不要在页面上裸露模块，也不要在 Panel 内嵌套卡片——预览、表格等组件自身不带外框，外框交给 Panel。

```vue
<Panel title="输入">
  <template #actions>
    <Button size="sm" variant="ghost"><Trash2 class="size-3.5" />清空</Button>
  </template>
  <!-- 正文默认 space-y-3 p-4；满幅场景用 body-class 覆盖 -->
</Panel>
```

- 头部标题 `text-xs font-medium text-muted-foreground`；动作按钮 `size="sm"`、图标 `size-3.5`。
- 错误条用 `rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive`。

## 用原生栅格组织布局

居中列 / 分栏在页面内直接用 Tailwind 原生栅格（`grid grid-cols-12` +
`col-start-*` / `col-span-*`），**不要引入自定义栅格概念**，也不要使用
`mx-auto max-w-*` 居中容器。

```vue
<ToolShell title="我的工具" description="说明文字">
  <div class="grid w-full grid-cols-12 gap-4">
    <div class="col-span-12 lg:col-start-3 lg:col-span-8">
      <!-- 居中 8 列，lg 以下自动满幅 -->
    </div>
  </div>
</ToolShell>
```

常用档位：

| 场景 | 类 |
| --- | --- |
| 表格满幅 | 不加类（默认全幅） |
| 宽内容 | `col-span-10` |
| 混合 | `col-span-8` |
| 表单 / 设置 | `md:col-start-4 md:col-span-6` |

:::caution[居中列必须偶数跨距]
12 减去跨距需为偶数才能精确居中（如 `col-start-3 col-span-8`、`col-start-4 col-span-6`）。
奇数跨距无法真正居中。
:::

## 空态 / 加载态 / 错误态

三态用 `@/components/native` 的 `EmptyState` / `LoadingState` / `ErrorState`，标准写法参考
「页面模板」工具（`hello-world/frontend/views/TemplateTool.vue`）。不要自造三态样式，保持全应用一致。

:::note[裸 data 变体要转换]
新 registry 组件若使用裸 `data-checked:` / `data-open:` 等布尔变体，需改成
`data-[state=...]:`——reka-ui 2.10 只输出后者。
:::
