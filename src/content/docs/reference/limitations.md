---
title: 已知限制
description: 当前版本明确存在的限制与后续扩展点。
---

- **macOS 窗口缩放渲染滞后**：缩放窗口时 webview 内容存在轻微渲染滞后（WKWebView
  跨进程合成的固有限制，已通过 `layerContentsRedrawPolicy` 与暗色窗口底缓解）。
- **HTTP 响应体按 UTF-8 解码**：非 UTF-8 页面（如 GBK）为后续扩展点；二进制资源请用
  `http.download()` 流式下载到文件。
- **打包体积告警**：主包已拆分，但 `@lucide/vue` 全量图标使 `vendor-ui` 分块较大
  （按名解析图标的固有开销）。
- **Windows 未实测**：插件构建期的 `#[path]` 以正斜杠生成，理论上 Windows 可用，
  但尚未在 Windows 实测。
