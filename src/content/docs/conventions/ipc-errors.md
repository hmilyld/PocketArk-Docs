---
title: IPC、错误与日志
description: 类型安全的 IPC 调用、AppError 错误管道，以及禁止裸 println 的日志约定。
---

## IPC

前端一律使用 `@/core/ipc` 的封装，**禁止裸 `invoke`**：

```ts
import { ipc } from '@/core/ipc';

const rows = await ipc<Row[]>('db_query_values', { sql, params });
```

命令名由 `scripts/gen-commands.mjs` 生成到 `src/core/ipc/commands.gen.ts`：它读取
`src-tauri/framework-commands.json` 并扫描插件的 `#[tauri::command]`，生成框架 + 插件的
**联合类型**。调用未注册的命令会在类型检查期报错。

:::caution[commands.gen.ts 是生成物]
`commands.gen.ts` 随 `prepare` / 构建更新，**不要手改**。
:::

## 错误

Rust 侧所有命令返回 `AppError{code, message}`，其 `code` 与前端 `@/core/errors`
的 `ErrorCode` 对齐。错误会自动走统一管道：转换 → 日志 → 未捕获时 toast。

```rust
Err(crate::error::AppError::custom("TIME_ERROR", "clock went backwards"))
```

## 日志

用 `@/core/logger` 的 `logger`，或插件 `setup.ts` 里的 `ctx.logger`；Rust 侧用 `log`。
**禁止裸 `println!`**。

双端日志统一写入应用日志目录（macOS 为 `~/Library/Logs/<应用 identifier>/`），
console 已被接管，级别运行时可调（设置页）。

:::danger[不要改回 attachConsole]
`core/logger` 用 `attachLogger` + `echoing` 护栏避免日志回环。不要改回 `attachConsole`，
也不要让 console 接管函数在回显期转发日志——会造成无限循环。
:::
