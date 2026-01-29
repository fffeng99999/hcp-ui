import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: {
          title: 'Dashboard',
          icon: 'dashboard',
          requiresAuth: true
        }
      },
      {
        path: 'consensus',
        name: 'ConsensusManagement',
        component: () => import('@/views/Consensus/index.vue'),
        meta: {
          title: 'Consensus Management',
          icon: 'setting',
          requiresAuth: true
        }
      },
      {
        path: 'benchmarks',
        name: 'Benchmarks',
        component: () => import('@/views/Benchmarks/index.vue'),
        meta: {
          title: 'Load Test Tasks',
          icon: 'document',
          requiresAuth: true
        }
      },
      {
        path: 'nodes',
        name: 'NodeManagement',
        component: () => import('@/views/Node/index.vue'),
        meta: {
          title: 'Node Management',
          icon: 'grid',
          requiresAuth: true
        }
      },
      {
        path: 'policies',
        name: 'Policies',
        component: () => import('@/views/Policies/index.vue'),
        meta: {
          title: 'Anti-Manipulation Strategy',
          icon: 'shield',
          requiresAuth: true
        }
      },
      {
        path: 'metrics',
        name: 'Metrics',
        component: () => import('@/views/Metrics/index.vue'),
        meta: {
          title: 'Monitoring & Metrics',
          icon: 'chart-bar',
          requiresAuth: true
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings/index.vue'),
        meta: {
          title: 'Settings',
          icon: 'gear',
          requiresAuth: true
        }
      }
    ]
  },

  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: {
      title: 'Login'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/System/NotFound.vue'),
    meta: {
      title: 'Not Found'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
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