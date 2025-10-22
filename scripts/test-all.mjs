#!/usr/bin/env node

/**
 * 一键验证脚本：启动 Docker 依赖 → 等待后端健康 → 跑通后端 API 测试 → 执行前端构建。
 * 使用方式：在仓库根目录执行 `pnpm test:all`。
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const composeFile = resolve(rootDir, 'docker', 'docker-compose.dev.yml');
const healthUrl = 'http://127.0.0.1:3000/health';

const runCommand = (command, args, options = {}) =>
  new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options
    });

    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });

const runPnpm = (args) => runCommand('pnpm', args);

const runDockerCompose = async (composeArgs) => {
  try {
    await runCommand('docker', ['compose', ...composeArgs]);
  } catch (error) {
    // 兼容旧的 docker-compose 命令
    await runCommand('docker-compose', composeArgs).catch((fallbackError) => {
      throw new Error(
        `无法执行 docker compose，请确认 Docker 已安装。\n原始错误：${error.message}\n回退错误：${fallbackError.message}`
      );
    });
  }
};

const waitForHealth = async (url, { timeoutMs = 60_000, intervalMs = 2_000 } = {}) => {
  const start = Date.now();
  // Node 18+ 提供 fetch
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json();
        if (json?.status === 'ok') {
          return;
        }
      }
    } catch {
      // ignore and retry
    }
    console.log(`等待后端健康检查通过（${intervalMs / 1000}s 后重试）...`);
    await wait(intervalMs);
  }
  throw new Error(`在 ${timeoutMs / 1000}s 内未能通过 ${url} 健康检查`);
};

async function main() {
  console.log('=== nowork.click 一键验证脚本 ===\n');

  console.log('1. 确认可执行依赖（pnpm / docker compose）...');
  await runCommand('pnpm', ['-v']);
  await runDockerCompose(['version']);

  console.log('\n2. 安装前后端依赖（如已安装将跳过）...');
  await runPnpm(['--dir', 'backend', 'install', '--frozen-lockfile']);
  await runPnpm(['--dir', 'frontend', 'install', '--frozen-lockfile']);

  console.log('\n3. 启动 Docker 依赖与后端服务...');
  await runDockerCompose(['-f', composeFile, 'up', '-d', '--build', 'mysql', 'redis', 'backend']);

  console.log('\n4. 等待后端健康检查通过...');
  await waitForHealth(healthUrl);
  console.log('后端服务已就绪。');

  console.log('\n5. 运行后端 API 测试...');
  await runPnpm(['--dir', 'backend', 'test:api']);

  console.log('\n6. 执行前端单元测试...');
  await runPnpm(['--dir', 'frontend', 'test:unit']);

  console.log('\n7. 执行前端构建验证...');
  await runPnpm(['--dir', 'frontend', 'build']);

  console.log('\n✅ 一键验证完成：Docker 服务仍在运行，可继续手动联调。');
  console.log('ℹ️ 如需停止相关容器，请执行：docker compose -f docker/docker-compose.dev.yml down');
}

main().catch((error) => {
  console.error('\n❌ 验证失败：', error.message);
  process.exitCode = 1;
});
