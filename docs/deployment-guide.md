# 线上部署指南

## 1. 前置准备
- **操作系统**：建议使用安装了 Docker Engine 26+ 与 Docker Compose v2 的 Linux 服务器（如 Ubuntu 22.04）。
- **代码与配置**：将仓库完整拷贝至服务器，确认 `docker/docker-compose.prod.yml`、`docker/nginx.conf` 与 `docker/frontend.Dockerfile` 同步更新。
- **环境变量**：根据实际环境复制 `.env.prod`，补齐数据库、Redis、邮件或第三方服务等敏感信息。勿在生产使用默认密码。
- **目录结构**：提前创建数据与日志目录，并保证宿主机有写权限（示例指令）：
  ```bash
  mkdir -p data/mysql data/redis data/ip2region data/export logs/nginx
  cp ./data/ip2region.xdb ./data/ip2region.xdb
  ```
- **防火墙**：开放 80（HTTP）与 443（HTTPS 如需）端口；后端、数据库不暴露给公网。

## 2. 构建与启动
1. 登录服务器后执行：
   ```bash
   docker compose -f docker/docker-compose.prod.yml pull
   docker compose -f docker/docker-compose.prod.yml build --no-cache
   docker compose -f docker/docker-compose.prod.yml up -d
   ```
   - `pull` 优先尝试使用现有基础镜像；
   - `build` 会打包后端与前端镜像；
   - `up -d` 以后台方式启动 Nginx、Backend、MySQL、Redis 与静态资源服务。
2. 首次部署建议通过 `docker compose -f docker/docker-compose.prod.yml logs -f backend` 与 `logs -f nginx` 观察启动是否正常。

## 3. 部署后验证
- **自检接口**：访问 `http://<服务器IP>/health`，确认后端返回状态 200。
- **页面访问**：在浏览器打开 `http://<服务器IP>`，确保前端加载成功且接口无跨域报错。
- **容器状态**：`docker compose -f docker/docker-compose.prod.yml ps` 应显示全部服务为 `Up`。
- **日志检查**：查看 `logs/nginx`、后端容器日志是否存在异常。

## 4. Cloudflare 接入
1. 在 Cloudflare DNS 面板新增 A 记录指向服务器公网 IP，启用代理。
2. 打开 “Always Use HTTPS”“Auto Minify”“Cache by Device Type”等策略依据需求配置。
3. 若使用 Cloudflare 终止 TLS，可继续使用 HTTP 回源；否则在服务器上准备证书，扩展 `nginx.conf` 增加 `listen 443 ssl` 并挂载证书文件。

## 5. 更新与回滚
- **更新版本**：
  ```bash
  git pull
  docker compose -f docker/docker-compose.prod.yml build
  docker compose -f docker/docker-compose.prod.yml up -d
  ```
  Compose 会在镜像重建后自动重新创建对应容器。
- **回滚**：如需恢复上一版本，可指定旧镜像标签或使用 `git checkout` 回退代码后重新执行构建。
- **资源清理**：部署完成后可定期执行 `docker image prune -f` 清理悬空镜像，避免磁盘占满（谨慎操作）。

## 6. 故障排查
- **端口冲突**：若 `80` / `443` 已被占用，先释放端口或在 `docker-compose.prod.yml` 中调整宿主机映射。
- **数据持久化**：MySQL、Redis、日志均挂载至宿主机目录，迁移服务器时记得同时打包这些目录。
- **性能调优**：若访问量较大，可在 Cloudflare 开启缓存、Rate Limiting，并考虑单独托管 MySQL/Redis。

## 7. 后续建议
- 将 `docker compose -f docker/docker-compose.prod.yml up -d --build` 集成到 CI/CD 流程，结合 Git 标签或版本号管理镜像。
- 根据业务需求在 `docs/` 目录补充监控、告警与备份策略文档，确保线上可观测性与可恢复性。
