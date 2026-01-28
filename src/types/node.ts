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
  latency: number // ms
  bandwidth: number // Mbps
  cpuUsage: number // %
  memoryUsage: number // %
  lastHeartbeat: string // ISO datetime
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
  consensusParticipation: number // %
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
