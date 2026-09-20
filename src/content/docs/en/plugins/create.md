---
title: Create a plugin
description: Generate a skeleton interactively, or copy the template manually, and build your first tool in two steps.
---

Prefer the interactive scaffolder (it fills in id / name / icon and the optional backend, settings,
database and lifecycle-hook parts):

```bash
pnpm create-plugin
```

Or copy the template manually:

```bash
cp -r plugins/_template plugins/my-tools
```

Then edit `plugins/my-tools/plugin.json`:

```json
{
  "id": "my-tools",
  "name": "My tools",
  "tools": [
    {
      "id": "my-tools-hello",
      "name": "Hello",
      "description": "My first tool",
      "icon": "Sparkles",
      "entry": "frontend/views/Tool.vue"
    }
  ]
}
```

Now edit `frontend/views/Tool.vue` — done. Navigation, routing, titles, enable/disable toggles, the
settings panel, the error boundary and KeepAlive all work automatically, **with no manual registration**.

The scaffolder generates a skeleton following the [plugin directory conventions](/en/plugins/overview/)
(including `views/`, `settings/`, `components/`, `composables/`, `lib/` and `shared.ts`) that runs
immediately. Then:

1. edit `plugin.json` (id, display name, icon, `tools[].entry`) — the **single source of truth**;
2. implement `frontend/views/*.vue` (UI spec in the [design docs](/en/design/overview/));
3. for backend work add a `#[tauri::command]` in `backend/mod.rs`;
4. to persist data append a migration in `backend/migrations.rs` and define tables in `frontend/schema.ts`;
5. add `README.md` (features) and `AGENTS.md` (dev conventions).

## Reference implementations

The following examples all live in the `hello-world` plugin — browse them before deleting it:

| Goal | File |
| --- | --- |
| Call Rust commands, logging pipeline, read/write SQLite | `frontend/views/Tool.vue` (the Rust integration tour) |
| Table + paging + dialog CRUD + import/export | `frontend/views/TableTool.vue` |
| Form controls and validation | `frontend/views/FormTool.vue` |
| HTTP requests, results display and streaming download | `frontend/views/HttpTool.vue` |
| Background task progress / cancel, notifications, event bus | `frontend/views/TaskTool.vue` |
| Multi-window, open dispatch, shortcuts, platform detection | `frontend/views/SystemTool.vue` |
| Generic CRUD, transaction atomicity, binary file IO | `frontend/views/DataTool.vue` |
| Module Panel + 12-grid layout and the three-state standard | `frontend/views/TemplateTool.vue` |

:::tip[Change the command prefix in the template]
After copying `_template`, change the command prefix from `template_xxx` to `<new-plugin-id>_xxx`, or
it will clash with the template commands (`build.rs` fails the build).
:::

Next: read the [plugin.json fields](/en/plugins/manifest/), or go straight to
[frontend pages](/en/plugins/frontend/).
