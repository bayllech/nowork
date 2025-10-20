import { z } from 'zod';

export const phrasesQuerySchema = z
  .object({
    page: z
      .string()
      .trim()
      .max(32)
      .regex(/^[a-zA-Z0-9_-]+$/)
      .optional(),
    limit: z
      .preprocess((value) => {
        if (value === undefined) return undefined;
        if (typeof value === 'string') {
          const parsed = Number(value);
          return Number.isNaN(parsed) ? undefined : parsed;
        }
        return value;
      }, z
        .number()
        .int()
        .min(1)
        .max(200))
      .optional()
  })
  .passthrough();

export type PhrasesQuery = z.infer<typeof phrasesQuerySchema>;
