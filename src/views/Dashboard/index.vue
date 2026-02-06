<template>
  <div class="dashboard">
    <!-- 顶部概览卡片 -->
    <div class="dashboard-section overview-section">
      <el-row :gutter="24" class="flex-row">
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6" class="mb-4">
          <DashboardMetric label="平均延迟" :value="metrics.avgLatency + 'ms'" color="#007aff">
            <template #icon><el-icon><Timer /></el-icon></template>
          </DashboardMetric>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6" class="mb-4">
          <DashboardMetric label="吞吐量 (TPS)" :value="metrics.throughput" color="#34c759">
            <template #icon><el-icon><Odometer /></el-icon></template>
          </DashboardMetric>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6" class="mb-4">
          <DashboardMetric label="活跃节点数" :value="metrics.nodeCount" color="#ff9500">
            <template #icon><el-icon><Connection /></el-icon></template>
          </DashboardMetric>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6" class="mb-4">
          <DashboardMetric label="共识算法" :value="metrics.consensusType" color="#ff2d55">
            <template #icon><el-icon><DocumentCopy /></el-icon></template>
          </DashboardMetric>
        </el-col>
      </el-row>
    </div>

    <!-- 性能对比图表区域 -->
    <div class="dashboard-section charts-section">
      <el-row :gutter="24" class="flex-row">
        <!-- 延迟趋势图 -->
        <el-col :xs="24" :sm="24" :md="12" :lg="12" class="mb-4">
          <div class="ios-card chart-card">
            <div class="card-header">
              <h3>共识延迟趋势</h3>
              <el-tag type="info" size="small" effect="light" round>实时监控</el-tag>
            </div>
            <div ref="latencyChartRef" style="height: 300px;"></div>
          </div>
        </el-col>

        <!-- 吞吐量对比图 -->
        <el-col :xs="24" :sm="24" :md="12" :lg="12" class="mb-4">
          <div class="ios-card chart-card">
            <div class="card-header">
              <h3>TPS性能对比</h3>
              <el-tag type="success" size="small" effect="light" round>tPBFT vs PBFT</el-tag>
            </div>
            <div ref="tpsChartRef" style="height: 300px;"></div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="24" class="flex-row" style="margin-top: 24px;">
        <!-- 节点状态分布 -->
        <el-col :xs="24" :sm="24" :md="8" :lg="8" class="mb-4">
          <div class="ios-card chart-card">
            <div class="card-header">
              <h3>节点状态分布</h3>
            </div>
            <div ref="nodeStatusChartRef" style="height: 280px;"></div>
          </div>
        </el-col>

        <!-- 共识性能界限分析 -->
        <el-col :xs="24" :sm="24" :md="16" :lg="16" class="mb-4">
          <div class="ios-card chart-card">
            <div class="card-header">
              <h3>性能界限分析</h3>
              <el-select v-model="selectedConsensus" size="small" style="width: 120px;" class="ios-select">
                <el-option label="tPBFT" value="tPBFT" />
                <el-option label="PBFT" value="PBFT" />
                <el-option label="Raft" value="Raft" />
                <el-option label="HotStuff" value="HotStuff" />
              </el-select>
            </div>
            <div ref="performanceLimitChartRef" style="height: 280px;"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 测试任务管理区域 -->
    <div class="dashboard-section task-section">
      <div class="ios-card">
        <div class="card-header">
          <h3>测试任务列表</h3>
          <el-button type="primary" size="small" round @click="createNewTest">
            <el-icon class="el-icon--left"><Plus /></el-icon> 新建测试
          </el-button>
        </div>
        <el-table :data="testTasks" style="width: 100%" :header-cell-style="{ background: 'transparent' }">
          <el-table-column prop="id" label="任务ID" width="100" />
          <el-table-column prop="name" label="测试名称" width="200">
            <template #default="{ row }">
              <span style="font-weight: 600">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="consensus" label="共识算法" width="120" />
          <el-table-column prop="nodes" label="节点数" width="100" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" effect="light" round>
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="avgLatency" label="平均延迟(ms)" width="140" />
          <el-table-column prop="tps" label="TPS" width="120" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" fixed="right" min-width="200">
            <template #default="scope">
              <el-button size="small" text bg @click="viewDetails(scope.row)">详情</el-button>
              <el-button size="small" type="primary" text bg @click="startTest(scope.row)">启动</el-button>
              <el-button size="small" type="danger" text bg @click="deleteTest(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import * as echarts from 'echarts'
import { Timer, Odometer, Connection, DocumentCopy, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { usePerformanceStore } from '@/store/modules/performance'
import { useBenchmarkStore } from '@/store/modules/benchmark'
import { useNodeStore } from '@/store/modules/node'
import { useConsensusStore } from '@/store/modules/consensus'
import * as analysisAPI from '@/api/analysis'
import DashboardMetric from '@/components/dashboard/DashboardMetric.vue'

const performanceStore = usePerformanceStore()
const benchmarkStore = useBenchmarkStore()
const nodeStore = useNodeStore()
const consensusStore = useConsensusStore()

// 核心性能指标
const metrics = computed(() => ({
  avgLatency: performanceStore.metrics.latency,
  throughput: performanceStore.metrics.tps,
  nodeCount: nodeStore.onlineCount,
  consensusType: consensusStore.currentAlgorithm
}))

// 图表实例引用
const latencyChartRef = ref<HTMLElement>()
const tpsChartRef = ref<HTMLElement>()
const nodeStatusChartRef = ref<HTMLElement>()
const performanceLimitChartRef = ref<HTMLElement>()

let latencyChart: echarts.ECharts | null = null
let tpsChart: echarts.ECharts | null = null
let nodeStatusChart: echarts.ECharts | null = null
let performanceLimitChart: echarts.ECharts | null = null

// 选择的共识算法
const selectedConsensus = ref('tPBFT')

// 测试任务数据
const testTasks = computed(() => benchmarkStore.tasks.slice(0, 5)) // Show top 5 tasks

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
  bg: isDark.value ? '#444654' : '#ffffff', // For pie chart borders (card bg)
  tooltipBg: isDark.value ? '#444654' : '#ffffff',
  tooltipText: isDark.value ? '#ECECF1' : '#000000',
  tooltipBorder: isDark.value ? 'rgba(255,255,255,0.1)' : '#ccc'
})

// 初始化延迟趋势图
const initLatencyChart = () => {
  if (!latencyChartRef.value) return
  latencyChart = echarts.init(latencyChartRef.value)
  
  const updateChart = () => {
    const history = performanceStore.history.slice(-60) // Last 60 points
    const times = history.map(h => h.timestamp.split('T')[1].split('.')[0])
    const latencies = history.map(h => h.latency)
    const colors = getChartColors()

    const option = {
      grid: { top: 40, right: 20, bottom: 30, left: 50 },
      tooltip: { 
        trigger: 'axis',
        backgroundColor: colors.tooltipBg,
        textStyle: { color: colors.tooltipText },
        borderColor: colors.tooltipBorder
      },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { lineStyle: { color: colors.axis } },
        axisLabel: { color: colors.text }
      },
      yAxis: {
        type: 'value',
        name: '延迟(ms)',
        nameTextStyle: { color: colors.text },
        axisLabel: { color: colors.text },
        splitLine: { lineStyle: { type: 'dashed', color: colors.split } }
      },
      series: [
        {
          name: 'Latency',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: latencies,
          itemStyle: { color: '#007aff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 122, 255, 0.2)' },
              { offset: 1, color: 'rgba(0, 122, 255, 0)' }
            ])
          }
        }
      ]
    }
    latencyChart?.setOption(option)
  }

  updateChart()
  
  // Watch for history updates
  watch(() => performanceStore.history, updateChart, { deep: true })
  watch(isDark, updateChart)
}

// 初始化TPS对比图
const initTpsChart = async () => {
  if (!tpsChartRef.value) return
  tpsChart = echarts.init(tpsChartRef.value)
  
  const updateChart = async () => {
    const colors = getChartColors()
    let series = []
    let xAxisData = []
    let legendData = []

    try {
      const comparisonData = await analysisAPI.getAlgorithmComparison({
        algorithms: ['tPBFT', 'PBFT']
      })
      
      xAxisData = comparisonData[0]?.data.map(d => d.nodeCount + '节点') || []
      legendData = comparisonData.map(c => c.algorithm)
      
      series = comparisonData.map(item => ({
        name: item.algorithm,
        type: 'bar',
        barMaxWidth: 30,
        itemStyle: { 
          borderRadius: [4, 4, 0, 0],
          color: item.algorithm === 'tPBFT' ? '#34c759' : '#ff9500' 
        },
        data: item.data.map(d => d.tps),
      }))
    } catch (error) {
      console.warn('Using fallback TPS data')
      legendData = ['tPBFT', 'PBFT']
      xAxisData = ['10节点', '30节点', '50节点', '100节点', '200节点']
      series = [
        {
          name: 'tPBFT',
          type: 'bar',
          barMaxWidth: 20,
          itemStyle: { borderRadius: [4, 4, 0, 0], color: '#34c759' },
          data: [2800, 2200, 1850, 1200, 800],
        },
        {
          name: 'PBFT',
          type: 'bar',
          barMaxWidth: 20,
          itemStyle: { borderRadius: [4, 4, 0, 0], color: '#ff9500' },
          data: [1800, 1400, 1200, 750, 450],
        }
      ]
    }

    const option = {
      grid: { top: 40, right: 20, bottom: 30, left: 50 },
      tooltip: { 
        trigger: 'axis', 
        axisPointer: { type: 'shadow' },
        backgroundColor: colors.tooltipBg,
        textStyle: { color: colors.tooltipText },
        borderColor: colors.tooltipBorder
      },
      legend: { 
        data: legendData, 
        bottom: 0,
        textStyle: { color: colors.text }
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: colors.text }
      },
      yAxis: {
        type: 'value',
        name: 'TPS',
        nameTextStyle: { color: colors.text },
        axisLabel: { color: colors.text },
        splitLine: { lineStyle: { type: 'dashed', color: colors.split } }
      },
      series: series
    }
    
    tpsChart?.setOption(option)
  }

  await updateChart()
  watch(isDark, updateChart)
}

// 初始化节点状态图
const initNodeStatusChart = () => {
  if (!nodeStatusChartRef.value) return
  nodeStatusChart = echarts.init(nodeStatusChartRef.value)
  
  const updateChart = () => {
    const online = nodeStore.onlineCount
    const offline = nodeStore.offlineCount
    const total = nodeStore.nodes.length
    const faulty = total - online - offline 
    const colors = getChartColors()

    const option = {
      tooltip: { 
        trigger: 'item',
        backgroundColor: colors.tooltipBg,
        textStyle: { color: colors.tooltipText },
        borderColor: colors.tooltipBorder
      },
      legend: { 
        bottom: 0, 
        left: 'center',
        textStyle: { color: colors.text }
      },
      series: [
        {
          name: '节点状态',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          itemStyle: {
            borderRadius: 8,
            borderColor: colors.bg,
            borderWidth: 2
          },
          label: { show: false },
          data: [
            { value: online, name: '正常运行', itemStyle: { color: '#34c759' } },
            { value: faulty, name: '异常/高负载', itemStyle: { color: '#ff9500' } },
            { value: offline, name: '离线', itemStyle: { color: '#ff3b30' } }
          ],
        }
      ]
    }
    nodeStatusChart?.setOption(option)
  }

  updateChart()
  
  watch(() => nodeStore.nodes, updateChart, { deep: true })
  watch(isDark, updateChart)
}

// 初始化性能界限分析图
const initPerformanceLimitChart = async () => {
  if (!performanceLimitChartRef.value) return
  performanceLimitChart = echarts.init(performanceLimitChartRef.value)
  
  const updateChart = async () => {
    const colors = getChartColors()
    let data = []

    try {
      data = await analysisAPI.getPerformanceLimits(selectedConsensus.value)
      // data mapping if needed
    } catch (error) {
      console.warn('Using fallback Performance Limit data')
      data = [
        { nodeCount: 10, actualTps: 2800, theoreticalTps: 3500 },
        { nodeCount: 30, actualTps: 2200, theoreticalTps: 2800 },
        { nodeCount: 50, actualTps: 1850, theoreticalTps: 2400 },
        { nodeCount: 100, actualTps: 1200, theoreticalTps: 1800 },
        { nodeCount: 200, actualTps: 800, theoreticalTps: 1200 }
      ]
    }

    const option = {
      grid: { top: 40, right: 20, bottom: 30, left: 50 },
      tooltip: { 
        trigger: 'axis',
        backgroundColor: colors.tooltipBg,
        textStyle: { color: colors.tooltipText },
        borderColor: colors.tooltipBorder
      },
      legend: { 
        data: ['实际TPS', '理论上限'], 
        bottom: 0,
        textStyle: { color: colors.text }
      },
      xAxis: {
        type: 'value',
        name: '节点数量',
        nameTextStyle: { color: colors.text },
        axisLabel: { color: colors.text },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        name: 'TPS',
        nameTextStyle: { color: colors.text },
        axisLabel: { color: colors.text },
        splitLine: { lineStyle: { type: 'dashed', color: colors.split } }
      },
      series: [
        {
          name: '实际TPS',
          type: 'line',
          smooth: true,
          data: data.map(d => [d.nodeCount, d.actualTps]),
          itemStyle: { color: '#007aff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 122, 255, 0.2)' },
              { offset: 1, color: 'rgba(0, 122, 255, 0)' }
            ])
          }
        },
        {
          name: '理论上限',
          type: 'line',
          smooth: true,
          data: data.map(d => [d.nodeCount, d.theoreticalTps]),
          itemStyle: { color: '#8e8e93' },
          lineStyle: { type: 'dashed' }
        }
      ]
    }
    performanceLimitChart?.setOption(option)
  }

  await updateChart()
  
  watch(selectedConsensus, updateChart)
  watch(isDark, updateChart)
}

const createNewTest = () => {
  ElMessage.info('请前往测试任务页面创建新任务')
}

const viewDetails = (task: any) => {
  console.log('View details', task)
}

const startTest = async (task: any) => {
  try {
    await benchmarkStore.startTask(task.id)
    ElMessage.success('任务已启动')
  } catch (error) {
    ElMessage.error('启动失败')
  }
}

const deleteTest = async (task: any) => {
  try {
    await benchmarkStore.deleteTask(task.id)
    ElMessage.success('任务已删除')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    'running': 'success',
    'completed': 'info',
    'waiting': 'warning',
    'failed': 'danger',
    'paused': 'warning'
  }
  return map[status] || 'info'
}

onMounted(async () => {
  // Theme observer
  themeObserver = new MutationObserver(updateTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  // Load initial data
  await Promise.all([
    performanceStore.loadInitialData(),
    benchmarkStore.loadTasks(),
    nodeStore.loadNodes(),
    consensusStore.loadConfig()
  ])

  performanceStore.startMonitoring()
  
  initLatencyChart()
  initTpsChart()
  initNodeStatusChart()
  initPerformanceLimitChart()
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  performanceStore.stopMonitoring()
  window.removeEventListener('resize', handleResize)
  
  if (themeObserver) {
    themeObserver.disconnect()
  }
  
  latencyChart?.dispose()
  tpsChart?.dispose()
  nodeStatusChart?.dispose()
  performanceLimitChart?.dispose()
})

const handleResize = () => {
  latencyChart?.resize()
  tpsChart?.resize()
  nodeStatusChart?.resize()
  performanceLimitChart?.resize()
}
</script>

<style scoped>
.dashboard {
  /* 使用 Flex 列布局，确保垂直方向的堆叠和间距 */
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px; /* Added padding to prevent edge touching and horizontal scroll */
  padding-bottom: 40px;
}

/* 移除旧的 margin-bottom，改用 gap 控制间距 */
.dashboard-section {
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

/* 强制 el-row 使用 flex 布局，防止浮动塌陷 */
:deep(.flex-row) {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--ios-border-color);
}

.card-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: var(--ios-text-primary);
}
</style>