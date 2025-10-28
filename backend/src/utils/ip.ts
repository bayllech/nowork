import type { FastifyRequest } from 'fastify';
import { isIP } from 'node:net';

const isPrivateIpv4 = (ip: string) => {
  const segments = ip.split('.').map((value) => Number.parseInt(value, 10));
  if (segments.length !== 4 || segments.some((segment) => Number.isNaN(segment))) {
    return true;
  }

  const [a, b] = segments;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  return false;
};

const isPrivateIpv6 = (ip: string) => {
  const normalized = ip.toLowerCase();
  return (
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80') ||
    normalized.startsWith('::ffff:127.') ||
    normalized === '::'
  );
};

export const isPublicIp = (ip: string | null | undefined) => {
  if (!ip) return false;
  const version = isIP(ip);
  if (version === 4) {
    return !isPrivateIpv4(ip);
  }
  if (version === 6) {
    return !isPrivateIpv6(ip);
  }
  return false;
};

const pickPublicIp = (values: Array<string | undefined | null>) => {
  for (const value of values) {
    if (!value) continue;
    const trimmed = value.split(',').map((item) => item.trim()).filter(Boolean);
    for (const candidate of trimmed) {
      if (isPublicIp(candidate)) {
        return candidate;
      }
    }
  }
  return null;
};

export const extractClientIp = (request: FastifyRequest): string => {
  const headers = request.headers;
  const candidate = pickPublicIp([
    headers['cf-connecting-ip'] as string | undefined,
    headers['x-real-ip'] as string | undefined,
    headers['x-forwarded-for'] as string | undefined,
    request.ip
  ]);
  return candidate ?? '';
};
