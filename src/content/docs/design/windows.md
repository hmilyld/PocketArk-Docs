---
title: 设计规范 · Windows
description: 平台差异层（Mica / Acrylic、自绘标题栏、Fluent 几何与运动）；含待真机验证清单。
---

> 本页只写 **Windows 平台差异**。共享规则见[设计规范 · 共享核心](/design/overview/)；macOS 见
> [macOS 平台层](/design/macos/)。依据 Microsoft《Windows app design（Fluent / WinUI 3）》。

:::caution[验证状态]
本平台层**尚未做视觉验证**（开发机为 macOS，无 Windows 环境）。所有取值来自官方文档，按「静态正确」
落地；首次在 Windows 上验证后需回填截图与偏差记录。
:::

## 1. 窗口壳

| 项 | 规定 | 依据 |
| --- | --- | --- |
| 标题栏 | 自绘（`set_decorations(false)`），高度 **32px** | 标准标题栏 32px |
| 窗口图标 | 左侧，垂直居中（32px 高时上下留 8px）；单击出系统窗口菜单、双击关闭 | Title bar 行为约定 |
| 标题文本 | 左侧、`text-sm`、居中于 32px；形如「应用名 — 页面名」 | Title bar |
| 标题栏按钮 | 右侧，宽 **46px**、高 32px，关闭按钮 hover 用 `#C42B1C`（系统语义红） | Fluent caption 按钮尺寸 |
| 拖拽区 | 标题栏除按钮外全部可拖拽；**双击标题栏空白处最大化 / 还原** | 系统行为 |
| 窗口圆角 | 由系统处理（Win11 8px）；**窗口贴靠时不圆角**——不自行绘制窗口圆角 | Geometry |

## 2. 材质（Mica / Acrylic）

| 区域 | 材质 | Tauri `effects` | 回退（必须实现） |
| --- | --- | --- | --- |
| 窗口基底 + 标题栏 | **Mica Alt** | `tabbed` | `bg-background` 实色 |
| 无导航的简洁窗口 | Mica | `mica` | `bg-background` 实色 |
| 浮层（菜单 / 下拉 / Flyout） | Acrylic | `acrylic`（或浮层内 CSS 毛玻璃） | `bg-popover` 实色 |

**官方降级条件（必须逐条覆盖）**：用户关闭「透明效果」、电池节能模式、低端硬件、窗口失焦、旧版
Windows → 一律回退实色。实现：CSS 侧 `prefers-reduced-transparency`；Rust 侧检测失败即不请求材质；
失焦态由 CSS 等价类或 JS 监听窗口焦点切换实色。

- 侧栏在 Windows 属于**内容层**，因此侧栏**不用** Acrylic，用 `bg-sidebar` 实色 + Mica Alt 窗口基底。
- 与 macOS 相同：材质只用在这些区域，滚动内容区 / 表格 / 表单禁模糊；最多 2 处材质。

## 3. 几何与间距（覆盖共享值）

Fluent 几何：**顶层容器 8px / 页内元素 4px / 直线相交处 0px**，因此 Windows 下覆盖共享圆角：

```css
[data-platform='win'] {
  --radius-md: 4px; /* 页内控件：按钮、输入、下拉、分段 */
  --radius-lg: 8px; /* 容器：面板、卡片、对话框 */
  --radius-xl: 8px; /* 浮层：Fluent 顶层容器同为 8px */
}
```

间距（与共享标尺一致，Windows 下取同值）：

| 关系 | 值 |
| --- | --- |
| 按钮之间 | 8 |
| 按钮与下拉之间 | 8 |
| 控件与分组标题之间 | 8 |
| 控件与标签之间 | 12 |
| 内容区块之间 | 12 |
| 表面与内容之间 | 16 |

## 4. 字体（Fluent type ramp 映射）

| Fluent 样式 | 字号 / 行高 | 本项目 |
| --- | --- | --- |
| Title | 28/36 · 20/28 | 页面标题上限（大档 `text-base` 或 `text-lg`，谨慎） |
| Subtitle | 20/28（semibold） | 设置页分区标题 |
| Body Strong | 14/20（semibold 600） | 面板标题、行标题强调 |
| Body | 14/20 | 正文、列表主文本（`text-sm` @ 正常档） |
| Caption | 12/16 | 辅助说明、标签（`text-xs`） |

- 字族：`Segoe UI Variable`；字重仍只用 400 / 500 / 600。
- **可读下限**：正文最小 14 Regular / 12 Semibold，低于此值一律禁止 → 小档需满足 ≥12。
- 大小写：句子大小写，不使用全大写标题。

## 5. 运动（Fluent 标准时长与曲线）

| 语义 | Fluent 值 | 本项目 `win` 覆盖 |
| --- | --- | --- |
| 控件常规（展开 / 切换 / 颜色） | 250ms | `--dur-slow: 250ms` |
| 控件快速（hover / 按下） | 167ms | `--dur-base: 167ms` |
| 极快（即时反馈） | 83ms | `--dur-fast: 83ms` |
| 进入曲线 | Fast Out, Slow In `cubic-bezier(0, 0, 0, 1)` | 同值 |
| 退出曲线 | Fast In, Slow Out `cubic-bezier(1, 0, 1, 1)` | 同值 |

其余规则同共享 §2.7（只动 transform / opacity、reduced-motion 交叉淡入）。

## 6. 高程（阴影与描边）

| 层 | Elevation | 描边 |
| --- | --- | --- |
| 窗口 | 128 | 1px |
| 对话框 | 128 | 1px |
| Flyout / 菜单 / Popover | 32 | 1px |

落地：Windows 下浮层阴影用 `--shadow-flyout` + `border`（1px 描边）；对话框用 `--shadow-dialog` + 1px 描边。
**阴影与描边成对使用**，不允许只有阴影无边。

## 7. 焦点与键盘

- 焦点视觉：**2px 双描边**（保证任何底色下可见），形状跟随控件圆角；不用彩色光环。
- 键盘：`Ctrl` 代替 `⌘`；`Alt` 聚焦窗口内命令区；`Esc` 关闭浮层与对话框。
- 快捷键映射：

| 动作 | macOS | Windows |
| --- | --- | --- |
| 设置 | `⌘,` | `Ctrl+,` |
| 命令面板 | `⌘K` | `Ctrl+K` |
| 页内搜索 | `⌘F` | `Ctrl+F` |
| 关闭窗口 | `⌘W` | `Ctrl+W` |
| 退出 | `⌘Q` | `Alt+F4` |
| 撤销 / 重做 | `⌘Z` / `⇧⌘Z` | `Ctrl+Z` / `Ctrl+Y` |
| 切换侧栏分组 | `⌘1..9` | `Ctrl+1..9` |
| 全屏 | `⌃⌘F` | `F11` |

界面中展示快捷键时按平台显示（`Ctrl+K` / `⌘K`），由 `core/platform.ts` 提供。

## 8. 命令与菜单（Windows 没有菜单栏）

Windows 上 `set_decorations(false)` 使原生菜单栏不可见，因此「工具栏命令必须在菜单栏有对应项」
在 Windows 无对应物，改用：

- **窗口内命令区（CommandBar）**：标题栏右侧或工具栏左侧放主命令 + **「更多」溢出菜单**（低频命令收进 overflow）。
- **设置入口**：放在「更多」溢出菜单的最后一项，若发现性重要可直接放工具栏。
- **右键上下文菜单**：针对选中对象的操作（表格行、列表项）。
- 所有命令都必须有键盘路径（`Ctrl+*` 或 `Alt+*`），不允许仅鼠标可达。

## 9. 对话框与反馈

- **对话框类型**：Windows 用 ContentDialog（窗口内模态），**没有 sheet 概念**；不要模仿 macOS 的附着式 sheet。
- **按钮顺序**：主操作在**左**、`Cancel / Close` 在**右**（与 macOS 相反）；破坏性操作主按钮用系统安全色 /
  破坏色，并在文案中写明后果。
- 不可撤销且后果严重的操作 → 确认对话框；可撤销操作直接执行 + 撤销入口。
- 提示条（InfoBar 语义）：可恢复的问题用告警条（`info` / `warning` / `error` 三档，含关闭与动作按钮），
  不用 toast 承载需要阅读的说明；系统级失败用 toast。
- 成功反馈同共享 §4（不弹 toast，用状态变化）。

## 10. 设置页

- 保持简单、以二值（开 / 关）控件为主；复杂参数放该功能所在页面，不堆进设置页。
- 设置项**立即生效**，不提供「应用 / 确定」按钮。
- 分区标题用 Subtitle 语义（`text-sm` / 600），分组用卡片 + `divide-y`（不叠盒子）。

## 11. 待真机验证清单

1. 标题栏 32px + 46×32 按钮 + 窗口图标与菜单行为；
2. Mica Alt / Acrylic 生效与全部降级路径；
3. 双描边焦点视觉；
4. 命令区（CommandBar）与溢出菜单、设置入口位置；
5. 对话框按钮顺序（主操作在左）；
6. `Ctrl` 键位展示与 `Alt` 命令区聚焦；
7. 4px / 8px 圆角覆盖生效；
8. 升 / 降字号档位下的布局不破版。

上述任一项通过验证后，需更新本页「验证状态」。
