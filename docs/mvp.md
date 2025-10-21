# nowork.click MVP 交付文档

> 版本：2025-10-21，对齐当前仓库代码基线（frontend Vite 脚手架 + backend Fastify 服务）。

## 1. 文档目的与阅读对象

- **目的**：定义 nowork.click 在首个发布周期内的最小可行产品（MVP）范围、交互流程、技术方案与交付标准，为前后端、产品、运营形成统一共识。
- **阅读对象**：产品经理、前端/后端研发、设计、测试、运维及数据分析同学，外部协同（如运营）亦可参考“核心指标”与“非功能需求”章节。

## 2. 产品背景与价值主张

- **定位**：为打工人提供“怒气释放 + 群体共鸣”的互动平台，通过敲击怒气按钮、查看榜单、生成吐槽卡等互动形成数据闭环。
- **核心价值链路**
  - 情绪入口：怒气按钮提供即时反馈，缓解负面情绪。
  - 社会共鸣：国内/海外榜单实时展示群众怒气热度，引导用户探索热点。
  - 二次传播：吐槽卡与角色场景降低分享门槛，提升自然传播系数。
- **业务目标（MVP）**：验证“怒气敲击 → 数据反馈 → 分享传播”闭环是否具备初步吸引力，并收集首批真实用户数据用于后续运营策略。

## 3. 核心用户画像与场景

| 用户类型 | 核心诉求 | 触达场景 |
| --- | --- | --- |
| 城市白领 | 瞬时宣泄，快速查看同城怒气 | 工作闲暇、社交媒体引流 |
| 工厂/服务业从业者 | 找到同类情绪共鸣，获得安慰 | 夜班/通勤刷手机 |
| 互联网/媒体运营 | 观察舆情趋势，创造二次内容 | 数据选题、热点追踪 |

> 设计原则：30 秒内完成首次敲击并看到榜单反馈；提供显性分享动作，鼓励形成 UGC。

## 4. MVP 范围定义

### 4.1 必须交付（Must）

- **前端**
  - 首页：巨型怒气按钮（含音效/冷却节流）、实时统计卡片、分享吐槽卡弹窗（预览 + 复制文案）。
  - 国内榜：省级热力地图 + Top10 柱状图、Top6 省市卡片、`daily/total` 切换与刷新时间提示。
  - 海外榜：世界热力地图、国家榜单卡片（含文案高光）、榜单模式切换。
  - 情景入口：角色总览卡片（渐变徽章、等级标识、CTA 跳转），支持回跳首页激活角色。
  - 吐槽卡：富文本预览卡、文案灵感池、一键复制按钮、下载占位提示与使用贴士。
  - 统一导航：玻璃拟态导航条，根据页面注入上下文标签，移动端折叠。
  - 状态管理：Pinia 负责怒气摘要、榜单、角色、文案的获取与兜底。
- **后端**
  - `/api/hit`：怒气点击入库 + 返回怒气等级/推荐文案。
  - `/api/stats/china` & `/api/stats/global`：提供榜单数据，支持 `period`、`date`、`limit` 参数。
  - `/api/phrases/:page`：提供吐槽文案列表。
  - MySQL + Redis 数据存储（Redis 用于计数缓存、热点榜单；MySQL 持久化）。
  - IP 定位缓存、基础限流、日志落盘。
- **数据与指标**
  - 核心指标：每日独立敲击用户数、怒气总数、榜单 Top5 城市/国家、吐槽卡分享点击量。
  - 监控：API 成功率、Redis 命中率、怒气等级分布。
- **运营/配置**
  - 环境变量 `.env.dev/.env.prod` 配置齐全，敏感信息通过 Secret 注入。
  - Docker Compose 一键启动（前端/后端/Redis/MySQL），用于灰度环境。

### 4.2 可选加分（Nice to have）

- 前端引入骨架屏与失败兜底提示。
- 吐槽卡一键复制图片/文案。
- Worker 将 Redis 冷热数据定时落库（异步化）。
- Prometheus + Grafana 仪表盘预置告警（请求耗时、错误率）。

### 4.3 暂不纳入（Out of scope）

- 用户登录体系（含 OAuth）。
- 多语言支持（除中英文路由文案外）。
- 数据可视化大屏、实时弹幕等高复杂度交互。
- 深度运营后台（仅保留 SQL/脚本级管理）。

### 4.4 页面与原型对齐

| 页面 | 原型文件 | 核心元素 | 主要数据接口 |
| --- | --- | --- | --- |
| 首页 `/` | `prototype/index.html` | 巨型怒气按钮、实时统计卡、分享弹窗、玻璃拟态页脚 | `/api/hit`、`/api/stats/summary` |
| 国内榜 `/ranking/cn` | `prototype/ranking-cn.html` | 省级热力图、Top10 柱状图、Top6 卡片、刷新提示 | `/api/stats/china` |
| 海外榜 `/ranking/global` | `prototype/ranking-global.html` | 世界热力图、国家卡片文案、高亮标签切换 | `/api/stats/global` |
| 情景入口 `/roles` | `prototype/roles.html` | 渐变角色卡、等级徽章、CTA 跳转 | `/api/roles` |
| 吐槽卡 `/share` | `prototype/share.html` | 富文本预览卡、文案灵感池、复制/下载按钮、使用贴士 | `/api/phrases`、`/api/stats/summary` |

## 5. 用户旅程（MVP 流程）

1. 用户访问首页，玻璃拟态导航展示上下文信息，巨型怒气按钮默认可敲击。
2. 用户长按/点击按钮，触发动效与音效；前端调用 `/api/hit`，即时刷新今日/累计数据与怒气等级。
3. 用户可打开首页分享弹窗，预览吐槽卡并复制最新文案；失败场景给予兜底提示。
4. 用户切换至国内/海外榜单，查看热力地图、Top 卡片与刷新时间，必要时切换 `daily/total`。
5. 用户进入情景入口挑选角色，点击 CTA 返回首页并携带 `role` 参数，按钮文案与推荐随之更新。
6. 用户前往吐槽卡页面，挑选灵感短句生成卡片并复制文案；后端持续写入 Redis → 定时落库，指标面板实时展示。

## 6. 核心需求拆解

### 6.1 前端模块清单

| 模块 | 说明 | 数据依赖 | 备注 |
| --- | --- | --- | --- |
| `NavigationBar` | 玻璃拟态导航条，展示上下文标签，移动端折叠 | 路由信息 | 支持 `contextLabel` 注入、移动端滑出 |
| `AngerButton` | 巨型怒气按钮（音效、节流、冷却态） | `/api/hit` | emits `hit-success`，错误时提示文案 |
| `HomeShareModal` | 首页吐槽卡弹窗，预览 + 复制 | `stats.store`、`roles.store` | Teleport 渲染，调用 Clipboard API |
| `StatsMap` | 中国/世界热力图组件 | `/api/stats/china` / `/api/stats/global` | ECharts 封装，提供 tooltip/缩放兜底 |
| `RankingBarChart` | Top10 柱状图 | 同上 | 统一色板，响应式自适配 |
| `RoleCard` | 情景角色卡片 | `/api/roles` | 渐变徽章、等级显示、CTA 返回首页 |
| `ShareComposer` | 吐槽卡编辑区 + 灵感池 | `/api/phrases` | 多文案选择、一键复制、下载占位 |
| `Pinia Stores` | `stats/roles/phrases` 状态管理 | 各 API | 统一加载态、错误兜底、缓存上次结果 |

### 6.2 后端能力矩阵

- `hit.route.ts`：限流、IP 定位、Redis 自增、等级判定、文案抽样。
- `stats.route.ts`：国内榜（省/市分组）、海外榜（排除中国，按国家聚合）。
- `phrases.route.ts`：分页获取吐槽文案，支持页面维度。
- Services：`stat.service.ts`（聚合 + 入库）、`phrase.service.ts`（权重抽样）、`ip-location.service.ts`（通过 `ip2region` 解析）。
- 数据层：`schema.sql` 初始化表结构，`seed_phrases.sql` 提供基础文案。

## 7. 技术方案与选型分析

### 7.1 前端

- **现状**：Vue 3 + Vite + TypeScript + Tailwind CSS，页面结构按 prototype 对齐，`App.vue` 仅承载路由入口。
- **状态管理方案对比**
  - 方案 A：Pinia（推荐）——生态成熟、类型友好，与 Vue Devtools 联动；学习成本低。
  - 方案 B：Composable + 原生 `reactive` —— 轻量但需自行维护缓存策略，难以跨组件调试。
  - 方案 C：Vue Query —— 适合数据拉取丰富场景，但对自增计数/节流处理需额外封装。
- **路由方案对比**
  - 方案 A：Vue Router（推荐）—— 明确路由配置，便于 SEO & History 管理。
  - 方案 B：多页面 Vite 构建 —— 对首发 MVP 过重，推荐留给落地多端时再评估。
- **UI 方案**：Tailwind + 自定义组件，避免引入重 UI 库；按钮/榜单组件根据原型自建。

### 7.2 后端

- **现状**：Fastify 5 + TypeScript，采用插件化结构，已集成 MySQL、速率限制、日志。
- **数据同步方案对比**
  - 方案 A：Redis 计数 + Worker 落库（推荐）—— 兼顾实时性与性能，可扩展。
  - 方案 B：直接 MySQL `INSERT ... ON DUPLICATE KEY UPDATE` —— 实现简单，但高并发下可能出现锁竞争。
  - 方案 C：消息队列（如 Kafka）—— 适合大规模，但当前 MVP 成本高。
- **地理位置解析方案对比**
  - 方案 A：`ip2region` 本地库（当前实现）—— 无外网依赖，性能稳定。
  - 方案 B：第三方 API —— 维护成本低，但存在外部依赖与费用。
- **部署形态**
  - Docker Compose 本地/灰度环境。
  - 生产建议：后端容器 + Cloudflare 前置，Redis 建议使用托管版或自建主从。

## 8. 数据与指标管理

- **事件流**
  1. 前端点击事件（`page`, `role`, `timestamp`, `angerLevel`）通过 `/api/hit` 上报。
  2. Redis `hit:agg:{page}:{role}` 累加 → Worker 每 3s 批量写入 `stat_total_region` / `stat_daily_region`。
  3. 指标服务读取 MySQL/Redis → 输出榜单、怒气总数。
- **指标定义**
  - `DAU_hit`：当日参与怒气点击的独立 IP/设备数。
  - `avg_click_per_user`：平均点击次数，用于衡量粘性。
  - `share_conversion`：进入吐槽卡后实际分享/复制的比例。
- **数据校验机制**
  - 每日 01:30 自动对账 Redis 与 MySQL 统计，如差异 >1%，触发告警。
  - 提供 `scripts/db-report.ts`（后续补充）生成日报。

## 9. 非功能需求

- **性能**：怒气按钮接口 P95 < 150ms，榜单接口 P95 < 200ms；首页首屏交互可用时间 < 2.5s（移动端 4G 网络）。
- **安全**：基础速率限制（每 IP 10 次/秒），参数校验使用 Zod；防止 XSS（吐槽文案输出需 escape）。
- **可用性**：Redis 或 MySQL 异常时，前端需给出友好兜底提示，不影响基本浏览。
- **可观测性**：Fastify 日志（Pino JSON），部署到 Loki/ELK；前端 `window.onerror` 上报（接入 Sentry 可选）。

## 10. 里程碑与交付计划

| 时间 | 目标 | 核心交付 |
| --- | --- | --- |
| T+0 ~ T+3 天 | 前端组件雏形 | 导航、怒气按钮原型、Pinia store、Mock 数据 |
| T+4 ~ T+7 天 | 后端联调 | Redis + MySQL 串联、`/api/hit` 测试、榜单接口对接 |
| T+8 ~ T+10 天 | 吐槽卡 & 分享 | 吐槽卡模块、文案接口、分享行为追踪 |
| T+11 ~ T+14 天 | 测试与性能优化 | 单元/集成测试、性能测试、监控基线 |
| T+15 天 | MVP 发布 | Docker Compose 部署、运维脚本、运营指南 |

> 项目采用双周迭代，MVP 发布后进入运营数据验证阶段。

## 11. 测试策略与验收标准

- **自动化**
  - 前端：Vitest + Vue Testing Library（怒气按钮音效/冷却、地图数据兜底、分享弹窗复制逻辑）。
  - 后端：API 测试脚本（`pnpm test:api`）覆盖主要接口与异常场景。
  - 集成：Docker Compose 启动后运行端到端脚本验证怒气→榜单→吐槽卡全链路。
- **手动验收清单**
  - 首页 5 秒内可交互，按钮音效正常播放，统计卡刷新及时。
  - 国内/海外榜热力地图渲染成功，模式切换后刷新时间与数据联动。
  - 情景入口点击后返回首页，URL `role` 生效并驱动文案/按钮提示。
  - 吐槽卡页面可切换文案、复制成功并提示，下载按钮保留占位提示。
  - 监控面板可看到怒气总数、接口 QPS。

## 12. 风险评估与应对

- **高并发点击导致 Redis 压力升高**
  - 预案：开启分片键（`role` / `page`），必要时引入 Redis Cluster。
- **IP 定位库精度不足**
  - 预案：与第三方 API 混合校准重点城市；提供手动归类机制。
- **榜单数据存在短期波动**
  - 预案：引入滑动窗口平滑算法或展示趋势箭头，避免误导用户。
- **吐槽卡分享链路失败**
  - 预案：提供复制文本备选；埋点记录失败率，与前端提示联动。

## 13. 持续迭代方向

- 引入用户登录与怒气勋章体系，增强留存。
- 接入活动运营后台，提供榜单管理与推送。
- 考虑多端适配（小程序、Electron）和线下触屏装置。
- 数据分析深化：结合第三方热点词库，自动推荐热点怒气话题。

## 14. 附录

- **代码仓库结构**
  - 前端：`frontend/`（Vite + Vue3 + Tailwind，参考 `frontend/README.md`）。
  - 后端：`backend/`（Fastify + TypeScript，接口与服务拆分明确）。
  - 原型：`prototype/tailwind/`（Tailwind HTML 原型，供样式对标）。
- **运行指令**
  - 前端：`pnpm install && pnpm dev`（Node ≥18）。
  - 后端：`pnpm install && pnpm dev`，配合 MySQL/Redis。
  - Docker：`docker-compose up -d`（后续补充 Compose 文件时更新）。
- **参考文档**
  - 架构设计：`docs/development-plan.md`
  - 数据库脚本：`backend/sql/schema.sql`
  - 文案种子数据：`backend/sql/seed_phrases.sql`

> MVP 发布后请根据实际埋点数据与用户反馈，定期回溯本文件并更新范围与指标，确保产品迭代与业务目标同步。
