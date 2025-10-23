<template>
  <article
    class="group relative flex h-full flex-col rounded-3xl bg-white/95 shadow-card ring-1 ring-white/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-primary/20 overflow-hidden"
    :class="[
      { 'ring-2 ring-accent/50 animate-pulse-slow': isHot }
    ]"
  >
    <!-- 顶部装饰条优化 -->
    <div class="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl overflow-hidden">
      <div
        class="h-full w-full animate-gradient-x"
        :class="['bg-gradient-to-r', role.colorFrom, role.colorTo]"
      ></div>
    </div>

    <!-- 热门标识 -->
    <div v-if="isHot" class="absolute -top-2 -right-2 z-10">
      <div class="relative">
        <div class="absolute inset-0 bg-accent animate-ping rounded-full"></div>
        <div class="relative bg-accent text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
          <i class="fa-solid fa-fire text-xs"></i>
          HOT
        </div>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-3 sm:gap-4 p-4 sm:p-6">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="relative group/avatar">
            <span
              class="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-lg sm:text-xl text-white shadow-lg transition-transform group-hover/avatar:scale-110"
              :class="['bg-gradient-to-br', role.colorFrom, role.colorTo]"
            >
              <i :class="role.icon"></i>
            </span>
            <!-- 等级光环效果 -->
            <div
              class="absolute -inset-1 rounded-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity"
              :class="['bg-gradient-to-r', role.colorFrom, role.colorTo]"
              style="filter: blur(8px);"
            ></div>
          </div>

          <div class="space-y-2">
            <h3 class="font-display text-lg sm:text-xl font-bold text-ink group-hover:text-primary transition-colors">
              {{ role.title }}
            </h3>
            <span
              v-if="role.badge"
              class="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-light/60 to-accent-light/60 px-2.5 sm:px-3 py-1 text-[11px] xs:text-xs font-bold text-primary-strong border border-primary-light/50"
            >
              <i class="fa-solid fa-sparkles text-accent"></i>
              {{ role.badge }}
            </span>
          </div>
        </div>
      </div>

      <p class="flex-1 text-sm leading-relaxed text-muted line-clamp-3">
        {{ role.description }}
      </p>

      <!-- 引用区域优化 -->
      <div class="relative rounded-2xl border border-dashed border-primary-light/60 bg-gradient-to-br from-primary-light/30 to-accent-light/20 p-4">
        <div class="absolute top-2 left-2 text-primary/20">
          <i class="fa-solid fa-quote-left text-2xl"></i>
        </div>
        <p class="pl-6 text-sm text-ink/90 italic leading-relaxed">
          {{ role.quote }}
        </p>
      </div>

      <!-- CTA按钮优化 -->
      <RouterLink
        class="group/btn relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 px-4 sm:px-6 py-2.5 sm:py-3 text-center font-semibold text-white shadow-lg transition-all hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 text-sm sm:text-base"
        :to="{ path: '/', query: { role: role.key } }"
      >
        <div class="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity"></div>
        <div class="relative flex items-center justify-center gap-2">
          <i class="fa-solid fa-bolt text-yellow-200"></i>
          <span>进入怒气现场</span>
          <i class="fa-solid fa-arrow-right text-sm opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all"></i>
        </div>
      </RouterLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { RoleItem } from '../stores/roles.store';

defineProps<{
  role: RoleItem;
  isHot?: boolean;
}>();
</script>
