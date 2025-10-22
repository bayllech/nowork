import '@testing-library/jest-dom';
import { defineComponent, h } from 'vue';

vi.mock('vue-echarts', () => ({
  default: defineComponent({
    name: 'VChartStub',
    props: ['option', 'autoresize'],
    setup(_, { attrs }) {
      return () => h('div', { 'data-testid': 'vchart-stub', ...attrs });
    }
  })
}));

Object.defineProperty(global.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn().mockResolvedValue(undefined)
});

Object.defineProperty(global.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn()
});
