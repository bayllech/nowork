import type { FastifyInstance } from 'fastify';
import { calculateRealtimeTotal, incrementButtonCounter } from '../services/click-counter.service';
import { clickParamsSchema, clickResponseSchema } from '../schemas/click.schema';

export default async function clickRoutes(app: FastifyInstance) {
  app.post('/:buttonId', async (request, reply) => {
    const parseParams = clickParamsSchema.safeParse(request.params);
    if (!parseParams.success) {
      return reply.notFound('button_not_supported');
    }

    const { buttonId } = parseParams.data;
    const redis = app.redis;
    const pool = app.mysql;

    try {
      const metrics = await incrementButtonCounter(redis, pool, buttonId);
      return reply.send(clickResponseSchema.parse(metrics));
    } catch (error) {
      request.log.error({ err: error }, 'redis_increment_failed');
      const message = error instanceof Error ? error.message : 'redis_increment_failed';
      if (message === 'redis_pipeline_error') {
        return reply.internalServerError('redis_pipeline_error');
      }
      if (message === 'button_not_supported') {
        return reply.notFound('button_not_supported');
      }
      return reply.internalServerError('redis_increment_failed');
    }
  });

  app.get('/:buttonId', async (request, reply) => {
    const parseParams = clickParamsSchema.safeParse(request.params);
    if (!parseParams.success) {
      return reply.notFound('button_not_supported');
    }

    const { buttonId } = parseParams.data;
    const redis = app.redis;
    const pool = app.mysql;

    const metrics = await calculateRealtimeTotal(redis, pool, buttonId);

    return reply.send(clickResponseSchema.parse(metrics));
  });
}
