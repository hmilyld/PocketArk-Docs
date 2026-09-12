---
title: Database and migrations
description: Define schemas with Drizzle, append migrations per plugin scope, and read/write type-safely with kdb / db.
---

The data layer uses **Drizzle ORM** (object-based, type-safe queries) over a Rust-side sqlx channel.

## 1. Define a schema

Define tables in the plugin's `frontend/schema.ts` (the equivalent of a JPA entity). They are
**auto-aggregated with no manual registration** (Vite scans `plugins/*/frontend/schema.ts` at build time):

```ts
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const myItems = sqliteTable('my_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now','localtime'))`),
});

export type MyItem = typeof myItems.$inferSelect; // row type; do not hand-write an interface
```

## 2. Append a migration

Append migrations in the plugin's `backend/migrations.rs`. **Scope = plugin id; version starts at 1
within the scope**:

```rust
migration("my-tools", 1, "CREATE TABLE my_items (...)")
```

They are aggregated at build time and applied idempotently at startup by `(scope, version)`. Keep the
DDL column defaults aligned with the schema.

:::danger[Never modify a published migration]
Migrations can only be **appended**, never edited after release — already-upgraded databases will not
re-run them, and old and new databases will diverge.
:::

### Bridging an old database

If a plugin previously used old global version numbers, declare the "old global → new local" mapping in
`plugin.json`'s `legacyMigrations`; at startup it is registered into `plugin_migrations` without
re-running DDL:

```json
{ "legacyMigrations": { "1": 1, "2": 2 } }
```

## 3. Query (prefer kdb)

```ts
import { kdb } from '@/core/db';
import { eq, desc } from 'drizzle-orm';
import { myItems } from './schema';

const rows = await kdb
  .select()
  .from(myItems)
  .where(eq(myItems.title, 'x'))
  .orderBy(desc(myItems.id));

const [{ id }] = await kdb
  .insert(myItems)
  .values({ title: 'x' })
  .returning({ id: myItems.id });

await kdb.update(myItems).set({ title: 'y' }).where(eq(myItems.id, id));
await kdb.delete(myItems).where(eq(myItems.id, id));
```

## 4. Quick CRUD (equality conditions)

```ts
import { db } from '@/core/db';

await db.insert('notes', { content: 'hi' }); // identifier whitelist validation
const rows = await db.findAll<Row>('notes', { where: { ok: 1 }, orderBy: 'id DESC', limit: 20 });
const rows2 = await db.select<Row>('SELECT * FROM t WHERE a > $1', [value]);
```

For complex aggregation / JOINs, drop back to hand-written SQL.

## Key points

| Point | Notes |
| --- | --- |
| Identifiers | Table / column names are whitelist-validated; values are always parameterized |
| Auto-increment id | Use `.returning()` — the proxy run path does not return `lastInsertId` |
| Timestamps | Keep the schema `default` aligned with the migration DDL |
| BLOB | Returned over the sqlx channel as **base64 strings**; decode with `atob` on the frontend |
| Atomic writes | Use `runInTransaction([{ sql, params }])` for multiple statements — one Rust transaction, all-or-nothing |
