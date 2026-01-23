import axiosInstance from '../axiosInstance'
import { endpoints } from '../config'
import type { BenchmarkTask, PaginatedResponse, ApiResponse } from '../../types'

export const benchmarkApi = {
  getTaskList: async (page = 1, pageSize = 10): Promise<PaginatedResponse<BenchmarkTask>> => {
    const response = await axiosInstance.get<
      ApiResponse<PaginatedResponse<BenchmarkTask>>
    >(endpoints.BENCHMARKS, {
      params: { page, pageSize }
    })
    return response.data
  },

  getTaskDetail: async (id: string): Promise<BenchmarkTask> => {
    const response = await axiosInstance.get<ApiResponse<BenchmarkTask>>(
      endpoints.BENCHMARK_DETAIL.replace(':id', id)
    )
    return response.data
  },

  createTask: async (data: Partial<BenchmarkTask>): Promise<BenchmarkTask> => {
    const response = await axiosInstance.post<ApiResponse<BenchmarkTask>>(
      endpoints.BENCHMARKS,
      data
    )
    return response.data
  },

  updateTask: async (id: string, data: Partial<BenchmarkTask>): Promise<BenchmarkTask> => {
    const response = await axiosInstance.patch<ApiResponse<BenchmarkTask>>(
      endpoints.BENCHMARK_DETAIL.replace(':id', id),
      data
    )
    return response.data
  },

  deleteTask: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.BENCHMARK_DETAIL.replace(':id', id))
  },

  startTask: async (id: string): Promise<void> => {
    await axiosInstance.post(endpoints.BENCHMARK_START.replace(':id', id))
  },

  stopTask: async (id: string): Promise<void> => {
    await axiosInstance.post(endpoints.BENCHMARK_STOP.replace(':id', id))
  }
}
