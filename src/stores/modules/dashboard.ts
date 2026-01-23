import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dashboardApi } from '../../api/modules/dashboard'
import type { Metrics, TrendData, Alert } from '../../types'

export const useDashboardStore = defineStore('dashboard', () => {
  const metrics = ref<Metrics | null>(null)
  const trends = ref<TrendData[]>([])
  const alerts = ref<Alert[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdateTime = ref<string | null>(null)

  const fetchMetrics = async () => {
    loading.value = true
    try {
      metrics.value = await dashboardApi.getMetrics()
      lastUpdateTime.value = new Date().toISOString()
      error.value = null
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const fetchTrends = async (timeRange: 'hour' | 'day' | 'week' = 'hour') => {
    try {
      trends.value = await dashboardApi.getTrends(timeRange)
      error.value = null
    } catch (err: any) {
      error.value = err.message
    }
  }

  const fetchAlerts = async () => {
    try {
      alerts.value = await dashboardApi.getAlerts()
    } catch (err: any) {
      error.value = err.message
    }
  }

  const dismissAlert = async (alertId: string) => {
    try {
      await dashboardApi.dismissAlert(alertId)
      alerts.value = alerts.value.filter(a => a.id !== alertId)
    } catch (err: any) {
      error.value = err.message
    }
  }

  const isHealthy = computed(() => {
    if (!metrics.value) return null
    return (
      metrics.value.p99Latency < 500 &&
      metrics.value.cpuUsage < 80 &&
      metrics.value.memoryUsage < 80
    )
  })

  const metricsStatus = computed(() => {
    if (!metrics.value) return 'unknown'
    if (metrics.value.p99Latency > 1000) return 'critical'
    if (metrics.value.p99Latency > 500) return 'warning'
    return 'healthy'
  })

  return {
    metrics,
    trends,
    alerts,
    loading,
    error,
    lastUpdateTime,
    isHealthy,
    metricsStatus,
    fetchMetrics,
    fetchTrends,
    fetchAlerts,
    dismissAlert
  }
})
