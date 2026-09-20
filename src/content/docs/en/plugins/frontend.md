---
title: Frontend pages and layout
description: Wrap pages in ToolShell, modules in Panel, and organize centered columns and splits with native Tailwind 12-grid.
---

All UI visuals and interactions also follow the [design spec](/en/design/overview/) (tokens, component
semantics, three states, copy, anti-patterns).

## ToolShell

Wrap every tool page in `@/components/tool/ToolShell`; it provides a **page header**
(title / description / action buttons) and a **full-width content area**:

```vue
<template>
  <ToolShell title="My tool" description="Description">
    <template #actions>
      <Button>Action</Button>
    </template>

    <!-- content fills the width -->
  </ToolShell>
</template>
```

- Props: `title`, `description`
- Slots: `actions`, default

## Wrap every module in Panel

Every functional module on a page (settings / input / output / result / list) must be wrapped in
`@/components/tool/Panel` (frame + header-bar title + top-right actions + body). Never expose a module
on the page, and never nest a card inside a Panel — previews, tables and the like carry no frame of
their own; the frame belongs to the Panel.

```vue
<Panel title="Input">
  <template #actions>
    <Button size="sm" variant="ghost"><Trash2 class="size-3.5" />Clear</Button>
  </template>
  <!-- body defaults to space-y-3 p-4; override with body-class for full-bleed -->
</Panel>
```

- Header title `text-xs font-medium text-muted-foreground`; action buttons `size="sm"`, icons `size-3.5`.
- Error bars use `rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive`.

## Lay out with the native grid

Centered columns and splits use the native Tailwind grid directly (`grid grid-cols-12` +
`col-start-*` / `col-span-*`). **Do not invent a custom grid**, and do not use an `mx-auto max-w-*`
centered container.

```vue
<ToolShell title="My tool" description="Description">
  <div class="grid w-full grid-cols-12 gap-4">
    <div class="col-span-12 lg:col-start-3 lg:col-span-8">
      <!-- centered 8 columns; full width below lg -->
    </div>
  </div>
</ToolShell>
```

Common steps:

| Situation | Classes |
| --- | --- |
| Full-width table | none (full width by default) |
| Wide content | `col-span-10` |
| Mixed | `col-span-8` |
| Forms / settings | `md:col-start-4 md:col-span-6` |

:::caution[Centered columns need an even span]
12 minus the span must be even to center exactly (e.g. `col-start-3 col-span-8`,
`col-start-4 col-span-6`). An odd span cannot truly center.
:::

## Empty / loading / error states

Use `EmptyState` / `LoadingState` / `ErrorState` from `@/components/native`; the standard usage is in
the "page template" tool (`hello-world/frontend/views/TemplateTool.vue`). Do not invent your own
three-state styles; keep them consistent across the app.

:::note[Convert bare data variants]
New registry components using bare boolean variants like `data-checked:` / `data-open:` must be
converted to `data-[state=...]:` — reka-ui 2.10 only emits the latter.
:::
