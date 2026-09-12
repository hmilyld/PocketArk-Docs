---
title: 故障排查与代码签名
description: 发布与更新链路的常见故障，以及可选的 macOS / Windows 代码签名。
---

## 故障排查

- **`packages field missing or empty`（pnpm）**：`pnpm-workspace.yaml` 缺少 `packages:`
  字段，pnpm 9 的 `pnpm store path` 报错；CI 已改用 **npm**（本地仍用 pnpm）。
- **找不到更新产物（`.sig`）**：确认 `createUpdaterArtifacts: true` 且构建带签名；
  使用 `--target` 时产物在 `target/<triple>/release/bundle`（`release.mjs` 已兼容该路径）。
- **Windows 更新包**：Tauri v2 是 `*-setup.exe`（+ `.exe.sig`），**不是** `.nsis.zip`。
- **Release 混入构建中间产物**（如 `build-script-build*.exe`）：收集范围须限定
  `*/release/bundle/*`。
- **macOS 未签名包被 Gatekeeper 拦截**：首次运行执行
  `xattr -dr com.apple.quarantine /Applications/<Product>.app`。
- **服务器 403 / 500**：确保静态目录匿名可读，`latest.json` 返回 200 + JSON。
- **每次都提示更新**：`latest.json.version` 与构建版本不一致，或未单调递增。

## 代码签名

:::danger[私钥与口令绝不入库]
私钥与口令只在 CI Secrets 与本地 `~/.tauri/` 中保存。口令丢失只能重新生成密钥并更新
`pubkey`——已发布的安装将无法再收到更新。
:::

操作系统代码签名（可选，非本流程必需）：

- **macOS**：未签名会有 Gatekeeper 隔离与更新稳定性风险，接入 Apple Developer ID +
  公证可根治。
- **Windows**：未签名会有 SmartScreen 提示。
