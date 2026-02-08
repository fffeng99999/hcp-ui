import { defineStore } from 'pinia'
import { ref, reactive, computed, watch } from 'vue'
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
  const comparisonIds = ref<string[]>([])
  const isChartExpanded = ref<boolean>(false)

  // Persistence
  const savedComparison = localStorage.getItem('consensus_comparison_ids')
  if (savedComparison) {
    try {
      comparisonIds.value = JSON.parse(savedComparison)
    } catch (e) {
      console.error('Failed to parse saved comparison ids', e)
    }
  }

  const savedExpanded = localStorage.getItem('consensus_chart_expanded')
  if (savedExpanded) {
    try {
      isChartExpanded.value = JSON.parse(savedExpanded)
    } catch (e) {
      console.error('Failed to parse saved expanded state', e)
    }
  }

  watch(comparisonIds, (newVal) => {
    localStorage.setItem('consensus_comparison_ids', JSON.stringify(newVal))
  }, { deep: true })

  watch(isChartExpanded, (newVal) => {
    localStorage.setItem('consensus_chart_expanded', JSON.stringify(newVal))
  })

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

  const comparisonAlgorithms = computed(() => {
    return comparisonIds.value
      .map(id => algorithms.value.find(algo => algo.id === id))
      .filter((algo): algo is ConsensusAlgorithm => !!algo)
  })

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
      let algos: ConsensusAlgorithm[] = []
      
      try {
        algos = await consensusAPI.getAlgorithms()
      } catch (e) {
        console.warn('API fetch failed, using mock data')
      }
      
      // Fallback Mock Data
      if (!algos || algos.length === 0) {
         algos = [
            { 
              id: 'tPBFT', name: 'tPBFT', displayName: 'tPBFT', description: 'Trust-based PBFT', category: 'Modern',
              avgTps: 2200, peakTps: 2500, avgLatency: 350, p95Latency: 450, p99Latency: 600, cpuUsage: 45, memoryUsage: 1024, score: 92
            },
            { 
              id: 'PBFT', name: 'PBFT', displayName: 'PBFT', description: 'Practical Byzantine Fault Tolerance', category: 'BFT-based',
              avgTps: 1200, peakTps: 1500, avgLatency: 800, p95Latency: 1200, p99Latency: 1800, cpuUsage: 65, memoryUsage: 2048, score: 75
            },
            { 
              id: 'HotStuff', name: 'HotStuff', displayName: 'HotStuff', description: 'Linear BFT', category: 'Modern',
              avgTps: 1800, peakTps: 2100, avgLatency: 500, p95Latency: 700, p99Latency: 900, cpuUsage: 40, memoryUsage: 1200, score: 85
            },
            { 
              id: 'Leios', name: 'Leios', displayName: 'Leios', description: 'High throughput', category: 'Modern',
              avgTps: 4500, peakTps: 5200, avgLatency: 900, p95Latency: 1100, p99Latency: 1500, cpuUsage: 75, memoryUsage: 4096, score: 88
            },
            { 
              id: 'Raft', name: 'Raft', displayName: 'Raft', description: 'Crash Fault Tolerance', category: 'Modern',
              avgTps: 3000, peakTps: 3500, avgLatency: 100, p95Latency: 150, p99Latency: 200, cpuUsage: 20, memoryUsage: 512, score: 82
            }
         ] as any
      }

      const iconMap: Record<string, string> = {
        tPBFT: 'Checked',
        PBFT: 'Setting',
        HotStuff: 'DataLine',
        Leios: 'Document',
        Raft: 'Connection'
      }
      const colorMap: Record<string, string> = {
        tPBFT: '#67C23A',
        PBFT: '#E6A23C',
        HotStuff: '#F56C6C',
        Leios: '#409EFF',
        Raft: '#909399'
      }
      algorithms.value = algos.map(a => ({
        ...a,
        displayName: a.displayName || a.name, // Ensure displayName
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

  function toggleComparisonAlgorithm(id: string) {
    const index = comparisonIds.value.indexOf(id)
    if (index > -1) {
      comparisonIds.value.splice(index, 1)
    } else {
      comparisonIds.value.push(id)
    }
  }

  function setComparisonAlgorithms(ids: string[]) {
    comparisonIds.value = ids
  }

  function setChartExpanded(expanded: boolean) {
    isChartExpanded.value = expanded
  }

  return {
    // State
    algorithms,
    currentAlgorithm,
    parameters,
    isConfiguring,
    isLoading,
    error,
    comparisonIds,
    isChartExpanded,

    // Computed
    currentConfig,
    comparisonAlgorithms,

    // Methods
    selectAlgorithm,
    updateParameter,
    loadConfig,
    loadAlgorithms,
    toggleComparisonAlgorithm,
    setComparisonAlgorithms,
    setChartExpanded
  }
})
