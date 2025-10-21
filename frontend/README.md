# nowork.click · 前端 MVP

这里是 nowork.click 的 Vue 3 + TypeScript + Vite 基线工程，已经完成 Tailwind CSS 主题与设计稿的对齐，后续可以在此基础上实现怒气按钮、榜单和吐槽卡等模块。

## 快速开始

```bash
cd frontend
pnpm install            # 已初始化依赖，可按需同步更新
pnpm dev                # 本地开发，默认端口 5173
pnpm build              # 产出静态资源，输出到 dist/ 目录
pnpm preview            # 预览构建结果
```

## 技术栈

- Vue 3 + `<script setup>`，配合 TypeScript 严格模式；
- Vite 5（Node.js ≥ 18.0），内置 `@` 到 `src/` 的路径别名；
- Tailwind CSS 3.4 + `@tailwindcss/forms` 插件，颜色、字体、阴影等主题与 `prototype/tailwind/` 保持一致。

## 目录结构

```
frontend/
├── index.html          # 入口模板，已配置中文语言环境
├── src/
│   ├── App.vue         # MVP 布局占位，可快速替换为各业务模块
│   ├── main.ts         # Vue 入口，载入 Tailwind 样式
│   └── assets/
│       └── main.css    # Tailwind 指令与基础全局样式
├── tailwind.config.js  # 主题扩展，与设计稿共享的色彩/字体设定
└── vite.config.ts      # Vite 配置，含别名与插件声明
```

## 下一步建议

1. 在 `src/components` 中拆分导航、怒气按钮、榜单等核心组件，并接入后端接口；
2. 建立路由与状态管理（推荐 Pinia）以支持多页面体验；
3. 引入单元测试或组件测试（如 Vitest + Testing Library），保障迭代质量；
4. 结合 CI/CD 流程，将 `pnpm build` 接入部署流水线。
