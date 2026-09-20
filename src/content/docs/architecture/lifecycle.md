---
title: 生命周期钩子
description: 框架级 SPI：在主窗口显示前后、进程退出前后拦截启动与退出流程，fork 按需实现。
---

框架**只定义契约与调用点，不含任何实现**。fork 若需要在应用启动 / 退出环节拦截
（注册校验、授权、数据迁移、清理上报……），在 `src-tauri/local/lifecycle.rs` 实现
`AppLifecycle` 即可被构建期自动发现并调用，**无需任何登记**；不提供实现时全为 no-op，
行为与未引入该机制时完全一致。联网校验、弹注册窗口、读写数据库等都属 fork 自己的实现内容。

- 契约代码：`src-tauri/src/lifecycle.rs`（框架）
- 实现位约定：`src-tauri/local/README.md`（base 提供说明，目录下实现属 fork）

## 四个环节

| 方法 | 时机 | 返回值 | 备注 |
| --- | --- | --- | --- |
| `before_start` | 主窗口显示**之前**（异步） | `Continue` / `Hold` / `Quit` | 唯一能拦住主窗口显示的时机 |
| `after_start` | 主窗口显示之后 | 无 | 非阻塞初始化；panic 不影响运行 |
| `before_exit` | 退出流程开始、进程结束之前（异步） | `Continue` / `Cancel` | `Cancel` 中止本次退出 |
| `after_exit` | 进程即将结束 | 无（**必须同步且快速**） | 独立线程执行 + 限时等待，超时即放行 |

门禁收口：托盘、单实例、Dock reopen 三条唤起路径都经过 `tray.rs` 的 `show_main_window_now`，
`Hold` 期间一律拒绝显示，避免旁路。

## 失败与超时

钩子运行在独立任务里，返回 `Err` / panic / 超时都不会带崩应用，按实现自己声明的策略兜底：

| 钩子 | 策略方法 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `before_start` | `on_before_start_fail` | `Halt` | 校验挂了就不显示主窗口（宁可不放行） |
| `before_exit` | `on_before_exit_fail` | `Skip` | 放行退出（绝不把用户卡在退不出去） |

超时上限：`BEFORE_START_TIMEOUT`（10s）、`BEFORE_EXIT_TIMEOUT`（5s）、`AFTER_EXIT_TIMEOUT`（200ms）。

## fork 接入

在 `src-tauri/local/lifecycle.rs` 实现即可（只写关心的方法，其余用默认实现）：

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

`pub struct Hooks;` 的名称是约定，勿改。

## `Hold` 的语义与陷阱

- `Hold` = **不显示主窗口**，但进程继续运行；fork 负责自己的界面（如注册窗口），
  处理完成后调用 `crate::lifecycle::resume_startup(app)` 继续启动（显示主窗口 + `after_start`）。
- `Hold` 期间用户仍可从托盘退出——这是刻意的兜底，避免「既进不去也退不出」。
- 钩子**不得阻塞主线程**：在钩子里 `block_on` 会让启动假死（连注册页都画不出来）。
  需要网络等待就直接 `await`，框架已给超时。
- base 不含实现；该文件属 fork 本地层，不随上游回填（见[本地层](/local-layer/)）。

想在自己的软件里做启动校验、授权拦截或数据迁移时，这是唯一的官方接入点。
