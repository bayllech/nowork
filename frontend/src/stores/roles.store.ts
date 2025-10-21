import { defineStore } from 'pinia';
import { getRoles, type RoleDefinition } from '../services/api';

export interface RoleItem {
  key: string;
  title: string;
  description: string;
  quote: string;
  icon: string;
  colorFrom: string;
  colorTo: string;
  badge?: string;
  level: number;
}

export interface RolesState {
  roles: RoleItem[];
  activeRoleKey: string | null;
  loading: boolean;
  error: string | null;
}

export const useRolesStore = defineStore('roles', {
  state: (): RolesState => ({
    roles: [],
    activeRoleKey: null,
    loading: false,
    error: null
  }),
  getters: {
    activeRole(state) {
      return state.roles.find((role) => role.key === state.activeRoleKey) ?? null;
    }
  },
  actions: {
    setActiveRole(key: string | null) {
      this.activeRoleKey = key;
    },
    async fetchRoles(minLevel?: number) {
      this.loading = true;
      this.error = null;
      try {
        const response = await getRoles({
          level: minLevel
        });
        const normalize = (role: RoleDefinition): RoleItem => ({
          key: role.key,
          title: role.title,
          description: role.description,
          quote: role.quote,
          icon: role.icon,
          colorFrom: role.colorFrom,
          colorTo: role.colorTo,
          badge: role.badge,
          level: role.level
        });
        this.roles = response.roles.map(normalize).sort((a, b) => b.level - a.level);
        if (this.activeRoleKey && !this.roles.some((role) => role.key === this.activeRoleKey)) {
          this.activeRoleKey = null;
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取角色列表失败';
      } finally {
        this.loading = false;
      }
    }
  }
});
