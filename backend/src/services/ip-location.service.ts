import fs from 'node:fs';
import path from 'node:path';
import IP2Region from 'ip2region';
import type { IP2RegionOpts, IP2RegionResult } from 'ip2region';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface RegionInfo {
  country: string;
  province: string;
  city: string;
  region: string;
  isp: string;
}

const UNKNOWN_TEXT = '未知';
const DEFAULT_IPV4_DB = 'ip2region.db';
const DEFAULT_IPV6_DB = 'ipv6wry.db';

const trimValue = (value?: string | null) => {
  if (!value) {
    return '';
  }
  const trimmed = value.trim();
  return trimmed;
};

const asText = (value?: string | null) => {
  const trimmed = trimValue(value);
  return trimmed || UNKNOWN_TEXT;
};

const resolvePackageRoot = () => {
  const packageJsonPath = require.resolve('ip2region/package.json');
  return path.dirname(packageJsonPath);
};

const addCandidate = (collection: Set<string>, candidate?: string | null) => {
  if (!candidate) return;
  collection.add(candidate);
};

const resolveDbPath = (
  label: string,
  configuredPath: string | undefined,
  defaultFilename: string,
  required: boolean
) => {
  const packageRoot = resolvePackageRoot();
  const candidates = new Set<string>();

  const normalizedConfigured = trimValue(configuredPath);
  if (normalizedConfigured) {
    addCandidate(candidates, normalizedConfigured);
    addCandidate(candidates, path.resolve(normalizedConfigured));
    addCandidate(candidates, path.resolve(process.cwd(), normalizedConfigured));
  }

  const fallbackFilename = normalizedConfigured || defaultFilename;
  addCandidate(candidates, path.resolve(process.cwd(), fallbackFilename));
  addCandidate(candidates, path.resolve(process.cwd(), 'backend', 'data', fallbackFilename));
  addCandidate(candidates, path.resolve(process.cwd(), 'data', fallbackFilename));
  addCandidate(candidates, path.join(packageRoot, 'data', defaultFilename));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  if (normalizedConfigured) {
    throw new Error(`${label} 文件不存在: ${normalizedConfigured}`);
  }

  if (required) {
    throw new Error(`${label} 文件未找到，请检查部署配置`);
  }

  return null;
};

const buildIp2regionInstance = () => {
  const opts: IP2RegionOpts = {};
  const ipv4Path = resolveDbPath('ip2region IPv4', env.ip2regionPath, DEFAULT_IPV4_DB, true);
  const ipv6Path = resolveDbPath('ip2region IPv6', env.ip2regionIpv6Path, DEFAULT_IPV6_DB, false);

  if (ipv4Path) {
    opts.ipv4db = ipv4Path;
  }
  if (ipv6Path) {
    opts.ipv6db = ipv6Path;
  }

  return new IP2Region(opts);
};

const ip2region = buildIp2regionInstance();

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

const toRegionInfo = (result: IP2RegionResult): RegionInfo => {
  const country = asText(result.country);
  const province = asText(result.province);
  const city = asText(result.city);
  const isp = asText(result.isp);

  return {
    country,
    province,
    city,
    region: province !== UNKNOWN_TEXT ? province : city,
    isp
  };
};

export const lookupRegion = (ip: string): RegionInfo | null => {
  const targetIp = normalizeIp(ip);
  if (!targetIp) {
    return null;
  }

  try {
    const result = ip2region.search(targetIp);
    if (!result) {
      return null;
    }
    return toRegionInfo(result);
  } catch (error) {
    logger.warn({ err: error }, 'IP 定位失败');
    return null;
  }
};
