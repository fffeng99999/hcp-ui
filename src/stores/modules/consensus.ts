import { defineStore } from 'pinia'
import { ref } from 'vue'
import { consensusApi } from '../../api/modules/consensus'
import type { ConsensusAlgorithm, ConsensusConfig } from '../../types'

export const useConsensusStore = defineStore('consensus', () => {
  const algorithms = ref<ConsensusAlgorithm[]>([])
  const currentConfig = ref<ConsensusConfig | null>(null)
  const configHistory = ref<ConsensusConfig[]>([])
  const loading = ref(false)

  const fetchAlgorithms = async () => {
    try {
      algorithms.value = await consensusApi.getAlgorithms()
    } catch (error) {
      console.error('Failed to fetch algorithms:', error)
    }
  }

  const fetchConfig = async () => {
    loading.value = true
    try {
      currentConfig.value = await consensusApi.getConfig()
    } finally {
      loading.value = false
    }
  }

  const updateConfig = async (config: Partial<ConsensusConfig>) => {
    const updated = await consensusApi.updateConfig(config)
    currentConfig.value = updated
    return updated
  }

  const fetchConfigHistory = async () => {
    try {
      configHistory.value = await consensusApi.getConfigHistory()
    } catch (error) {
      console.error('Failed to fetch config history:', error)
    }
  }

  return {
    algorithms,
    currentConfig,
    configHistory,
    loading,
    fetchAlgorithms,
    fetchConfig,
    updateConfig,
    fetchConfigHistory
  }
})
