<template>
  <div class="ios-card chart-card">
    <div class="dashboard-card-header">
      <h3>共识延迟趋势</h3>
      <el-tag type="info" size="small" effect="light" round>实时监控</el-tag>
    </div>
    <div ref="latencyChartRef" style="height: 300px;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { usePerformanceStore } from '@/store/modules/performance'

const performanceStore = usePerformanceStore()
const latencyChartRef = ref<HTMLElement>()
let latencyChart: echarts.ECharts | null = null

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

const handleResize = () => {
  latencyChart?.resize()
}

onMounted(() => {
  themeObserver = new MutationObserver(updateTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  initLatencyChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  themeObserver?.disconnect()
  latencyChart?.dispose()
})
</script>
