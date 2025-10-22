import type { MySQLPromisePool } from '@fastify/mysql';
import type { Redis } from 'ioredis';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export const HOME_MAIN_BUTTON_ID = 'home-main';
export const SUPPORTED_BUTTON_IDS = new Set<string>([HOME_MAIN_BUTTON_ID]);

const TABLE_NAME = 'button_click_counters';
const COUNTER_PREFIX = 'click:button';
const LAST_HIT_TTL_SECONDS = 60;

const buildKey = (buttonId: string, suffix?: string) =>
  suffix ? `${COUNTER_PREFIX}:${buttonId}:${suffix}` : `${COUNTER_PREFIX}:${buttonId}`;

export const counterKey = (buttonId: string) => buildKey(buttonId, 'counter');
export const baseKey = (buttonId: string) => buildKey(buttonId, 'base');
export const lastHitKey = (buttonId: string) => buildKey(buttonId, 'last-hit');

export const isSupportedButton = (buttonId: string): buttonId is typeof HOME_MAIN_BUTTON_ID =>
  SUPPORTED_BUTTON_IDS.has(buttonId);

export const fetchPersistedTotal = async (
  pool: MySQLPromisePool,
  buttonId: string
): Promise<number> => {
  const [rows] = await pool.query<
    (RowDataPacket & { total_count: number | string | null })[]
  >(`SELECT total_count FROM ${TABLE_NAME} WHERE button_id = ? LIMIT 1`, [buttonId]);

  return Number(rows[0]?.total_count ?? 0);
};

export const ensureBaseCache = async (
  redis: Redis,
  pool: MySQLPromisePool,
  buttonId: string
): Promise<number> => {
  const cached = await redis.get(baseKey(buttonId));
  if (cached !== null) {
    return Number(cached);
  }

  const total = await fetchPersistedTotal(pool, buttonId);
  await redis.set(baseKey(buttonId), String(total));
  return total;
};

export const incrementButtonCounter = async (
  redis: Redis,
  pool: MySQLPromisePool,
  buttonId: string
): Promise<{ base: number; pending: number; total: number }> => {
  if (!isSupportedButton(buttonId)) {
    throw new Error('button_not_supported');
  }

  const pipelineResult = await redis
    .multi()
    .get(baseKey(buttonId))
    .incrby(counterKey(buttonId), 1)
    .exec();

  if (!pipelineResult) {
    throw new Error('redis_pipeline_error');
  }

  const [baseTuple, counterTuple] = pipelineResult;
  if (!baseTuple || !counterTuple) {
    throw new Error('redis_pipeline_error');
  }
  const baseError = baseTuple?.[0];
  const baseRaw = baseTuple?.[1];
  const counterError = counterTuple?.[0];
  const counterRaw = counterTuple?.[1];

  if (baseError || counterError) {
    throw new Error('redis_pipeline_error');
  }

  let baseCount: number;
  if (baseRaw === null || baseRaw === undefined) {
    baseCount = await ensureBaseCache(redis, pool, buttonId);
  } else {
    baseCount = Number(baseRaw);
  }

  const pending = Number(counterRaw ?? 0);
  const total = baseCount + pending;

  await redis.set(lastHitKey(buttonId), Date.now().toString(), 'EX', LAST_HIT_TTL_SECONDS);

  return {
    base: baseCount,
    pending,
    total
  };
};

export const persistDelta = async (
  pool: MySQLPromisePool,
  buttonId: string,
  delta: number
): Promise<number> => {
  if (delta <= 0) {
    return fetchPersistedTotal(pool, buttonId);
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO ${TABLE_NAME} (button_id, total_count, updated_at)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE total_count = total_count + VALUES(total_count), updated_at = NOW()`,
    [buttonId, delta]
  );

  if (result.affectedRows === 0) {
    throw new Error('persist_counter_failed');
  }

  return fetchPersistedTotal(pool, buttonId);
};

const supportsGetDel = (client: Redis): client is Redis & { getdel: (key: string) => Promise<string | null> } =>
  typeof (client as Redis & { getdel?: unknown }).getdel === 'function';

const resetCounterDelta = async (redis: Redis, key: string): Promise<number> => {
  if (supportsGetDel(redis)) {
    const current = await (redis as Redis & { getdel: (k: string) => Promise<string | null> }).getdel(key);
    return Number(current ?? 0);
  }

  const lua = `
    local current = redis.call('GET', KEYS[1])
    redis.call('SET', KEYS[1], '0')
    return current
  `;
  const result = await redis.eval(lua, 1, key);
  return Number(result ?? 0);
};

export const flushButtonCounter = async (redis: Redis, pool: MySQLPromisePool, buttonId: string) => {
  const delta = await resetCounterDelta(redis, counterKey(buttonId));
  const total =
    delta > 0 ? await persistDelta(pool, buttonId, delta) : await fetchPersistedTotal(pool, buttonId);
  await redis.set(baseKey(buttonId), String(total));
  return { buttonId, delta, total };
};

export const flushSupportedButtonCounters = async (
  redis: Redis,
  pool: MySQLPromisePool,
  buttonIds: string[] = Array.from(SUPPORTED_BUTTON_IDS)
) => {
  const results = [];
  for (const id of buttonIds) {
    const summary = await flushButtonCounter(redis, pool, id);
    results.push(summary);
  }
  return results;
};

export const calculateRealtimeTotal = async (
  redis: Redis,
  pool: MySQLPromisePool,
  buttonId: string
) => {
  const base = await ensureBaseCache(redis, pool, buttonId);
  const pending = Number((await redis.get(counterKey(buttonId))) ?? 0);
  return {
    base,
    pending,
    total: base + pending
  };
};
