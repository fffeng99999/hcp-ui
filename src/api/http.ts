import type { AxiosRequestConfig } from 'axios'
import axiosInstance from './axiosInstance'
import type { ApiResponse } from '@/types'
import { useConfigVersionStore } from '@/store/modules/configVersion'

const withConfigVersion = (config?: AxiosRequestConfig): AxiosRequestConfig => {
  const store = useConfigVersionStore()
  const version = store.currentVersion
  if (version === null || version === undefined) {
    return config || {}
  }
  const headers = {
    ...(config?.headers || {}),
    'X-Config-Version': version
  }
  return {
    ...(config || {}),
    headers
  }
}
class HttpClient {
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const resp = await axiosInstance.get<any, ApiResponse<T>>(url, config)
    // axios 实例的拦截器会直接返回 response.data
    const apiResp = resp as unknown as ApiResponse<T>
    if (apiResp.code !== 0) {
      const msg = apiResp.msg || apiResp.message || 'Unknown error'
      throw new Error(msg)
    }
    return apiResp.data as T
  }
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const resp = await axiosInstance.post<any, ApiResponse<T>>(url, data, withConfigVersion(config))
    const apiResp = resp as unknown as ApiResponse<T>
    if (apiResp.code !== 0) {
      const msg = apiResp.msg || apiResp.message || 'Unknown error'
      throw new Error(msg)
    }
    return apiResp.data as T
  }
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const resp = await axiosInstance.put<any, ApiResponse<T>>(url, data, withConfigVersion(config))
    const apiResp = resp as unknown as ApiResponse<T>
    if (apiResp.code !== 0) {
      const msg = apiResp.msg || apiResp.message || 'Unknown error'
      throw new Error(msg)
    }
    return apiResp.data as T
  }
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const resp = await axiosInstance.delete<any, ApiResponse<T>>(url, withConfigVersion(config))
    const apiResp = resp as unknown as ApiResponse<T>
    if (apiResp.code !== 0) {
      const msg = apiResp.msg || apiResp.message || 'Unknown error'
      throw new Error(msg)
    }
    return apiResp.data as T
  }
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const resp = await axiosInstance.patch<any, ApiResponse<T>>(url, data, withConfigVersion(config))
    const apiResp = resp as unknown as ApiResponse<T>
    if (apiResp.code !== 0) {
      const msg = apiResp.msg || apiResp.message || 'Unknown error'
      throw new Error(msg)
    }
    return apiResp.data as T
  }
}
export default new HttpClient()
