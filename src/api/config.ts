export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
export const API_TIMEOUT = 30000
export const API_RETRY_COUNT = 3

export const endpoints = {
  // 仪表盘相关接口
  DASHBOARD_METRICS: '/dashboard/metrics',
  DASHBOARD_TRENDS: '/dashboard/trends',
  DASHBOARD_ALERTS: '/dashboard/alerts',

  // 压测任务相关接口
  BENCHMARKS: '/benchmarks',
  BENCHMARK_DETAIL: '/benchmarks/:id',
  BENCHMARK_START: '/benchmarks/:id/start',
  BENCHMARK_STOP: '/benchmarks/:id/stop',

  // 共识配置相关接口
  CONSENSUS_ALGORITHMS: '/consensus/algorithms',
  CONSENSUS_CONFIG: '/consensus/config',
  CONSENSUS_HISTORY: '/consensus/config-history',

  // 反操纵检测相关接口
  ANTI_MANIPULATION_STRATEGIES: '/anti-manipulation/strategies',
  ANTI_MANIPULATION_EVENTS: '/anti-manipulation/events',
  ANTI_MANIPULATION_STATS: '/anti-manipulation/stats',

  // 指标分析相关接口
  METRICS_HISTORICAL: '/metrics/historical',
  METRICS_COMPARE: '/metrics/compare',
  METRICS_EXPORT: '/metrics/export',

  // 系统设置相关接口
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_NETWORK: '/settings/network',
  SETTINGS_STORAGE: '/settings/storage',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_NOTIFICATION: '/settings/notification',
  SETTINGS_BACKUP: '/settings/backup',
  SETTINGS_USERS: '/settings/users',
  SETTINGS_BACKUPS: '/settings/backups'
}
