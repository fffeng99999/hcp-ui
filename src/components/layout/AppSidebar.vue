<template>
  <aside class="sidebar">
    <nav>
      <ul>
        <template v-for="item in menu" :key="item.path || item.label">
          <!-- Leaf Item -->
          <li v-if="!item.children"
              :class="{ active: route.path === item.path }"
              @click="go(item.path)">
            <span class="icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </li>
          
          <!-- Group Item -->
          <li v-else class="menu-group">
            <div class="group-header" @click="toggle(item)">
              <div class="group-label">
                <span class="icon">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </div>
              <span class="arrow" :class="{ expanded: item.expanded }">▶</span>
            </div>
            <ul v-show="item.expanded" class="submenu">
              <li v-for="sub in item.children" :key="sub.path"
                  :class="{ active: route.path === sub.path }"
                  @click="go(sub.path)">
                <span class="icon">{{ sub.icon }}</span>
                <span>{{ sub.label }}</span>
              </li>
            </ul>
          </li>
        </template>
      </ul>
    </nav>
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
  { path: '/benchmarks', label: '压测任务', icon: '🧪' },
  { path: '/consensus', label: '共识配置', icon: '⚙️' },
  { path: '/metrics', label: '监控与指标', icon: '📈' },
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
  width: 200px;
  background-color: #0f172a;
  color: #e5e7eb;
  padding-top: 8px;
  height: 100vh; /* Ensure full height */
}
nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Base Item Styles */
nav li {
  cursor: pointer;
  font-size: 14px;
}

/* Leaf items (direct children of nav or submenu) */
nav li:not(.menu-group) {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  transition: background-color 0.2s;
}

nav li:not(.menu-group):hover {
  background-color: #1e293b;
}

nav li:not(.menu-group).active {
  background-color: #00b2a9;
  color: #fff;
}

/* Group Header */
.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  transition: background-color 0.2s;
}
.group-header:hover {
  background-color: #1e293b;
}
.group-label {
  display: flex;
  align-items: center;
}

/* Submenu */
.submenu {
  background-color: #0b1120;
}
.submenu li {
  padding-left: 32px !important; /* Indent submenu items */
}

.icon {
  width: 22px;
  display: inline-block;
  text-align: center;
  margin-right: 8px;
}

.arrow {
  font-size: 10px;
  color: #9ca3af;
  transition: transform 0.2s;
}
.arrow.expanded {
  transform: rotate(90deg);
}
</style>
