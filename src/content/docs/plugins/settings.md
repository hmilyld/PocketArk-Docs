---
title: 设置面板
description: 用 useToolSettings 读写插件配置，plugin.json 声明设置入口。
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

参考实现：`hello-world/frontend/settings/Settings.vue`。

:::caution[不要另建存储]
插件配置统一走 `useToolSettings(toolId, defaults)`，不要自己另建文件或 key，
否则会脱离设置导入 / 导出与重置的覆盖范围。
:::
