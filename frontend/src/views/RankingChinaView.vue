<template>
  <div class="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-12 pt-12">
    <NavigationBar context-label="全国怒气监控台" />
    <main class="grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-stretch">
      <section class="space-y-6 rounded-3xl bg-white/90 px-8 pb-0 pt-8 shadow-card backdrop-blur">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="font-display text-3xl font-extrabold text-ink">中国怒气热力面板</h1>
            <p class="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              按省份实时统计敲击总量，颜色越深表示越多打工人正在怒敲「我就不干」。数据默认展示当日汇总，每 60 秒刷新一次。
            </p>
          </div>
          <div
            class="inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-2 text-sm font-semibold text-primary-strong shadow-soft"
          >
            <i class="fa-solid fa-rotate mr-1"></i> 上次刷新：{{ lastUpdatedLabel }}
          </div>
        </div>

        <div class="grid gap-4 rounded-3xl border border-dashed border-primary-light bg-primary-light/40 px-6 pb-6 pt-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="font-display text-xl font-bold text-primary-strong">
                <i class="fa-solid fa-map-location-dot mr-2"></i> 全国怒气热力图
              </h2>
              <p class="text-xs font-semibold text-muted">
                当前展示：{{ stats.chinaPeriod === 'daily' ? '今日新增怒气' : '总榜累积怒气' }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <div
                class="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted"
              >
                <span class="h-2 w-2 rounded-full bg-accent"></span>
                <span>颜色越深怒气越旺</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  v-for="period in periodOptions"
                  :key="period.value"
                  class="rounded-full px-3 py-1 text-xs font-semibold transition"
                  :class="periodClass(period.value)"
                  type="button"
                  @click="changePeriod(period.value)"
                >
                  {{ period.label }}
                </button>
              </div>
            </div>
          </div>
          <div class="rounded-3xl border border-white/50 bg-white/50 p-4 shadow-inner">
            <StatsMap :map-type="'china'" :data="provinceMapData" unit="次" />
          </div>
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <span class="text-xs text-muted"><i class="fa-solid fa-circle-exclamation mr-1"></i> 地图可缩放，悬停查看具体省份怒气值</span>
            <span class="rounded-full border border-white/70 px-2 py-0.5 text-[10px] font-semibold text-muted"
              >共统计 {{ provinceMapData.length }} 个省级行政区</span
            >
          </div>
        </div>

      </section>

      <aside class="flex flex-col rounded-3xl bg-white/90 p-8 shadow-card backdrop-blur">
        <header class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 class="font-display text-2xl font-bold text-ink">省市怒气排行榜</h2>
            <p class="text-sm text-muted">综合省份核心城市的怒气指数，仅展示最新敲击热力 Top 5。</p>
          </div>
          <div class="flex items-center gap-2 text-xs text-muted">
            <span class="inline-flex h-3 w-3 rounded-full bg-accent"></span> Lv.3+
            <span class="inline-flex h-3 w-3 rounded-full bg-primary-strong/70"></span> Lv.2
          </div>
        </header>
        <div class="mt-6 grid gap-3">
          <article
            v-for="province in provinceLeaders"
            :key="province.province"
            class="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/90 px-5 py-4 shadow-soft ring-1 ring-white/60 transition hover:-translate-y-1"
          >
            <span
              class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-base font-semibold text-primary-strong"
            >
              {{ province.rank }}
            </span>
            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <span class="truncate text-base font-semibold text-ink">{{ province.province }}</span>
              <span class="text-xs font-semibold text-muted">怒气等级 Lv.{{ province.level }}</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold text-primary-strong">
                <i class="fa-solid fa-bolt mr-2 text-accent"></i>{{ province.count.toLocaleString() }} 次
              </div>
              <div class="text-xs font-semibold text-muted">{{ province.extra }}</div>
            </div>
          </article>
          <p v-if="!provinceLeaders.length" class="rounded-2xl border border-dashed border-primary-light/70 px-4 py-6 text-center text-sm text-muted">
            暂无省份数据，请确认服务端是否运行。
          </p>
        </div>
        <p class="mt-4 text-xs leading-relaxed text-muted">
          数据按{{ stats.chinaPeriod === 'daily' ? '今日' : '累计' }}敲击量排序，每 15 分钟刷新一次；仅展示前 5 名，若数据接近则优先显示怒气等级更高的地区。
        </p>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import StatsMap from '../components/StatsMap.vue';
import chinaGeo from '../assets/geo/china.json';
import { useStatsStore } from '../stores';

const stats = useStatsStore();
const updatedAt = ref('');

const periodOptions: Array<{ label: string; value: 'daily' | 'total' }> = [
  { label: '今日', value: 'daily' },
  { label: '总榜', value: 'total' }
];

const totalProvinceCount = computed(() =>
  stats.chinaProvinces.reduce((sum, province) => sum + (province.count ?? 0), 0)
);

const provinceLeaders = computed(() => {
  return stats.chinaProvinces.slice(0, 5).map((province, index) => {
    const percent = totalProvinceCount.value
      ? `${Math.round((province.count / totalProvinceCount.value) * 100)}%`
      : '—';
    const rank = index + 1;
    const level = rank <= 2 ? 3 : rank <= 4 ? 2 : 1;
    return {
      province: province.province,
      count: province.count,
      extra: stats.chinaPeriod === 'daily' ? `全国占比 ${percent}` : `累积热度 ${percent}`,
      rank,
      level
    };
  });
});

type ChinaGeoFeature = { properties: { name: string } };
const chinaFeatures = (chinaGeo as { features?: ChinaGeoFeature[] }).features ?? [];
const chinaProvinceNames = Array.from(new Set(chinaFeatures.map((feature) => feature.properties.name)));
const provinceNameAlias: Record<string, string> = {
  北京: '北京市',
  北京市: '北京市',
  天津: '天津市',
  天津市: '天津市',
  上海: '上海市',
  上海市: '上海市',
  重庆: '重庆市',
  重庆市: '重庆市',
  内蒙古: '内蒙古自治区',
  内蒙古自治区: '内蒙古自治区',
  广西: '广西壮族自治区',
  广西壮族自治区: '广西壮族自治区',
  西藏: '西藏自治区',
  西藏自治区: '西藏自治区',
  宁夏: '宁夏回族自治区',
  宁夏回族自治区: '宁夏回族自治区',
  新疆: '新疆维吾尔自治区',
  新疆维吾尔自治区: '新疆维吾尔自治区',
  香港: '香港特别行政区',
  香港特别行政区: '香港特别行政区',
  澳门: '澳门特别行政区',
  澳门特别行政区: '澳门特别行政区',
  台湾: '台湾省',
  台湾省: '台湾省'
};

const normalizeProvinceForMap = (name: string) => {
  if (!name || name === '未知地区') {
    return null;
  }
  if (provinceNameAlias[name]) {
    return provinceNameAlias[name];
  }
  if (
    name.endsWith('省') ||
    name.endsWith('市') ||
    name.endsWith('自治区') ||
    name.endsWith('特别行政区')
  ) {
    return name;
  }
  return `${name}省`;
};

const provinceMapData = computed(() => {
  const counter = new Map<
    string,
    {
      value: number;
      label: string;
    }
  >();

  stats.chinaProvinces.forEach((province) => {
    const canonical = normalizeProvinceForMap(province.province);
    if (!canonical) {
      return;
    }
    const current = counter.get(canonical);
    counter.set(canonical, {
      value: (current?.value ?? 0) + Number(province.count ?? 0),
      label: province.province
    });
  });

  return chinaProvinceNames.map((name) => {
    const record = counter.get(name);
    return {
      name,
      value: record?.value ?? 0,
      label: record?.label ?? name
    };
  });
});

const changePeriod = (period: 'daily' | 'total') => {
  if (stats.chinaPeriod !== period) {
    stats.fetchChinaRanking(period).then(() => {
      updatedAt.value = new Date().toLocaleTimeString();
    });
  }
};

const periodClass = (period: 'daily' | 'total') => {
  const isActive = stats.chinaPeriod === period;
  return isActive
    ? 'bg-primary-strong text-white shadow-soft'
    : 'border border-white/50 text-muted hover:bg-white/70 hover:text-primary-strong';
};

const lastUpdatedLabel = computed(() => {
  if (updatedAt.value) {
    return updatedAt.value;
  }
  return new Date().toLocaleTimeString();
});

onMounted(async () => {
  await stats.fetchChinaRanking(stats.chinaPeriod);
  updatedAt.value = new Date().toLocaleTimeString();
});

watch(
  () => stats.chinaPeriod,
  () => {
    updatedAt.value = new Date().toLocaleTimeString();
  }
);
</script>
