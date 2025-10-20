# nowork.click 项目开发文档

## 1. 项目概述

- **产品定位**：面向打工人的线上情绪宣泄平台，通过猛击按钮释放工作不满情绪，同时展示省市及海外敲击排行榜。
- **核心功能**：
  - 超大情绪按钮，依据敲击频率呈现不同怒气动画和音效。
  - 省市排行榜（含日榜/总榜），海外国家排行榜。
  - 按页面分类的吐槽文案池，生成可复制的吐槽卡片。
- **上线目标**：单人 3 天完成 MVP，后续迭代可扩展文案库、数据监控与性能优化。

## 2. 架构设计

- **前端**：Vue 3 + Vite + TypeScript + Pinia + Vue Router；UI 样式可选 UnoCSS/Tailwind；部署到 Cloudflare Pages 或其他静态 CDN。
- **后端**：Node.js 18 + Fastify + TypeScript；提供 REST API；通过 Docker 部署到云服务器；进程管理使用 docker compose。
- **数据库**：MySQL 8（容器化部署）；主要用于存储点击统计与吐槽文案。
- **网络与安全**：
  - 所有外部流量先到 Cloudflare（SSL Full），再由 Cloudflare 转发至云服务器。
  - 云服务器上使用 Nginx 反向代理到 Fastify 服务。
  - 仅开放 80/443/22（或管理端口），MySQL 只在内部网络暴露。

## 3. 功能模块

### 3.1 前端模块

- **主页**：情绪按钮 + 怒气动画/音效 + 今日/总点击数 + 吐槽卡片入口。
- **排行榜页**：
  - 中国地图热力图（ECharts），根据省份/城市统计展示颜色梯度。
  - 海外榜单列表（国家维度）。
  - 日榜 / 总榜切换。
- **角色页**：不同角色的按钮场景（如老板、甲方等），复用按钮组件与分类文案。
- **吐槽卡片弹层**：读取对应页面的随机文案，组合当前点击数据，提供一键复制。
- **适配性**：桌面端体验优先，移动端保持按钮和榜单可用性。

### 3.2 后端模块

- **HitController**：处理 `/api/hit`，负责记录点击、计算怒气等级、返回文案。
- **StatsController**：提供 `/api/stats/china`、`/api/stats/global` 等接口。
- **PhraseController**：返回页面分类对应的吐槽文案池。
- **GeoService**：基于 ip2region（本地库）定位 IP，必要时回退到 ip-api.com。
- **RankingService**：封装统计逻辑与缓存策略。
- **RateLimit 中间件**：限制单 IP 高频请求，防止刷榜。

## 4. 数据库设计

### 4.1 表结构

```sql
CREATE TABLE hit_ip_cache (
  ip            VARCHAR(45) PRIMARY KEY,
  country       VARCHAR(64) NOT NULL,
  province      VARCHAR(64) NOT NULL,
  city          VARCHAR(64) NOT NULL,
  last_update   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE stat_total_region (
  country   VARCHAR(64) NOT NULL,
  province  VARCHAR(64) NOT NULL,
  city      VARCHAR(64) NOT NULL,
  page      VARCHAR(32) NOT NULL,
  count     BIGINT      NOT NULL DEFAULT 0,
  PRIMARY KEY (country, province, city, page)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE stat_daily_region (
  stat_date DATE        NOT NULL,
  country   VARCHAR(64) NOT NULL,
  province  VARCHAR(64) NOT NULL,
  city      VARCHAR(64) NOT NULL,
  page      VARCHAR(32) NOT NULL,
  count     BIGINT      NOT NULL DEFAULT 0,
  PRIMARY KEY (stat_date, country, province, city, page),
  INDEX idx_daily_page (stat_date, page, count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE phrases (
  id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  page      VARCHAR(32) NOT NULL,
  content   TEXT        NOT NULL,
  weight    INT         NOT NULL DEFAULT 1,
  created_at DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phrase_page (page)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.2 数据写入与聚合

- `/api/hit` 调用后：
  - 查询 `hit_ip_cache`，若无命中则解析 IP 并写入缓存。
  - 使用 `INSERT ... ON DUPLICATE KEY UPDATE` 同步更新 `stat_total_region` 与 `stat_daily_region`。
  - 根据今日点击量判定怒气档位（如 0-50、51-200、200+）。
  - 返回最新累计数据与随机吐槽文案。
- 后续若访问量提升，可引入 `hit_log` 明细表 + 定时聚合或消息队列。

## 5. API 设计

| 方法 | 路径 | 描述 |
| ---- | ---- | ---- |
| POST | `/api/hit` | 记录一次点击并返回统计数据与文案 |
| GET  | `/api/stats/china` | 获取指定日期的中国省市排行榜 |
| GET  | `/api/stats/global` | 获取指定日期的海外国家排行榜 |
| GET  | `/api/phrases` | 获取指定页面分类的吐槽文案池 |

### 5.1 POST /api/hit

- 请求体：
  ```json
  {
    "page": "boss"
  }
  ```
- 响应：
  ```json
  {
    "totalCount": 12345,
    "dailyCount": 678,
    "angerLevel": 2,
    "phrase": "今天再有需求变更我就自我复制加班"
  }
  ```
- 说明：`angerLevel` 取值 `0/1/2/3`，用于前端切换动画和音效。

### 5.2 GET /api/stats/china

- 查询参数：`date`（YYYY-MM-DD，可选，默认当天），`page`（页面分类，可选，默认 `all`）。
- 响应示例：
  ```json
  [
    {
      "province": "广东省",
      "provinceCode": "GD",
      "count": 5200,
      "cities": [
        { "city": "深圳市", "count": 2600 },
        { "city": "广州市", "count": 1800 }
      ]
    }
  ]
  ```

### 5.3 GET /api/stats/global

- 查询参数：与 `/api/stats/china` 相同。
- 响应示例：
  ```json
  [
    { "country": "United States", "count": 320 },
    { "country": "Japan", "count": 180 }
  ]
  ```

### 5.4 GET /api/phrases

- 查询参数：`page`（必填，如 `boss`、`client`、`default`）。
- 响应示例：
  ```json
  [
    { "id": 1, "content": "甲方需求像风一样，说改就改", "weight": 1 },
    { "id": 2, "content": "今天的需求我决定藏在回车键里", "weight": 2 }
  ]
  ```

## 6. 部署方案

### 6.1 Docker 结构

```yaml
services:
  backend:
    build: ./backend
    env_file: .env
    volumes:
      - ./data/ip2region.xdb:/app/ip2region.xdb:ro
    depends_on:
      - mysql
    networks:
      - appnet

  mysql:
    image: mysql:8
    command: --default-authentication-plugin=mysql_native_password
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: nowork
    volumes:
      - ./data/mysql:/var/lib/mysql
    networks:
      - appnet

  nginx:
    image: nginx:alpine
    volumes:
      - ./deploy/nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
    depends_on:
    - backend
    networks:
      - appnet

networks:
  appnet:
    driver: bridge
```

- 前端静态资源部署在 Cloudflare Pages，或 Nginx 对 `/` 做反向代理 `https://pages.cloudflare.com/...`。
- Cloudflare 负责 HTTPS 证书与 CDN。

### 6.2 运维要点

- 使用 `docker compose up -d` 启动，结合 `watchtower` 定时更新镜像。
- 设置 `logrotate`（或 docker 自带的日志轮转）控制 backend 输出日志大小。
- MySQL 定时备份：`mysqldump nowork > backup-$(date +%F).sql`，可通过 crontab 每日执行。
- 新版部署流程：
  1. 后端：CI 推送镜像 → 服务器拉取镜像 → `docker compose up -d backend`.
  2. 前端：CI 构建 → 上传静态资源至 Cloudflare Pages。

### 6.3 Docker 配置文件位置

- `docker/docker-compose.dev.yml`：本地开发环境，挂载源码目录，执行 `pnpm install && pnpm run dev`。
- `docker/docker-compose.prod.yml`：生产部署模板，包含 `backend`、`mysql`、`nginx` 三个服务。
- `docker/backend.Dockerfile`：多阶段构建镜像，`target=dev` 用于开发，默认阶段用于生产。
- `docker/nginx.conf`：生产环境反向代理配置，仅转发 `/api/*` 与 `/health`。
- `.env.example`：环境变量示例，请复制为 `.env.dev` 与 `.env.prod` 并按需调整。

## 9. 后端开发指南
- **目录结构**：`backend/src` 按 `config`、`plugins`、`routes`、`services` 划分，`app.ts` 负责实例化 Fastify，`main.ts` 负责启动服务。
- **运行命令**：
  - `pnpm install`：安装依赖。
  - `pnpm dev`：本地开发热更新（默认监听 `3000` 端口）。
  - `pnpm build`：TypeScript 编译产物输出到 `dist/`。
  - `pnpm start`：读取 `dist/main.js` 启动生产服务。
  - `pnpm lint`：运行 `tsc --noEmit` 做类型检查。
  - `pnpm db:init`：根据 `.env` 配置连接 MySQL，创建表结构并导入初始吐槽文案。确保先启动 MySQL 或通过 Docker Compose 提供服务。
- **环境变量说明**：
  - `IP2REGION_PATH` 如未指定，会自动回退到 `node_modules/ip2region/data/ip2region.db`。如需替换成最新库，可将下载的 `ip2region.db` 放到 `data/` 目录并在 `.env.*` 中指定绝对路径。
  - `RATE_LIMIT_PER_MINUTE`、`RATE_LIMIT_BURST` 控制全局频控与 `/api/hit` 瞬时频控阈值，可根据实际访问量调整。
- **接口概览**：
  - `POST /api/hit`：记录点击，返回总量、日量、怒气等级以及随机吐槽文案。
  - `GET /api/stats/china`：按省市返回榜单，支持 `period=daily|total`、`date=YYYY-MM-DD`、`page=xxx`。
  - `GET /api/stats/global`：返回海外榜单，参数同上。
  - `GET /api/phrases`：获取吐槽文案池，支持分页（`limit`）和页面分类。
- **数据一致性建议**：`stat_total_region` 与 `stat_daily_region` 均通过 `INSERT ... ON DUPLICATE KEY UPDATE` 即时累加，后续若流量增大，可改为日志表 + 定时聚合策略。

## 7. 开发计划

| 日期 | 工作内容 |
| ---- | -------- |
| Day 1 | 后端项目初始化、MySQL 建表、实现 `/api/hit`、完成 IP 定位与速率限制；前端搭建骨架、按钮基础交互。 |
| Day 2 | 完成排行榜 API 与缓存策略；前端实现中国地图/海外榜单；怒气动画、音效、吐槽文案对接。 |
| Day 3 | 吐槽卡片功能、日榜切换、移动端适配；Docker 部署、联调、自测、撰写上线说明。 |

## 8. 后续扩展

- 支持导入更多文案来源（如 Google Sheet、后台 CMS）。
- 引入 Redis 缓存或消息队列，提高高并发写入能力。
- 增加运营数据面板（PV、UV、榜单趋势）。
- 设计活动玩法（如每日主题、连击成就）增强用户粘性。

---

本开发文档用于指导 nowork.click MVP 实施，如需修改请同步更新此文档以保持一致性。
