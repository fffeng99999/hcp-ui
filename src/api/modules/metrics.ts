import axiosInstance from '../axiosInstance'
import { endpoints } from '../config'
import type {
  HistoricalMetrics,
  MetricsFilter,
  MetricsComparison,
  PaginatedResponse,
  ApiResponse
} from '../../types'

export const metricsApi = {
  getHistoricalMetrics: async (
    filter: MetricsFilter,
    page = 1
  ): Promise<PaginatedResponse<HistoricalMetrics>> => {
    const response = await axiosInstance.get<
      ApiResponse<PaginatedResponse<HistoricalMetrics>>
    >(endpoints.METRICS_HISTORICAL, {
      params: { ...filter, page }
    })
    return response.data
  },

  compareMetrics: async (taskIds: string[]): Promise<MetricsComparison[]> => {
    const response = await axiosInstance.post<ApiResponse<MetricsComparison[]>>(
      endpoints.METRICS_COMPARE,
      { taskIds }
    )
    return response.data
  },

  exportMetrics: async (
    filter: MetricsFilter,
    format: 'csv' | 'json' = 'csv'
  ): Promise<Blob> => {
    const response = await axiosInstance.get(endpoints.METRICS_EXPORT, {
      params: { ...filter, format },
      responseType: 'blob'
    })
    return response
  }
}
