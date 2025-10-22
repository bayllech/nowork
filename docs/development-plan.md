# nowork.click 开发设计文档

> 版本：2025-10-21，对齐最新 Tailwind 原型页面与导航规范。

## 1. 项目概览

- **产品定位**：面向打工人的情绪出口平台，通过情绪按钮与榜单分享帮助用户“释压+共鸣”。
- **核心目标**
  - 提供情绪释放（猛敲按钮）及怒气榜单的实时反馈。
  - 以角色、榜单、吐槽卡引导用户二次互动与分享。
  - 构建可扩展的数据统计与活动运营能力。
- **页面清单**
  - 首页 `index.html`
  - 国内榜 `ranking-cn.html`
  - 海外榜 `ranking-global.html`
  - 情景入口 `roles.html`
  - 吐槽卡 `share.html`

## 2. 页面设计基线（Tailwind 原型 v2025-10-21）

### 2.1 顶部导航统一文案与状态

- 导航项固定为：`首页` / `国内榜` / `海外榜` / `情景入口` / `吐槽卡`。
- 当前页以浅色圆角 Pill + 投影突出，Hover 保持白色 70% 透明覆盖。
- 导航右对齐，移动端保持换行展示，确保易点触。

### 2.2 首页 `index.html`

- **结构**：情绪按钮区 + 怒气监控卡片 + 城市榜 + 活动卡片。
- **交互亮点**
  - 中央怒气按钮根据等级切换渐变与动效，右侧显示今日/总计数据。
  - 城市榜单双列展示，支持国内/海外切换。
  - “分享怒气”按钮跳转吐槽卡页面，强化转化。
- **文案对齐**：保持与榜单页的怒气等级标签一致，例如“持续冒烟”等描述。

### 2.3 国内榜 `ranking-cn.html`

- **布局**：左侧全国热力地图 + 趋势卡片，右侧“城市怒气排行榜”列表。
- **更新要点**
  - 顶部介绍文案强调“国内怒气指数”。
  - 榜单卡片使用统一的圆角 + 阶梯色条，支持标签显示怒气等级与趋势百分比。
  - 保留“怒气提醒”卡片，提示热点城市/行业事件。

### 2.4 海外榜 `ranking-global.html`

- **布局调整**：地图区保留，右侧改为“国家怒气排行榜”，移除“精选吐槽梗”“即将上线”模块。
- **内容精简**
  - 榜单顶部说明今日榜/总榜切换。
  - 列表项展示国家名称、怒气标签、副标题及点击数。
  - 突出右侧排行区，便于对比国内榜结构。

### 2.5 情景入口 `roles.html`

- **定位**：聚焦角色卡片，帮助用户快速找到对应怒气场景。
- **新版结构**
  - 顶部标题“怒气角色” + 简要说明 + 角色总数（动态统计）。
  - 卡片栅格自适应：桌面端三列、移动端一列，保证“进入怒气现场”按钮处于同一水平线。
  - 每张卡片包含：渐变头像（FontAwesome Icon）、等级徽标、角色描述、引用吐槽、主 CTA。
  - CTA 统一采用渐变按钮，确保对比度充足，解决背景融合问题。

### 2.6 吐槽卡 `share.html`

- **内容**：左侧卡片模板编辑区，右侧分享预览与模板列表。
- **改动要点**
  - 导航文案同步。
  - 保留“模板筛选 + 动态卡片”交互，后续与角色/榜单数据联动。

## 3. 数据模型与前端实现建议

### 3.1 Mock 数据约定

- `assets/mock-data.js` 提供统一数据入口，字段需覆盖真实数据需求。
- **roles** 数组新增字段：
  - `icon`: FontAwesome 图标类名，用于卡片头像。
  - `color`: Tailwind 渐变色组合，用于顶部色条与头像背景。
  - `badge`: 可选徽标文案（如“🔥 最热”“✨ 新增”）。
  - `key`: 与入口参数对应，跳转首页时通过 `index.html?role={key}` 预选场景。
- **globals / provinces**：保持 `rank`、`count`、`percent`、`level` 字段，文案改为实际剧情标签，便于直接展示。

### 3.2 组件化拆分（面向 Vue 版本）

- `NavigationBar`：复用统一文案与高亮逻辑。
- `RoleCard`：接收 `role` 数据，内部渲染头像、徽标、引用、CTA。
- `RankingList`：支持国内/海外两种布局，通过 `type` 调整文案与字段。
- `StatCounter`：展示总数/今日等指标，配合缓动动画。

### 3.3 状态管理与数据流

- `useStatsStore`
  - 持有国内/海外榜数据，支持 daily/total 切换。
  - 缓存上一次请求结果，避免频繁命中 API。
- `useRolesStore`
  - 负责角色列表、当前激活角色。
- `usePhraseStore`
  - 管理吐槽卡模板与推荐文案。
- 页面加载优先请求必要数据，点击事件通过节流/防抖汇总后上报，和后端设计保持一致（见第 4 节）。

## 4. 后端接口与数据流设计

### 4.1 API 列表

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/hit` | POST | 记录怒气点击，返回最新等级、角色推荐、今日统计 |
| `/api/stats/china` | GET | 获取国内榜单，参数：`period=daily|total`、`date`、`limit` |
| `/api/stats/global` | GET | 获取海外榜单，参数同上 |
| `/api/phrases/:page` | GET | 获取指定页面吐槽文案，参数：`page=default|roles|share`、`limit` |

### 4.2 点击写入流程（高频优化前提）

1. 前端每次点击调用 `/api/hit`，携带页面标识、角色 key、客户端时间。
2. 网关通过速率限制校验（参考 `RATE_LIMIT_PER_MINUTE`），防止恶意刷量。
3. 请求进入缓存层（建议 Redis，详见第 5 节）累加计数，并异步刷新 MySQL。
4. 后端返回：
   - 当前怒气等级与下一档提示。
   - 今日/总计最新数值（从缓存读取，保证实时反馈）。
   - 推荐的吐槽卡/角色（便于前端更新 UI）。

### 4.3 统计聚合

- 日维度、总维度分别维护聚合表，采用 `INSERT ... ON DUPLICATE KEY UPDATE`。
- CSV/BI 导出走离线任务（建议每日凌晨 01:00 执行）。
- 地理信息通过 `hit_ip_cache` 缓存，过期时间 7 天。

### 4.4 Redis 键空间设计

- **点击累积**：`hit:agg:{page}:{role}` 使用 Hash 存储，字段命名为日期（`YYYY-MM-DD`），值为当日增量；若角色为空则置为 `default`。
- **榜单缓存**：
  - 国内榜：`ranking:cn:{period}`（Sorted Set，score 为怒气指数，member 为城市代码）。
  - 海外榜：`ranking:global:{period}`（同上，member 为国家代码）。
  - 榜单缓存 TTL 控制在 30~60 秒，保证实时性与成本平衡。
- **热门推荐**：`phrase:hot:{page}`，采用 String 或 List，TTL 24 小时，方便运营调整。
- **幂等标记**：为避免批量落库重复，可在 Worker 执行后设置 `hit:lock:{timestamp}`，过期时间略大于批处理窗口。

## 5. 架构选型与扩展建议

### 5.1 技术栈基线

- **前端**：Vue 3 + Vite + TypeScript + Tailwind CSS。
- **后端**：Fastify + TypeScript，编排工具 Docker Compose。
- **数据库**：MySQL 8，主键设计兼容高并发 `INSERT`。
- **缓存层**：Redis 7（已确定引入，可按需要扩展至 Cluster），承担以下职责
  - 怒气点击计数累加（`INCRBY` / `HINCRBY`），提供实时反馈。
  - 排行榜实时排序（`ZINCRBY` / `ZRANGE`），接口直接读取。
  - 热门角色、吐槽卡、配置字典缓存（`SET` / `GET` + TTL）。

### 5.2 Redis 部署与落库策略

- 基础部署：开发环境使用 Docker 单节点实例；生产环境建议主从 + 哨兵或托管云服务，配置 AOF 持久化与有序备份。
- 写入路径：
  1. 前端点击 -> `/api/hit` -> Redis 自增并返回最新计数。
  2. 后台 Worker（基于 `bullmq` 或自研定时任务）每 1~5 秒批量读取增量，落库 `stat_total_region` & `stat_daily_region`。
  3. 落库后清理或重置对应 Redis 临时键，确保数据一致。
- 兜底机制：Worker 落库失败时将任务写入补偿队列，触发告警并重试，防止数据丢失。
- 扩展方案：未来如需拆分服务，可通过 Redis Stream 或消息队列将点击事件分发给多个消费者进行 ETL/实时分析。

## 6. 部署与运维

- **环境变量**：统一维护于 `.env.dev` / `.env.prod`，通过 Docker Secret 注入生产配置。
- **CI/CD**：
  - 前端：构建产物上传 Cloudflare Pages，打标签发布。
  - 后端：GitHub Actions 构建镜像，推送容器仓库，触发服务器 `docker stack deploy`。
- **基础设施**：
  - Redis 通过 `docker-compose` 单独服务启动，暴露仅内部网络端口（默认 6379），由 Fastify 与 Worker 使用。
  - 提供 `REDIS_HOST`、`REDIS_PORT`、`REDIS_PASSWORD` 等环境变量，生产环境建议开启 ACL 与 TLS。
- **Worker 服务**：
  - 建议新增 `backend/src/workers/hit-aggregator.ts`，使用 `bullmq` 或 `setInterval` 周期任务，每批次处理限定条目（如 1000 条）。
  - 配置项：`WORKER_BATCH_SIZE`（默认 500）、`WORKER_FLUSH_INTERVAL_MS`（默认 3000）、`WORKER_MAX_RETRY`（默认 5）。
  - 日志记录批次耗时、处理数量和失败列表，便于 Prometheus / Loki 采集。
- **监控**：
  - 接入 Cloudflare Analytics + 自建 Prometheus（采集 QPS、Redis 命中率、MySQL 慢查询）。
  - 关键阈值：Redis 队列积压、MySQL 连接数、API 99 线耗时。
  - **日志**：Pino 输出 JSON，落盘 + Loki 聚合，保留 14 天。

## 7. 迭代规划（Next 2 Sprints）

| Sprint | 目标 | 关键事项 |
| --- | --- | --- |
| Sprint 1 | Vue 前端 MVP 联调 | 导航/角色组件化、怒气按钮与 hit 接口打通、国内榜渲染、Redis 基础接入、键名约定落地 |
| Sprint 2 | 数据闭环与分享 | Redis 批量落库 Worker、告警&监控仪表盘、吐槽卡动态文案、分享追踪（UTM） |

## 8. 附录

- 设计稿参考：`prototype/tailwind/*.html`（最新版本）。
- 图标库：FontAwesome 6.5.2，类名在 `assets/mock-data.js` 明确定义。
- 颜色体系：以 Tailwind 渐变 `from-* to-*` 方式维护，详见 `tailwind.config.js`。

> 若页面设计有后续迭代，请同步更新本文件与 `prototype/README.md`，确保产品、研发、运营共享统一基线。
