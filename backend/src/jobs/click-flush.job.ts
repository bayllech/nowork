import cron, { ScheduledTask } from 'node-cron';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env';
import { flushSupportedButtonCounters } from '../services/click-counter.service';

export interface ClickFlushJob {
  start: () => void;
  stop: () => void;
  runOnce: () => Promise<void>;
}

/**
 * 使用 node-cron 定时执行 Redis �ۼƵ����ݷ�����������
 */
export const createClickFlushJob = (app: FastifyInstance): ClickFlushJob => {
  const { enabled, cron: cronExpression } = env.clickFlush;
  let task: ScheduledTask | null = null;
  let running = false;

  const runOnce = async () => {
    if (!enabled) {
      return;
    }

    if (running) {
      app.log.warn('click_flush_job_skip_running');
      return;
    }

    running = true;
    const startedAt = Date.now();
    try {
      const results = await flushSupportedButtonCounters(app.redis, app.mysql);
      for (const summary of results) {
        app.log.info(
          {
            buttonId: summary.buttonId,
            delta: summary.delta,
            total: summary.total,
            durationMs: Date.now() - startedAt
          },
          'click_flush_success'
        );
      }
    } catch (error) {
      app.log.error({ err: error }, 'click_flush_job_failed');
    } finally {
      running = false;
    }
  };

  const start = () => {
    if (!enabled) {
      app.log.info('click_flush_job_disabled');
      return;
    }
    if (task) {
      return;
    }
    task = cron.schedule(cronExpression, () => {
      runOnce().catch((error) => {
        app.log.error({ err: error }, 'click_flush_job_unhandled');
      });
    });
    app.log.info({ cron: cronExpression }, 'click_flush_job_started');
  };

  const stop = () => {
    if (task) {
      task.stop();
      task = null;
      app.log.info('click_flush_job_stopped');
    }
    running = false;
  };

  return {
    start,
    stop,
    runOnce
  };
};
