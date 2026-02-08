<template>
  <div class="ios-card metric-card">
    <div class="icon-wrapper" :style="{ background: color }">
      <slot name="icon">
        <el-icon v-if="iconComponent"><component :is="iconComponent" /></el-icon>
        <span v-else class="default-icon">📊</span>
      </slot>
    </div>
    <div class="content">
      <div class="value">{{ value }}</div>
      <div class="label">{{ label }}</div>
      
      <div v-if="trend !== undefined" class="trend-wrapper">
        <div class="trend-value" :class="trend >= 0 ? 'up' : 'down'">
          <el-icon><Top v-if="trend >= 0" /><Bottom v-else /></el-icon>
          <span>{{ Math.abs(trend) }}%</span>
        </div>
        <span class="trend-label" v-if="trendLabel">{{ trendLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Top, Bottom } from '@element-plus/icons-vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'

const props = defineProps<{
  label: string
  value: string | number
  color?: string
  icon?: string | object
  trend?: number
  trendLabel?: string
}>()

const iconComponent = computed(() => {
  if (typeof props.icon === 'string') {
    return (ElementPlusIcons as any)[props.icon]
  }
  return props.icon
})
</script>

<style scoped lang="scss">
.metric-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  height: 100%;
  transition: all 0.3s ease;
  background: var(--ios-card-bg, #ffffff);
  border-radius: var(--ios-radius-l, 16px);
  box-shadow: var(--ios-shadow-1, 0 2px 8px rgba(0, 0, 0, 0.04));
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--ios-shadow-2, 0 8px 24px rgba(0, 0, 0, 0.08));
  }
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.value {
  font-size: 28px;
  font-weight: 700;
  color: var(--ios-text-primary, #1d1d1f);
  line-height: 1.2;
}

.label {
  font-size: 14px;
  color: var(--ios-text-secondary, #86868b);
  font-weight: 500;
}

.trend-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
  
  .trend-value {
    display: flex;
    align-items: center;
    gap: 2px;
    font-weight: 600;
    
    &.up {
      color: #34c759;
    }
    
    &.down {
      color: #ff3b30;
    }
  }
  
  .trend-label {
    color: var(--ios-text-tertiary, #98989d);
  }
}
</style>
