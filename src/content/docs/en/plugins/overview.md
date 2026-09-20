---
title: The plugin system
description: Plugin directory conventions, build-time auto-registration, and the naming and scope rules you must follow.
---

Every tool in PocketArk is a **plugin**: one directory is one plugin, with frontend and backend side
by side. `plugin.json` is the single source of truth.

## Directory conventions

```text
plugins/<plugin-id>/
├── plugin.json          # manifest (single source of truth; shared by both scanners)
├── README.md            # feature notes (for users)
├── AGENTS.md            # dev conventions (for AI / maintainers, optional)
├── frontend/            # frontend
│   ├── views/           # tool pages (one PascalCase.vue per tools[] entry)
│   ├── settings/        # settings panel (optional, declared in plugin.json)
│   ├── components/      # plugin-private components (optional; a feature with ≥2 → components/<feature>/)
│   ├── composables/     # composables (optional, useXxx.ts)
│   ├── lib/             # pure logic TS (optional, no Vue dependency)
│   ├── shared.ts        # shared constants / types (optional)
│   ├── schema.ts        # database tables (optional, imported by code)
│   └── setup.ts         # plugin lifecycle hooks (optional, build-scanned)
└── backend/             # backend (optional)
    ├── mod.rs           # #[tauri::command] commands (**only here**)
    ├── migrations.rs    # migration aggregation: exports `pub fn all()` (optional)
    ├── <feature>/       # multi-file feature (≥2 files): <feature>/mod.rs + other .rs
    └── <single>.rs      # single-file feature / asset
```

**Hard rules**

- The `frontend/` top level **only** allows the whitelist:
  `views/ settings/ components/ composables/ lib/ shared.ts schema.ts setup.ts`. Everything else lives
  in those directories or `lib/`.
- Pure logic (no Vue dependency) goes in `frontend/lib/`; use `frontend/composables/` only when
  reactivity / lifecycle is needed.
- Naming: components `PascalCase.vue`; composables `useXxx.ts`; other TS `kebab-case.ts`; Rust files
  `snake_case.rs`; feature directories use a singular lowercase noun.
- Commands live only in `backend/mod.rs` (`build.rs` scans only that file); other `.rs` files are its submodules.
- A pure-frontend plugin may ship only `frontend/`, but `plugin.json` / `README.md` / `AGENTS.md` are still required.
- Directories starting with `_` or `.` are not registered (e.g. the `_template`).

Machine checks live in `scripts/lint-plugins.mjs` (R-P1~R-P6), wired into `pnpm lint`; for a genuine
exception, write `lint-plugins-ignore` in the file with a reason.

## Build-time auto-registration

Adding a plugin requires **no registration in any framework file**:

| Scan point | Location | Purpose |
| --- | --- | --- |
| Manifest | `plugins/*/plugin.json` | tools / settings / icons / ordering |
| Tool pages | `plugins/*/frontend/views/*.vue` | targeted by `manifest.tools[].entry` |
| Settings panel | `plugins/*/frontend/settings/*.vue` | targeted by `manifest.settings.entry` |
| Frontend hooks | `plugins/*/frontend/setup.ts` | plugin initialization |
| Backend commands | `plugins/*/backend/mod.rs` | `build.rs` parses `#[tauri::command]` and generates the registry |
| Migrations | `plugins/*/backend/migrations.rs` | aggregated into `all()`, scoped per version |

Navigation, routing, titles, enable/disable toggles, the settings panel, the error boundary and
KeepAlive all work automatically.

:::caution[Commands must live in backend/mod.rs]
`build.rs` only scans `plugins/<id>/backend/mod.rs`; other `.rs` files are its submodules
(`pub mod xxx;`). Command names are globally unique and must carry the `<plugin_id>_` prefix —
duplicates produce repeated `generate_handler!` branches and `build.rs` fails the build immediately.
:::

## Naming and routing

| Item | Rule |
| --- | --- |
| Plugin id | Globally unique, kebab-case, equal to the directory name; route `/tool/:id` |
| Tool id | `tools[].id`, globally unique; prefer `<plugin-id>` or `<plugin-id>-<feature>` |
| Rust command | Function name = frontend call name, prefixed with `<plugin_id>_` |
| Migration | `migration(scope, version, ...)` with scope = plugin id, version starting at 1 per scope |

## Ordering

- Plugin group order = the smallest `order` in the group.
- Tool order within a group = `order * 1000 + index in the tools array`.
- Default `order` is 100, then alphabetical by directory name.

## Reference implementations

- `plugins/_template/`: the minimal skeleton (used by the scaffolder), demonstrating the directory conventions and page structure.
- `plugins/hello-world/`: the full path (commands, logging, database, forms, tables, tasks, notifications, multi-window).
- `plugins/system/`: a pure-frontend plugin (no backend, just tables and dialogs).

Next: [Create a plugin](/en/plugins/create/) and the [plugin.json manifest](/en/plugins/manifest/).
