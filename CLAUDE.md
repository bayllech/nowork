# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**NoWork.click** 是一个情绪宣泄平台,让打工人通过点击按钮释放工作压力,并展示全国/全球点击排行榜。

- **技术栈**: Fastify (后端) + Vue 3 (前端,待开发) + MySQL + Redis + Docker
- **核心功能**: IP定位、点击统计、地域排行榜、吐槽文案生成、实时数据缓存
- **部署方式**: Docker Compose + Cloudflare
- **当前状态**: 后端基础架构已完成,Tailwind原型已完成,待引入Redis和开发Vue前端

## 常用命令

### 后端开发 (backend/)

```bash
# 安装依赖 (使用 pnpm)
cd backend
pnpm install

# 开发模式 (热重载)
pnpm run dev

# 编译 TypeScript
pnpm run build

# 生产运行
pnpm run start

# 类型检查
pnpm run lint

# 数据库初始化
pnpm run db:init

# API 接口测试
pnpm run test:api
```

### Docker 环境

```bash
# 开发环境 (带热重载,包含 MySQL + Redis)
docker compose -f docker/docker-compose.dev.yml up -d

# 生产环境
docker compose -f docker/docker-compose.prod.yml up -d

# 查看日志
docker compose -f docker/docker-compose.dev.yml logs -f backend
docker compose -f docker/docker-compose.dev.yml logs -f redis

# 连接 Redis CLI
docker exec -it nowork-redis-dev redis-cli

# 停止并清理
docker compose -f docker/docker-compose.dev.yml down -v
```

### 前端开发

```bash
# 当前阶段: Tailwind CSS 原型 (prototype/tailwind/)
# 查看原型: 直接在浏览器打开 prototype/tailwind/*.html

# Vue 3 前端 (计划在 frontend/ 目录)
cd frontend
pnpm install
pnpm run dev      # 开发服务器
pnpm run build    # 生产构建
pnpm run preview  # 预览构建结果
```

### 数据库操作

```bash
# 连接到 Docker 中的 MySQL (开发环境)
docker exec -it nowork-mysql-dev mysql -u nowork -p
# 密码: nowork (见 .env.dev)

# 执行 SQL 文件
docker exec -i nowork-mysql-dev mysql -u nowork -pnowork nowork < backend/sql/schema.sql
```

## 架构设计

### 后端架构 (backend/)

```
backend/
├── src/
│   ├── main.ts              # 应用入口
│   ├── app.ts               # Fastify 应用构建
│   ├── config/
│   │   └── env.ts           # 环境变量配置 (使用 zod 校验)
│   ├── plugins/
│   │   ├── mysql.ts         # MySQL 连接池插件 (@fastify/mysql)
│   │   └── rate-limit.ts    # 限流插件 (@fastify/rate-limit)
│   ├── routes/              # 路由定义
│   │   ├── index.ts         # 路由注册入口
│   │   ├── hit.route.ts     # POST /api/hit (点击记录)
│   │   ├── stats.route.ts   # GET /api/stats/* (统计查询)
│   │   └── phrases.route.ts # GET /api/phrases (文案查询)
│   ├── schemas/             # Zod 数据校验 schema
│   ├── services/            # 业务逻辑层
│   │   ├── ip-location.service.ts  # IP定位 (ip2region)
│   │   ├── ip-cache.service.ts     # IP缓存查询/写入
│   │   ├── phrase.service.ts       # 文案抽取
│   │   └── stat.service.ts         # 统计数据聚合
│   ├── types/
│   │   └── fastify.d.ts     # Fastify 类型扩展
│   └── utils/
│       ├── logger.ts        # Pino 日志封装
│       └── ip.ts            # IP 提取工具
├── scripts/
│   ├── db-init.ts           # 数据库初始化脚本
│   └── test-api.ts          # API 测试脚本
└── sql/
    ├── schema.sql           # 数据库表结构
    └── seed_phrases.sql     # 初始文案数据
```

### 关键设计模式

1. **插件化架构**: Fastify 插件系统,所有功能模块化注册
2. **服务层分离**: routes → schemas → services,职责清晰
3. **环境配置**: 使用 zod 进行环境变量校验,类型安全
4. **连接池管理**: @fastify/mysql 管理数据库连接复用
5. **限流保护**: @fastify/rate-limit 防止 API 滥用
6. **缓存优先**: Redis 承担实时数据累加和排行榜实时排序,MySQL 作为持久化存储
7. **异步落库**: Worker 定时将 Redis 增量数据批量写入 MySQL

### 数据库设计

```sql
-- IP 地理信息缓存 (避免重复查询)
hit_ip_cache (ip, country, province, city, last_update)

-- 累计统计 (总排行榜)
stat_total_region (country, province, city, page, count)
  PRIMARY KEY: (country, province, city, page)

-- 每日统计 (日排行榜)
stat_daily_region (stat_date, country, province, city, page, count)
  PRIMARY KEY: (stat_date, country, province, city, page)
  INDEX: idx_daily_page (stat_date, page, count)

-- 吐槽文案池
phrases (id, page, content, weight, created_at)
  INDEX: idx_phrase_page (page)
```

**聚合策略**:
- **写入流程**: 点击请求 → Redis 自增计数 → Worker 批量落库 MySQL
- **查询流程**: 优先从 Redis 读取实时数据,未命中则查询 MySQL
- **数据一致性**: Worker 使用 `INSERT ... ON DUPLICATE KEY UPDATE` 保证幂等性

### API 核心接口

```
POST /api/hit
  参数: { page?: string }
  功能: 记录点击 → IP定位 → 更新统计 → 返回排行数据 + 随机文案

GET /api/stats/china?type=daily&date=2025-10-20&page=default
  功能: 查询国内地域排行榜

GET /api/stats/global?type=total&page=default
  功能: 查询海外国家排行榜

GET /api/phrases/:page
  功能: 获取指定页面的随机文案
```

### IP 定位流程

1. 从请求头提取真实 IP (`X-Real-IP` / `X-Forwarded-For`)
2. 查询 `hit_ip_cache` 表缓存
3. 缓存未命中 → 使用 ip2region 本地库解析 (xdb 文件)
4. 解析失败 → 回退到 ip-api.com (待实现)
5. 结果写入缓存表 + 返回地理信息

## 环境变量

项目使用三个环境文件:

- `.env.example` - 模板文件
- `.env.dev` - 开发环境配置
- `.env.prod` - 生产环境配置

**关键配置项**:
```env
NODE_ENV=development|production
PORT=3000
MYSQL_HOST=mysql  # Docker 环境使用服务名
MYSQL_PORT=3306
MYSQL_DATABASE=nowork
MYSQL_USER=nowork
MYSQL_PASSWORD=***
REDIS_HOST=redis  # Docker 环境使用服务名
REDIS_PORT=6379
REDIS_PASSWORD=***  # 生产环境必须设置
REDIS_DB=0
RATE_LIMIT_PER_MINUTE=60
IP2REGION_PATH=/app/ip2region.xdb  # ip2region 数据库路径
DEFAULT_PAGE=default
LOG_LEVEL=info
WORKER_ENABLED=true  # 是否启用 Worker
WORKER_BATCH_SIZE=500  # 批量落库数量
WORKER_FLUSH_INTERVAL_MS=3000  # 落库间隔(毫秒)
```

## 前端原型 (prototype/)

当前阶段为 HTML/CSS/JavaScript 原型,用于演示交互逻辑:

- **01-homepage.html**: 主页 (情绪按钮 + 怒气动画 + 统计数据)
- **02-ranking.html**: 排行榜 (地图热力图 + 城市榜单 + 海外榜单)
- **03-roles.html**: 角色页 (6种角色场景卡片)
- **tailwind/**: Tailwind CSS 版本原型

**实际前端开发**: 计划使用 Vue 3 + Vite + TypeScript + Pinia,但尚未初始化

## 重要注意事项

1. **包管理器**: 后端必须使用 `pnpm`,已在 package.json 中指定 `packageManager`
2. **数据库初始化**: 首次运行前必须执行 `pnpm run db:init` 创建表结构和种子数据
3. **ip2region 数据**: 需要下载 ip2region.xdb 文件并放到 `data/` 目录,Docker 会挂载到容器内
4. **TypeScript 编译**: 生产部署前必须运行 `pnpm run build`,dist/ 目录包含编译后代码
5. **端口冲突**: 开发环境后端监听 3000,MySQL 监听 3306,确保端口未被占用
6. **热重载**: 开发模式使用 `tsx watch`,修改代码后自动重启

## 开发工作流

### 首次启动项目

```bash
# 1. 启动 Docker 环境 (包含 MySQL)
docker compose -f docker/docker-compose.dev.yml up -d

# 2. 等待 MySQL 健康检查通过 (约 10-30 秒)
docker compose -f docker/docker-compose.dev.yml logs mysql

# 3. 初始化数据库 (仅首次需要)
cd backend
pnpm run db:init

# 4. 后端服务会自动启动 (Docker compose 配置了 command)
# 查看后端日志
docker compose -f docker/docker-compose.dev.yml logs -f backend
```

### 日常开发

```bash
# 本地开发 (不使用 Docker)
cd backend
pnpm install
pnpm run dev

# 或使用 Docker (推荐,环境一致)
docker compose -f docker/docker-compose.dev.yml up -d
```

### 测试 API

```bash
# 使用内置测试脚本
cd backend
pnpm run test:api

# 或手动测试
curl -X POST http://localhost:3000/api/hit -H "Content-Type: application/json" -d '{"page":"default"}'
curl http://localhost:3000/api/stats/china?type=daily
curl http://localhost:3000/api/phrases/default
```

## Git 分支策略

- **main**: 生产分支,已完成后端初始化和原型设计
- 提交信息风格: `feat:`, `fix:`, `docs:`, `refactor:` 等约定式提交

## Redis 架构设计

### Redis 键空间设计

```
# 点击累积计数 (Hash)
hit:agg:{page}:{role}:{date}  # 字段: province/country -> count
例: hit:agg:default:default:2025-10-21
    HINCRBY 操作累加点击数

# 实时排行榜 (Sorted Set)
ranking:cn:{period}  # 国内榜, score=count, member=province
ranking:global:{period}  # 海外榜, score=count, member=country
例: ranking:cn:daily
    ZINCRBY 操作累加分数

# IP 地理信息缓存 (String)
ip:geo:{ip}  # 值: JSON 格式的地理信息
TTL: 7天

# 热门文案缓存 (List)
phrase:hot:{page}  # 存储文案ID列表
TTL: 24小时

# Worker 落库锁 (String)
hit:lock:{timestamp}  # 防止重复落库
TTL: 略大于批处理窗口
```

### 数据流设计

```
用户点击 → POST /api/hit
  ↓
1. Redis HINCRBY (累加点击数)
2. Redis ZINCRBY (更新排行榜)
3. 返回实时数据给前端
  ↓
Worker 定时任务 (每3秒)
  ↓
1. 读取 Redis 增量数据
2. 批量写入 MySQL
3. 清理已落库的 Redis 键
```

### Redis 性能优化

- **Pipeline**: 批量操作使用 Pipeline 减少网络往返
- **TTL 策略**:
  - 点击累积数据: 当日数据不过期,次日凌晨清理
  - 排行榜缓存: 30-60秒 TTL,平衡实时性和性能
  - IP缓存: 7天 TTL
- **持久化**: 开发环境 RDB,生产环境 AOF + RDB 混合持久化

## 开发路线图

### Sprint 1: Redis 集成与后端优化 (当前阶段)

**目标**: 将 Redis 引入现有后端,实现高性能点击统计和数据缓存

**时间**: 2-3 天

**状态**: 🔄 进行中

#### 任务清单

**1.1 Redis 基础集成** ✅ (部分完成)
- [x] Docker Compose 添加 Redis 服务 (已完成)
- [ ] 安装依赖: `@fastify/redis`, `ioredis`
- [ ] 创建 Redis 插件 `backend/src/plugins/redis.ts`
- [ ] 在 app.ts 中注册 Redis 插件
- [ ] 添加 Redis 类型定义到 `types/fastify.d.ts`
- [ ] 配置环境变量校验 (env.ts)

**1.2 Redis 服务层设计**
- [ ] 创建 `services/redis-cache.service.ts` (统一缓存操作)
- [ ] 创建 `services/redis-ranking.service.ts` (排行榜操作)
- [ ] 创建 `services/redis-stats.service.ts` (统计数据操作)
- [ ] 实现 Pipeline 批量操作工具函数
- [ ] 添加缓存键命名常量 `utils/redis-keys.ts`

**1.3 点击接口 Redis 化改造**
- [ ] 改造 IP 缓存逻辑使用 Redis (`ip:geo:{ip}`)
- [ ] 实现点击计数 Redis 累加 (`hit:agg:{page}:{role}:{date}`)
- [ ] 实现排行榜实时更新 (`ranking:cn:daily`, `ranking:global:daily`)
- [ ] 优化 /api/hit 接口返回实时 Redis 数据
- [ ] 添加降级逻辑 (Redis 故障时回退到 MySQL)

**1.4 统计接口优化**
- [ ] 改造 /api/stats/china 优先读 Redis
- [ ] 改造 /api/stats/global 优先读 Redis
- [ ] 实现缓存预热逻辑 (MySQL → Redis)
- [ ] 添加缓存 TTL 策略 (30-60秒)
- [ ] 实现缓存击穿保护 (互斥锁)

**1.5 Worker 批量落库机制**
- [ ] 创建 `workers/` 目录和 Worker 基础架构
- [ ] 实现 `workers/hit-aggregator.ts` (点击数据落库)
- [ ] 实现批量读取 Redis 增量数据
- [ ] 实现批量写入 MySQL (INSERT ON DUPLICATE KEY UPDATE)
- [ ] 添加落库锁机制 (`hit:lock:{timestamp}`)
- [ ] 实现失败重试和补偿队列
- [ ] 添加 Worker 启动开关 (WORKER_ENABLED)

**1.6 监控与测试**
- [ ] 添加 Redis 连接健康检查
- [ ] 实现 Redis 性能监控日志
- [ ] 更新 API 测试脚本验证 Redis 功能
- [ ] 编写 Redis 键空间文档
- [ ] 压力测试 (/api/hit 接口 100 QPS+)

#### 验收标准
- ✅ Redis 正常连接并可通过 CLI 查询数据
- ✅ /api/hit 接口响应时间 < 50ms (Redis 模式)
- ✅ Worker 每3秒成功落库,无数据丢失
- ✅ 排行榜数据实时更新 (< 5秒延迟)
- ✅ Redis 故障时自动降级到 MySQL

### Sprint 2: Vue 3 前端初始化与基础架构

**目标**: 搭建 Vue 3 前端项目,完成基础架构和通用组件

**时间**: 3-4 天

**状态**: ⏳ 待开始

**依赖**: Sprint 1 完成后开始

#### 任务清单

**2.1 项目初始化**
- [ ] 使用 Vite 创建 Vue 3 + TypeScript 项目 (`pnpm create vite frontend`)
- [ ] 配置 `tsconfig.json` 和路径别名 (@/)
- [ ] 安装核心依赖: `vue-router`, `pinia`, `axios`, `vueuse`
- [ ] 安装 UI 依赖: `@headlessui/vue`, `@heroicons/vue`
- [ ] 配置 `package.json` 脚本和 `packageManager`

**2.2 Tailwind CSS 集成**
- [ ] 安装 Tailwind CSS 和 PostCSS 插件
- [ ] 复制原型的 `tailwind.config.js` 配置
- [ ] 配置自定义颜色、字体、阴影
- [ ] 创建 `styles/base.css` 并引入 Tailwind 指令
- [ ] 配置 FontAwesome 图标系统

**2.3 路由配置**
- [ ] 创建 `router/index.ts` 配置文件
- [ ] 定义五个核心路由: `/`, `/ranking-cn`, `/ranking-global`, `/roles`, `/share`
- [ ] 配置路由懒加载和页面标题
- [ ] 实现路由守卫和页面切换动画
- [ ] 添加 404 页面

**2.4 状态管理 (Pinia)**
- [ ] 创建 `stores/` 目录结构
- [ ] 实现 `useStatsStore` (国内榜/海外榜数据)
- [ ] 实现 `useRolesStore` (角色数据)
- [ ] 实现 `usePhraseStore` (吐槽文案数据)
- [ ] 实现 `useUIStore` (UI 状态: 加载、错误提示等)
- [ ] 配置 Pinia 持久化插件 (可选)

**2.5 TypeScript 类型定义**
- [ ] 创建 `types/` 目录
- [ ] 定义 API 响应类型 (`types/api.ts`)
- [ ] 定义数据模型类型 (`types/models.ts`): Region, Role, Phrase, Stats
- [ ] 定义组件 Props 类型 (`types/components.ts`)
- [ ] 从 `mock-data.js` 提取类型定义

**2.6 API 请求层封装**
- [ ] 创建 `api/` 目录
- [ ] 配置 Axios 实例 (`api/request.ts`): 拦截器、超时、错误处理
- [ ] 实现 `api/hit.ts` (点击接口)
- [ ] 实现 `api/stats.ts` (统计接口)
- [ ] 实现 `api/phrases.ts` (文案接口)
- [ ] 添加请求取消和防抖逻辑

**2.7 通用组件开发**
- [ ] `NavigationBar.vue` (顶部导航,路由高亮)
- [ ] `Footer.vue` (页脚)
- [ ] `LoadingSpinner.vue` (加载动画)
- [ ] `ErrorMessage.vue` (错误提示)
- [ ] `BaseButton.vue` (按钮基础组件)
- [ ] `BaseCard.vue` (卡片基础组件)

**2.8 环境配置与工具**
- [ ] 创建 `.env.development` 和 `.env.production`
- [ ] 配置 API 基础路径 (`VITE_API_BASE_URL`)
- [ ] 配置 ESLint 和 Prettier
- [ ] 添加 Git hooks (husky + lint-staged)
- [ ] 配置构建优化和代码分割

#### 验收标准
- ✅ 开发服务器正常运行 (`pnpm run dev`)
- ✅ 路由导航正常,页面切换流畅
- ✅ Pinia 状态管理工作正常
- ✅ API 请求可正确调用后端接口
- ✅ 通用组件可复用且样式正确

---

### Sprint 3: 核心页面开发 - 首页与榜单

**目标**: 实现首页、国内榜、海外榜三��核心页面

**时间**: 5-6 天

**状态**: ⏳ 待开始

**依赖**: Sprint 2 完成后开始

#### 任务清单

**3.1 首页开发 (Home.vue)**

*3.1.1 怒气按钮组件*
- [ ] 创建 `RageButton.vue` 组件
- [ ] 实现多档位渐变动画 (根据点击次数)
- [ ] 集成音效系统 (不同等级不同音效)
- [ ] 实现点击反馈动画 (涟漪效果)
- [ ] 对接 `/api/hit` 接口
- [ ] 实现节流防抖 (避免恶意刷量)

*3.1.2 统计卡片组件*
- [ ] 创建 `StatCard.vue` (展示今日/总计数据)
- [ ] 实现数字滚动动画 (CountUp.js)
- [ ] 显示怒气等级和趋势
- [ ] 实时更新统计数据
- [ ] 响应式布局适配

*3.1.3 榜单预览组件*
- [ ] 创建 `RankingPreview.vue` (双列榜单)
- [ ] 支持国内/海外切换
- [ ] 显示 Top 10 城市/国家
- [ ] 添加"查看完整榜单"链接
- [ ] 实现数据自动刷新

*3.1.4 活动卡片与分享引导*
- [ ] 创建活动卡片组件
- [ ] 添加"分享怒气"CTA 按钮
- [ ] 跳转到吐槽卡页面

**3.2 国内榜开发 (RankingChina.vue)**

*3.2.1 地图集成*
- [ ] 安装 ECharts 和 Vue-ECharts
- [ ] 集成中国地图 (china.json)
- [ ] 实现热力图数据可视化
- [ ] 地图交互: 点击省份高亮
- [ ] 地图自适应容器大小

*3.2.2 榜单列表组件*
- [ ] 创建 `CityRankingList.vue`
- [ ] 显示城市名称、怒气等级、点击数
- [ ] 添加怒气等级徽标和颜色
- [ ] 显示趋势百分比 (上升/下降)
- [ ] 支持分页或虚拟滚动

*3.2.3 日榜/总榜切换*
- [ ] 实现 Tab 切换组件
- [ ] 对接 `/api/stats/china?type=daily|total`
- [ ] 切换时更新地图和榜单
- [ ] URL 查询参数同步 (date, type)

*3.2.4 怒气提醒卡片*
- [ ] ��建提醒卡片组件
- [ ] 显示热点城市事件
- [ ] 动态加载提醒内容

**3.3 海外榜开发 (RankingGlobal.vue)**

*3.3.1 世界地图集成*
- [ ] 集成世界地图 (world.json)
- [ ] 实现热力图可视化
- [ ] 地图交互和高亮

*3.3.2 国家榜单列表*
- [ ] 创建 `CountryRankingList.vue`
- [ ] 显示国家名称、怒气等级、点击数
- [ ] 对接 `/api/stats/global` 接口
- [ ] 支持日榜/总榜切换

*3.3.3 页面优化*
- [ ] 移除冗余模块 (精简设计)
- [ ] 保持与国内榜一致的布局风格
- [ ] 响应式适配

#### 验收标准
- ✅ 首页怒气按钮可正常点击并更新数据
- ✅ 音效系统正常工作
- ✅ ECharts 地图正常显示且数据正确
- ✅ 榜单数据实时更新
- ✅ 日榜/总榜切换流畅
- ✅ 移动端显示正常

---

### Sprint 4: 角色入口与吐槽卡页面

**目标**: 实现角色入口和吐槽卡分享页面

**时间**: 4-5 天

**状态**: ⏳ 待开始

**依赖**: Sprint 3 完成后开始

#### 任务清单

**4.1 角色入口页面 (Roles.vue)**

*4.1.1 角色数据管理*
- [ ] 定义角色数据结构 (基于 mock-data.js)
- [ ] 后端添加 `/api/roles` 接口 (可选,或使用前端静态数据)
- [ ] 实现角色数据加载和缓存

*4.1.2 角色卡片组件*
- [ ] 创建 `RoleCard.vue` 组件
- [ ] 渐变头像 (FontAwesome Icon + 渐变背景)
- [ ] 等级徽标显示 (🔥 最热, ✨ 新增)
- [ ] 角色描述和引用吐槽
- [ ] "进入怒气现场" CTA 按钮

*4.1.3 页面布局与交互*
- [ ] 卡片栅格布局 (桌面3列,移动1列)
- [ ] 角色总数统计显示
- [ ] 角色筛选功能 (可选)
- [ ] 搜索功能 (可选)
- [ ] 点击卡片跳转到首页并携带角色参数 (`?role=key`)

*4.1.4 样式优化*
- [ ] 按钮高对比度渐变
- [ ] 卡片 Hover 效果
- [ ] 响应式适配

**4.2 吐槽卡页面 (Share.vue)**

*4.2.1 卡片模板编辑器*
- [ ] 创建 `TemplateEditor.vue` 组件
- [ ] 文本输入框 (吐槽内容)
- [ ] 角色选择器
- [ ] 背景颜色/样式选择
- [ ] 实时预览联动

*4.2.2 卡片预览组件*
- [ ] 创建 `CardPreview.vue` 组件
- [ ] 显示编辑后的卡片效果
- [ ] 支持多种模板样式
- [ ] 对接 `/api/phrases/:page` 接口获取推荐文案

*4.2.3 图片生成与下载*
- [ ] 安装 `html2canvas` 或 `dom-to-image`
- [ ] 实现卡片导出为图片功能
- [ ] 添加下载按钮
- [ ] 添加水印 (nowork.click)

*4.2.4 社交分享功能*
- [ ] 生成分享链接 (带 UTM 参数)
- [ ] 复制链接到剪贴板
- [ ] 预设分享文案
- [ ] 分享到微信/微博/Twitter (可选)

*4.2.5 模板列表*
- [ ] 显示历史生成的卡片
- [ ] 模板筛选功能
- [ ] 快速应用模板

#### 验收标准
- ✅ 角色卡片正确显示且可点击跳转
- ✅ 角色参数正确传递到首页
- ✅ 吐槽卡编辑器功能正常
- ✅ 图片生成和下载功能正常
- ✅ 分享链接可正确复制

---

### Sprint 5: 体验优化与高级功能

**目标**: 优化用户体验,完善动画、音效、响应式设计

**时间**: 3-4 天

**状态**: ⏳ 待开始

**依赖**: Sprint 4 完成后开始

#### 任务清单

**5.1 音效系统完善**
- [ ] 准备不同怒气等级的音效文件 (5档)
- [ ] 创建 `composables/useSound.ts`
- [ ] 实现音效预加载
- [ ] 添加音效开关 (用户可控)
- [ ] 音效音量控制

**5.2 动画系统优化**
- [ ] 怒气按钮渐变动画优化
- [ ] 粒子效果 (点击时爆发粒子)
- [ ] 页面切换过渡动画
- [ ] 榜单数据更新动画
- [ ] 骨架屏加载动画

**5.3 响应式设计完善**
- [ ] 移动端适配 (375px - 768px)
- [ ] 平板适配 (768px - 1024px)
- [ ] 桌面端适配 (1024px+)
- [ ] 触摸优化 (移动端手势)
- [ ] 字体大小自适应

**5.4 性能优化**
- [ ] 组件懒加载和代码分割
- [ ] 图片懒加载和优化
- [ ] ECharts 按需引入
- [ ] 虚拟滚动 (长列表)
- [ ] 防抖节流优化

**5.5 错误处理与用户反馈**
- [ ] 全局错误拦截器
- [ ] Toast 提示组件
- [ ] 网络错误友好提示
- [ ] 加载状态指示
- [ ] 空状态设计

**5.6 SEO 与可访问性**
- [ ] Meta 标签优化 (title, description, og:image)
- [ ] 语义化 HTML
- [ ] ARIA 标签添加
- [ ] Lighthouse 性能测试 (目标 90+)
- [ ] SSR/SSG 评估 (可选)

#### 验收标准
- ✅ 移动端体验流畅
- ✅ 音效系统完善且可控
- ✅ 页面加载性能优异 (Lighthouse 90+)
- ✅ 错误处理友好
- ✅ 可访问性达标

---

### Sprint 6: 后端增强与数据管理

**目标**: 完善后端功能,添加管理接口和数据导出

**时间**: 3-4 天

**状态**: ⏳ 待开始

**依赖**: Sprint 1-5 并行或完成后开始

#### 任务清单

**6.1 IP 定位增强**
- [ ] 实现 ip-api.com 回退机制
- [ ] 添加多个 IP 定位服务提供商
- [ ] 实现智能降级策略
- [ ] IP 定位准确率统计

**6.2 角色数据管理接口**
- [ ] 设计角色数据表结构
- [ ] 实现 `/api/roles` GET 接口
- [ ] 实现 `/api/roles/:id` CRUD 接口
- [ ] 角色数据导入导出

**6.3 数据导出功能**
- [ ] 实现 CSV 导出 (`/api/export/stats`)
- [ ] 实现 Excel 导出 (使用 exceljs)
- [ ] 支持日期范围筛选
- [ ] 支持分页导出 (大数据量)

**6.4 管理后台 API (可选)**
- [ ] 认证与授权 (JWT)
- [ ] 统计数据总览接口
- [ ] 用户行为分析接口
- [ ] 系统健康检查接口

**6.5 WebSocket 实时推送 (可选)**
- [ ] 集成 Socket.IO
- [ ] 实时推送点击事件
- [ ] 实时更新排行榜
- [ ] 房间管理和广播

**6.6 日志与监控**
- [ ] 结构化日志输出
- [ ] 慢查询日志
- [ ] API 性能监控
- [ ] 错误告警机制

#### 验收标准
- ✅ IP 定位回退机制正常工作
- ✅ 数据导出功能正常
- ✅ 管理接口可用 (如果实现)
- ✅ 日志完整且可追溯

---

### Sprint 7: 测试、部署与上线

**目标**: 全面测试,生产部署,上线发布

**时间**: 4-5 天

**状态**: ⏳ 待开始

**依赖**: Sprint 1-6 全部完成

#### 任务清单

**7.1 后端测试**
- [ ] 编写单元测试 (Vitest)
  - [ ] 服务层测试 (IP 定位、统计聚合)
  - [ ] Redis 操作测试
  - [ ] Worker 测试
- [ ] 编写集成测试
  - [ ] API ��口测试
  - [ ] 数据库操作测试
  - [ ] Redis 集成测试
- [ ] 测试覆盖率 > 70%

**7.2 前端测试**
- [ ] 组件单元测试 (Vitest + Testing Library)
  - [ ] 按钮组件测试
  - [ ] 卡片组件测试
  - [ ] 榜单组件测试
- [ ] E2E 测试 (Playwright)
  - [ ] 首页交互测试
  - [ ] 榜单页面测试
  - [ ] 吐槽卡生成测试
- [ ] 测试覆盖核心功能

**7.3 性能测试**
- [ ] 后端压力测试 (Apache Bench / k6)
  - [ ] `/api/hit` 接口 (目标 100+ QPS)
  - [ ] `/api/stats` 接口
- [ ] 前端性能测试 (Lighthouse)
  - [ ] 性能分数 > 90
  - [ ] 可访问性分数 > 90
- [ ] 数据库查询优化
- [ ] Redis 缓存命中率分析

**7.4 生产环境配置**
- [ ] 配置生产环境变量 (`.env.prod`)
- [ ] Docker 生产镜像优化
  - [ ] 多阶段构建
  - [ ] 镜像体积优化
  - [ ] 健康检查配置
- [ ] Nginx 反向代理配置
  - [ ] HTTPS 证书配置
  - [ ] Gzip 压缩
  - [ ] 静态资源缓存
- [ ] 数据库备份策略
- [ ] Redis 持久化配置

**7.5 CI/CD 流程**
- [ ] 配置 GitHub Actions
  - [ ] 自动测试流程
  - [ ] 自动构建流程
  - [ ] 自动部署流程
- [ ] 前端部署到 Cloudflare Pages
- [ ] 后端部署到服务器 (Docker Compose)
- [ ] 数据库迁移脚本

**7.6 监控与告警**
- [ ] 接入 Cloudflare Analytics
- [ ] 配置 Prometheus + Grafana (可选)
  - [ ] QPS 监控
  - [ ] Redis 监控
  - [ ] MySQL 监控
  - [ ] API 响应时间
- [ ] 日志聚合 (Loki)
- [ ] 告警规则配置
  - [ ] API 错误率告警
  - [ ] Redis 队列积压告警
  - [ ] 数据库连接数告警

**7.7 文档与发布**
- [ ] 更新 README.md
- [ ] 编写部署文档
- [ ] 编写运维手册
- [ ] 编写 API 文档
- [ ] 发布 v1.0.0 版本

#### 验收标准
- ✅ 所有测试通过,覆盖率达标
- ✅ 性能指标达标 (QPS、响应时间、Lighthouse)
- ✅ 生产环境部署成功
- ✅ 监控和告警系统正常运行
- ✅ 文档齐全

## 待开发功能优先级

### P0 (必须完成)
- Redis 集成和 Worker 落库机制
- Vue 3 前端初始化和核心页面
- ECharts 地图集成
- 基础音效系统

### P1 (重要功能)
- 吐槽卡生成和分享
- 响应式优化
- ip-api.com 回退机制
- 基础监控

### P2 (优化项)
- 单元测试和集成测试
- 管理后台
- WebSocket 实时推送
- 高级动画效果

## 参考文档

- [项目开发计划](docs/development-plan.md) - 完整技术方案和功能设计
- [原型设计文档](prototype/README.md) - UI/UX 设计说明
- [Fastify 官方文档](https://fastify.dev/)
- [ip2region 文档](https://github.com/lionsoul2014/ip2region)

---

## 快速开始新 Sprint 检查清单

### 开始 Sprint 前

- [ ] 确认上一个 Sprint 的验收标准全部达标
- [ ] 更新 Git 分支 (`git checkout -b sprint-N/feature-name`)
- [ ] 检查依赖项是否需要更新 (`pnpm outdated`)
- [ ] 同步 Docker 环境 (`docker compose -f docker/docker-compose.dev.yml pull`)

### Sprint 进行中

- [ ] 每日提交代码并推送到远程仓库
- [ ] 更新 CLAUDE.md 中对应 Sprint 的任务清单 (✅/🔄/❌)
- [ ] 遇到阻塞问题时记录到 `docs/blockers.md` (可选)
- [ ] 定期运行测试确保功能正常

### Sprint 结束时

- [ ] 运行完整测试套件 (`pnpm run test`)
- [ ] 检查验收标准是否全部通过
- [ ] 合并代码到 main 分支
- [ ] 更新 Sprint 状态为 ✅ 已完成
- [ ] 在 Git 上打 Tag (`git tag sprint-N-complete`)

---

## 常见问题排查

### 后端问题

**Redis 连接失败**
```bash
# 检查 Redis 容器状态
docker ps | grep redis
docker logs nowork-redis-dev

# 手动连接测试
docker exec -it nowork-redis-dev redis-cli ping
```

**MySQL 连接失败**
```bash
# 检查 MySQL 健康状态
docker inspect nowork-mysql-dev | grep Health

# 查看错误日志
docker logs nowork-mysql-dev
```

**TypeScript 编译错误**
```bash
# 清理缓存重新编译
rm -rf dist/
pnpm run build
```

### 前端问题

**依赖安装失败**
```bash
# 清理 pnpm 缓存
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**端口被占用**
```bash
# Windows 查找占用 3000 端口的进程
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Docker 问题

**容器启动失败**
```bash
# 查看详细日志
docker compose -f docker/docker-compose.dev.yml logs --tail=100

# 重建容器
docker compose -f docker/docker-compose.dev.yml down -v
docker compose -f docker/docker-compose.dev.yml up -d --build
```

**磁盘空间不足**
```bash
# 清理未使用的 Docker 资源
docker system prune -a --volumes
```