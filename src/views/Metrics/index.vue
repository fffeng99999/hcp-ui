<template>
  <div class="metrics-page">
    <!-- 实时性能指标 -->
    <el-row :gutter="20" class="metrics-overview">
      <el-col :span="6" v-for="metric in realtimeMetrics" :key="metric.name">
        <el-card class="metric-card" :class="{ warning: metric.warning }">
          <div class="metric-header">
            <el-icon :size="32" :color="metric.color">
              <component :is="iconComponents[metric.icon]" />
            </el-icon>
            <div class="metric-info">
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-value">{{ metric.value }}</div>
            </div>
          </div>
          <div class="metric-trend">
            <el-icon :color="metric.trend > 0 ? '#67C23A' : '#F56C6C'">
              <component :is="metric.trend > 0 ? iconComponents.Top : iconComponents.Bottom" />
            </el-icon>
            <span :style="{ color: metric.trend > 0 ? '#67C23A' : '#F56C6C' }">
              {{ Math.abs(metric.trend) }}%
            </span>
            <span class="trend-label">vs 上一小时</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <!-- TPS实时监控 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>TPS实时监控</span>
              <el-radio-group v-model="tpsTimeRange" size="small">
                <el-radio-button label="1h">1小时</el-radio-button>
                <el-radio-button label="6h">6小时</el-radio-button>
                <el-radio-button label="24h">24小时</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="tpsChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>

      <!-- 延迟分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>延迟分布</span>
              <el-select v-model="latencyMetric" size="small" style="width: 120px">
                <el-option label="P50" value="p50" />
                <el-option label="P95" value="p95" />
                <el-option label="P99" value="p99" />
              </el-select>
            </div>
          </template>
          <div ref="latencyChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 节点性能热力图 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>节点性能热力图</span>
              <el-radio-group v-model="heatmapMetric" size="small">
                <el-radio-button label="cpu">CPU使用率</el-radio-button>
                <el-radio-button label="memory">内存使用率</el-radio-button>
                <el-radio-button label="network">网络流量</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="heatmapChartRef" style="height: 400px;"></div>
        </el-card>
      </el-col>

      <!-- 系统健康度 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>系统健康度评分</span>
          </template>
          <div ref="healthScoreChartRef" style="height: 400px;"></div>
          
          <el-divider />

          <div class="health-details">
            <div class="health-item">
              <span>共识稳定性</span>
              <el-progress :percentage="95" color="#67C23A" />
            </div>
            <div class="health-item">
              <span>网络连通性</span>
              <el-progress :percentage="88" color="#409EFF" />
            </div>
            <div class="health-item">
              <span>节点可用性</span>
              <el-progress :percentage="92" color="#67C23A" />
            </div>
            <div class="health-item">
              <span>数据一致性</span>
              <el-progress :percentage="98" color="#67C23A" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能对比表 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>共识算法性能对比</span>
          <el-button size="small" @click="exportComparison">
            <el-icon><Download /></el-icon> 导出报告
          </el-button>
        </div>
      </template>

      <el-table :data="comparisonData" stripe border>
        <el-table-column prop="algorithm" label="共识算法" width="120" fixed />
        <el-table-column prop="avgTps" label="平均TPS" width="120" sortable>
          <template #default="{ row }">
            <strong>{{ row.avgTps }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="peakTps" label="峰值TPS" width="120" sortable>
          <template #default="{ row }">
            <el-tag type="success">{{ row.peakTps }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="avgLatency" label="平均延迟(ms)" width="140" sortable />
        <el-table-column prop="p95Latency" label="P95延迟(ms)" width="140" sortable />
        <el-table-column prop="p99Latency" label="P99延迟(ms)" width="140" sortable />
        <el-table-column prop="cpuUsage" label="CPU使用率" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.cpuUsage" />
          </template>
        </el-table-column>
        <el-table-column prop="memoryUsage" label="内存使用率" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.memoryUsage" />
          </template>
        </el-table-column>
        <el-table-column prop="networkIO" label="网络I/O" width="120" />
        <el-table-column prop="faultTolerance" label="容错率" width="100" />
        <el-table-column label="综合评分" width="120" fixed="right">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled show-score />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 告警日志 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>系统告警</span>
          <el-badge :value="unreadAlerts" class="alert-badge">
            <el-button size="small" @click="showAllAlerts">查看全部</el-button>
          </el-badge>
        </div>
      </template>

      <el-timeline>
        <el-timeline-item 
          v-for="alert in recentAlerts" 
          :key="alert.id"
          :timestamp="alert.timestamp"
          :color="getAlertColor(alert.level)"
        >
          <el-tag :type="getAlertTagType(alert.level)" size="small">{{ alert.level }}</el-tag>
          <span style="margin-left: 8px;">{{ alert.message }}</span>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import * as echarts from 'echarts'
import { 
  Odometer, Timer, Connection, DataAnalysis, Top, Bottom, Download 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { usePerformanceStore } from '@/store/modules/performance'
import { useNodeStore } from '@/store/modules/node'
import { useConsensusStore } from '@/store/modules/consensus'
import * as analysisAPI from '@/api/analysis'
import * as performanceAPI from '@/api/performance'

const iconComponents: Record<string, any> = { Odometer, Timer, Connection, DataAnalysis, Top, Bottom, Download }

const performanceStore = usePerformanceStore()
const nodeStore = useNodeStore()
const consensusStore = useConsensusStore()
const { metrics } = storeToRefs(performanceStore)
const { onlineCount } = storeToRefs(nodeStore)
const { currentAlgorithm, parameters } = storeToRefs(consensusStore)

// --- Dark Mode Support ---
const isDark = ref(document.documentElement.classList.contains('dark'))
let themeObserver: MutationObserver | null = null

const updateTheme = () => {
  isDark.value = document.documentElement.classList.contains('dark')
}

const getChartColors = () => ({
  text: isDark.value ? '#C5C5D2' : '#8e8e93', // ios-text-secondary
  title: isDark.value ? '#ECECF1' : '#1d1d1f', // ios-text-primary
  axis: isDark.value ? 'rgba(255,255,255,0.1)' : '#e5e5ea',
  split: isDark.value ? 'rgba(255,255,255,0.05)' : '#f2f2f7',
  tooltipBg: isDark.value ? '#444654' : '#ffffff',
  tooltipText: isDark.value ? '#ECECF1' : '#000000',
  areaColor: isDark.value ? 'rgba(103, 194, 58, 0.1)' : 'rgba(103, 194, 58, 0.2)'
})

watch(isDark, () => {
  if (tpsChart) {
    tpsChart.dispose()
    initTpsChart()
  }
  if (latencyChart) {
    latencyChart.dispose()
    initLatencyChart()
  }
  if (heatmapChart) {
    heatmapChart.dispose()
    initHeatmapChart()
  }
  if (healthScoreChart) {
    healthScoreChart.dispose()
    initHealthScoreChart()
  }
})

// 实时指标
const realtimeMetrics = computed(() => [
  {
    name: 'tps',
    label: '当前TPS',
    value: metrics.value.tps.toLocaleString(),
    icon: 'Odometer',
    color: '#67C23A',
    trend: 0,
    warning: false
  },
  {
    name: 'latency',
    label: '平均延迟',
    value: `${metrics.value.latency}ms`,
    icon: 'Timer',
    color: '#409EFF',
    trend: 0,
    warning: false
  },
  {
    name: 'nodes',
    label: '活跃节点',
    value: `${onlineCount.value}`,
    icon: 'Connection',
    color: '#E6A23C',
    trend: 0,
    warning: false
  },
  {
    name: 'txPool',
    label: '交易池',
    value: `${parameters.value[currentAlgorithm.value]?.txPoolSize ?? '-'}`,
    icon: 'DataAnalysis',
    color: '#909399',
    trend: 0,
    warning: false
  }
])

// 图表配置
const tpsTimeRange = ref('1h')
const latencyMetric = ref('p95')
const heatmapMetric = ref('cpu')
const unreadAlerts = ref(5)

const tpsChartRef = ref<HTMLElement>()
const latencyChartRef = ref<HTMLElement>()
const heatmapChartRef = ref<HTMLElement>()
const healthScoreChartRef = ref<HTMLElement>()

let tpsChart: echarts.ECharts | null = null
let latencyChart: echarts.ECharts | null = null
let heatmapChart: echarts.ECharts | null = null
let healthScoreChart: echarts.ECharts | null = null

// 性能对比数据
const comparisonData = ref<any[]>([])

// 告警数据
const recentAlerts = ref<any[]>([])

// 初始化图表
const initTpsChart = async () => {
  if (!tpsChartRef.value) return
  tpsChart = echarts.init(tpsChartRef.value)
  const colors = getChartColors()
  
  const rangeMap: Record<string, number> = { '1h': 60, '6h': 360, '24h': 1440 }
  const limit = rangeMap[tpsTimeRange.value] || 60
  const history = await performanceAPI.getHistory({ limit })
  const times = history.map(h => h.timestamp.split('T')[1].split('.')[0])
  const tpsData = history.map(h => h.tps)
  
  const option = {
    tooltip: { 
      trigger: 'axis',
      backgroundColor: colors.tooltipBg,
      textStyle: { color: colors.tooltipText },
      borderColor: colors.split
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: times, 
      boundaryGap: false,
      axisLine: { lineStyle: { color: colors.axis } },
      axisLabel: { color: colors.text }
    },
    yAxis: { 
      type: 'value', 
      name: 'TPS',
      nameTextStyle: { color: colors.text },
      splitLine: { lineStyle: { color: colors.split } },
      axisLabel: { color: colors.text }
    },
    series: [{
      name: 'TPS',
      type: 'line',
      smooth: true,
      areaStyle: { color: colors.areaColor },
      lineStyle: { color: '#67C23A', width: 2 },
      data: tpsData
    }]
  }
  
  tpsChart.setOption(option)
}

const initLatencyChart = async () => {
  if (!latencyChartRef.value) return
  latencyChart = echarts.init(latencyChartRef.value)
  const colors = getChartColors()
  
  const history = await performanceAPI.getHistory({ limit: 200 })
  const buckets = [100, 200, 300, 400, 500, 600]
  const counts = buckets.map((b, idx) => {
    const min = idx === 0 ? 0 : buckets[idx - 1]
    const max = b
    return history.filter(h => h.latency >= min && h.latency < max).length
  })
  const data = buckets.map((b, idx) => [b, counts[idx]])
  
  const option = {
    tooltip: { 
      trigger: 'axis',
      backgroundColor: colors.tooltipBg,
      textStyle: { color: colors.tooltipText },
      borderColor: colors.split
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'value', 
      name: '延迟(ms)',
      nameTextStyle: { color: colors.text },
      axisLine: { lineStyle: { color: colors.axis } },
      axisLabel: { color: colors.text },
      splitLine: { lineStyle: { color: colors.split } }
    },
    yAxis: { 
      type: 'value', 
      name: '交易数量',
      nameTextStyle: { color: colors.text },
      axisLine: { lineStyle: { color: colors.axis } },
      axisLabel: { color: colors.text },
      splitLine: { lineStyle: { color: colors.split } }
    },
    series: [{
      name: '延迟分布',
      type: 'bar',
      data: data,
      itemStyle: { color: '#409EFF' }
    }]
  }
  
  latencyChart.setOption(option)
}

const initHeatmapChart = async () => {
  if (!heatmapChartRef.value) return
  heatmapChart = echarts.init(heatmapChartRef.value)
  const colors = getChartColors()
  
  const nodes = nodeStore.nodes.map(n => n.name || n.id)
  const hours = ['当前']
  const data: any[] = nodes.map((_, j) => [j, 0, Math.floor(Math.random() * 100)])
  
  const option = {
    tooltip: { 
      position: 'top',
      backgroundColor: colors.tooltipBg,
      textStyle: { color: colors.tooltipText },
      borderColor: colors.split
    },
    grid: { height: '70%', top: '10%' },
    xAxis: { 
      type: 'category', 
      data: nodes, 
      splitArea: { show: true },
      axisLine: { lineStyle: { color: colors.axis } },
      axisLabel: { color: colors.text }
    },
    yAxis: { 
      type: 'category', 
      data: hours, 
      splitArea: { show: true },
      axisLine: { lineStyle: { color: colors.axis } },
      axisLabel: { color: colors.text }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      textStyle: { color: colors.text },
      inRange: { color: ['#50a3ba', '#eac736', '#d94e5d'] }
    },
    series: [{
      name: 'CPU使用率',
      type: 'heatmap',
      data: data,
      label: { show: false }
    }]
  }
  
  heatmapChart.setOption(option)
}

const initHealthScoreChart = () => {
  if (!healthScoreChartRef.value) return
  healthScoreChart = echarts.init(healthScoreChartRef.value)
  const colors = getChartColors()
  
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [0.3, '#F56C6C'],
            [0.7, '#E6A23C'],
            [1, '#67C23A']
          ]
        }
      },
      pointer: { itemStyle: { color: 'auto' } },
      axisTick: { distance: -30, length: 8, lineStyle: { color: colors.text } },
      splitLine: { distance: -30, length: 30, lineStyle: { color: colors.text } },
      axisLabel: { distance: -20, fontSize: 10, color: colors.text },
      detail: {
        valueAnimation: true,
        formatter: '{value} 分',
        color: 'auto',
        fontSize: 20
      },
      title: { color: colors.title },
      data: [{ value: 93, name: '系统健康度' }]
    }]
  }
  
  healthScoreChart.setOption(option)
}

const getAlertColor = (level: string) => {
  const colors: Record<string, string> = {
    '严重': '#F56C6C',
    '警告': '#E6A23C',
    '信息': '#409EFF'
  }
  return colors[level] || '#909399'
}

const getAlertTagType = (level: string) => {
  const types: Record<string, any> = {
    '严重': 'danger',
    '警告': 'warning',
    '信息': 'info'
  }
  return types[level] || 'info'
}

const exportComparison = async () => {
  try {
    await analysisAPI.generateReport({ title: '性能对比报告', content: '自动生成', format: 'pdf' })
    ElMessage.success('性能对比报告导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

const showAllAlerts = () => {
  ElMessage.info('跳转到告警中心')
}

onMounted(() => {
  performanceStore.loadInitialData()
  performanceStore.startMonitoring()
  nodeStore.loadNodes()
  consensusStore.loadConfig()
  initTpsChart()
  initLatencyChart()
  initHeatmapChart()
  initHealthScoreChart()
  analysisAPI.getAlgorithmComparison().then(res => {
    comparisonData.value = res || []
  }).catch(() => {
    comparisonData.value = []
  })
  
  window.addEventListener('resize', () => {
    tpsChart?.resize()
    latencyChart?.resize()
    heatmapChart?.resize()
    healthScoreChart?.resize()
  })
})

onUnmounted(() => {
  tpsChart?.dispose()
  latencyChart?.dispose()
  heatmapChart?.dispose()
  healthScoreChart?.dispose()
})
</script>

<style scoped>
.metrics-page {
  padding: 20px;
}

.metrics-overview {
  margin-bottom: 20px;
}

.metric-card {
  transition: all 0.3s;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--ios-shadow-2);
}

.metric-card.warning {
  border-left: 4px solid #E6A23C;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.metric-info {
  flex: 1;
}

.metric-label {
  font-size: 14px;
  color: var(--ios-text-secondary);
  margin-bottom: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--ios-text-primary);
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.trend-label {
  color: var(--ios-text-tertiary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.health-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.health-item span {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--ios-text-secondary);
}

.alert-badge {
  margin-left: 12px;
}
</style>
