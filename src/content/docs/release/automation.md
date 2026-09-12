---
title: 打包发布与在线更新
description: 自动与手动发布流程、latest.json 规范，以及 CI workflow 参考。
---

## 准备一次发布

```bash
pnpm version:bump 0.2.0     # 同步 tauri.conf.json / Cargo.toml / package.json
# 编辑 src/content/changelog.md，新增一段 ## [0.2.0]
git add -A && git commit -m "chore: release 0.2.0"
```

## 触发自动发布

```bash
git push
git tag v0.2.0              # 去掉 v 后必须等于 tauri.conf.json 的 version
git push origin v0.2.0
```

或在 Actions 页面手动运行 `Release` workflow（`workflow_dispatch`），填 `version` 与 `base-url`。

## CI 做了什么

1. **解析版本**：校验 tag / 输入 与 `tauri.conf.json.version` 一致；`cargo fmt --check`。
2. **构建矩阵**：`macos-14`（aarch64-apple-darwin）与 `windows-latest`（x86_64-pc-windows-msvc）；
   `sccache` + `rust-cache` 加速；可选 `pre-build`（构建前命令，如预取资源）与
   `native-cpp`（Windows 装 LLVM、macOS 设 CXXFLAGS）；以
   `tauri build --target <triple> --bundles app|nsis` 带签名构建。
3. **收集产物**：仅收集 `*/release/bundle/*` 下的安装包与 `.sig`，上传为 Actions artifact。
4. **归档 Release**：下载全部产物 → 生成**统一** `latest.json`（多平台）+ `checksums.txt`
   → 创建 / 更新 GitHub Release 并附上全部资产。

产物命名：

- macOS：`<Product>.app.tar.gz` + `.sig`
- Windows：`<Product>_<version>_x64-setup.exe` + `.sig`
- 清单：`latest.json`、`checksums.txt`

## 发布后：上传到更新服务器

CI 只把产物归档到 GitHub Release，更新服务器需自行上传：

```bash
mkdir -p ~/release && cd ~/release
gh release download v0.2.0 --repo <owner>/<repo> --dir .
scp ./* user@host:/path/to/webroot/
# 或：rsync -av ./ user@host:/path/to/webroot/
```

验证：`curl -s https://<域名>/latest.json`

## 手动发布（备用）

```bash
# 1) fork 先预取资源（base 无个人资源可跳过）
pnpm assets

# 2) 带签名构建（建议显式 --target/--bundles）
TAURI_SIGNING_PRIVATE_KEY_PATH=~/.tauri/<app>.key \
TAURI_SIGNING_PRIVATE_KEY_PASSWORD='<口令>' \
pnpm tauri build --target aarch64-apple-darwin --bundles app

# 3) 生成清单（自动扫描 target 与 target/<triple> 下的 bundle）
pnpm release -- --base-url https://<域名> --changelog src/content/changelog.md
```

多平台合并时可用 `--platform` 显式指定：

```bash
pnpm release -- --base-url https://<域名> --version 0.2.0 \
  --platform darwin-aarch64=src-tauri/target/aarch64-apple-darwin/release/bundle/macos/<Product>.app.tar.gz \
  --platform windows-x86_64=src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/<Product>_0.2.0_x64-setup.exe
```

`scripts/release.mjs` 参数：

- `--base-url`（必填）：清单中 URL 的前缀。
- `--version`：缺省读 `tauri.conf.json`。
- `--notes <文件|文本>` 或 `--changelog <文件>`：更新说明；`--changelog` 自动抽取对应版本段落。
- `--platform <key>=<path>`：手动平台映射（可多次）；缺省自动扫描
  `target/release/bundle` 与 `target/<triple>/release/bundle`，识别
  `.app.tar.gz` / `*-setup.exe` / `.nsis.zip` / `.msi.zip` / `.AppImage.tar.gz` 并配对同名 `.sig`。

## latest.json 规范

```json
{
  "version": "0.2.0",
  "notes": "## [0.2.0] ...",
  "pub_date": "2026-09-11T00:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "<.sig 文件内容>",
      "url": "https://<域名>/<Product>.app.tar.gz"
    },
    "windows-x86_64": {
      "signature": "<.sig 文件内容>",
      "url": "https://<域名>/<Product>_0.2.0_x64-setup.exe"
    }
  }
}
```

- `signature`：对应安装包 `.sig` 文件的**完整内容**（不是 URL）。
- `url`：安装包的绝对 HTTPS 地址，文件名需与实际上传文件一致。
- 平台 key：`darwin-aarch64` / `darwin-x86_64` / `windows-x86_64` / `linux-x86_64`。
- `pub_date`：RFC 3339。
- `version` 必须 = 构建版本，且 **>** 已安装版本，否则不会提示或每次启动都提示。

## base 与 fork 的分工

- **base**：`scripts/release.mjs`、`.github/workflows/release-reusable.yml`（可复用）、发布文档。
- **fork**：`.github/workflows/release.yml`（caller）、密钥 / 变量、`LOCAL.md` 中的预取资源与编译依赖。
- **同步**：base 改动后 fork 执行 `git merge upstream/main`。

## 可复用 workflow 参考

输入与密钥（`hmilyld/PocketArk/.github/workflows/release-reusable.yml`，`workflow_call`）：

| input | 默认 | 说明 |
| --- | --- | --- |
| `version` | `''` | 版本号，留空则由触发 tag 推导 |
| `base-url` | 必填 | 更新服务器地址 |
| `pre-build` | `''` | build 前执行的命令（如预取资源） |
| `native-cpp` | false | 安装 LLVM / 设置 CXXFLAGS |
| `create-release` | true | 是否创建 GitHub Release 归档 |

secrets：`TAURI_SIGNING_PRIVATE_KEY`、`TAURI_SIGNING_PRIVATE_KEY_PASSWORD`。

fork caller 示例 `.github/workflows/release.yml`：

```yaml
name: Release
on:
  push:
    tags: ['v*']
  workflow_dispatch:
    inputs:
      version:
        required: false
        type: string
      base-url:
        required: false
        type: string
permissions:
  contents: write
jobs:
  release:
    uses: hmilyld/PocketArk/.github/workflows/release-reusable.yml@main
    with:
      version: ${{ inputs.version }}
      base-url: ${{ inputs.base-url || vars.UPDATE_BASE_URL }}
      pre-build: 'npm run fonts && npm run ocr-models' # fork 专属，base 可留空
      native-cpp: true
    secrets: inherit
```

fork 需配置 GitHub：

- **变量**：`UPDATE_BASE_URL = https://<域名>`
- **Secrets**：`TAURI_SIGNING_PRIVATE_KEY`（私钥内容，base64 单行无换行）、
  `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`（无口令可留空 / 不建）。

## 性能与缓存

- 两平台各自缓存（`Swatinem/rust-cache`，键含 job 名与 profile）：每个「平台 × 任务类型」
  首次冷，之后暖。
- `sccache`（`SCCACHE_GHA_ENABLED=true`）跨 job / profile 复用编译结果。
- 参考耗时：cold 约 12–35 分钟；暖后 macOS ≈ 4 分钟、Windows ≈ 14 分钟。
- 缓存失效：`Cargo.lock` 变化、Rust 工具链升级、7 天未用过期、仓库 10GB 上限、连续推送抢占缓存。
