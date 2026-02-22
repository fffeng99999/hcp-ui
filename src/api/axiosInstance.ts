import axios, { AxiosInstance, AxiosError } from 'axios'
import { API_BASE_URL, API_TIMEOUT } from './config'
import { useConfigVersionStore } from '@/store/modules/configVersion'
import { ElMessageBox } from 'element-plus'

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
    // 从响应头中提取全局配置版本号
    const store = useConfigVersionStore()
    const versionHeader = response.headers['x-config-version'] ?? response.headers['X-Config-Version']
    const previousVersion = store.currentVersion
    store.updateFromHeader(versionHeader as any)
    const currentVersion = store.currentVersion
    if (
      previousVersion !== null &&
      currentVersion !== null &&
      currentVersion > previousVersion
    ) {
      ElMessageBox.alert('检测到配置已更新，为保证数据一致性请刷新页面', '配置已变更', {
        type: 'warning'
      })
    }
    return response.data
  },
  (error: AxiosError) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }

    const data: any = error.response?.data
    const message = data?.msg || data?.message || error.message || '请求失败'
    console.error('Response error:', message)

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data
    })
  }
)

export default axiosInstance
