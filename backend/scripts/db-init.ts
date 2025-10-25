import fs from 'node:fs';
import path from 'node:path';
import dayjs from 'dayjs';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

const loadEnv = () => {
  const candidates = ['../.env.dev', '../.env.prod', '../.env'];
  for (const candidate of candidates) {
    const envPath = path.resolve(process.cwd(), candidate);
    if (fs.existsSync(envPath)) {
      config({ path: envPath });
      return;
    }
  }
  config();
};

const readSql = (fileName: string) => {
  const filePath = path.resolve(__dirname, '../sql', fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL 文件不存在：${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
};

const seedPhrasesIfNeeded = async (connection: mysql.Connection) => {
  const [rows] = await connection.query<{ total: number }[]>(`SELECT COUNT(*) AS total FROM phrases;`);
  if ((rows[0]?.total ?? 0) > 0) {
    return;
  }

  const seedSql = readSql('seed_phrases.sql');
  await connection.query(seedSql);
  console.log('✅ 吐槽文案已初始化');
};

interface SeedRegionInput {
  country: string;
  province: string;
  city: string;
  daily: number;
  total: number;
}

const seedStatsIfNeeded = async (connection: mysql.Connection) => {
  const [rows] = await connection.query<{ total: number }[]>(`SELECT COUNT(*) AS total FROM stat_total_region;`);
  if ((rows[0]?.total ?? 0) > 0) {
    return;
  }

  const today = dayjs().format('YYYY-MM-DD');
  const pageKeys = ['default', 'all'];

  const chinaSeeds: SeedRegionInput[] = [
    { country: '中国', province: '上海', city: '上海', daily: 186, total: 1280 },
    { country: '中国', province: '北京', city: '北京', daily: 168, total: 1190 },
    { country: '中国', province: '广东', city: '广州', daily: 152, total: 1033 },
    { country: '中国', province: '浙江', city: '杭州', daily: 131, total: 910 },
    { country: '中国', province: '四川', city: '成都', daily: 108, total: 756 },
    { country: '中国', province: '湖北', city: '武汉', daily: 96, total: 642 }
  ];

  const globalSeeds: SeedRegionInput[] = [
    { country: 'United States', province: 'N/A', city: 'N/A', daily: 220, total: 980 },
    { country: 'Japan', province: 'N/A', city: 'N/A', daily: 174, total: 815 },
    { country: 'Singapore', province: 'N/A', city: 'N/A', daily: 148, total: 630 },
    { country: 'Germany', province: 'N/A', city: 'N/A', daily: 112, total: 520 }
  ];

  const insertRegionStat = async ({ country, province, city, daily, total }: SeedRegionInput, page: string) => {
    await connection.query(
      `INSERT INTO stat_total_region (country, province, city, page, count)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE count = VALUES(count);`,
      [country, province, city, page, total]
    );

    await connection.query(
      `INSERT INTO stat_daily_region (stat_date, country, province, city, page, count)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE count = VALUES(count);`,
      [today, country, province, city, page, daily]
    );
  };

  for (const page of pageKeys) {
    for (const seed of chinaSeeds) {
      await insertRegionStat(seed, page);
    }
    for (const seed of globalSeeds) {
      await insertRegionStat(seed, page);
    }
  }

  console.log('✅ 怒气统计示例数据已初始化');
};

const run = async () => {
  loadEnv();

  const host = process.env.MYSQL_HOST;
  const port = Number(process.env.MYSQL_PORT ?? 3306);
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;

  if (!host || !user || !database) {
    throw new Error('请在环境变量中设置 MYSQL_HOST、MYSQL_USER、MYSQL_PASSWORD、MYSQL_DATABASE');
  }

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.query(`USE \`${database}\`;`);

    const schemaSql = readSql('schema.sql');
    await connection.query(schemaSql);
    console.log('✅ 数据表结构检查完成');

    await seedPhrasesIfNeeded(connection);
    await seedStatsIfNeeded(connection);

    console.log('🎉 数据库初始化完成');
  } finally {
    await connection.end();
  }
};

run().catch((error) => {
  console.error('数据库初始化失败', error);
  process.exit(1);
});
