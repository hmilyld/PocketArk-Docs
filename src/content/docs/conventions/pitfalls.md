---
title: 易错点清单
description: 已修复过、不要回退的坑，以及 macOS 端口占用、本地层编译等高频问题。
---

这一页是「改代码前必读」。以下问题都曾出现过，改动时勿回退。

## 框架行为

- **日志回环**：`core/logger` 用 `attachLogger` + `echoing` 护栏。不要改回 `attachConsole`，
  也不要让 console 接管函数在回显期转发日志——会无限循环。
- **keepAlive**：`MainLayout` 按 `route.meta.keepAlive !== false` 分支缓存；清单里
  `keepAlive: false` 才会不缓存。
- **排序**：插件分组序 = 组内最小 `order`；`manifest.order` 参与排序，勿改回目录名排序。
- **主题外观联动**：`applyTheme` 会同步 NSWindow.appearance / NSWindow.backgroundColor。
  强制 darkAqua / aqua 会把 webview 的 `prefers-color-scheme` 钉死；「跟随系统」必须传
  `dark: null` 清除覆盖（见 `set_window_appearance` 三态设计）。

## 安全边界

:::danger[`db_*` / `http_request` 等不受 capability 门控]
webview 内任意代码均可执行任意 SQL / 发起任意请求。必须保持 **CSP 严格、不加载任何远程内容**，
插件（本地代码）作为可信边界对待。
:::

## 工具页布局

- `ToolShell` 只提供页头 + 全幅容器；居中列 / 分栏在页面内用原生 Tailwind 栅格
  （`grid grid-cols-12` + `col-start-*` / `col-span-*`），**禁止 `mx-auto max-w-*` 居中容器**。
- 居中列必须偶数跨距（12 − 跨距为偶数）。
- 新 registry 组件若用裸 `data-checked:` / `data-open:` 等布尔变体，需转成
  `data-[state=...]:`（reka-ui 2.10 只输出后者）。

## macOS dev 端口占用

tauri CLI（≤2.11.4）退出时靠 `$TMPDIR/tauri-stop-dev-processes.sh` 清理 dev server 进程树，
但实测该脚本可能被创建为 **0 字节 + 0o644**（内容与权限写入双双静默失败），
`!exists()` 守卫又永不重建 → vite 成为孤儿 → 下次 `tauri dev` 报端口占用。

仅 `chmod` 不够（空脚本 = no-op），须写入原版内容 + 执行位（一次即可）：

```bash
cat > "${TMPDIR}tauri-stop-dev-processes.sh" << 'EOF'
#!/usr/bin/env sh
getcpid() {
    cpids=$(pgrep -P $1|xargs)
    for cpid in $cpids; do
        echo "$cpid"
        getcpid $cpid
    done
}
kill $(getcpid $1)
EOF
chmod 755 "${TMPDIR}tauri-stop-dev-processes.sh"
```

紧急兜底：`lsof -ti:1420 | xargs -r kill -9`。

:::note
上游 tauri#15098，修复 PR #15108 合并并升级 CLI 后可移除此条。
:::

## 其他高频问题

- **关窗后应用还在运行？** 设计行为：默认隐藏到托盘（后台常驻）。真正退出：托盘图标右键 →
  退出（macOS 也可 `Cmd+Q`），可在设置页关闭「隐藏到托盘」。
- **Windows dev 报 ELIFECYCLE / 大数字退出码**：退出时 tauri CLI 强制终止 vite dev server，
  Windows 报告 NTSTATUS 码（如 4294967295）。这是 dev 噪音，打包版不存在。
- **调整字号 / 主题后某些界面没变**：多半硬编码了 px，改用 `rem` / 语义 token。

## 本地层编译依赖（ocr-rs 等）

这类重依赖属 fork 本地层，相关编译问题（macOS `CXXFLAGS`、Windows libclang）由 fork 自行处理
并记录在 `LOCAL.md`；base 不含这些依赖，无此问题。
