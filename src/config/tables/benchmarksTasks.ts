import { 
  VideoPlay, VideoPause, Delete, View, CopyDocument, SwitchButton 
} from '@element-plus/icons-vue'
import type { TableConfig } from '@/types/table'

export const benchmarksTasksTable: TableConfig = {
  columns: [
    { prop: 'id', label: '任务ID', width: 120, fixed: true },
    { prop: 'name', label: '任务名称', width: 200, fixed: true, slotName: 'name' },
    { prop: 'consensus', label: '共识算法', width: 120, slotName: 'consensus' },
    { prop: 'nodeCount', label: '节点数', width: 100, align: 'center' },
    { prop: 'txRate', label: '交易速率', width: 120 },
    { prop: 'duration', label: '持续时间', width: 120, slotName: 'duration' },
    { prop: 'status', label: '状态', width: 120, slotName: 'status' },
    { prop: 'progress', label: '进度', width: 150, slotName: 'progress' },
    { prop: 'metrics', label: '性能指标', width: 200, slotName: 'metrics' },
    { prop: 'createdAt', label: '创建时间', width: 180 }
  ],
  fixedSection: {
    type: 'operation',
    label: '操作',
    width: 260,
    buttons: [
      { 
        label: '启动', 
        type: 'success', 
        icon: VideoPlay, 
        event: 'start',
        show: (row: any) => ['waiting', 'paused', 'failed', 'completed'].includes(row.status)
      },
      { 
        label: '暂停', 
        type: 'warning', 
        icon: VideoPause, 
        event: 'pause',
        show: (row: any) => row.status === 'running'
      },
      { 
        label: '停止', 
        type: 'danger', 
        icon: SwitchButton, 
        event: 'stop',
        show: (row: any) => row.status === 'running' || row.status === 'paused'
      },
      { 
        label: '详情', 
        type: 'primary', 
        icon: View, 
        event: 'view' 
      },
      { 
        label: '复制', 
        type: 'info', 
        icon: CopyDocument, 
        event: 'duplicate' 
      },
      { 
        label: '删除', 
        type: 'danger', 
        icon: Delete, 
        event: 'delete',
        show: (row: any) => ['completed', 'failed', 'waiting'].includes(row.status)
      }
    ]
  }
}
