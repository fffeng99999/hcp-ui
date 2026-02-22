/**
 * 节点状态
 */
export type NodeStatus = 'online' | 'offline' | 'faulty' | 'initializing'

/**
 * 节点信息
 */
export interface Node {
  id: string
  name: string
  address: string
  port: number
  status: NodeStatus
  latency: number // 网络延迟（毫秒 ms）
  bandwidth: number // 网络带宽（Mbps）
  cpuUsage: number // CPU 使用率（百分比）
  memoryUsage: number // 内存使用率（百分比）
  lastHeartbeat: string // 最近一次心跳时间（ISO 时间字符串）
  consensusRole: 'leader' | 'validator' | 'observer'
  joinedAt: string
  version: string
}

/**
 * 节点注册请求
 */
export interface NodeRegistrationRequest {
  name: string
  address: string
  port: number
  consensusRole: 'leader' | 'validator' | 'observer'
}

/**
 * 节点详情
 */
export interface NodeDetail extends Node {
  transactions: number
  blocksValidated: number
  consensusParticipation: number // 共识参与度（百分比）
  networkLatencyStats: {
    min: number
    max: number
    avg: number
  }
}

/**
 * 节点统计
 */
export interface NodeStats {
  totalNodes: number
  onlineNodes: number
  offlineNodes: number
  faultyNodes: number
  averageLatency: number
  averageBandwidth: number
}

/**
 * 节点健康状态
 */
export interface NodeHealthStatus {
  nodeId: string
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkLatency: number
  status: 'healthy' | 'warning' | 'critical'
}
