# nowork.click · 前端 MVP 套件

该目录提供 nowork.click MVP 的前端实现，基于 **Vue 3 + Vite + TypeScript + Tailwind CSS**，已经对齐原型中首页、国内榜、海外榜、角色入口与吐槽卡等页面布局。配合后端 Fastify 服务即可体验完整怒气按钮 → 榜单展示 → 吐槽分享的闭环。

## 快速开始

```bash
cd frontend
pnpm install            # 安装依赖
pnpm dev                # 本地开发，默认端口 http://localhost:5173
pnpm build              # 构建产物到 dist/
pnpm preview            # 预览构建结果
pnpm test:unit          # 运行 Vitest 组件测试
```

默认会将请求发送至同源 `/api/*`，若后端部署在其他地址，可通过 `.env` 配置 `VITE_API_BASE_URL`。

## 核心模块一览

| 模块 | 说明 | 关键文件 |
| --- | --- | --- |
| 导航与路由 | 玻璃拟态导航条、Mobile 折叠 + Vue Router 路由 | `src/components/NavigationBar.vue`、`src/router/index.ts` |
| 怒气按钮 | 包含冷却节流、音效播放、Pinia 状态更新 | `src/components/AngerButton.vue`、`src/stores/stats.store.ts` |
| 榜单可视化 | ECharts 地图 + Top10 柱图，支持国内/海外切换 | `src/components/StatsMap.vue`、`src/components/RankingBarChart.vue` |
| 页面视图 | 首页、国内榜、海外榜、角色入口、吐槽卡 | `src/views/*.vue` |
| 共享资源 | Tailwind 主题、地图 GeoJSON、API 封装 | `src/assets/main.css`、`src/assets/geo/china.json`、`src/services/api.ts` |

## 与后端的协同

1. 在项目根目录运行 `pnpm --dir backend db:init`，会创建数据表并灌入示例榜单/文案；
2. 后端服务监听 `http://localhost:3000`，当前前端默认请求 `/api/*` 接口；
3. 若使用 Docker，推荐执行根目录的 `pnpm test:all`，自动启动 MySQL/Redis/Backend 并完成 API + 前端构建校验。

## 组件测试

- 基于 **Vitest + @testing-library/vue**，增加了关键交互用例：
  - 怒气按钮节流与数据更新（`src/components/__tests__/AngerButton.spec.ts`）；
  - 地图组件在无数据时的兜底提示（`src/components/__tests__/StatsMap.spec.ts`）。
- 可通过 `pnpm test:unit --watch` 进入监听模式以辅助开发。

## 设计与主题

- Tailwind 配置位于 `frontend/tailwind.config.js`，颜色、字体、阴影与原型保持一致；
- 中国地图数据在 `src/assets/geo/china.json`，世界地图利用 `world-atlas` 与 `topojson-client` 动态转换；
- 全局样式入口 `src/assets/main.css`，已包含字体、背景渐变等基础设定。

如需按需扩展页面，可在现有目录结构基础上新增视图与组件，并通过 Pinia Store 统一管理状态。
