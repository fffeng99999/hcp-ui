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

<style scoped lang="scss" src="@/assets/styles/components/dashboard-metric.scss"></style>
