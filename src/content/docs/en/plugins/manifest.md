---
title: plugin.json manifest
description: "All plugin.json fields: metadata, tool entries, entry declarations and migration bridging."
---

`plugin.json` is a plugin's single source of truth, shared by both the frontend and backend scanners.

## Top-level fields

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Plugin id, globally unique, kebab-case, **must equal the directory name** |
| `name` | yes | Plugin group display name (sidebar group title) |
| `description` | no | Plugin description |
| `group` | no | Explicit group name; otherwise grouped by `order` |
| `order` | no | Sort weight, default 100; group order uses the smallest `order` |
| `keywords` | no | Keyword array for global search |
| `legacyMigrations` | no | Old global version → new local version migration bridge |

## tools[] entries

A plugin may declare multiple tools, each with independent navigation, toggle and settings tab:

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Tool id, globally unique, route `/tool/:id` |
| `name` | yes | Tool display name |
| `description` | no | One-line description |
| `icon` | yes | lucide icon name (e.g. `Rocket`, `Table`) |
| `entry` | yes | Page entry, **relative to the plugin directory and including the `frontend/` prefix**, e.g. `frontend/views/Tool.vue` |
| `keepAlive` | no | Default `true`; set `false` to drop the cache and reset on return |

## settings

Declare the settings panel entry:

```json
{
  "settings": {
    "entry": "frontend/settings/Settings.vue"
  }
}
```

## A complete example

```json
{
  "id": "hello-world",
  "name": "Example Plugin",
  "description": "Demonstrates the full plugin chain: Rust commands, SQLite, logging, HTTP, layout",
  "group": "Examples",
  "keywords": ["demo", "example"],
  "order": 1,
  "legacyMigrations": { "1": 1, "2": 2 },
  "tools": [
    {
      "id": "hello-world",
      "name": "Example Tool",
      "description": "Rust command calls, logging and SQLite notes",
      "icon": "Rocket",
      "entry": "frontend/views/Tool.vue",
      "keepAlive": true
    }
  ],
  "settings": { "entry": "frontend/settings/Settings.vue" }
}
```

:::note[Entry paths]
Both `tools[].entry` and `settings.entry` are **relative to the plugin directory** and **include the
`frontend/` prefix**. A wrong path fails the build with a missing-page error.
:::
