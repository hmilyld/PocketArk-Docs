---
title: Design spec · Windows
description: Platform layer (Mica / Acrylic, custom title bar, Fluent geometry and motion), with a machine-verification checklist.
---

> This page covers **Windows platform differences only**. Shared rules live in
> [Shared core](/en/design/overview/); macOS in [macOS platform](/en/design/macos/).
> Based on Microsoft's *Windows app design (Fluent / WinUI 3)*.

:::caution[Verification status]
This platform layer has **not been visually verified** (the dev machine is macOS). All values come from
official docs and are landed as "statically correct"; screenshots and deviations must be backfilled
after the first Windows verification.
:::

## 1. Window shell

| Item | Rule | Basis |
| --- | --- | --- |
| Title bar | Custom-drawn (`set_decorations(false)`), height **32px** | standard title bar 32px |
| Window icon | Left, vertically centered (8px top/bottom at 32px); click opens the system window menu, double-click closes | Title bar behavior |
| Title text | Left, `text-sm`, centered in 32px; "App — Page" | Title bar |
| Title bar buttons | Right, width **46px**, height 32px; close hover uses `#C42B1C` (system semantic red) | Fluent caption button size |
| Drag region | All of the title bar except buttons; **double-click blank area maximizes / restores** | system behavior |
| Window radius | Handled by the system (Win11 8px); **no radius when snapped** — do not draw it yourself | Geometry |

## 2. Material (Mica / Acrylic)

| Region | Material | Tauri `effects` | Fallback (required) |
| --- | --- | --- | --- |
| Window base + title bar | **Mica Alt** | `tabbed` | opaque `bg-background` |
| Simple window without nav | Mica | `mica` | opaque `bg-background` |
| Overlays (menu / drop-down / flyout) | Acrylic | `acrylic` (or in-overlay CSS glass) | opaque `bg-popover` |

**Official degradation conditions (all must be covered)**: user disables "transparency effects",
battery saver, low-end hardware, inactive window, older Windows → always fall back to opaque.
Implementation: CSS `prefers-reduced-transparency`; Rust skips requesting material when detection
fails; for inactive windows use a CSS equivalent class or JS focus listener to switch to opaque.

- On Windows the sidebar belongs to the **content layer**, so it does **not** use Acrylic: opaque
  `bg-sidebar` over a Mica Alt window base.
- As on macOS: material only in these regions; no blur on scroll content / tables / forms; at most 2 material regions.

## 3. Geometry and spacing (overriding shared values)

Fluent geometry: **top-level container 8px / in-page element 4px / line intersections 0px**, so Windows
overrides the shared radii:

```css
[data-platform='win'] {
  --radius-md: 4px; /* in-page controls: buttons, inputs, selects, segmented */
  --radius-lg: 8px; /* containers: panels, cards, dialogs */
  --radius-xl: 8px; /* overlays: Fluent top-level container is also 8px */
}
```

Spacing (same scale as shared, same values on Windows):

| Relationship | Value |
| --- | --- |
| Between buttons | 8 |
| Button and drop-down | 8 |
| Control and group title | 8 |
| Control and label | 12 |
| Content blocks | 12 |
| Surface and content | 16 |

## 4. Type (Fluent type ramp mapping)

| Fluent style | Size / line height | This project |
| --- | --- | --- |
| Title | 28/36 · 20/28 | page title ceiling (large `text-base` or `text-lg`, sparingly) |
| Subtitle | 20/28 (semibold) | settings section title |
| Body Strong | 14/20 (semibold 600) | panel title, row-title emphasis |
| Body | 14/20 | body, list primary text (`text-sm` at regular) |
| Caption | 12/16 | secondary text, labels (`text-xs`) |

- Fonts: `Segoe UI Variable`; weights still only 400 / 500 / 600.
- **Readability floor**: body at least 14 Regular / 12 Semibold; below that is forbidden → the small
  step must be ≥12.
- Casing: sentence case; no all-caps titles.

## 5. Motion (Fluent standard durations and curves)

| Semantics | Fluent value | `win` override here |
| --- | --- | --- |
| Control normal (expand / toggle / color) | 250ms | `--dur-slow: 250ms` |
| Control fast (hover / press) | 167ms | `--dur-base: 167ms` |
| Faster (instant feedback) | 83ms | `--dur-fast: 83ms` |
| In curve | Fast Out, Slow In `cubic-bezier(0, 0, 0, 1)` | same |
| Out curve | Fast In, Slow Out `cubic-bezier(1, 0, 1, 1)` | same |

Otherwise the same as shared §2.7 (only transform / opacity, reduced-motion cross-fade).

## 6. Elevation (shadow and stroke)

| Layer | Elevation | Stroke |
| --- | --- | --- |
| Window | 128 | 1px |
| Dialog | 128 | 1px |
| Flyout / menu / popover | 32 | 1px |

On Windows overlay shadows use `--shadow-flyout` + `border` (1px); dialogs use `--shadow-dialog` + 1px.
**Shadow and stroke always come in pairs**; shadow without a stroke is not allowed.

## 7. Focus and keyboard

- Focus visual: a **2px double stroke** (visible on any background), following the control radius; no colored halo.
- Keyboard: `Ctrl` instead of `⌘`; `Alt` focuses the in-window command area; `Esc` closes overlays and dialogs.
- Shortcut mapping:

| Action | macOS | Windows |
| --- | --- | --- |
| Settings | `⌘,` | `Ctrl+,` |
| Command palette | `⌘K` | `Ctrl+K` |
| Find | `⌘F` | `Ctrl+F` |
| Close window | `⌘W` | `Ctrl+W` |
| Quit | `⌘Q` | `Alt+F4` |
| Undo / redo | `⌘Z` / `⇧⌘Z` | `Ctrl+Z` / `Ctrl+Y` |
| Switch sidebar group | `⌘1..9` | `Ctrl+1..9` |
| Full screen | `⌃⌘F` | `F11` |

Display shortcuts per platform (`Ctrl+K` / `⌘K`), provided by `core/platform.ts`.

## 8. Commands and menus (Windows has no menu bar)

On Windows `set_decorations(false)` hides the native menu bar, so "every toolbar command must have a
menu item" has no counterpart. Instead:

- **In-window CommandBar**: primary commands on the right of the title bar or the left of the toolbar
  plus a **"More" overflow menu** (low-frequency commands go into overflow).
- **Settings entry**: the last item of the "More" overflow menu, or directly on the toolbar if
  discoverability matters.
- **Right-click context menus**: actions for the selected object (table rows, list items).
- Every command must have a keyboard path (`Ctrl+*` or `Alt+*`); mouse-only is not allowed.

## 9. Dialogs and feedback

- **Dialog type**: Windows uses ContentDialog (in-window modal) and **has no sheet concept**; do not
  imitate the macOS attached sheet.
- **Button order**: primary action on the **left**, `Cancel / Close` on the **right** (opposite of
  macOS); destructive primary buttons use the system safety / destructive color and state the
  consequence in the label.
- Irreversible, high-consequence actions → a confirmation dialog; reversible actions execute directly
  with an undo entry.
- InfoBar semantics: recoverable problems use a bar (`info` / `warning` / `error`, with dismiss and
  action), not a toast; system-level failures use a toast.
- Success feedback follows shared §4 (no toast, express via state change).

## 10. Settings page

- Keep it simple and binary (on / off) where possible; complex parameters belong on the feature's own
  page, not piled into settings.
- Settings apply **immediately**; no apply / OK button.
- Section titles use the Subtitle style (`text-sm` / 600); groups use a card + `divide-y` (no box-in-box).

## 11. Machine-verification checklist

1. Title bar 32px + 46×32 buttons + window icon and menu behavior;
2. Mica Alt / Acrylic working and all degradation paths;
3. double-stroke focus visual;
4. CommandBar and overflow menu, settings entry position;
5. dialog button order (primary on the left);
6. `Ctrl` key display and `Alt` command-area focus;
7. 4px / 8px radius overrides in effect;
8. layout does not break at each font-size step.

Once any item is verified, update the "Verification status" note on this page.
