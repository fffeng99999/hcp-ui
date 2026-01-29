<template>
  <div class="metrics-page">
    <!-- 实时性能指标 -->
    <el-row :gutter="20" class="metrics-overview">
      <el-col :span="6" v-for="metric in realtimeMetrics" :key="metric.name">
        <el-card class="metric-card" :class="{ warning: metric.warning }">
          <div class="metric-header">
            <el-icon :size="32" :color="metric.color">
              <component :is="metric.icon" />
            </el-icon>
            <div class="metric-info">
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-value">{{ metric.value }}</div>
            </div>
          </div>
          <div class="metric-trend">
            <el-icon :color="metric.trend > 0 ? '#67C23A' : '#F56C6C'">
              <component :is="metric.trend > 0 ? 'Top' : 'Bottom'" />
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
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { 
  Odometer, Timer, Connection, DataAnalysis, Top, Bottom, Download 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 实时指标
const realtimeMetrics = ref([
  {
    name: 'tps',
    label: '当前TPS',
    value: '1,850',
    icon: 'Odometer',
    color: '#67C23A',
    trend: 12.5,
    warning: false
  },
  {
    name: 'latency',
    label: '平均延迟',
    value: '328ms',
    icon: 'Timer',
    color: '#409EFF',
    trend: -8.3,
    warning: false
  },
  {
    name: 'nodes',
    label: '活跃节点',
    value: '48/50',
    icon: 'Connection',
    color: '#E6A23C',
    trend: -4,
    warning: true
  },
  {
    name: 'txPool',
    label: '交易池',
    value: '3,245',
    icon: 'DataAnalysis',
    color: '#909399',
    trend: 5.7,
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
const comparisonData = ref([
  {
    algorithm: 'tPBFT',
    avgTps: 1850,
    peakTps: 2200,
    avgLatency: 328,
    p95Latency: 450,
    p99Latency: 580,
    cpuUsage: 65,
    memoryUsage: 58,
    networkIO: '125MB/s',
    faultTolerance: '33%',
    rating: 4.5
  },
  {
    algorithm: 'PBFT',
    avgTps: 1200,
    peakTps: 1400,
    avgLatency: 486,
    p95Latency: 620,
    p99Latency: 780,
    cpuUsage: 72,
    memoryUsage: 64,
    networkIO: '95MB/s',
    faultTolerance: '33%',
    rating: 3.5
  },
  {
    algorithm: 'Raft',
    avgTps: 980,
    peakTps: 1100,
    avgLatency: 558,
    p95Latency: 710,
    p99Latency: 890,
    cpuUsage: 58,
    memoryUsage: 52,
    networkIO: '78MB/s',
    faultTolerance: '50%',
    rating: 3.0
  },
  {
    algorithm: 'HotStuff',
    avgTps: 1620,
    peakTps: 1800,
    avgLatency: 412,
    p95Latency: 550,
    p99Latency: 680,
    cpuUsage: 68,
    memoryUsage: 61,
    networkIO: '108MB/s',
    faultTolerance: '33%',
    rating: 4.0
  }
])

// 告警数据
const recentAlerts = ref([
  {
    id: 1,
    level: '严重',
    message: '节点 Node-42 连接中断超过5分钟',
    timestamp: '2026-01-29 10:48:00'
  },
  {
    id: 2,
    level: '警告',
    message: 'TPS下降至1200,低于预期阈值',
    timestamp: '2026-01-29 10:45:00'
  },
  {
    id: 3,
    level: '信息',
    message: '共识算法配置已更新',
    timestamp: '2026-01-29 10:42:00'
  },
  {
    id: 4,
    level: '警告',
    message: '检测到异常交易模式',
    timestamp: '2026-01-29 10:38:00'
  }
])

// 初始化图表
const initTpsChart = () => {
  if (!tpsChartRef.value) return
  tpsChart = echarts.init(tpsChartRef.value)
  
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const data = Array.from({ length: 24 }, () => Math.floor(Math.random() * 500) + 1500)
  
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: hours, boundaryGap: false },
    yAxis: { type: 'value', name: 'TPS' },
    series: [{
      name: 'TPS',
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(103, 194, 58, 0.2)' },
      lineStyle: { color: '#67C23A', width: 2 },
      data: data
    }]
  }
  
  tpsChart.setOption(option)
}

const initLatencyChart = () => {
  if (!latencyChartRef.value) return
  latencyChart = echarts.init(latencyChartRef.value)
  
  const data = [
    [120, 45], [180, 82], [250, 156], [300, 245], [350, 298],
    [400, 182], [450, 96], [500, 38], [600, 12]
  ]
  
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', name: '延迟(ms)' },
    yAxis: { type: 'value', name: '交易数量' },
    series: [{
      name: '延迟分布',
      type: 'bar',
      data: data,
      itemStyle: { color: '#409EFF' }
    }]
  }
  
  latencyChart.setOption(option)
}

const initHeatmapChart = () => {
  if (!heatmapChartRef.value) return
  heatmapChart = echarts.init(heatmapChartRef.value)
  
  const nodes = Array.from({ length: 50 }, (_, i) => `Node-${i + 1}`)
  const hours = Array.from({ length: 12 }, (_, i) => `${i}:00`)
  const data: any[] = []
  
  hours.forEach((hour, i) => {
    nodes.forEach((node, j) => {
      data.push([j, i, Math.floor(Math.random() * 100)])
    })
  })
  
  const option = {
    tooltip: { position: 'top' },
    grid: { height: '70%', top: '10%' },
    xAxis: { type: 'category', data: nodes, splitArea: { show: true } },
    yAxis: { type: 'category', data: hours, splitArea: { show: true } },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
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
      axisTick: { distance: -30, length: 8 },
      splitLine: { distance: -30, length: 30 },
      axisLabel: { distance: -20, fontSize: 10 },
      detail: {
        valueAnimation: true,
        formatter: '{value} 分',
        color: 'auto',
        fontSize: 20
      },
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

const exportComparison = () => {
  ElMessage.success('性能对比报告导出成功')
}

const showAllAlerts = () => {
  ElMessage.info('跳转到告警中心')
}

onMounted(() => {
  initTpsChart()
  initLatencyChart()
  initHeatmapChart()
  initHealthScoreChart()
  
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
  color: #909399;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.trend-label {
  color: #909399;
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
  color: #606266;
}

.alert-badge {
  margin-left: 12px;
}
</style>
