<template>
  <div class="stress-test-page">
    <!-- 顶部操作栏 -->
    <div class="ios-card header-card">
      <el-row :gutter="16" align="middle" class="action-row">
        <el-col :xs="24" :sm="24" :md="18" class="action-buttons mb-4-mobile">
          <el-button type="primary" round @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon> 创建压测任务
          </el-button>
          <el-button round @click="batchStart" :disabled="selectedTasks.length === 0">
            <el-icon><VideoPlay /></el-icon> 批量启动
          </el-button>
          <el-button round @click="batchStop" :disabled="selectedTasks.length === 0">
            <el-icon><VideoPause /></el-icon> 批量停止
          </el-button>
          <el-button type="danger" round @click="batchDelete" :disabled="selectedTasks.length === 0">
            <el-icon><Delete /></el-icon> 批量删除
          </el-button>
        </el-col>
        <el-col :xs="24" :sm="24" :md="6">
          <el-input v-model="searchQuery" placeholder="搜索任务名称或ID" clearable class="ios-search">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </div>

    <!-- 任务列表 -->
    <div class="ios-card table-card">
      <div class="card-header">
        <h3>压测任务列表</h3>
        <div class="header-actions">
          <el-radio-group v-model="taskFilter" size="small" class="ios-radio-group">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="running">运行中</el-radio-button>
            <el-radio-button label="completed">已完成</el-radio-button>
            <el-radio-button label="failed">失败</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <el-table 
        :data="filteredTasks" 
        @selection-change="handleSelectionChange"
        style="width: 100%"
        :header-cell-style="{ background: 'transparent' }"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="任务ID" width="120" />
        <el-table-column prop="name" label="任务名称" width="200">
          <template #default="{ row }">
            <span style="font-weight: 600; color: var(--ios-blue); cursor: pointer" @click="viewTaskDetail(row)">
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="consensus" label="共识算法" width="120">
          <template #default="{ row }">
            <el-tag :type="getConsensusColor(row.consensus)" effect="light" round>
              {{ row.consensus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="nodeCount" label="节点数" width="100" align="center" />
        <el-table-column prop="txRate" label="交易速率" width="120">
          <template #default="{ row }">
            {{ row.txRate }} tx/s
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="持续时间" width="120">
          <template #default="{ row }">
            {{ formatDuration(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="light" round>
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.progress" 
              :status="row.status === '失败' ? 'exception' : undefined"
              :stroke-width="6"
            />
          </template>
        </el-table-column>
        <el-table-column label="性能指标" width="200">
          <template #default="{ row }">
            <div class="metrics-cell">
              <span>TPS: <strong>{{ row.currentTps || '-' }}</strong></span>
              <span>延迟: <strong>{{ row.currentLatency || '-' }}ms</strong></span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="260" class-name="fixed-operation-column" label-class-name="fixed-operation-column">
          <template #default="{ row }">
            <el-button-group size="small" class="ios-button-group">
              <el-button 
                v-if="row.status === '等待中'" 
                type="success" 
                circle
                @click="startTask(row)"
              >
                <el-icon><VideoPlay /></el-icon>
              </el-button>
              <el-button 
                v-if="row.status === '运行中'" 
                type="warning" 
                circle
                @click="pauseTask(row)"
              >
                <el-icon><VideoPause /></el-icon>
              </el-button>
              <el-button 
                v-if="row.status === '运行中' || row.status === '暂停'" 
                type="danger" 
                circle
                @click="stopTask(row)"
              >
                <el-icon><Close /></el-icon>
              </el-button>
              <el-button circle @click="viewTaskDetail(row)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button circle @click="duplicateTask(row)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
              <el-button 
                type="danger" 
                circle
                @click="deleteTask(row)"
                :disabled="row.status === '运行中'"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalTasks"
        />
      </div>
    </div>

    <!-- 创建任务对话框 -->
    <el-dialog 
      v-model="showCreateDialog" 
      title="创建压测任务" 
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="newTask" :rules="taskRules" ref="taskFormRef" label-width="120px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="newTask.name" placeholder="请输入任务名称" />
        </el-form-item>
        
        <el-form-item label="共识算法" prop="consensus">
          <el-select v-model="newTask.consensus" placeholder="选择共识算法" style="width: 100%">
            <el-option label="tPBFT" value="tPBFT">
              <span>tPBFT</span>
              <span style="color: var(--el-text-color-secondary); float: right">推荐</span>
            </el-option>
            <el-option label="PBFT" value="PBFT" />
            <el-option label="Raft" value="Raft" />
            <el-option label="HotStuff" value="HotStuff" />
          </el-select>
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="节点数量" prop="nodeCount">
              <el-input-number 
                v-model="newTask.nodeCount" 
                :min="10" 
                :max="200" 
                :step="10"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交易速率" prop="txRate">
              <el-input-number 
                v-model="newTask.txRate" 
                :min="100" 
                :max="10000" 
                :step="100"
                style="width: 100%"
              >
                <template #append>tx/s</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="持续时间" prop="duration">
              <el-input-number 
                v-model="newTask.duration" 
                :min="1" 
                :max="1440" 
                style="width: 100%"
              >
                <template #append>分钟</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交易大小" prop="txSize">
              <el-input-number 
                v-model="newTask.txSize" 
                :min="256" 
                :max="4096" 
                :step="256"
                style="width: 100%"
              >
                <template #append>Bytes</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="负载类型" prop="loadType">
          <el-radio-group v-model="newTask.loadType">
            <el-radio label="constant">恒定负载</el-radio>
            <el-radio label="burst">突发负载</el-radio>
            <el-radio label="gradual">渐增负载</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="启用反操纵" prop="antiManipulation">
          <el-switch v-model="newTask.antiManipulation" />
          <span style="margin-left: 10px; color: var(--el-text-color-secondary);">
            启用高频交易操纵检测策略
          </span>
        </el-form-item>

        <el-form-item label="任务描述">
          <el-input 
            v-model="newTask.description" 
            type="textarea" 
            :rows="3"
            placeholder="选填:任务说明或备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createTask">创建任务</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, VideoPlay, VideoPause, Delete, Search, Close, View, 
  CopyDocument 
} from '@element-plus/icons-vue'
import { useBenchmarkStore } from '@/store/modules/benchmark'
import type { BenchmarkTask } from '@/types/benchmark'

const store = useBenchmarkStore()
const { tasks, isLoading: loading } = storeToRefs(store)

// 状态数据
const searchQuery = ref('')
const taskFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(20)
const totalTasks = ref(0)
const selectedTasks = ref<BenchmarkTask[]>([])
const showCreateDialog = ref(false)
const taskFormRef = ref()

// 新任务数据
const newTask = ref({
  name: '',
  consensus: 'tPBFT',
  nodeCount: 50,
  txRate: 1000,
  duration: 60,
  txSize: 1024,
  loadType: 'constant',
  antiManipulation: true,
  description: ''
})

// 表单验证规则
const taskRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  consensus: [{ required: true, message: '请选择共识算法', trigger: 'change' }],
  nodeCount: [{ required: true, message: '请设置节点数量', trigger: 'blur' }],
  txRate: [{ required: true, message: '请设置交易速率', trigger: 'blur' }]
}

// 计算属性
const filteredTasks = computed(() => {
  let result = tasks.value
  
  if (taskFilter.value !== 'all') {
    result = result.filter(t => t.status === taskFilter.value)
  }
  
  if (searchQuery.value) {
    result = result.filter(t => 
      t.name.includes(searchQuery.value) || t.id.includes(searchQuery.value)
    )
  }
  
  totalTasks.value = result.length
  return result
})

// 方法
const getConsensusColor = (consensus: string) => {
  const colors: Record<string, string> = {
    'tPBFT': 'success',
    'PBFT': 'warning',
    'Raft': 'info',
    'HotStuff': 'danger'
  }
  return colors[consensus] || 'info'
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    'running': 'success',
    'completed': 'info',
    'waiting': 'warning',
    'failed': 'danger',
    'paused': 'warning'
  }
  return types[status] || 'info'
}

const formatDuration = (minutes: number) => {
  if (minutes >= 60) {
    return `${(minutes / 60).toFixed(1)}小时`
  }
  return `${minutes}分钟`
}

const handleSelectionChange = (selection: BenchmarkTask[]) => {
  selectedTasks.value = selection
}

const createTask = async () => {
  if (!taskFormRef.value) return
  await taskFormRef.value.validate()
  try {
    await store.createTask(newTask.value)
    ElMessage.success('任务创建成功')
    showCreateDialog.value = false
    // Reset form
    newTask.value = {
      name: '',
      consensus: 'tPBFT',
      nodeCount: 50,
      txRate: 1000,
      duration: 60,
      txSize: 1024,
      loadType: 'constant',
      antiManipulation: true,
      description: ''
    }
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

const startTask = async (row: BenchmarkTask) => {
  try {
    await store.startTask(row.id)
    ElMessage.success(`任务 ${row.id} 已启动`)
  } catch (error) {
    ElMessage.error('启动失败')
  }
}

const pauseTask = async (row: BenchmarkTask) => {
  try {
    await store.pauseTask(row.id)
    ElMessage.info(`任务 ${row.id} 已暂停`)
  } catch (error) {
    ElMessage.error('暂停失败')
  }
}

const stopTask = (row: BenchmarkTask) => {
  ElMessageBox.confirm('确定停止该任务吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await store.stopTask(row.id)
      ElMessage.success('任务已停止')
    } catch (error) {
      ElMessage.error('停止失败')
    }
  })
}

const deleteTask = (row: BenchmarkTask) => {
  ElMessageBox.confirm('确定删除该任务吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await store.deleteTask(row.id)
      ElMessage.success('任务已删除')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const viewTaskDetail = (row: BenchmarkTask) => {
  ElMessage.info(`查看任务 ${row.id} 详情`)
}

const duplicateTask = (row: BenchmarkTask) => {
  // Logic to duplicate task
  // For now just show message
  ElMessage.success(`已复制任务 ${row.id}`)
}

const batchStart = async () => {
  try {
    // Implement batch start in store if needed, or loop
    for (const task of selectedTasks.value) {
      if (task.status === 'waiting' || task.status === 'paused') {
        await store.startTask(task.id)
      }
    }
    ElMessage.success(`批量启动 ${selectedTasks.value.length} 个任务`)
  } catch (error) {
    ElMessage.error('批量启动失败')
  }
}

const batchStop = async () => {
  try {
    for (const task of selectedTasks.value) {
      if (task.status === 'running') {
        await store.stopTask(task.id)
      }
    }
    ElMessage.success('批量停止完成')
  } catch (error) {
    ElMessage.error('批量停止失败')
  }
}

const batchDelete = () => {
  ElMessageBox.confirm(`确定删除选中的 ${selectedTasks.value.length} 个任务吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      for (const task of selectedTasks.value) {
        await store.deleteTask(task.id)
      }
      ElMessage.success('批量删除完成')
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  })
}

onMounted(() => {
  store.loadTasks()
})
</script>
<style scoped>
.stress-test-page {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

@media (max-width: 992px) {
  .mb-4-mobile {
    margin-bottom: 16px;
  }
  .action-buttons .el-button {
    margin-bottom: 8px;
    margin-left: 0 !important;
    margin-right: 8px;
  }
}

.table-card {
  box-shadow: var(--ios-shadow-2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.metrics-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.fixed-operation-column) {
  background-color: var(--ios-bg-primary) !important;
}
</style>
