<template>
  <div class="relative grid h-[360px] w-[360px] place-items-center">
    <div
      class="absolute inset-0 -z-10 rounded-full blur-[140px] transition-all duration-500"
      :style="{ background: levelStyles.glow }"
    ></div>
    <button
      class="rage-button relative flex h-[300px] w-[300px] flex-col items-center justify-center overflow-hidden rounded-full text-white outline-none transition"
      :class="{
        'rage-active': isPressing,
        'cursor-not-allowed opacity-80': disabled
      }"
      :style="{ background: levelStyles.gradient }"
      type="button"
      :disabled="disabled"
      @pointerdown.prevent="handlePressStart"
      @pointerup="handlePressEnd"
      @pointerleave="handlePressEnd"
      @pointercancel="handlePressEnd"
      @keydown.space.prevent="handlePressStart"
      @keyup.space.prevent="handlePressEnd"
      @keydown.enter.prevent="handlePressStart"
      @keyup.enter.prevent="handlePressEnd"
    >
      <span class="text-xs font-semibold uppercase tracking-[0.8em] text-white/80">Press &amp; Hold</span>
      <span class="mt-3 font-display text-[50px] font-black tracking-[0.16em] drop-shadow-[0_18px_38px_rgba(0,0,0,0.3)]">
        我就不想干
      </span>
      <span
        class="mt-5 inline-flex items-center gap-2 rounded-full bg-white/18 px-5 py-2 text-xs font-semibold uppercase tracking-[0.36em] text-white"
      >
        <i class="fa-solid fa-volume-high text-white"></i>
        {{ levelStyles.label }}
      </span>
    </button>
    <audio ref="smashAudio" class="hidden" preload="auto" src="https://cdn.pixabay.com/download/audio/2023/02/02/audio_c607de6484.mp3?filename=punch-boxing-158522.mp3"></audio>
    <p v-if="errorMessage" class="absolute -bottom-12 left-1/2 w-full -translate-x-1/2 text-center text-xs text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStatsStore } from '../stores';

const props = withDefaults(
  defineProps<{
    page?: string;
    roleKey?: string | null;
  }>(),
  {
    page: 'default',
    roleKey: null
  }
);

const emit = defineEmits<{
  (event: 'hit-success'): void;
}>();

const stats = useStatsStore();
const isCoolingDown = ref(false);
const isPressing = ref(false);
const errorMessage = ref<string | null>(null);
const smashAudio = ref<HTMLAudioElement | null>(null);
const COOLDOWN_MS = 700;

const disabled = computed(() => stats.hitLoading || isCoolingDown.value);

const levelStyles = computed(() => {
  const level = stats.angerLevel ?? 0;
  if (level >= 4) {
    return {
      label: '怒气暴走',
      gradient: 'radial-gradient(circle at 50% 10%, #ffa7d8 0%, #ff3a6a 55%, #d90479 100%)',
      glow: 'linear-gradient(135deg, rgba(255,58,106,0.45), rgba(255,170,210,0.35))'
    };
  }
  if (level === 3) {
    return {
      label: '怒气爆燃',
      gradient: 'radial-gradient(circle at 52% 12%, #ffe7c4 0%, #ff883f 52%, #ff1c38 92%)',
      glow: 'linear-gradient(135deg, rgba(255,112,72,0.4), rgba(255,31,56,0.45))'
    };
  }
  if (level === 2) {
    return {
      label: '持续冒烟',
      gradient: 'radial-gradient(circle at 52% 12%, #ffeaca 0%, #ffb152 60%, #ff6b3e 90%)',
      glow: 'linear-gradient(135deg, rgba(255,177,82,0.38), rgba(255,121,62,0.42))'
    };
  }
  if (level === 1) {
    return {
      label: '进入警戒',
      gradient: 'radial-gradient(circle at 52% 12%, #ffe9d4 0%, #ffcb66 60%, #ff9f45 92%)',
      glow: 'linear-gradient(135deg, rgba(255,203,102,0.35), rgba(255,159,69,0.4))'
    };
  }
  return {
    label: '待点燃',
    gradient: 'radial-gradient(circle at 52% 12%, #dfe2ff 0%, #8787ff 62%, #5050ff 95%)',
    glow: 'linear-gradient(135deg, rgba(93,91,255,0.45), rgba(65,55,255,0.35))'
  };
});

const playAudio = async () => {
  const audio = smashAudio.value;
  if (!audio) return;
  try {
    audio.currentTime = 0;
    await audio.play();
  } catch (error) {
    // 浏览器未授权音频时忽略错误
  }
};

const handlePressStart = async () => {
  if (disabled.value) {
    return;
  }
  isPressing.value = true;
  isCoolingDown.value = true;
  setTimeout(() => {
    isCoolingDown.value = false;
  }, COOLDOWN_MS);

  try {
    await stats.recordHit({ page: props.page, role: props.roleKey });
    await playAudio();
    errorMessage.value = null;
    emit('hit-success');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '怒气按钮掉线了，请稍后重试';
  }
};

const handlePressEnd = () => {
  isPressing.value = false;
};
</script>

<style scoped>
.rage-button::before,
.rage-button::after {
  content: '';
  position: absolute;
  inset: 2.5%;
  border-radius: 999px;
  border: 4px solid rgba(255, 255, 255, 0.55);
  animation: smash-ripples 1.7s cubic-bezier(0.19, 1, 0.22, 1) infinite;
}

.rage-button::after {
  animation-delay: 0.7s;
}

.rage-button {
  animation: smash-pulse 1.5s ease-in-out infinite;
  box-shadow: 0 44px 100px rgba(222, 60, 64, 0.36);
  transform: scale(1);
}

.rage-active {
  animation: none !important;
  transform: scale(0.92) rotate(-4deg) !important;
  box-shadow: 0 34px 80px rgba(255, 82, 60, 0.7) !important;
}

@keyframes smash-pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 44px 100px rgba(222, 60, 64, 0.36);
  }
  50% {
    transform: scale(1.12);
    box-shadow: 0 88px 168px rgba(255, 112, 72, 0.62);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 44px 100px rgba(222, 60, 64, 0.36);
  }
}

@keyframes smash-ripples {
  0% {
    opacity: 0.9;
    transform: scale(1);
  }
  70% {
    opacity: 0;
    transform: scale(1.75);
  }
  100% {
    opacity: 0;
    transform: scale(1.75);
  }
}
</style>
