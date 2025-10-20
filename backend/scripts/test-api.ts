import path from 'node:path';
import fs from 'node:fs';
import { config } from 'dotenv';
const loadEnv = () => {
  const envPath = path.resolve(process.cwd(), '../.env.dev');
  if (fs.existsSync(envPath)) {
    config({ path: envPath });
  } else {
    config();
  }
};

const run = async () => {
  loadEnv();

  const { buildServer } = await import('../src/app');
  const app = buildServer();
  await app.ready();

  try {
    const hitResponse = await app.inject({
      method: 'POST',
      url: '/api/hit',
      payload: { page: 'default' },
      headers: {
        'cf-connecting-ip': '1.2.3.4'
      }
    });

    if (hitResponse.statusCode !== 200) {
      throw new Error(`/api/hit 接口返回异常：${hitResponse.statusCode} ${hitResponse.body}`);
    }

    const hitJson = hitResponse.json();

    const phrasesResponse = await app.inject({
      method: 'GET',
      url: '/api/phrases?page=boss'
    });

    if (phrasesResponse.statusCode !== 200) {
      throw new Error(`/api/phrases 接口返回异常：${phrasesResponse.statusCode} ${phrasesResponse.body}`);
    }

    const phrasesJson = phrasesResponse.json();

    const statsResponse = await app.inject({
      method: 'GET',
      url: '/api/stats/china?period=daily'
    });

    if (statsResponse.statusCode !== 200) {
      throw new Error(`/api/stats/china 接口返回异常：${statsResponse.statusCode} ${statsResponse.body}`);
    }

    const statsJson = statsResponse.json();

    console.log('接口验证通过：', {
      hit: {
        totalCount: hitJson.totalCount,
        dailyCount: hitJson.dailyCount,
        angerLevel: hitJson.angerLevel,
        phraseSample: hitJson.phrase
      },
      phrases: {
        count: phrasesJson.count,
        page: phrasesJson.page
      },
      stats: {
        provinceCount: statsJson.provinces?.length ?? 0
      }
    });
  } finally {
    await app.close();
  }
};

run().catch((error) => {
  console.error('接口验证失败', error);
  process.exit(1);
});
