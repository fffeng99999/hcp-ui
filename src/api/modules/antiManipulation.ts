import axiosInstance from '../axiosInstance'
import { endpoints } from '../config'
import type {
  AntiManipulationStrategy,
  ManipulationEvent,
  PaginatedResponse,
  ApiResponse
} from '../../types'

export const antiManipulationApi = {
  getStrategies: async (): Promise<AntiManipulationStrategy[]> => {
    const response = await axiosInstance.get<ApiResponse<AntiManipulationStrategy[]>>(
      endpoints.ANTI_MANIPULATION_STRATEGIES
    )
    return response.data
  },

  createStrategy: async (data: AntiManipulationStrategy): Promise<AntiManipulationStrategy> => {
    const response = await axiosInstance.post<ApiResponse<AntiManipulationStrategy>>(
      endpoints.ANTI_MANIPULATION_STRATEGIES,
      data
    )
    return response.data
  },

  updateStrategy: async (
    id: string,
    data: Partial<AntiManipulationStrategy>
  ): Promise<AntiManipulationStrategy> => {
    const response = await axiosInstance.patch<ApiResponse<AntiManipulationStrategy>>(
      `${endpoints.ANTI_MANIPULATION_STRATEGIES}/${id}`,
      data
    )
    return response.data
  },

  getEvents: async (
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<ManipulationEvent>> => {
    const response = await axiosInstance.get<
      ApiResponse<PaginatedResponse<ManipulationEvent>>
    >(endpoints.ANTI_MANIPULATION_EVENTS, {
      params: { page, pageSize }
    })
    return response.data
  }
}
