import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import type { PageMeta } from '../types'

declare module 'vue-router' {
  interface RouteMeta extends PageMeta {}
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login/index.vue'),
    meta: { title: '用户登录' }
  },
  {
    path: '/',
    component: () => import('../components/layout/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard/index.vue'),
        meta: {
          title: '仪表盘',
          icon: '📊'
        }
      },
      {
        path: '/benchmarks',
        name: 'Benchmarks',
        component: () => import('../views/Benchmarks/index.vue'),
        meta: {
          title: '压测任务',
          icon: '⚡'
        }
      },
      {
        path: '/benchmarks/:id',
        name: 'BenchmarkDetail',
        component: () => import('../views/Benchmarks/TaskDetail.vue'),
        meta: {
          title: '任务详情',
          breadcrumb: true
        }
      },
      {
        path: '/consensus',
        name: 'Consensus',
        component: () => import('../views/Consensus/index.vue'),
        meta: {
          title: '共识配置',
          icon: '🔗'
        }
      },
      {
        path: '/anti-manipulation',
        name: 'AntiManipulation',
        component: () => import('../views/AntiManipulation/index.vue'),
        meta: {
          title: '反操纵策略',
          icon: '🛡️'
        }
      },
      {
        path: '/metrics',
        name: 'Metrics',
        component: () => import('../views/Metrics/index.vue'),
        meta: {
          title: '监控指标',
          icon: '📈'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title ? to.meta.title + ' - ' : ''}HCP-Bench 控制台`
  next()
})

export default router
