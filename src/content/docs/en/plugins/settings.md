---
title: Settings panel
description: Read and write plugin config with useToolSettings and declare the settings entry in plugin.json.
---

## 1. Declare the entry

Declare the settings panel in `plugin.json`:

```json
{
  "settings": {
    "entry": "frontend/settings/Settings.vue"
  }
}
```

## 2. Read and write config

In `frontend/settings/Settings.vue`, use `useToolSettings`:

```ts
const config = useToolSettings<MyConfig>('timestamp-tool', { format: 'seconds' });

config.value.format = 'milliseconds'; // persisted automatically on change
```

Config is stored under the `tools.<toolId>` namespace in `settings.json` and is **deep-merged** with the
defaults — new fields get their defaults automatically, with no migration needed.

Reference: `hello-world/frontend/settings/Settings.vue`.

:::caution[Do not build your own store]
Plugin config always goes through `useToolSettings(toolId, defaults)`. Do not create a separate file or
key, or it falls outside settings import / export and reset.
:::
