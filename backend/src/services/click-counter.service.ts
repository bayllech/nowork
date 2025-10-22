import type { MySQLPromisePool } from '@fastify/mysql';
import type { Redis } from 'ioredis';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export const HOME_MAIN_BUTTON_ID = 'home-main';
export const SUPPORTED_BUTTON_IDS = new Set<string>([HOME_MAIN_BUTTON_ID]);

const TABLE_NAME = 'button_click_counters';
const COUNTER_PREFIX = 'click:button';

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
