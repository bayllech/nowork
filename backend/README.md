# nowork.click · 后端服务

基于 Fastify + TypeScript 实现的 API 服务，提供怒气按钮上报、榜单统计、角色与吐槽文案等接口。配合 MySQL 与 Redis 完成数据存储，并内置初始化/测试脚本。

## 环境准备

```bash
cd backend
cp ../.env.dev .env        # 如需自定义密码/主机，可在此文件中调整
pnpm install               # 安装依赖
pnpm db:init               # 初始化数据库结构、导入示例数据
pnpm dev                   # 启动开发模式（默认端口 3000）
pnpm test:api              # 运行内置 API 验证脚本
```

> 若通过 Docker 运行，Compose 中已自动注入 `MYSQL_HOST=mysql`、`REDIS_HOST=redis` 环境变量；本地运行时请保持 `.env` 中的 `MYSQL_HOST=127.0.0.1`。

## 目录速览

| 目录/文件 | 说明 |
| --- | --- |
| `src/routes/*.ts` | Fastify 路由，提供 `/api/hit`、`/api/stats/*`、`/api/phrases`、`/api/roles` 等接口 |
| `src/services/*` | 数据与业务逻辑（IP 定位、统计聚合、文案抽样等） |
| `sql/schema.sql` | 数据库结构定义 |
| `sql/seed_phrases.sql` | 默认吐槽文案种子数据 |
| `scripts/db-init.ts` | 初始化脚本（创建数据表、灌入示例榜单/文案） |
| `scripts/test-api.ts` | 注入式 API 自检脚本 |

## 与其他模块的配合

- 前端默认请求 `/api/*`，建议后端与前端运行在同源或通过反向代理解决跨域；
- 可使用项目根目录的 `pnpm test:all` 自动启动 Docker（MySQL/Redis/Backend）、运行 API 测试并构建前端；
- 示例数据已经覆盖国内关键城市与海外部分国家，打开前端即可立即看到榜单渲染效果。

更多设计背景与 MVP 范围见 `docs/mvp.md` 与 `docs/development-plan.md`。
