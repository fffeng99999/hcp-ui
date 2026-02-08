<template>
  <div class="ios-card base-card" :class="customClass">
    <div v-if="title || $slots.header || $slots.action" class="dashboard-card-header">
      <div class="header-left">
        <h3 v-if="title">{{ title }}</h3>
        <slot name="header"></slot>
      </div>
      <div class="header-action">
        <slot name="action"></slot>
      </div>
    </div>
    <div class="card-content" :style="contentStyle">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  customClass?: string
  contentStyle?: Record<string, string>
}>()
</script>

<style scoped lang="scss">
.base-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--ios-card-bg, #ffffff);
  border-radius: var(--ios-radius-l, 16px);
  box-shadow: var(--ios-shadow-1, 0 2px 8px rgba(0, 0, 0, 0.04));
  transition: all 0.3s ease;
  
  .dashboard-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--ios-separator, rgba(0, 0, 0, 0.05));
    min-height: 56px;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--ios-text-primary, #1d1d1f);
      }
    }
    
    .header-action {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  
  .card-content {
    flex: 1;
    padding: 20px;
    position: relative;
    width: 100%;
  }
}
</style>
