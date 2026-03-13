<template>
  <BaseCard title="共识算法性能对比">
    <template #action>
      <el-button size="small" @click="exportComparison">
        <el-icon><Download /></el-icon> 导出报告
      </el-button>
    </template>

    <ActionTable 
      :data="comparisonData" 
      :columns="consensusComparisonTable.columns"
      :card="false"
      stripe 
      border
    >
      <template #avgTps="{ row }">
        <strong>{{ row.avgTps }}</strong>
      </template>
      <template #peakTps="{ row }">
        <el-tag type="success">{{ row.peakTps }}</el-tag>
      </template>
      <template #cpuUsage="{ row }">
        <el-progress :percentage="row.cpuUsage" />
      </template>
      <template #memoryUsage="{ row }">
        <el-progress :percentage="row.memoryUsage" />
      </template>
      <template #rating="{ row }">
        <el-rate v-model="row.rating" disabled show-score />
      </template>
    </ActionTable>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as analysisAPI from '@/api/analysis'
import BaseCard from '@/components/cards/DashboardCard.vue'
import ActionTable from '@/components/table/ActionTable.vue'
import { consensusComparisonTable } from '@/config/tables/consensusComparison'

const comparisonData = ref<any[]>([])

const normalizeArray = (res: unknown): any[] => {
  if (Array.isArray(res)) return res
  if (res && typeof res === 'object' && Array.isArray((res as any).list)) return (res as any).list
  return []
}

const exportComparison = async () => {
  try {
    await analysisAPI.generateReport({ title: '性能对比报告', content: '自动生成', format: 'pdf' })
    ElMessage.success('性能对比报告导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  analysisAPI.getAlgorithmComparison()
    .then((res) => {
      comparisonData.value = normalizeArray(res)
    })
    .catch(() => {
      comparisonData.value = []
    })
})
</script>
