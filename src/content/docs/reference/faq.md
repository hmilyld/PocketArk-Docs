---
title: 常见问题
description: 端口占用、关窗行为、Windows dev 噪音、字号不跟随等高频问答。
---

## macOS 下重启 dev 报「Port 1420 is already in use」

tauri CLI 的清理脚本可能被创建为无执行位的空文件，导致 vite 进程残留。一次性修复见
[易错点清单 · macOS dev 端口占用](/conventions/pitfalls/#macos-dev-端口占用)。

紧急兜底：`lsof -ti:1420 | xargs -r kill -9`。

## 关掉窗口后应用还在运行？

设计行为：关闭窗口默认**隐藏到托盘**（后台常驻，随时唤起）。真正退出：
托盘图标右键 → 退出（macOS 也可 `Cmd+Q`）。可在设置页关闭「隐藏到托盘」。

## dev 时控制台报 ELIFECYCLE / 大数字退出码（Windows）

退出应用时 tauri CLI 会强制终止 vite dev server，Windows 上被终止的进程报告 NTSTATUS 码
（如 4294967295）。这是 dev 模式噪音，打包版不存在。

## 调整字号 / 主题后某些界面没跟着变？

所有 UI 均随设置缩放；若发现未跟随的界面，多半是硬编码了 px 数值——改用 `rem` / 语义 token
（`text-sm`、`h-9` 等）。

## 更新每次都提示，或从不提示？

见 [故障排查](/release/troubleshooting/)：通常是 `latest.json.version` 与构建版本不一致，
或版本号未单调递增。

## 新增插件后侧栏没出现？

前端 glob 变化后若未自动出现，重启 `pnpm dev` / `pnpm tauri dev`。
