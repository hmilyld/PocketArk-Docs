---
title: Create a plugin
description: Generate a skeleton interactively or copy the template, then build your first tool in two steps.
---

The recommended way is the interactive scaffold (it fills in the id / name / icon and any optional
backend, settings or database parts):

```bash
pnpm create-plugin
```

Or copy the template by hand:

```bash
cp -r plugins/_template plugins/my-tools
```

Then edit `plugins/my-tools/plugin.json`:

```json
{
  "id": "my-tools",
  "name": "My Tools",
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

Rewrite `frontend/views/Tool.vue` — done. Sidebar navigation, routing, titles, the enable/disable
toggle, the settings panel, the error boundary and KeepAlive all work automatically, **with no manual
registration**.

## Reference implementations

These examples all live in the `hello-world` plugin (available until you delete it):

| Goal | File |
| --- | --- |
| Call Rust commands, read/write SQLite | `frontend/views/Tool.vue` (full Rust integration) |
| Table + pagination + dialog CRUD + import/export | `frontend/views/TableTool.vue` |
| Form controls and validation | `frontend/views/FormTool.vue` |
| Make an HTTP request and show the result | `frontend/views/HttpTool.vue` |
| Layout and the empty / loading / error states | `frontend/views/TemplateTool.vue` |

:::tip[Change the command prefix in the template]
After copying `_template`, rename the command prefix from `template_xxx` to `<new-plugin-id>_xxx`,
otherwise it collides with the template commands and `build.rs` fails the build.
:::

Next: review [plugin.json fields](/en/plugins/manifest/), or write the [frontend view](/en/plugins/frontend/).
