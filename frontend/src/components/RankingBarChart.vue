<template>
  <div class="h-80 w-full">
    <VChart :option="option" autoresize class="h-full w-full" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    items: Array<{ name: string; value: number }>;
    title?: string;
    color?: string;
    unit?: string;
  }>(),
  {
    color: '#6366f1',
    title: ''
  }
);

const sortedItems = computed<Array<{ name: string; value: number }>>(() => {
  return props.items
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
});

const categories = computed(() => sortedItems.value.map((item) => item.name));
const seriesData = computed(() => sortedItems.value.map((item) => Number(item.value ?? 0)));

const option = computed(() => ({
  title: props.title
    ? {
        text: props.title,
        textStyle: {
          color: '#1f2937',
          fontSize: 14
        }
      }
    : undefined,
  grid: {
    left: 80,
    right: 20,
    top: props.title ? 50 : 20,
    bottom: 20
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: (params: Array<{ name: string; value: number }>) => {
      const first = params && params.length > 0 ? params[0] : null;
      if (!first) {
        return '';
      }
      return `${first.name}<br />怒气值：${first.value}${props.unit ?? ''}`;
    }
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.1],
    axisLine: { lineStyle: { color: '#cbd5f5' } },
    axisLabel: { color: '#6b7280' }
  },
  yAxis: {
    type: 'category',
    data: categories.value,
    axisLine: { lineStyle: { color: '#ede9fe' } },
    axisLabel: {
      color: '#4b5563',
      formatter: (value: string) => value
    }
  },
  series: [
    {
      type: 'bar' as const,
      data: seriesData.value,
      itemStyle: {
        color: props.color,
        borderRadius: [0, 8, 8, 0]
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}'
      }
    }
  ]
}));
</script>
