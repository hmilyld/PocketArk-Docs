---
title: 改造成你的软件
description: 一键改名、替换双源图标、删除示例插件，得到属于你自己的应用。
---

## 1. 改名（一键脚本）

```bash
pnpm scaffold
```

按提示回答 5 个问题（回车保持默认）：

| 提问 | 说明 |
| --- | --- |
| 软件显示名 | 出现在窗口、Dock / 任务栏、托盘提示、设置页（中英文均可） |
| 英文标识 | kebab-case（如 `my-kit`），用于包名与二进制名 |
| 应用标识 | `com.pocketark.<英文标识>`，**发布后不可再改**（改了会被系统视为另一个应用） |
| 默认主题色 | 靛蓝 / 青碧 / 琥珀 / 玫红 / 湛蓝 / 国家电网绿 |
| 默认主题 | dark / light |

脚本会自动改写 `tauri.conf.json`、`Cargo.toml`、`main.rs`、`package.json`、文档与说明中的名称。
完成后按提示执行：

```bash
pnpm install        # 刷新 lockfile 中的包名
pnpm tauri dev      # 以新名字运行
```

:::caution[identifier 一旦发布不可更改]
应用标识（`identifier`）是操作系统的身份凭据。发布后再改，系统会把它当成**另一个应用**，
用户数据目录、更新链路全部失配。
:::

### 手动改名清单

偏好手动改的话，以下是脚本等价的完整清单：

| 文件 | 改什么 |
| --- | --- |
| `src-tauri/tauri.conf.json` | `productName`、`identifier`、`title` |
| `src-tauri/Cargo.toml` | `[package] name`（kebab）、`[lib] name`（snake + `_lib` 后缀） |
| `src-tauri/src/main.rs` | `pocketark_lib::run()` → 新 lib 名 |
| `package.json` | `name` |
| `src/core/theme/index.ts` | `DEFAULT_THEME` / `DEFAULT_ACCENT`（可选） |
| `README.md`、`START.md`、`AGENTS.md`、`src/content/about.md` | 自我介绍与标题 |
| `index.html` | `<title>` |

前端界面（侧栏 / 顶栏）与托盘提示会**动态读取** `productName`，无需改代码。

## 2. 换图标（双源，按平台最优）

图标有两个源文件，图形路径相同，只有外框缩放 / 圆角按平台惯例不同：

| 源文件 | 风格 | 生成产物 | 使用平台 |
| --- | --- | --- | --- |
| `src-tauri/icons/icon-macos.svg` | HIG 网格留白（主图形 80.5%） | `icon.icns` + Store 磁贴 | macOS Dock / 访达 |
| `src-tauri/icons/icon-windows.svg` | 全出血（图形顶满画布） | `icon.ico` + 各级 PNG | Windows 任务栏 / 资源管理器、Linux |

修改**两份 SVG 中的图形**（保持各自外框参数），然后一键重新生成：

```bash
pnpm icons
```

脚本跑两轮 `tauri icon` 并按平台组装：icns / 磁贴用 macOS 版，ico / png 用 Windows 版，
`public/icon.svg` 同步。各平台构建会自动取用自己格式的图标。

:::tip[macOS Dock 仍显示旧图标？]
执行 `killall Dock` 刷新图标缓存。
:::

## 3. 删除示例插件

base 仓库只自带两个内置插件，按需保留 / 删除：

| 插件 | 说明 | 建议 |
| --- | --- | --- |
| `hello-world` | 演示全链路（Rust / SQLite / HTTP / 布局），5 个工具 | 正式使用可删 |
| `system` | 数据维护（前端-only，框架内置） | 保留 |

```bash
# 例如删除示例（保留 system / _template）
rm -rf plugins/hello-world
```

前端（侧栏 / 路由 / 设置页）与后端（Rust 命令 / 迁移）均构建期自动扫描，
**删除目录即彻底移除**；迁移记录按作用域隔离，删除插件不会影响其他插件。

:::danger[务必保留 _template]
`_template/` 是你的新工具脚手架，删除后 `pnpm create-plugin` 与手动复制模板都会失败。
:::

## 发布前检查清单

- [ ] `pnpm scaffold` 已改名（**identifier 确认无误**）
- [ ] 图标已替换并重新生成
- [ ] `src/content/about.md` / `changelog.md` 已写好介绍与首个版本记录
- [ ] 示例插件已删除或禁用
- [ ] `pnpm lint && pnpm build` 通过
- [ ] `pnpm tauri build` 产物在目标平台安装冒烟通过（启动 / 退出 / 托盘 / 最大化无闪烁）
