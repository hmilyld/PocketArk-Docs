---
title: 插件机制
description: 插件目录规范、构建期自动注册，以及必须遵守的命名与作用域约定。
---

PocketArk 的所有工具都以**插件**形式存在：一个目录就是一个插件，前端与后端同处其中。
`plugin.json` 是唯一事实源。

## 目录规范

```text
plugins/<plugin-id>/
├── plugin.json          # 清单（唯一事实源；前后端扫描共用）
├── README.md            # 功能说明（面向使用者）
├── AGENTS.md            # 开发约定（面向 AI / 维护者，写了才有）
├── frontend/            # 前端
│   ├── views/           # 工具页面（每个 tools[] 项一个 PascalCase.vue）
│   ├── settings/        # 设置面板（可选，plugin.json 声明）
│   ├── components/      # 插件私有组件（可选；同一功能域 ≥2 个 → components/<feature>/）
│   ├── composables/     # 组合式函数（可选，useXxx.ts）
│   ├── lib/             # 纯逻辑 TS（可选，无 Vue 依赖）
│   ├── shared.ts        # 插件内共享常量 / 类型（可选）
│   ├── schema.ts        # 数据库表定义（可选，被代码 import）
│   └── setup.ts         # 插件生命周期钩子（可选，构建期扫描）
└── backend/             # 后端（可选）
    ├── mod.rs           # #[tauri::command] 命令（**只能写在这里**）
    ├── migrations.rs    # 迁移聚合：导出 `pub fn all()`（可选）
    ├── <feature>/       # 多文件功能域（≥2 文件）：<feature>/mod.rs + 其余 .rs
    └── <single>.rs      # 单文件功能域 / 资源
```

**硬规则**

- `frontend/` 顶层**只允许**白名单：`views/ settings/ components/ composables/ lib/ shared.ts schema.ts setup.ts`。
  其他内容一律放进上述目录或 `lib/`。
- 纯逻辑（无 Vue 依赖）放 `frontend/lib/`；需要响应式 / 生命周期才放 `frontend/composables/`。
- 命名：组件 `PascalCase.vue`；composable `useXxx.ts`；其余 TS 用 `kebab-case.ts`；Rust 文件 `snake_case.rs`；
  功能域目录用单数小写名词。
- 命令只写在 `backend/mod.rs`（`build.rs` 只扫描该文件），其余 `.rs` 作为它的子模块。
- 纯前端插件允许只有 `frontend/`，但 `plugin.json` / `README.md` / `AGENTS.md` 仍必需。
- `_` 或 `.` 开头的目录不参与注册（如模板 `_template`）。

机器校验由 `scripts/lint-plugins.mjs`（R-P1~R-P6）承担，已接入 `pnpm lint`；确需例外时在文件内写
`lint-plugins-ignore` 并注明理由。

## 构建期自动注册

新增插件**无需在任何框架文件里登记**：

| 扫描点 | 位置 | 说明 |
| --- | --- | --- |
| 清单 | `plugins/*/plugin.json` | 工具 / 设置 / 图标 / 排序 |
| 工具页 | `plugins/*/frontend/views/*.vue` | `manifest.tools[].entry` 指向 |
| 设置面板 | `plugins/*/frontend/settings/*.vue` | `manifest.settings.entry` 指向 |
| 前端钩子 | `plugins/*/frontend/setup.ts` | 插件初始化 |
| 后端命令 | `plugins/*/backend/mod.rs` | `build.rs` 解析 `#[tauri::command]` 并生成注册 |
| 迁移 | `plugins/*/backend/migrations.rs` | 聚合为 `all()`，按 scope 版本化 |

导航、路由、标题、启停开关、设置面板、错误边界、KeepAlive 全部自动生效。

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

## 参考实现

- `plugins/_template/`：最小骨架（脚手架来源），演示目录规范与页面结构。
- `plugins/hello-world/`：完整链路演示（命令、日志、数据库、表单、表格、任务、通知、多窗口）。
- `plugins/system/`：纯前端插件示例（无 backend，仅表格与对话框）。

下一节：[创建插件](/plugins/create/) 与 [plugin.json 清单](/plugins/manifest/)。
