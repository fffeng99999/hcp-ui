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
      <div class="user-profile">
        <div class="avatar">Z</div>
        <div class="user-info">
          <span class="name">ZLF</span>
          <span class="role">Admin</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

interface MenuItem {
  path?: string;
  label: string;
  icon: string;
  children?: MenuItem[];
  expanded?: boolean;
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
    children: [
      { path: '/policies', label: '反操纵策略', icon: '🛡️' }
    ]
  },
  { path: '/settings', label: '系统设置', icon: '🔧' },
]);

function go(path?: string) {
  if (path && path !== route.path) router.push(path);
}

function toggle(item: MenuItem) {
  item.expanded = !item.expanded;
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: calc(100vh - 32px);
  margin: 16px 0 16px 16px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 24px;
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--ios-blue), var(--ios-indigo));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 20px;
  box-shadow: 0 4px 10px rgba(0, 122, 255, 0.3);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--ios-text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 0 16px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--ios-text-secondary);
  font-weight: 500;
  margin-bottom: 4px;
}

.nav-item:hover {
  background-color: var(--ios-hover-fill);
  color: var(--ios-text-primary);
}

.nav-item.active {
  background-color: rgba(0, 122, 255, 0.1);
  color: var(--ios-blue);
  font-weight: 600;
}

.nav-icon {
  font-size: 18px;
}

.nav-group .arrow {
  margin-left: auto;
  font-size: 18px;
  transition: transform 0.2s;
}

.nav-group .arrow.expanded {
  transform: rotate(90deg);
}

.submenu {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease;
  padding-left: 12px;
}

.submenu.expanded {
  max-height: 500px;
}

.sidebar-footer {
  padding: 24px;
  border-top: 1px solid var(--ios-border-color);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ios-orange), var(--ios-pink));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  font-size: 14px;
}

.role {
  font-size: 12px;
  color: var(--ios-text-secondary);
}
</style>
