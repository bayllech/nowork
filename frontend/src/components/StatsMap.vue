<template>
  <div class="h-80 w-full">
    <VChart v-if="isReady && hasData" :option="option" autoresize class="h-full w-full" />
    <div
      v-else-if="isReady"
      class="flex h-full items-center justify-center rounded-2xl border border-dashed border-primary-subtle text-xs text-muted"
    >
      暂无怒气数据，等待最新敲击同步...
    </div>
    <div
      v-else
      class="flex h-full items-center justify-center rounded-2xl border border-dashed border-primary-subtle text-xs text-muted"
    >
      地图加载中...
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { getMap, registerMap } from 'echarts/core';

const props = defineProps<{
  mapType: 'china' | 'world';
  data: Array<{ name: string; value: number; label?: string }>;
  unit?: string;
}>();

const isReady = ref(false);

const ensureMapRegistered = async (type: 'china' | 'world') => {
  if (getMap(type)) {
    return;
  }
  if (type === 'china') {
    const module = await import('@/assets/geo/china.json');
    const geoJson = ((module as { default?: unknown }).default ?? module) as unknown;
    registerMap('china', geoJson as any);
  } else {
    const [atlasModule, topojsonModule] = await Promise.all([
      import('world-atlas/countries-110m.json'),
      import('topojson-client')
    ]);
    const worldData = ((atlasModule as { default?: unknown }).default ?? atlasModule) as any;
    const topojson = topojsonModule as typeof import('topojson-client');
    const geoJson = topojson.feature(worldData, worldData.objects.countries);
    registerMap('world', geoJson as any);
  }
};

const loadMap = async (type: 'china' | 'world') => {
  isReady.value = false;
  await ensureMapRegistered(type);
  isReady.value = true;
};

onMounted(() => {
  loadMap(props.mapType);
});

watch(
  () => props.mapType,
  (type) => {
    loadMap(type);
  }
);

const maxValue = computed(() => {
  const values = props.data.map((item) => item.value);
  const max = Math.max(...values, 0);
  if (max <= 0) return 100;
  if (max <= 50) return 50;
  if (max <= 100) return 100;
  return Math.ceil(max / 50) * 50;
});

const hasData = computed(() => props.data.some((item) => Number(item.value ?? 0) > 0));

const option = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    formatter: (params: { name: string; value: number; data?: { label?: string } }) => {
      const value = Number.isFinite(params.value) ? params.value : 0;
      const displayName = params?.data?.label ?? params.name;
      return `${displayName}<br />怒气值：${value}${props.unit ?? ''}`;
    }
  },
  visualMap: {
    min: 0,
    max: maxValue.value,
    left: 'left',
    bottom: '10%',
    text: ['高', '低'],
    calculable: true,
    inRange: {
      color: ['#ede9fe', '#a855f7', '#7c3aed']
    }
  },
  series: [
    {
      name: props.mapType === 'china' ? '国内怒气' : '海外怒气',
      type: 'map' as const,
      map: props.mapType === 'china' ? 'china' : 'world',
      roam: 'scale',
      emphasis: {
        label: {
          color: '#fff'
        },
        itemStyle: {
          areaColor: '#6d28d9'
        }
      },
      itemStyle: {
        areaColor: '#ede9fe',
        borderColor: '#c4b5fd',
        borderWidth: 0.6
      },
      data: props.data
    }
  ]
}));
</script>
