---
title: Design spec · macOS
description: Platform layer — window shell, vibrancy materials, density, control semantics, settings panes, menus and shortcuts.
---

> This page covers **macOS platform differences only**. Shared rules live in
> [Shared core](/en/design/overview/); Windows in [Windows platform](/en/design/windows/).
> Based on Apple's *Human Interface Guidelines* (macOS).

## 1. Window shell

| Item | Rule |
| --- | --- |
| Title bar | `titleBarStyle: Overlay` + `hiddenTitle`; content extends into the title bar (unified toolbar) |
| Traffic lights | Fixed space on the left (`x: 10, y: 14`); content must not cover it |
| Title bar height | Toolbar row **40px** (compact unified toolbar), separated from content by a hairline, not a CSS shadow |
| Drag region | The whole title bar / toolbar uses `data-tauri-drag-region`, except buttons |
| Window controls | Use the system traffic lights (never self-drawn); do not add minimize / maximize / close on the toolbar's right |
| Critical info | No critical controls or important info at the bottom (the bottom edge is often off-screen) |

## 2. Material (vibrancy)

`NSVisualEffectView` semantic materials mapped to Tauri `windowEffects` (`tauri.conf.json > app.windows[].windowEffects`):

| Region | Apple material | Tauri `effects` | Blending | Fallback |
| --- | --- | --- | --- | --- |
| Sidebar (nav list) | Sidebar | `sidebar` | behind window | opaque `bg-sidebar` |
| Toolbar / title bar | Header view | `headerView` | behind window | opaque `bg-background` |
| Drop-down / menu | Menu | `menu` (or in-overlay CSS glass) | within window | opaque `bg-popover` |
| Overlay / popover | Popover | `popover` | within window | opaque `bg-popover` |
| Dialog (sheet) | Sheet | `sheet` | within window | opaque `bg-card` |

- `state` should be `followsWindowActiveState`: material lightens when the window loses focus.
- **Respect `Reduce Transparency`**: switch to opaque layers when `prefers-reduced-transparency: reduce`.
- **Window background contract**: material is enabled by Rust `apply_window_effects()` (macOS
  `underWindowBackground`); once active, `set_window_background` skips the opaque base coat — the
  white-flash guard moves to an **opaque content layer** (`body` is always opaque `bg-background`;
  only chrome is translucent). If material fails to enable, fall back to opaque silently.
- **Layout premise**: the toolbar stays in flow; blur comes from **sticky headers** (`ToolShell`'s
  header and the settings tab bar are `sticky top-0` + material). Do not revert to an absolutely
  positioned toolbar with `main` top padding — it stacks into a visible empty band.
- Do not add custom backgrounds or tinting to the toolbar; no accent color on translucent layers;
  primary text on material uses `text-foreground`.

## 3. Density and controls

| Semantics | This project (three font sizes) | Native macOS |
| --- | --- | --- |
| Regular control height | `h-8` (26/28/30px) | Regular 22pt |
| Compact control height | `h-7` (22.75/24.5/26.25px) | Small 19pt / Mini 16pt |
| List row height | 36 (compact 32) | table row 24pt (list row 32pt) |
| Panel padding | 16 (compact 12) | content margin 20pt (compact 16pt) |

Rule: **forms and tool pages use regular (`h-8`); toolbar, in-row table actions and dense settings use
compact (`h-7`)**; do not mix the three steps within one screen.

## 4. Control semantics (macOS specifics)

- **Switch vs checkbox**: fine-grained booleans use a **checkbox** (title on the right); "emphasis" or
  a whole group's switch uses a **switch**; switches inside grouped forms (`SettingsSection`) use the
  **mini size** (`size="sm"`).
- **Switches only appear in list rows**, where the row provides context; never spread a label and
  switch apart with `justify-between`.
- **Segmented control**: 2–7 tightly related options needing a persistent selected state, and not a
  window-level view switch.
- **Pop-up button**: ≥6 options or long labels; current value shown inside the control (left-aligned + chevron on the right).
- **Search field**: magnifier + left alignment, search-as-you-type, clear button on the right (`SearchField`).

## 4.5 Settings page (pane switching)

- Panes switch via a **toolbar-style horizontal tab bar** (as in Safari / Xcode preferences): stuck
  below the toolbar, same material. **Selected state uses solid `bg-primary` + `text-primary-foreground`**,
  not a low-saturation tint (it washes out on glass). Do not use a left vertical nav (to avoid a third
  column beside the app sidebar).
- Bar `height: auto` + equal `py-1.5`; do not use a fixed height with `items-center`.
- Content is a single centered column (12-grid `col-start-3 col-span-8`); each group uses
  `SettingsSection` + `SettingsRow`.
- Settings apply **immediately**; no apply / OK button.

## 5. Dialogs and modality

- **Prefer sheets**: confirmations / forms tied to the current window use an attached sheet; global,
  destructive, strongly interrupting cases use a centered Alert-style dialog.
- **Button order**: Cancel on the left, default button on the **far right**; the default button
  triggers on `Return`, `Esc` triggers cancel. Labels use concrete verbs (`Delete`, `Save`), not a
  generic `OK / Cancel`.
- Do not use Alerts for informational or commonly reversible actions; never at startup; operations
  completable inline do not go modal.

## 6. Menu bar and shortcuts

- The global menu bar is provided by `src-tauri/src/menu.rs`: **every toolbar command must have a menu
  item**, and vice versa if a menu item affects the current view it should also appear in the toolbar
  or command palette.
- Standard keys:

| Action | Key |
| --- | --- |
| Settings | `⌘,` |
| Command palette | `⌘K` |
| Find | `⌘F` |
| Close window | `⌘W` |
| Close all / quit | `⇧⌘W` / `⌘Q` |
| Undo / redo | `⌘Z` / `⇧⌘Z` |
| Switch sidebar group | `⌘1..9` |
| Reload (dev only) | `⌘R` |
| Full screen | `⌃⌘F` |
| Close overlay | `Esc` |

- Every shortcut must be visible in the UI (tooltip or menu item on the right).
- Context menus use the system right-click; order: common → separator → dangerous last.

## 7. Sidebar and lists

- The sidebar is a **source list**: group titles (`text-xs`, `text-muted-foreground`) + rows (16px
  icon + 13px text, height 28–32) with `bg-sidebar-accent` selection (translucent), no border or accent
  line; it **auto-collapses** when the window narrows.
- No critical info / actions at the sidebar bottom.
- Tables: row height 24–32, sticky header, `divide-y`, right-aligned numeric columns + `tabular-nums`, optional zebra.

## 8. Type and color

| HIG style | Size / line height | This project |
| --- | --- | --- |
| Large Title / Title 1 | 26/32 · 22/26 | page Hero (rare) |
| Title 2 / Title 3 | 17/22 · 15/20 | page title (`text-base` ↗ large) |
| Headline | 13/16 Bold | panel title (`text-xs` + 600) |
| Body | 13/16 | list body (`text-sm`) |
| Callout / Subheadline | 12/15 · 11/14 | secondary text (`text-xs`) |
| Footnote / Caption | 10/13 | badges, tiny notes (project floor 11) |

- Fonts: prefer system fonts (`-apple-system` / `SF Pro Text` / `SF Mono`); no third-party fonts.
- **Dark Mode**: follow the system appearance (never override "system"); test under `Increase Contrast`
  and `Reduce Transparency`.
- Accent: six user-selectable accents, **only for interactive controls and selected states**, never
  decoration, never on translucent layers.

## 9. Motion

- Use the shared durations / easing ([Shared core §2.7](/en/design/overview/); macOS feels 200–300ms).
- Window / material entrances animate blur radius together with scale (material "arrives", not fades in).
- Respect `prefers-reduced-motion`; never use a looping animation as the only state cue.
