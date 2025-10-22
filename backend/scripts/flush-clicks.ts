import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import Redis from 'ioredis';
import { config } from 'dotenv';
import { HOME_MAIN_BUTTON_ID, flushSupportedButtonCounters } from '../src/services/click-counter.service';

const SUPPORTED_BUTTONS = [HOME_MAIN_BUTTON_ID];

const loadEnv = () => {
  const candidates = [
    path.resolve(process.cwd(), '../.env.dev'),
    path.resolve(process.cwd(), '.env')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      config({ path: candidate });
      return;
    }
  }

  config();
};

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const main = async () => {
  loadEnv();

  const mysqlHost = process.env.MYSQL_HOST ?? '127.0.0.1';
  const mysqlPort = toNumber(process.env.MYSQL_PORT, 3306);
  const mysqlUser = process.env.MYSQL_USER ?? 'root';
  const mysqlPassword = process.env.MYSQL_PASSWORD ?? '';
  const mysqlDatabase = process.env.MYSQL_DATABASE ?? 'nowork';

  const redisHost = process.env.REDIS_HOST ?? '127.0.0.1';
  const redisPort = toNumber(process.env.REDIS_PORT, 6379);
  const redisPassword = process.env.REDIS_PASSWORD || undefined;
  const redisDb = toNumber(process.env.REDIS_DB, 0);
  const redisKeyPrefix = process.env.REDIS_KEY_PREFIX ?? 'nowork:';

  const pool = mysql.createPool({
    host: mysqlHost,
    port: mysqlPort,
    user: mysqlUser,
    password: mysqlPassword,
    database: mysqlDatabase,
    waitForConnections: true,
    connectionLimit: 5
  });

  const redis = new Redis({
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    db: redisDb,
    keyPrefix: redisKeyPrefix
  });

  try {
    const results = await flushSupportedButtonCounters(redis, pool, SUPPORTED_BUTTONS);
    for (const summary of results) {
      console.log(
        `[flush-clicks] button=${summary.buttonId} delta=${summary.delta} total=${summary.total}`
      );
    }
    return results;
  } finally {
    await redis.quit();
    await pool.end();
  }
};

main().catch((error) => {
  console.error('[flush-clicks] 同步失败', error);
  process.exitCode = 1;
});
