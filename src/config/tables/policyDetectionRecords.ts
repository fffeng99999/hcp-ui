export const policyDetectionRecordsTable = {
  columns: {
    timestamp: { label: '检测时间', width: 180 },
    type: { label: '操纵类型', width: 150 },
    txHash: { label: '交易哈希', width: 200 },
    account: { label: '涉及账户', width: 150 },
    confidence: { label: '置信度', width: 120 },
    action: { label: '响应动作', width: 120 },
    status: { label: '状态', width: 100 }
  },
  action: {
    width: 150
  }
}
