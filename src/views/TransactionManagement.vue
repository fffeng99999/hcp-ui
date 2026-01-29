<template>
  <div class="stress-test-page">
    <!-- 顶部操作栏 -->
    <el-card class="header-card">
      <el-row :gutter="16" align="middle">
        <el-col :span="18">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon> 创建压测任务
          </el-button>
          <el-button @click="batchStart" :disabled="selectedTasks.length === 0">
            <el-icon><VideoPlay /></el-icon> 批量启动
          </el-button>
          <el-button @click="batchStop" :disabled="selectedTasks.length === 0">
            <el-icon><VideoPause /></el-icon> 批量停止
          </el-button>
          <el-button type="danger" @click="batchDelete" :disabled="selectedTasks.length === 0">
            <el-icon><Delete /></el-icon> 批量删除
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-input v-model="searchQuery" placeholder="搜索任务名称或ID" clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </el-card>

    <!-- 任务列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>压测任务列表</span>
          <div class="header-actions">
            <el-radio-group v-model="taskFilter" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="running">运行中</el-radio-button>
              <el-radio-button label="completed">已完成</el-radio-button>
              <el-radio-button label="failed">失败</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <el-table 
        :data="filteredTasks" 
        @selection-change="handleSelectionChange"
        stripe
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="任务ID" width="120" />
        <el-table-column prop="name" label="任务名称" width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="viewTaskDetail(row)">
              {{ row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="consensus" label="共识算法" width="120">
          <template #default="{ row }">
            <el-tag :type="getConsensusColor(row.consensus)">
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
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.progress" 
              :status="row.status === '失败' ? 'exception' : undefined"
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
        <el-table-column label="操作" fixed="right" width="260">
          <template #default="{ row }">
            <el-button-group size="small">
              <el-button 
                v-if="row.status === '等待中'" 
                type="success" 
                @click="startTask(row)"
              >
                <el-icon><VideoPlay /></el-icon>
              </el-button>
              <el-button 
                v-if="row.status === '运行中'" 
                type="warning" 
                @click="pauseTask(row)"
              >
                <el-icon><VideoPause /></el-icon>
              </el-button>
              <el-button 
                v-if="row.status === '运行中' || row.status === '暂停'" 
                type="danger" 
                @click="stopTask(row)"
              >
                <el-icon><Close /></el-icon>
              </el-button>
              <el-button @click="viewTaskDetail(row)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button @click="duplicateTask(row)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
              <el-button 
                type="danger" 
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
    </el-card>

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
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, VideoPlay, VideoPause, Delete, Search, Close, View, 
  CopyDocument 
} from '@element-plus/icons-vue'

// 状态数据
const loading = ref(false)
const searchQuery = ref('')
const taskFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(20)
const totalTasks = ref(0)
const selectedTasks = ref<any[]>([])
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

// 任务列表
const tasks = ref([
  {
    id: 'TASK-2026012901',
    name: 'tPBFT高频交易压测-50节点',
    consensus: 'tPBFT',
    nodeCount: 50,
    txRate: 1000,
    duration: 60,
    status: '运行中',
    progress: 45,
    currentTps: 1850,
    currentLatency: 328,
    createdAt: '2026-01-29 09:30:00'
  },
  {
    id: 'TASK-2026012802',
    name: 'PBFT基准性能测试',
    consensus: 'PBFT',
    nodeCount: 30,
    txRate: 800,
    duration: 120,
    status: '已完成',
    progress: 100,
    currentTps: 1200,
    currentLatency: 486,
    createdAt: '2026-01-28 14:20:00'
  },
  {
    id: 'TASK-2026012803',
    name: 'Raft共识延迟对比',
    consensus: 'Raft',
    nodeCount: 20,
    txRate: 500,
    duration: 30,
    status: '等待中',
    progress: 0,
    currentTps: null,
    currentLatency: null,
    createdAt: '2026-01-28 16:45:00'
  }
])

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
    const statusMap: Record<string, string> = {
      running: '运行中',
      completed: '已完成',
      failed: '失败'
    }
    result = result.filter(t => t.status === statusMap[taskFilter.value])
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
    '运行中': 'success',
    '已完成': 'info',
    '等待中': 'warning',
    '失败': 'danger',
    '暂停': 'warning'
  }
  return types[status] || 'info'
}

const formatDuration = (minutes: number) => {
  if (minutes >= 60) {
    return `${(minutes / 60).toFixed(1)}小时`
  }
  return `${minutes}分钟`
}

const handleSelectionChange = (selection: any[]) => {
  selectedTasks.value = selection
}

const createTask = async () => {
  await taskFormRef.value?.validate()
  ElMessage.success('任务创建成功')
  showCreateDialog.value = false
}

const startTask = (row: any) => {
  ElMessage.success(`任务 ${row.id} 已启动`)
}

const pauseTask = (row: any) => {
  ElMessage.info(`任务 ${row.id} 已暂停`)
}

const stopTask = (row: any) => {
  ElMessageBox.confirm('确定停止该任务吗?', '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('任务已停止')
  })
}

const deleteTask = (row: any) => {
  ElMessageBox.confirm('确定删除该任务吗?', '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('任务已删除')
  })
}

const viewTaskDetail = (row: any) => {
  ElMessage.info(`查看任务 ${row.id} 详情`)
}

const duplicateTask = (row: any) => {
  ElMessage.success(`已复制任务 ${row.id}`)
}

const batchStart = () => {
  ElMessage.success(`批量启动 ${selectedTasks.value.length} 个任务`)
}

const batchStop = () => {
  ElMessage.warning(`批量停止 ${selectedTasks.value.length} 个任务`)
}

const batchDelete = () => {
  ElMessageBox.confirm(
    `确定删除选中的 ${selectedTasks.value.length} 个任务吗?`, 
    '批量删除', 
    { type: 'warning' }
  ).then(() => {
    ElMessage.success('批量删除成功')
  })
}
</script>

<style scoped>
.stress-test-page {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

.table-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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
</style>
