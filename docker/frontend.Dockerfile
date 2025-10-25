# 多阶段构建前端镜像：先用 Node 环境编译，再将静态资源打包进 Nginx
FROM node:18 AS base
WORKDIR /app/frontend
RUN npm install -g pnpm@10.18.2

# 安装前端依赖
FROM base AS deps
COPY frontend/pnpm-lock.yaml frontend/package.json ./
RUN pnpm install --frozen-lockfile

# 构建静态资源
FROM deps AS build
COPY frontend ./
COPY --from=deps /app/frontend/node_modules ./node_modules
ENV NODE_ENV=production
RUN pnpm run build

# 运行阶段：复用官方 Nginx 镜像承载静态资源
FROM nginx:1.27-alpine AS runner
ARG DIST_DIR=/usr/share/nginx/html
RUN rm -rf ${DIST_DIR:?}/*
COPY --from=build /app/frontend/dist ${DIST_DIR}
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# 开发阶段：注入源码和依赖，运行 Vite Dev Server
FROM base AS dev
ENV NODE_ENV=development
COPY frontend ./
COPY --from=deps /app/frontend/node_modules ./node_modules
EXPOSE 5173
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0", "--port", "5173"]
