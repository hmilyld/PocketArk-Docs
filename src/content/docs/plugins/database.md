---
title: 数据库与迁移
description: 用 Drizzle 定义 schema、按插件作用域追加迁移，并用 kdb / db 做类型安全的读写。
---

数据层基于 **Drizzle ORM**（对象化类型安全查询）+ Rust 侧自建 sqlx 通道执行。

## 1. 定义 schema

在插件 `frontend/schema.ts` 定义表（JPA Entity 的等价物），**自动聚合，无需手动注册**
（Vite 构建期扫描 `plugins/*/frontend/schema.ts`）：

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

export type MyItem = typeof myItems.$inferSelect; // 行类型，勿手写 interface
```

## 2. 追加迁移

在插件 `backend/migrations.rs` 追加迁移。**scope = 插件 id，version 在作用域内从 1 递增**：

```rust
migration("my-tools", 1, "CREATE TABLE my_items (...)")
```

构建期自动聚合，启动时按 `(scope, version)` 幂等执行。建表 DDL 的列默认值要与 schema 对齐。

:::danger[已发布的迁移不可修改]
迁移只能**追加**，不能改已发布的内容——否则已升级的库不会重跑，新旧库结构会分叉。
:::

### 旧库桥接

若插件此前用过旧的全局版本号，在 `plugin.json` 的 `legacyMigrations` 声明
「旧全局版本 → 新本地版本」，启动时按映射登记进 `plugin_migrations`（不重复执行 DDL）：

```json
{ "legacyMigrations": { "1": 1, "2": 2 } }
```

## 3. 查询（推荐 kdb）

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

## 4. 快速 CRUD（等值条件）

```ts
import { db } from '@/core/db';

await db.insert('notes', { content: 'hi' }); // 标识符白名单校验
const rows = await db.findAll<Row>('notes', { where: { ok: 1 }, orderBy: 'id DESC', limit: 20 });
const rows2 = await db.select<Row>('SELECT * FROM t WHERE a > $1', [value]);
```

复杂聚合 / JOIN 退回手写 SQL。

## 要点

| 要点 | 说明 |
| --- | --- |
| 标识符 | 表名 / 列名做白名单校验，值一律参数化 |
| 自增 id | 用 `.returning()` 拿返回值——proxy 的 run 路径不回传 `lastInsertId` |
| 时间戳 | schema 的 `default` 与迁移 DDL 对齐 |
| BLOB | 经 sqlx 通道以 **base64 字符串**返回，前端自行 `atob` 解码 |
| 原子写入 | 多语句用 `runInTransaction([{ sql, params }])`，Rust 侧单事务执行，任一失败整体回滚 |
