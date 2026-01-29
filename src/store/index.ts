import { createPinia } from 'pinia'
import { usePerformanceStore } from './modules/performance'
import { useConsensusStore } from './modules/consensus'
import { useNodeStore } from './modules/node'
import { useTransactionStore } from './modules/transaction'
import { useUIStore } from './modules/ui'
import { useBenchmarkStore } from './modules/benchmark'

export const pinia = createPinia()

export {
  usePerformanceStore,
  useConsensusStore,
  useNodeStore,
  useTransactionStore,
  useUIStore,
  useBenchmarkStore
}
