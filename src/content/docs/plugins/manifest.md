---
title: plugin.json 清单
description: plugin.json 的全部字段：元数据、工具项、入口声明与迁移桥接。
---

`plugin.json` 是插件的唯一事实源，前后端扫描共用同一份清单。

## 顶层字段

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 插件 id，全局唯一、kebab-case，**必须等于目录名** |
| `name` | 是 | 插件分组显示名（侧栏分组标题） |
| `description` | 否 | 插件说明 |
| `group` | 否 | 显式分组名；缺省按 `order` 归入默认分组 |
| `order` | 否 | 排序权重，缺省 100；分组序取组内最小 `order` |
| `keywords` | 否 | 关键词数组，供全局搜索命中 |
| `legacyMigrations` | 否 | 旧全局版本 → 新本地版本的迁移桥接映射 |

## tools[] 工具项

一个插件可声明多个工具项，各自独立导航、独立启停、独立设置 tab：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 工具 id，全局唯一，路由 `/tool/:id` |
| `name` | 是 | 工具显示名 |
| `description` | 否 | 一句话描述 |
| `icon` | 是 | lucide 图标名（如 `Rocket`、`Table`） |
| `entry` | 是 | 页面入口，**相对插件目录且含 `frontend/` 前缀**，如 `frontend/views/Tool.vue` |
| `keepAlive` | 否 | 默认 `true`；设为 `false` 退出缓存，切回重置 |

## settings

声明设置面板入口：

```json
{
  "settings": {
    "entry": "frontend/settings/Settings.vue"
  }
}
```

## 一个完整示例

```json
{
  "id": "hello-world",
  "name": "示例插件",
  "description": "演示插件开发全链路：Rust 命令、SQLite、日志、HTTP、布局体系",
  "group": "示例",
  "keywords": ["demo", "示例"],
  "order": 1,
  "legacyMigrations": { "1": 1, "2": 2 },
  "tools": [
    {
      "id": "hello-world",
      "name": "示例工具",
      "description": "Rust 命令调用、日志管道与 SQLite notes 读写",
      "icon": "Rocket",
      "entry": "frontend/views/Tool.vue",
      "keepAlive": true
    }
  ],
  "settings": { "entry": "frontend/settings/Settings.vue" }
}
```

:::note[入口路径]
`tools[].entry` 与 `settings.entry` 都是**相对插件目录**、且**含 `frontend/` 前缀**的路径。
写错会导致构建期找不到页面。
:::
