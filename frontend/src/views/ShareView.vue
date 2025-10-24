<template>
  <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 sm:px-6 pb-24 pt-6">
    <NavigationBar context-label="吐槽卡工作室 · 文案 / 图片 / 分享" />
    <main class="grid gap-6 lg:gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
      <section class="grid gap-6 rounded-3xl bg-white/90 p-6 sm:p-8 shadow-card backdrop-blur">
        <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="font-display text-3xl font-extrabold">吐槽卡 · Boss 模式</h1>
            <p class="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              文案、怒气等级、热点标签一次出图，直接导出图片或复制文字，与同事一起高速释放怒气。
            </p>
          </div>
          </header>

        <!-- 优雅的图片模板 -->
        <article ref="shareCardRef" data-share-card class="share-card-template">
          <div class="share-card-content">
            <header class="share-card-header">
              <span class="site-name">nowork.click</span>
              <span class="anger-status">
                <i class="fa-solid fa-fire"></i>
                怒气高涨
              </span>
            </header>
            <main class="share-card-body">
              <p class="share-text">{{ selectedPhrase || '选择右侧文案，即刻生成吐槽卡内容。' }}</p>
            </main>
            <footer class="share-card-footer">
              <span class="anger-count">
                <i class="fa-solid fa-bolt"></i>
                团队共鸣 {{ dailyCountLabel }} 次
              </span>
            </footer>
          </div>
        </article>

        <div class="grid gap-4 sm:grid-cols-3">
          <button
            class="flex items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            type="button"
            :disabled="!selectedPhrase"
            @click="copyText"
          >
            <i class="fa-solid fa-copy"></i>
            <span class="hidden sm:inline">复制文案</span>
            <span class="sm:hidden">复制</span>
          </button>
          <button
            class="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary-strong to-primary px-4 py-3.5 text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            type="button"
            :disabled="!selectedPhrase || isDownloading"
            :aria-busy="isDownloading"
            @click="previewAndDownload"
          >
            <i :class="isDownloading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-cloud-arrow-down'"></i>
            <span>{{ isDownloading ? '生成中' : '预览下载' }}</span>
          </button>
          <RouterLink
            class="flex items-center justify-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-muted shadow-inner transition-all duration-200 hover:bg-primary-light/40 hover:shadow-md"
            to="/"
          >
            <i class="fa-solid fa-wand-magic-sparkles text-primary"></i>
            <span class="hidden sm:inline">返回怒气现场</span>
            <span class="sm:hidden">返回</span>
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

      <aside class="grid gap-6 rounded-3xl bg-white/90 p-6 sm:p-8 shadow-card backdrop-blur">
        <h2 class="flex items-center gap-3 font-display text-xl font-bold text-ink">
          <i class="fa-solid fa-list-check text-primary"></i> 文案灵感池
        </h2>

        <!-- 搜索和筛选栏 -->
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="relative">
            <input
              type="text"
              placeholder="搜索文案..."
              class="w-full sm:w-64 px-4 py-2 pl-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            />
            <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          </div>
          <div class="text-xs text-muted">
            共 {{ sharePhrases.length }} 条文案
          </div>
        </div>

        <!-- 优化的文案列表 -->
        <div class="space-y-3">
          <div v-if="phrases.loading" class="flex items-center justify-center py-8">
            <div class="flex items-center gap-2 text-sm text-muted">
              <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              文案加载中...
            </div>
          </div>

          <div v-else-if="phrases.error" class="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div class="flex items-start gap-3">
              <i class="fa-solid fa-exclamation-triangle text-red-500 mt-0.5"></i>
              <div class="flex-1">
                <p class="text-sm font-medium text-red-800">加载失败</p>
                <p class="text-xs text-red-600 mt-1">{{ phrases.error }}</p>
                <button class="mt-2 text-xs text-red-700 underline" @click="phrases.fetchPhrases('share')">
                  重新加载
                </button>
              </div>
            </div>
          </div>

          <div v-else class="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" data-phrase-list>
            <div
              v-for="phrase in sharePhrases"
              :key="phrase.id"
              class="group cursor-pointer rounded-2xl bg-white/80 px-4 py-3 text-sm text-muted shadow-inner transition-all duration-200 hover:shadow-md hover:bg-white/90 hover:-translate-y-0.5"
              :class="{
                'border-2 border-primary bg-primary/5 shadow-soft text-primary-strong': selectedPhrase === phrase.content,
                'border border-transparent': selectedPhrase !== phrase.content
              }"
              @click="handlePhraseClick(phrase.content)"
            >
              <div class="flex items-start gap-3">
                <i class="fa-solid fa-quote-left text-primary mt-1 text-xs opacity-60 group-hover:opacity-100 transition-opacity"></i>
                <div class="flex-1 min-w-0">
                  <p class="leading-relaxed break-words">{{ phrase.content }}</p>
                  <div class="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-xs text-gray-400">
                      <i class="fa-solid fa-clock mr-1"></i>
                      {{ phrase.id ? `#${phrase.id}` : '热门' }}
                    </span>
                  </div>
                </div>
                <div v-if="selectedPhrase === phrase.content" class="flex-shrink-0">
                  <i class="fa-solid fa-check-circle text-primary"></i>
                </div>
              </div>
            </div>

            <div
              v-if="!sharePhrases.length"
              class="rounded-2xl border border-dashed border-primary-light/60 px-6 py-8 text-center"
            >
              <i class="fa-solid fa-inbox text-3xl text-gray-300 mb-3"></i>
              <p class="text-sm text-muted mb-2">暂未拉取到文案</p>
              <p class="text-xs text-gray-400">可稍后刷新或联系运营补录</p>
              <button
                class="mt-4 px-4 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                @click="phrases.fetchPhrases('share')"
              >
                重新加载
              </button>
            </div>
          </div>
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

    <!-- 优化后的预览模态框 -->
    <Teleport to="body">
      <Transition name="modal" appear>
        <div v-if="showPreview" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closePreview">
          <!-- 增强的背景遮罩 -->
          <div class="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

          <!-- 预览卡片 -->
          <div class="relative w-full max-w-2xl transform transition-all">
            <!-- 内容区域 -->
            <div class="bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.1)] border border-white/20 overflow-hidden">
              <!-- 增强的头部 -->
              <header class="px-8 py-5 border-b border-gray-100/70 flex items-center justify-between bg-gradient-to-r from-white/50 to-transparent">
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <h2 class="text-xl font-bold text-gray-900 tracking-tight">吐槽卡预览</h2>
                </div>
                <button
                  @click="closePreview"
                  class="w-10 h-10 rounded-full bg-gray-100/80 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center group hover:scale-105"
                >
                  <i class="fa-solid fa-xmark text-gray-600 group-hover:text-gray-800 transition-colors"></i>
                </button>
              </header>

              <!-- 优化的图片预览区 -->
              <div class="p-8 bg-white">
                <div v-if="previewImageUrl" class="relative group">
                  <!-- 图片容器 - 白色背景 -->
                  <div class="relative overflow-hidden rounded-2xl shadow-2xl bg-white">
                    <img
                      :src="previewImageUrl"
                      alt="吐槽卡预览"
                      class="w-full h-auto transform transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <!-- 增强的装饰效果 -->
                    <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/8 via-transparent to-purple-500/8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <!-- 水印提示 -->
                    <div class="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                      <i class="fa-solid fa-image mr-1"></i>
                      nowork.click
                    </div>
                  </div>
                  <!-- 图片信息 -->
                  <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span><i class="fa-solid fa-info-circle mr-1"></i>1080 × 1350 JPG</span>
                    <span><i class="fa-solid fa-clock mr-1"></i>{{ generatedAt }} 生成</span>
                  </div>
                </div>

                <!-- 优化的加载状态 -->
                <div v-else class="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-primary/5 via-white to-purple-500/5 rounded-2xl border border-gray-200/50">
                  <div class="flex flex-col items-center space-y-6">
                    <!-- 品牌化加载动画 -->
                    <div class="relative">
                      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 opacity-20"></div>
                      <div class="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-gray-200"></div>
                      <div class="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                      <!-- 中心图标 -->
                      <div class="absolute inset-0 flex items-center justify-center">
                        <i class="fa-solid fa-fire text-primary text-xl"></i>
                      </div>
                    </div>
                    <div class="text-center space-y-2">
                      <p class="text-gray-700 font-semibold text-lg">正在生成吐槽卡</p>
                      <p class="text-gray-500 text-sm">{{ copyFeedback || '精心制作中，请稍候...' }}</p>
                      <div class="flex items-center gap-1 text-xs text-gray-400">
                        <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <div class="w-2 h-2 rounded-full bg-primary animate-pulse" style="animation-delay: 0.2s"></div>
                        <div class="w-2 h-2 rounded-full bg-primary animate-pulse" style="animation-delay: 0.4s"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 优化的底部按钮 -->
              <footer class="px-8 py-6 bg-gradient-to-t from-gray-50/80 to-white/50 border-t border-gray-100/70">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-500">
                    <i class="fa-solid fa-shield-alt text-green-500 mr-1"></i>
                    图片安全，可放心分享
                  </div>
                  <div class="flex items-center gap-3">
                    <button
                      @click="closePreview"
                      class="px-6 py-3 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 rounded-xl border border-gray-200 shadow-sm hover:shadow-md"
                    >
                      取消
                    </button>
                    <button
                      @click="confirmDownload"
                      :disabled="!previewImageUrl"
                      class="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center gap-2 min-w-[140px] justify-center"
                    >
                      <i class="fa-solid fa-download"></i>
                      {{ previewImageUrl ? '下载图片' : '生成中...' }}
                    </button>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import { usePhrasesStore, useStatsStore } from '../stores';
import { ImageGenerator } from '../utils/generateImage';

const phrases = usePhrasesStore();
const stats = useStatsStore();
const selectedPhrase = ref<string | null>(null);
const copyFeedback = ref<string>('');
const shareCardRef = ref<HTMLElement | null>(null);
const isDownloading = ref(false);
const showPreview = ref(false);
const previewImageUrl = ref<string>('');
const currentImageUrl = ref<string>('');
const generatedBlob = ref<Blob | null>(null);

const sharePhrases = computed(() => phrases.getPhrasesByPage('share'));
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

const previewAndDownload = async () => {
  if (!selectedPhrase.value || isDownloading.value) return;

  isDownloading.value = true;
  showPreview.value = true;
  previewImageUrl.value = '';
  generatedBlob.value = null;
  copyFeedback.value = '正在生成图片...';

  const target = shareCardRef.value;
  if (!target) {
    copyFeedback.value = '未找到吐槽卡内容，请刷新页面后重试。';
    isDownloading.value = false;
    return;
  }

  try {
    // 使用 ImageGenerator 生成图片
    const generator = ImageGenerator.getInstance();
    copyFeedback.value = '正在使用高质量渲染方案...';

    // 等待DOM完全渲染
    await new Promise(resolve => setTimeout(resolve, 300));

    const result = await generator.generateShareCard(target, {
      width: 540,
      height: 400,
      quality: 1,
      filename: `nowork-share-${Date.now()}.jpg`,
      text: selectedPhrase.value || undefined,
      count: dailyCountLabel.value,
      format: 'jpg',
      backgroundColor: '#ffffff' // 白色背景
    });

    generatedBlob.value = result.blob;
    previewImageUrl.value = result.url;
    copyFeedback.value = '✅ 图片生成成功！可以下载保存了';

    // 保存当前URL以便清理
    currentImageUrl.value = result.url;

    // 调试信息
    console.log('图片生成成功:', {
      blob: result.blob,
      blobSize: result.blob.size,
      url: result.url,
      filename: result.filename
    });

  } catch (error) {
    console.error('生成图片失败:', error);
    copyFeedback.value = '生成失败，请刷新页面重试或直接截图';

    // 显示错误提示
    setTimeout(() => {
      if (!previewImageUrl.value) {
        showPreview.value = false;
      }
    }, 3000);
  } finally {
    isDownloading.value = false;
  }
};

const confirmDownload = async () => {
  if (!generatedBlob.value) {
    copyFeedback.value = '图片未准备好，请重新生成';
    return;
  }

  try {
    copyFeedback.value = '正在准备下载...';

    // 生成文件名
    const phrase = selectedPhrase.value || '吐槽卡';
    const safePhrase = phrase.substring(0, 10).replace(/[^\w\u4e00-\u9fa5]/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `nowork_${safePhrase}_${timestamp}.jpg`;

    // 创建下载链接
    const url = URL.createObjectURL(generatedBlob.value);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';

    // 添加到DOM
    document.body.appendChild(anchor);

    // 触发下载
    if (navigator.msSaveOrOpenBlob) {
      // IE/Edge 特殊处理
      navigator.msSaveOrOpenBlob(generatedBlob.value, filename);
    } else {
      // 标准浏览器
      anchor.click();
    }

    // 清理资源
    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }, 100);

    // 成功反馈
    copyFeedback.value = '🎉 吐槽卡已保存！快去分享你的怒气吧！';

    // 延迟关闭预览
    setTimeout(() => {
      closePreview();
    }, 1500);

  } catch (error) {
    console.error('下载失败:', error);
    copyFeedback.value = '下载失败，请右键图片另存为';

    // 提供备用方案：在新窗口打开图片
    if (previewImageUrl.value) {
      window.open(previewImageUrl.value, '_blank');
    }
  }
};

const closePreview = () => {
  // 清理所有创建的URL
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value);
  }
  if (currentImageUrl.value && currentImageUrl.value !== previewImageUrl.value) {
    URL.revokeObjectURL(currentImageUrl.value);
  }

  showPreview.value = false;
  previewImageUrl.value = '';
  currentImageUrl.value = '';
  generatedBlob.value = null;
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

<style scoped>
/* 高级质感的图片模板 - 优化版 */
.share-card-template {
  width: 540px;
  height: 400px;
  position: relative;
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  /* 性能优化 */
  will-change: transform;
  transform: translateZ(0);
}

.share-card-template::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 219, 98, 0.2) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
  z-index: 1;
}

@keyframes float {
  0%, 100% { transform: rotate(0deg) translate(30px, -30px); }
  33% { transform: rotate(120deg) translate(-30px, 30px); }
  66% { transform: rotate(240deg) translate(30px, 30px); }
}

.share-card-template::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 30%),
    linear-gradient(225deg, rgba(255,255,255,0.05) 0%, transparent 30%);
  pointer-events: none;
  z-index: 2;
}

.share-card-content {
  position: relative;
  z-index: 3;
  width: calc(100% - 60px);
  height: calc(100% - 60px);
  background: rgba(255, 255, 255, 0.95);
  /* 移除 backdrop-filter 以兼容 html2canvas */
  border-radius: 20px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.share-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 24px;
}

.site-name {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #e94560;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.site-name::before {
  content: '';
  width: 4px;
  height: 4px;
  background: #e94560;
  border-radius: 50%;
  box-shadow: 0 0 10px #e94560;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.5); }
}

.anger-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #e94560, #ff6b6b);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  box-shadow:
    0 4px 15px rgba(233, 69, 96, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.anger-status::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.anger-status i {
  font-size: 10px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.share-card-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  position: relative;
}

.share-text {
  font-size: 28px;
  line-height: 1.4;
  color: #2d3436;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  text-align: center;
  position: relative;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  background: linear-gradient(135deg, #2d3436 0%, #636e72 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* 长文本优化 */
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  /* 平滑过渡 */
  transition: all 0.3s ease;
}

.share-card-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 24px;
  position: relative;
}

.share-card-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #e94560, transparent);
}

.anger-count {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #636e72;
  font-weight: 600;
  background: rgba(233, 69, 96, 0.08);
  padding: 8px 20px;
  border-radius: 15px;
  border: 1px solid rgba(233, 69, 96, 0.15);
  position: relative;
}

.anger-count i {
  color: #e94560;
  font-size: 12px;
}

/* 装饰性元素 */
.share-card-content::before {
  content: '';
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #e94560, #ff6b6b);
  border-radius: 50%;
  opacity: 0.1;
  filter: blur(20px);
}

.share-card-content::after {
  content: '';
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #7877c8, #78ffc7);
  border-radius: 50%;
  opacity: 0.1;
  filter: blur(30px);
}

/* 优化的响应式设计 */
@media (max-width: 768px) {
  .share-card-template {
    width: 100%;
    max-width: 400px;
    height: 300px;
    border-radius: 20px;
  }

  .share-card-content {
    width: calc(100% - 40px);
    height: calc(100% - 40px);
    padding: 25px 20px;
  }

  .share-text {
    font-size: 20px;
    line-height: 1.3;
    -webkit-line-clamp: 3;
  }

  .site-name {
    font-size: 10px;
  }

  .anger-status {
    font-size: 9px;
    padding: 6px 12px;
  }

  .anger-count {
    font-size: 11px;
    padding: 6px 14px;
  }
}

@media (max-width: 480px) {
  .share-card-template {
    max-width: 320px;
    height: 280px;
    border-radius: 18px;
  }

  .share-card-content {
    width: calc(100% - 30px);
    height: calc(100% - 30px);
    padding: 20px 16px;
  }

  .share-text {
    font-size: 18px;
    line-height: 1.3;
  }

  .site-name {
    font-size: 9px;
  }

  .anger-status {
    font-size: 8px;
    padding: 5px 10px;
  }

  .anger-count {
    font-size: 10px;
    padding: 5px 12px;
  }
}

/* 弹窗过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(20px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-20px);
}

/* 背景遮罩动画 */
.modal-enter-active .absolute.inset-0,
.modal-leave-active .absolute.inset-0 {
  transition: opacity 0.3s ease;
}

.modal-enter-from .absolute.inset-0,
.modal-leave-to .absolute.inset-0 {
  opacity: 0;
}

/* 加载动画优化 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 修复 border-3 类 */
.border-3 {
  border-width: 3px;
}


/* 自定义滚动条样式 */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 搜索框优化动画 */
input[type="text"]:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* 文案卡片悬停效果增强 */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

/* 加载状态优化 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.space-y-3 > * {
  animation: fadeIn 0.3s ease forwards;
}

.space-y-3 > *:nth-child(1) { animation-delay: 0.05s; }
.space-y-3 > *:nth-child(2) { animation-delay: 0.1s; }
.space-y-3 > *:nth-child(3) { animation-delay: 0.15s; }
.space-y-3 > *:nth-child(4) { animation-delay: 0.2s; }
.space-y-3 > *:nth-child(5) { animation-delay: 0.25s; }

/* 移动端触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .group:hover {
    transform: none;
  }

  .group:active {
    transform: scale(0.98);
  }

  button:active {
    transform: scale(0.95);
  }
}
</style>

