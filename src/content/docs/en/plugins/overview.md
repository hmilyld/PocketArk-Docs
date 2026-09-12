---
title: The plugin system
description: Plugin directory structure, build-time auto-registration, and the naming and scope rules you must follow.
---

Every tool in PocketArk is a **plugin**: one directory is one plugin, with frontend and backend side
by side. `plugin.json` is the single source of truth.

## Directory structure

```text
plugins/<plugin-id>/
├── plugin.json          # manifest (single source of truth; shared by both scanners)
├── README.md
├── frontend/            # frontend
│   ├── views/           # tool pages (one file per tools[] entry)
│   ├── settings/        # settings panel (optional)
│   ├── components/      # plugin-private components (optional)
│   ├── composables/     # composables (optional)
│   ├── schema.ts        # database tables (optional, auto-aggregated)
│   ├── setup.ts         # lifecycle hooks (optional, auto-scanned)
│   └── shared.ts        # shared constants / helpers (optional)
└── backend/             # backend (optional)
    ├── mod.rs           # Rust commands (#[tauri::command]) + `pub mod migrations;`
    ├── migrations.rs    # migrations: exports `pub fn all() -> Vec<Migration>` (optional)
    └── *.rs             # other backend code / assets
```

Directories starting with `_` or `.` are not registered (e.g. the `_template`).

## Build-time auto-registration

Adding a plugin requires **no registration in any framework file**:

- **Frontend**: Vite scans `plugins/*/frontend/**` — `views` / `settings` / `setup.ts` / `schema.ts`
  are aggregated. Navigation, routing, titles, enable/disable toggles, the settings panel, the error
  boundary and KeepAlive all work automatically.
- **Backend**: `src-tauri/build.rs` scans `plugins/*/backend/mod.rs`, parses its `#[tauri::command]`
  functions to register them, reads `backend/migrations.rs` to aggregate migrations, and generates the
  `plugins/mod.rs` include and the `generate_handler!` list.

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

Next: [Create a plugin](/en/plugins/create/) and the [plugin.json manifest](/en/plugins/manifest/).
