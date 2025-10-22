import { FastifyInstance } from 'fastify';
import hitRoutes from './hit.route';
import statsRoutes from './stats.route';
import phrasesRoutes from './phrases.route';
import rolesRoutes from './roles.route';
import clickRoutes from './clicks.route';

export async function registerRoutes(app: FastifyInstance) {
  app.register(hitRoutes, { prefix: '/hit' });
  app.register(statsRoutes, { prefix: '/stats' });
  app.register(phrasesRoutes, { prefix: '/phrases' });
  app.register(rolesRoutes, { prefix: '/roles' });
  app.register(clickRoutes, { prefix: '/clicks' });
}
