<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePerformanceStore } from '@/store/modules/performance'
import { useUIStore } from '@/store/modules/ui'

const performanceStore = usePerformanceStore()
const uiStore = useUIStore()

onMounted(() => {
  // 初始化应用
  performanceStore.loadInitialData()
  uiStore.loadPreferences()
})
</script>

<style scoped lang="scss" src="@/assets/styles/layouts/app.scss"></style>
