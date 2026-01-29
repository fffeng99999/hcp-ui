import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as benchmarkAPI from '@/api/benchmark'
import type { BenchmarkTask, CreateBenchmarkParams } from '@/types/benchmark'

export const useBenchmarkStore = defineStore('benchmark', () => {
  const tasks = ref<BenchmarkTask[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  async function loadTasks(params?: any): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      tasks.value = await benchmarkAPI.getTasks(params)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load benchmark tasks'
      console.error('Failed to load benchmark tasks:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(data: CreateBenchmarkParams): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      const newTask = await benchmarkAPI.createTask(data)
      tasks.value.unshift(newTask)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create benchmark task'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function startTask(id: string): Promise<void> {
    try {
      await benchmarkAPI.startTask(id)
      const task = tasks.value.find(t => t.id === id)
      if (task) {
        task.status = 'running'
      }
    } catch (err) {
      console.error(`Failed to start task ${id}:`, err)
      throw err
    }
  }

  async function stopTask(id: string): Promise<void> {
    try {
      await benchmarkAPI.stopTask(id)
      const task = tasks.value.find(t => t.id === id)
      if (task) {
        task.status = 'completed' // Or whatever status appropriate for stopped
      }
    } catch (err) {
      console.error(`Failed to stop task ${id}:`, err)
      throw err
    }
  }

  async function pauseTask(id: string): Promise<void> {
    try {
      await benchmarkAPI.pauseTask(id)
      const task = tasks.value.find(t => t.id === id)
      if (task) {
        task.status = 'paused'
      }
    } catch (err) {
      console.error(`Failed to pause task ${id}:`, err)
      throw err
    }
  }

  async function deleteTask(id: string): Promise<void> {
    try {
      await benchmarkAPI.deleteTask(id)
      tasks.value = tasks.value.filter(t => t.id !== id)
    } catch (err) {
      console.error(`Failed to delete task ${id}:`, err)
      throw err
    }
  }

  return {
    tasks,
    isLoading,
    error,
    loadTasks,
    createTask,
    startTask,
    stopTask,
    pauseTask,
    deleteTask
  }
})
