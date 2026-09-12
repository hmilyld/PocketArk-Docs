---
title: 框架能力索引
description: 前端 core/ 与 Rust 侧全部框架能力一览：入口、模块与用途。
---

PocketArk 的框架能力按模块划分，插件**只引用、不修改**。下表是全部能力的事实源，
可在[落地页](/zh/)用「能力矩阵」按前端 / Rust 筛选搜索。

| 能力 | 前端入口 | Rust | 说明 |
| --- | --- | --- | --- |
| IPC | `@/core/ipc` | `generate_handler`（构建期生成） | `ipc<T>(cmd, args)`，命令名受 `commands.gen.ts` 约束；禁止裸 `invoke` |
| 事件总线 | `@/core/events` | `events.rs` | 类型化 `emitEvent / onEvent`，统一事件前缀 |
| 日志 | `@/core/logger` | `log` | 双端统一，接管 console |
| 错误 | `@/core/errors` | `error.rs` | `AppError{code,message}` 规范化 + 全局提示 |
| 数据库 | `@/core/db` | `db.rs` | Drizzle(kdb) + 通用 CRUD + 作用域迁移 |
| HTTP | `@/core/http` | `http.rs` | reqwest，无 CORS；`download()` 流式下载 + 进度 |
| 主题 | `@/core/theme` | `set_window_appearance` | 亮 / 暗 / 跟系统 + 主题色 + 字号 |
| 插件注册 | `@/core/plugins` | `plugins/mod.rs` | 前后端构建期自动注册 |
| 在线更新 | `@/core/updater` | `updater.rs` | tauri-plugin-updater + 静态清单 |
| 系统通知 | `@/core/notify` | `tauri-plugin-notification` | 权限申请 + 设置开关 |
| 开机自启 | `@/core/autostart` | `tauri-plugin-autostart` | 真相源在系统 |
| 数据库事务 | `@/core/db` 的 `runInTransaction` | `db.rs` | 单事务批量执行，失败回滚 |
| 数据备份 / 恢复 / 重置 | 设置页「数据」 | `db.rs` | 恢复 / 重置后自动重启 |
| 设置导入 / 导出 | `@/core/settings-transfer` | `files.rs` | 导出 JSON；导入后重启生效 |
| 诊断报告 | `@/core/diagnostics` | `diagnostics.rs` | 环境信息 + 最近日志 |
| 单实例 | — | `tauri-plugin-single-instance` | 二次启动唤起主窗口 + 转发参数 |
| 应用内快捷键 | `@/core/shortcuts` | — | `registerShortcut('mod+k', fn)` |
| 全局快捷键 | `@/core/global-shortcut` | `tauri-plugin-global-shortcut` | 设置项驱动，唤起主窗口 |
| 全局搜索 / 命令面板 | `@/core/search` | — | `Cmd/Ctrl+K` 聚合导航与工具 |
| 任务栏进度 / 徽标 | `@/core/taskbar` | Tauri Window API | 进度 0–100 / Dock 徽标 |
| 后台任务 | `@/core/tasks` | `tasks.rs` | 取消令牌 + `task://` 进度事件 |
| 打开内容 | `@/core/open-with` | `open.rs` | CLI / 深链接 / 拖拽统一分发（`onOpenFiles`） |
| 多窗口 | `@/core/windows` | `capabilities/windows.json` | `openAppWindow()`，label `win-*` |
| 原生应用菜单 | `@/core/events`（`app://menu`） | `menu.rs` | macOS menubar / Win 窗口菜单 |
| 平台探测 | `@/core/platform.ts` | — | `isMac`（样式与快捷键修饰键差异） |

:::note
新增框架能力时，需要同步：前端 `src/core/`、Rust `src-tauri/src/`、
`src-tauri/framework-commands.json`（框架命令清单），并在本表登记。
:::
