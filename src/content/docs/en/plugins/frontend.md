---
title: Frontend views and layout
description: Wrap pages in ToolShell and organize centered columns and split layouts with Tailwind's native 12-column grid.
---

## ToolShell

Wrap every tool page in `@/components/tool/ToolShell.vue`. It provides a **page header** (title /
description / actions) and a **full-width content area**:

```vue
<template>
  <ToolShell title="My tool" description="A short description">
    <template #actions>
      <Button>Action</Button>
    </template>

    <!-- content fills the full width -->
  </ToolShell>
</template>
```

- Props: `title`, `description`
- Slots: `actions`, default slot

## Lay out with the native grid

Organize centered columns and splits inside the page with Tailwind's native grid
(`grid grid-cols-12` + `col-start-*` / `col-span-*`). **Do not invent a custom grid concept**, and do
not use an `mx-auto max-w-*` centered container.

```vue
<ToolShell title="My tool" description="A short description">
  <div class="mx-auto grid w-full grid-cols-12">
    <div class="col-span-12 lg:col-start-3 lg:col-span-8">
      <!-- centered 8 columns; full width below lg -->
    </div>
  </div>
</ToolShell>
```

Common spans:

| Scenario | Classes |
| --- | --- |
| Full-width table | none (full width by default) |
| Wide content | `col-span-10` |
| Mixed | `col-span-8` |
| Forms / settings | `md:col-start-4 md:col-span-6` |

:::caution[Centered columns need an even span]
12 minus the span must be even for exact centering (e.g. `col-start-3 col-span-8`,
`col-start-4 col-span-6`). Odd spans cannot be centered precisely.
:::

## Empty / loading / error states

See the standard three-state pattern in the "Page template" tool
(`hello-world/frontend/views/TemplateTool.vue`). Do not invent your own — keep it consistent app-wide.

:::note[Convert bare data variants]
If a new registry component uses bare `data-checked:` / `data-open:` boolean variants, convert them to
`data-[state=...]:` — reka-ui 2.10 only emits the latter.
:::
