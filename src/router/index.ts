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
          title: '仪表盘',
          icon: 'dashboard',
          requiresAuth: true
        }
      },
      {
        path: 'consensus',
        name: 'ConsensusManagement',
        component: () => import('@/views/Consensus/index.vue'),
        meta: {
          title: '共识配置',
          icon: 'setting',
          requiresAuth: true
        }
      },
      {
        path: 'benchmarks',
        name: 'Benchmarks',
        component: () => import('@/views/Benchmarks/index.vue'),
        meta: {
          title: '压测任务',
          icon: 'document',
          requiresAuth: true
        }
      },
      {
        path: 'nodes',
        name: 'NodeManagement',
        component: () => import('@/views/Node/index.vue'),
        meta: {
          title: '节点管理',
          icon: 'grid',
          requiresAuth: true
        }
      },
      {
        path: 'policies',
        name: 'Policies',
        component: () => import('@/views/Policies/index.vue'),
        meta: {
          title: '反操纵策略',
          icon: 'shield',
          requiresAuth: true
        }
      },
      {
        path: 'metrics',
        name: 'Metrics',
        component: () => import('@/views/Metrics/index.vue'),
        meta: {
          title: '监控指标',
          icon: 'chart-bar',
          requiresAuth: true
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings/index.vue'),
        redirect: '/settings/general',
        children: [
          {
            path: 'general',
            name: 'SettingsGeneral',
            component: () => import('@/views/Settings/General.vue'),
            meta: {
              title: '通用设置',
              requiresAuth: true
            }
          },
          {
            path: 'network',
            name: 'SettingsNetwork',
            component: () => import('@/views/Settings/Network.vue'),
            meta: {
              title: '网络配置',
              requiresAuth: true
            }
          },
          {
            path: 'storage',
            name: 'SettingsStorage',
            component: () => import('@/views/Settings/Storage.vue'),
            meta: {
              title: '存储配置',
              requiresAuth: true
            }
          },
          {
            path: 'security',
            name: 'SettingsSecurity',
            component: () => import('@/views/Settings/Security.vue'),
            meta: {
              title: '安全设置',
              requiresAuth: true
            }
          },
          {
            path: 'notification',
            name: 'SettingsNotification',
            component: () => import('@/views/Settings/Notification.vue'),
            meta: {
              title: '通知设置',
              requiresAuth: true
            }
          },
          {
            path: 'users',
            name: 'SettingsUsers',
            component: () => import('@/views/Settings/Users.vue'),
            meta: {
              title: '用户管理',
              requiresAuth: true
            }
          },
          {
            path: 'system',
            name: 'SettingsSystem',
            component: () => import('@/views/Settings/System.vue'),
            meta: {
              title: '系统信息',
              requiresAuth: true
            }
          },
          {
            path: 'backup',
            name: 'SettingsBackup',
            component: () => import('@/views/Settings/Backup.vue'),
            meta: {
              title: '备份恢复',
              requiresAuth: true
            }
          }
        ],
        meta: {
          title: '系统设置',
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
      title: '登录'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/System/NotFound.vue'),
    meta: {
      title: '页面未找到'
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
