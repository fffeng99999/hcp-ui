import http from './http'
import type {
  Transaction,
  TransactionSubmitRequest,
  TransactionStats,
  TransactionDetail
} from '@/types'

/**
 * 提交交易
 */
export const submitTransactions = (
  request: TransactionSubmitRequest
): Promise<{ transactionIds: string[] }> =>
  http.post('/transactions/submit', request)

/**
 * 获取交易详情
 */
export const getTransactionDetail = (txId: string): Promise<TransactionDetail> =>
  http.get(`/transactions/${txId}`)

/**
 * 获取待处理交易列表
 */
export const getPendingTransactions = (): Promise<Transaction[]> =>
  http.get('/transactions/pending')

/**
 * 获取已确认交易列表
 */
export const getConfirmedTransactions = (): Promise<Transaction[]> =>
  http.get('/transactions/confirmed')

/**
 * 获取交易统计
 */
export const getTransactionStats = (): Promise<TransactionStats> =>
  http.get('/transactions/stats')

/**
 * 取消交易
 */
export const cancelTransaction = (txId: string): Promise<void> =>
  http.post(`/transactions/${txId}/cancel`)

/**
 * 查询交易
 */
export const queryTransactions = (params: {
  status?: string
  from?: string
  to?: string
  limit?: number
  offset?: number
}): Promise<Transaction[]> =>
  http.get('/transactions/query', { params })
