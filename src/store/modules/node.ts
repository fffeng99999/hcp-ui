import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as nodeAPI from '@/api/node'
import type {
  Node,
  NodeDetail,
  NodeStats,
  NodeRegistrationRequest,
  FaultInjectionConfig
} from '@/types'

export const useNodeStore = defineStore('node', () => {
  const nodes = ref<Node[]>([])
  const selectedNode = ref<Node | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const onlineCount = computed<number>(() =>
    nodes.value.filter(n => n.status === 'online').length
  )

  const offlineCount = computed<number>(() =>
    nodes.value.filter(n => n.status === 'offline').length
  )

  const averageLatency = computed<number>(() => {
    if (nodes.value.length === 0) return 0
    const sum = nodes.value.reduce((acc, n) => acc + n.latency, 0)
    return parseFloat((sum / nodes.value.length).toFixed(2))
  })

  async function loadNodes(): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      const data = await nodeAPI.getNodes()
      nodes.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load nodes'
      console.error('Failed to load nodes:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function registerNode(nodeData: NodeRegistrationRequest): Promise<Node> {
    try {
      error.value = null
      const newNode = await nodeAPI.registerNode(nodeData)
      nodes.value.push(newNode)
      return newNode
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to register node'
      throw err
    }
  }

  async function removeNode(nodeId: string): Promise<void> {
    try {
      error.value = null
      await nodeAPI.removeNode(nodeId)
      nodes.value = nodes.value.filter(n => n.id !== nodeId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove node'
      throw err
    }
  }

  async function injectFault(nodeId: string, faultConfig: FaultInjectionConfig): Promise<void> {
    try {
      error.value = null
      await nodeAPI.injectFault(nodeId, faultConfig)
      const node = nodes.value.find(n => n.id === nodeId)
      if (node) {
        node.status = 'faulty'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to inject fault'
      throw err
    }
  }

  async function recoverNode(nodeId: string): Promise<void> {
    try {
      error.value = null
      await nodeAPI.recoverNode(nodeId)
      const node = nodes.value.find(n => n.id === nodeId)
      if (node) {
        node.status = 'online'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to recover node'
      throw err
    }
  }

  function selectNode(nodeId: string): void {
    selectedNode.value = nodes.value.find(n => n.id === nodeId) || null
  }

  return {
    // State
    nodes,
    selectedNode,
    isLoading,
    error,

    // Computed
    onlineCount,
    offlineCount,
    averageLatency,

    // Methods
    loadNodes,
    registerNode,
    removeNode,
    injectFault,
    recoverNode,
    selectNode
  }
})
