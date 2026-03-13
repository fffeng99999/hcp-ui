<template>
  <BaseCard title="节点性能热力图">
    <template #action>
      <el-radio-group v-model="heatmapMetric" size="small" @change="initHeatmapChart">
        <el-radio-button label="cpu">CPU使用率</el-radio-button>
        <el-radio-button label="memory">内存使用率</el-radio-button>
        <el-radio-button label="network">网络流量</el-radio-button>
      </el-radio-group>
    </template>
    <div ref="heatmapChartRef" style="height: 400px;"></div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { useNodeStore } from '@/store/modules/node'
import { useUIStore } from '@/store/modules/ui'
import BaseCard from '@/components/cards/DashboardCard.vue'

const nodeStore = useNodeStore()
const uiStore = useUIStore()
const heatmapMetric = ref('cpu')
const heatmapChartRef = ref<HTMLElement>()
let heatmapChart: echarts.ECharts | null = null

const isDark = computed(() => uiStore.theme === 'dark')

const getChartColors = () => ({
  text: isDark.value ? '#C5C5D2' : '#8e8e93',
  axis: isDark.value ? 'rgba(255,255,255,0.1)' : '#e5e5ea',
  tooltipBg: isDark.value ? '#444654' : '#ffffff',
  tooltipText: isDark.value ? '#ECECF1' : '#000000',
  split: isDark.value ? 'rgba(255,255,255,0.05)' : '#f2f2f7',
})

const initHeatmapChart = async () => {
  if (!heatmapChartRef.value) return
  if (!heatmapChart) heatmapChart = echarts.init(heatmapChartRef.value)
  const colors = getChartColors()
  
  const nodes = nodeStore.nodes.map(n => n.name || n.id)
  const hours = ['当前']
  // 使用随机数生成示例热力图数据，后续可替换为真实监控指标
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
      name: '使用率',
      type: 'heatmap',
      data: data,
      label: { show: false }
    }]
  }
  
  heatmapChart.setOption(option)
}

watch(isDark, () => {
  heatmapChart?.dispose()
  heatmapChart = null
  initHeatmapChart()
})

const handleResize = () => {
  heatmapChart?.resize()
}

onMounted(() => {
  initHeatmapChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  heatmapChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
