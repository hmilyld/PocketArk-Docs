---
title: 打包
description: 用 pnpm tauri build 产出各平台安装包，以及产物位置与安全说明。
---

```bash
pnpm tauri build
```

## 产物位置

显式传 `--target <triple>` 时会多一层 triple 目录：

- **macOS**：`src-tauri/target/**/release/bundle/macos/*.app`
  （开启更新后另有 `<Product>.app.tar.gz` + `.sig`）
- **Windows**：`src-tauri/target/**/release/bundle/nsis/*-setup.exe`
  （msi 视 `--bundles` 而定）

带在线更新的完整流程见 [打包发布与在线更新](/release/automation/)。

## 安全说明（可向审查方出示）

- 安装版**不监听任何本地端口**：前端资源经进程内自定义协议加载，无 web 服务器。
- 唯一网络活动是应用主动发起的 HTTP 请求。

## 内容维护

- 更新日志与关于页编辑 `src/content/changelog.md` / `src/content/about.md` 即可。
- 版本唯一事实源是 `src-tauri/tauri.conf.json > version`，发版前用
  `pnpm version:bump x.y.z` 同步三处（`tauri.conf.json` / `Cargo.toml` / `package.json`）。
