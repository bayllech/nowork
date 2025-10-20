import type { FastifyInstance } from 'fastify';
import dayjs from 'dayjs';
import { env } from '../config/env';
import { statsQuerySchema } from '../schemas/stats.schema';
import { fetchChinaStats, fetchGlobalStats } from '../services/stat.service';

const normalizeDate = (date?: string) => {
  if (date && dayjs(date, 'YYYY-MM-DD', true).isValid()) {
    return date;
  }
  return dayjs().format('YYYY-MM-DD');
};

export default async function statsRoutes(app: FastifyInstance) {
  app.get('/china', async (request, reply) => {
    const parseResult = statsQuerySchema.safeParse(request.query ?? {});
    if (!parseResult.success) {
      const message = parseResult.error.errors.map((err) => err.message).join('; ');
      return reply.badRequest(message);
    }

    const query = parseResult.data;
    const page = query.page ?? env.defaultPage;
    const period = query.period ?? 'daily';
    const date = period === 'daily' ? normalizeDate(query.date) : undefined;

    const provinces = await fetchChinaStats(app.mysql, {
      page,
      period,
      date
    });

    return reply.send({
      page,
      period,
      date: date ?? null,
      provinces
    });
  });

  app.get('/global', async (request, reply) => {
    const parseResult = statsQuerySchema.safeParse(request.query ?? {});
    if (!parseResult.success) {
      const message = parseResult.error.errors.map((err) => err.message).join('; ');
      return reply.badRequest(message);
    }

    const query = parseResult.data;
    const page = query.page ?? env.defaultPage;
    const period = query.period ?? 'daily';
    const date = period === 'daily' ? normalizeDate(query.date) : undefined;

    const countries = await fetchGlobalStats(app.mysql, {
      page,
      period,
      date
    });

    return reply.send({
      page,
      period,
      date: date ?? null,
      countries
    });
  });
}
