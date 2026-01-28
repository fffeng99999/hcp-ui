import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as performanceAPI from '@/api/performance'
import type { PerformanceMetrics, PerformanceHistory } from '@/types'

const MAX_HISTORY_LENGTH = 300 // 5分钟 (每秒更新)

export const usePerformanceStore = defineStore('performance', () => {
  const metrics = ref<PerformanceMetrics>({
    tps: 0,
    latency: 0,
    throughput: 0,
    blockTime: 0,
    timestamp: new Date().toISOString(),
    cpuUsage: 0,
    memoryUsage: 0,
    networkBandwidth: 0
  })

  const history = ref<PerformanceHistory[]>([])
  const isMonitoring = ref<boolean>(false)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const averageTps = computed<number>(() => {
    if (history.value.length === 0) return 0
    const sum = history.value.reduce((acc, m) => acc + m.tps, 0)
    return parseFloat((sum / history.value.length).toFixed(2))
  })

  const averageLatency = computed<number>(() => {
    if (history.value.length === 0) return 0
    const sum = history.value.reduce((acc, m) => acc + m.latency, 0)
    return parseFloat((sum / history.value.length).toFixed(2))
  })

  const maxTps = computed<number>(() => {
    if (history.value.length === 0) return 0
    return Math.max(...history.value.map(m => m.tps))
  })

  const minLatency = computed<number>(() => {
    if (history.value.length === 0) return 0
    return Math.min(...history.value.map(m => m.latency))
  })

  async function loadInitialData(): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      const data = await performanceAPI.getMetrics()
      updateMetrics(data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load metrics'
      console.error('Failed to load performance metrics:', err)
    } finally {
      isLoading.value = false
    }
  }

  function startMonitoring(): void {
    isMonitoring.value = true
    connectWebSocket()
  }

  function stopMonitoring(): void {
    isMonitoring.value = false
  }

  function connectWebSocket(): void {
    const wsUrl = `${import.meta.env.VITE_WS_URL}/performance`
    
    try {
      const ws = new WebSocket(wsUrl)

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as PerformanceMetrics
          updateMetrics(data)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      ws.onerror = (error: Event) => {
        console.error('WebSocket error:', error)
        error.value = 'WebSocket connection error'
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        isMonitoring.value = false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to connect WebSocket'
    }
  }

  function updateMetrics(newMetrics: PerformanceMetrics): void {
    metrics.value = {
      ...newMetrics,
      timestamp: new Date().toISOString()
    }

    const historyItem: PerformanceHistory = {
      ...metrics.value,
      id: `perf_${Date.now()}`
    } as PerformanceHistory

    history.value.push(historyItem)

    if (history.value.length > MAX_HISTORY_LENGTH) {
      history.value.shift()
    }
  }

  function clearHistory(): void {
    history.value = []
  }

  return {
    // State
    metrics,
    history,
    isMonitoring,
    isLoading,
    error,

    // Computed
    averageTps,
    averageLatency,
    maxTps,
    minLatency,

    // Methods
    loadInitialData,
    startMonitoring,
    stopMonitoring,
    updateMetrics,
    clearHistory
  }
})
