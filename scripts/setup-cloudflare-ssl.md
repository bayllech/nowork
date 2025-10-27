# 配置 Cloudflare Origin CA 证书

## 方案一：使用 Cloudflare Origin CA 证书（推荐）

Cloudflare 提供免费的 Origin CA 证书，用于 Cloudflare 和源服务器之间的加密通信。

### 步骤 1：下载 Origin CA 证书

1. 登录 Cloudflare 控制面板
2. 进入 **SSL/TLS** -> **Origin Server** -> **Create Certificate**
3. 选择证书类型：
   - **RSA**: 兼容性更好
   - **ECC**: 性能更好，更现代
4. 主机名填写：
   - `nowork.click`
   - `*.nowork.click` (可选，用于子域名)
5. 证书有效期选择：15 年或更少
6. 点击 **Create**
7. 复制证书私钥和证书内容

### 步骤 2：创建证书文件

```bash
# 创建证书文件
cat > docker/ssl/cert.pem << 'EOF'
# 粘贴 Cloudflare 提供的证书内容
EOF

# 创建私钥文件
cat > docker/ssl/key.pem << 'EOF'
# 粘贴 Cloudflare 提供的私钥内容
EOF
```

### 步骤 3：设置文件权限

```bash
chmod 600 docker/ssl/key.pem
chmod 644 docker/ssl/cert.pem
```

### 步骤 4：重启 Nginx

```bash
docker compose -f docker/docker-compose.prod.yml restart nginx
```

## 方案二：使用 Let's Encrypt 证书

如果你需要支持非 Cloudflare 代理的访问（比如直接 IP 访问），可以使用 Let's Encrypt。

### 安装 Certbot（在服务器上）

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot

# CentOS/RHEL
sudo yum install certbot
```

### 生成证书

```bash
# 停止占用 80 端口的服务
docker compose -f docker/docker-compose.prod.yml stop nginx

# 生成证书
sudo certbot certonly --standalone -d nowork.click -d www.nowork.click

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/nowork.click/fullchain.pem docker/ssl/cert.pem
sudo cp /etc/letsencrypt/live/nowork.click/privkey.pem docker/ssl/key.pem
sudo chown $USER:$USER docker/ssl/*.pem
```

## 方案三：使用自签名证书（仅测试）

仅用于本地测试，浏览器会显示安全警告。

```bash
# 使用提供的脚本生成
scripts/generate-ssl.bat
```

## 验证 SSL 配置

1. 重启服务：
```bash
docker compose -f docker/docker-compose.prod.yml up -d
```

2. 检查端口：
```bash
netstat -an | findstr ":443"
```

3. 测试 HTTPS：
```bash
curl -k https://localhost:443
```

4. 设置 Cloudflare SSL 模式为 **Full (strict)**

## 常见问题

### 证书错误
- 确保 PEM 格式正确
- 检查文件权限
- 验证证书域名匹配

### 连接失败
- 检查防火墙是否开放 443 端口
- 确认 Nginx 配置语法正确
- 查看 Nginx 错误日志

### Cloudflare 525/526 错误
- 525: SSL Handshake Failed - 检查证书配置
- 526: Invalid SSL Certificate - 证书过期或域名不匹配