<template>
  <ActionTable :data="testTasks" title="测试任务列表" :action-width="tableConfig.action.width">
    <template #header-actions>
      <el-button type="primary" size="small" round @click="createNewTest">
        <el-icon class="el-icon--left"><Plus /></el-icon> 新建测试
      </el-button>
    </template>
    <el-table-column prop="id" :label="tableConfig.columns.id.label" :width="tableConfig.columns.id.width" resizable />
    <el-table-column prop="name" :label="tableConfig.columns.name.label" :width="tableConfig.columns.name.width" resizable>
      <template #default="{ row }">
        <span style="font-weight: 600">{{ row.name }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="consensus" :label="tableConfig.columns.consensus.label" :width="tableConfig.columns.consensus.width" resizable />
    <el-table-column prop="nodes" :label="tableConfig.columns.nodes.label" :width="tableConfig.columns.nodes.width" resizable />
    <el-table-column prop="status" :label="tableConfig.columns.status.label" :width="tableConfig.columns.status.width" resizable>
      <template #default="scope">
        <el-tag :type="getStatusType(scope.row.status)" effect="light" round>
          {{ scope.row.status }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="avgLatency" :label="tableConfig.columns.avgLatency.label" :width="tableConfig.columns.avgLatency.width" resizable />
    <el-table-column prop="tps" :label="tableConfig.columns.tps.label" :width="tableConfig.columns.tps.width" resizable />
    <el-table-column prop="createdAt" :label="tableConfig.columns.createdAt.label" :width="tableConfig.columns.createdAt.width" resizable />
    <template #actions="{ row }">
      <el-button size="small" text bg @click="viewDetails(row)">详情</el-button>
      <el-button size="small" type="primary" text bg @click="startTest(row)">启动</el-button>
      <el-button size="small" type="danger" text bg @click="deleteTest(row)">删除</el-button>
    </template>
  </ActionTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useBenchmarkStore } from '@/store/modules/benchmark'
import ActionTable from '@/components/table/ActionTable.vue'
import { dashboardTestTasksTable as tableConfig } from '@/config/tables/dashboardTestTasks'

const benchmarkStore = useBenchmarkStore()
const testTasks = computed(() => benchmarkStore.tasks.slice(0, 5))

const createNewTest = () => {
  ElMessage.info('请前往测试任务页面创建新任务')
}

const viewDetails = (task: any) => {
  console.log('View details', task)
}

const startTest = async (task: any) => {
  try {
    await benchmarkStore.startTask(task.id)
    ElMessage.success('任务已启动')
  } catch (error) {
    ElMessage.error('启动失败')
  }
}

const deleteTest = async (task: any) => {
  try {
    await benchmarkStore.deleteTask(task.id)
    ElMessage.success('任务已删除')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    running: 'success',
    completed: 'info',
    waiting: 'warning',
    failed: 'danger',
    paused: 'warning'
  }
  return map[status] || 'info'
}
</script>
