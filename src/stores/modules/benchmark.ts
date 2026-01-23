import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { benchmarkApi } from '../../api/modules/benchmark'
import type { BenchmarkTask, PaginatedResponse } from '../../types'

export const useBenchmarkStore = defineStore('benchmark', () => {
  const tasks = ref<BenchmarkTask[]>([])
  const currentTask = ref<BenchmarkTask | null>(null)
  const loading = ref(false)
  const paginationData = ref<Partial<PaginatedResponse<BenchmarkTask>>>({
    total: 0,
    page: 1,
    pageSize: 10,
    hasMore: false
  })

  const fetchTasks = async (page = 1, pageSize = 10) => {
    loading.value = true
    try {
      const response = await benchmarkApi.getTaskList(page, pageSize)
      tasks.value = response.items
      paginationData.value = response
    } finally {
      loading.value = false
    }
  }

  const fetchTaskDetail = async (id: string) => {
    try {
      currentTask.value = await benchmarkApi.getTaskDetail(id)
    } catch (error) {
      console.error('Failed to fetch task detail:', error)
    }
  }

  const createTask = async (data: Partial<BenchmarkTask>) => {
    const newTask = await benchmarkApi.createTask(data)
    tasks.value.unshift(newTask)
    return newTask
  }

  const updateTask = async (id: string, data: Partial<BenchmarkTask>) => {
    const updatedTask = await benchmarkApi.updateTask(id, data)
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
    }
    if (currentTask.value?.id === id) {
      currentTask.value = updatedTask
    }
    return updatedTask
  }

  const deleteTask = async (id: string) => {
    await benchmarkApi.deleteTask(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  const startTask = async (id: string) => {
    await benchmarkApi.startTask(id)
    const task = tasks.value.find(t => t.id === id)
    if (task) task.status = 'running'
    if (currentTask.value?.id === id) {
      currentTask.value.status = 'running'
    }
  }

  const stopTask = async (id: string) => {
    await benchmarkApi.stopTask(id)
    const task = tasks.value.find(t => t.id === id)
    if (task) task.status = 'completed'
    if (currentTask.value?.id === id) {
      currentTask.value.status = 'completed'
    }
  }

  const runningTasks = computed(() => tasks.value.filter(t => t.status === 'running'))
  const completedTasks = computed(() => tasks.value.filter(t => t.status === 'completed'))

  return {
    tasks,
    currentTask,
    loading,
    paginationData,
    runningTasks,
    completedTasks,
    fetchTasks,
    fetchTaskDetail,
    createTask,
    updateTask,
    deleteTask,
    startTask,
    stopTask
  }
})
