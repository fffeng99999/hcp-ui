<template>
  <BaseCard title="延迟分布">
    <template #action>
      <el-select v-model="latencyMetric" size="small" style="width: 120px" @change="initLatencyChart">
        <el-option label="P50" value="p50" />
        <el-option label="P95" value="p95" />
        <el-option label="P99" value="p99" />
      </el-select>
    </template>
    <div ref="latencyChartRef" style="height: 350px;"></div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import * as performanceAPI from '@/api/performance'
import BaseCard from '@/components/cards/BaseCard.vue'

const latencyMetric = ref('p95')
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
  tooltipBg: isDark.value ? '#444654' : '#ffffff',
  tooltipText: isDark.value ? '#ECECF1' : '#000000',
})

const initLatencyChart = async () => {
  if (!latencyChartRef.value) return
  if (!latencyChart) latencyChart = echarts.init(latencyChartRef.value)
  const colors = getChartColors()
  
  try {
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
  } catch (e) {
    console.error('Failed to load latency history', e)
  }
}

watch(isDark, () => {
  latencyChart?.dispose()
  latencyChart = null
  initLatencyChart()
})

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
  themeObserver?.disconnect()
  latencyChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
