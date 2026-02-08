<template>
  <BaseCard title="共识算法性能对比">
    <template #action>
      <el-button size="small" @click="exportComparison">
        <el-icon><Download /></el-icon> 导出报告
      </el-button>
    </template>

    <el-table :data="comparisonData" stripe border>
      <el-table-column prop="algorithm" label="共识算法" width="120" fixed />
      <el-table-column prop="avgTps" label="平均TPS" width="120" sortable>
        <template #default="{ row }">
          <strong>{{ row.avgTps }}</strong>
        </template>
      </el-table-column>
      <el-table-column prop="peakTps" label="峰值TPS" width="120" sortable>
        <template #default="{ row }">
          <el-tag type="success">{{ row.peakTps }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="avgLatency" label="平均延迟(ms)" width="140" sortable />
      <el-table-column prop="p95Latency" label="P95延迟(ms)" width="140" sortable />
      <el-table-column prop="p99Latency" label="P99延迟(ms)" width="140" sortable />
      <el-table-column prop="cpuUsage" label="CPU使用率" width="120">
        <template #default="{ row }">
          <el-progress :percentage="row.cpuUsage" />
        </template>
      </el-table-column>
      <el-table-column prop="memoryUsage" label="内存使用率" width="120">
        <template #default="{ row }">
          <el-progress :percentage="row.memoryUsage" />
        </template>
      </el-table-column>
      <el-table-column prop="networkIO" label="网络I/O" width="120" />
      <el-table-column prop="faultTolerance" label="容错率" width="100" />
      <el-table-column label="综合评分" width="120" fixed="right">
        <template #default="{ row }">
          <el-rate v-model="row.rating" disabled show-score />
        </template>
      </el-table-column>
    </el-table>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as analysisAPI from '@/api/analysis'
import BaseCard from '@/components/cards/BaseCard.vue'

const comparisonData = ref<any[]>([])

const exportComparison = async () => {
  try {
    await analysisAPI.generateReport({ title: '性能对比报告', content: '自动生成', format: 'pdf' })
    ElMessage.success('性能对比报告导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  analysisAPI.getAlgorithmComparison().then(res => {
    comparisonData.value = res || []
  }).catch(() => {
    comparisonData.value = []
  })
})
</script>
