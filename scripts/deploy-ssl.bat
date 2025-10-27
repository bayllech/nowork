@echo off
echo ==================================
echo HTTPS 部署脚本
echo ==================================
echo.

echo [1/6] 检查 Docker 是否运行...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: Docker 未运行，请先启动 Docker Desktop
    pause
    exit /b 1
)
echo ✓ Docker 正在运行
echo.

echo [2/6] 停止现有服务...
docker compose -f docker/docker-compose.prod.yml down
echo.

echo [3/6] 检查 SSL 证书...
if not exist "docker\ssl\cert.pem" (
    echo SSL 证书不存在，正在生成自签名证书...
    echo.
    echo 选择证书生成方式:
    echo 1. 使用 PowerShell 生成自签名证书 (推荐)
    echo 2. 使用 OpenSSL 生成 (需要安装 OpenSSL)
    echo 3. 跳过 (我已有证书)
    echo.
    set /p choice="请选择 (1/2/3): "

    if "%choice%"=="1" (
        echo 正在使用 PowerShell 生成证书...
        powershell -ExecutionPolicy Bypass -File scripts/generate-ssl.ps1
    ) else if "%choice%"=="2" (
        echo 正在使用 OpenSSL 生成证书...
        call scripts/generate-ssl.bat
    ) else (
        echo 请手动将证书文件放置到 docker\ssl\ 目录
        echo - cert.pem (证书文件)
        echo - key.pem (私钥文件)
    )
)

if exist "docker\ssl\cert.pem" (
    echo ✓ SSL 证书已准备就绪
) else (
    echo 警告: SSL 证书不存在，将继续使用 HTTP
)
echo.

echo [4/6] 重新构建并启动服务...
docker compose -f docker/docker-compose.prod.yml up -d --build
echo.

echo [5/6] 等待服务启动...
timeout /t 10 /nobreak >nul
echo.

echo [6/6] 检查服务状态...
docker compose -f docker/docker-compose.prod.yml ps
echo.

echo 检查端口监听:
netstat -an | findstr ":80"
netstat -an | findstr ":443"
echo.

echo ==================================
echo 部署完成！
echo ==================================
echo.
echo 下一步:
echo 1. 如果使用自签名证书，请将 Cloudflare SSL 模式设为 Flexible
echo 2. 如果使用 Cloudflare Origin CA 证书，请设为 Full (strict)
echo 3. 更新 Cloudflare 页面规则以强制 HTTPS
echo.
echo 测试命令:
echo curl -I http://nowork.click
echo curl -I https://nowork.click
echo.
pause