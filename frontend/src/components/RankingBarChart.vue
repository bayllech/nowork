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
  // 确保从高到低排序
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
          fontSize: 14,
          fontWeight: 600
        }
      }
    : undefined,
  grid: {
    left: 10,
    right: 80,
    top: props.title ? 50 : 10,
    bottom: 10,
    containLabel: true
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
    // 去除竖线显示
    splitLine: {
      show: false
    },
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      show: false
    }
  },
  yAxis: {
    type: 'category',
    data: categories.value,
    inverse: true, // 确保从上到下显示，第一个在顶部
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#374151',
      fontSize: 13,
      fontWeight: 500,
      margin: 16,
      align: 'right',
      formatter: (value: string) => {
        // 限制名称长度，避免过长
        return value.length > 8 ? value.substring(0, 7) + '...' : value;
      }
    }
  },
  series: [
    {
      type: 'bar' as const,
      data: seriesData.value,
      itemStyle: {
        color: props.color,
        borderRadius: [0, 6, 6, 0]
      },
      label: {
        show: true,
        position: 'right',
        // 优化数字显示样式
        formatter: (params: { value: number }) => {
          return params.value.toLocaleString();
        },
        color: '#1f2937',
        fontSize: 13,
        fontWeight: 600,
        margin: 8
      },
      // 添加渐变效果
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  ]
}));
</script>
