import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import { env } from './config/env';
import mysqlPlugin from './plugins/mysql';
import rateLimitPlugin from './plugins/rate-limit';
import { registerRoutes } from './routes';

export const buildServer = () => {
  const app = Fastify({
    logger: {
      level: env.logLevel
    },
    trustProxy: true
  });

  app.register(sensible);
  app.register(mysqlPlugin);
  app.register(rateLimitPlugin);
  app.register(registerRoutes, { prefix: '/api' });

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
};
