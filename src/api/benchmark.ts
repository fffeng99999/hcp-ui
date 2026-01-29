import http from './http'
import type { BenchmarkTask, CreateBenchmarkParams } from '@/types/benchmark'

export const getTasks = (params?: any): Promise<BenchmarkTask[]> =>
  http.get('/benchmarks', { params })

export const createTask = (data: CreateBenchmarkParams): Promise<BenchmarkTask> =>
  http.post('/benchmarks', data)

export const startTask = (id: string): Promise<void> =>
  http.post(`/benchmarks/${id}/start`)

export const stopTask = (id: string): Promise<void> =>
  http.post(`/benchmarks/${id}/stop`)

export const pauseTask = (id: string): Promise<void> =>
  http.post(`/benchmarks/${id}/pause`)

export const deleteTask = (id: string): Promise<void> =>
  http.delete(`/benchmarks/${id}`)

export const getTaskDetail = (id: string): Promise<BenchmarkTask> =>
  http.get(`/benchmarks/${id}`)
