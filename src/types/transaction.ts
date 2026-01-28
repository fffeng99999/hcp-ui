/**
 * 交易状态
 */
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled'

/**
 * 交易
 */
export interface Transaction {
  id: string
  from: string
  to: string
  value: string
  data?: string
  status: TransactionStatus
  timestamp: string
  confirmedAt?: string
  blockHeight?: number
  gasUsed?: number
  gasPrice?: string
  nonce: number
}

/**
 * 交易提交请求
 */
export interface TransactionSubmitRequest {
  count: number // 批量提交数量
  rate: number // tps
  size: number // 字节
  pattern: 'sequential' | 'random' | 'hotspot'
}

/**
 * 交易统计
 */
export interface TransactionStats {
  totalTransactions: number
  pendingTransactions: number
  confirmedTransactions: number
  failedTransactions: number
  confirmationRate: number // %
  averageConfirmationTime: number // ms
  averageGasUsed: number
}

/**
 * 交易详情
 */
export interface TransactionDetail extends Transaction {
  inputData: string
  outputData?: string
  gasLimit: string
  transactionFee: string
  confirmations: number
  relatedTransactions: string[]
}

/**
 * 交易状态更新事件
 */
export interface TransactionStatusUpdateEvent {
  transactionId: string
  oldStatus: TransactionStatus
  newStatus: TransactionStatus
  timestamp: string
}
