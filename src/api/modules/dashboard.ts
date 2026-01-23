import axiosInstance from '../axiosInstance'
import { endpoints } from '../config'
import type { Metrics, TrendData, Alert, ApiResponse } from '../../types'

export const dashboardApi = {
  getMetrics: async (): Promise<Metrics> => {
    const response = await axiosInstance.get<ApiResponse<Metrics>>(
      endpoints.DASHBOARD_METRICS
    )
    return response.data
  },

  getTrends: async (timeRange: 'hour' | 'day' | 'week' = 'hour'): Promise<TrendData[]> => {
    const response = await axiosInstance.get<ApiResponse<TrendData[]>>(
      endpoints.DASHBOARD_TRENDS,
      { params: { timeRange } }
    )
    return response.data
  },

  getAlerts: async (): Promise<Alert[]> => {
    const response = await axiosInstance.get<ApiResponse<Alert[]>>(
      endpoints.DASHBOARD_ALERTS
    )
    return response.data
  },

  dismissAlert: async (alertId: string): Promise<void> => {
    await axiosInstance.post(`${endpoints.DASHBOARD_ALERTS}/${alertId}/dismiss`)
  }
}
