<template>
  <div class="dashboard-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>系统仪表盘</h1>
      <p class="subtitle">实时监控区块链共识性能</p>
    </div>

    <!-- 告警栏 -->
    <div v-if="dashboardStore.alerts.length > 0" class="alerts-section">
      <div
        v-for="alert in dashboardStore.alerts"
        :key="alert.id"
        class="alert"
        :class="`alert-${alert.type}`"
      >
        <span class="alert-message">{{ alert.message }}</span>
        <button
          class="alert-close"
          @click="dashboardStore.dismissAlert(alert.id)"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="dashboardStore.loading" class="loading-container">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <template v-else>
      <!-- 实时指标卡片 -->
      <div class="metrics-grid">
        <MetricsCard
          title="吞吐量 (TPS)"
          :value="dashboardStore.metrics?.tps || 0"
          unit="tx/s"
          :status="getTpsStatus()"
          icon="⚡"
          :trend="getTrendValue('tps')"
        />
        <MetricsCard
          title="P99 延迟"
          :value="(dashboardStore.metrics?.p99Latency || 0)"
          unit="ms"
          :status="getLatencyStatus()"
          icon="⏱️"
          :trend="getTrendValue('latency')"
        />
        <MetricsCard
          title="在线节点"
          :value="dashboardStore.metrics?.nodeCount || 0"
          unit="nodes"
          :status="'info'"
          icon="🖥️"
        />
        <MetricsCard
          title="成功率"
          :value="dashboardStore.metrics?.successRate || 0"
          unit="%"
          :status="getSuccessRateStatus()"
          icon="✓"
        />
        <MetricsCard
          title="CPU 使用率"
          :value="dashboardStore.metrics?.cpuUsage || 0"
          unit="%"
          :status="getCpuStatus()"
          icon="💻"
        />
        <MetricsCard
          title="内存使用率"
          :value="dashboardStore.metrics?.memoryUsage || 0"
          unit="%"
          :status="getMemoryStatus()"
          icon="🧠"
        />
      </div>

      <!-- 趋势图表 -->
      <div class="charts-grid">
        <div class="chart-card">
          <h3>TPS 趋势</h3>
          <TpsChart
            :data="dashboardStore.trends"
          />
        </div>
        <div class="chart-card">
          <h3>延迟趋势</h3>
          <LatencyChart
            :data="dashboardStore.trends"
          />
        </div>
      </div>

      <!-- 系统状态摘要 -->
      <div class="status-summary card">
        <h3>系统状态</h3>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">整体健康度</span>
            <span
              class="status-value"
              :class="dashboardStore.isHealthy ? 'healthy' : 'warning'"
            >
              {{ dashboardStore.isHealthy ? '✓ 健康' : '⚠ 异常' }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">网络状态</span>
            <span class="status-value healthy">✓ 正常</span>
          </div>
          <div class="status-item">
            <span class="status-label">最后更新</span>
            <span class="status-value">
              {{ formatTime(dashboardStore.lastUpdateTime) }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useDashboardStore } from '../../stores/modules/dashboard'
import MetricsCard from './MetricsCard.vue'
import TpsChart from './charts/TpsChart.vue'
import LatencyChart from './charts/LatencyChart.vue'

const dashboardStore = useDashboardStore()
let refreshInterval: ReturnType<typeof setInterval> | null = null

const getTpsStatus = () => {
  const tps = dashboardStore.metrics?.tps || 0
  if (tps > 5000) return 'success'
  if (tps > 1000) return 'warning'
  return 'danger'
}

const getLatencyStatus = () => {
  const latency = dashboardStore.metrics?.p99Latency || 0
  if (latency < 200) return 'success'
  if (latency < 500) return 'warning'
  return 'danger'
}

const getSuccessRateStatus = () => {
  const rate = dashboardStore.metrics?.successRate || 0
  if (rate > 99) return 'success'
  if (rate > 95) return 'warning'
  return 'danger'
}

const getCpuStatus = () => {
  const usage = dashboardStore.metrics?.cpuUsage || 0
  if (usage < 60) return 'success'
  if (usage < 80) return 'warning'
  return 'danger'
}

const getMemoryStatus = () => {
  const usage = dashboardStore.metrics?.memoryUsage || 0
  if (usage < 60) return 'success'
  if (usage < 80) return 'warning'
  return 'danger'
}

const getTrendValue = (key: string) => {
  if (dashboardStore.trends.length < 2) return 0
  const latest = dashboardStore.trends[dashboardStore.trends.length - 1]
  const previous = dashboardStore.trends[dashboardStore.trends.length - 2]
  const latestVal = latest[key as keyof typeof latest] as number
  const prevVal = previous[key as keyof typeof previous] as number
  return ((latestVal - prevVal) / prevVal) * 100
}

const formatTime = (time: string | null) => {
  if (!time) return '--'
  return new Date(time).toLocaleTimeString('zh-CN')
}

onMounted(async () => {
  // 初始加载
  await dashboardStore.fetchMetrics()
  await dashboardStore.fetchTrends('hour')
  await dashboardStore.fetchAlerts()

  // 定时刷新 (5秒一次)
  refreshInterval = setInterval(() => {
    dashboardStore.fetchMetrics()
    dashboardStore.fetchTrends('hour')
  }, 5000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.subtitle {
  margin: 8px 0 0 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* 告警栏 */
.alerts-section {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
}

.alert-error {
  background: #fee;
  color: #c00;
  border-left: 4px solid #c00;
}

.alert-warning {
  background: #fef3cd;
  color: #856404;
  border-left: 4px solid #ffc107;
}

.alert-info {
  background: #d1ecf1;
  color: #0c5460;
  border-left: 4px solid #17a2b8;
}

.alert-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: inherit;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: var(--color-text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 指标网格 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

/* 图表网格 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* 状态摘要 */
.status-summary {
  margin-bottom: 24px;
}

.status-summary h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.status-value {
  font-size: 14px;
  font-weight: 600;
}

.status-value.healthy {
  color: var(--color-success);
}

.status-value.warning {
  color: var(--color-warning);
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
