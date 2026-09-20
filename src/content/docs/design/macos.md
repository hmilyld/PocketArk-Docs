---
title: 设计规范 · macOS
description: 平台差异层：窗口壳、vibrancy 材质、密度、控件语义、设置页 pane、菜单与快捷键。
---

> 本页只写 **macOS 平台差异**。共享规则见[设计规范 · 共享核心](/design/overview/)；Windows 见
> [Windows 平台层](/design/windows/)。依据 Apple《Human Interface Guidelines》macOS 部分。

## 1. 窗口壳

| 项 | 规定 |
| --- | --- |
| 标题栏样式 | `titleBarStyle: Overlay` + `hiddenTitle`，内容延伸到标题栏（unified toolbar 观感） |
| 红绿灯留位 | 左侧固定留位（`x: 10, y: 14`），内容不得覆盖 |
| 标题栏高度 | 工具栏行高 **40px**（紧凑统一工具栏），与其下内容用 hairline 分隔，不使用 CSS 阴影 |
| 拖拽区 | 整条标题栏 / 工具栏 `data-tauri-drag-region`，按钮除外 |
| 窗口控件 | 使用系统红绿灯（不自绘）；禁止在工具栏右侧再放最小化 / 最大化 / 关闭 |
| 关键信息位置 | 底部不放关键控件或重要信息（窗口底边常被移出屏幕） |

## 2. 材质（vibrancy）

`NSVisualEffectView` 语义材质与 Tauri `windowEffects` 的对应（`tauri.conf.json > app.windows[].windowEffects`）：

| 区域 | Apple 语义材质 | Tauri `effects` | Blending | 回退 |
| --- | --- | --- | --- | --- |
| 侧栏（导航列表） | Sidebar | `sidebar` | behind window | `bg-sidebar` 实色 |
| 工具栏 / 标题栏 | Header view | `headerView` | behind window | `bg-background` 实色 |
| 下拉 / 菜单 | Menu | `menu`（或浮层内 CSS 毛玻璃） | within window | `bg-popover` 实色 |
| 浮层 / Popover | Popover | `popover` | within window | `bg-popover` 实色 |
| 对话框（sheet） | Sheet | `sheet` | within window | `bg-card` 实色 |

- `state` 建议 `followsWindowActiveState`：窗口失焦时材质自动变浅。
- **依赖 `Reduce Transparency`**：CSS 侧监听 `prefers-reduced-transparency: reduce` 时切换实色层。
- **窗口背景契约**：材质经 Rust `apply_window_effects()` 启用（macOS `underWindowBackground`）；
  启用后 `set_window_background` 自动跳过实色打底——防白闪改由**内容层不透明底**保证
  （`body` 永远 `bg-background` 实色，仅 chrome 半透明）。材质启用失败时静默回退实色。
- **布局前提**：工具栏保持流程内，模糊由**粘性页头**承担（`ToolShell` 页头与设置页 tab 条都是
  `sticky top-0` + 材质）。不要改回「绝对定位工具栏 + `main` 顶部内边距」——会叠加出肉眼可见的空白带。
- 工具栏上**不要加自定义背景与着色**；半透明层不放 accent 色；材质层主文本用 `text-foreground`。

## 3. 密度与控件

| 语义 | 本项目（三档字号） | macOS 原生 |
| --- | --- | --- |
| 常规控件高 | `h-8`（26/28/30px） | Regular 22pt |
| 紧凑控件高 | `h-7`（22.75/24.5/26.25px） | Small 19pt / Mini 16pt |
| 列表行高 | 36（紧凑 32） | 表格行 24pt（列表行 32pt） |
| 面板内边距 | 16（紧凑 12） | 内容边距 20pt（紧凑 16pt） |

选择规则：**表单与工具页用常规档（`h-8`）；工具栏、表格行内操作、密集设置用紧凑档（`h-7`）**；一屏内不混用三档。

## 4. 控件语义（macOS 特有）

- **开关 vs 复选框**：细粒度布尔设置用**复选框**（标题在右）；「强调型」或整组开关用**开关**；
  分组表单（`SettingsSection`）内的开关用 **mini 尺寸**（`size="sm"`）。
- **开关只出现在列表行中**，行内容提供语境；禁止把 Label 与 Switch 用 `justify-between` 拉到两端。
- **分段控件**：2–7 个紧密相关、需常显选中态、且不属于窗口级视图切换的选项。
- **下拉（pop-up button）**：≥6 项、或选项文字较长；当前值显示在控件内（左对齐 + 右侧 chevron）。
- **搜索框**：放大镜 + 左对齐、输入即搜、右侧清除按钮（`SearchField`）。

## 4.5 设置页（pane 切换）

- pane 切换用**工具栏式横向 tab 条**（Safari / Xcode 偏好设置用法）：粘在工具栏之下、同材质。
  **选中态用 `bg-primary` 实心填充 + `text-primary-foreground`**，不用低饱和 tint（会被毛玻璃冲淡）。
  不使用左侧竖向导航（避免与应用侧栏形成三列）。
- 条高 `height: auto` + 等值 `py-1.5`，不要用固定高度 + `items-center`。
- 内容单列居中（12 栅格 `col-start-3 col-span-8`）；每个分组用 `SettingsSection` + `SettingsRow`。
- 设置项**立即生效**，不提供「应用 / 确定」。

## 5. 对话框与模态

- **Sheet 优先**：与当前窗口上下文强相关的确认 / 表单纯用附着于窗口的 sheet；全局性、破坏性、
  需要强打断的用居中 Alert 样式对话框。
- **按钮顺序**：取消在左、默认按钮在**最右**；默认按钮回车触发（`Return`），`Esc` 触发取消。
  按钮标签用具体动词（`删除`、`保存`），不用 `确定 / 取消` 兜底语义。
- 信息性、常见可撤销的操作不弹 Alert；启动时不弹 Alert；面板内联可完成的操作不进模态。

## 6. 菜单栏与快捷键

- 全局菜单栏由 `src-tauri/src/menu.rs` 提供；**工具栏中的每个命令都必须在菜单栏有对应项**，
  反之菜单项若影响当前视图，需同步出现在工具栏或命令面板。
- 标准键位：

| 动作 | 键位 |
| --- | --- |
| 设置 | `⌘,` |
| 命令面板 | `⌘K` |
| 页内搜索 | `⌘F` |
| 关闭窗口 | `⌘W` |
| 关闭全部 / 退出 | `⇧⌘W` / `⌘Q` |
| 撤销 / 重做 | `⌘Z` / `⇧⌘Z` |
| 切换侧栏分组 | `⌘1..9` |
| 重载（仅开发） | `⌘R` |
| 全屏 | `⌃⌘F` |
| 关闭浮层 | `Esc` |

- 每个快捷键都必须在界面中可见（工具提示或菜单项右侧）。
- 上下文菜单用系统右键，条目顺序：常用 → 分隔 → 危险项末位。

## 7. 侧栏与列表

- 侧栏为 **source list**：分组标题（`text-xs`，`text-muted-foreground`）+ 条目（图标 16 + 文本 13，
  行高 28–32），选中态用 `bg-sidebar-accent`（半透明），不用边框或强调线；窗口变窄时**自动折叠侧栏**。
- 侧栏底部不放关键信息 / 动作。
- 表格：行高 24–32、表头粘性、`divide-y` 分隔、数字列右对齐 + `tabular-nums`、可选斑马纹。

## 8. 字体与颜色

| HIG 样式 | 字号 / 行高 | 本项目 |
| --- | --- | --- |
| Large Title / Title 1 | 26/32 · 22/26 | 页面 Hero 标题（罕用） |
| Title 2 / Title 3 | 17/22 · 15/20 | 页面标题（`text-base` ↗ 大档） |
| Headline | 13/16 Bold | 面板标题（`text-xs` + 600） |
| Body | 13/16 | 列表正文（`text-sm`） |
| Callout / Subheadline | 12/15 · 11/14 | 辅助说明（`text-xs`） |
| Footnote / Caption | 10/13 | 徽标、极小注记（本项目下限 11） |

- 字族：系统字体优先（`-apple-system` / `SF Pro Text` / `SF Mono`），不引入第三方字体。
- **Dark Mode**：遵守系统外观（「跟随系统」不得覆盖）；必须在 `Increase Contrast` 与
  `Reduce Transparency` 下自测。
- 强调色：用户可选 6 档，**仅用于交互控件与选中态**，不用于装饰、不用于半透明层。

## 9. 动效

- 使用共享时长 / 缓动（[共享核心 §2.7](/design/overview/)，macOS 观感偏 200–300ms）。
- 窗口 / 材料进出：blur 半径与 scale 一起动画（材料「到位」而不是淡入）。
- 尊重 `prefers-reduced-motion`；不使用持续循环动画作为唯一状态提示。
