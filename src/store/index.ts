import { createPinia } from 'pinia'
import { usePerformanceStore } from './modules/performance'
import { useConsensusStore } from './modules/consensus'
import { useNodeStore } from './modules/node'
import { useTransactionStore } from './modules/transaction'
import { useUIStore } from './modules/ui'

export const pinia = createPinia()

export {
  usePerformanceStore,
  useConsensusStore,
  useNodeStore,
  useTransactionStore,
  useUIStore
}
