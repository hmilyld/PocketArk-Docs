---
title: Pitfalls
description: Regressions to avoid, plus the macOS port problem and local-layer compilation gotchas.
---

This page is "read before touching code". Every issue below has happened before — do not regress them.

## Framework behavior

- **Logging loop**: `core/logger` uses `attachLogger` plus an `echoing` guard. Do not revert to
  `attachConsole`, and do not forward logs during echo — it loops forever.
- **keepAlive**: `MainLayout` caches based on `route.meta.keepAlive !== false`; only a manifest entry
  with `keepAlive: false` opts out.
- **Ordering**: plugin group order = the smallest `order` in the group; `manifest.order` participates —
  do not revert to directory-name sorting.
- **Theme / appearance sync**: `applyTheme` syncs NSWindow.appearance / NSWindow.backgroundColor.
  Forcing darkAqua / aqua pins the webview's `prefers-color-scheme`; "follow system" must pass
  `dark: null` to clear the override (three-state `set_window_appearance`).

## Security boundary

:::danger[`db_*` / `http_request` are not gated by capabilities]
Any code inside the webview can run arbitrary SQL and make arbitrary requests. Keep the **CSP strict**
and **load no remote content**; treat plugins (local code) as the trusted boundary.
:::

## Tool page layout

- `ToolShell` provides only a page header + full-width container; organize centered columns and splits
  with the native Tailwind grid (`grid grid-cols-12` + `col-start-*` / `col-span-*`). An
  `mx-auto max-w-*` centered container is **forbidden**.
- Centered columns must use an even span (12 − span is even).
- If a new registry component uses bare `data-checked:` / `data-open:` boolean variants, convert them to
  `data-[state=...]:` (reka-ui 2.10 only emits the latter).

## macOS dev port in use

The tauri CLI (≤2.11.4) cleans up the dev server process tree on exit via
`$TMPDIR/tauri-stop-dev-processes.sh`, but in practice the script can be created as a **0-byte, 0o644**
file (both content and permission writes fail silently), and the `!exists()` guard never rebuilds it →
vite becomes an orphan → the next `tauri dev` reports the port in use.

`chmod` alone is not enough (an empty script is a no-op); write the original content plus the execute
bit once:

```bash
cat > "${TMPDIR}tauri-stop-dev-processes.sh" << 'EOF'
#!/usr/bin/env sh
getcpid() {
    cpids=$(pgrep -P $1|xargs)
    for cpid in $cpids; do
        echo "$cpid"
        getcpid $cpid
    done
}
kill $(getcpid $1)
EOF
chmod 755 "${TMPDIR}tauri-stop-dev-processes.sh"
```

Emergency fallback: `lsof -ti:1420 | xargs -r kill -9`.

:::note
Upstream tauri#15098; remove this once the fix (PR #15108) is merged and the CLI upgraded.
:::

## Other common issues

- **App still running after closing the window?** By design: it hides to the tray (resident in the
  background). To quit for real: right-click the tray icon → Quit (or `Cmd+Q` on macOS). You can disable
  "hide to tray" in settings.
- **Windows dev reports ELIFECYCLE / a huge exit code**: on exit the tauri CLI force-kills the vite dev
  server, and on Windows the killed process reports an NTSTATUS code (e.g. 4294967295). This is dev
  noise; it does not exist in packaged builds.
- **Some UI does not follow font-size / theme changes**: it likely hard-codes px — switch to `rem` /
  semantic tokens.

## Local-layer compilation dependencies (ocr-rs, etc.)

Heavy dependencies like these belong to the fork's local layer. Compilation issues (macOS `CXXFLAGS`,
Windows libclang) are handled by the fork and documented in `LOCAL.md`; base does not include them and
has no such problems.
