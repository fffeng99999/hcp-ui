<template>
  <div class="metrics-card">
    <div class="card-header">
      <span class="icon">{{ icon }}</span>
      <span class="title">{{ title }}</span>
    </div>
    <div class="card-body">
      <div class="value-container">
        <span class="value">{{ value }}</span>
        <span class="unit">{{ unit }}</span>
      </div>
      <div v-if="trend !== undefined" class="trend" :class="trend >= 0 ? 'up' : 'down'">
        {{ trend >= 0 ? '↑' : '↓' }} {{ Math.abs(trend).toFixed(1) }}%
      </div>
    </div>
    <div class="status-bar" :class="status"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: number
  unit: string
  status: 'success' | 'warning' | 'danger' | 'info'
  icon: string
  trend?: number
}>()
</script>

<style scoped>
.metrics-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}
.value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.unit {
  font-size: 12px;
  color: #999;
  margin-left: 4px;
}
.status-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
}
.status-bar.success { background-color: #52c41a; }
.status-bar.warning { background-color: #faad14; }
.status-bar.danger { background-color: #f5222d; }
.trend.up { color: #f5222d; }
.trend.down { color: #52c41a; } /* 延迟降低是好事，根据业务调整颜色含义 */
</style>