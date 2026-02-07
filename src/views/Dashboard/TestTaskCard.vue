<template>
  <div class="ios-card">
    <div class="card-header">
      <h3>测试任务列表</h3>
      <el-button type="primary" size="small" round @click="createNewTest">
        <el-icon class="el-icon--left"><Plus /></el-icon> 新建测试
      </el-button>
    </div>
    <el-table :data="testTasks" style="width: 100%" :header-cell-style="{ background: 'transparent' }">
      <el-table-column prop="id" label="任务ID" width="100" />
      <el-table-column prop="name" label="测试名称" width="200">
        <template #default="{ row }">
          <span style="font-weight: 600">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="consensus" label="共识算法" width="120" />
      <el-table-column prop="nodes" label="节点数" width="100" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)" effect="light" round>
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="avgLatency" label="平均延迟(ms)" width="140" />
      <el-table-column prop="tps" label="TPS" width="120" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" fixed="right" min-width="200">
        <template #default="scope">
          <el-button size="small" text bg @click="viewDetails(scope.row)">详情</el-button>
          <el-button size="small" type="primary" text bg @click="startTest(scope.row)">启动</el-button>
          <el-button size="small" type="danger" text bg @click="deleteTest(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useBenchmarkStore } from '@/store/modules/benchmark'

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
