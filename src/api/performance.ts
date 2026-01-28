import http from './http'
import type { PerformanceMetrics, PerformanceHistory, PerformanceSummary } from '@/types'

/**
 * 获取当前性能指标
 */
export const getMetrics = (): Promise<PerformanceMetrics> =>
  http.get('/performance/metrics')

/**
 * 获取性能历史记录
 */
export const getHistory = (params: {
  startTime?: string
  endTime?: string
  limit?: number
}): Promise<PerformanceHistory[]> =>
  http.get('/performance/history', { params })

/**
 * 获取详细性能指标
 */
export const getDetailedMetrics = (): Promise<PerformanceMetrics> =>
  http.get('/performance/detailed')

/**
 * 获取性能摘要
 */
export const getPerformanceSummary = (params: {
  startTime: string
  endTime: string
}): Promise<PerformanceSummary> =>
  http.get('/performance/summary', { params })

/**
 * 导出性能数据
 */
export const exportMetrics = (format: 'csv' | 'json' | 'excel'): Promise<Blob> =>
  http.post('/performance/export', { format }, { responseType: 'blob' })

/**
 * 清空性能数据
 */
export const clearMetrics = (): Promise<void> =>
  http.post('/performance/clear')
