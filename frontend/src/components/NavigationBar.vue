<template>
  <header class="glass-panel mx-auto mt-4 w-full max-w-6xl rounded-full px-6 py-4 shadow-card">
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 text-sm text-muted">
        <RouterLink class="text-sm font-semibold uppercase tracking-[0.4em] text-primary-strong" to="/">
          Nowork
        </RouterLink>
        <span class="h-2 w-2 rounded-full bg-accent"></span>
        <span class="hidden text-sm text-muted sm:inline">{{ contextLabel }}</span>
      </div>
      <button
        class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light/70 text-primary-strong transition md:hidden"
        type="button"
        @click="toggleMobile()"
      >
        <span class="sr-only">切换导航</span>
        <svg
          v-if="!mobileOpen"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
      <ul class="hidden items-center gap-3 md:flex">
        <li v-for="item in navigationItems" :key="item.path">
          <RouterLink
            :to="item.path"
            class="rounded-full px-4 py-2 text-sm font-semibold transition"
            :class="linkClass(item.path)"
          >
            {{ item.label }}
          </RouterLink>
        </li>
      </ul>
    </div>
    <transition name="fade">
      <div v-if="mobileOpen" class="mt-4 space-y-2 md:hidden">
        <ul class="space-y-2">
          <li v-for="item in navigationItems" :key="item.path">
            <RouterLink
              :to="item.path"
              class="block rounded-2xl px-4 py-3 text-base font-medium transition"
              :class="linkClass(item.path)"
              @click="toggleMobile(false)"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

interface NavigationItem {
  label: string;
  path: string;
}

const props = withDefaults(
  defineProps<{
    contextLabel?: string;
  }>(),
  {
    contextLabel: '打工人怒气续命计划'
  }
);

const route = useRoute();
const mobileOpen = ref(false);

const navigationItems: NavigationItem[] = [
  { label: '首页', path: '/' },
  { label: '国内榜', path: '/ranking/cn' },
  { label: '海外榜', path: '/ranking/global' },
  { label: '情景入口', path: '/roles' },
  { label: '吐槽卡', path: '/share' }
];

const normalizedPath = computed(() => {
  if (route.path.startsWith('/ranking/cn')) return '/ranking/cn';
  if (route.path.startsWith('/ranking/global')) return '/ranking/global';
  return route.path;
});

const linkClass = (path: string) => {
  const isActive = normalizedPath.value === path;
  return isActive
    ? 'bg-primary-light text-primary-strong shadow-soft'
    : 'text-muted hover:bg-white/70 hover:text-primary-strong';
};

const toggleMobile = (value?: boolean) => {
  mobileOpen.value = typeof value === 'boolean' ? value : !mobileOpen.value;
};
const { contextLabel } = props;
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
