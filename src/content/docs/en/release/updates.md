---
title: Auto-update
description: "How the built-in updater works and the one-time setup: generate keys, set the pubkey, enable artifacts, prepare a server."
---

## How it works

The framework ships auto-update: frontend `src/core/updater`, Rust `src-tauri/src/updater.rs`
(commands `updater_check` / `updater_install` / `updater_restart`), built on the official
`tauri-plugin-updater` plus a self-hosted static manifest.

- Release artifacts = per-platform installers + their `.sig` (minisign signature) + a static
  `latest.json` manifest.
- Distribution: put the installers and `latest.json` in an **anonymously reachable HTTPS** directory.
- The app **checks once after startup** (`updateEnabled` + `updateAutoCheck`, no polling). Settings
  exposes the master switch, the update server URL and auto-check; the about page shows the current
  version.
- The version's single source of truth is `tauri.conf.json > version`. Update selection is strict
  semver (**remote must be > local**), so version numbers must increase monotonically.

:::note[minisign vs OS code signing]
This flow only performs the minisign signature required for Tauri update verification. macOS / Windows
**OS code signing** is optional and not a substitute — see
[Troubleshooting and code signing](/en/release/troubleshooting/#code-signing).
:::

## One-time setup

### Generate an update signing key

```bash
pnpm tauri signer generate -w ~/.tauri/<app>.key   # prompts for a password (may be empty)
```

- Private key: `~/.tauri/<app>.key` (**never commit it**; back it up).
- Public key: `~/.tauri/<app>.key.pub`.

### Set the pubkey and enable update artifacts

Edit `src-tauri/tauri.conf.json`:

```json
{
  "bundle": { "createUpdaterArtifacts": true },
  "plugins": {
    "updater": {
      "pubkey": "<contents of ~/.tauri/<app>.key.pub>"
    }
  }
}
```

You do not need `plugins.updater.endpoints` — the update URL is always overridden at runtime by the
setting.

### Give the app a default update URL (optional)

When the setting is empty the app will not auto-check. To make it work out of the box, hard-code your
domain in the setting defaults, e.g. `src/stores/settings.ts`:

```ts
const updateEnabled = ref(true);
const updateServerUrl = ref('https://<your-domain>');
```

### Prepare the update server

- A static directory reachable by **anonymous GET** (no login, no 403).
- Must be **HTTPS** (the updater rejects non-https).
- `latest.json` goes at the path matching your URL (if the URL is the root domain, it is requested at
  `<domain>/latest.json`).
- Self-check: `curl -s https://<domain>/latest.json` should return JSON (not 403 / 500 / a login page).

:::note[Base needs no signing key]
The base repository defaults to `bundle.createUpdaterArtifacts: false`, so `tauri build` works without a
signing key. The setup above is only needed once you enable updates.
:::
