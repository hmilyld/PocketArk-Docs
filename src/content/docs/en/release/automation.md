---
title: Release and auto-update
description: The automated and manual release flows, the latest.json spec, and the CI workflow reference.
---

## Prepare a release

```bash
pnpm version:bump 0.2.0     # syncs tauri.conf.json / Cargo.toml / package.json
# edit src/content/changelog.md and add a ## [0.2.0] section
git add -A && git commit -m "chore: release 0.2.0"
```

## Trigger an automated release

```bash
git push
git tag v0.2.0              # without the leading v it must equal tauri.conf.json's version
git push origin v0.2.0
```

Or run the `Release` workflow manually from the Actions page (`workflow_dispatch`) with `version` and
`base-url`.

## What CI does

1. **Resolve the version**: validate that the tag / input matches `tauri.conf.json.version`; run
   `cargo fmt --check`.
2. **Build matrix**: `macos-14` (aarch64-apple-darwin) and `windows-latest` (x86_64-pc-windows-msvc);
   accelerated by `sccache` + `rust-cache`; optional `pre-build` (a pre-build command such as fetching
   assets) and `native-cpp` (install LLVM on Windows, set CXXFLAGS on macOS); builds with
   `tauri build --target <triple> --bundles app|nsis` and signing.
3. **Collect artifacts**: only installers and `.sig` files under `*/release/bundle/*`, uploaded as
   Actions artifacts.
4. **Archive the Release**: download all artifacts → generate a **unified** `latest.json` (multi-platform)
   + `checksums.txt` → create / update the GitHub Release with all assets.

Artifact names:

- macOS: `<Product>.app.tar.gz` + `.sig`
- Windows: `<Product>_<version>_x64-setup.exe` + `.sig`
- Manifest: `latest.json`, `checksums.txt`

## After the release: upload to the update server

CI only archives artifacts to the GitHub Release; you upload to the update server yourself:

```bash
mkdir -p ~/release && cd ~/release
gh release download v0.2.0 --repo <owner>/<repo> --dir .
scp ./* user@host:/path/to/webroot/
# or: rsync -av ./ user@host:/path/to/webroot/
```

Verify: `curl -s https://<domain>/latest.json`

## Manual release (fallback)

```bash
# 1) forks prefetch assets first (skip if base has no personal assets)
pnpm assets

# 2) signed build (prefer explicit --target/--bundles)
TAURI_SIGNING_PRIVATE_KEY_PATH=~/.tauri/<app>.key \
TAURI_SIGNING_PRIVATE_KEY_PASSWORD='<password>' \
pnpm tauri build --target aarch64-apple-darwin --bundles app

# 3) generate the manifest (scans target and target/<triple> bundles)
pnpm release -- --base-url https://<domain> --changelog src/content/changelog.md
```

To merge platforms explicitly, use `--platform`:

```bash
pnpm release -- --base-url https://<domain> --version 0.2.0 \
  --platform darwin-aarch64=src-tauri/target/aarch64-apple-darwin/release/bundle/macos/<Product>.app.tar.gz \
  --platform windows-x86_64=src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/<Product>_0.2.0_x64-setup.exe
```

`scripts/release.mjs` options:

- `--base-url` (required): prefix for URLs in the manifest.
- `--version`: defaults to `tauri.conf.json`.
- `--notes <file|text>` or `--changelog <file>`: release notes; `--changelog` extracts the matching
  version's section.
- `--platform <key>=<path>`: manual platform mapping (repeatable); otherwise it auto-scans
  `target/release/bundle` and `target/<triple>/release/bundle`, recognizing
  `.app.tar.gz` / `*-setup.exe` / `.nsis.zip` / `.msi.zip` / `.AppImage.tar.gz` and pairing the matching `.sig`.

## latest.json spec

```json
{
  "version": "0.2.0",
  "notes": "## [0.2.0] ...",
  "pub_date": "2026-09-11T00:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "<contents of the .sig file>",
      "url": "https://<domain>/<Product>.app.tar.gz"
    },
    "windows-x86_64": {
      "signature": "<contents of the .sig file>",
      "url": "https://<domain>/<Product>_0.2.0_x64-setup.exe"
    }
  }
}
```

- `signature`: the **full contents** of the installer's `.sig` file (not a URL).
- `url`: the absolute HTTPS address of the installer; the filename must match the uploaded file.
- Platform keys: `darwin-aarch64` / `darwin-x86_64` / `windows-x86_64` / `linux-x86_64`.
- `pub_date`: RFC 3339.
- `version` must equal the build version and be **>** the installed version, or the prompt never appears
  (or appears every launch).

## Base vs fork responsibilities

- **Base**: `scripts/release.mjs`, `.github/workflows/release-reusable.yml` (reusable) and the docs.
- **Fork**: `.github/workflows/release.yml` (caller), keys / variables, and the prefetched assets and
  compilation dependencies documented in `LOCAL.md`.
- **Sync**: after base changes, run `git merge upstream/main` in the fork.

## Reusable workflow reference

Inputs and secrets (`hmilyld/PocketArk/.github/workflows/release-reusable.yml`, `workflow_call`):

| input | default | Notes |
| --- | --- | --- |
| `version` | `''` | Version; derived from the triggering tag when empty |
| `base-url` | required | Update server address |
| `pre-build` | `''` | Command run before build (e.g. prefetch assets) |
| `native-cpp` | false | Install LLVM / set CXXFLAGS |
| `create-release` | true | Whether to create the GitHub Release archive |

secrets: `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.

Fork caller example `.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    tags: ['v*']
  workflow_dispatch:
    inputs:
      version:
        required: false
        type: string
      base-url:
        required: false
        type: string
permissions:
  contents: write
jobs:
  release:
    uses: hmilyld/PocketArk/.github/workflows/release-reusable.yml@main
    with:
      version: ${{ inputs.version }}
      base-url: ${{ inputs.base-url || vars.UPDATE_BASE_URL }}
      pre-build: 'npm run fonts && npm run ocr-models' # fork-specific; empty for base
      native-cpp: true
    secrets: inherit
```

The fork must configure GitHub:

- **Variables**: `UPDATE_BASE_URL = https://<domain>`
- **Secrets**: `TAURI_SIGNING_PRIVATE_KEY` (private key contents, base64 on one line, no newline),
  `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` (omit when there is no password).

## Performance and caching

- Each platform caches independently (`Swatinem/rust-cache`, keyed by job name and profile): the first
  run per "platform × task type" is cold, later ones warm.
- `sccache` (`SCCACHE_GHA_ENABLED=true`) reuses compilation across jobs / profiles.
- Reference times: cold ≈ 12–35 min; warm macOS ≈ 4 min, Windows ≈ 14 min.
- Cache invalidation: `Cargo.lock` changes, a Rust toolchain upgrade, 7 days unused, the 10 GB repo cap,
  or eviction from rapid consecutive pushes.
