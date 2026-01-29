/**
 * 性能指标
 */
export interface PerformanceMetrics {
  tps: number // transactions per second
  latency: number // ms
  throughput: number // bytes per second
  blockTime: number // ms
  timestamp: string // ISO datetime
  cpuUsage: number // %
  memoryUsage: number // %
  networkBandwidth: number // Mbps
}

/**
 * 性能历史记录
 */
export interface PerformanceHistory extends PerformanceMetrics {
  id: string
  period: string // 时间区间标识
}

/**
 * 性能摘要
 */
export interface PerformanceSummary {
  timeRange: {
    start: string
    end: string
  }
  metrics: {
    avgTps: number
    maxTps: number
    minTps: number
    avgLatency: number
    minLatency: number
    maxLatency: number
    avgThroughput: number
    avgBlockTime: number
  }
}

/**
 * WebSocket 消息
 */
export interface WebSocketMessage<T = any> {
  type: 'metrics' | 'status' | 'error' | 'event'
  timestamp: string
  data: T
}

export interface AlgorithmComparisonData {
  algorithm: string
  data: {
    nodeCount: number
    tps: number
    latency: number
  }[]
}

export interface PerformanceLimitData {
  nodeCount: number
  actualTps: number
  theoreticalTps: number
}
