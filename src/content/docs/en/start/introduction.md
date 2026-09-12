---
title: Introduction
description: What PocketArk is, its design goal, and the work it saves you.
---

PocketArk is a **reusable desktop app base framework** (Tauri 2 + Vue 3 + TypeScript + Tailwind CSS 4).
Its single design goal: **make adding a new tool as cheap as possible**.

The framework already handles everything unrelated to your product — windows and tray, sidebar
navigation, routing, theming, SQLite database and migrations, settings persistence, logging,
error handling, an HTTP channel and auto-update. You only write **the tool itself**.

## What it does for you

- **Plugin-based**: `plugin.json` is the single source of truth. Both the frontend (Vite) and the
  backend (Rust) **auto-register at build time** — copy the template and add a tool without touching
  any framework file.
- **Local-first**: data lives in SQLite (Drizzle ORM + a Rust sqlx channel), never leaving the machine.
- **Batteries included**: logging, type-safe IPC, an event bus, a CORS-free HTTP client,
  scope-isolated migrations, system tray, global shortcuts, taskbar progress, multi-window and a
  native app menu.
- **Native feel**: the "dark command deck" theme, a collapsible sidebar, six accent colors and three
  font-size steps that scale the whole UI.
- **Built-in auto-update**: official `tauri-plugin-updater` plus a self-hosted static manifest, with a
  reusable release workflow.

## Framework and examples

The repository is a combination of framework and examples:

| Part | Purpose |
| --- | --- |
| Framework code | `src/core/` and `src-tauri/src/` db / http / tray / updater / menu / tasks / open — **reference, never edit** |
| `plugins/_template` | New-plugin scaffold (`_` prefix, not registered) |
| `plugins/hello-world` | Teaching example: Rust commands, SQLite, HTTP, layout and forms end to end |
| `plugins/system` | Built-in system tool (data maintenance, frontend-only); keep it |

## How to read these docs

- **Want to run it now**: follow *Getting Started* — [Install and run](/en/start/installation/) then
  [Make it yours](/en/start/scaffold/).
- **Building a tool**: go straight to *Plugin Development*, starting at [Create a plugin](/en/plugins/create/).
- **Hitting an error or touching framework behavior**: read *Conventions* and the
  [Pitfalls list](/en/conventions/pitfalls/).
- **About to ship**: read *Build & Release*, especially signing and `latest.json`.

Next: [Install and run](/en/start/installation/).
