import http from './http'
import type { PerformanceSummary } from '@/types'

/**
 * 获取性能摘要
 */
export const getPerformanceSummary = (params: {
  startTime: string
  endTime: string
}): Promise<PerformanceSummary> =>
  http.get('/analysis/summary', { params })

/**
 * 获取算法对比
 */
export const getAlgorithmComparison = (params?: {
  startTime?: string
  endTime?: string
}): Promise<any> =>
  http.get('/analysis/comparison', { params })

/**
 * 生成报告
 */
export const generateReport = (config: {
  title: string
  content: string
  format: 'pdf' | 'docx'
}): Promise<Blob> =>
  http.post('/analysis/report/generate', config, { responseType: 'blob' })

/**
 * 导出数据
 */
export const exportData = (params: {
  format: 'csv' | 'json' | 'excel'
  dataType: 'performance' | 'transactions' | 'nodes'
  startTime?: string
  endTime?: string
}): Promise<Blob> =>
  http.post('/analysis/export', params, { responseType: 'blob' })

/**
 * 获取趋势分析
 */
export const getTrendAnalysis = (params: {
  metric: string
  period: string // '1h' | '1d' | '1w'
}): Promise<any> =>
  http.get('/analysis/trends', { params })
