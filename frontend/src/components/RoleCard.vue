<template>
  <article
    class="group relative flex h-full flex-col rounded-3xl bg-white/95 shadow-card ring-1 ring-white/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-primary/20 overflow-hidden"
  >
    <!-- 顶部装饰条优化 -->
    <div class="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl overflow-hidden">
      <div
        class="h-full w-full animate-gradient-x"
        :class="['bg-gradient-to-r', role.colorFrom, role.colorTo]"
      ></div>
    </div>

  
    <div class="flex flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5">
      <div class="flex flex-col gap-1.5 flex-shrink-0">
        <h3 class="font-display text-lg sm:text-xl font-bold text-ink group-hover:text-primary transition-colors">
          {{ role.title }}
        </h3>
        <span
          v-if="role.badge && !isHot"
          class="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-light/60 to-accent-light/60 px-2.5 sm:px-3 py-1 text-[11px] xs:text-xs font-bold text-primary-strong border border-primary-light/50"
        >
          <i class="fa-solid fa-sparkles text-accent"></i>
          {{ role.badge }}
        </span>
      </div>

      <div class="flex flex-1 flex-col pt-2">
        <p class="text-sm leading-relaxed text-muted line-clamp-2 min-h-[2.75rem]">
          {{ role.description }}
        </p>

        <!-- 引用区域优化 -->
        <div class="mt-2 relative rounded-2xl border border-dashed border-primary-light/60 bg-gradient-to-br from-primary-light/30 to-accent-light/20 p-2.5">
          <div class="absolute top-1 left-2 text-primary/20">
            <i class="fa-solid fa-quote-left text-xl"></i>
          </div>
          <p class="pl-6 text-sm text-ink/90 italic leading-relaxed">
            {{ role.quote }}
          </p>
        </div>

        <div class="mt-auto pt-3">
          <RouterLink
            class="inline-flex w-full items-center justify-center rounded-2xl border border-primary/25 bg-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-primary-strong shadow-sm transition-colors duration-200 hover:bg-primary-strong hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
            :to="{ path: '/', query: { role: role.key } }"
          >
            <span>进入怒气现场</span>
          </RouterLink>
        </div>
      </div>
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
