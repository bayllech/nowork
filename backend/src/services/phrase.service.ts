import type { MySQLPromisePool } from '@fastify/mysql';
import type { RowDataPacket } from 'mysql2/promise';
import { env } from '../config/env';

const fallbackPhrases: Record<string, string[]> = {
  default: [
    '\u4eca\u5929\u7684\u952e\u76d8\u8981\u906d\u6b8b\u4e86\uff01',
    '\u9700\u6c42\u4e00\u6765\u5fc3\u90fd\u51c9\u534a\u622a\u3002',
    '\u6478\u9c7c\u65f6\u95f4\u88ab\u6253\u65ad\u6211\u5fc3\u788e\u4e86\u534a\u622a\u3002'
  ],
  boss: [
    '\u8001\u677f\u53c8\u5728\u753b\u997c\uff0c\u6211\u5148\u5543\u70b9\u96f6\u98df\u7eed\u547d\u3002',
    '\u4f1a\u8bae\u592a\u591a\u4e0d\u5982\u76f4\u63a5\u53d1\u7ed3\u8bba\u3002'
  ],
  client: [
    '\u7532\u65b9\u8bf4\u201c\u5c31\u6539\u4e00\u70b9\u70b9\u201d\uff0c\u7ed3\u679c\u901a\u5bb5\u3002',
    '\u4eca\u5929\u7684\u9700\u6c42\u6bd4\u65e9\u9ad8\u5cf0\u8fd8\u62e5\u6324\u3002'
  ]
};

const pickFallback = (page: string) => {
  const pool = [...(fallbackPhrases[page] ?? []), ...(fallbackPhrases.default ?? [])];
  if (pool.length === 0) {
    return '\u4eca\u5929\u53c8\u662f\u52aa\u529b\u6478\u9c7c\u7684\u4e00\u5929\u3002';
  }
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
};

export const getRandomPhrase = async (pool: MySQLPromisePool, page: string) => {
  const filteredPage = page || env.defaultPage;
  const [rows] = await pool.query<
    (RowDataPacket & { content: string; weight: number })[]
  >(
    `SELECT content, weight
     FROM phrases
     WHERE page IN (?, ?)
     ORDER BY RAND()
     LIMIT 5`,
    [filteredPage, env.defaultPage]
  );

  if (rows.length === 0) {
    return pickFallback(filteredPage);
  }

  const expanded: string[] = [];
  for (const row of rows) {
    const weight = Number(row.weight ?? 1);
    for (let i = 0; i < Math.max(weight, 1); i += 1) {
      expanded.push(row.content);
    }
  }

  if (expanded.length === 0) {
    return pickFallback(filteredPage);
  }

  const index = Math.floor(Math.random() * expanded.length);
  return expanded[index];
};

export interface PhraseRow {
  id: number;
  content: string;
  weight: number;
}

export interface ListPhrasesResult {
  items: PhraseRow[];
  hasMore: boolean;
}

export const listPhrases = async (
  pool: MySQLPromisePool,
  page: string,
  limit: number,
  offset = 0
): Promise<ListPhrasesResult> => {
  const filteredPage = page || env.defaultPage;
  const includeAllPages = filteredPage === 'share';
  const queryLimit = limit + 1;

  const sql = includeAllPages
    ? `SELECT id, content, weight
       FROM phrases
       ORDER BY id ASC
       LIMIT ? OFFSET ?`
    : `SELECT id, content, weight
       FROM phrases
       WHERE page IN (?, ?)
       ORDER BY id ASC
       LIMIT ? OFFSET ?`;

  const params = includeAllPages
    ? [queryLimit, offset]
    : [filteredPage, env.defaultPage, queryLimit, offset];

  const [rows] = await pool.query<
    (RowDataPacket & { id: number; content: string; weight: number })[]
  >(sql, params);

  const hasMore = rows.length > limit;
  const effectiveRows = hasMore ? rows.slice(0, limit) : rows;

  if (effectiveRows.length === 0) {
    const fallbackPool = includeAllPages
      ? [...new Set(Object.values(fallbackPhrases).flat())]
      : [
          ...new Set([
            ...((fallbackPhrases[filteredPage] ?? [])),
            ...(fallbackPhrases.default ?? [])
          ])
        ];

    if (fallbackPool.length === 0) {
      return { items: [], hasMore: false };
    }

    const slicedFallback = fallbackPool.slice(offset, offset + limit);
    const items = slicedFallback.map((content, index) => ({
      id: -(offset + index + 1),
      content,
      weight: 1
    }));

    return {
      items,
      hasMore: offset + limit < fallbackPool.length
    };
  }

  return {
    items: effectiveRows.map((row) => ({
      id: Number(row.id),
      content: row.content,
      weight: Number(row.weight ?? 1)
    })),
    hasMore
  };
};
