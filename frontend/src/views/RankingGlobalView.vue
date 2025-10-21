<template>
  <div class="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-24 pt-12">
    <NavigationBar context-label="全球打工人怒气榜" />
    <main class="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
      <section class="space-y-6 rounded-3xl bg-white/90 p-8 shadow-card backdrop-blur">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="font-display text-3xl font-extrabold">Global Anger Pulse</h1>
            <p class="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              谁说只有国人被压榨？欧美、亚太、东南亚的打工人也在猛敲键盘。海外榜按国家聚合，基于匿名 IP 显示今日怒气水平。
            </p>
          </div>
          <div class="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-muted">
            <span class="inline-flex h-3 w-3 rounded-full bg-accent"></span>
            <span>情绪过热 · 8 小时内爆表</span>
          </div>
        </div>

        <div class="grid gap-4 rounded-3xl border border-dashed border-primary-light bg-primary-light/50 p-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="flex items-center gap-3 font-display text-xl font-bold text-primary-strong">
              <i class="fa-solid fa-earth-americas"></i> 怒气地图
            </h2>
            <div class="flex items-center gap-2 text-xs font-semibold text-muted">
              <button
                v-for="period in periodOptions"
                :key="period.value"
                class="rounded-full px-3 py-1 transition"
                :class="periodClass(period.value)"
                type="button"
                @click="changePeriod(period.value)"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
          <div class="rounded-3xl border border-white/60 bg-white/70 p-4 shadow-inner">
            <StatsMap :map-type="'world'" :data="worldMapData" unit="次" />
          </div>
          <div class="rounded-3xl border border-white/60 bg-white/60 p-4 shadow-inner">
            <RankingBarChart :items="globalBarData" title="国家热度 Top 10" color="#06b6d4" unit="次" />
          </div>
          <p class="text-xs text-muted">地图为设计占位，可替换 Canvas / SVG 实现，颜色越鲜代表怒气越高。</p>
        </div>
      </section>

      <aside class="space-y-6 rounded-3xl bg-white/90 p-8 shadow-card backdrop-blur">
        <header class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="font-display text-2xl font-bold text-ink">国家怒气排行榜</h2>
            <p class="text-sm text-muted">实时汇总海外用户的怒气指数，并根据最近点击热度排序。</p>
          </div>
          <div class="flex gap-2 text-xs font-semibold text-muted">
            <span class="rounded-full bg-primary-light px-3 py-1" :class="{ 'bg-primary-strong text-white': stats.globalPeriod === 'daily' }"
              >今日榜</span
            >
            <span class="rounded-full bg-white px-3 py-1" :class="{ 'bg-primary-strong text-white': stats.globalPeriod === 'total' }"
              >总榜</span
            >
          </div>
        </header>
        <div class="grid gap-4">
          <article
            v-for="country in countryHighlights"
            :key="country.country"
            class="grid gap-3 rounded-3xl bg-white/90 px-6 py-5 shadow-soft ring-1 ring-white/60 transition hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <div class="text-lg font-bold text-ink">
                <span class="mr-2 rounded-full bg-primary-light px-3 py-1 text-sm font-semibold text-primary-strong">
                  #{{ country.rank }}
                </span>
                {{ country.country }}
              </div>
              <div class="text-sm font-semibold text-muted uppercase tracking-[0.2em]">怒气指数</div>
            </div>
            <p class="text-sm text-muted"><i class="fa-solid fa-quote-left mr-2 text-primary"></i>{{ country.highlight }}</p>
            <div class="flex items-center justify-between text-sm">
              <span class="font-semibold text-primary-strong"><i class="fa-solid fa-bolt mr-2 text-accent"></i>{{ country.count.toLocaleString() }} 次</span>
              <span class="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-strong">
                {{ stats.globalPeriod === 'daily' ? '今日榜' : '总榜' }}
              </span>
            </div>
          </article>
          <p v-if="!countryHighlights.length" class="rounded-3xl border border-dashed border-primary-light/70 px-6 py-8 text-center text-sm text-muted">
            暂无海外数据，请稍后刷新或检查后端服务。
          </p>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import RankingBarChart from '../components/RankingBarChart.vue';
import StatsMap from '../components/StatsMap.vue';
import { useStatsStore } from '../stores';

const stats = useStatsStore();

const periodOptions: Array<{ label: string; value: 'daily' | 'total' }> = [
  { label: '今日', value: 'daily' },
  { label: '总榜', value: 'total' }
];

const countryNameMap: Record<string, string> = {
  美国: 'United States',
  英国: 'United Kingdom',
  法国: 'France',
  德国: 'Germany',
  日本: 'Japan',
  韩国: 'South Korea',
  加拿大: 'Canada',
  澳大利亚: 'Australia',
  印度: 'India',
  俄罗斯: 'Russia',
  巴西: 'Brazil',
  西班牙: 'Spain',
  意大利: 'Italy',
  新加坡: 'Singapore',
  泰国: 'Thailand',
  马来西亚: 'Malaysia',
  越南: 'Vietnam',
  菲律宾: 'Philippines',
  印度尼西亚: 'Indonesia',
  墨西哥: 'Mexico',
  阿联酋: 'United Arab Emirates',
  瑞典: 'Sweden',
  挪威: 'Norway',
  荷兰: 'Netherlands',
  瑞士: 'Switzerland',
  丹麦: 'Denmark',
  比利时: 'Belgium',
  爱尔兰: 'Ireland',
  葡萄牙: 'Portugal',
  南非: 'South Africa',
  沙特阿拉伯: 'Saudi Arabia',
  阿根廷: 'Argentina',
  智利: 'Chile',
  波兰: 'Poland',
  以色列: 'Israel',
  新西兰: 'New Zealand',
  土耳其: 'Turkey',
  阿曼: 'Oman',
  卡塔尔: 'Qatar',
  科威特: 'Kuwait',
  中国香港: 'Hong Kong',
  中国台湾: 'Taiwan'
};

const convertCountryName = (name: string) => {
  if (!name || name === '未知国家') {
    return null;
  }
  return countryNameMap[name] ?? name;
};

const worldMapData = computed<Array<{ name: string; value: number; label?: string }>>(() => {
  const items: Array<{ name: string; value: number; label?: string }> = [];
  for (const country of stats.globalCountries) {
    const mappedName = convertCountryName(country.country);
    if (!mappedName) continue;
    items.push({
      name: mappedName,
      value: country.count,
      label: country.country
    });
  }
  return items;
});

const globalBarData = computed(() =>
  stats.globalCountries.map((country) => ({
    name: country.country,
    value: country.count
  }))
);

const countryHighlights = computed(() =>
  stats.globalCountries.slice(0, 8).map((country, index) => ({
    ...country,
    rank: index + 1,
    highlight: highlightText(country.country)
  }))
);

const highlightText = (country: string) => {
  switch (country) {
    case '美国':
    case 'United States':
      return '反内卷联盟呼声最高，连续 4 小时保持高热。';
    case '日本':
      return '加班文化深度焦虑，怒气曲线持续走高。';
    case '新加坡':
      return '金融圈 KPI 洪水猛兽，怒气暴增 36%。';
    case '德国':
      return '项目计划 + 严谨文化，怒气指数稳居前三。';
    default:
      return '怒气指数持续走高，正在呼唤更多共鸣。';
  }
};

const periodClass = (period: 'daily' | 'total') => {
  const isActive = stats.globalPeriod === period;
  return isActive
    ? 'bg-primary-strong text-white shadow-soft'
    : 'border border-white/60 bg-white px-3 py-1 text-muted hover:bg-primary-light/60';
};

const changePeriod = (period: 'daily' | 'total') => {
  if (stats.globalPeriod !== period) {
    stats.fetchGlobalRanking(period);
  }
};

onMounted(() => {
  stats.fetchGlobalRanking(stats.globalPeriod);
});
</script>
