<template>
  <div class="dashboard">
    <!-- 顶部概览卡片 -->
    <div class="overview-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-icon" style="background: #409EFF;">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ metrics.avgLatency }}ms</div>
              <div class="metric-label">平均延迟</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-icon" style="background: #67C23A;">
              <el-icon><Odometer /></el-icon>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ metrics.throughput }}</div>
              <div class="metric-label">吞吐量(TPS)</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-icon" style="background: #E6A23C;">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ metrics.nodeCount }}</div>
              <div class="metric-label">活跃节点数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-icon" style="background: #F56C6C;">
              <el-icon><DocumentCopy /></el-icon>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ metrics.consensusType }}</div>
              <div class="metric-label">共识算法</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 性能对比图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 延迟趋势图 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>共识延迟趋势</span>
                <el-tag type="info" size="small">实时监控</el-tag>
              </div>
            </template>
            <div ref="latencyChartRef" style="height: 300px;"></div>
          </el-card>
        </el-col>

        <!-- 吞吐量对比图 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>TPS性能对比</span>
                <el-tag type="success" size="small">tPBFT vs PBFT</el-tag>
              </div>
            </template>
            <div ref="tpsChartRef" style="height: 300px;"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 节点状态分布 -->
        <el-col :span="8">
          <el-card class="chart-card">
            <template #header>
              <span>节点状态分布</span>
            </template>
            <div ref="nodeStatusChartRef" style="height: 280px;"></div>
          </el-card>
        </el-col>

        <!-- 共识性能界限分析 -->
        <el-col :span="16">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>性能界限分析</span>
                <el-select v-model="selectedConsensus" size="small" style="width: 120px;">
                  <el-option label="tPBFT" value="tPBFT" />
                  <el-option label="PBFT" value="PBFT" />
                  <el-option label="Raft" value="Raft" />
                  <el-option label="HotStuff" value="HotStuff" />
                </el-select>
              </div>
            </template>
            <div ref="performanceLimitChartRef" style="height: 280px;"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 测试任务管理区域 -->
    <div class="task-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>测试任务列表</span>
            <el-button type="primary" size="small" @click="createNewTest">
              <el-icon><Plus /></el-icon> 新建测试
            </el-button>
          </div>
        </template>
        <el-table :data="testTasks" style="width: 100%">
          <el-table-column prop="id" label="任务ID" width="100" />
          <el-table-column prop="name" label="测试名称" width="200" />
          <el-table-column prop="consensus" label="共识算法" width="120" />
          <el-table-column prop="nodes" label="节点数" width="100" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="avgLatency" label="平均延迟(ms)" width="140" />
          <el-table-column prop="tps" label="TPS" width="120" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="scope">
              <el-button size="small" @click="viewDetails(scope.row)">详情</el-button>
              <el-button size="small" type="primary" @click="startTest(scope.row)">启动</el-button>
              <el-button size="small" type="danger" @click="deleteTest(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
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

// 初始化延迟趋势图
const initLatencyChart = () => {
  if (!latencyChartRef.value) return
  latencyChart = echarts.init(latencyChartRef.value)
  
  const updateChart = () => {
    const history = performanceStore.history.slice(-60) // Last 60 points
    const times = history.map(h => h.timestamp.split('T')[1].split('.')[0])
    const latencies = history.map(h => h.latency)

    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Latency'] },
      xAxis: {
        type: 'category',
        data: times
      },
      yAxis: {
        type: 'value',
        name: '延迟(ms)'
      },
      series: [
        {
          name: 'Latency',
          type: 'line',
          smooth: true,
          data: latencies,
          itemStyle: { color: '#409EFF' }
        }
      ]
    }
    latencyChart?.setOption(option)
  }

  updateChart()
  
  // Watch for history updates
  watch(() => performanceStore.history, () => {
    updateChart()
  }, { deep: true })
}

// 初始化TPS对比图
const initTpsChart = async () => {
  if (!tpsChartRef.value) return
  tpsChart = echarts.init(tpsChartRef.value)
  
  try {
    const comparisonData = await analysisAPI.getAlgorithmComparison({
      algorithms: ['tPBFT', 'PBFT']
    })
    
    // Process data for chart
    // Assuming data structure: [{ algorithm: 'tPBFT', data: [{nodeCount: 10, tps: 2800}, ...] }, ...]
    const nodeCounts = comparisonData[0]?.data.map(d => d.nodeCount + '节点') || []
    
    const series = comparisonData.map(item => ({
      name: item.algorithm,
      type: 'bar',
      data: item.data.map(d => d.tps),
      itemStyle: { color: item.algorithm === 'tPBFT' ? '#67C23A' : '#E6A23C' }
    }))

    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: comparisonData.map(c => c.algorithm) },
      xAxis: {
        type: 'category',
        data: nodeCounts
      },
      yAxis: {
        type: 'value',
        name: 'TPS'
      },
      series: series
    }
    
    tpsChart.setOption(option)
  } catch (error) {
    console.warn('Failed to load TPS comparison data, using fallback', error)
    // Fallback data
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['tPBFT', 'PBFT'] },
      xAxis: {
        type: 'category',
        data: ['10节点', '30节点', '50节点', '100节点', '200节点']
      },
      yAxis: {
        type: 'value',
        name: 'TPS'
      },
      series: [
        {
          name: 'tPBFT',
          type: 'bar',
          data: [2800, 2200, 1850, 1200, 800],
          itemStyle: { color: '#67C23A' }
        },
        {
          name: 'PBFT',
          type: 'bar',
          data: [1800, 1400, 1200, 750, 450],
          itemStyle: { color: '#E6A23C' }
        }
      ]
    }
    tpsChart.setOption(option)
  }
}

// 初始化节点状态图
const initNodeStatusChart = () => {
  if (!nodeStatusChartRef.value) return
  nodeStatusChart = echarts.init(nodeStatusChartRef.value)
  
  const updateChart = () => {
    const online = nodeStore.onlineCount
    const offline = nodeStore.offlineCount
    const total = nodeStore.nodes.length
    const faulty = total - online - offline // Assuming faulty is the rest, or we check status 'faulty'

    const option = {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: '节点状态',
          type: 'pie',
          radius: '60%',
          data: [
            { value: online, name: '正常运行', itemStyle: { color: '#67C23A' } },
            { value: faulty, name: '异常/高负载', itemStyle: { color: '#E6A23C' } },
            { value: offline, name: '离线', itemStyle: { color: '#F56C6C' } }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    nodeStatusChart?.setOption(option)
  }

  updateChart()
  
  watch(() => nodeStore.nodes, () => {
    updateChart()
  }, { deep: true })
}

// 初始化性能界限分析图
const initPerformanceLimitChart = async () => {
  if (!performanceLimitChartRef.value) return
  performanceLimitChart = echarts.init(performanceLimitChartRef.value)
  
  const updateChart = async () => {
    try {
      const data = await analysisAPI.getPerformanceLimits(selectedConsensus.value)
      
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['实际TPS', '理论上限'] },
        xAxis: {
          type: 'value',
          name: '节点数量'
        },
        yAxis: {
          type: 'value',
          name: 'TPS'
        },
        series: [
          {
            name: '实际TPS',
            type: 'line',
            data: data.map(d => [d.nodeCount, d.actualTps]),
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '理论上限',
            type: 'line',
            data: data.map(d => [d.nodeCount, d.theoreticalTps]),
            itemStyle: { color: '#909399', type: 'dashed' }
          }
        ]
      }
      performanceLimitChart?.setOption(option)
    } catch (error) {
      console.warn('Failed to load performance limits, using fallback', error)
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['实际TPS', '理论上限'] },
        xAxis: {
          type: 'value',
          name: '节点数量'
        },
        yAxis: {
          type: 'value',
          name: 'TPS'
        },
        series: [
          {
            name: '实际TPS',
            type: 'line',
            data: [[10, 2800], [30, 2200], [50, 1850], [100, 1200], [200, 800]],
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '理论上限',
            type: 'line',
            data: [[10, 3500], [30, 2800], [50, 2400], [100, 1800], [200, 1200]],
            itemStyle: { color: '#909399', type: 'dashed' }
          }
        ]
      }
      performanceLimitChart?.setOption(option)
    }
  }

  await updateChart()
  
  watch(selectedConsensus, () => {
    updateChart()
  })
}

const createNewTest = () => {
  // Logic to navigate to benchmark creation or open modal
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
  padding: 20px;
  background: #f0f2f5;
}

/* 顶部指标卡片样式 */
.overview-section {
  margin-bottom: 20px;
}

.metric-card {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  margin-right: 16px;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 14px;
  color: #909399;
}

/* 图表卡片样式 */
.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

/* 任务列表样式 */
.task-section {
  margin-top: 20px;
}

:deep(.el-card__body) {
  padding: 16px;
}
</style>
