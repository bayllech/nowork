import type { MySQLPromisePool } from '@fastify/mysql';

export interface IpCacheRecord {
  ip: string;
  country: string;
  province: string;
  city: string;
}

export const upsertIpCache = async (pool: MySQLPromisePool, record: IpCacheRecord) => {
  await pool.execute(
    `INSERT INTO hit_ip_cache (ip, country, province, city)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       country = VALUES(country),
       province = VALUES(province),
       city = VALUES(city),
       last_update = CURRENT_TIMESTAMP`,
    [record.ip, record.country, record.province, record.city]
  );
};
