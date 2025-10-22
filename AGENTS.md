# Repository Guidelines

## 项目结构与模块组织
- `frontend/`：Vue 3 + Vite 客户端，`src/` 下按页面视图、组件与 `stores/` 划分；静态资源统一放入 `public/` 与 `src/assets/`。
- `backend/`：Fastify + TypeScript 服务，`src/` 采用按功能分层（`plugins/`、`routes/`、`services/`、`schemas/`）；`sql/` 存放初始化脚本，`scripts/` 提供数据库与联调工具。
- `docs/`：产品与接口文档，供 PR 说明和架构对齐；`data/`、`prototype/` 用于示例数据与交互原型。
- `scripts/test-all.mjs`：一键集成验证脚本，会串联 Docker、后端 API 自测与前端构建。

## 构建、测试与本地开发命令
- 根目录：`pnpm test:all` 运行完整链路（需 Docker 与 Redis/MySQL），适合预提交校验。
- 后端：`pnpm --dir backend dev` 启动热重载；`pnpm --dir backend build` 编译；`pnpm --dir backend start` 运行编译产物；`pnpm --dir backend test:api` 执行 API 冒烟。
- 前端：`pnpm --dir frontend dev` 启动本地开发；`pnpm --dir frontend build` 产出静态资源；`pnpm --dir frontend test:unit` 执行 Vitest。
- 容器：`docker compose -f docker/docker-compose.dev.yml up -d mysql redis backend` 快速拉起依赖与服务。

## 代码风格与命名约定
- 统一使用 TypeScript，缩进 2 空格，遵循 ES 模块语法；Vue 单文件组件沿用 `<script setup lang="ts">`。
- 目录命名采用短横线或小写复数，例如 `services/`、`user-stats.ts`；接口 Schema 使用 `XXXSchema`，枚举常量大写蛇形。
- 后端使用 Zod 校验，确保请求/响应结构在 `schemas/` 描述；日志统一走 Pino，按 `context.action` 组织字段。

## 测试规范
- 前端单测基于 Vitest + Testing Library，测试文件命名 `*.spec.ts`，与被测文件同目录。
- 后端 API 冒烟测试在 `backend/scripts/test-api.ts`，新增路由需补用例并保证返回码与 Schema 匹配。
- 覆盖率目标：新增功能需 ≥80% 语句覆盖，涉及安全/支付必须达到 100% 的关键路径验证。

## 提交与拉取请求指南
- 提交信息沿用历史格式：`feat: ...`、`fix: ...`、`refactor: ...`，必要时追加中文说明具体影响。
- PR 描述包含：变更摘要、测试结果（命令+关键输出）、关联 Issue/需求编号；前端视觉改动需附截图或录屏。
- 在合并前确认 `pnpm test:all` 通过、Docker 资源释放，并更新相关文档（如 `docs/`、接口变更说明）。

## 安全与配置提示
- 环境变量集中在 `.env.*`，严禁将生产密钥写入仓库；联调请复制 `.env.example` 并根据环境命名。
- MySQL/Redis 凭据由 Docker compose 注入，部署时请在 CI/CD 中配置凭证密钥库。
- 日志与埋点属敏感数据，落盘前进行脱敏；导出数据置于 `data/export/`，遵循访问控制流程。
