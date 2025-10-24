import type { MySQLPromisePool } from '@fastify/mysql';
import type { RowDataPacket } from 'mysql2/promise';

export interface RoleOptions {
  level?: number;
  limit?: number;
  badge?: string;
}

export interface RoleRow {
  id: number;
  role_key: string;
  title: string;
  description: string | null;
  quote: string | null;
  icon: string;
  color_from: string;
  color_to: string;
  badge: string | null;
  level: number;
  weight: number;
  is_active: number;
  created_at: Date;
  updated_at: Date;
}

const baseSelect = `
  SELECT
    id, role_key, title, description, quote, icon,
    color_from, color_to, badge, level, weight, is_active, created_at, updated_at
  FROM roles
  WHERE is_active = TRUE
`;

export async function getRoles(
  mysql: MySQLPromisePool,
  options?: RoleOptions
): Promise<{ roles: RoleRow[]; total: number }> {
  let query = baseSelect;
  const params: any[] = [];

  if (options?.level) {
    query += ' AND level <= ?';
    params.push(options.level);
  }

  if (options?.badge) {
    query += ' AND badge = ?';
    params.push(options.badge);
  }

  query += ' ORDER BY level DESC, weight DESC, created_at ASC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }

  const [rows] = await mysql.query<(RowDataPacket & RoleRow)[]>(query, params);

  // 获取总数
  let countQuery = 'SELECT COUNT(*) as total FROM roles WHERE is_active = TRUE';
  const countParams: any[] = [];

  if (options?.level) {
    countQuery += ' AND level <= ?';
    countParams.push(options.level);
  }

  if (options?.badge) {
    countQuery += ' AND badge = ?';
    countParams.push(options.badge);
  }

  const [countRows] = await mysql.query<(RowDataPacket & { total: number })[]>(countQuery, countParams);
  const total = countRows[0]?.total || 0;

  return {
    roles: rows,
    total
  };
}

export async function getRoleByKey(
  mysql: MySQLPromisePool,
  roleKey: string
): Promise<RoleRow | null> {
  const query = `${baseSelect} AND role_key = ? LIMIT 1`;
  const [rows] = await mysql.query<(RowDataPacket & RoleRow)[]>(query, [roleKey]);
  return rows[0] ?? null;
}
