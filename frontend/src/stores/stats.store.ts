import { defineStore } from 'pinia';
import {
  getChinaStats,
  getGlobalStats,
  getStatsSummary,
  postHit,
  type HitRequest,
  type HitResponse
} from '../services/api';

export interface CityRankingItem {
  city: string;
  province: string;
  count: number;
}

export interface CountryRankingItem {
  country: string;
  count: number;
}

export type RankingPeriod = 'daily' | 'total';

export interface StatsState {
  chinaPeriod: RankingPeriod;
  globalPeriod: RankingPeriod;
  chinaProvinces: Array<{
    province: string;
    count: number;
    cities: CityRankingItem[];
  }>;
  chinaCities: CityRankingItem[];
  globalCountries: CountryRankingItem[];
  totalCount: number;
  dailyCount: number;
  angerLevel: number;
  lastPhrase: string | null;
  lastLocation: { country: string; province: string; city: string } | null;
  summaryTimestamp: string | null;
  loading: boolean;
  hitLoading: boolean;
  summaryLoading: boolean;
  hitInFlight: number;
  error: string | null;
  summaryError: string | null;
}

const normalizeCity = (value: string) => (value && value !== '未知' ? value : '未知城市');
const normalizeProvince = (value: string) => (value && value !== '未知' ? value : '未知地区');
const normalizeCountry = (value: string) => (value && value !== '未知' ? value : '未知国家');

export const useStatsStore = defineStore('stats', {
  state: (): StatsState => ({
    chinaPeriod: 'daily',
    globalPeriod: 'daily',
    chinaProvinces: [],
    chinaCities: [],
    globalCountries: [],
    totalCount: 0,
    dailyCount: 0,
    angerLevel: 0,
    lastPhrase: null,
    lastLocation: null,
    summaryTimestamp: null,
    loading: false,
    hitLoading: false,
    hitInFlight: 0,
    summaryLoading: false,
    error: null,
    summaryError: null
  }),
  actions: {
    setHitState(result: HitResponse) {
      this.totalCount = result.totalCount;
      this.dailyCount = result.dailyCount;
      this.angerLevel = result.angerLevel;
      this.lastPhrase = result.phrase;
      this.lastLocation = {
        country: normalizeCountry(result.country),
        province: normalizeProvince(result.province),
        city: normalizeCity(result.city)
      };
      this.summaryTimestamp = new Date().toISOString();
      this.summaryError = null;
    },
    async fetchSummary(page = 'default') {
      this.summaryLoading = true;
      this.summaryError = null;
      try {
        const response = await getStatsSummary({ page });
        this.totalCount = response.aggregated.total;
        this.dailyCount = response.pageStats.daily;
        this.angerLevel = response.pageStats.angerLevel;
        this.summaryTimestamp = response.generatedAt;
      } catch (error) {
        this.summaryError = error instanceof Error ? error.message : '获取怒气摘要失败';
      } finally {
        this.summaryLoading = false;
      }
    },
    async recordHit(payload: HitRequest) {
      this.hitInFlight += 1;
      this.hitLoading = this.hitInFlight > 0;
      this.error = null;
      this.summaryError = null;
      try {
        const response = await postHit(payload);
        this.setHitState(response);
        return response;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '怒气按钮调用失败';
        throw error;
      } finally {
        this.hitInFlight = Math.max(0, this.hitInFlight - 1);
        this.hitLoading = this.hitInFlight > 0;
      }
    },
    async fetchChinaRanking(period: RankingPeriod) {
      this.chinaPeriod = period;
      this.loading = true;
      this.error = null;
      try {
        const response = await getChinaStats({ period, page: 'default' });
        this.chinaProvinces = response.provinces.map((province) => ({
          province: normalizeProvince(province.province),
          count: Number(province.count ?? 0),
          cities: province.cities.map((city) => ({
            city: normalizeCity(city.city),
            province: normalizeProvince(province.province),
            count: Number(city.count ?? 0)
          }))
        }));
        const cities: CityRankingItem[] = [];
        this.chinaProvinces.forEach((province) => {
          province.cities.forEach((city) => {
            cities.push(city);
          });
        });
        this.chinaCities = cities.sort((a, b) => b.count - a.count).slice(0, 20);
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取国内榜失败';
        this.chinaProvinces = [];
        this.chinaCities = [];
      } finally {
        this.loading = false;
      }
    },
    async fetchGlobalRanking(period: RankingPeriod) {
      this.globalPeriod = period;
      this.loading = true;
      this.error = null;
      try {
        const response = await getGlobalStats({ period, page: 'default' });
        this.globalCountries = response.countries
          .map((item) => ({
            country: normalizeCountry(item.country),
            count: Number(item.count ?? 0)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取海外榜失败';
        this.globalCountries = [];
      } finally {
        this.loading = false;
      }
    }
  }
});
