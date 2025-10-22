import type { MySQLPromisePool } from '@fastify/mysql';
import type { RowDataPacket } from 'mysql2/promise';
import dayjs from 'dayjs';

export interface RegionStatKey {
  country: string;
  province: string;
  city: string;
  page: string;
}

export interface StatsFilter {
  page: string;
  date?: string;
  period: 'daily' | 'total';
}

export const AGGREGATED_PAGE_KEY = 'all';

const CHINA = '\u4e2d\u56fd';
const UNKNOWN = '\u672a\u77e5';
const OTHER = '\u5176\u4ed6';

export const determineAngerLevel = (dailyCount: number) => {
  if (dailyCount >= 500) return 3;
  if (dailyCount >= 200) return 2;
  if (dailyCount >= 50) return 1;
  return 0;
};

export const incrementRegionStat = async (
  pool: MySQLPromisePool,
  key: RegionStatKey,
  delta = 1
) => {
  const today = dayjs().format('YYYY-MM-DD');
  const values = [key.country, key.province, key.city, key.page, delta];

  await pool.execute(
    `INSERT INTO stat_total_region (country, province, city, page, count)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE count = count + VALUES(count)`,
    values
  );

  await pool.execute(
    `INSERT INTO stat_daily_region (stat_date, country, province, city, page, count)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE count = count + VALUES(count)`,
    [today, ...values]
  );
};

export const getAggregatedCounts = async (
  pool: MySQLPromisePool,
  page: string
) => {
  const today = dayjs().format('YYYY-MM-DD');

  const [totalRows] = await pool.query<(RowDataPacket & { value: number | null })[]>(
    `SELECT SUM(count) AS value FROM stat_total_region WHERE page = ?`,
    [page]
  );

  const [dailyRows] = await pool.query<(RowDataPacket & { value: number | null })[]>(
    `SELECT SUM(count) AS value FROM stat_daily_region WHERE stat_date = ? AND page = ?`,
    [today, page]
  );

  return {
    total: Number(totalRows[0]?.value ?? 0),
    daily: Number(dailyRows[0]?.value ?? 0)
  };
};

const resolveDate = (date?: string) => {
  if (date && dayjs(date, 'YYYY-MM-DD', true).isValid()) {
    return date;
  }
  return dayjs().format('YYYY-MM-DD');
};

export const fetchChinaStats = async (pool: MySQLPromisePool, filter: StatsFilter) => {
  const table = filter.period === 'daily' ? 'stat_daily_region' : 'stat_total_region';
  const params: Array<string | number> = [CHINA, filter.page];
  const conditions = ['country = ?', 'page = ?'];

  if (filter.period === 'daily') {
    params.push(resolveDate(filter.date));
    conditions.push('stat_date = ?');
  }

  const [rows] = await pool.query<
    (RowDataPacket & { province: string; city: string; count: number })[]
  >(
    `SELECT province, city, SUM(count) AS count
     FROM ${table}
     WHERE ${conditions.join(' AND ')}
     GROUP BY province, city
     ORDER BY count DESC`,
    params
  );

  const provinceMap = new Map<
    string,
    { province: string; count: number; cities: Array<{ city: string; count: number }> }
  >();

  for (const row of rows) {
    const provinceName = row.province || UNKNOWN;
    const cityName = row.city || UNKNOWN;

    if (!provinceMap.has(provinceName)) {
      provinceMap.set(provinceName, { province: provinceName, count: 0, cities: [] });
    }

    const provinceData = provinceMap.get(provinceName)!;
    provinceData.count += Number(row.count ?? 0);
    provinceData.cities.push({
      city: cityName,
      count: Number(row.count ?? 0)
    });
  }

  for (const [, item] of provinceMap) {
    item.cities.sort((a, b) => b.count - a.count);
  }

  return Array.from(provinceMap.values()).sort((a, b) => b.count - a.count);
};

export const fetchGlobalStats = async (pool: MySQLPromisePool, filter: StatsFilter) => {
  const table = filter.period === 'daily' ? 'stat_daily_region' : 'stat_total_region';

  const params: Array<string | number> = [filter.page];
  const conditions = ['page = ?'];

  if (filter.period === 'daily') {
    params.push(resolveDate(filter.date));
    conditions.push('stat_date = ?');
  }

  const [rows] = await pool.query<
    (RowDataPacket & { country: string; count: number })[]
  >(
    `SELECT country, SUM(count) AS count
     FROM ${table}
     WHERE ${conditions.join(' AND ')} AND country <> ?
     GROUP BY country
     ORDER BY count DESC`,
    [...params, CHINA]
  );

  return rows
    .map((row) => ({
      country: row.country || OTHER,
      count: Number(row.count ?? 0)
    }))
    .sort((a, b) => b.count - a.count);
};
