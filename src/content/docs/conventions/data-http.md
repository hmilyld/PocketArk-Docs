---
title: 数据库与 HTTP 约定
description: SQL 参数化、自增 id、BLOB 处理，以及一律走 core/http 的请求约定。
---

## 数据库

| 约定 | 说明 |
| --- | --- |
| 查询优先级 | 优先 `kdb`（Drizzle 对象化查询）；快速 CRUD 用 `db.insert / findAll` 等；复杂聚合退回手写 SQL |
| 参数化 | 手写 SQL 一律 `$1` 参数化，禁止字符串拼接 |
| 标识符 | 表名 / 列名做白名单校验 |
| 自增 id | insert / update / delete 用 `.returning({ id: table.id })` 拿返回值 |
| BLOB | 经通道以 base64 字符串返回，前端 `atob` 解码 |
| 事务 | 多语句原子写入用 `runInTransaction([{ sql, params }])` |

详见 [数据库与迁移](/plugins/database/)。

## HTTP

请求一律走 `@/core/http`（Rust `reqwest`，**无 CORS**），禁止在 webview 内 `fetch` 采集跨域数据：

```ts
import { http } from '@/core/http';

const data = await http.getJson<MyResponse>('https://api.example.com/items');
const res = await http.postJson<Res>('https://api.example.com/items', { title: 'x' });
```

特性：全局单例、rustls、cookie 会话、10 次重定向、30s 超时、10MB 响应上限；
`http.download()` 支持流式下载到文件并回传进度；代理设置驱动。

:::note[编码]
HTTP 响应体按 UTF-8 解码（非 UTF-8 页面如 GBK 为后续扩展点）；
二进制资源请用 `http.download()` 流式下载到文件。
:::
