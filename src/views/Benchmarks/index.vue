<template>
  <div class="benchmarks-container">
    <div class="page-header">
      <h1>压测任务管理</h1>
      <button class="btn btn-primary" @click="showCreateForm = true">
        ➕ 新建任务
      </button>
    </div>

    <!-- 创建/编辑表单模态 -->
    <div v-if="showCreateForm" class="modal-overlay" @click="showCreateForm = false">
      <div class="modal-content" @click.stop>
        <TaskForm
          :task="editingTask"
          @success="handleFormSuccess"
          @cancel="showCreateForm = false"
        />
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="card">
      <div class="card-header">
        <h2>任务列表</h2>
        <div class="list-filters">
          <select v-model="filterStatus" class="filter-select">
            <option value="">全部状态</option>
            <option value="pending">待启动</option>
            <option value="running">运行中</option>
            <option value="completed">已完成</option>
            <option value="failed">失败</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>任务名称</th>
              <th>共识算法</th>
              <th>节点数</th>
              <th>目标 TPS</th>
              <th>状态</th>
              <th>进度</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in filteredTasks" :key="task.id">
              <td>
                <router-link :to="`/benchmarks/${task.id}`" class="link">
                  {{ task.name }}
                </router-link>
              </td>
              <td>
                <span class="badge badge-primary">{{ task.consensus }}</span>
              </td>
              <td>{{ task.nodeCount }}</td>
              <td>{{ task.transactionRate }}</td>
              <td>
                <span :class="`badge badge-${getStatusColor(task.status)}`">
                  {{ getStatusText(task.status) }}
                </span>
              </td>
              <td>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: task.progress + '%' }"></div>
                </div>
              </td>
              <td>{{ formatDate(task.createdAt) }}</td>
              <td>
                <div class="actions">
                  <button
                    v-if="task.status === 'pending' || task.status === 'completed'"
                    @click="benchmarkStore.startTask(task.id)"
                    class="btn btn-sm btn-success"
                  >
                    启动
                  </button>
                  <button
                    v-if="task.status === 'running'"
                    @click="benchmarkStore.stopTask(task.id)"
                    class="btn btn-sm btn-danger"
                  >
                    停止
                  </button>
                  <button
                    @click="editTask(task)"
                    class="btn btn-sm btn-secondary"
                  >
                    编辑
                  </button>
                  <button
                    @click="benchmarkStore.deleteTask(task.id)"
                    class="btn btn-sm btn-danger"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="btn btn-secondary"
        >
          上一页
        </button>
        <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button
          @click="nextPage"
          :disabled="!benchmarkStore.paginationData.hasMore"
          class="btn btn-secondary"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBenchmarkStore } from '../../stores/modules/benchmark'
import TaskForm from './TaskForm.vue'
import type { BenchmarkTask } from '../../types'

const benchmarkStore = useBenchmarkStore()
const showCreateForm = ref(false)
const editingTask = ref<BenchmarkTask | null>(null)
const filterStatus = ref('')
const currentPage = ref(1)

const filteredTasks = computed(() => {
  if (!filterStatus.value) return benchmarkStore.tasks
  return benchmarkStore.tasks.filter(t => t.status === filterStatus.value)
})

const totalPages = computed(() => {
  const total = benchmarkStore.paginationData.total || 0
  const pageSize = benchmarkStore.paginationData.pageSize || 10
  return Math.ceil(total / pageSize)
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'secondary',
    running: 'primary',
    completed: 'success',
    failed: 'danger'
  }
  return colors[status] || 'secondary'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待启动',
    running: '运行中',
    completed: '已完成',
    failed: '失败'
  }
  return texts[status] || status
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const editTask = (task: BenchmarkTask) => {
  editingTask.value = task
  showCreateForm.value = true
}

const handleFormSuccess = () => {
  showCreateForm.value = false
  editingTask.value = null
  benchmarkStore.fetchTasks(currentPage.value)
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    benchmarkStore.fetchTasks(currentPage.value)
  }
}

const nextPage = () => {
  if (benchmarkStore.paginationData.hasMore) {
    currentPage.value++
    benchmarkStore.fetchTasks(currentPage.value)
  }
}

onMounted(() => {
  benchmarkStore.fetchTasks(1)
})
</script>

<style scoped>
.benchmarks-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

/* 表格 */
.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  margin-bottom: 20px;
}

tbody tr:hover {
  background: var(--color-bg-secondary);
}

/* 徽章 */
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-primary {
  background: #e6f0ff;
  color: #0066cc;
}

.badge-success {
  background: #f0fdf4;
  color: #22c55e;
}

.badge-warning {
  background: #fffbeb;
  color: #f59e0b;
}

.badge-danger {
  background: #fef2f2;
  color: #ef4444;
}

/* 进度条 */
.progress-bar {
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

/* 链接 */
.link {
  color: var(--color-primary);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

/* 过滤器 */
.list-filters {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 14px;
}

/* 操作按钮 */
.actions {
  display: flex;
  gap: 6px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  table {
    font-size: 12px;
  }

  .actions {
    flex-wrap: wrap;
  }
}
</style>
