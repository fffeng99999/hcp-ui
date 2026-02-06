<template>
  <div class="ios-card metric-card">
    <div class="icon-wrapper" :style="{ background: color }">
      <slot name="icon">
        <span class="default-icon">📊</span>
      </slot>
    </div>
    <div class="content">
      <div class="value">{{ value }}</div>
      <div class="label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  color?: string
}>()
</script>

<style scoped>
.metric-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  height: 100%;
  transition: all 0.3s ease;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: var(--ios-shadow-2);
  flex-shrink: 0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.value {
  font-size: 28px;
  font-weight: 700;
  color: var(--ios-text-primary);
  line-height: 1.2;
}

.label {
  font-size: 14px;
  color: var(--ios-text-secondary);
  font-weight: 500;
}
</style>
