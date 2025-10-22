import type { MySQLPromisePool } from '@fastify/mysql';
import type { Redis } from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    mysql: MySQLPromisePool;
    redis: Redis;
  }
}
