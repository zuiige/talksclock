# AGENTS.md

## 项目概览

演讲计时器（Speaker Timer）——专为演讲者设计的在线倒计时工具。支持多环节管理、三种显示样式、声音提醒、键盘快捷键和响应式布局。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **字体**: JetBrains Mono (等宽数字，通过 Google Fonts CN 引入)

## 目录结构

```
src/
├── app/
│   ├── globals.css         # 全局样式 + 自定义动画 (gentle-pulse)
│   ├── layout.tsx          # 根布局，dark 模式
│   └── page.tsx            # 主页面（所有功能集成）
├── components/
│   ├── timer/
│   │   ├── countdown-display.tsx  # 三种显示样式 (classic/minimal/progress)
│   │   ├── control-panel.tsx      # 开始/暂停/重置/跳过控制
│   │   ├── task-list.tsx          # 任务列表 + 内联添加表单
│   │   ├── add-task-dialog.tsx    # 添加任务弹窗
│   │   └── settings-panel.tsx     # 样式切换/声音开关/预警阈值设置
│   └── ui/                        # shadcn/ui 组件
├── hooks/
│   ├── use-countdown.ts    # 倒计时核心逻辑 (requestAnimationFrame)
│   └── use-audio.ts        # Web Audio API 声音提醒
└── lib/
    ├── timer-types.ts      # 类型定义 + 工具函数
    └── utils.ts            # cn() 等通用工具
```

## 构建与测试命令

- 开发: `pnpm run dev`
- 构建: `pnpm run build`
- 类型检查: `pnpm run ts-check`
- Lint: `pnpm run lint`
- 启动: `pnpm run start`

## 代码风格

- 严格 TypeScript，禁止隐式 any
- 等宽数字使用 `font-mono tabular-nums`
- 时间格式化统一使用 `lib/timer-types.ts` 中的 `formatTime()`
- 颜色状态（绿/琥珀/红）统一使用 `getTimeColor()` / `getTimeColorClass()`
- 动画 CSS class: `animate-gentle-pulse`（自定义，定义在 globals.css）

## 核心业务逻辑

### 倒计时状态机

`idle` → `running` → `paused` → `running` / `idle` / `completed`

- `useCountdown` hook 使用 `requestAnimationFrame` + `Date.now()` 偏移量实现精确计时
- 暂停时保存 `pausedRemaining`，恢复时以此为基准重新计算
- 状态存储在 `TimerTask` 对象中，由页面组件通过 `setTasks` 管理

### 声音提醒

- 使用 Web Audio API 生成正弦波提示音，无需外部音频文件
- 三种音效: `playWarnSound`（双短音）、`playCompleteSound`（三升音）、`playTickSound`（单短音）

### 键盘快捷键

- `Space`: 开始/暂停
- `R`: 重置
- `F`: 全屏切换
- `←` `→`: 切换环节
