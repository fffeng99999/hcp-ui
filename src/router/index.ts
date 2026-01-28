import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: 'Dashboard',
          icon: 'dashboard',
          requiresAuth: true
        }
      },
      {
        path: 'consensus',
        name: 'ConsensusManagement',
        component: () => import('@/views/ConsensusManagement.vue'),
        meta: {
          title: 'Consensus Management',
          icon: 'setting',
          requiresAuth: true
        }
      },
      {
        path: 'transactions',
        name: 'TransactionManagement',
        component: () => import('@/views/TransactionManagement.vue'),
        meta: {
          title: 'Transaction Management',
          icon: 'document',
          requiresAuth: true
        }
      },
      {
        path: 'nodes',
        name: 'NodeManagement',
        component: () => import('@/views/NodeManagement.vue'),
        meta: {
          title: 'Node Management',
          icon: 'grid',
          requiresAuth: true
        }
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: () => import('@/views/Analysis.vue'),
        meta: {
          title: 'Analysis & Reports',
          icon: 'chart-bar',
          requiresAuth: true
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: {
          title: 'Settings',
          icon: 'gear',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: 'Not Found'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} - HCP Benchmark`
  
  // Auth check logic here
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      next({ name: 'Login' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
