# 多阶段构建 Dockerfile,兼容开发与生产环境

# 基础镜像,使用 npm 安装 pnpm
FROM node:18 AS base
WORKDIR /app/backend
RUN npm install -g pnpm@10.18.2

# 安装依赖阶段
FROM base AS deps
COPY backend/package.json backend/pnpm-lock.yaml* ./
RUN pnpm install

# 构建阶段
FROM base AS builder
COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend .
RUN pnpm run build

# 生产运行阶段
FROM node:18-alpine AS runner
WORKDIR /app/backend
ENV NODE_ENV=production
RUN apk add --no-cache curl
RUN npm install -g pnpm@10.18.2
COPY --from=deps /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY backend/package.json backend/pnpm-lock.yaml* ./
EXPOSE 3000
CMD ["node", "dist/main.js"]

# 开发用阶段(docker compose 指定 target=dev)
FROM base AS dev
COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend .
CMD ["pnpm", "run", "dev"]
