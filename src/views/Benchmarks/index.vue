<template>
  <div class="stress-test-page">
    <!-- 顶部操作栏 -->
    <BaseCard class="header-card">
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
    </BaseCard>

    <!-- 任务列表 -->
    <BaseCard class="table-card" title="压测任务列表">
      <template #actions>
        <BaseSegmentedControl
          v-model="taskFilter"
          :options="filterOptions"
        />
      </template>

      <BaseTable
        :data="filteredTasks"
        :config="tableConfig"
        :loading="loading"
        selection
        @selection-change="handleSelectionChange"
        @start="startTask"
        @pause="pauseTask"
        @stop="stopTask"
        @view="viewTaskDetail"
        @duplicate="duplicateTask"
        @delete="deleteTask"
      >
        <template #name="{ row }">
          <span style="font-weight: 600; color: var(--ios-blue); cursor: pointer" @click="viewTaskDetail(row)">
            {{ row.name }}
          </span>
        </template>
        
        <template #consensus="{ row }">
          <el-tag :type="getConsensusColor(row.consensus)" effect="light" round>
            {{ row.consensus }}
          </el-tag>
        </template>

        <template #duration="{ row }">
          {{ formatDuration(row.duration) }}
        </template>

        <template #status="{ row }">
          <el-tag :type="getStatusType(row.status)" effect="light" round>
            {{ row.status }}
          </el-tag>
        </template>

        <template #progress="{ row }">
          <el-progress 
            :percentage="row.progress" 
            :status="row.status === '失败' ? 'exception' : undefined"
            :stroke-width="6"
          />
        </template>

        <template #metrics="{ row }">
          <div class="metrics-cell">
            <span>TPS: <strong>{{ row.currentTps || '-' }}</strong></span>
            <span>延迟: <strong>{{ row.currentLatency || '-' }}ms</strong></span>
          </div>
        </template>
      </BaseTable>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalTasks"
        />
      </div>
    </BaseCard>

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
  Plus, VideoPlay, VideoPause, Delete, Search
} from '@element-plus/icons-vue'
import { useBenchmarkStore } from '@/store/modules/benchmark'
import type { BenchmarkTask } from '@/types/benchmark'
import { benchmarksTasksTable as tableConfig } from '@/config/tables/benchmarksTasks'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseSegmentedControl from '@/components/common/BaseSegmentedControl.vue'

const store = useBenchmarkStore()
const { tasks, isLoading: loading } = storeToRefs(store)

// 状态数据
const searchQuery = ref('')
const taskFilter = ref('all')
const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '运行中', value: 'running' },
  { label: '已完成', value: 'completed' },
  { label: '失败', value: 'failed' }
]
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

const taskRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  consensus: [{ required: true, message: '请选择共识算法', trigger: 'change' }],
  nodeCount: [{ required: true, message: '请输入节点数量', trigger: 'blur' }],
  txRate: [{ required: true, message: '请输入交易速率', trigger: 'blur' }]
}

// 计算属性
const filteredTasks = computed(() => {
  let result = tasks.value || []
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(t => 
      t.id.toLowerCase().includes(query) || 
      t.name.toLowerCase().includes(query)
    )
  }
  
  // 状态过滤
  if (taskFilter.value !== 'all') {
    if (taskFilter.value === 'running') {
      result = result.filter(t => ['running', 'waiting', 'paused'].includes(t.status))
    } else {
      result = result.filter(t => t.status === (taskFilter.value === 'completed' ? 'completed' : 'failed'))
    }
  }
  
  // 分页
  totalTasks.value = result.length
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return result.slice(start, end)
})

// 方法
const handleSelectionChange = (selection: BenchmarkTask[]) => {
  selectedTasks.value = selection
}

const getConsensusColor = (consensus: string) => {
  const colors: Record<string, string> = {
    'tPBFT': 'success',
    'PBFT': 'primary',
    'Raft': 'warning',
    'HotStuff': 'danger'
  }
  return colors[consensus] || 'info'
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    'running': 'primary',
    'waiting': 'info',
    'paused': 'warning',
    'completed': 'success',
    'failed': 'danger'
  }
  return types[status] || 'info'
}

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
}

// 任务操作
const createTask = async () => {
  if (!taskFormRef.value) return
  await taskFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await store.createTask(newTask.value)
        showCreateDialog.value = false
        ElMessage.success('创建任务成功')
        // 重置表单
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
      } catch (e) {
        ElMessage.error('创建任务失败')
      }
    }
  })
}

const startTask = async (row: BenchmarkTask) => {
  try {
    await store.startTask(row.id)
    ElMessage.success(`任务 ${row.name} 已启动`)
  } catch (e) {
    ElMessage.error('启动失败')
  }
}

const pauseTask = async (row: BenchmarkTask) => {
  try {
    await store.pauseTask(row.id)
    ElMessage.warning(`任务 ${row.name} 已暂停`)
  } catch (e) {
    ElMessage.error('暂停失败')
  }
}

const stopTask = async (row: BenchmarkTask) => {
  ElMessageBox.confirm(`确定停止任务 ${row.name} 吗?`, '警告', { type: 'warning' })
    .then(async () => {
      try {
        await store.stopTask(row.id)
        ElMessage.success(`任务 ${row.name} 已停止`)
      } catch (e) {
        ElMessage.error('停止失败')
      }
    })
}

const deleteTask = async (row: BenchmarkTask) => {
  ElMessageBox.confirm(`确定删除任务 ${row.name} 吗?`, '警告', { type: 'warning' })
    .then(async () => {
      try {
        await store.deleteTask(row.id)
        ElMessage.success('任务已删除')
      } catch (e) {
        ElMessage.error('删除失败')
      }
    })
}

const duplicateTask = (row: BenchmarkTask) => {
  newTask.value = {
    ...newTask.value,
    name: `${row.name}_copy`,
    consensus: row.consensus,
    nodeCount: row.nodeCount,
    txRate: row.txRate,
    duration: row.duration,
    txSize: row.txSize || 1024,
    loadType: row.loadType || 'constant',
    antiManipulation: row.antiManipulation || false,
    description: row.description || ''
  }
  showCreateDialog.value = true
}

const viewTaskDetail = (row: BenchmarkTask) => {
  // TODO: 跳转到详情页
  ElMessage.info(`查看任务 ${row.id} 详情`)
}

// 批量操作
const batchStart = async () => {
  try {
    await Promise.all(selectedTasks.value.map(t => store.startTask(t.id)))
    ElMessage.success(`已启动 ${selectedTasks.value.length} 个任务`)
    selectedTasks.value = []
  } catch (e) {
    ElMessage.error('批量启动部分失败')
  }
}

const batchStop = async () => {
  try {
    await Promise.all(selectedTasks.value.map(t => store.stopTask(t.id)))
    ElMessage.success(`已停止 ${selectedTasks.value.length} 个任务`)
    selectedTasks.value = []
  } catch (e) {
    ElMessage.error('批量停止部分失败')
  }
}

const batchDelete = async () => {
  ElMessageBox.confirm(`确定删除选中的 ${selectedTasks.value.length} 个任务吗?`, '警告', { type: 'warning' })
    .then(async () => {
      try {
        await Promise.all(selectedTasks.value.map(t => store.deleteTask(t.id)))
        ElMessage.success('批量删除成功')
        selectedTasks.value = []
      } catch (e) {
        ElMessage.error('批量删除失败')
      }
    })
}

onMounted(() => {
  store.loadTasks()
})
</script>

<style lang="scss" scoped>
.stress-test-page {
  .header-card {
    margin-bottom: 24px;
    
    .action-row {
      padding: 12px 0;
    }
  }

  .table-card {
    .metrics-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      
      strong {
        color: var(--el-text-color-primary);
      }
    }
    
    .pagination-container {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
    }
  }
}

// iOS Design overrides
.ios-search {
  :deep(.el-input__wrapper) {
    border-radius: 20px;
    background-color: var(--ios-bg-secondary);
    box-shadow: none !important;
    padding-left: 16px;
    
    &.is-focus {
      background-color: var(--ios-bg-primary);
      box-shadow: 0 0 0 1px var(--ios-blue) !important;
    }
  }
}

.ios-radio-group {
  :deep(.el-radio-button__inner) {
    border: none;
    background: transparent;
    padding: 8px 16px;
    border-radius: 16px;
    margin-right: 8px;
    box-shadow: none !important;
    color: var(--el-text-color-regular);
    
    &:hover {
      color: var(--ios-blue);
    }
  }
  
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: var(--ios-blue-light);
    color: var(--ios-blue);
    font-weight: 600;
  }
}

.mb-4-mobile {
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
}
</style>
