<template>
  <div class="stat-cards-group">
    <el-row :gutter="24" class="flex-row">
      <el-col 
        v-for="(card, index) in cards" 
        :key="index" 
        :xs="24" :sm="12" :md="6" :lg="6" :xl="6" 
        class="mb-4"
      >
        <DashboardMetric 
          :label="card.label" 
          :value="card.value" 
          :color="card.color"
          :icon="card.icon"
          :trend="card.trend"
          :trend-label="card.trendLabel"
        >
          <template #icon v-if="!card.icon && card.iconComponent">
             <el-icon><component :is="card.iconComponent" /></el-icon>
          </template>
        </DashboardMetric>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import DashboardMetric from './DashboardMetric.vue'

export interface StatCardItem {
  label: string
  value: string | number
  color?: string
  icon?: string
  iconComponent?: any
  trend?: number
  trendLabel?: string
}

defineProps<{
  cards: StatCardItem[]
}>()
</script>

<style scoped lang="scss">
.stat-cards-group {
  width: 100%;
}

.mb-4 {
  margin-bottom: 16px;
}
@media (min-width: 992px) {
  .mb-4 {
    margin-bottom: 0;
  }
}

:deep(.flex-row) {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
}

:deep(.flex-row > .el-col) {
  display: flex;
}

:deep(.metric-card) {
  width: 100%;
}
</style>