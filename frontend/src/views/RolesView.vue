<template>
  <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8 pb-24 pt-6">
    <NavigationBar context-label="怒气角色" />
    <main class="space-y-8">
      <section class="space-y-6 rounded-3xl bg-white/90 p-6 sm:p-8 shadow-card backdrop-blur">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div class="space-y-3">
            <h1 class="font-display text-3xl font-extrabold">怒气角色</h1>
            <p class="max-w-xl text-sm leading-relaxed text-muted">
              精选打工人常见情绪角色，快速共情不同岗位的怒气触发点。点击任意角色即可跳转对应怒气场景。
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4 md:gap-6">
            <div class="rounded-2xl border border-dashed border-primary-light bg-primary-light/40 px-5 py-4 text-center">
              <div class="text-xs font-semibold uppercase tracking-[0.35em] text-primary-strong">角色总数</div>
              <div class="mt-2 text-3xl font-extrabold text-primary-strong"><span>{{ roleCountLabel }}</span></div>
            </div>
            <div class="rounded-2xl border border-dashed border-accent-light/50 bg-accent-light/30 px-5 py-4 text-center">
              <div class="text-xs font-semibold uppercase tracking-[0.35em] text-accent">今日热门</div>
              <div class="mt-2 text-3xl font-extrabold text-accent">{{ hotRoleCount }}</div>
            </div>
          </div>
        </div>

        <div v-if="roles.loading" class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style="grid-auto-rows: minmax(400px, auto)">
          <div v-for="index in 8" :key="index" class="h-96 animate-pulse rounded-3xl bg-primary-light/60" />
        </div>
        <div
          v-else-if="roles.error"
          class="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600"
        >
          {{ roles.error }}
        </div>
        <div v-else class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style="grid-auto-rows: minmax(400px, auto)" data-role-grid>
          <RoleCard
            v-for="role in roles.roles"
            :key="role.key"
            :role="role"
            :is-hot="role.badge === '本周最炸'"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import RoleCard from '../components/RoleCard.vue';
import { useRolesStore } from '../stores';

const roles = useRolesStore();

const roleCountLabel = computed(() => (roles.roles.length ? roles.roles.length : '--'));
const hotRoleCount = computed(() => roles.roles.filter(role => role.badge === '本周最炸').length);

onMounted(() => {
  roles.fetchRoles();
});
</script>
