import { z } from 'zod';
import { HOME_MAIN_BUTTON_ID } from '../services/click-counter.service';

export const supportedButtonIds = [HOME_MAIN_BUTTON_ID] as const;

export const clickParamsSchema = z.object({
  buttonId: z.enum(supportedButtonIds)
});

export const clickResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  base: z.number().int().nonnegative()
});

export type ClickParams = z.infer<typeof clickParamsSchema>;
export type ClickResponse = z.infer<typeof clickResponseSchema>;
