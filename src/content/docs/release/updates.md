---
title: 在线更新
description: 内置更新能力的原理与一次性配置：生成密钥、填公钥、开启更新产物、准备服务器。
---

## 原理

框架内置在线更新：前端 `src/core/updater`，Rust `src-tauri/src/updater.rs`
（命令 `updater_check` / `updater_install` / `updater_restart`），底层是官方
`tauri-plugin-updater` + 自建静态清单。

- 发布物 = 各平台安装包 + 对应 `.sig`（minisign 签名）+ 静态清单 `latest.json`。
- 分发：把安装包与 `latest.json` 放到一个**可匿名 HTTPS 访问**的目录。
- App **仅在启动后检查一次**（`updateEnabled` + `updateAutoCheck` 控制，无轮询）；
  设置页可配置总开关、更新服务器地址、是否自动检查；关于页显示当前版本。
- 版本唯一事实源 = `tauri.conf.json > version`；更新选择是严格 semver，
  **远端必须 > 本地**，因此版本号**单调递增**。

:::note[minisign 与 OS 代码签名是两回事]
本流程只做 Tauri 更新校验所需的 minisign 签名；macOS / Windows 的**操作系统代码签名**
可选且互不替代，见 [故障排查与代码签名](/release/troubleshooting/#代码签名)。
:::

## 一次性配置

### 生成更新签名密钥

```bash
pnpm tauri signer generate -w ~/.tauri/<app>.key   # 会提示设置口令（可留空）
```

- 私钥：`~/.tauri/<app>.key`（**不入库**，务必备份）。
- 公钥：`~/.tauri/<app>.key.pub`。

### 填入公钥、开启更新产物

编辑 `src-tauri/tauri.conf.json`：

```json
{
  "bundle": { "createUpdaterArtifacts": true },
  "plugins": {
    "updater": {
      "pubkey": "<~/.tauri/<app>.key.pub 的内容>"
    }
  }
}
```

无需填写 `plugins.updater.endpoints`——更新地址始终由设置项在运行时覆盖。

### 让 App 有默认更新地址（可选）

设置项默认为空时 App 不会自动检查。想开箱即用，可在设置默认值里写死你的域名，
例如 `src/stores/settings.ts`：

```ts
const updateEnabled = ref(true);
const updateServerUrl = ref('https://<你的域名>');
```

### 准备更新服务器

- 静态目录，能**匿名 GET**（无登录、无 403）。
- 必须 **HTTPS**（更新器拒绝非 https）。
- `latest.json` 放在你配置的地址对应路径（若地址是根域名，则请求 `<域名>/latest.json`）。
- 自检：`curl -s https://<域名>/latest.json` 应返回 JSON（不是 403 / 500 / 登录页）。

:::note[base 默认无需签名密钥]
base 仓库默认 `bundle.createUpdaterArtifacts: false`，因此无需签名密钥即可 `tauri build`。
启用更新时才需要走上面的配置。
:::
