---
title: Packaging
description: Produce per-platform installers with pnpm tauri build, plus output locations and security notes.
---

```bash
pnpm tauri build
```

## Output locations

Passing an explicit `--target <triple>` adds a triple directory:

- **macOS**: `src-tauri/target/**/release/bundle/macos/*.app`
  (with update artifacts: `<Product>.app.tar.gz` + `.sig`)
- **Windows**: `src-tauri/target/**/release/bundle/nsis/*-setup.exe`
  (msi depending on `--bundles`)

For the full signed release flow, see [Release and auto-update](/en/release/automation/).

## Security notes (hand these to a reviewer)

- The installed app opens **no local port**: frontend assets load through an in-process custom protocol,
  with no web server.
- The only network activity is the HTTP requests the app itself initiates.

## Maintaining content

- Edit `src/content/changelog.md` / `src/content/about.md` for the changelog and about pages.
- The version's single source of truth is `src-tauri/tauri.conf.json > version`; before a release run
  `pnpm version:bump x.y.z` to sync all three (`tauri.conf.json` / `Cargo.toml` / `package.json`).
