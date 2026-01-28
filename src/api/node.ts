import http from './http'
import type {
  Node,
  NodeDetail,
  NodeStats,
  NodeRegistrationRequest,
  NodeHealthStatus,
  FaultInjectionConfig
} from '@/types'

/**
 * 获取所有节点
 */
export const getNodes = (): Promise<Node[]> =>
  http.get('/nodes')

/**
 * 获取节点详情
 */
export const getNodeDetail = (nodeId: string): Promise<NodeDetail> =>
  http.get(`/nodes/${nodeId}`)

/**
 * 注册节点
 */
export const registerNode = (request: NodeRegistrationRequest): Promise<Node> =>
  http.post('/nodes/register', request)

/**
 * 移除节点
 */
export const removeNode = (nodeId: string): Promise<void> =>
  http.delete(`/nodes/${nodeId}`)

/**
 * 注入故障
 */
export const injectFault = (
  nodeId: string,
  config: FaultInjectionConfig
): Promise<void> =>
  http.post(`/nodes/${nodeId}/inject-fault`, config)

/**
 * 恢复节点
 */
export const recoverNode = (nodeId: string): Promise<void> =>
  http.post(`/nodes/${nodeId}/recover`)

/**
 * 获取节点统计
 */
export const getNodeStats = (): Promise<NodeStats> =>
  http.get('/nodes/stats')

/**
 * 获取节点健康状态
 */
export const getNodeHealth = (nodeId: string): Promise<NodeHealthStatus> =>
  http.get(`/nodes/${nodeId}/health`)

/**
 * 获取所有节点健康状态
 */
export const getAllNodesHealth = (): Promise<NodeHealthStatus[]> =>
  http.get('/nodes/health/all')
