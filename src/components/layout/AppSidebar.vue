<template>
  <aside class="sidebar ios-glass-card">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">H</div>
        <span class="logo-text">HCP Bench</span>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-section">
        <template v-for="item in menu" :key="item.path || item.label">
          <!-- Leaf Item -->
          <div v-if="!item.children"
               class="nav-item"
               :class="{ active: route.path === item.path }"
               @click="go(item.path)">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </div>
          
          <!-- Group Item -->
          <div v-else class="nav-group">
            <div class="nav-item group-header" @click="toggle(item)">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
              <span class="arrow" :class="{ expanded: item.expanded }">›</span>
            </div>
            <div class="submenu" :class="{ expanded: item.expanded }">
              <div v-for="sub in item.children" :key="sub.path"
                   class="nav-item sub-item"
                   :class="{ active: route.path === sub.path }"
                   @click="go(sub.path)">
                <span class="nav-icon">{{ sub.icon }}</span>
                <span class="nav-label">{{ sub.label }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </nav>
    
    <div class="sidebar-footer">
      <div class="user-profile" @click="go('/profile')">
        <div class="avatar">{{ userInitial }}</div>
        <div class="user-info">
          <span class="name">{{ currentUser?.username || '未登录' }}</span>
          <span class="role">{{ currentUser?.role || 'Visitor' }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

interface MenuItem {
  path?: string
  label: string
  icon: string
  children?: MenuItem[]
  expanded?: boolean
}

const menu = ref<MenuItem[]>([
  { path: '/dashboard', label: '仪表盘', icon: '📊' },
  { path: '/benchmarks', label: '压测任务', icon: '⚡' },
  { path: '/consensus', label: '共识配置', icon: '⚙️' },
  { path: '/metrics', label: '监控指标', icon: '📈' },
  {
    label: '扩展功能',
    icon: '🧩',
    expanded: true,
    children: [{ path: '/policies', label: '反操纵策略', icon: '🛡️' }]
  },
  { path: '/settings', label: '系统设置', icon: '🔧' }
])

const currentUser = computed(() => authStore.currentUser)
const userInitial = computed(() => {
  if (currentUser.value?.username) {
    return currentUser.value.username.charAt(0).toUpperCase()
  }
  return 'U'
})

function go(path?: string) {
  if (path && path !== route.path) router.push(path)
}

function toggle(item: MenuItem) {
  item.expanded = !item.expanded
}
</script>

<style scoped lang="scss" src="@/assets/styles/layouts/sidebar.scss"></style>
