import type { FastifyRequest } from 'fastify';

export const extractClientIp = (request: FastifyRequest): string => {
  const headers = request.headers;
  return (
    (headers['cf-connecting-ip'] as string) ??
    (headers['x-real-ip'] as string) ??
    (headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
    request.ip
  );
};
