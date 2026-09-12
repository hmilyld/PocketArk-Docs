---
title: Install and run
description: Prepare Node / pnpm / Rust and the platform dependencies, then run PocketArk locally.
---

## Prerequisites

| Dependency | Version | Notes |
| --- | --- | --- |
| Node.js | 20+ | includes npm |
| pnpm | 9+ | package manager (`npm i -g pnpm`) |
| Rust | stable (1.77+) | install via `rustup` |

Platform extras:

- **macOS**: Xcode Command Line Tools (`xcode-select --install`).
- **Windows**: MSVC Build Tools (tick "Desktop development with C++" in the VS Installer) +
  WebView2 Runtime (bundled with Windows 11).
- **Linux**: `webkit2gtk` and friends — see [Tauri prerequisites](https://tauri.app/start/prerequisites/).

## First run

```bash
pnpm install
pnpm tauri dev      # first build compiles Rust (a few minutes); incremental afterwards
```

A window appearing means success. It launches the "dark command deck" PocketArk with the sample tools.

:::tip
`pnpm dev` starts only the Vite frontend (good for UI work); use `pnpm tauri dev` to get the full
desktop window, tray and Rust commands.
:::

## Common commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Vite dev server only (frontend) |
| `pnpm tauri dev` | Tauri dev mode (compiles Rust first) |
| `pnpm lint` | ESLint (run after frontend changes) |
| `pnpm build` | `vue-tsc --noEmit` + frontend build |
| `pnpm test` | vitest unit tests (pure core logic) |
| `pnpm lint:rs` | `cargo clippy -D warnings` (run after Rust changes) |
| `pnpm fmt:rs` | `cargo fmt` |
| `pnpm test:rs` | `cargo test` |
| `pnpm tauri build` | Package the app |

Convention: after frontend changes run `pnpm lint && pnpm build`; after Rust changes run
`pnpm lint:rs && pnpm fmt:rs && pnpm test:rs`.

## Next

Once the window opens, do two things: **rename** and **remove the examples** — see
[Make it yours](/en/start/scaffold/).

:::note[About the local layer]
The base repository downloads nothing and ships no personal tools. If your fork adds fonts, OCR
models or extra Rust dependencies, keep them in the "local layer" — see [Local layer](/en/local-layer/).
:::
