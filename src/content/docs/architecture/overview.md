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
├── components/        # ★ ToolShell（工具页壳）+ tool/Panel（模块面板）
│   ├── settings/      #   SettingsSection / SettingsRow / SettingsField（设置页单一事实源）
│   ├── native/        #   EmptyState / LoadingState / ErrorState / FormRow / Segmented 等
│   └── ui/            #   shadcn-vue 生成组件（CLI 管理，可改样式勿改结构）
├── content/           # 关于 / 更新日志（Markdown，设置页读取）
├── dev/               # 预览桥（仅 dev + 非 Tauri；浏览器内渲染走查）
└── stores/            # Pinia（全局设置）

plugins/               # ★ 你的工具都在这里（每个目录一个插件，前后端同处）
├── _template/         #   新插件模板（_ 开头不注册）
├── hello-world/       #   示例插件（多功能样板，8 个工具全链路演示）
└── system/            #   系统工具（数据维护，前端-only）

src-tauri/
├── build.rs           # 扫描 plugins/ 生成命令注册与迁移聚合；挂载 local 生命周期钩子
├── framework-commands.json  # 框架命令清单（单一事实源）
├── local/             # ★ 本地层代码（fork-owned；lifecycle.rs 实现即自动挂载）
├── local-resources/   # ★ 本地层资源（fork-owned；base 无）
└── src/
    ├── lib.rs         # 组装入口：插件注册 / 托盘 / 菜单 / 单实例 / 关窗行为
    ├── error.rs       # AppError（所有命令返回 Result<T, AppError>）
    ├── events.rs      # 事件名常量（与前端 core/events 同步）
    ├── lifecycle.rs   # 生命周期钩子 SPI 契约与调用点
    ├── db.rs http.rs updater.rs tasks.rs open.rs menu.rs
    ├── diagnostics.rs files.rs tray.rs
    └── plugins/mod.rs # include 构建期生成的插件注册（勿手改）

scripts/               # scaffold / create-plugin / gen-icons / gen-commands / release
  local/               # ★ 本地层脚本（资源下载；CI 跳过）
docs/                  # ★ 规范与指南（设计规范、本地层、生命周期钩子；索引见 docs/README.md）
```

## 启动顺序

前端引导链路固定在 `src/main.ts`：

**日志 → 异常处理 → 设置加载 → 主题 → 插件注册（`setup(ctx)` 钩子）→ 路由 → 挂载**

Rust 侧 `lib.rs` 负责组装：插件命令注册、系统托盘、原生菜单、单实例、关窗行为，并在初始化就绪后
调用[生命周期钩子](/architecture/lifecycle/)（`before_start` / `after_start`），`RunEvent` 里调用
`before_exit` / `after_exit`。

## 你免费获得的框架行为

- **错误管道**：Rust `AppError{code,message}` → 前端统一转换 → 未捕获时自动日志 + toast；
  工具页渲染崩溃由错误边界隔离（占位页 + 重试），不影响框架。
- **日志**：Rust 与前端统一写入应用日志目录（macOS 为
  `~/Library/Logs/<应用 identifier>/`），console 已被接管，级别运行时可调。
- **状态保持**：工具切换默认 KeepAlive（切回不丢输入），`keepAlive: false` 可退出。
- **关窗行为**：默认隐藏到托盘（设置可改）；窗口位置每次启动居中于鼠标所在屏幕。
- **主题**：亮 / 暗 / 跟系统（默认暗色）+ 6 档主题色；根字号三档缩放（小 13 / 正常 14 / 大 15）。
- **HTTP**：Rust reqwest 全局单例（rustls、cookie 会话、10 次重定向、30s 超时、10MB 响应上限），
  前端 `http.getJson<T>(url)` 即可采集 JSON 接口；`http.send()` 为高级原语（重定向 / SSL / 超时 /
  cookie / multipart / 二进制 / 取消），`http.download()` 流式下载并回传进度。
- **窗口材质**：macOS 语义材质（侧栏 / 工具栏 / 浮层）与 Windows Mica Alt，均带纯色回退；
  视觉取值全部走 token，详见[设计规范](/design/overview/)。
- **生命周期钩子**：fork 在 `src-tauri/local/lifecycle.rs` 实现 `AppLifecycle` 即可拦截启动 / 退出。

完整清单见 [框架能力矩阵](/architecture/capabilities/)。
