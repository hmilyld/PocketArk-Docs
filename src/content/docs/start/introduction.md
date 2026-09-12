---
title: 简介
description: PocketArk 是什么、设计目标，以及它能替你免去哪些工作。
---

PocketArk 是一个**可复用的桌面应用基础框架**（Tauri 2 + Vue 3 + TypeScript + Tailwind CSS 4）。
它的核心设计目标只有一句话：**新增一个工具的成本尽可能低**。

框架已经把「与应用本身无关」的脏活全部做完——窗口与托盘、侧栏导航、路由、主题、
SQLite 数据库与迁移、设置持久化、日志、错误处理、HTTP 通道、在线更新——你要写的
只有**工具页面本身**。

## 它能替你做什么

- **插件化组织**：`plugin.json` 是唯一事实源，前端（Vite）与后端（Rust）**构建期自动注册**，
  复制模板即可新增工具，无需改任何框架文件。
- **本地优先**：数据存 SQLite（Drizzle ORM + Rust sqlx 通道），不出本机。
- **开箱即用的框架能力**：日志、类型安全 IPC、事件总线、无 CORS 的 HTTP 客户端、
  作用域隔离的数据库迁移、系统托盘、全局快捷键、任务栏进度、多窗口、原生菜单。
- **原生观感**：「暗色指挥台」主题、可收起导航、主题色六档、字号三档等比缩放。
- **内置在线更新**：官方 `tauri-plugin-updater` + 自建静态清单，配套可复用的发布 workflow。

## 框架与示例

仓库本身是「框架 + 示例」的组合：

| 组成 | 说明 |
| --- | --- |
| 框架代码 | `src/core/` 与 `src-tauri/src/` 的 db / http / tray / updater / menu / tasks / open 等——**只引用、不修改** |
| `plugins/_template` | 新插件脚手架模板（`_` 开头，不参与注册） |
| `plugins/hello-world` | 教学示例：Rust 命令、SQLite、HTTP、布局与表单全链路 |
| `plugins/system` | 框架内置的系统工具（数据维护，前端-only），建议保留 |

## 文档怎么读

- **想尽快跑起来**：按「开始使用」的顺序走——[安装与首次运行](/start/installation/)
  → [改造成你的软件](/start/scaffold/)。
- **要写工具**：直接读「插件开发」，从 [创建插件](/plugins/create/) 开始。
- **遇到报错或准备改框架行为**：先读「开发约定」与
  [易错点清单](/conventions/pitfalls/)。
- **准备发版**：读「打包发布」，重点是签名与 `latest.json`。

下一节：[安装与首次运行](/start/installation/)。
