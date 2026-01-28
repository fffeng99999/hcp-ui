import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import * as consensusAPI from '@/api/consensus'
import type {
  ConsensusAlgorithm,
  ConsensusAlgorithmType,
  ConsensusConfig,
  ConsensusParameters,
  TPBFTParameters,
  PBFTParameters,
  HotStuffParameters,
  LeiosParameters
} from '@/types'

export const useConsensusStore = defineStore('consensus', () => {
  const algorithms = ref<ConsensusAlgorithm[]>([
    {
      id: 'tPBFT',
      name: 'tPBFT (Optimized PBFT)',
      description: 'Enhanced PBFT with dynamic node selection and hash verification',
      category: 'BFT-based'
    },
    {
      id: 'PBFT',
      name: 'PBFT (Classic)',
      description: 'Classic Practical Byzantine Fault Tolerance',
      category: 'BFT-based'
    },
    {
      id: 'HotStuff',
      name: 'HotStuff',
      description: 'Linear time Byzantine-safe consensus',
      category: 'Modern'
    },
    {
      id: 'Leios',
      name: 'Leios',
      description: 'High-throughput consensus protocol',
      category: 'Modern'
    }
  ])

  const currentAlgorithm = ref<ConsensusAlgorithmType>('tPBFT')

  const parameters = reactive<Record<ConsensusAlgorithmType, any>>({
    tPBFT: {
      f: 66,
      nodeSelectionMethod: 'equity',
      hashVerification: true,
      maxRound: 3
    } as TPBFTParameters,
    PBFT: {
      f: 66,
      nodeSelectionMethod: 'fixed',
      hashVerification: false,
      maxRound: 4
    } as PBFTParameters,
    HotStuff: {
      f: 66,
      pipelineDepth: 3,
      commitCertificateLevel: 2
    } as HotStuffParameters,
    Leios: {
      fI: 1,
      fE: 0.2,
      sliceLength: 32,
      pipelineLength: 7
    } as LeiosParameters
  })

  const isConfiguring = ref<boolean>(false)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const currentConfig = computed<ConsensusConfig>(() => ({
    currentAlgorithm: currentAlgorithm.value,
    parameters,
    isActive: true,
    lastUpdated: new Date().toISOString()
  }))

  async function selectAlgorithm(algorithmId: ConsensusAlgorithmType): Promise<void> {
    try {
      isConfiguring.value = true
      error.value = null
      await consensusAPI.selectAlgorithm(algorithmId, parameters[algorithmId])
      currentAlgorithm.value = algorithmId
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to select algorithm'
      throw err
    } finally {
      isConfiguring.value = false
    }
  }

  async function updateParameter(paramName: string, value: any): Promise<void> {
    try {
      isConfiguring.value = true
      error.value = null
      await consensusAPI.updateParameter(currentAlgorithm.value, paramName, value)
      parameters[currentAlgorithm.value][paramName] = value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update parameter'
      throw err
    } finally {
      isConfiguring.value = false
    }
  }

  async function loadConfig(): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      const config = await consensusAPI.getConfig()
      currentAlgorithm.value = config.currentAlgorithm
      Object.assign(parameters, config.parameters)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load config'
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    algorithms,
    currentAlgorithm,
    parameters,
    isConfiguring,
    isLoading,
    error,

    // Computed
    currentConfig,

    // Methods
    selectAlgorithm,
    updateParameter,
    loadConfig
  }
})
