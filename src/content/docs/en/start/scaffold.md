---
title: Make it yours
description: Rename with one command, replace the dual-source icons, and remove the sample plugins.
---

## 1. Rename (one command)

```bash
pnpm scaffold
```

Answer five questions (Enter keeps the default):

| Question | Notes |
| --- | --- |
| Display name | Shown in the window, Dock / taskbar, tray tooltip and settings (any language) |
| English slug | kebab-case (e.g. `my-kit`), used for the package and binary name |
| App identifier | `com.pocketark.<slug>`, **immutable after release** (changing it makes the OS treat it as a different app) |
| Default accent | Indigo / Teal / Amber / Rose / Blue / Grid Green |
| Default theme | dark / light |

The script rewrites names in `tauri.conf.json`, `Cargo.toml`, `main.rs`, `package.json` and the docs.
Then run:

```bash
pnpm install        # refresh the package name in the lockfile
pnpm tauri dev      # run under the new name
```

:::caution[identifier cannot change after release]
The app identifier is the OS-level identity credential. Changing it after a release makes the system
treat the app as a different one — user data directories and update paths all break.
:::

### Manual rename checklist

If you prefer to edit by hand, this is the exact list the script covers:

| File | What to change |
| --- | --- |
| `src-tauri/tauri.conf.json` | `productName`, `identifier`, `title` |
| `src-tauri/Cargo.toml` | `[package] name` (kebab), `[lib] name` (snake + `_lib`) |
| `src-tauri/src/main.rs` | `pocketark_lib::run()` → new lib name |
| `package.json` | `name` |
| `src/core/theme/index.ts` | `DEFAULT_THEME` / `DEFAULT_ACCENT` (optional) |
| `README.md`, `START.md`, `AGENTS.md`, `src/content/about.md` | your own intro and titles |
| `index.html` | `<title>` |

The UI (sidebar / top bar) and tray tooltip read `productName` **dynamically** — no code changes needed.

## 2. Replace icons (dual-source)

There are two source files with the same artwork, differing only in frame scale / corner radius per
platform convention:

| Source | Style | Output | Platform |
| --- | --- | --- | --- |
| `src-tauri/icons/icon-macos.svg` | HIG grid padding (artwork 80.5%) | `icon.icns` + Store tile | macOS Dock / Finder |
| `src-tauri/icons/icon-windows.svg` | Full bleed (artwork fills the canvas) | `icon.ico` + PNGs | Windows taskbar / Explorer, Linux |

Edit the **artwork in both SVGs** (keep each frame's parameters), then regenerate:

```bash
pnpm icons
```

The script runs `tauri icon` twice and assembles per platform: icns / tile use the macOS version,
ico / png use the Windows version, and `public/icon.svg` is synced. Each platform's build picks the
right format automatically.

:::tip[macOS Dock still shows the old icon?]
Run `killall Dock` to refresh the icon cache.
:::

## 3. Remove the sample plugins

The base repository ships two built-in plugins. Keep or remove as needed:

| Plugin | Notes | Advice |
| --- | --- | --- |
| `hello-world` | Full-chain demo (Rust / SQLite / HTTP / layout), 5 tools | Remove for real use |
| `system` | Data maintenance (frontend-only, built-in) | Keep |

```bash
# e.g. remove the example (keep system / _template)
rm -rf plugins/hello-world
```

The frontend (sidebar / routes / settings) and backend (Rust commands / migrations) are scanned at
build time, so **deleting the directory removes it completely**; migrations are scope-isolated, so one
plugin's removal never affects another.

:::danger[Always keep _template]
`_template/` is your new-plugin scaffold. Removing it breaks both `pnpm create-plugin` and manual
template copying.
:::

## Pre-release checklist

- [ ] `pnpm scaffold` has renamed everything (**verify the identifier**)
- [ ] Icons replaced and regenerated
- [ ] `src/content/about.md` / `changelog.md` have your intro and first release
- [ ] Sample plugins removed or disabled
- [ ] `pnpm lint && pnpm build` pass
- [ ] `pnpm tauri build` output smoke-tested on the target platform (launch / quit / tray / maximize)
