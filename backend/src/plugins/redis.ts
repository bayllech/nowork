import fastifyRedis from '@fastify/redis';
import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { env } from '../config/env';

const redisPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyRedis, {
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password || undefined,
    db: env.redis.db,
    keyPrefix: env.redis.keyPrefix,
    closeClient: true
  });
};

export default fp(redisPlugin);
