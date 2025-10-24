<template>
  <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8 pb-24 pt-6">
    <NavigationBar context-label="怒气角色" />
    <main class="space-y-8">
      <section class="space-y-6 rounded-3xl bg-white/90 p-6 sm:p-8 shadow-card backdrop-blur">
        <div class="space-y-4">
          <div class="space-y-3">
            <h1 class="font-display text-3xl font-extrabold">怒气角色</h1>
            <p class="max-w-xl text-sm leading-relaxed text-muted">
              精选打工人常见情绪角色，快速共情不同岗位的怒气触发点。点击任意角色即可跳转对应怒气场景。
            </p>
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
        <div
          v-else
          class="grid auto-rows-fr gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch"
          data-role-grid
        >
          <RoleCard
            v-for="role in roles.roles"
            :key="role.key"
            :role="role"
            :is-hot="role.badge?.includes('本周最炸') ?? false"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import RoleCard from '../components/RoleCard.vue';
import { useRolesStore } from '../stores';

const roles = useRolesStore();

onMounted(() => {
  roles.fetchRoles();
});
</script>
