import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const IP2Region = require('ip2region');

export interface RegionInfo {
  country: string;
  province: string;
  city: string;
  region: string;
}

const resolveIp2regionPath = () => {
  const moduleDir = path.dirname(require.resolve('ip2region'));
  const packageRoot = path.resolve(moduleDir, '..');

  const candidatePaths = [
    env.ip2regionPath,
    path.resolve(env.ip2regionPath),
    path.resolve(process.cwd(), env.ip2regionPath),
    path.join(packageRoot, 'data/ip2region.db')
  ];

  for (const candidate of candidatePaths) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error('未找到 ip2region 数据库文件，请检查 IP2REGION_PATH 配置');
};

const ip2region = new IP2Region({ dbPath: resolveIp2regionPath(), inMemory: true });

const normalizeIp = (ip: string) => {
  if (!ip) return '';
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  if (ip === '::1') {
    return '127.0.0.1';
  }
  return ip;
};

export const lookupRegion = (ip: string): RegionInfo | null => {
  const targetIp = normalizeIp(ip);
  if (!targetIp) {
    return null;
  }

  try {
    const result = ip2region.search(targetIp) as RegionInfo | null;
    if (!result) {
      return null;
    }
    return {
      country: result.country ?? '未知',
      province: result.province ?? '未知',
      city: result.city ?? '未知',
      region: result.region ?? result.province ?? '未知'
    };
  } catch (error) {
    logger.warn({ err: error }, 'IP 定位失败');
    return null;
  }
};
