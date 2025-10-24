import { z } from 'zod';

export const rolesQuerySchema = z.object({
  level: z.coerce.number().int().min(1).max(5).optional(),
  badge: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type RolesQuery = z.infer<typeof rolesQuerySchema>;

export const roleResponseSchema = z.object({
  id: z.number(),
  role_key: z.string(),
  title: z.string(),
  description: z.string(),
  quote: z.string(),
  icon: z.string(),
  color_from: z.string(),
  color_to: z.string(),
  badge: z.string().nullable(),
  level: z.number(),
  weight: z.number(),
});

export type RoleResponse = z.infer<typeof roleResponseSchema>;

export const rolesListResponseSchema = z.object({
  roles: z.array(roleResponseSchema),
  total: z.number(),
});

export type RolesListResponse = z.infer<typeof rolesListResponseSchema>;