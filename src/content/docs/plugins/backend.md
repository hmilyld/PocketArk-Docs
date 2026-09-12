---
title: Rust 后端命令
description: 在 backend/mod.rs 写 #[tauri::command]，构建期自动登记，前端用 ipc 调用。
---

需要原生能力（文件、系统、重计算）时，在插件的 `backend/mod.rs` 直接写命令即可，
**构建期自动扫描，无需改任何框架文件**。

## 写一个命令

```rust
#[tauri::command]
pub fn timestamp_tool_now() -> Result<i64, crate::error::AppError> {
    Ok(std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .map_err(|e| crate::error::AppError::custom("TIME_ERROR", e.to_string())))
}
```

前端调用：

```ts
import { ipc } from '@/core/ipc';

const now = await ipc<number>('timestamp_tool_now');
```

## 硬性约定

| 约定 | 说明 |
| --- | --- |
| 位置 | 命令必须定义在 `plugins/<id>/backend/mod.rs`；其余 `.rs` 作为它的子模块（`pub mod xxx;`） |
| 命名 | 函数名 = 前端调用名，带 `<plugin_id>_` 前缀防冲突；全局唯一 |
| 签名 | 一律返回 `Result<T, AppError>` |
| 参数 | Rust 侧 snake_case；前端传 camelCase 会自动映射 |
| 错误 | 错误自动进入日志与全局 toast，无需手动处理 |

命令可以独占一行或与 `#[tauri::command]` 同行，属性带参数
（如 `#[tauri::command(rename_all = "camelCase")]`）也可识别。

:::danger[重名会导致构建失败]
`build.rs` 解析所有插件命令并生成 `generate_handler!`；同名命令会产生重复 match 分支，
`build.rs` 会在构建期直接报错。
:::

## 框架命令

框架自有命令（db / http / updater 等）的清单在 `src-tauri/framework-commands.json`，
是单一事实源，供 `build.rs` 与前端命令名生成共用。新增框架命令需在此追加，
否则不会被注册，前端类型检查也会报错。
