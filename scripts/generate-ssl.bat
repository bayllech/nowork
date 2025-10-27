@echo off
echo ==================================
echo 生成 SSL 证书
echo ==================================
echo.

REM 检查 OpenSSL 是否安装
openssl version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 OpenSSL
    echo 请先安装 OpenSSL 或使用 Git Bash 运行此脚本
    pause
    exit /b 1
)

echo 正在生成私钥...
openssl genrsa -out docker/ssl/key.pem 2048

echo.
echo 正在生成证书签名请求...
openssl req -new -key docker/ssl/key.pem -out docker/ssl/cert.csr -batch -subj "/C=CN/ST=State/L=City/O=Organization/CN=nowork.click"

echo.
echo 正在生成自签名证书...
openssl x509 -req -days 365 -in docker/ssl/cert.csr -signkey docker/ssl/key.pem -out docker/ssl/cert.pem

echo.
echo 清理临时文件...
del docker\ssl\cert.csr

echo.
echo ==================================
echo SSL 证书生成完成！
echo 证书文件: docker/ssl/cert.pem
echo 私钥文件: docker/ssl/key.pem
echo ==================================
echo.

echo 查看证书信息:
openssl x509 -in docker/ssl/cert.pem -text -noout | findstr "Subject:"

pause