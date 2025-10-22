import type { FastifyInstance } from 'fastify';
import {
  baseKey,
  counterKey,
  ensureBaseCache,
  lastHitKey,
  calculateRealtimeTotal
} from '../services/click-counter.service';
import { clickParamsSchema, clickResponseSchema } from '../schemas/click.schema';

const LAST_HIT_TTL_SECONDS = 60;

export default async function clickRoutes(app: FastifyInstance) {
  app.post('/:buttonId', async (request, reply) => {
    const parseParams = clickParamsSchema.safeParse(request.params);
    if (!parseParams.success) {
      return reply.notFound('button_not_supported');
    }

    const { buttonId } = parseParams.data;
    const redis = app.redis;
    const pool = app.mysql;

    const pipelineResult = await redis
      .multi()
      .get(baseKey(buttonId))
      .incrby(counterKey(buttonId), 1)
      .exec();

    if (!pipelineResult) {
      request.log.error('Redis pipeline failed');
      return reply.internalServerError('redis_pipeline_error');
    }

    const baseRaw = pipelineResult[0]?.[1];
    const pendingValue = pipelineResult[1]?.[1];

    let baseCount: number;
    if (baseRaw === null || baseRaw === undefined) {
      baseCount = await ensureBaseCache(redis, pool, buttonId);
    } else {
      baseCount = Number(baseRaw);
    }

    const pending = Number(pendingValue ?? 0);
    const total = baseCount + pending;

    await redis.set(lastHitKey(buttonId), Date.now().toString(), 'EX', LAST_HIT_TTL_SECONDS);

    return reply.send(
      clickResponseSchema.parse({
        total,
        pending,
        base: baseCount
      })
    );
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
