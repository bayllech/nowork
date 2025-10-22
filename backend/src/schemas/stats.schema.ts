import { z } from 'zod';

export const statsQuerySchema = z
  .object({
    page: z
      .string()
      .trim()
      .max(32)
      .regex(/^[a-zA-Z0-9_-]+$/, { message: 'page \u4ec5\u652f\u6301\u5b57\u6bcd\u6570\u5b57\u548c\u4e0b\u5212\u7ebf' })
      .optional(),
    period: z.enum(['daily', 'total']).optional(),
    date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'date \u9700\u7b26\u5408 YYYY-MM-DD \u683c\u5f0f' })
      .optional()
  })
  .passthrough();

export type StatsQuery = z.infer<typeof statsQuerySchema>;

export const statsSummaryQuerySchema = z
  .object({
    page: z
      .string()
      .trim()
      .max(32)
      .regex(/^[a-zA-Z0-9_-]+$/, { message: 'page \u4ec5\u652f\u6301\u5b57\u6bcd\u6570\u5b57\u548c\u4e0b\u5212\u7ebf' })
      .optional()
  })
  .passthrough();

export type StatsSummaryQuery = z.infer<typeof statsSummaryQuerySchema>;
