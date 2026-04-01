import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import KeywordsView from '../views/KeywordsView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '标题生成'
      }
    },
    {
      path: '/keywords',
      name: 'keywords',
      component: KeywordsView,
      meta: {
        title: '关键词管理'
      }
    }
  ]
})

// Page title update
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'TikTok Shop Title Optimizer'}`
  next()
})

export default router
