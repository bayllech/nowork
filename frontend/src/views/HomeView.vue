<template>
  <div class="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 pb-16 pt-6">
    <NavigationBar context-label="打工人怒气续命计划" />
    <main class="flex flex-col items-center gap-8">
      <section class="flex w-full flex-col items-center gap-4 text-center">
        <h1 class="font-display text-5xl font-extrabold leading-tight text-ink md:text-6xl">
          按下去，<span class="text-accent">甩掉今天的委屈</span>
        </h1>
        <p class="max-w-3xl text-sm leading-relaxed text-muted">
          巨型怒气按钮全年无休，猛敲即可触发怒气播报、炸裂音效与热点吐槽卡，一敲就上头。
        </p>
      </section>

      <section class="flex w-full flex-col items-center gap-6">
        <AngerButton
          :page="'default'"
          :role-key="roles.activeRoleKey"
          @hit-success="handleHitSuccess"
        />

        <section
          class="grid w-full gap-2 rounded-[26px] bg-white/75 px-5 py-4 text-sm text-muted shadow-inner sm:grid-cols-2 md:grid-cols-4"
        >
          <div class="flex items-center justify-center gap-3 border-white/40 px-2 py-2 md:border-r">
            <i class="fa-solid fa-fire text-accent text-lg"></i>
            <div>
              <p class="text-xs font-semibold tracking-[0.24em] text-primary-strong/70">今日猛击</p>
              <p class="text-lg font-bold text-primary-strong">{{ formattedDailyCount }}</p>
            </div>
          </div>
          <div class="flex items-center justify-center gap-3 border-white/40 px-2 py-2 md:border-r">
            <i class="fa-solid fa-earth-asia text-primary-strong text-lg"></i>
            <div>
              <p class="text-xs font-semibold tracking-[0.24em] text-primary-strong/70">全球累计</p>
              <p class="text-lg font-bold text-primary-strong">{{ formattedTotalCount }}</p>
            </div>
          </div>
          <div class="flex items-center justify-center gap-3 px-2 py-2">
            <i class="fa-solid fa-face-flushed text-accent text-lg"></i>
            <div>
              <p class="text-xs font-semibold tracking-[0.24em] text-primary-strong/70">当前心情</p>
              <p class="text-lg font-bold text-primary-strong">{{ angerLabel }}</p>
            </div>
          </div>
          <button
            class="group flex items-center justify-center gap-2 border-t border-white/40 px-2 py-3 text-center text-xs font-semibold tracking-[0.24em] text-primary-strong transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-strong/25 sm:col-span-2 sm:border-0 sm:border-l md:col-span-1"
            type="button"
            @click="toggleShare(true)"
          >
            <i class="fa-solid fa-share-nodes text-base transition group-hover:scale-110"></i>
            <span class="text-primary-strong">分享最新吐槽卡</span>
          </button>
        </section>

        <p v-if="summaryError" class="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          {{ summaryError }}
        </p>
        <p v-else-if="summaryUpdatedAt" class="w-full text-right text-xs text-muted">
          数据刷新于：{{ summaryUpdatedAt }}
        </p>
      </section>
    </main>

    <footer
      class="flex flex-col gap-2 rounded-[24px] bg-white/80 px-5 py-4 text-xs text-muted shadow-inner md:flex-row md:items-center md:justify-between"
    >
      <span>© {{ currentYear }} nowork.click · 打工人情绪续命计划</span>
      <div class="flex flex-wrap items-center gap-3">
        <span><i class="fa-solid fa-lock mr-1"></i> 不存储个人信息，仅记录匿名敲击次数</span>
        <span><i class="fa-regular fa-comment-dots mr-1"></i> 热门吐槽文案每周上新</span>
      </div>
    </footer>
  </div>

  <teleport to="body">
    <transition name="fade">
      <div
        v-if="shareOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur"
        role="dialog"
        aria-modal="true"
      >
        <div class="relative w-full max-w-2xl rounded-[24px] bg-white p-6 shadow-[0_46px_90px_rgba(0,0,0,0.28)]">
          <button
            class="absolute right-5 top-5 text-lg text-muted transition hover:text-ink"
            type="button"
            @click="toggleShare(false)"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div class="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-start">
            <article
              class="grid gap-5 rounded-[18px] border border-primary/25 bg-white px-6 py-8 text-ink shadow-[0_22px_40px_rgba(65,55,255,0.18)]"
            >
              <header class="grid gap-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold uppercase tracking-[0.4em] text-primary-strong/70">nowork.click</span>
                  <span
                    class="inline-flex items-center gap-1 rounded-full bg-primary-light/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-strong"
                  >
                    <i class="fa-solid fa-face-angry text-primary-strong"></i> 怒气 Lv.{{ stats.angerLevel ?? 0 }}
                  </span>
                </div>
                <div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-ink/70">
                  <i class="fa-solid fa-user-tie text-primary-strong"></i>
                  <span>{{ activeRoleTitle }}</span>
                </div>
              </header>
              <p class="text-lg leading-relaxed text-ink">
                {{ sharePhrase }}
              </p>
              <div class="flex flex-wrap gap-3 text-sm text-ink/80">
                <span><i class="fa-solid fa-bolt mr-2"></i> 今日敲击 {{ formattedDailyCount }}</span>
                <span><i class="fa-solid fa-location-dot mr-1"></i> {{ lastLocationDisplay }}</span>
              </div>
              <div class="flex flex-wrap gap-3 text-xs text-ink/60">
                <span><i class="fa-regular fa-clock mr-1"></i> 刷新于 {{ summaryUpdatedAt || '刚刚' }}</span>
                <span><i class="fa-solid fa-share-nodes mr-1"></i> 支持复制 / 下载 / 转发</span>
              </div>
            </article>
            <div class="grid gap-4 text-sm text-ink">
              <h3 class="flex items-center gap-2 text-base font-semibold text-ink">
                <i class="fa-solid fa-share-from-square text-primary"></i> 分享方式
              </h3>
              <p>🌶 一键复制文案，自动写入剪贴板，直接丢进群聊。</p>
              <p>📦 下载 PNG / SVG 卡片，朋友圈、小红书、钉钉群全通用。</p>
              <div class="grid gap-2">
                <button
                  class="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-soft transition hover:bg-primary-light/40"
                  type="button"
                  @click="copyShareText"
                >
                  <i class="fa-solid fa-copy"></i> 复制文案
                </button>
                <button
                  class="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/60 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-soft transition hover:bg-primary-light/50"
                  type="button"
                  disabled
                >
                  <i class="fa-solid fa-cloud-arrow-down"></i> 下载卡片（即将上线）
                </button>
              </div>
              <p v-if="copyFeedback" class="rounded-full bg-primary-light/70 px-4 py-2 text-xs text-primary-strong">
                {{ copyFeedback }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import NavigationBar from '../components/NavigationBar.vue';
import AngerButton from '../components/AngerButton.vue';
import { useRolesStore, useStatsStore } from '../stores';

const route = useRoute();
const stats = useStatsStore();
const roles = useRolesStore();
const shareOpen = ref(false);
const copyFeedback = ref('');

const formattedDailyCount = computed(() => stats.dailyCount.toLocaleString());
const formattedTotalCount = computed(() => stats.totalCount.toLocaleString());
const angerLabel = computed(() => {
  const level = stats.angerLevel ?? 0;
  if (level >= 4) return '怒气暴走';
  if (level === 3) return '怒气爆燃';
  if (level === 2) return '持续冒烟';
  if (level === 1) return '进入警戒';
  return '待点燃';
});
const summaryError = computed(() => stats.summaryError);
const summaryUpdatedAt = computed(() =>
  stats.summaryTimestamp ? new Date(stats.summaryTimestamp).toLocaleTimeString() : ''
);
const currentYear = new Date().getFullYear();
const sharePhrase = computed(() => stats.lastPhrase || '猛敲怒气按钮，今天的怒火从我开始。');
const activeRoleTitle = computed(() => roles.activeRole?.title ?? '怒气现场');
const lastLocationDisplay = computed(() => {
  const location = stats.lastLocation;
  if (!location) return '等待首位打工人定位';
  return [location.country, location.province, location.city].filter(Boolean).join(' · ');
});

const syncRoleFromRoute = () => {
  const roleKey = (route.query.role as string | undefined) ?? null;
  roles.setActiveRole(roleKey);
};

const toggleShare = (value: boolean) => {
  shareOpen.value = value;
  copyFeedback.value = '';
};

const copyShareText = async () => {
  try {
    await navigator.clipboard.writeText(sharePhrase.value);
    copyFeedback.value = '文案已复制，快去分享你的怒气吧！';
  } catch (error) {
    copyFeedback.value = '复制失败，请手动选择文本复制。';
  }
};

const handleHitSuccess = () => {
  copyFeedback.value = '';
};

onMounted(() => {
  syncRoleFromRoute();
  stats.fetchSummary('default');
  roles.fetchRoles();
});

watch(
  () => route.query.role,
  () => {
    syncRoleFromRoute();
  }
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
