---
title: 创建插件
description: 用脚手架交互生成骨架，或手动复制模板，两步做出你的第一个工具。
---

推荐用脚手架交互生成（自动填好 id / 名称 / 图标，以及可选的后端、设置、数据库、生命周期钩子等）：

```bash
pnpm create-plugin
```

或手动复制模板：

```bash
cp -r plugins/_template plugins/my-tools
```

然后编辑 `plugins/my-tools/plugin.json`：

```json
{
  "id": "my-tools",
  "name": "我的工具",
  "tools": [
    {
      "id": "my-tools-hello",
      "name": "你好",
      "description": "我的第一个工具",
      "icon": "Sparkles",
      "entry": "frontend/views/Tool.vue"
    }
  ]
}
```

再改写 `frontend/views/Tool.vue`——完成。侧栏导航、路由、标题、启停开关、设置面板、
错误边界、KeepAlive 全部自动生效，**无需任何手动注册**。

脚手架按[插件目录规范](/plugins/overview/)生成骨架（含 `views/`、`settings/`、`components/`、
`composables/`、`lib/`、`shared.ts`），生成后即可运行。随后：

1. 改 `plugin.json`（id、显示名、图标、`tools[].entry`）——**唯一事实源**；
2. 实现 `frontend/views/*.vue`（UI 规范见[设计规范](/design/overview/)）；
3. 需要后端时在 `backend/mod.rs` 加 `#[tauri::command]`；
4. 需要落库时在 `backend/migrations.rs` 追加迁移，并在 `frontend/schema.ts` 定义表；
5. 补 `README.md`（功能）与 `AGENTS.md`（开发约定）。

## 参考实现

以下示例都在 `hello-world` 插件里，删除前可对照：

| 想做什么 | 看哪个文件 |
| --- | --- |
| 调用 Rust 命令、日志管道、读写 SQLite | `frontend/views/Tool.vue`（Rust 集成大全） |
| 表格 + 分页 + 弹窗增删改 + 导入导出 | `frontend/views/TableTool.vue` |
| 各种表单控件与校验 | `frontend/views/FormTool.vue` |
| 发 HTTP 请求展示结果、流式下载 | `frontend/views/HttpTool.vue` |
| 后台任务进度 / 取消、通知、事件总线 | `frontend/views/TaskTool.vue` |
| 多窗口、打开内容分发、快捷键、平台探测 | `frontend/views/SystemTool.vue` |
| 通用 CRUD、事务原子性、二进制文件读写 | `frontend/views/DataTool.vue` |
| 模块 Panel + 12 栅格布局与三态标准写法 | `frontend/views/TemplateTool.vue` |

:::tip[模板里的命令前缀要改]
复制 `_template` 后，记得把命令前缀从 `template_xxx` 改为 `<新插件id>_xxx`，
否则会与模板命令重名（`build.rs` 构建期报错）。
:::

下一步：了解 [plugin.json 字段](/plugins/manifest/)，或直接写
[前端页面](/plugins/frontend/)。
