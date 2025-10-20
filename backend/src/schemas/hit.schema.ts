import { z } from 'zod';

export const hitRequestSchema = z
  .object({
    page: z
      .string()
      .trim()
      .min(1, { message: 'page \u4e0d\u80fd\u4e3a\u7a7a' })
      .max(32)
      .regex(/^[a-zA-Z0-9_-]+$/, { message: 'page \u4ec5\u652f\u6301\u5b57\u6bcd\u6570\u5b57\u548c\u4e0b\u5212\u7ebf' })
      .optional()
  })
  .passthrough();

export type HitRequestBody = z.infer<typeof hitRequestSchema>;

export const hitResponseSchema = z.object({
  totalCount: z.number().nonnegative(),
  dailyCount: z.number().nonnegative(),
  angerLevel: z.number().int().min(0),
  phrase: z.string(),
  country: z.string(),
  province: z.string(),
  city: z.string()
});

export type HitResponse = z.infer<typeof hitResponseSchema>;
