<template>
  <div class="ios-card chart-card">
    <div class="dashboard-card-header">
      <h3>节点状态分布</h3>
    </div>
    <div ref="nodeStatusChartRef" style="height: 280px;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useNodeStore } from '@/store/modules/node'

const nodeStore = useNodeStore()
const nodeStatusChartRef = ref<HTMLElement>()
let nodeStatusChart: echarts.ECharts | null = null

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
          ]
        }
      ]
    }
    nodeStatusChart?.setOption(option)
  }

  updateChart()
  watch(() => nodeStore.nodes, updateChart, { deep: true })
  watch(isDark, updateChart)
}

const handleResize = () => {
  nodeStatusChart?.resize()
}

onMounted(() => {
  themeObserver = new MutationObserver(updateTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  initNodeStatusChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  themeObserver?.disconnect()
  nodeStatusChart?.dispose()
})
</script>
