export interface BenchmarkTask {
  id: string
  name: string
  consensus: string
  nodeCount: number
  txRate: number
  duration: number
  txSize: number
  loadType: string
  antiManipulation: boolean
  description?: string
  status: 'waiting' | 'running' | 'completed' | 'failed' | 'paused'
  progress: number
  currentTps?: number
  currentLatency?: number
  createdAt: string
}

export interface CreateBenchmarkParams {
  name: string
  consensus: string
  nodeCount: number
  txRate: number
  duration: number
  txSize: number
  loadType: string
  antiManipulation: boolean
  description?: string
}
