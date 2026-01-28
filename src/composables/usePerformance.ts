import { computed, ref } from 'vue'
import { usePerformanceStore } from '@/store/modules/performance'
import type { PerformanceMetrics } from '@/types'

export function usePerformance() {
  const performanceStore = usePerformanceStore()
  const refreshInterval = ref<number>(1000) // 毫秒

  const metrics = computed<PerformanceMetrics>(() => performanceStore.metrics)

  const history = computed<any[]>(() => performanceStore.history)

  const stats = computed(() => ({
    currentTps: metrics.value.tps,
    averageTps: performanceStore.averageTps,
    maxTps: performanceStore.maxTps,
    currentLatency: metrics.value.latency,
    averageLatency: performanceStore.averageLatency,
    minLatency: performanceStore.minLatency,
    throughput: metrics.value.throughput,
    blockTime: metrics.value.blockTime,
    cpuUsage: metrics.value.cpuUsage,
    memoryUsage: metrics.value.memoryUsage,
    networkBandwidth: metrics.value.networkBandwidth
  }))

  const startMonitoring = async (): Promise<void> => {
    performanceStore.startMonitoring()
  }

  const stopMonitoring = async (): Promise<void> => {
    performanceStore.stopMonitoring()
  }

  const loadInitialData = async (): Promise<void> => {
    await performanceStore.loadInitialData()
  }

  return {
    metrics,
    history,
    stats,
    refreshInterval,
    startMonitoring,
    stopMonitoring,
    loadInitialData
  }
}
