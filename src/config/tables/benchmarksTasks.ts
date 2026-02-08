export const benchmarksTasksTable = {
  columns: {
    id: { label: '任务ID', width: 120 },
    name: { label: '任务名称', width: 200 },
    consensus: { label: '共识算法', width: 120 },
    nodeCount: { label: '节点数', width: 100 },
    txRate: { label: '交易速率', width: 120 },
    duration: { label: '持续时间', width: 120 },
    status: { label: '状态', width: 120 },
    progress: { label: '进度', width: 150 },
    metrics: { label: '性能指标', width: 200 },
    createdAt: { label: '创建时间', width: 180 }
  },
  action: {
    width: 260
  }
}
