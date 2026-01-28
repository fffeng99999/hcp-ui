import http from './http'
import type {
  ConsensusAlgorithm,
  ConsensusConfig,
  BenchmarkConfig,
  BenchmarkResult
} from '@/types'

/**
 * 获取支持的共识算法列表
 */
export const getAlgorithms = (): Promise<ConsensusAlgorithm[]> =>
  http.get('/consensus/algorithms')

/**
 * 选择共识算法
 */
export const selectAlgorithm = (
  algorithmId: string,
  parameters: Record<string, any>
): Promise<ConsensusConfig> =>
  http.post('/consensus/select', { algorithmId, parameters })

/**
 * 获取当前共识配置
 */
export const getConfig = (): Promise<ConsensusConfig> =>
  http.get('/consensus/config')

/**
 * 更新参数
 */
export const updateParameter = (
  algorithmId: string,
  paramName: string,
  value: any
): Promise<ConsensusConfig> =>
  http.put('/consensus/parameters', { algorithmId, paramName, value })

/**
 * 启动基准测试
 */
export const startBenchmark = (config: BenchmarkConfig): Promise<{ benchmarkId: string }> =>
  http.post('/consensus/benchmark/start', config)

/**
 * 获取基准测试结果
 */
export const getBenchmarkResult = (benchmarkId: string): Promise<BenchmarkResult> =>
  http.get(`/consensus/benchmark/${benchmarkId}`)

/**
 * 停止基准测试
 */
export const stopBenchmark = (benchmarkId: string): Promise<void> =>
  http.post(`/consensus/benchmark/${benchmarkId}/stop`)

/**
 * 获取所有基准测试历史
 */
export const getBenchmarkHistory = (): Promise<BenchmarkResult[]> =>
  http.get('/consensus/benchmark/history')
