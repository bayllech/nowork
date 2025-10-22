import { fireEvent, render, screen } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import AngerButton from '../AngerButton.vue';
import { useStatsStore } from '@/stores';

const flushAsync = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const apiMock = vi.hoisted(() => ({
  postHit: vi.fn(),
  getStatsSummary: vi.fn(),
  getChinaStats: vi.fn(),
  getGlobalStats: vi.fn(),
  getPhrases: vi.fn(),
  getRoles: vi.fn()
}));

vi.mock('@/services/api', () => apiMock);

describe('AngerButton', () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    apiMock.postHit.mockResolvedValue({
      totalCount: 1280,
      dailyCount: 186,
      angerLevel: 2,
      phrase: '愤怒释放',
      country: '中国',
      province: '上海',
      city: '上海'
    });
    pinia = createPinia();
    setActivePinia(pinia);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('支持连续快速敲击以及键盘触发', async () => {
    render(AngerButton, {
      global: {
        plugins: [pinia]
      }
    });

    const button = screen.getByRole('button', { name: /Press/i });
    const statsStore = useStatsStore();

    expect(statsStore.hitLoading).toBe(false);

    await fireEvent.pointerDown(button);
    await fireEvent.pointerUp(button);
    await flushAsync();
    await nextTick();

    expect(apiMock.postHit).toHaveBeenCalledTimes(1);
    expect(button).not.toBeDisabled();
    expect(statsStore.dailyCount).toBe(186);
    expect(statsStore.angerLevel).toBe(2);

    await fireEvent.pointerDown(button);
    await fireEvent.pointerUp(button);
    await fireEvent.keyDown(window, { key: ' ', code: 'Space' });
    await fireEvent.keyUp(window, { key: ' ', code: 'Space' });
    await fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });
    await fireEvent.keyUp(window, { key: 'Enter', code: 'Enter' });

    await flushAsync();
    await nextTick();

    expect(apiMock.postHit).toHaveBeenCalledTimes(4);
    expect(statsStore.hitInFlight).toBe(0);
    expect(statsStore.hitLoading).toBe(false);
  });

  it('键盘长按仅触发一次敲击', async () => {
    render(AngerButton, {
      global: {
        plugins: [pinia]
      }
    });

    await fireEvent.keyDown(window, { key: ' ', code: 'Space' });
    await flushAsync();
    await nextTick();

    expect(apiMock.postHit).toHaveBeenCalledTimes(1);

    await fireEvent.keyDown(window, { key: ' ', code: 'Space', repeat: true });
    await flushAsync();
    await nextTick();

    expect(apiMock.postHit).toHaveBeenCalledTimes(1);

    await fireEvent.keyUp(window, { key: ' ', code: 'Space' });
    await fireEvent.keyDown(window, { key: ' ', code: 'Space' });
    await fireEvent.keyUp(window, { key: ' ', code: 'Space' });

    await flushAsync();
    await nextTick();

    expect(apiMock.postHit).toHaveBeenCalledTimes(2);
  });
});
