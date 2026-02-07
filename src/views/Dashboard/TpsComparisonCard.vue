<template>
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
                :disabled="consensusStore.comparisonIds.length >= maxAllowed && !consensusStore.comparisonIds.includes(algo.id)"
              />
            </div>
          </div>
        </el-popover>

        <el-button circle @click="toggleExpand" :type="consensusStore.isChartExpanded ? 'primary' : 'default'">
          <el-icon><component :is="consensusStore.isChartExpanded ? ZoomOut : ZoomIn" /></el-icon>
        </el-button>
      </div>
    </div>

    <div ref="tpsChartRef" class="tps-chart-container"></div>
  </div>

  <el-dialog v-model="showConflictModal" :title="`调整共识算法 (最多${maxAllowed}个)`" width="500px" destroy-on-close>
    <p style="margin-bottom: 16px; color: var(--ios-text-secondary);">
      请保留最多 {{ maxAllowed }} 个算法并调整顺序（拖拽排序功能暂以“上移/下移”代替）：
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
      <el-button type="primary" @click="confirmConflict" :disabled="tempSelectedIds.length > maxAllowed">
        确定 ({{ tempSelectedIds.length }}/{{ maxAllowed }})
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ArrowUp, ArrowDown, Close, Setting, ZoomIn, ZoomOut } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useConsensusStore } from '@/store/modules/consensus'
import * as analysisAPI from '@/api/analysis'

const consensusStore = useConsensusStore()
const tpsChartRef = ref<HTMLElement>()
let tpsChart: echarts.ECharts | null = null
const maxAllowed = computed(() => (consensusStore.isChartExpanded ? 10 : 4))

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
  const limit = maxAllowed.value

  if (value) {
    if (currentCount >= limit) {
      tempSelectedIds.value = [...consensusStore.comparisonIds, id].slice(0, limit + 1)
      showConflictModal.value = true
    } else {
      consensusStore.toggleComparisonAlgorithm(id)
    }
  } else {
    consensusStore.toggleComparisonAlgorithm(id)
  }
}

const confirmConflict = () => {
  const limit = maxAllowed.value
  if (tempSelectedIds.value.length > limit) {
    ElMessage.warning(`最多只能选择 ${limit} 个算法`)
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
          data: item.data.map(d => d.tps)
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
  window.removeEventListener('resize', handleResize)
  themeObserver?.disconnect()
  tpsChart?.dispose()
})
</script>

<style lang="scss">
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
}
.header-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

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
  position: relative;

  &.is-expanded {
    position: fixed;
    top: 80px;
    left: 296px;
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
