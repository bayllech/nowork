<template>
  <div class="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-24 pt-12">
    <NavigationBar context-label="怒气角色" />
    <main class="space-y-8">
      <section class="space-y-6 rounded-3xl bg-white/90 p-8 shadow-card backdrop-blur">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div class="space-y-3">
            <h1 class="font-display text-3xl font-extrabold">怒气角色</h1>
            <p class="max-w-xl text-sm leading-relaxed text-muted">
              精选打工人常见情绪角色，快速共情不同岗位的怒气触发点。点击任意角色即可跳转对应怒气场景。
            </p>
          </div>
          <div class="rounded-2xl border border-dashed border-primary-light bg-primary-light/40 px-5 py-4 text-right text-sm text-muted">
            <div class="text-xs font-semibold uppercase tracking-[0.35em] text-primary-strong">角色总数</div>
            <div class="mt-2 text-3xl font-extrabold text-primary-strong"><span>{{ roleCountLabel }}</span></div>
          </div>
        </div>

        <div v-if="roles.loading" class="grid auto-rows-fr gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div v-for="index in 6" :key="index" class="h-60 animate-pulse rounded-3xl bg-primary-light/60" />
        </div>
        <div
          v-else-if="roles.error"
          class="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600"
        >
          {{ roles.error }}
        </div>
        <div v-else class="grid auto-rows-fr gap-5 sm:grid-cols-2 xl:grid-cols-3" data-role-grid>
          <RoleCard v-for="role in roles.roles" :key="role.key" :role="role" />
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

onMounted(() => {
  roles.fetchRoles();
});
</script>
