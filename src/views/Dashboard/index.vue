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

        <!-- 吞吐量对比图 (Refactored) -->
        <el-col :xs="24" :sm="24" :md="12" :lg="12" class="mb-4">
          <div class="ios-card chart-card tps-chart-card" :class="{ 'is-expanded': consensusStore.isChartExpanded }">
            <div class="card-header">
              <div class="header-title-group">
                <h3>TPS性能对比</h3>
                <span v-if="comparisonTitle" class="vs-title">{{ comparisonTitle }}</span>
              </div>
              <div class="header-actions" style="display: flex; align-items: center; gap: 8px;">
                <el-popover placement="bottom" :width="220" trigger="hover">
                  <template #reference>
                    <el-button circle>
                      <el-icon><Setting /></el-icon>
                    </el-button>
                  </template>
                  <div class="algo-select-list">
                    <div v-for="algo in consensusStore.algorithms" :key="algo.id" class="switch-item-popover">
                      <span class="switch-label">{{ algo.displayName }}</span>
                      <el-switch 
                        size="small"
                        :model-value="consensusStore.comparisonIds.includes(algo.id)"
                        @update:model-value="(val: boolean | string | number) => handleSwitchChange(algo.id, val)"
                        :disabled="!consensusStore.isChartExpanded && consensusStore.comparisonIds.length >= 4 && !consensusStore.comparisonIds.includes(algo.id)"
                      />
                    </div>
                  </div>
                </el-popover>

                <el-button circle @click="toggleExpand" :type="consensusStore.isChartExpanded ? 'primary' : 'default'">
                  <el-icon><component :is="consensusStore.isChartExpanded ? 'ZoomOut' : 'ZoomIn'" /></el-icon>
                </el-button>
              </div>
            </div>

            <div ref="tpsChartRef" class="tps-chart-container"></div>
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
    
    <!-- Conflict Resolution Modal -->
    <el-dialog v-model="showConflictModal" title="调整共识算法 (最多4个)" width="500px" destroy-on-close>
      <p style="margin-bottom: 16px; color: var(--ios-text-secondary);">
        请保留最多 4 个算法并调整顺序（拖拽排序功能暂以“上移/下移”代替）：
      </p>
      
      <div class="selected-list">
        <div v-for="(id, index) in tempSelectedIds" :key="id" class="selected-item">
          <span class="algo-name">{{ getAlgoName(id) }}</span>
          <div class="item-actions">
            <el-button size="small" :disabled="index === 0" @click="moveAlgo(index, -1)">
              <el-icon><ArrowUp /></el-icon>
            </el-button>
            <el-button size="small" :disabled="index === tempSelectedIds.length - 1" @click="moveAlgo(index, 1)">
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <el-button size="small" type="danger" circle @click="removeAlgo(index)">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="cancelConflict">取消</el-button>
        <el-button type="primary" @click="confirmConflict" :disabled="tempSelectedIds.length > 4">
          确定 ({{ tempSelectedIds.length }}/4)
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Timer, Odometer, Connection, DocumentCopy, Plus, FullScreen, ScaleToOriginal, ArrowUp, ArrowDown, Close, Setting, ZoomIn, ZoomOut } from '@element-plus/icons-vue'
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
const testTasks = computed(() => benchmarkStore.tasks.slice(0, 5))

// --- Logic for Comparison ---
const comparisonTitle = computed(() => {
  const selected = consensusStore.comparisonAlgorithms
  if (selected.length < 2) return ''
  return selected.map(a => a.displayName).join(' vs ')
})

const showConflictModal = ref(false)
const tempSelectedIds = ref<string[]>([])

const getAlgoName = (id: string) => {
  return consensusStore.algorithms.find(a => a.id === id)?.displayName || id
}

const moveAlgo = (index: number, direction: number) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= tempSelectedIds.value.length) return
  
  const item = tempSelectedIds.value[index]
  tempSelectedIds.value.splice(index, 1)
  tempSelectedIds.value.splice(newIndex, 0, item)
}

const removeAlgo = (index: number) => {
  tempSelectedIds.value.splice(index, 1)
}

const handleSwitchChange = (id: string, val: boolean | string | number) => {
  const value = !!val
  const currentCount = consensusStore.comparisonIds.length
  
  if (value) {
    if (currentCount >= 4) {
      tempSelectedIds.value = [...consensusStore.comparisonIds, id].slice(0, 5)
      showConflictModal.value = true
    } else {
      consensusStore.toggleComparisonAlgorithm(id)
    }
  } else {
    consensusStore.toggleComparisonAlgorithm(id)
  }
}

const confirmConflict = () => {
  if (tempSelectedIds.value.length > 4) {
    ElMessage.warning('最多只能选择 4 个算法')
    return
  }
  consensusStore.setComparisonAlgorithms(tempSelectedIds.value)
  showConflictModal.value = false
}

const cancelConflict = () => {
  showConflictModal.value = false
}

const toggleExpand = () => {
  consensusStore.setChartExpanded(!consensusStore.isChartExpanded)
  nextTick(() => {
    setTimeout(() => {
        tpsChart?.resize()
    }, 350)
  })
}

// --- Dark Mode Support ---
const isDark = ref(document.documentElement.classList.contains('dark'))
let themeObserver: MutationObserver | null = null

const updateTheme = () => {
  isDark.value = document.documentElement.classList.contains('dark')
}

const getChartColors = () => ({
  text: isDark.value ? '#C5C5D2' : '#8e8e93', 
  title: isDark.value ? '#ECECF1' : '#1d1d1f', 
  axis: isDark.value ? 'rgba(255,255,255,0.1)' : '#e5e5ea',
  split: isDark.value ? 'rgba(255,255,255,0.05)' : '#f2f2f7',
  bg: isDark.value ? '#444654' : '#ffffff', 
  tooltipBg: isDark.value ? '#444654' : '#ffffff',
  tooltipText: isDark.value ? '#ECECF1' : '#000000',
  tooltipBorder: isDark.value ? 'rgba(255,255,255,0.1)' : '#ccc'
})

// 初始化延迟趋势图
const initLatencyChart = () => {
  if (!latencyChartRef.value) return
  latencyChart = echarts.init(latencyChartRef.value)
  
  const updateChart = () => {
    const history = performanceStore.history.slice(-60) 
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
  watch(() => performanceStore.history, updateChart, { deep: true })
  watch(isDark, updateChart)
}

// 初始化TPS对比图
const initTpsChart = async () => {
  if (!tpsChartRef.value) return
  tpsChart = echarts.init(tpsChartRef.value)
  
  const updateChart = async () => {
    const colors = getChartColors()
    const selectedAlgos = consensusStore.comparisonAlgorithms
    
    if (selectedAlgos.length === 0) {
        tpsChart?.setOption({ 
          title: { text: '请选择共识算法', left: 'center', top: 'center', textStyle: { color: colors.text } },
          xAxis: { show: false },
          yAxis: { show: false },
          series: []
        }, true)
        return
    }

    let series: any[] = []
    let xAxisData: string[] = []
    let legendData: string[] = []

    try {
      const comparisonData = await analysisAPI.getAlgorithmComparison({
        algorithms: selectedAlgos.map(a => a.id)
      })
      
      xAxisData = comparisonData[0]?.data.map(d => d.nodeCount + '节点') || []
      legendData = comparisonData.map(c => c.algorithm)
      
      series = comparisonData.map(item => {
         const algoInfo = consensusStore.algorithms.find(a => a.id === item.algorithm)
         return {
            name: item.algorithm,
            type: 'bar',
            barMaxWidth: 30,
            itemStyle: { 
              borderRadius: [4, 4, 0, 0],
              color: algoInfo?.color || '#34c759' 
            },
            data: item.data.map(d => d.tps),
         }
      })
    } catch (error) {
      console.warn('Using fallback TPS data')
      xAxisData = ['10节点', '30节点', '50节点', '100节点', '200节点']
      legendData = selectedAlgos.map(a => a.displayName)
      series = selectedAlgos.map((algo, index) => ({
          name: algo.displayName,
          type: 'bar',
          barMaxWidth: 20,
          itemStyle: { borderRadius: [4, 4, 0, 0], color: algo.color || '#34c759' },
          data: [2800, 2200, 1850, 1200, 800].map(v => Math.max(0, Math.floor(v - index * 200 + (Math.random() * 200))))
      }))
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
        axisLabel: { color: colors.text },
        show: true
      },
      yAxis: {
        type: 'value',
        name: 'TPS',
        nameTextStyle: { color: colors.text },
        axisLabel: { color: colors.text },
        splitLine: { lineStyle: { type: 'dashed', color: colors.split } },
        show: true
      },
      title: { show: false },
      series: series
    }
    
    tpsChart?.setOption(option, true)
  }

  await updateChart()
  watch(() => consensusStore.comparisonIds, updateChart, { deep: true })
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
    let data: any[] = []

    try {
      data = await analysisAPI.getPerformanceLimits(selectedConsensus.value)
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

const handleResize = () => {
  latencyChart?.resize()
  tpsChart?.resize()
  nodeStatusChart?.resize()
  performanceLimitChart?.resize()
}

onMounted(async () => {
  themeObserver = new MutationObserver(updateTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  await Promise.all([
    performanceStore.loadInitialData(),
    benchmarkStore.loadTasks(),
    nodeStore.loadNodes(),
    consensusStore.loadConfig(),
    consensusStore.loadAlgorithms()
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
</script>

<style scoped lang="scss" src="@/assets/styles/pages/dashboard.scss"></style>
<style lang="scss">
.selected-list {
  border: 1px solid var(--ios-split);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.selected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: var(--ios-bg-secondary);
  border-bottom: 1px solid var(--ios-split);
  
  &:last-child {
    border-bottom: none;
  }
  
  .algo-name {
    font-weight: 500;
    color: var(--ios-text-primary);
  }
  
  .item-actions {
    display: flex;
    gap: 8px;
  }
}

.tps-chart-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative; /* Ensure stacking context */

  &.is-expanded {
    position: fixed;
    top: 80px;
    left: 296px; /* Sidebar (260+16+16=292?) Adjusted to 296 */
    right: 24px;
    bottom: 24px;
    width: auto !important;
    height: auto !important;
    z-index: 2000;
    margin: 0;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    background-color: var(--ios-bg-secondary);
    
    @media (max-width: 992px) {
       left: 24px;
    }

    .tps-chart-container {
      height: 100% !important; 
      flex: 1;
    }
  }

  .header-title-group {
    display: flex;
    align-items: center;
    gap: 8px;
    
    h3 {
      margin: 0;
    }
    
    .vs-title {
      font-size: 14px;
      color: var(--ios-text-secondary);
      font-weight: 500;
    }
  }

  .tps-chart-container {
    height: 300px;
    width: 100%;
    transition: height 0.3s ease;
  }
}

.algo-select-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px;
}

.switch-item-popover {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .switch-label {
    font-size: 14px;
    color: var(--ios-text-primary);
  }
}
</style>
