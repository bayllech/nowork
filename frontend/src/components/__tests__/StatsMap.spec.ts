import { render, screen } from '@testing-library/vue';
import { defineComponent, h, nextTick } from 'vue';
import StatsMap from '../StatsMap.vue';

vi.mock('echarts/core', () => {
  const getMap = vi.fn(() => ({}) as any);
  const registerMap = vi.fn();
  return {
    getMap,
    registerMap
  };
});

describe('StatsMap', () => {
  const fallbackText = '暂无怒气数据，等待最新敲击同步...';

  it('显示兜底提示并在有数据时渲染图表', async () => {
    const { rerender } = render(StatsMap, {
      props: {
        mapType: 'china',
        data: []
      },
      global: {
        components: {
          VChart: defineComponent({
            name: 'VChartStub',
            setup() {
              return () => h('div', { 'data-testid': 'vchart-stub' });
            }
          })
        }
      }
    });

    await nextTick();
    expect(await screen.findByText(fallbackText)).toBeInTheDocument();

    await rerender({
      mapType: 'china',
      data: [{ name: '上海', value: 180 }]
    });

    await nextTick();
    expect(screen.queryByText(fallbackText)).toBeNull();
    expect(screen.getByTestId('vchart-stub')).toBeInTheDocument();
  });
});
