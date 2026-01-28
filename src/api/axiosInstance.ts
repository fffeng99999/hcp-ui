import axios, { AxiosInstance, AxiosError } from 'axios'
import { API_BASE_URL, API_TIMEOUT } from './config'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  config => {
    // 添加认证令牌
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  response => {
    return response.data
  },
  (error: AxiosError) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }

    const message = (error.response?.data as any)?.message || error.message || '请求失败'
    console.error('Response error:', message)

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data
    })
  }
)

export default axiosInstance
