<template>
  <div class="metrics-page">
    <!-- 实时性能指标 (Four Parameter Preview Board) -->
    <StatCardsGroup :cards="realtimeMetrics" />

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="12">
        <TpsChartCard />
      </el-col>
      <el-col :span="12">
        <LatencyChartCard />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="16">
        <NodeHeatmapCard />
      </el-col>
      <el-col :span="8">
        <HealthScoreCard />
      </el-col>
    </el-row>

    <div class="mt-4">
      <ConsensusComparisonTable />
    </div>

    <div class="mt-4">
      <AlertsCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePerformanceStore } from '@/store/modules/performance'
import { useNodeStore } from '@/store/modules/node'
import { useConsensusStore } from '@/store/modules/consensus'

import StatCardsGroup from '@/components/dashboard/StatCardsGroup.vue'
import TpsChartCard from './components/TpsChartCard.vue'
import LatencyChartCard from './components/LatencyChartCard.vue'
import NodeHeatmapCard from './components/NodeHeatmapCard.vue'
import HealthScoreCard from './components/HealthScoreCard.vue'
import ConsensusComparisonTable from './components/ConsensusComparisonTable.vue'
import AlertsCard from './components/AlertsCard.vue'

// Stores
const performanceStore = usePerformanceStore()
const nodeStore = useNodeStore()
const consensusStore = useConsensusStore()

const { metrics } = storeToRefs(performanceStore)
const { onlineCount } = storeToRefs(nodeStore)
const { currentAlgorithm, parameters } = storeToRefs(consensusStore)

// 实时指标
const realtimeMetrics = computed(() => [
  {
    label: '当前TPS',
    value: metrics.value.tps.toLocaleString(),
    icon: 'Odometer',
    color: '#67C23A',
    trend: 0,
    trendLabel: 'vs 上一小时'
  },
  {
    label: '平均延迟',
    value: `${metrics.value.latency}ms`,
    icon: 'Timer',
    color: '#409EFF',
    trend: 0,
    trendLabel: 'vs 上一小时'
  },
  {
    label: '活跃节点',
    value: `${onlineCount.value}`,
    icon: 'Connection',
    color: '#E6A23C',
    trend: 0,
    trendLabel: 'vs 上一小时'
  },
  {
    label: '交易池',
    value: `${parameters.value[currentAlgorithm.value]?.txPoolSize ?? '-'}`,
    icon: 'DataAnalysis',
    color: '#909399',
    trend: 0,
    trendLabel: 'vs 上一小时'
  }
])

onMounted(() => {
  performanceStore.loadInitialData()
  performanceStore.startMonitoring()
  nodeStore.loadNodes()
  consensusStore.loadConfig()
})

onUnmounted(() => {
  performanceStore.stopMonitoring()
})
</script>

<style scoped lang="scss">
.metrics-page {
  padding: 24px;
}
.mt-4 {
  margin-top: 20px;
}
</style>
