---
title: Lifecycle hooks
description: A framework-level SPI to intercept startup and exit before/after the main window appears, implemented by forks on demand.
---

The framework **defines only the contract and call sites, with no implementation**. If a fork needs to
intercept startup or exit (license checks, authorization, data migration, cleanup reporting, …), it
implements `AppLifecycle` in `src-tauri/local/lifecycle.rs`; the build discovers and calls it
**automatically, with no registration**. Without an implementation everything is a no-op and the app
behaves exactly as if the mechanism did not exist. Network checks, showing a registration window and
database access are all the fork's own implementation — the base takes no part.

- Contract: `src-tauri/src/lifecycle.rs` (framework)
- Implementation slot: `src-tauri/local/README.md` (base documents it; code under this directory belongs to the fork)

## The four hooks

| Method | Timing | Return value | Notes |
| --- | --- | --- | --- |
| `before_start` | **Before** the main window shows (async) | `Continue` / `Hold` / `Quit` | The only chance to hold back the main window |
| `after_start` | After the main window shows | — | Non-blocking init; a panic does not affect the app |
| `before_exit` | When exit begins, before the process ends (async) | `Continue` / `Cancel` | `Cancel` aborts this exit |
| `after_exit` | As the process is ending | — (**must be sync and fast**) | Runs on its own thread with a timeout; released on timeout |

Gating: the tray, single-instance and Dock-reopen paths all go through `show_main_window_now` in
`tray.rs`; while `Hold` is active they are all refused, so there is no bypass.

## Failure and timeouts

Hooks run on a dedicated task: an `Err`, a panic or a timeout never crashes the app. The strategy is
declared by the implementation:

| Hook | Strategy method | Default | Meaning |
| --- | --- | --- | --- |
| `before_start` | `on_before_start_fail` | `Halt` | A failed check means no main window (better to hold than to let through) |
| `before_exit` | `on_before_exit_fail` | `Skip` | Let the exit proceed (never trap the user) |

Timeout limits: `BEFORE_START_TIMEOUT` (10s), `BEFORE_EXIT_TIMEOUT` (5s), `AFTER_EXIT_TIMEOUT` (200ms).

## Wiring it up in a fork

Implement it in `src-tauri/local/lifecycle.rs` (write only what you need; the rest use defaults):

```rust
use tauri::AppHandle;

use crate::error::AppError;
use crate::lifecycle::{AppLifecycle, HookFuture, StartupFlow};

pub struct Hooks;

impl AppLifecycle for Hooks {
    fn before_start(&self, app: &AppHandle) -> HookFuture<'_, Result<StartupFlow, AppError>> {
        let app = app.clone();
        Box::pin(async move {
            if licensed(&app).await? {
                Ok(StartupFlow::Continue)
            } else {
                open_activation_window(&app)?;
                Ok(StartupFlow::Hold)
            }
        })
    }
}
```

The name `pub struct Hooks;` is a convention — do not rename it.

## `Hold` semantics and pitfalls

- `Hold` = **do not show the main window**, but keep the process running. The fork owns its own UI
  (e.g. an activation window); when done it calls `crate::lifecycle::resume_startup(app)` to continue
  startup (show the main window + `after_start`).
- During `Hold` the user can still quit from the tray — an intentional fallback so they are never
  stuck both ways.
- Hooks **must not block the main thread**: calling `block_on` inside a hook freezes startup (not even
  the registration window renders). If you need to wait on the network, simply `await` — the framework
  already applies timeouts.
- The base contains no implementation; this file belongs to the fork's local layer and is never
  back-ported upstream (see [Local layer](/en/local-layer/)).

When you need startup checks, authorization interception or data migration in your own software, this
is the only official hook point.
