---
title: 前端页面与布局
description: 用 ToolShell 包裹页面，用 Tailwind 原生 12 栅格组织居中列与分栏。
---

## ToolShell

每个工具页用 `@/components/tool/ToolShell.vue` 包裹，它提供**页头**（标题 / 说明 / 动作按钮）
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

## 用原生栅格组织布局

居中列 / 分栏在页面内直接用 Tailwind 原生栅格（`grid grid-cols-12` +
`col-start-*` / `col-span-*`），**不要引入自定义栅格概念**，也不要使用
`mx-auto max-w-*` 居中容器。

```vue
<ToolShell title="我的工具" description="说明文字">
  <div class="mx-auto grid w-full grid-cols-12">
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

三态标准写法参考「页面模板」工具（`hello-world/frontend/views/TemplateTool.vue`）。
不要自造三态样式，保持全应用一致。

:::note[裸 data 变体要转换]
新 registry 组件若使用裸 `data-checked:` / `data-open:` 等布尔变体，需改成
`data-[state=...]:`——reka-ui 2.10 只输出后者。
:::
