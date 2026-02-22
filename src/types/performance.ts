/**
 * 性能指标
 */
export interface PerformanceMetrics {
  tps: number // 每秒交易数（transactions per second）
  latency: number // 请求延迟（毫秒 ms）
  throughput: number // 吞吐量（每秒字节数 bytes/s）
  blockTime: number // 区块出块时间（毫秒 ms）
  timestamp: string // 指标采集时间（ISO 时间字符串）
  cpuUsage: number // CPU 使用率（百分比）
  memoryUsage: number // 内存使用率（百分比）
  networkBandwidth: number // 网络带宽（Mbps）
}

/**
 * 性能历史记录
 */
export interface PerformanceHistory extends PerformanceMetrics {
  id: string
  period: string // 时间区间标识（例如 1m、5m、1h）
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
