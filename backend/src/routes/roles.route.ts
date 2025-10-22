import type { FastifyInstance } from 'fastify';
import { roleDefinitions } from '../data/roles';

export default async function rolesRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const { level, limit } = (request.query ?? {}) as { level?: string; limit?: string };

    const filtered = roleDefinitions.filter((role) => {
      if (!level) return true;
      const numeric = Number.parseInt(level, 10);
      if (Number.isNaN(numeric)) return true;
      return role.level >= numeric;
    });

    const size = limit ? Math.max(1, Number.parseInt(limit, 10)) : filtered.length;
    const result = filtered.slice(0, size);

    return reply.send({
      count: result.length,
      roles: result
    });
  });
}

