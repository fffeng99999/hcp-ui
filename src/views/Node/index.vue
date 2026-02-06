<template>
  <div class="node-page">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span>节点管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="refresh">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>
      <div class="stats">
        <el-tag type="success">在线: {{ onlineCount }}</el-tag>
        <el-tag type="info">离线: {{ offlineCount }}</el-tag>
        <el-tag>平均延迟: {{ averageLatency }}ms</el-tag>
      </div>
    </el-card>

    <el-card>
      <el-table
        :data="nodes"
        v-loading="isLoading"
        stripe
        style="width: 100%"
        @row-click="onRowClick"
      >
        <el-table-column type="index" width="60" />
        <el-table-column prop="id" label="节点ID" width="180" />
        <el-table-column prop="name" label="节点名称" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="latency" label="延迟(ms)" width="120" />
        <el-table-column prop="ip" label="IP地址" width="160" />
        <el-table-column prop="location" label="位置" width="160" />
        <el-table-column label="操作" fixed="right" width="260">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" type="primary" @click.stop="viewDetail(row.id)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button 
                size="small" 
                type="warning" 
                @click.stop="injectFault(row.id)"
                :disabled="row.status !== 'online'"
              >
                <el-icon><Warning /></el-icon>
              </el-button>
              <el-button 
                size="small" 
                type="success" 
                @click.stop="recoverNode(row.id)"
                :disabled="row.status !== 'faulty'"
              >
                <el-icon><Refresh /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click.stop="removeNode(row.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useNodeStore } from '@/store/modules/node'
import { View, Warning, Refresh, Delete } from '@element-plus/icons-vue'

const store = useNodeStore()
const { nodes, isLoading, onlineCount, offlineCount, averageLatency } = storeToRefs(store)

const statusTag = (status: string) => {
  const map: Record<string, string> = {
    online: 'success',
    offline: 'info',
    faulty: 'danger'
  }
  return map[status] || 'info'
}

const refresh = () => {
  store.loadNodes()
}

const onRowClick = (row: any) => {
  store.selectNode(row.id)
}

const viewDetail = async (nodeId: string) => {
  ElMessage.info(`查看节点 ${nodeId} 详情`)
}

const injectFault = async (nodeId: string) => {
  ElMessageBox.confirm('确定对该节点注入故障吗？', '提示', { type: 'warning' })
    .then(async () => {
      await store.injectFault(nodeId, { type: 'latency', severity: 80, affectedNodes: [nodeId], duration: 60 })
      ElMessage.success('故障已注入')
    })
}

const recoverNode = async (nodeId: string) => {
  await store.recoverNode(nodeId)
  ElMessage.success('节点已恢复')
}

const removeNode = (nodeId: string) => {
  ElMessageBox.confirm('确定删除该节点吗？', '提示', { type: 'warning' })
    .then(async () => {
      await store.removeNode(nodeId)
      ElMessage.success('节点已删除')
    })
}

onMounted(() => {
  store.loadNodes()
})
</script>

<style scoped lang="scss" src="@/assets/styles/pages/node.scss"></style>
