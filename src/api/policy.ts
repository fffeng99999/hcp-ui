import http from './http'
import { endpoints } from './config'
import type { AntiManipulationConfig, ManipulationEvent } from '@/types'

export const getStrategies = () => {
  return http.get<AntiManipulationConfig>(endpoints.ANTI_MANIPULATION_STRATEGIES)
}

export const updateStrategies = (data: AntiManipulationConfig) => {
  return http.put<AntiManipulationConfig>(endpoints.ANTI_MANIPULATION_STRATEGIES, data)
}

export interface GetEventsParams {
  page?: number
  pageSize?: number
  type?: string
  startTime?: string
  endTime?: string
}

export interface EventsResponse {
  total: number
  items: ManipulationEvent[]
}

export const getEvents = (params?: GetEventsParams) => {
  return http.get<EventsResponse>(endpoints.ANTI_MANIPULATION_EVENTS, { params })
}
