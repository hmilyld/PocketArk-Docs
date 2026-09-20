---
title: Settings panels
description: Unify settings-page UI with SettingsSection / SettingsRow / SettingsField, and read/write config with useToolSettings.
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

In `frontend/settings/Settings.vue`, use `useToolSettings` to read/write config:

```ts
const config = useToolSettings<MyConfig>('timestamp-tool', { format: 's' });

config.value.format = 'ms'; // persists automatically on change
```

Config lives in the `tools.<toolId>` namespace of `settings.json` and is **deep-merged** with
defaults — new fields automatically get their defaults, with no migration.

## 3. Unified settings UI

The system settings page and every plugin settings panel use `@/components/settings`'s
`SettingsSection` / `SettingsRow` / `SettingsField` (single source of truth, matching the system
settings page). Do not invent section titles or card styles:

```vue
<template>
  <div class="space-y-6">
    <SettingsSection title="Section title" description="Optional description">
      <SettingsRow title="Setting title" description="One-line description">
        <Switch v-model="…" />
        <!-- trailing control; widths w-40 / w-64 / w-72 -->
      </SettingsRow>
      <!-- dense numeric fields: use grid + SettingsField inside SettingsSection -->
    </SettingsSection>
  </div>
</template>
```

- Fine-grained booleans use a checkbox; emphasis / whole-group switches use a switch (mini `size="sm"`
  inside grouped forms).
- Settings apply **immediately**; there is no apply / OK button.

Reference implementation: `hello-world/frontend/settings/Settings.vue`.

:::caution[Do not create a separate store]
Plugin config always goes through `useToolSettings(toolId, defaults)`. Do not create your own file or
key, or it falls outside settings import / export and reset.
:::
