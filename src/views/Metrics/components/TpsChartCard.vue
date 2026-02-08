<template>
  <BaseCard title="TPS实时监控">
    <template #action>
      <BaseSegmentedControl
        v-model="tpsTimeRange"
        :options="timeOptions"
        @change="initTpsChart"
      />
    </template>
    <div ref="tpsChartRef" style="height: 350px;"></div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import * as performanceAPI from '@/api/performance'
import BaseCard from '@/components/cards/BaseCard.vue'
import BaseSegmentedControl from '@/components/common/BaseSegmentedControl.vue'

const tpsTimeRange = ref('1h')
const timeOptions = [
  { label: '1小时', value: '1h' },
  { label: '6小时', value: '6h' },
  { label: '24小时', value: '24h' }
]
const tpsChartRef = ref<HTMLElement>()
let tpsChart: echarts.ECharts | null = null

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
  tooltipBg: isDark.value ? '#444654' : '#ffffff',
  tooltipText: isDark.value ? '#ECECF1' : '#000000',
  areaColor: isDark.value ? 'rgba(103, 194, 58, 0.1)' : 'rgba(103, 194, 58, 0.2)'
})

const initTpsChart = async () => {
  if (!tpsChartRef.value) return
  if (!tpsChart) tpsChart = echarts.init(tpsChartRef.value)
  
  const colors = getChartColors()
  
  const rangeMap: Record<string, number> = { '1h': 60, '6h': 360, '24h': 1440 }
  const limit = rangeMap[tpsTimeRange.value] || 60
  
  try {
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
  } catch (e) {
    console.error('Failed to load TPS history', e)
  }
}

watch(isDark, () => {
  tpsChart?.dispose()
  tpsChart = null
  initTpsChart()
})

const handleResize = () => {
  tpsChart?.resize()
}

onMounted(() => {
  themeObserver = new MutationObserver(updateTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  initTpsChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  themeObserver?.disconnect()
  tpsChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
