<template>
  <div class="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-24 pt-12">
    <NavigationBar context-label="吐槽卡工作室 · 文案 / 图片 / 分享" />
    <main class="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-start">
      <section class="grid gap-6 rounded-3xl bg-white/90 p-8 shadow-card backdrop-blur">
        <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="font-display text-3xl font-extrabold">吐槽卡 · Boss 模式</h1>
            <p class="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              文案、怒气等级、热点标签一次出图，直接导出图片或复制文字，与同事一起高速释放怒气。
            </p>
          </div>
          <div class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft">
            <i class="fa-solid fa-face-angry"></i> 怒气 Lv.{{ angerLevel }}
          </div>
        </header>

        <article class="grid gap-6 rounded-[32px] border border-primary/25 bg-white px-10 py-12 text-ink shadow-[0_28px_48px_rgba(65,55,255,0.22)]">
          <header class="grid gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-[0.32em] text-primary-strong/70">nowork.click</span>
              <span
                class="inline-flex items-center gap-2 rounded-full bg-primary-light/60 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-strong"
              >
                <i class="fa-solid fa-face-angry text-primary-strong"></i>
                怒气 Lv.{{ angerLevel }}
              </span>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-ink/70">
              <span class="inline-flex items-center gap-2">
                <i class="fa-solid fa-user-tie text-primary-strong"></i>
                Boss 场景
              </span>
              <span class="inline-flex items-center gap-2">
                <i class="fa-regular fa-clock text-primary-strong"></i>
                生成于 {{ generatedAt }}
              </span>
            </div>
          </header>
          <div class="prose max-w-none text-lg leading-loose text-ink">
            <p>{{ selectedPhrase || '选择右侧文案，即刻生成吐槽卡内容。' }}</p>
          </div>
          <div class="flex flex-wrap gap-3 text-sm text-ink/80">
            <span><i class="fa-solid fa-bolt mr-2 text-primary"></i> 团队共鸣 {{ dailyCountLabel }} 次</span>
            <span><i class="fa-solid fa-hashtag mr-2 text-primary"></i> #打工人怒气联盟</span>
            <span><i class="fa-solid fa-hashtag mr-2 text-primary"></i> #甲方又改需求</span>
          </div>
          <div class="rounded-2xl border border-primary-light/60 bg-primary-light/30 px-4 py-3 text-xs uppercase tracking-[0.28em] text-primary-strong/80">
            nowork.click · 怒气值别憋着
          </div>
        </article>

        <div class="grid gap-4 md:grid-cols-3">
          <button
            class="flex items-center justify-center gap-3 rounded-3xl bg-primary px-5 py-4 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-50"
            type="button"
            :disabled="!selectedPhrase"
            @click="copyText"
          >
            <i class="fa-solid fa-copy"></i> 复制文案
          </button>
          <button
            class="flex items-center justify-center gap-3 rounded-3xl bg-primary-strong px-5 py-4 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-50"
            type="button"
            disabled
            @click="copyImage"
          >
            <i class="fa-solid fa-cloud-arrow-down"></i> 下载 PNG（筹备中）
          </button>
          <RouterLink
            class="flex items-center justify-center gap-3 rounded-3xl bg-white px-5 py-4 text-sm font-semibold text-muted shadow-inner transition hover:bg-primary-light/40"
            to="/"
          >
            <i class="fa-solid fa-wand-magic-sparkles text-primary"></i> 返回怒气现场
          </RouterLink>
        </div>

        <section class="grid gap-4 rounded-3xl bg-white/70 p-6 text-sm text-muted">
          <header class="flex items-center gap-2 text-base font-semibold text-ink">
            <i class="fa-solid fa-circle-info text-primary"></i> 使用小贴士
          </header>
          <ul class="space-y-2">
            <li>· 文案支持换行与表情包，排版自动适配。</li>
            <li>· 图片分辨率 1080 × 1350，朋友圈、小红书都清晰。</li>
            <li>· 提供 PNG + SVG，打印展板或做 PPT 不怕糊。</li>
          </ul>
          <p v-if="copyFeedback" class="rounded-full bg-primary-light/60 px-4 py-2 text-xs text-primary-strong">
            {{ copyFeedback }}
          </p>
        </section>
      </section>

      <aside class="grid gap-6 rounded-3xl bg-white/90 p-8 shadow-card backdrop-blur">
        <h2 class="flex items-center gap-3 font-display text-xl font-bold text-ink">
          <i class="fa-solid fa-list-check text-primary"></i> 文案灵感池
        </h2>
        <div class="space-y-3">
          <p v-if="phrases.loading" class="text-xs text-muted">文案加载中...</p>
          <p v-else-if="phrases.error" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-600">
            {{ phrases.error }}
          </p>
          <ul v-else class="space-y-3" data-phrase-list>
            <li
              v-for="phrase in sharePhrases"
              :key="phrase.id"
              class="cursor-pointer rounded-2xl bg-white/80 px-4 py-3 text-sm text-muted shadow-inner transition"
              :class="{
                'border border-primary shadow-soft text-primary-strong': selectedPhrase === phrase.content
              }"
              @click="handlePhraseClick(phrase.content)"
            >
              <i class="fa-solid fa-quote-left mr-2 text-primary"></i>
              {{ phrase.content }}
            </li>
            <li
              v-if="!sharePhrases.length"
              class="rounded-2xl border border-dashed border-primary-light/60 px-4 py-3 text-sm text-muted text-center"
            >
              暂未拉取到文案，可稍后刷新或联系运营补录。
            </li>
          </ul>
        </div>
        <div class="rounded-3xl bg-primary-light/60 px-6 py-5 text-sm text-muted">
          <h3 class="mb-3 flex items-center gap-2 text-base font-semibold text-primary-strong">
            <i class="fa-solid fa-lightbulb"></i> 分享建议
          </h3>
          <ul class="space-y-2">
            <li>· @ 一下共鸣的队友，怒气更有回音。</li>
            <li>· 配上敲击按钮的动图，传播力翻倍。</li>
            <li>· 欢迎投稿热门梗，我们会择优收录。</li>
          </ul>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import { usePhrasesStore, useStatsStore } from '../stores';

const phrases = usePhrasesStore();
const stats = useStatsStore();
const selectedPhrase = ref<string | null>(null);
const copyFeedback = ref<string>('');

const sharePhrases = computed(() => phrases.getPhrasesByPage('share'));
const angerLevel = computed(() => stats.angerLevel ?? 1);
const dailyCountLabel = computed(() => stats.dailyCount.toLocaleString());
const generatedAt = computed(() =>
  stats.summaryTimestamp ? new Date(stats.summaryTimestamp).toLocaleTimeString() : new Date().toLocaleTimeString()
);

const handlePhraseClick = (content: string) => {
  selectedPhrase.value = content;
  copyFeedback.value = '';
};

const copyText = async () => {
  if (!selectedPhrase.value) return;
  try {
    await navigator.clipboard.writeText(selectedPhrase.value);
    copyFeedback.value = '文案已复制，快去分享你的怒气吧！';
  } catch (error) {
    copyFeedback.value = '复制失败，请手动选择文本复制。';
  }
};

const copyImage = () => {
  copyFeedback.value = '图片导出功能建设中，请先使用复制文案。';
};

onMounted(() => {
  phrases.fetchPhrases('share');
  stats.fetchSummary('default');
});

watch(
  sharePhrases,
  (items) => {
    if (!selectedPhrase.value && items.length > 0) {
      const first = items[0];
      if (first) {
        selectedPhrase.value = first.content;
      }
    }
  },
  { immediate: true }
);
</script>
