---
title: 设置面板
description: 用 SettingsSection / SettingsRow / SettingsField 统一设置页 UI，用 useToolSettings 读写配置。
---

## 1. 声明入口

在 `plugin.json` 声明设置面板：

```json
{
  "settings": {
    "entry": "frontend/settings/Settings.vue"
  }
}
```

## 2. 读写配置

在 `frontend/settings/Settings.vue` 用 `useToolSettings` 读写配置：

```ts
const config = useToolSettings<MyConfig>('timestamp-tool', { format: '秒' });

config.value.format = '毫秒'; // 修改即自动持久化
```

配置存储在 `settings.json` 的 `tools.<toolId>` 命名空间，与 defaults **深合并**——
新增配置字段会自动获得默认值，无需迁移。

## 3. 设置页 UI 统一

系统设置页与所有插件设置面板统一用 `@/components/settings` 的
`SettingsSection` / `SettingsRow` / `SettingsField`（单一事实源，视觉随系统设置页），
勿自造小节标题与卡片样式：

```vue
<template>
  <div class="space-y-6">
    <SettingsSection title="分组标题" description="可选说明">
      <SettingsRow title="设置项标题" description="一行说明">
        <Switch v-model="…" />
        <!-- 右侧控件，宽度用 w-40 / w-64 / w-72 -->
      </SettingsRow>
      <!-- 密集数值字段：SettingsSection 内用 grid + SettingsField -->
    </SettingsSection>
  </div>
</template>
```

- 细粒度布尔用复选框，强调型 / 整组开关用开关（分组表单内用 `size="sm"` mini 尺寸）。
- 设置项**立即生效**，不提供「应用 / 确定」。

参考实现：`hello-world/frontend/settings/Settings.vue`。

:::caution[不要另建存储]
插件配置统一走 `useToolSettings(toolId, defaults)`，不要自己另建文件或 key，
否则会脱离设置导入 / 导出与重置的覆盖范围。
:::
