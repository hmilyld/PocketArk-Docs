---
title: Known limitations
description: Limitations explicitly present in the current version and future extension points.
---

- **macOS resize rendering lag**: resizing the window shows slight content lag (an inherent WKWebView
  cross-process compositing limit, mitigated with `layerContentsRedrawPolicy` and a dark window base).
- **HTTP bodies decoded as UTF-8**: non-UTF-8 pages (e.g. GBK) are a future extension point; use
  `http.download()` to stream binary resources to a file.
- **Bundle size warning**: the main bundle is split, but importing all `@lucide/vue` icons makes the
  `vendor-ui` chunk large (the inherent cost of resolving icons by name).
- **Not tested on Windows**: the build-time `#[path]` values use forward slashes and should work on
  Windows, but have not been verified there yet.
