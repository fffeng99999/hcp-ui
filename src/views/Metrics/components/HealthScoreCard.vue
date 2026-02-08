<template>
  <BaseCard title="系统健康度评分">
    <div ref="healthScoreChartRef" style="height: 400px;"></div>
    
    <el-divider />

    <div class="health-details">
      <div class="health-item">
        <span>共识稳定性</span>
        <el-progress :percentage="95" color="#67C23A" />
      </div>
      <div class="health-item">
        <span>网络连通性</span>
        <el-progress :percentage="88" color="#409EFF" />
      </div>
      <div class="health-item">
        <span>节点可用性</span>
        <el-progress :percentage="92" color="#67C23A" />
      </div>
      <div class="health-item">
        <span>数据一致性</span>
        <el-progress :percentage="98" color="#67C23A" />
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import BaseCard from '@/components/cards/BaseCard.vue'

const healthScoreChartRef = ref<HTMLElement>()
let healthScoreChart: echarts.ECharts | null = null

const isDark = ref(document.documentElement.classList.contains('dark'))
let themeObserver: MutationObserver | null = null

const updateTheme = () => {
  isDark.value = document.documentElement.classList.contains('dark')
}

const getChartColors = () => ({
  text: isDark.value ? '#C5C5D2' : '#8e8e93',
  title: isDark.value ? '#ECECF1' : '#1d1d1f',
})

const initHealthScoreChart = () => {
  if (!healthScoreChartRef.value) return
  if (!healthScoreChart) healthScoreChart = echarts.init(healthScoreChartRef.value)
  const colors = getChartColors()
  
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [0.3, '#F56C6C'],
            [0.7, '#E6A23C'],
            [1, '#67C23A']
          ]
        }
      },
      pointer: { itemStyle: { color: 'auto' } },
      axisTick: { distance: -30, length: 8, lineStyle: { color: colors.text } },
      splitLine: { distance: -30, length: 30, lineStyle: { color: colors.text } },
      axisLabel: { distance: -20, fontSize: 10, color: colors.text },
      detail: {
        valueAnimation: true,
        formatter: '{value} 分',
        color: 'auto',
        fontSize: 20
      },
      title: { color: colors.title },
      data: [{ value: 93, name: '系统健康度' }]
    }]
  }
  
  healthScoreChart.setOption(option)
}

watch(isDark, () => {
  healthScoreChart?.dispose()
  healthScoreChart = null
  initHealthScoreChart()
})

const handleResize = () => {
  healthScoreChart?.resize()
}

onMounted(() => {
  themeObserver = new MutationObserver(updateTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  initHealthScoreChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  themeObserver?.disconnect()
  healthScoreChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.health-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.health-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.health-item span {
  width: 100px;
  font-size: 14px;
  color: var(--ios-text-secondary, #86868b);
}
.health-item .el-progress {
  flex: 1;
}
</style>
