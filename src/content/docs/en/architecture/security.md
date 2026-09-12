---
title: Security trust boundary
description: App commands are not gated by capabilities, so keep the CSP strict and never load remote content.
---

## Trust boundary

App-owned commands such as `db_*` / `http_request` **do not go through the capability permission
system**. Tauri v2 capabilities only gate core and plugin commands, while PocketArk's database and
HTTP commands are custom app commands — any code inside the webview can call them to run arbitrary
SQL or make arbitrary requests.

No local port is opened: the installed app loads its frontend through an in-process custom protocol,
with no web server. The only network activity is the requests the app itself initiates.

## Hard constraints that follow

:::danger[Do not break these two rules]
1. **Keep the CSP strict** — do not loosen `tauri.conf.json`'s CSP for convenience.
2. **Load no remote content** — treat plugins (local code) as the trusted boundary.
:::

Because commands are not gated, any remote script that can be injected into the webview effectively
gets full local capability. Therefore:

- Do not `fetch` remote pages inside the webview and render their content (use `@/core/http` to fetch
  **data**, not pages).
- Do not inject remote HTML / scripts into the DOM.
- A plugin is trusted on the premise that it is local code; never treat runtime-fetched code as a plugin.

## Reporting and auditing

- The diagnostics report (`@/core/diagnostics` / `diagnostics.rs`) summarizes environment info and
  recent logs, and can be handed to a reviewer.
- The app opens **no local port**, which can be stated directly in a security review.
