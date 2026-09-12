---
title: Local layer (fork-specific)
description: Where personal tools, dependencies, assets and scripts live, to stay in sync with upstream base.
---

PocketArk itself ships **no personal tools and downloads no assets**. When you fork it into your own
software, keep personal content in the "local layer" so it stays in sync with upstream base. The base
repository only keeps this convention documented.

## Where things go

| Content | Location |
| --- | --- |
| Personal plugins (both ends) | `plugins/<id>/` (auto-registered at build time, no manual registration) |
| Personal Rust dependencies | the `# ── local plugin deps (fork-owned) ──` section at the end of `src-tauri/Cargo.toml` |
| Personal assets (fonts / models / …) | `src-tauri/local-resources/` |
| Personal download / build scripts | `scripts/local/` (`scripts/prepare.mjs` calls `scripts/local/prepare.mjs` automatically) |
| Extra webview permissions | `src-tauri/capabilities/local.json` (auto-discovered by Tauri; absent in base) |

## Assets and build

- Put assets in `src-tauri/local-resources/`: `bundle.resources` already includes
  `local-resources/**/*`, so `tauri.conf.json` needs no change.
- Put asset downloads in `scripts/local/prepare.mjs`: it runs automatically before `tauri dev` /
  `tauri build` via `scripts/prepare.mjs`; skip downloads in CI.
- For C++ dependencies (bindgen / cc): export `CXXFLAGS` on macOS (e.g.
  `export CXXFLAGS="-std=c++14 -I$(xcrun --sdk macosx --show-sdk-path)/usr/include/c++/v1"`); install
  LLVM (`LIBCLANG_PATH`) on Windows.

## Syncing base

```bash
git remote add upstream <base url>
git fetch upstream
git merge upstream/main
```

Personal content lives in the locations above, so merges are generally conflict-free; if `Cargo.lock`
conflicts, rebuild with `cargo build`.

## Release

To enable auto-update: generate your own key (`pnpm tauri signer generate`), put the public key in
`tauri.conf.json > plugins.updater.pubkey`, enable `bundle.createUpdaterArtifacts: true`, build with
signing, and generate the manifest with `pnpm release` (see
[Release and auto-update](/en/release/automation/)).
