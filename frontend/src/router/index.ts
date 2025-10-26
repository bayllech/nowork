import { createRouter, createWebHistory } from 'vue-router';

// 页面标题映射
const pageTitles: Record<string, string> = {
  home: 'NOWORK.CLICK',
  'ranking-cn': 'NOWORK.CLICK',
  'ranking-global': 'NOWORK.CLICK',
  roles: 'NOWORK.CLICK',
  share: 'NOWORK.CLICK'
};

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: {
        navLabel: '首页',
        title: pageTitles.home
      }
    },
    {
      path: '/ranking/cn',
      name: 'ranking-cn',
      component: () => import('../views/RankingChinaView.vue'),
      meta: {
        navLabel: '国内榜',
        title: pageTitles['ranking-cn']
      }
    },
    {
      path: '/ranking/global',
      name: 'ranking-global',
      component: () => import('../views/RankingGlobalView.vue'),
      meta: {
        navLabel: '海外榜',
        title: pageTitles['ranking-global']
      }
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('../views/RolesView.vue'),
      meta: {
        navLabel: '情景入口',
        title: pageTitles.roles
      }
    },
    {
      path: '/share',
      name: 'share',
      component: () => import('../views/ShareView.vue'),
      meta: {
        navLabel: '吐槽卡',
        title: pageTitles.share
      }
    }
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' };
  }
});

// 更新页面标题
router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string;
  }
});

export default router;
