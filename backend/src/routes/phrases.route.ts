import type { FastifyInstance } from 'fastify';
import { env } from '../config/env';
import { listPhrases } from '../services/phrase.service';
import { phrasesQuerySchema } from '../schemas/phrases.schema';

export default async function phrasesRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const parseResult = phrasesQuerySchema.safeParse(request.query ?? {});
    if (!parseResult.success) {
      const message = parseResult.error.errors.map((err) => err.message).join('; ');
      return reply.badRequest(message);
    }

    const { page, limit } = parseResult.data;
    const targetPage = page ?? env.defaultPage;
    const size = limit ?? 20;

    const phrases = await listPhrases(app.mysql, targetPage, size);

    return reply.send({
      page: targetPage,
      count: phrases.length,
      phrases
    });
  });
}
