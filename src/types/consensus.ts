import type { PerformanceMetrics } from './performance'
/**
 * 共识算法类型
 */
export type ConsensusAlgorithmType = 'tPBFT' | 'PBFT' | 'HotStuff' | 'Leios'

/**
 * 共识算法定义
 */
export interface ConsensusAlgorithm {
  id: ConsensusAlgorithmType
  name: string
  description: string
  category: 'BFT-based' | 'Modern'
}

/**
 * tPBFT 参数
 */
export interface TPBFTParameters {
  f: number
  nodeSelectionMethod: 'equity' | 'random' | 'fixed'
  hashVerification: boolean
  maxRound: number
}

/**
 * PBFT 参数
 */
export interface PBFTParameters {
  f: number
  nodeSelectionMethod: 'fixed'
  hashVerification: boolean
  maxRound: number
}

/**
 * HotStuff 参数
 */
export interface HotStuffParameters {
  f: number
  pipelineDepth: number
  commitCertificateLevel: number
}

/**
 * Leios 参数
 */
export interface LeiosParameters {
  fI: number
  fE: number
  sliceLength: number
  pipelineLength: number
}

/**
 * 统一共识参数类型
 */
export type ConsensusParameters = 
  | TPBFTParameters 
  | PBFTParameters 
  | HotStuffParameters 
  | LeiosParameters

/**
 * 共识配置
 */
export interface ConsensusConfig {
  currentAlgorithm: ConsensusAlgorithmType
  parameters: Record<ConsensusAlgorithmType, any>
  isActive: boolean
  lastUpdated: string
}

/**
 * 基准测试配置
 */
export interface BenchmarkConfig {
  algorithmId: ConsensusAlgorithmType
  parameters: ConsensusParameters
  duration: number // 秒
  transactionRate: number // tps
  nodeCount: number
  faultInjectionConfig?: FaultInjectionConfig
}

/**
 * 基准测试结果
 */
export interface BenchmarkResult {
  benchmarkId: string
  algorithmId: ConsensusAlgorithmType
  parameters: ConsensusParameters
  startTime: string
  endTime: string
  duration: number
  metrics: PerformanceMetrics
  status: 'running' | 'completed' | 'failed'
}

/**
 * 故障注入配置
 */
export interface FaultInjectionConfig {
  type: 'latency' | 'packet_loss' | 'byzantine' | 'node_crash'
  severity: number // 0-100
  affectedNodes: string[]
  duration: number // 秒
}
