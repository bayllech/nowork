import { config } from 'dotenv';

config();

const number = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const boolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: number(process.env.PORT, 3000),
  mysql: {
    host: process.env.MYSQL_HOST ?? 'localhost',
    port: number(process.env.MYSQL_PORT, 3306),
    database: process.env.MYSQL_DATABASE ?? 'nowork',
    user: process.env.MYSQL_USER ?? 'nowork',
    password: process.env.MYSQL_PASSWORD ?? ''
  },
  redis: {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: number(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD ?? '',
    db: number(process.env.REDIS_DB, 0),
    keyPrefix: process.env.REDIS_KEY_PREFIX ?? 'nowork:'
  },
  rateLimit: {
    perMinute: number(process.env.RATE_LIMIT_PER_MINUTE, 60),
    burst: number(process.env.RATE_LIMIT_BURST, 10)
  },
  clickFlush: {
    enabled: boolean(process.env.CLICK_FLUSH_ENABLED, true),
    cron: process.env.CLICK_FLUSH_CRON ?? '*/1 * * * *'
  },
  ip2regionPath: process.env.IP2REGION_PATH ?? 'ip2region.db',
  defaultPage: process.env.DEFAULT_PAGE ?? 'default',
  logLevel: process.env.LOG_LEVEL ?? 'info'
};

export const isProduction = env.nodeEnv === 'production';
