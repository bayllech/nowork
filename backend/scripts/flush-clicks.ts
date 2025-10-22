import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import Redis from 'ioredis';
import { config } from 'dotenv';
import {
  HOME_MAIN_BUTTON_ID,
  baseKey,
  counterKey,
  fetchPersistedTotal,
  persistDelta
} from '../src/services/click-counter.service';

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

const readAndResetDelta = async (redis: Redis, key: string) => {
  const client = redis as Redis & { getdel?: (k: string) => Promise<string | null> };
  if (typeof client.getdel === 'function') {
    const current = await client.getdel(key);
    return Number(current ?? 0);
  }

  const script = `
    local current = redis.call('GET', KEYS[1])
    redis.call('SET', KEYS[1], '0')
    return current
  `;
  const result = await redis.eval(script, 1, key);
  return Number(result ?? 0);
};

const flushButton = async (redis: Redis, pool: mysql.Pool, buttonId: string) => {
  const delta = await readAndResetDelta(redis, counterKey(buttonId));
  const total = delta > 0 ? await persistDelta(pool, buttonId, delta) : await fetchPersistedTotal(pool, buttonId);
  await redis.set(baseKey(buttonId), String(total));
  return { buttonId, delta, total };
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
    const results = [];
    for (const buttonId of SUPPORTED_BUTTONS) {
      const summary = await flushButton(redis, pool, buttonId);
      results.push(summary);
      console.log(
        `[flush-clicks] button=${buttonId} delta=${summary.delta} total=${summary.total}`
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
