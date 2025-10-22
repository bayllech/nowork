import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import Redis from 'ioredis';
import { config } from 'dotenv';
import {
  HOME_MAIN_BUTTON_ID,
  baseKey as buildBaseKey,
  counterKey as buildCounterKey
} from '../src/services/click-counter.service';

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

type InspectSnapshot = {
  source: string;
  total: number;
};

const getBackendBaseUrl = () => {
  const host = process.env.API_HOST ?? '127.0.0.1';
  const port = toNumber(process.env.PORT, 3000);
  const protocol = process.env.API_PROTOCOL ?? 'http';
  return `${protocol}://${host}:${port}`;
};

const fetchApiTotal = async (): Promise<InspectSnapshot> => {
  const baseUrl = getBackendBaseUrl();
  const response = await fetch(`${baseUrl}/api/clicks/home-main`, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`API 响应异常: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as { total: number; base: number; pending: number };
  return {
    source: 'API(/api/clicks/home-main)',
    total: json.total
  };
};

const inspectRedis = async (redis: Redis) => {
  const baseKey = buildBaseKey(HOME_MAIN_BUTTON_ID);
  const counterKey = buildCounterKey(HOME_MAIN_BUTTON_ID);

  const [baseRaw, deltaRaw] = await redis.mget(baseKey, counterKey);

  return {
    base: Number(baseRaw ?? 0),
    delta: Number(deltaRaw ?? 0)
  };
};

const inspectDatabase = async (pool: mysql.Pool): Promise<InspectSnapshot> => {
  const [rows] = await pool.query<{ total_count: number | string | null }[]>(
    'SELECT total_count FROM button_click_counters WHERE button_id = ? LIMIT 1',
    [HOME_MAIN_BUTTON_ID]
  );

  return {
    source: 'MySQL(button_click_counters)',
    total: Number(rows[0]?.total_count ?? 0)
  };
};

const createMysqlPool = () => {
  const host = process.env.MYSQL_HOST ?? '127.0.0.1';
  const port = toNumber(process.env.MYSQL_PORT, 3306);
  const user = process.env.MYSQL_USER ?? 'root';
  const password = process.env.MYSQL_PASSWORD ?? '';
  const database = process.env.MYSQL_DATABASE ?? 'nowork';

  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 5
  });
};

const createRedisClient = () => {
  const host = process.env.REDIS_HOST ?? '127.0.0.1';
  const port = toNumber(process.env.REDIS_PORT, 6379);
  const password = process.env.REDIS_PASSWORD || undefined;
  const db = toNumber(process.env.REDIS_DB, 0);
  const keyPrefix = process.env.REDIS_KEY_PREFIX ?? 'nowork:';

  return new Redis({
    host,
    port,
    password,
    db,
    keyPrefix
  });
};

const printSnapshot = (data: InspectSnapshot[], redisMetrics: { base: number; delta: number }) => {
  const apiValue = data.find((item) => item.source.startsWith('API'))?.total ?? 0;
  const dbValue = data.find((item) => item.source.startsWith('MySQL'))?.total ?? 0;
  const redisRealtime = redisMetrics.base + redisMetrics.delta;

  const lines = [
    '=== 首页主按钮点击链路快照 ===',
    `接口返回               : ${apiValue}`,
    `Redis 基线 (base)       : ${redisMetrics.base}`,
    `Redis 待落库增量(counter): ${redisMetrics.delta}`,
    `Redis 实时合计          : ${redisRealtime}`,
    `MySQL 落库总计          : ${dbValue}`,
    `差值(接口 - Redis)      : ${apiValue - redisRealtime}`,
    `差值(接口 - MySQL)      : ${apiValue - dbValue}`,
    '------------------------------'
  ];

  console.log(lines.join('\n'));
};

const main = async () => {
  loadEnv();

  const redis = createRedisClient();
  const mysqlPool = createMysqlPool();

  try {
    const redisMetrics = await inspectRedis(redis);
    const mysqlSnapshot = await inspectDatabase(mysqlPool);
    const apiSnapshot = await fetchApiTotal();

    printSnapshot([apiSnapshot, mysqlSnapshot], redisMetrics);
  } finally {
    await redis.quit();
    await mysqlPool.end();
  }
};

main().catch((error) => {
  console.error('[inspect-clicks] 采样失败:', error);
  process.exitCode = 1;
});
