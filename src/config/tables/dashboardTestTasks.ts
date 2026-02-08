export const dashboardTestTasksTable = {
  columns: {
    id: { label: '任务ID', width: 100 },
    name: { label: '测试名称', width: 200 },
    consensus: { label: '共识算法', width: 120 },
    nodes: { label: '节点数', width: 100 },
    status: { label: '状态', width: 120 },
    avgLatency: { label: '平均延迟(ms)', width: 140 },
    tps: { label: 'TPS', width: 120 },
    createdAt: { label: '创建时间', width: 180 }
  },
  action: {
    width: 240
  }
}
