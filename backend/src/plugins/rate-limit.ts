import rateLimit from '@fastify/rate-limit';
import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { env } from '../config/env';

const getClientKey = (request: FastifyRequest) => {
  const headers = request.headers;
  return (
    (headers['cf-connecting-ip'] as string) ??
    (headers['x-real-ip'] as string) ??
    (headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
    request.ip
  );
};

const rateLimitPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(rateLimit, {
    max: env.rateLimit.perMinute,
    timeWindow: '1 minute',
    ban: 0,
    continueExceeding: true,
    skipOnError: true,
    hook: 'onRequest',
    keyGenerator: getClientKey
  });
};

export default fp(rateLimitPlugin);
