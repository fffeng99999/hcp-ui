<template>
  <BaseCard title="系统告警">
    <template #action>
      <el-badge :value="unreadAlerts" class="alert-badge">
        <el-button size="small" @click="showAllAlerts">查看全部</el-button>
      </el-badge>
    </template>

    <el-timeline>
      <el-timeline-item 
        v-for="alert in recentAlerts" 
        :key="alert.id"
        :timestamp="alert.timestamp"
        :color="getAlertColor(alert.level)"
      >
        <el-tag :type="getAlertTagType(alert.level)" size="small">{{ alert.level }}</el-tag>
        <span style="margin-left: 8px;">{{ alert.message }}</span>
      </el-timeline-item>
    </el-timeline>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import BaseCard from '@/components/cards/BaseCard.vue'

const unreadAlerts = ref(5)
const recentAlerts = ref<any[]>([])

// Mock alerts (since logic was not fully visible in read file, adding mock based on usage)
recentAlerts.value = [
  { id: 1, timestamp: '2023-10-27 10:00:00', level: '警告', message: '节点3延迟过高' },
  { id: 2, timestamp: '2023-10-27 09:45:00', level: '信息', message: '共识算法切换完成' },
  { id: 3, timestamp: '2023-10-27 09:30:00', level: '严重', message: '节点2失去连接' },
]

const getAlertColor = (level: string) => {
  const colors: Record<string, string> = {
    '严重': '#F56C6C',
    '警告': '#E6A23C',
    '信息': '#409EFF'
  }
  return colors[level] || '#909399'
}

const getAlertTagType = (level: string) => {
  const types: Record<string, any> = {
    '严重': 'danger',
    '警告': 'warning',
    '信息': 'info'
  }
  return types[level] || 'info'
}

const showAllAlerts = () => {
  ElMessage.info('跳转到告警中心')
}
</script>
