import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import * as consensusAPI from '@/api/consensus'
import type {
  ConsensusAlgorithm,
  ConsensusAlgorithmType,
  ConsensusConfig,
  TPBFTParameters,
  PBFTParameters,
  HotStuffParameters,
  LeiosParameters
} from '@/types'

export const useConsensusStore = defineStore('consensus', () => {
  const algorithms = ref<ConsensusAlgorithm[]>([])

  const currentAlgorithm = ref<ConsensusAlgorithmType>('tPBFT')

  const parameters = reactive<Record<ConsensusAlgorithmType, any>>({
    tPBFT: {
      f: 66,
      nodeSelectionMethod: 'equity',
      hashVerification: true,
      maxRound: 3,
      viewChangeTimeout: 10000,
      blockInterval: 3,
      maxBlockSize: 4,
      txPoolSize: 50000,
      minNodes: 10,
      consensusTimeout: 15000,
      confirmations: 6,
      networkLatency: 500,
      batchSize: 1000,
      dynamicNodeSelection: true,
      reputationThreshold: 70,
      parallelValidation: true,
      adaptiveTimeout: true,
      checkpointInterval: 100,
      preExecution: true,
      compressionAlgo: 'snappy',
      cacheOptions: ['transaction', 'signature'],
      pipelineDepth: 5,
      memPoolSize: 2048,
      networkOptimizations: ['tcp-nodelay', 'multicast'],
      ioThreads: 8,
      cpuAffinity: true
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

  async function loadAlgorithms(): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      const algos = await consensusAPI.getAlgorithms()
      const iconMap: Record<string, string> = {
        tPBFT: 'Checked',
        PBFT: 'Setting',
        HotStuff: 'DataLine',
        Leios: 'Document'
      }
      const colorMap: Record<string, string> = {
        tPBFT: '#67C23A',
        PBFT: '#E6A23C',
        HotStuff: '#F56C6C',
        Leios: '#409EFF'
      }
      algorithms.value = algos.map(a => ({
        ...a,
        icon: a.icon || iconMap[a.id] || 'QuestionFilled',
        color: a.color || colorMap[a.id] || '#909399'
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load algorithms'
      throw err
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
    loadConfig,
    loadAlgorithms
  }
})
