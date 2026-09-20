---
title: Design spec · Component appendix
description: Per-control Do/Don't, reka-ui pitfalls, and a scriptable design-walkthrough workflow.
---

> Shared rules live in [Shared core](/en/design/overview/); platform differences in
> [macOS](/en/design/macos/) / [Windows](/en/design/windows/). This page holds the **per-control
> Do/Don't**; register a new control here before implementing it.

## 1. Facade components

| Component | Based on | Responsibility |
| --- | --- | --- |
| `Panel` | framework `tool/Panel.vue` | module panel (frame + header bar + body) |
| `SettingsSection` / `SettingsRow` / `SettingsField` | `@/components/settings` | group + row + field |
| `EmptyState` / `LoadingState` / `ErrorState` | `@/components/native` | three-state standards (icon 20 + copy + action) |
| `FormRow` | `@/components/native` | label + control + **inline validation** |
| `ListRow` | `@/components/native` | list row: primary + secondary text + trailing control |
| `SearchField` | `@/components/native` | magnifier + clear + search-as-you-type |
| `Segmented` | `@/components/native` | 2–7 exclusive options with ←/→ keyboard semantics |

`Toolbar` / `SidebarList` / `PopUp` / `ToggleRow` / `StatusBar` / `ProgressBar` / `AlertDialog` are
**planned**; implement per §2 when needed and backfill this table.

## 1.5 Known pitfalls (reka-ui 2.10 + shadcn-vue)

- **`data-active:` / `data-inactive:` variants are dead rules**: reka's `TabsTrigger` only emits
  `data-state="active|inactive"`. Always style with `data-[state=active]:`.
- **`TabsList` horizontal height is pinned by the group variant**:
  `group-data-[orientation=horizontal]/tabs:h-9` cannot be overridden by a plain `h-*`; use an inline style.
- **Do not reinstate global transition suppression**: `transition-duration: 75ms !important` is
  removed; motion uses tokens. The reka popper wrapper's `transition-duration: 0s` exception must stay.

## 2. Per-control Do / Don't

### Buttons

| Do | Don't |
| --- | --- |
| One primary button per screen (`default`), the rest `secondary` / `ghost` | several `default` buttons competing |
| `ghost` only for panel-header / toolbar actions | `ghost` as the primary action |
| Two height steps (`h-8` regular / `h-7` compact), icon `size-3.5` + `mr-1` | mixing `h-9` with other sizes (except a page-level primary action) |
| Destructive actions as `destructive` + Alert confirmation | red for "cancel" or ordinary actions |
| Verb labels matching the outcome (`Export` → "Exported") | generic `OK` / `Submit` / `Run` |

### Inputs / textareas

| Do | Don't |
| --- | --- |
| `FormRow` provides label + hint + inline validation | placeholder only, no label |
| Fixed height + scroll on overflow | auto-grow causing layout jumps |
| Right-aligned numeric input + `tabular-nums` | left-aligned, non-tabular numbers |
| Validate in place (`text-xs text-destructive` under the control) | error only in a toast, or only after submit |
| Monospace for code / paths / keys | monospace for body text |

### Select / segmented / checkbox / switch / search

| Do | Don't |
| --- | --- |
| 2–5 exclusive → segmented; ≥6 → select | a row of switches for exclusive options |
| Fine-grained boolean → checkbox (title on the right) | fine-grained boolean as a switch |
| Mini switch in grouped forms (`size="sm"`) | a large switch breaking row height |
| A switch shares the row with its title (`SettingRow`) | `justify-between` pulling title and switch apart |
| Search field searches as you type + clear button | search field with a "Search" button |
| Fixed select width (control column aligned) | varying widths, ragged left edges |

### Panels / groups / list rows

| Do | Don't |
| --- | --- |
| Wrap every module in `Panel`; header bar + body `p-4` | modules exposed on the page |
| Subgroups inside one container via `divide-y` + small title + spacing | card-in-card, box-in-box |
| Row: primary + secondary (`text-xs` gray) + trailing control | three or more lines of explanation per row |
| Rows are keyboard-focusable (`tabindex` + role) | mouse-only rows |

### Overlays (menu / dialog / toast / tooltip)

| Do | Don't |
| --- | --- |
| Radius 12 (8 on Windows), consistent shadow + 1px stroke | inconsistent radii / shadows |
| Esc closes and restores focus to the trigger | focus lost on close |
| Menu items ≥24px tall, icons 16, dangerous item last and separated | cramped items, dangerous item next to normal ones |
| Tooltip for supplementary text only (icon buttons, truncated text) | Tooltip carrying must-read info |
| Toast only for system-level failures / finished long tasks | using a toast for form validation |

### Tables / data areas

| Do | Don't |
| --- | --- |
| `divide-y` rows, sticky header, right-aligned numbers | boxed rows, centered numbers |
| `EmptyState` for no data | a blank table |
| Opaque background in scroll areas (no glass) | material over tables |
| Horizontal scroll + sticky first column when wide | squeezing columns until text wraps |

### Three states

| Do | Don't |
| --- | --- |
| Empty: icon (20) + headline + description + action | a bare "No data" |
| <1s no loading; 1–10s skeleton; >10s progress + cancel | a spinner overlay for everything |
| Error bar: cause + next step + retry | "Something went wrong" with no information |

## 3. Icons and shortcuts

| Do | Don't |
| --- | --- |
| Sizes 14/16/20, stroke 2 | a custom icon size per page |
| Icon buttons always have `aria-label` + tooltip | bare icons with no hint |
| Shortcuts visible in menu items / hints (`⌘K` / `Ctrl+K` per platform) | hidden shortcuts documented only |

## 3.5 Design-walkthrough workflow (self-served screenshots)

The web layer renders in a normal browser (the preview bridge emulates the Tauri API), so screenshots
can be scripted:

```bash
npx vite                                    # start the frontend (1420)
node scripts/design-shot.mjs \
  --url "/tool/hello-table" --out /tmp/a.png \
  --theme dark --font 14 [--platform win] \
  [--eval "document.querySelector('button').click()"]   # interact before shooting
```

- Preview bridge `src/dev/preview-bridge.ts`: active only under `import.meta.env.DEV` and outside
  Tauri; implements the `__TAURI_INTERNALS__` protocol + a localStorage `plugin-store` + framework command fixtures.
- A plugin's own business-command fixtures live in `plugins/<id>/frontend/preview.ts` (**default
  export** `Record<commandName, returnValue>`), merged automatically in dev preview; base ships none.
- URL params: `?theme=light|dark`, `?font=13|14|15`, `?accent=<name>`, `?platform=win`.
- Use it to check spec clauses per screen and verify overlays / focus / three states; **native window
  shell and material still need real-machine confirmation**.

## 4. Rollout status

Base ships only `_template` / `hello-world` / `system`, all already brought up to this spec.
**A fork's own plugins follow the same checklist batch by batch, tracked by each fork** (the framework
does not need to know fork plugin names). After each batch: `pnpm lint && pnpm build && pnpm test`,
then self-check against Shared core §7; Rust batches additionally run
`pnpm fmt:rs && pnpm lint:rs && pnpm test:rs`.
