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

<style scoped lang="scss" src="@/assets/styles/layouts/header.scss"></style>
