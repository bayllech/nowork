import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

const loadEnv = () => {
  const envPath = path.resolve(process.cwd(), '../.env.dev');
  if (fs.existsSync(envPath)) {
    config({ path: envPath });
  } else {
    config();
  }
};

const readSql = (fileName: string) => {
  const filePath = path.resolve(__dirname, '../sql', fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL 文件不存在：${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
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
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${database}\`;`);

    const schemaSql = readSql('schema.sql');
    await connection.query(schemaSql);

    const [rows] = await connection.query<{ total: number }[]>(`SELECT COUNT(*) AS total FROM phrases;`);
    if (rows[0]?.total === 0) {
      const seedSql = readSql('seed_phrases.sql');
      await connection.query(seedSql);
    }

    console.log('数据库初始化完成');
  } finally {
    await connection.end();
  }
};

run().catch((error) => {
  console.error('数据库初始化失败', error);
  process.exit(1);
});
