<template>
  <n-config-provider :theme="naiveTheme">
    <n-global-style />
    <div class="app-container">
      <router-view />
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { darkTheme, NConfigProvider, NGlobalStyle } from 'naive-ui'
import { usePerformanceStore } from '@/store/modules/performance'
import { useUIStore } from '@/store/modules/ui'
import { useAuthStore } from '@/store/modules/auth'

const performanceStore = usePerformanceStore()
const uiStore = useUIStore()
const authStore = useAuthStore()
const naiveTheme = computed(() => (uiStore.theme === 'dark' ? darkTheme : null))

const applyThemeClass = (theme: 'light' | 'dark') => {
  const htmlEl = document.documentElement
  if (theme === 'dark') {
    htmlEl.classList.add('dark')
  } else {
    htmlEl.classList.remove('dark')
  }
}

onMounted(() => {
  uiStore.loadPreferences()
  authStore.loadFromStorage()
  if (authStore.token) {
    performanceStore.loadInitialData()
  }
})

watch(
  () => uiStore.theme,
  theme => applyThemeClass(theme),
  { immediate: true }
)
</script>

<style scoped lang="scss" src="@/assets/styles/layouts/app.scss"></style>
