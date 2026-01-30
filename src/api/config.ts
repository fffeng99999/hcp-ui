export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
export const API_TIMEOUT = 30000
export const API_RETRY_COUNT = 3

export const endpoints = {
  // Dashboard
  DASHBOARD_METRICS: '/dashboard/metrics',
  DASHBOARD_TRENDS: '/dashboard/trends',
  DASHBOARD_ALERTS: '/dashboard/alerts',

  // Benchmarks
  BENCHMARKS: '/benchmarks',
  BENCHMARK_DETAIL: '/benchmarks/:id',
  BENCHMARK_START: '/benchmarks/:id/start',
  BENCHMARK_STOP: '/benchmarks/:id/stop',

  // Consensus
  CONSENSUS_ALGORITHMS: '/consensus/algorithms',
  CONSENSUS_CONFIG: '/consensus/config',
  CONSENSUS_HISTORY: '/consensus/config-history',

  // Anti-Manipulation
  ANTI_MANIPULATION_STRATEGIES: '/anti-manipulation/strategies',
  ANTI_MANIPULATION_EVENTS: '/anti-manipulation/events',
  ANTI_MANIPULATION_STATS: '/anti-manipulation/stats',

  // Metrics
  METRICS_HISTORICAL: '/metrics/historical',
  METRICS_COMPARE: '/metrics/compare',
  METRICS_EXPORT: '/metrics/export',

  // Settings
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_NETWORK: '/settings/network',
  SETTINGS_STORAGE: '/settings/storage',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_NOTIFICATION: '/settings/notification',
  SETTINGS_BACKUP: '/settings/backup',
  SETTINGS_USERS: '/settings/users',
  SETTINGS_BACKUPS: '/settings/backups'
}
