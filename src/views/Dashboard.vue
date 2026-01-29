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
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { Timer, Odometer, Connection, DocumentCopy, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 核心性能指标
const metrics = ref({
  avgLatency: 328,
  throughput: 1850,
  nodeCount: 50,
  consensusType: 'tPBFT'
})

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
const testTasks = ref([
  {
    id: 'TEST-001',
    name: 'tPBFT高频交易压测',
    consensus: 'tPBFT',
    nodes: 50,
    status: '运行中',
    avgLatency: 328,
    tps: 1850,
    createdAt: '2026-01-28 14:30:00'
  },
  {
    id: 'TEST-002',
    name: 'PBFT基准测试',
    consensus: 'PBFT',
    nodes: 30,
    status: '已完成',
    avgLatency: 486,
    tps: 1200,
    createdAt: '2026-01-27 10:15:00'
  },
  {
    id: 'TEST-003',
    name: 'Raft延迟对比',
    consensus: 'Raft',
    nodes: 20,
    status: '等待中',
    avgLatency: null,
    tps: null,
    createdAt: '2026-01-29 09:00:00'
  }
])

// 初始化延迟趋势图
const initLatencyChart = () => {
  if (!latencyChartRef.value) return
  latencyChart = echarts.init(latencyChartRef.value)
  
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['tPBFT', 'PBFT', 'Raft'] },
    xAxis: {
      type: 'category',
      data: ['0s', '10s', '20s', '30s', '40s', '50s', '60s']
    },
    yAxis: {
      type: 'value',
      name: '延迟(ms)'
    },
    series: [
      {
        name: 'tPBFT',
        type: 'line',
        smooth: true,
        data: [320, 328, 315, 340, 325, 330, 328],
        itemStyle: { color: '#409EFF' }
      },
      {
        name: 'PBFT',
        type: 'line',
        smooth: true,
        data: [480, 490, 475, 500, 485, 495, 486],
        itemStyle: { color: '#E6A23C' }
      },
      {
        name: 'Raft',
        type: 'line',
        smooth: true,
        data: [550, 560, 545, 575, 555, 565, 558],
        itemStyle: { color: '#F56C6C' }
      }
    ]
  }
  
  latencyChart.setOption(option)
}

// 初始化TPS对比图
const initTpsChart = () => {
  if (!tpsChartRef.value) return
  tpsChart = echarts.init(tpsChartRef.value)
  
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

// 初始化节点状态图
const initNodeStatusChart = () => {
  if (!nodeStatusChartRef.value) return
  nodeStatusChart = echarts.init(nodeStatusChartRef.value)
  
  const option = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '节点状态',
        type: 'pie',
        radius: '60%',
        data: [
          { value: 45, name: '正常运行', itemStyle: { color: '#67C23A' } },
          { value: 3, name: '高负载', itemStyle: { color: '#E6A23C' } },
          { value: 2, name: '离线', itemStyle: { color: '#F56C6C' } }
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
  
  nodeStatusChart.setOption(option)
}

// 初始化性能界限分析图
const initPerformanceLimitChart = () => {
  if (!performanceLimitChartRef.value) return
  performanceLimitChart = echarts.init(performanceLimitChartRef.value)
  
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
        lineStyle: { type: 'dashed' },
        itemStyle: { color: '#F56C6C' }
      }
    ]
  }
  
  performanceLimitChart.setOption(option)
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    '运行中': 'success',
    '已完成': 'info',
    '等待中': 'warning',
    '失败': 'danger'
  }
  return typeMap[status] || 'info'
}

// 操作方法
const createNewTest = () => {
  ElMessage.info('跳转到测试配置页面')
}

const viewDetails = (row: any) => {
  ElMessage.info(`查看测试 ${row.id} 的详细信息`)
}

const startTest = (row: any) => {
  ElMessage.success(`启动测试任务 ${row.id}`)
}

const deleteTest = (row: any) => {
  ElMessage.warning(`删除测试任务 ${row.id}`)
}

// 生命周期
onMounted(() => {
  initLatencyChart()
  initTpsChart()
  initNodeStatusChart()
  initPerformanceLimitChart()
  
  // 响应式处理
  window.addEventListener('resize', () => {
    latencyChart?.resize()
    tpsChart?.resize()
    nodeStatusChart?.resize()
    performanceLimitChart?.resize()
  })
})

onUnmounted(() => {
  latencyChart?.dispose()
  tpsChart?.dispose()
  nodeStatusChart?.dispose()
  performanceLimitChart?.dispose()
})
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
