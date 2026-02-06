<template>
  <header class="header">
    <div class="header-left">
      <h2 class="page-title">{{ route.meta.title || route.name || 'Dashboard' }}</h2>
    </div>
    <div class="header-right">
      <!-- Theme Toggle Switch -->
      <div class="theme-switch" @click="toggleTheme" :class="{ active: isDark }" title="切换主题">
        <div class="track-icons">
          <el-icon class="track-icon icon-moon" :size="14"><Moon /></el-icon>
          <el-icon class="track-icon icon-sun" :size="14"><Sunny /></el-icon>
        </div>
        <div class="switch-thumb"></div>
      </div>

      <div class="icon-btn">
        <span class="icon">🔍</span>
      </div>
      <div class="icon-btn">
        <span class="icon">🔔</span>
        <span class="badge"></span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Sunny, Moon } from '@element-plus/icons-vue';

const route = useRoute();
const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  updateTheme();
};

const updateTheme = () => {
  const htmlEl = document.documentElement;
  if (isDark.value) {
    htmlEl.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    htmlEl.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  } else {
    isDark.value = false;
    document.documentElement.classList.remove('dark');
  }
});
</script>

<style scoped>
.header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  margin-top: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--ios-text-primary);
  margin: 0;
  transition: color 0.3s ease;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Theme Switch */
.theme-switch {
  width: 56px;
  height: 32px;
  background-color: var(--ios-toggle-bg);
  border-radius: 16px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  padding: 2px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

.track-icons {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  box-sizing: border-box;
  pointer-events: none;
}

.track-icon {
  color: var(--ios-text-secondary);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.icon-moon {
  opacity: 0;
  transform: scale(0.5);
}

.icon-sun {
  opacity: 1;
  transform: scale(1);
}

/* Active State (Dark Mode) */
.theme-switch.active .icon-moon {
  opacity: 1;
  transform: scale(1);
}

.theme-switch.active .icon-sun {
  opacity: 0;
  transform: scale(0.5);
}

.switch-thumb {
  width: 28px;
  height: 28px;
  background-color: var(--ios-toggle-thumb);
  border-radius: 50%;
  position: absolute;
  left: 2px;
  top: 2px;
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  z-index: 2;
}

.theme-switch.active .switch-thumb {
  transform: translateX(24px);
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--ios-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--ios-shadow-1);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  color: var(--ios-text-primary);
}

.icon-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--ios-shadow-2);
}

.icon {
  font-size: 18px;
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  background-color: var(--ios-red);
  border-radius: 50%;
  border: 2px solid var(--ios-bg-secondary);
}
</style>
