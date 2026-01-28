/**
 * API 响应统一格式
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  timestamp?: string
}

/**
 * 分页数据
 */
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * API 请求错误
 */
export class ApiError extends Error {
  code: number
  status: number

  constructor(message: string, code: number = -1, status: number = 500) {
    super(message)
    this.code = code
    this.status = status
  }
}
