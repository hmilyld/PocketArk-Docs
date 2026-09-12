---
title: 安装与首次运行
description: 准备 Node / pnpm / Rust 与平台依赖，把 PocketArk 在本机跑起来。
---

## 环境准备

| 依赖 | 版本 | 说明 |
| --- | --- | --- |
| Node.js | 20+ | 含 npm |
| pnpm | 9+ | 包管理器（`npm i -g pnpm`） |
| Rust | stable（1.77+） | 用 `rustup` 安装 |

平台额外依赖：

- **macOS**：Xcode Command Line Tools（`xcode-select --install`）。
- **Windows**：MSVC Build Tools（VS Installer 勾选「使用 C++ 的桌面开发」）+ WebView2 Runtime
  （Windows 11 自带）。
- **Linux**：`webkit2gtk` 等系统库，见
  [Tauri prerequisites](https://tauri.app/start/prerequisites/)。

## 首次运行

```bash
pnpm install
pnpm tauri dev      # 首次会编译 Rust，需几分钟；之后增量秒级
```

窗口弹出即成功。此时它是「暗色指挥台」样式的 PocketArk，带着示例工具。

:::tip
`pnpm dev` 只启动 Vite 前端（适合纯前端调试）；要看到完整桌面窗口、托盘与 Rust 命令，
用 `pnpm tauri dev`。
:::

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 仅启动 Vite 开发服务器（前端） |
| `pnpm tauri dev` | Tauri 开发模式（先编译 Rust） |
| `pnpm lint` | ESLint（改前端后必须跑） |
| `pnpm build` | `vue-tsc --noEmit` + 前端构建 |
| `pnpm test` | vitest 单测（core 纯逻辑） |
| `pnpm lint:rs` | `cargo clippy -D warnings`（改 Rust 后必须跑） |
| `pnpm fmt:rs` | `cargo fmt` |
| `pnpm test:rs` | `cargo test` |
| `pnpm tauri build` | 打包 |

约定：改前端跑 `pnpm lint && pnpm build`；改 Rust 跑 `pnpm lint:rs && pnpm fmt:rs && pnpm test:rs`。

## 接下来

窗口能起来后，做两件事：**改名**和**删示例**——见
[改造成你的软件](/start/scaffold/)。

:::note[关于本地层]
base 仓库本身不下载任何资源、不含个人工具。若你的 fork 叠加了字体 / OCR 等资源或
额外 Rust 依赖，相关内容集中在「本地层」，见 [本地层](/local-layer/)。
:::
