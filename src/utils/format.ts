/**
 * 格式化数字
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return Number(num).toFixed(decimals)
}

/**
 * 格式化字节
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化时间
 */
export function formatTime(timestamp: string | number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

/**
 * 格式化日期
 */
export function formatDate(timestamp: string | number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString()
}

/**
 * 格式化日期时间
 */
export function formatDateTime(timestamp: string | number): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

/**
 * 格式化持续时间
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hours}h ${minutes}m ${secs}s`
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${Number(value).toFixed(decimals)}%`
}

/**
 * 格式化货币
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value)
}
