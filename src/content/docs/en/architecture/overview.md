---
title: Layout and boot order
description: Framework layers, directory structure, the startup chain, and what to reference but never edit.
---

## Layering

There is a clear boundary between framework code and yours:

- `src/core/` and `src-tauri/src/` (db / http / tray / updater / menu / tasks / open …) are
  **framework code** — reference, never edit.
- All extensions live in `plugins/<id>/`, with frontend and backend side by side.

This keeps your work in the "local layer", so merging upstream base updates almost never conflicts.

## Directory structure

```text
src/
├── main.ts            # boot: logging → errors → settings → theme → plugins → router → mount
├── router/            # routes (generated from the plugin registry; do not edit by hand)
├── layouts/           # app shells (title bar / sidebar / error boundary / settings)
├── core/              # ★ framework core — reference only
│   ├── logger/ errors/ ipc/ events/ db/ http/ theme/
│   ├── notify/ autostart/ global-shortcut/ shortcuts/ search/
│   ├── tasks/ taskbar/ open-with/ windows/ diagnostics/
│   └── settings-transfer/ updater/ plugins/
├── components/        # ★ ToolShell + ui/ (shadcn-vue generated components)
├── content/           # about / changelog (Markdown, read by settings)
└── stores/            # Pinia (global settings)

plugins/               # ★ your tools live here (one directory = one plugin)
├── _template/         #   new-plugin template (`_` prefix, not registered)
├── hello-world/       #   example plugin (multi-tool sample)
└── system/            #   system tools (data maintenance, frontend-only)

src-tauri/
├── build.rs           # scans plugins/ to register commands and aggregate migrations
├── framework-commands.json  # framework command list (single source of truth)
└── src/
    ├── lib.rs         # assembly: plugin registration / tray / menu / single instance / close behavior
    ├── error.rs       # AppError (every command returns Result<T, AppError>)
    ├── events.rs      # event-name constants (synced with frontend core/events)
    ├── db.rs http.rs updater.rs tasks.rs open.rs menu.rs
    ├── diagnostics.rs files.rs tray.rs
    └── plugins/mod.rs # generated plugin registration (do not edit)

scripts/               # scaffold / create-plugin / gen-icons / gen-commands / ...
LOCAL.md               # local-layer notes (fork-owned)
```

## Boot order

The frontend boot chain is fixed in `src/main.ts`:

**logging → error handling → settings → theme → plugin registration (`setup(ctx)` hooks) → router → mount**

On the Rust side, `lib.rs` assembles plugin command registration, the system tray, the native menu,
single-instance handling and close behavior.

## Framework behaviors you get for free

- **Error pipeline**: Rust `AppError{code, message}` → normalized on the frontend → uncaught errors
  become logs + toasts automatically; a crashing tool view is isolated by an error boundary
  (placeholder + retry) without taking down the framework.
- **Logging**: both runtimes write to the app log directory (on macOS
  `~/Library/Logs/<identifier>/`); console is intercepted and the level is adjustable at runtime.
- **State retention**: switching tools keeps state by default (KeepAlive); set `keepAlive: false` to opt out.
- **Close behavior**: hiding to the tray by default (configurable); the window centers on the screen
  under the cursor at launch.
- **Theming**: light / dark / system (dark by default) + six accents; three root font-size steps
  (small 13 / normal 14 / large 15).
- **HTTP**: a Rust reqwest singleton (rustls, cookie session, 10 redirects, 30 s timeout, 10 MB cap);
  call `http.getJson<T>(url)` from the frontend.

See the full list in the [capability matrix](/en/architecture/capabilities/).
