import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { navLabel: '首页' }
    },
    {
      path: '/ranking/cn',
      name: 'ranking-cn',
      component: () => import('../views/RankingChinaView.vue'),
      meta: { navLabel: '国内榜' }
    },
    {
      path: '/ranking/global',
      name: 'ranking-global',
      component: () => import('../views/RankingGlobalView.vue'),
      meta: { navLabel: '海外榜' }
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('../views/RolesView.vue'),
      meta: { navLabel: '情景入口' }
    },
    {
      path: '/share',
      name: 'share',
      component: () => import('../views/ShareView.vue'),
      meta: { navLabel: '吐槽卡' }
    }
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' };
  }
});

export default router;
