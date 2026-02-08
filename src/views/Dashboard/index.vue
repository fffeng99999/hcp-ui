<template>
  <div class="dashboard">
    <!-- 顶部概览卡片 -->
    <div class="dashboard-section overview-section">
      <StatCardsGroup :cards="overviewCards" />
    </div>

    <!-- 性能对比图表区域 -->
    <div class="dashboard-section charts-section">
      <el-row :gutter="24" class="flex-row">
        <el-col :xs="24" :sm="24" :md="12" :lg="12" class="mb-4">
          <LatencyTrendCard />
        </el-col>

        <el-col :xs="24" :sm="24" :md="12" :lg="12" class="mb-4">
          <TpsComparisonCard />
        </el-col>
      </el-row>

      <el-row :gutter="24" class="flex-row" style="margin-top: 24px;">
        <el-col :xs="24" :sm="24" :md="8" :lg="8" class="mb-4">
          <NodeStatusCard />
        </el-col>

        <el-col :xs="24" :sm="24" :md="16" :lg="16" class="mb-4">
          <PerformanceLimitCard />
        </el-col>
      </el-row>
    </div>

    <!-- 测试任务管理区域 -->
    <div class="dashboard-section task-section">
      <TestTaskCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { Timer, Odometer, Connection, DocumentCopy } from '@element-plus/icons-vue'
import { usePerformanceStore } from '@/store/modules/performance'
import { useBenchmarkStore } from '@/store/modules/benchmark'
import { useNodeStore } from '@/store/modules/node'
import { useConsensusStore } from '@/store/modules/consensus'
import StatCardsGroup from '@/components/dashboard/StatCardsGroup.vue'
import LatencyTrendCard from './LatencyTrendCard.vue'
import TpsComparisonCard from './TpsComparisonCard.vue'
import NodeStatusCard from './NodeStatusCard.vue'
import PerformanceLimitCard from './PerformanceLimitCard.vue'
import TestTaskCard from './TestTaskCard.vue'

const performanceStore = usePerformanceStore()
const benchmarkStore = useBenchmarkStore()
const nodeStore = useNodeStore()
const consensusStore = useConsensusStore()

const metrics = computed(() => ({
  avgLatency: performanceStore.metrics.latency,
  throughput: performanceStore.metrics.tps,
  nodeCount: nodeStore.onlineCount,
  consensusType: consensusStore.currentAlgorithm
}))

const overviewCards = computed(() => [
  {
    label: '平均延迟',
    value: metrics.value.avgLatency + 'ms',
    color: '#007aff',
    iconComponent: Timer
  },
  {
    label: '吞吐量 (TPS)',
    value: metrics.value.throughput,
    color: '#34c759',
    iconComponent: Odometer
  },
  {
    label: '活跃节点数',
    value: metrics.value.nodeCount,
    color: '#ff9500',
    iconComponent: Connection
  },
  {
    label: '共识算法',
    value: metrics.value.consensusType,
    color: '#ff2d55',
    iconComponent: DocumentCopy
  }
])

onMounted(async () => {
  await Promise.all([
    performanceStore.loadInitialData(),
    benchmarkStore.loadTasks(),
    nodeStore.loadNodes(),
    consensusStore.loadConfig(),
    consensusStore.loadAlgorithms()
  ])

  performanceStore.startMonitoring()
})

onUnmounted(() => {
  performanceStore.stopMonitoring()
})
</script>

<style scoped lang="scss" src="@/assets/styles/pages/dashboard.scss"></style>
