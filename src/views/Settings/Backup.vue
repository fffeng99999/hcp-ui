<template>
  <SettingsCard class="settings-content" title="备份恢复">
    <template #actions>
      <el-button type="primary" size="small" @click="createBackup">
        <el-icon><FolderAdd /></el-icon> 创建备份
      </el-button>
    </template>

    <el-form :model="backupSettings" label-width="160px">
      <el-form-item label="自动备份">
        <el-switch v-model="backupSettings.autoBackup" />
      </el-form-item>

      <el-form-item label="备份频率">
        <el-select v-model="backupSettings.frequency" :disabled="!backupSettings.autoBackup" style="width: 200px">
          <el-option label="每天" value="daily" />
          <el-option label="每周" value="weekly" />
          <el-option label="每月" value="monthly" />
        </el-select>
      </el-form-item>

      <el-form-item label="备份保留数量">
        <el-input-number v-model="backupSettings.retentionCount" :min="1" :max="30" :disabled="!backupSettings.autoBackup" />
      </el-form-item>

      <el-form-item label="备份路径">
        <el-input v-model="backupSettings.backupPath" style="width: 400px">
          <template #append>
            <el-button @click="selectBackupPath">浏览</el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveBackupSettings">保存设置</el-button>
      </el-form-item>
    </el-form>

    <el-divider />

    <el-table :data="backupList" stripe>
      <el-table-column prop="name" label="备份名称" width="250" />
      <el-table-column prop="size" label="大小" width="120" />
      <el-table-column prop="type" label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="row.type === '自动' ? 'success' : 'primary'" size="small">
            {{ row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="200" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '完整' ? 'success' : 'warning'" size="small">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="250">
        <template #default="{ row }">
          <el-button size="small" @click="restoreBackup(row)">
            <el-icon><Upload /></el-icon> 恢复
          </el-button>
          <el-button size="small" @click="downloadBackup(row)">
            <el-icon><Download /></el-icon> 下载
          </el-button>
          <el-button size="small" type="danger" @click="deleteBackup(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FolderAdd, Upload, Download } from '@element-plus/icons-vue'
import * as settingsAPI from '@/api/settings'
import type { BackupSettings, BackupRecord } from '@/types'
import SettingsCard from '@/components/SettingsCard.vue'

const backupSettings = ref<BackupSettings>({
  autoBackup: true,
  frequency: 'daily',
  retentionCount: 7,
  backupPath: '/backup/hcp'
})

const backupList = ref<BackupRecord[]>([])

const loadBackups = async () => {
  try {
    const data = await settingsAPI.getBackups()
    backupList.value = data
  } catch (e) {
    ElMessage.warning('获取备份列表失败')
  }
}

const saveBackupSettings = async () => {
  try {
    await settingsAPI.updateBackupSettings(backupSettings.value)
    ElMessage.success('备份设置已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const selectBackupPath = () => ElMessage.info('打开文件选择器')

const createBackup = async () => {
  try {
    await settingsAPI.createBackup()
    ElMessage.success('备份任务已创建')
    loadBackups()
  } catch (e) {
    ElMessage.error('创建备份失败')
  }
}

const restoreBackup = (row: BackupRecord) => {
  ElMessageBox.confirm(`确定从备份 ${row.name} 恢复数据吗?`, '警告', { type: 'warning' })
    .then(async () => {
      try {
        await settingsAPI.restoreBackup(row.id)
        ElMessage.success('数据恢复中...')
      } catch (e) {
        ElMessage.error('恢复失败')
      }
    })
}

const downloadBackup = (row: BackupRecord) => ElMessage.success(`备份 ${row.name} 下载开始`)

const deleteBackup = (row: BackupRecord) => {
  ElMessageBox.confirm(`确定删除备份 ${row.name} 吗?`, '警告', { type: 'warning' })
    .then(async () => {
      try {
        await settingsAPI.deleteBackup(row.id)
        ElMessage.success('备份已删除')
        loadBackups()
      } catch (e) {
        ElMessage.error('删除失败')
      }
    })
}

onMounted(async () => {
  try {
    const data = await settingsAPI.getBackupSettings()
    backupSettings.value = data
  } catch (e) {
    ElMessage.warning('获取备份设置失败')
  }
  loadBackups()
})
</script>
