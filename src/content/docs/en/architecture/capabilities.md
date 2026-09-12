---
title: Capability index
description: Every framework capability on the frontend and in Rust — entry points, modules and purpose.
---

PocketArk's capabilities are split into modules that plugins **reference but never edit**. The table
below is the source of truth; the [home page](/en/) matrix lets you search and filter it by
frontend / Rust.

| Capability | Frontend entry | Rust | Purpose |
| --- | --- | --- | --- |
| IPC | `@/core/ipc` | `generate_handler` (generated) | `ipc<T>(cmd, args)`, command names constrained by `commands.gen.ts`; never call `invoke` directly |
| Event bus | `@/core/events` | `events.rs` | Typed `emitEvent / onEvent` with a shared prefix |
| Logging | `@/core/logger` | `log` | Unified logging, console intercepted |
| Errors | `@/core/errors` | `error.rs` | `AppError{code,message}` normalization + global toasts |
| Database | `@/core/db` | `db.rs` | Drizzle (kdb) + generic CRUD + scoped migrations |
| HTTP | `@/core/http` | `http.rs` | reqwest, no CORS; `download()` streaming + progress |
| Theme | `@/core/theme` | `set_window_appearance` | Light / dark / system + accent + font scale |
| Plugin registry | `@/core/plugins` | `plugins/mod.rs` | Build-time auto-registration, both ends |
| Auto-update | `@/core/updater` | `updater.rs` | tauri-plugin-updater + static manifest |
| Notifications | `@/core/notify` | `tauri-plugin-notification` | Permission request + settings toggle |
| Autostart | `@/core/autostart` | `tauri-plugin-autostart` | The OS is the source of truth |
| Transactions | `runInTransaction` on `@/core/db` | `db.rs` | Batch in one transaction; roll back on failure |
| Backup / restore / reset | settings → "Data" | `db.rs` | Auto-restart after restore or reset |
| Settings import / export | `@/core/settings-transfer` | `files.rs` | Export JSON; import applies after restart |
| Diagnostics | `@/core/diagnostics` | `diagnostics.rs` | Environment info + recent logs |
| Single instance | — | `tauri-plugin-single-instance` | Second launch focuses the window and forwards args |
| In-app shortcuts | `@/core/shortcuts` | — | `registerShortcut('mod+k', fn)` |
| Global shortcuts | `@/core/global-shortcut` | `tauri-plugin-global-shortcut` | Settings-driven; focus the main window |
| Search / command palette | `@/core/search` | — | `Cmd/Ctrl+K` aggregates nav and tools |
| Taskbar progress / badge | `@/core/taskbar` | Tauri Window API | Progress 0–100 / Dock badge |
| Background tasks | `@/core/tasks` | `tasks.rs` | Cancel tokens + `task://` progress events |
| Open content | `@/core/open-with` | `open.rs` | Unified CLI / deep-link / drop dispatch (`onOpenFiles`) |
| Multi-window | `@/core/windows` | `capabilities/windows.json` | `openAppWindow()`, label `win-*` |
| Native app menu | `@/core/events` (`app://menu`) | `menu.rs` | macOS menubar / Windows window menu |
| Platform detection | `@/core/platform.ts` | — | `isMac` (styling and modifier-key differences) |

:::note
When you add a capability, update all of: the frontend `src/core/`, Rust `src-tauri/src/`,
`src-tauri/framework-commands.json` (the framework command list), and this table.
:::
