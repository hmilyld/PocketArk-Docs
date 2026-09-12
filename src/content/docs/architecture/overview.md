---
title: 目录与启动顺序
description: 框架分层、目录结构、启动链路，以及扩展时哪些代码只引用、不修改。
---

## 分层原则

框架代码与你的代码有清晰边界：

- `src/core/`、`src-tauri/src/` 的 db / http / tray / updater / menu / tasks / open 等属于**框架代码**——
  只引用、不修改。
- 你的所有扩展都放在 `plugins/<id>/`，前端与后端同处一个目录。

这样从上游 base 同步更新时，你的内容集中在「本地层」，合并几乎无冲突。

## 目录结构

```text
src/
├── main.ts            # 启动引导：日志 → 异常 → 设置 → 主题 → 插件 → 路由 → 挂载
├── router/            # 路由（由插件注册表自动生成，勿手动维护）
├── layouts/           # 布局壳（标题栏 / 侧栏 / 错误边界 / 设置页）
├── core/              # ★ 框架核心，扩展时只引用、不修改
│   ├── logger/ errors/ ipc/ events/ db/ http/ theme/
│   ├── notify/ autostart/ global-shortcut/ shortcuts/ search/
│   ├── tasks/ taskbar/ open-with/ windows/ diagnostics/
│   └── settings-transfer/ updater/ plugins/
├── components/        # ★ ToolShell（工具页壳）+ ui/（shadcn-vue 生成组件）
├── content/           # 关于 / 更新日志（Markdown，设置页读取）
└── stores/            # Pinia（全局设置）

plugins/               # ★ 你的工具都在这里（每个目录一个插件，前后端同处）
├── _template/         #   新插件模板（_ 开头不注册）
├── hello-world/       #   示例插件（多功能插件样板）
└── system/            #   系统工具（数据维护，前端-only）

src-tauri/
├── build.rs           # 扫描 plugins/ 生成命令注册与迁移聚合
├── framework-commands.json  # 框架命令清单（单一事实源）
└── src/
    ├── lib.rs         # 组装入口：插件注册 / 托盘 / 菜单 / 单实例 / 关窗行为
    ├── error.rs       # AppError（所有命令返回 Result<T, AppError>）
    ├── events.rs      # 事件名常量（与前端 core/events 同步）
    ├── db.rs http.rs updater.rs tasks.rs open.rs menu.rs
    ├── diagnostics.rs files.rs tray.rs
    └── plugins/mod.rs # include 构建期生成的插件注册（勿手改）

scripts/               # scaffold / create-plugin / gen-icons / gen-commands / ...
LOCAL.md               # 本地层说明（fork 专属）
```

## 启动顺序

前端引导链路固定在 `src/main.ts`：

**日志 → 异常处理 → 设置加载 → 主题 → 插件注册（`setup(ctx)` 钩子）→ 路由 → 挂载**

Rust 侧 `lib.rs` 负责组装：插件命令注册、系统托盘、原生菜单、单实例、关窗行为。

## 你免费获得的框架行为

- **错误管道**：Rust `AppError{code,message}` → 前端统一转换 → 未捕获时自动日志 + toast；
  工具页渲染崩溃由错误边界隔离（占位页 + 重试），不影响框架。
- **日志**：Rust 与前端统一写入应用日志目录（macOS 为
  `~/Library/Logs/<应用 identifier>/`），console 已被接管，级别运行时可调。
- **状态保持**：工具切换默认 KeepAlive（切回不丢输入），`keepAlive: false` 可退出。
- **关窗行为**：默认隐藏到托盘（设置可改）；窗口位置每次启动居中于鼠标所在屏幕。
- **主题**：亮 / 暗 / 跟系统（默认暗色）+ 6 档主题色；根字号三档缩放（小 13 / 正常 14 / 大 15）。
- **HTTP**：Rust reqwest 全局单例（rustls、cookie 会话、10 次重定向、30s 超时、10MB 响应上限），
  前端 `http.getJson<T>(url)` 即可采集 JSON 接口。

完整清单见 [框架能力矩阵](/architecture/capabilities/)。
