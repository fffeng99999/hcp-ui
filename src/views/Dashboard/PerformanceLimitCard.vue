<template>
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
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import * as analysisAPI from '@/api/analysis'

const selectedConsensus = ref('tPBFT')
const performanceLimitChartRef = ref<HTMLElement>()
let performanceLimitChart: echarts.ECharts | null = null

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

const handleResize = () => {
  performanceLimitChart?.resize()
}

onMounted(() => {
  themeObserver = new MutationObserver(updateTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  initPerformanceLimitChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  themeObserver?.disconnect()
  performanceLimitChart?.dispose()
})
</script>
