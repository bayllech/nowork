import { config } from 'dotenv';

config();

const number = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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
  rateLimit: {
    perMinute: number(process.env.RATE_LIMIT_PER_MINUTE, 60),
    burst: number(process.env.RATE_LIMIT_BURST, 10)
  },
  ip2regionPath: process.env.IP2REGION_PATH ?? 'ip2region.db',
  defaultPage: process.env.DEFAULT_PAGE ?? 'default',
  logLevel: process.env.LOG_LEVEL ?? 'info'
};

export const isProduction = env.nodeEnv === 'production';
