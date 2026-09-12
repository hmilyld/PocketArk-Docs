---
title: Rust backend commands
description: Write #[tauri::command] in backend/mod.rs, auto-registered at build time, called via ipc on the frontend.
---

When you need native capability (files, the system, heavy computation), simply write a command in the
plugin's `backend/mod.rs` — it is **scanned at build time, with no framework file to edit**.

## Write a command

```rust
#[tauri::command]
pub fn timestamp_tool_now() -> Result<i64, crate::error::AppError> {
    Ok(std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .map_err(|e| crate::error::AppError::custom("TIME_ERROR", e.to_string())))
}
```

Call it from the frontend:

```ts
import { ipc } from '@/core/ipc';

const now = await ipc<number>('timestamp_tool_now');
```

## Hard rules

| Rule | Notes |
| --- | --- |
| Location | Commands must be defined in `plugins/<id>/backend/mod.rs`; other `.rs` files are its submodules (`pub mod xxx;`) |
| Naming | Function name = frontend call name, prefixed with `<plugin_id>_`; globally unique |
| Signature | Always return `Result<T, AppError>` |
| Parameters | Rust side uses snake_case; camelCase from the frontend is mapped automatically |
| Errors | Errors flow into logs and global toasts automatically; no manual handling |

A command may sit on its own line or share the line with `#[tauri::command]`, and attributes with
arguments (e.g. `#[tauri::command(rename_all = "camelCase")]`) are recognized.

:::danger[Duplicate names fail the build]
`build.rs` parses all plugin commands to generate `generate_handler!`; duplicate names produce repeated
match branches and `build.rs` fails the build.
:::

## Framework commands

The list of framework commands (db / http / updater, etc.) lives in
`src-tauri/framework-commands.json`, the single source of truth shared by `build.rs` and the frontend
command-name generator. New framework commands must be added there, or they are neither registered nor
type-checked on the frontend.
