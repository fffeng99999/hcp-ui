import axiosInstance from '../axiosInstance'
import { endpoints } from '../config'
import type { ConsensusAlgorithm, ConsensusConfig, ApiResponse } from '../../types'

export const consensusApi = {
  getAlgorithms: async (): Promise<ConsensusAlgorithm[]> => {
    const response = await axiosInstance.get<ApiResponse<ConsensusAlgorithm[]>>(
      endpoints.CONSENSUS_ALGORITHMS
    )
    return response.data
  },

  getConfig: async (): Promise<ConsensusConfig> => {
    const response = await axiosInstance.get<ApiResponse<ConsensusConfig>>(
      endpoints.CONSENSUS_CONFIG
    )
    return response.data
  },

  updateConfig: async (data: Partial<ConsensusConfig>): Promise<ConsensusConfig> => {
    const response = await axiosInstance.patch<ApiResponse<ConsensusConfig>>(
      endpoints.CONSENSUS_CONFIG,
      data
    )
    return response.data
  },

  getConfigHistory: async (): Promise<ConsensusConfig[]> => {
    const response = await axiosInstance.get<ApiResponse<ConsensusConfig[]>>(
      endpoints.CONSENSUS_HISTORY
    )
    return response.data
  }
}
