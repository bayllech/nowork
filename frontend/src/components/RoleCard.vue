<template>
  <article
    class="group relative flex h-full flex-col rounded-3xl bg-white/95 p-6 shadow-card ring-1 ring-white/50 transition hover:-translate-y-1 hover:shadow-xl"
  >
    <span
      class="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-3xl"
      :class="['bg-gradient-to-r', role.colorFrom, role.colorTo]"
    ></span>
    <div class="flex flex-1 flex-col gap-4">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <span
            class="flex h-12 w-12 items-center justify-center rounded-2xl text-lg text-white shadow-soft"
            :class="['bg-gradient-to-br', role.colorFrom, role.colorTo]"
          >
            <i :class="role.icon"></i>
          </span>
          <div class="space-y-1">
            <h3 class="font-display text-lg font-bold text-ink">{{ role.title }}</h3>
            <span
              v-if="role.badge"
              class="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary-strong"
            >
              <i class="fa-solid fa-sparkles"></i>
              {{ role.badge }}
            </span>
          </div>
        </div>
        <span
          class="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted"
        >
          Lv.{{ role.level }}
        </span>
      </div>
      <p class="min-h-[4.5rem] text-sm leading-relaxed text-muted">
        {{ role.description }}
      </p>
      <div class="min-h-[5rem] rounded-2xl border border-dashed border-primary-light/60 bg-primary-light/40 px-4 py-3 text-sm text-ink/90">
        <div class="flex items-start gap-2">
          <i class="fa-solid fa-quote-left mt-1 text-xs text-primary"></i>
          <p class="flex-1 leading-relaxed">{{ role.quote }}</p>
        </div>
      </div>
    </div>
    <RouterLink
      class="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg ring-1 ring-indigo-500/30 transition group-hover:-translate-y-0.5 group-hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
      :to="{ path: '/', query: { role: role.key } }"
    >
      <i class="fa-solid fa-bolt text-yellow-200"></i>
      <span>进入怒气现场</span>
    </RouterLink>
  </article>
</template>

<script setup lang="ts">
import type { RoleItem } from '../stores/roles.store';

defineProps<{
  role: RoleItem;
}>();
</script>
