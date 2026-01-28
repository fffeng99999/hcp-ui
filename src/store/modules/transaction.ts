import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as transactionAPI from '@/api/transaction'
import type {
  Transaction,
  TransactionSubmitRequest,
  TransactionStats,
  TransactionStatus
} from '@/types'

export const useTransactionStore = defineStore('transaction', () => {
  const pendingTransactions = ref<Transaction[]>([])
  const confirmedTransactions = ref<Transaction[]>([])
  const failedTransactions = ref<Transaction[]>([])
  const isSubmitting = ref<boolean>(false)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const totalTransactions = computed<number>(() =>
    pendingTransactions.value.length +
    confirmedTransactions.value.length +
    failedTransactions.value.length
  )

  const confirmationRate = computed<number>(() => {
    if (totalTransactions.value === 0) return 0
    return parseFloat(
      ((confirmedTransactions.value.length / totalTransactions.value) * 100).toFixed(2)
    )
  })

  async function submitTransactions(request: TransactionSubmitRequest): Promise<string[]> {
    try {
      isSubmitting.value = true
      error.value = null
      const result = await transactionAPI.submitTransactions(request)
      return result.transactionIds
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to submit transactions'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  async function getTransactionDetail(txId: string): Promise<any> {
    try {
      error.value = null
      return await transactionAPI.getTransactionDetail(txId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get transaction detail'
      throw err
    }
  }

  function updateTransactionStatus(txId: string, newStatus: TransactionStatus): void {
    const allTxs = [
      ...pendingTransactions.value,
      ...confirmedTransactions.value,
      ...failedTransactions.value
    ]

    const tx = allTxs.find(t => t.id === txId)
    if (!tx) return

    // Remove from current array
    pendingTransactions.value = pendingTransactions.value.filter(t => t.id !== txId)
    confirmedTransactions.value = confirmedTransactions.value.filter(t => t.id !== txId)
    failedTransactions.value = failedTransactions.value.filter(t => t.id !== txId)

    // Add to new array
    tx.status = newStatus
    if (newStatus === 'confirmed') {
      confirmedTransactions.value.push(tx)
    } else if (newStatus === 'failed') {
      failedTransactions.value.push(tx)
    } else if (newStatus === 'pending') {
      pendingTransactions.value.push(tx)
    }
  }

  function clearHistory(): void {
    pendingTransactions.value = []
    confirmedTransactions.value = []
    failedTransactions.value = []
  }

  return {
    // State
    pendingTransactions,
    confirmedTransactions,
    failedTransactions,
    isSubmitting,
    isLoading,
    error,

    // Computed
    totalTransactions,
    confirmationRate,

    // Methods
    submitTransactions,
    getTransactionDetail,
    updateTransactionStatus,
    clearHistory
  }
})
