---
title: Database and HTTP conventions
description: Parameterized SQL, auto-increment ids, BLOB handling, and routing every request through core/http.
---

## Database

| Convention | Notes |
| --- | --- |
| Query priority | Prefer `kdb` (Drizzle object queries); for quick CRUD use `db.insert / findAll`; drop to hand-written SQL for complex aggregation |
| Parameters | Always parameterize hand-written SQL with `$1`; never concatenate strings |
| Identifiers | Table / column names are whitelist-validated |
| Auto-increment id | Use `.returning({ id: table.id })` on insert / update / delete |
| BLOB | Returned as base64 strings; decode with `atob` on the frontend |
| Transactions | Use `runInTransaction([{ sql, params }])` for atomic multi-statement writes |

See [Database and migrations](/en/plugins/database/) for details.

## HTTP

Always go through `@/core/http` (Rust `reqwest`, **no CORS**); never `fetch` cross-origin data inside
the webview:

```ts
import { http } from '@/core/http';

const data = await http.getJson<MyResponse>('https://api.example.com/items');
const res = await http.postJson<Res>('https://api.example.com/items', { title: 'x' });
```

Features: global singleton, rustls, cookie session, 10 redirects, a 30 s timeout and a 10 MB response
cap; `http.download()` streams to a file with progress; proxy settings are respected.

For custom redirects, SSL verification, timeouts, cookie modes, multipart uploads, binary responses or
cancellation, use the advanced primitive `http.send()` (Rust `http_send`, isolated from the scraping
client):

```ts
import { http } from '@/core/http';

const res = await http.send({
  method: 'POST',
  url: 'https://api.example.com/upload',
  redirect: 'manual',
  verifySsl: false,
  body: { type: 'multipart', parts: [{ name: 'file', filePath: '/tmp/a.png' }] },
  taskId: 'upload-1', // cancel with http.cancel('upload-1')
});
```

:::note[Encoding]
HTTP response bodies are decoded as UTF-8 (non-UTF-8 pages such as GBK are a future extension). For
binary resources, use `http.download()` to stream to a file.
:::
