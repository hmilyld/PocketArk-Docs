---
title: 插件机制
description: 插件目录结构、构建期自动注册，以及必须遵守的命名与作用域约定。
---

PocketArk 的所有工具都以**插件**形式存在：一个目录就是一个插件，前端与后端同处其中。
`plugin.json` 是唯一事实源。

## 目录结构

```text
plugins/<plugin-id>/
├── plugin.json          # 清单（唯一事实源；前后端扫描共用）
├── README.md
├── frontend/            # 前端
│   ├── views/           # 工具页面（每个 tools[] 项一个文件）
│   ├── settings/        # 设置面板（可选）
│   ├── components/      # 插件私有组件（可选）
│   ├── composables/     # 组合式函数（可选）
│   ├── schema.ts        # 数据库表定义（可选，自动聚合）
│   ├── setup.ts         # 生命周期钩子（可选，自动扫描）
│   └── shared.ts        # 插件内共享常量 / 工具（可选）
└── backend/             # 后端（可选）
    ├── mod.rs           # Rust 命令（#[tauri::command]）+ `pub mod migrations;`
    ├── migrations.rs    # 迁移定义：导出 `pub fn all() -> Vec<Migration>`（可选）
    └── *.rs             # 其余后端代码 / 资源
```

`_` 或 `.` 开头的目录不参与注册（如模板 `_template`）。

## 构建期自动注册

新增插件**无需在任何框架文件里登记**：

- **前端**：Vite 扫描 `plugins/*/frontend/**`——`views` / `settings` / `setup.ts` / `schema.ts`
  会自动聚合。导航、路由、标题、启停开关、设置面板、错误边界、KeepAlive 全部自动生效。
- **后端**：`src-tauri/build.rs` 扫描 `plugins/*/backend/mod.rs`，解析其中的 `#[tauri::command]`
  自动登记命令，读取 `backend/migrations.rs` 聚合迁移，生成 `plugins/mod.rs` include 与
  `generate_handler!`。

:::caution[命令必须写在 backend/mod.rs]
`build.rs` 只扫描 `plugins/<id>/backend/mod.rs`；该文件里的其余 `.rs` 作为它的子模块
（`pub mod xxx;`）。命令名全局唯一，必须带 `<plugin_id>_` 前缀——重名会让生成的
`generate_handler!` 出现重复分支，`build.rs` 会在构建期直接报错。
:::

## 命名与路由

| 项 | 规则 |
| --- | --- |
| 插件 id | 全局唯一、kebab-case、等于目录名，路由为 `/tool/:id` |
| 工具 id | `tools[].id`，全局唯一；建议 `<plugin-id>` 或 `<plugin-id>-<功能>` |
| Rust 命令 | 函数名 = 前端调用名，带 `<plugin_id>_` 前缀 |
| 迁移 | `migration(scope, version, ...)`，scope = 插件 id，version 作用域内从 1 递增 |

## 排序

- 插件分组序 = 组内最小 `order`。
- 组内工具序 = `order * 1000 + tools 数组下标`。
- 缺省 `order` 为 100，之后按目录名字母序。

下一节：[创建插件](/plugins/create/) 与 [plugin.json 清单](/plugins/manifest/)。
