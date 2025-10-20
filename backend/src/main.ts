import { buildServer } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const start = async () => {
  const app = buildServer();
  try {
    await app.listen({ port: env.port, host: '0.0.0.0' });
    logger.info(`Server started on port ${env.port}`);
  } catch (error) {
    logger.error(error, '服务启动失败');
    process.exit(1);
  }
};

start();
