import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import { env } from './config/env';
import mysqlPlugin from './plugins/mysql';
import rateLimitPlugin from './plugins/rate-limit';
import redisPlugin from './plugins/redis';
import { registerRoutes } from './routes';
import { createClickFlushJob } from './jobs/click-flush.job';

export const buildServer = () => {
  const app = Fastify({
    logger: {
      level: env.logLevel
    },
    trustProxy: true
  });

  app.register(sensible);
  app.register(cors, {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });
  app.register(mysqlPlugin);
  app.register(redisPlugin);
  app.register(rateLimitPlugin);
  app.register(registerRoutes, { prefix: '/api' });

  app.get('/health', async () => ({ status: 'ok' }));

  const clickFlushJob = createClickFlushJob(app);

  app.addHook('onReady', async () => {
    clickFlushJob.start();
  });

  app.addHook('onClose', async () => {
    clickFlushJob.stop();
  });

  return app;
};
