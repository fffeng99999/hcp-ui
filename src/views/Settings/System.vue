<template>
  <BaseCard class="settings-content" title="系统信息">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="系统版本">
        <el-tag type="success">{{ systemInfo.systemVersion }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="区块链版本">
        <el-tag>{{ systemInfo.blockchainVersion }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="操作系统">
        {{ systemInfo.os }}
      </el-descriptions-item>
      <el-descriptions-item label="内核版本">
        {{ systemInfo.kernelVersion }}
      </el-descriptions-item>
      <el-descriptions-item label="CPU">
        {{ systemInfo.cpuDesc }}
      </el-descriptions-item>
      <el-descriptions-item label="内存">
        {{ systemInfo.memoryDesc }}
      </el-descriptions-item>
      <el-descriptions-item label="运行时间">
        {{ systemInfo.uptime }}
      </el-descriptions-item>
      <el-descriptions-item label="Go版本">
        {{ systemInfo.goVersion }}
      </el-descriptions-item>
      <el-descriptions-item label="数据库版本">
        {{ systemInfo.dbVersion }}
      </el-descriptions-item>
      <el-descriptions-item label="网络延迟">
        <el-tag type="success">{{ systemInfo.networkLatency }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="磁盘I/O">
        {{ systemInfo.diskIo }}
      </el-descriptions-item>
      <el-descriptions-item label="网络吞吐">
        {{ systemInfo.networkThroughput }}
      </el-descriptions-item>
      <el-descriptions-item label="配置版本号">
        <el-tag>{{ systemInfo.configVersion }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <el-divider />

    <el-row :gutter="20">
      <el-col :span="8">
        <el-statistic title="CPU使用率" :value="systemInfo.cpuUsage" suffix="%">
          <template #prefix>
            <el-icon><Cpu /></el-icon>
          </template>
        </el-statistic>
      </el-col>
      <el-col :span="8">
        <el-statistic title="内存使用率" :value="systemInfo.memoryUsage" suffix="%">
          <template #prefix>
            <el-icon><Monitor /></el-icon>
          </template>
        </el-statistic>
      </el-col>
      <el-col :span="8">
        <el-statistic title="磁盘使用率" :value="systemInfo.diskUsage" suffix="%">
          <template #prefix>
            <el-icon><FolderOpened /></el-icon>
          </template>
        </el-statistic>
      </el-col>
    </el-row>

    <el-divider />

    <el-space>
      <el-button @click="checkUpdate">检查更新</el-button>
      <el-button @click="viewLogs">查看日志</el-button>
      <el-button @click="exportSystemInfo">导出系统信息</el-button>
      <el-button type="danger" @click="restartSystem">重启系统</el-button>
    </el-space>
  </BaseCard>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Cpu, Monitor, FolderOpened } from '@element-plus/icons-vue'
import BaseCard from '@/components/common/BaseCard.vue'
import { API_BASE_URL } from '@/api/config'
import { useConfigVersionStore } from '@/store/modules/configVersion'

const systemInfo = ref({
  systemVersion: 'HCP-Bench v1.0.0',
  blockchainVersion: 'v2.5.3',
  os: 'Ubuntu 22.04 LTS x86_64',
  kernelVersion: '5.15.0-89-generic',
  cpuDesc: 'Intel Xeon E5-2680 v4 @ 2.40GHz (28核56线程)',
  memoryDesc: '128GB DDR4 2400MHz',
  uptime: '15天 8小时 32分钟',
  goVersion: 'go1.21.5 linux/amd64',
  dbVersion: 'LevelDB 1.23',
  networkLatency: '平均 45ms',
  diskIo: '读: 258MB/s | 写: 186MB/s',
  networkThroughput: '上行: 125MB/s | 下行: 98MB/s',
  cpuUsage: 68.5,
  memoryUsage: 72.3,
  diskUsage: 45.8,
  configVersion: 1
})

const configVersionStore = useConfigVersionStore()
let eventSource: EventSource | null = null

const startSystemStream = () => {
  const streamUrl = `${API_BASE_URL.replace(/\/$/, '')}/system/stream`
  eventSource = new EventSource(streamUrl)
  eventSource.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data)
      if (typeof payload.config_version === 'number') {
        systemInfo.value.configVersion = payload.config_version
        configVersionStore.currentVersion = payload.config_version
      }
    } catch (e) {
      ElMessage.warning('系统信息流解析失败')
    }
  }
  eventSource.onerror = () => {
    ElMessage.warning('系统信息流连接异常，正在尝试重连')
  }
}

const checkUpdate = () => ElMessage.info('当前已是最新版本')
const viewLogs = () => ElMessage.info('跳转到日志查看页面')
const exportSystemInfo = () => ElMessage.success('系统信息导出成功')
const restartSystem = () => {
  ElMessageBox.confirm('确定重启系统吗?这将中断所有正在运行的任务', '警告', { type: 'warning' })
    .then(() => ElMessage.warning('系统将在10秒后重启'))
}

onMounted(() => {
  startSystemStream()
})

onBeforeUnmount(() => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
})
</script>
