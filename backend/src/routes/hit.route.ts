import type { FastifyInstance } from 'fastify';
import { env } from '../config/env';
import { extractClientIp } from '../utils/ip';
import { lookupRegion } from '../services/ip-location.service';
import { upsertIpCache } from '../services/ip-cache.service';
import { getRandomPhrase } from '../services/phrase.service';
import { HOME_MAIN_BUTTON_ID, incrementButtonCounter } from '../services/click-counter.service';
import {
  AGGREGATED_PAGE_KEY,
  determineAngerLevel,
  getAggregatedCounts,
  incrementRegionStat
} from '../services/stat.service';
import { hitRequestSchema, hitResponseSchema } from '../schemas/hit.schema';

const UNKNOWN = '\u672a\u77e5';
const OVERSEA_PLACEHOLDER = 'N/A';
const CHINA = '\u4e2d\u56fd';

export default async function hitRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      config: {
        rateLimit: false
      }
    },
    async (request, reply) => {
      const parseResult = hitRequestSchema.safeParse(request.body ?? {});
      if (!parseResult.success) {
        const message = parseResult.error.errors.map((err) => err.message).join('; ');
        return reply.badRequest(message);
      }

      const { page } = parseResult.data;
      const normalizedPage = page ?? env.defaultPage;
      const ip = extractClientIp(request);
      const region = lookupRegion(ip) ?? {
        country: UNKNOWN,
        province: UNKNOWN,
        city: UNKNOWN,
        region: UNKNOWN
      };

      const isChina = region.country === CHINA;
      const storageRegion = {
        country: region.country || UNKNOWN,
        province: isChina ? region.province || UNKNOWN : OVERSEA_PLACEHOLDER,
        city: isChina ? region.city || UNKNOWN : region.city || OVERSEA_PLACEHOLDER
      };

      const pool = app.mysql;

      await upsertIpCache(pool, {
        ip,
        country: storageRegion.country,
        province: storageRegion.province,
        city: storageRegion.city
      });

      const pagesToUpdate = new Set<string>([normalizedPage, AGGREGATED_PAGE_KEY]);
      for (const targetPage of pagesToUpdate) {
        await incrementRegionStat(pool, {
          country: storageRegion.country,
          province: storageRegion.province,
          city: storageRegion.city,
          page: targetPage
        });
      }

      const allCounts = await getAggregatedCounts(pool, AGGREGATED_PAGE_KEY);
      const pageCounts = await getAggregatedCounts(pool, normalizedPage);
      const angerLevel = determineAngerLevel(pageCounts.daily);
      const phrase = await getRandomPhrase(pool, normalizedPage);

      if (normalizedPage === env.defaultPage) {
        try {
          await incrementButtonCounter(app.redis, pool, HOME_MAIN_BUTTON_ID);
        } catch (error) {
          request.log.warn({ err: error }, 'home_main_click_counter_failed');
        }
      }

      const response = hitResponseSchema.parse({
        totalCount: allCounts.total,
        dailyCount: pageCounts.daily,
        angerLevel,
        phrase,
        country: region.country || UNKNOWN,
        province: region.province || (isChina ? UNKNOWN : OVERSEA_PLACEHOLDER),
        city: region.city || (isChina ? UNKNOWN : OVERSEA_PLACEHOLDER)
      });

      return reply.send(response);
    }
  );
}
