---
title: Troubleshooting and code signing
description: Common failures in the release and update pipeline, plus optional macOS / Windows code signing.
---

## Troubleshooting

- **`packages field missing or empty` (pnpm)**: `pnpm-workspace.yaml` is missing its `packages:` field,
  so pnpm 9's `pnpm store path` errors. CI switched to **npm** (the local flow still uses pnpm).
- **Update artifact (`.sig`) missing**: confirm `createUpdaterArtifacts: true` and that the build is signed;
  with `--target`, artifacts live in `target/<triple>/release/bundle` (`release.mjs` already handles it).
- **Windows update package**: Tauri v2 uses `*-setup.exe` (+ `.exe.sig`), **not** `.nsis.zip`.
- **Release includes build intermediates** (e.g. `build-script-build*.exe`): scope collection to
  `*/release/bundle/*`.
- **Unsigned macOS package blocked by Gatekeeper**: run
  `xattr -dr com.apple.quarantine /Applications/<Product>.app` on first launch.
- **Server 403 / 500**: make sure the static directory is anonymously readable and `latest.json` returns
  200 + JSON.
- **Update prompt every launch**: `latest.json.version` does not match the build version, or it is not
  monotonically increasing.

## Code signing

:::danger[Never commit the private key or its password]
Keep the private key and password only in CI secrets and local `~/.tauri/`. A lost password means
generating a new key and updating `pubkey` — already-released installs will no longer receive updates.
:::

OS code signing is optional and not required by this flow:

- **macOS**: an unsigned build risks Gatekeeper quarantine and update instability; Apple Developer ID +
  notarization resolves it.
- **Windows**: an unsigned build triggers SmartScreen warnings.
