<template>
  <aside class="sidebar">
    <nav>
      <ul>
        <li v-for="item in menu" :key="item.path"
            :class="{ active: route.path === item.path }"
            @click="go(item.path)">
          <span class="icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const menu = [
  { path: '/dashboard', label: '仪表盘', icon: '📊' },
  { path: '/benchmarks', label: '压测任务', icon: '🧪' },
  { path: '/consensus', label: '共识配置', icon: '⚙️' },
  { path: '/policies', label: '反操纵策略', icon: '🛡️' },
  { path: '/metrics', label: '监控与指标', icon: '📈' },
  { path: '/settings', label: '系统设置', icon: '🔧' },
];

function go(path: string) {
  if (path !== route.path) router.push(path);
}
</script>

<style scoped>
.sidebar {
  width: 200px;
  background-color: #0f172a;
  color: #e5e7eb;
  padding-top: 8px;
}
nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
nav li {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
}
nav li:hover {
  background-color: #1e293b;
}
nav li.active {
  background-color: #00b2a9;
  color: #fff;
}
.icon {
  width: 22px;
}
</style>
