import type { TableConfig } from '@/types/table'

export const consensusComparisonTable: TableConfig = {
  columns: [
    { prop: 'algorithm', label: '共识算法', width: 120, fixed: true },
    { prop: 'avgTps', label: '平均TPS', width: 120, sortable: true, slotName: 'avgTps' },
    { prop: 'peakTps', label: '峰值TPS', width: 120, sortable: true, slotName: 'peakTps' },
    { prop: 'avgLatency', label: '平均延迟(ms)', width: 140, sortable: true },
    { prop: 'p95Latency', label: 'P95延迟(ms)', width: 140, sortable: true },
    { prop: 'p99Latency', label: 'P99延迟(ms)', width: 140, sortable: true },
    { prop: 'cpuUsage', label: 'CPU使用率', width: 120, slotName: 'cpuUsage' },
    { prop: 'memoryUsage', label: '内存使用率', width: 120, slotName: 'memoryUsage' }
  ],
  fixedSection: {
    type: 'display',
    label: '综合评分',
    width: 120,
    slotName: 'score'
  }
}
