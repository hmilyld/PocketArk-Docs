---
title: FAQ
description: Port in use, close behavior, Windows dev noise, font size not applying, and more.
---

## macOS reports "Port 1420 is already in use" when restarting dev

The tauri CLI's cleanup script may be created as an empty file without the execute bit, leaving the
vite process behind. See the one-time fix in
[Pitfalls · macOS dev port in use](/en/conventions/pitfalls/#macos-dev-port-in-use).

Emergency fallback: `lsof -ti:1420 | xargs -r kill -9`.

## The app still runs after closing the window?

By design: closing the window **hides to the tray** (resident in the background). To quit for real:
right-click the tray icon → Quit (or `Cmd+Q` on macOS). You can disable "hide to tray" in settings.

## Windows dev reports ELIFECYCLE / a huge exit code

On exit the tauri CLI force-kills the vite dev server, and on Windows the killed process reports an
NTSTATUS code (e.g. 4294967295). This is dev noise; it does not exist in packaged builds.

## Some UI does not follow font-size / theme changes?

The whole UI scales with the setting; if a view does not follow, it likely hard-codes px — switch to
`rem` / semantic tokens (`text-sm`, `h-9`, …).

## Updates prompt every time, or never?

See [Troubleshooting](/en/release/troubleshooting/): usually `latest.json.version` does not match the
build version, or version numbers are not monotonically increasing.

## A new plugin does not appear in the sidebar?

If it does not show up after the frontend glob changes, restart `pnpm dev` / `pnpm tauri dev`.
