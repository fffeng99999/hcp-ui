<template>
  <BaseCard class="settings-content" title="系统信息">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="系统版本">
        <el-tag type="success">HCP-Bench v1.0.0</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="区块链版本">
        <el-tag>v2.5.3</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="操作系统">
        Ubuntu 22.04 LTS x86_64
      </el-descriptions-item>
      <el-descriptions-item label="内核版本">
        5.15.0-89-generic
      </el-descriptions-item>
      <el-descriptions-item label="CPU">
        Intel Xeon E5-2680 v4 @ 2.40GHz (28核56线程)
      </el-descriptions-item>
      <el-descriptions-item label="内存">
        128GB DDR4 2400MHz
      </el-descriptions-item>
      <el-descriptions-item label="运行时间">
        15天 8小时 32分钟
      </el-descriptions-item>
      <el-descriptions-item label="Go版本">
        go1.21.5 linux/amd64
      </el-descriptions-item>
      <el-descriptions-item label="数据库版本">
        LevelDB 1.23
      </el-descriptions-item>
      <el-descriptions-item label="网络延迟">
        <el-tag type="success">平均 45ms</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="磁盘I/O">
        读: 258MB/s | 写: 186MB/s
      </el-descriptions-item>
      <el-descriptions-item label="网络吞吐">
        上行: 125MB/s | 下行: 98MB/s
      </el-descriptions-item>
    </el-descriptions>

    <el-divider />

    <el-row :gutter="20">
      <el-col :span="8">
        <el-statistic title="CPU使用率" :value="68.5" suffix="%">
          <template #prefix>
            <el-icon><Cpu /></el-icon>
          </template>
        </el-statistic>
      </el-col>
      <el-col :span="8">
        <el-statistic title="内存使用率" :value="72.3" suffix="%">
          <template #prefix>
            <el-icon><Monitor /></el-icon>
          </template>
        </el-statistic>
      </el-col>
      <el-col :span="8">
        <el-statistic title="磁盘使用率" :value="45.8" suffix="%">
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Cpu, Monitor, FolderOpened } from '@element-plus/icons-vue'
import BaseCard from '@/components/common/BaseCard.vue'

const checkUpdate = () => ElMessage.info('当前已是最新版本')
const viewLogs = () => ElMessage.info('跳转到日志查看页面')
const exportSystemInfo = () => ElMessage.success('系统信息导出成功')
const restartSystem = () => {
  ElMessageBox.confirm('确定重启系统吗?这将中断所有正在运行的任务', '警告', { type: 'warning' })
    .then(() => ElMessage.warning('系统将在10秒后重启'))
}
</script>
