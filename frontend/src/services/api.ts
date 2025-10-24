const DEFAULT_API_BASE_URL = '';

const buildUrl = (path: string) => {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_API_BASE_URL;
  if (path.startsWith('http')) {
    return path;
  }
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json'
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error('接口返回异常，无法解析 JSON');
  }
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const url = buildUrl(path);
  const response = await fetch(url, {
    ...init,
    headers: {
      ...defaultHeaders,
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `请求失败：${response.status}`);
  }

  return parseResponse<T>(response);
};

export interface HitRequest {
  page?: string;
  role?: string | null;
}

export interface HitResponse {
  totalCount: number;
  dailyCount: number;
  angerLevel: number;
  phrase: string;
  country: string;
  province: string;
  city: string;
}

export interface ChinaStatsResponse {
  page: string;
  period: 'daily' | 'total';
  date: string | null;
  provinces: Array<{
    province: string;
    count: number;
    cities: Array<{ city: string; count: number }>;
  }>;
}

export interface GlobalStatsResponse {
  page: string;
  period: 'daily' | 'total';
  date: string | null;
  countries: Array<{ country: string; count: number }>;
}

export interface PhraseListResponse {
  page: string;
  count: number;
  limit: number;
  offset: number;
  nextOffset: number;
  hasMore: boolean;
  phrases: Array<{ id: number; content: string; weight: number }>;
}

export interface StatsSummaryResponse {
  page: string;
  aggregated: {
    total: number;
    daily: number;
    angerLevel: number;
  };
  pageStats: {
    total: number;
    daily: number;
    angerLevel: number;
  };
  generatedAt: string;
}

export interface RoleDefinition {
  key: string;
  title: string;
  description: string;
  quote: string;
  icon: string;
  colorFrom: string;
  colorTo: string;
  badge?: string;
  level: number;
}

export interface RolesResponse {
  count: number;
  roles: RoleDefinition[];
}

export const postHit = (payload: HitRequest) => {
  return request<HitResponse>('/api/hit', {
    method: 'POST',
    body: JSON.stringify(payload ?? {})
  });
};

export const getChinaStats = (params: { period: 'daily' | 'total'; page?: string; date?: string }) => {
  const query = new URLSearchParams({
    period: params.period,
    ...(params.page ? { page: params.page } : {}),
    ...(params.date ? { date: params.date } : {})
  });
  return request<ChinaStatsResponse>(`/api/stats/china?${query.toString()}`);
};

export const getGlobalStats = (params: { period: 'daily' | 'total'; page?: string; date?: string }) => {
  const query = new URLSearchParams({
    period: params.period,
    ...(params.page ? { page: params.page } : {}),
    ...(params.date ? { date: params.date } : {})
  });
  return request<GlobalStatsResponse>(`/api/stats/global?${query.toString()}`);
};

export const getPhrases = (params: { page?: string; limit?: number; offset?: number }) => {
  const searchParams = new URLSearchParams({
    ...(params.page ? { page: params.page } : {}),
    ...(params.limit !== undefined ? { limit: String(params.limit) } : {}),
    ...(params.offset !== undefined ? { offset: String(params.offset) } : {})
  });
  const queryString = searchParams.toString();
  const suffix = queryString ? `?${queryString}` : '';
  return request<PhraseListResponse>(`/api/phrases${suffix}`);
};

export const getStatsSummary = (params?: { page?: string }) => {
  const searchParams = new URLSearchParams({
    ...(params?.page ? { page: params.page } : {})
  });
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return request<StatsSummaryResponse>(`/api/stats/summary${suffix}`);
};

export const getRoles = (params?: { level?: number; limit?: number }) => {
  const searchParams = new URLSearchParams({
    ...(params?.level !== undefined ? { level: String(params.level) } : {}),
    ...(params?.limit !== undefined ? { limit: String(params.limit) } : {})
  });
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return request<RolesResponse>(`/api/roles${suffix}`);
};
