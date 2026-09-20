---
title: Design spec · Shared core
description: The single source of truth for UI — principles, tokens, component semantics, three states, copy and anti-patterns.
---

> This page is the project-wide **single source of truth** for UI. Platform differences live in
> [macOS platform](/en/design/macos/) and [Windows platform](/en/design/windows/); per-control
> Do/Don't live in the [component appendix](/en/design/appendix/).
>
> **References** (checkable during review): Apple *Human Interface Guidelines* (macOS), Microsoft
> *Windows app design (Fluent / WinUI 3)*, JetBrains *UI Guidelines*; GNOME / KDE HIG for reference.

## 0. Scope and enforcement

- Applies to **all frontend UI** in `src/` (shell, settings, sample plugins) and `plugins/` (every tool plugin).
- Enforcement (all required):
  1. this page + platform docs + appendix: the basis for design and review;
  2. the **token layer** (`src/assets/index.css`): every visual value must come from a token, no arbitrary values;
  3. **`pnpm lint`**: `scripts/lint-design.mjs` machine-checks legacy recipes (see §6);
  4. the **PR review checklist** (§7): self-check on every change.
- "Must / never" here are hard constraints; "prefer" can be traded off per case, with a written reason in the PR.

## 1. Design principles

The intersection of HIG *Design principles*, Fluent *Design principles* and JetBrains, with concrete criteria for this project.

| Principle | Criterion |
| --- | --- |
| **Clarity first** | One main task per screen; hierarchy through order, spacing and contrast, not decoration; as few settings as possible, offered next to the task |
| **Immediate feedback** | Interaction responds on pointer-down; no spinner for <1s operations; long tasks are cancellable with progress; errors explained in place (no modal, no apology) |
| **Forgive over confirm** | If it can be undone, don't block; only irreversible, high-consequence actions use an Alert |
| **Keyboard reachable** | Everything is keyboard-operable; focus is visible and ordered; shortcuts are visible in the UI; Esc closes overlays, Enter triggers the default action |
| **Restrained decoration** | Color for semantics and interaction only; material for layering only; motion only to explain cause; no box-in-box (express grouping with padding and alignment) |

## 2. Token system

### 2.1 Spacing scale

Base grid **4px**, only these steps:

| Token | Value | Typical use |
| --- | --- | --- |
| `--space-2xs` | 4 | icon and text, badge padding |
| `--space-xs` | 8 | between controls, inline elements, buttons |
| `--space-sm` | 12 | control and label, content blocks, compact card padding |
| `--space-md` | 16 | card / panel padding, surface and content |
| `--space-lg` | 24 | between modules, between groups |
| `--space-xl` | 32 | page-level sections |

Window content margin: compact 16 / regular 20. Do not mix free values like `space-y-3/4/6`; use the
scale semantics, checked by lint.

### 2.2 Radius (two steps + overlays)

| Level | Value | Tailwind | Use |
| --- | --- | --- | --- |
| Control | **6px** | `rounded-md` | buttons, inputs, selects, segmented controls, switch tracks, tags |
| Container | **8px** | `rounded-lg` | panels, cards, grouped lists, dialog body |
| Overlay | **12px** | `rounded-xl` | menus, dropdown panels, popovers, toasts, large tooltips |
| Pill | `9999px` | `rounded-full` | badges, avatars, slider thumbs |

Implementation: set `--radius` to **8px**; shadcn's derived rules give `md=6 / lg=8 / xl=12` with **no
component class changes**. `rounded-xl` is forbidden outside overlays (lint-enforced).

### 2.3 Type and weight

Keep the three user font sizes (root 13 / 14 / 15, `--app-font-size`); base step = regular (14px).

| Semantics | Token / Tailwind | Regular | Small | Large | Reference |
| --- | --- | --- | --- | --- | --- |
| Body / list primary text | `text-sm` | 12.9 | 12 | 13.8 | macOS Body 13 · Fluent Body 14 |
| Secondary / label / caption | `text-xs` | 11.8 | 11 | 12.7 | macOS Subheadline 11 · Fluent Caption 12 |
| Page / panel title | `text-base` | 14 | 13 | 15 | macOS Title 3 15 · Fluent Body Strong 14 |
| Numeric / monospace | inherit + `tabular-nums` | — | — | — | tables, coordinates, money, time |

- Line height: body 1.5, titles 1.3, table rows 1.4. Arbitrary values are forbidden.
- Weight: regular 400; secondary emphasis / selected 500; titles 600. 700+ is forbidden.
- **Body text below 12px is forbidden.**

### 2.4 Control heights (two steps + toolbar)

| Step | Tailwind | Small(13) | Regular(14) | Large(15) | Use |
| --- | --- | --- | --- | --- | --- |
| Compact | `h-7` | 22.75 | 24.5 | 26.25 | toolbar / inline buttons, table row actions, small Select |
| Regular | `h-8` | 26 | 28 | 30 | form controls, panel action buttons (default) |
| Elevated | `h-9` | 29.25 | 31.5 | 33.75 | primary actions, page-level inputs (sparingly) |

Heights are always expressed in **rem (scaling with font size)**, never hard-coded px. Icon buttons
match the same-step height (`size-7/8/9`); row height: compact 32 / regular 36.

### 2.5 Surfaces and semantic color

Surface enumeration (no arbitrary transparency such as `bg-muted/30`, `bg-muted/50`, `bg-muted/80`):

| Layer | Token | Use | Nesting |
| --- | --- | --- | --- |
| base | `bg-background` | window floor | — |
| card | `bg-card` | panel / card / grouped list | yes (adjacent, never same layer) |
| raised | `bg-popover` | overlays (menu / dialog / toast) | above base / card |
| inset | `bg-muted` | input well, code block, read-only area | inside card |
| sunken | `--surface-sunken` | empty / placeholder floor | inside card |
| console | `bg-console` / `text-console-foreground` | log / terminal output | standalone, the only dark area |

- **At most two surface levels per screen**: base → card (+ inner inset). No card-in-card; use a
  **divider + title + spacing** for subgroups.
- Color semantics: `primary` (accent) is **only for interactive controls and selected states**;
  `destructive / success / warning / info` only for their semantics. One color must not mean two things.
- No accent color on translucent layers (put color on opaque layers, not on the glass foreground).
- **Sole exception**: the home Hero may use low-saturation `primary` decoration; nothing else may.

### 2.6 Borders and dividers

- Every border / divider is a **1px hairline** (`border` = `--border`); do not mix in `border-border` (lint-enforced).
- **No box-on-box borders**: when a container already has a border, separate inner items with `divide-y` or `border-t`.
- Tables: data rows use `divide-y` (no vertical lines); header `border-b` + sticky; zebra striping to emphasize rows.
- Focus uses `ring` (§2.9), **never a border-color change**.

### 2.7 Motion

| Token | Value | Reference | Use |
| --- | --- | --- | --- |
| `--dur-fast` | 120ms | Fluent 83ms | hover, press, color / opacity changes |
| `--dur-base` | 200ms | Fluent 167ms | expand / collapse, tab switch, popover in / out |
| `--dur-slow` | 300ms | Fluent 250ms | dialogs, page transitions, large material in / out |

- Easing: in `cubic-bezier(0.22, 1, 0.36, 1)`; out `cubic-bezier(0.4, 0, 1, 1)`.
- Animate only `transform` and `opacity` (plus `backdrop-filter`); **never** `width / height / top / left`.
- `prefers-reduced-motion: reduce` → replace movement / scale with a 200ms cross-fade.
- The reka popper positioning wrapper's `transition-duration: 0s` exception must stay (a measurement drift fix).

### 2.8 Material (vibrancy)

Allowed regions **only**: sidebar, toolbar / title bar, overlays (menu / dialog / toast / tooltip).
**Forbidden**: scroll content, tables, forms, card bodies.

- macOS → `NSVisualEffectView` semantic materials (see [macOS platform](/en/design/macos/)).
- Windows → `Mica` / `Mica Alt` window base, `Acrylic` overlays (see [Windows platform](/en/design/windows/)).
- **An opaque fallback is mandatory**: `prefers-reduced-transparency: reduce`, user-disabled
  transparency, Windows battery saver / low-end hardware / inactive window → fall back to `bg-card` /
  `bg-background`.
- At most 2 material regions per screen; never stack material on material; primary text on material
  uses `text-foreground` (not `text-muted-foreground`).

### 2.9 Focus and keyboard

- Focus ring (**the only expression**): `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/60`,
  following the control radius; **`focus-visible` is always visible**; `outline-none` with no replacement
  is forbidden (lint R6).
- Every custom interactive element must be focusable (`tabindex="0"`), have a `role` and a readable
  name, and respond to Enter / Space.
- Composite keyboard semantics: segmented `role="tablist"` + ←/→; list / table rows ↑/↓ + Enter;
  menus / selects ↑/↓ cycle, Esc closes and restores focus.
- Global shortcuts: `⌘,` settings · `⌘K` command palette · `⌘F` find · `⌘W` close window ·
  `⌘Z / ⇧⌘Z` undo / redo · `⌘1..9` switch sidebar group · `Esc` close overlay. Shortcuts must be visible.

### 2.10 Icons

- Only `@lucide/vue`; three sizes: **14 (inline) / 16 (buttons, menus) / 20 (toolbar, empty state)**; stroke width 2.
- Alongside text use `gap-2`, baseline-aligned.
- Icon buttons **must** have `aria-label` + tooltip.
- Icons do not carry state color and never stack to express one action.

## 3. Component semantics (what to use when)

| Situation | Use | Not |
| --- | --- | --- |
| 2–5 mutually exclusive options, persistent selection | **Segmented** | a row of switches, a select |
| 6+ mutually exclusive options / tight space | select (pop-up button) | segmented |
| Fine-grained boolean setting | **checkbox** (title on the right) | switch |
| Emphasis switch / a whole group's switch | **switch** (mini size inside grouped forms) | checkbox |
| Numeric nudge | input + stepper | slider |
| Instant search / filter | `SearchField` (magnifier, clear, search-as-you-type) | plain input + button |
| Irreversible dangerous action | `Alert` (safe default button, destructive marked red) | plain confirm dialog, toast |
| Reversible action | execute + status hint (+ undo entry) | confirm dialog |
| Long task (>1s) | progress bar / ring + cancel | spinner overlay |
| Page-level load (>300ms before content) | skeleton | spinner overlay |
| Result / log output | read-only text block (`bg-console` only for logs) | editable input |

Button hierarchy: **at most one primary button per view** (`default`); then `secondary`; `ghost` for
panel-header actions; `destructive` only for destructive actions, with an Alert confirmation.

## 4. Three states and feedback

**Empty**: icon (20) + one headline + one description + one action button; never a blank page.
**Loading**: show nothing under 1s; 1–10s skeleton or progress bar; over 10s must be cancellable with progress.
**Error** (three-way split):

| Situation | Presentation |
| --- | --- |
| Form / in-tool error with a location | **in place**: `text-xs text-destructive` under the control; multi-field errors add a top error bar |
| Current action failed with a clear retry | error bar inside the tool panel (`border-destructive/30 bg-destructive/10`) + retry button |
| Background task / system failure (no location) | `toast.error` (the only place a toast may report errors) |
| Success | **no toast**: express via state change; info toast only for a finished long task |

Recoverable notices use `info` / `warning` bars, not toasts. Error copy states what happened and what
to do next; no apology and no "something went wrong".

## 5. Copy guidelines

- **Buttons use verbs** (save, export, choose again); keep one name per action; no trailing period.
- Buttons that open an overlay / dialog end with an ellipsis (`More options…`); immediate actions do not.
- Terminology:

| Use | Not |
| --- | --- |
| tool / plugin | app, feature module |
| module panel / panel | card, block |
| settings | config, preferences, options page |
| export / import | save as, download |
| worksheet (Excel) | sheet, tab |
| header row | column names, header |

- Numbers and units: right-aligned + `tabular-nums`; a space between value and unit (`5 MB`); time as `yyyy-MM-dd HH:mm`.
- Error copy does not apologize or use cute wording; placeholders say what can go in.

## 6. Anti-patterns (lint catches the machine-checkable ones)

| Anti-pattern | Requirement |
| --- | --- |
| Two card recipes coexisting | unify on `rounded-lg border bg-card` (§2.2 / §2.6) |
| Arbitrary transparency (`bg-muted/30`, …) | use the surface enumeration (§2.5) |
| `rounded-xl` outside overlays | only overlays may use `xl` (§2.2) |
| Mixed error feedback | the three-way split (§4) |
| Keyboard unreachable | custom interactive elements must be focusable + have a role (§2.9) |
| Hand-rolled segmented control | use `Segmented` (§3) |
| Icon button without a hint | tooltip + `aria-label` (mandatory, §2.10) |
| Free spacing | use the spacing scale (§2.1) |
| Global motion suppression | motion tokens (§2.7) |
| Card-in-card | divider + title + spacing inside one container (§2.5) |

## 7. PR review checklist

1. Do all new / changed visual values come from tokens (no arbitrary values, no hard-coded px)?
2. At most two surface levels per screen (no card-in-card)? Borders not stacked?
3. Is every module wrapped in a `Panel` (or a platform equivalent), with none exposed?
4. Does the boolean / exclusive control choice follow §3?
5. Are the loading / empty / error states all present, with errors following the §4 three-way split?
6. Keyboard: sensible Tab order, visible focus, correct Esc / Enter semantics, shortcuts visible?
7. Do icon buttons have `aria-label` + tooltip? Are glyphs and sizes from the three steps?
8. Does the copy follow §5 (verbs, terminology, punctuation, units)?
9. Does it survive light / dark, all three font sizes, and widths 760 / 1080 / 1440?
10. Do platform differences stay within the allowed points (material / window shell / menu / dialog semantics / focus visuals / radius)?
