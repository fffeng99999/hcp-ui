<template>
  <BaseCard class="settings-content" title="备份恢复">
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
    <input
      ref="backupPathPicker"
      type="file"
      webkitdirectory
      style="display: none"
      @change="onBackupPathPicked"
    />
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FolderAdd, Upload, Download } from '@element-plus/icons-vue'
import * as settingsAPI from '@/api/settings'
import type { BackupSettings, BackupRecord } from '@/types'
import BaseCard from '@/components/common/BaseCard.vue'
import { useConfigVersionStore } from '@/store/modules/configVersion'

// 备份设置表单数据
const backupSettings = ref<BackupSettings>({
  autoBackup: true,
  frequency: 'daily',
  retentionCount: 7,
  backupPath: '/backup/hcp'
})

// 原始备份设置快照，用于计算差异字段
const originalBackupSettings = ref<BackupSettings | null>(null)

// 本地保存的配置版本号，用于与全局版本号对比
const configVersionStore = useConfigVersionStore()
const localVersion = ref<number | null>(null)

// 计算对象差异，只提交被修改的字段给后端
const getChangedFields = <T extends Record<string, any>>(current: T, original: T | null): Partial<T> => {
  if (!original) return { ...current }
  const diff: Partial<T> = {}
  Object.keys(current).forEach((key) => {
    const k = key as keyof T
    const cur = current[k]
    const orig = original[k]
    if (Array.isArray(cur) && Array.isArray(orig)) {
      if (cur.length !== orig.length || cur.some((v: unknown, i: number) => v !== orig[i])) {
        diff[k] = cur
      }
    } else if (cur !== orig) {
      diff[k] = cur
    }
  })
  return diff
}

// 当前备份记录列表
const backupList = ref<BackupRecord[]>([])

// 从后端加载备份记录列表
const loadBackups = async () => {
  try {
    const data = await settingsAPI.getBackupRecords()
    backupList.value = data.map((item: any) => ({
      id: item.id,
      name: item.filename || item.name || 'backup',
      size: item.size_bytes ? `${Math.round(item.size_bytes / 1024 / 1024)}MB` : item.size || '-',
      type: item.type || '自动',
      createdAt: item.created_at || item.createdAt || '-',
      status: item.status === 'success' ? '完整' : item.status === 'failed' ? '损坏' : item.status || '进行中'
    }))
  } catch (e) {
    ElMessage.warning('获取备份列表失败')
  }
}

// 保存备份设置，只提交变更字段
const saveBackupSettings = async () => {
  if (
    localVersion.value !== null &&
    configVersionStore.currentVersion !== null &&
    configVersionStore.currentVersion > localVersion.value
  ) {
    await ElMessageBox.alert('检测到备份设置已被其他终端修改，请刷新页面后重试', '配置版本过期', {
      type: 'warning'
    })
    return
  }
  try {
    const payload = getChangedFields(backupSettings.value, originalBackupSettings.value)
    await settingsAPI.updateBackupSettings(payload)
    originalBackupSettings.value = { ...backupSettings.value }
    localVersion.value = configVersionStore.currentVersion
    ElMessage.success('备份设置已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const backupPathPicker = ref<HTMLInputElement | null>(null)

const selectBackupPath = () => {
  backupPathPicker.value?.click()
}

const onBackupPathPicked = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const rawPath = (file as any).path || file.webkitRelativePath || file.name
  if (!rawPath) return
  if (rawPath.startsWith('/')) {
    backupSettings.value.backupPath = rawPath
  } else {
    backupSettings.value.backupPath = `/${rawPath.split('/')[0]}`
  }
  input.value = ''
}

// 校验备份路径可用性
const validateBackupPath = async (path: string) => {
  if (!path) return
  try {
    await settingsAPI.validateStoragePath(path)
    ElMessage.success('备份路径可用')
  } catch (e) {
    ElMessage.error('备份路径不可用，请检查路径或权限')
  }
}

watch(
  () => backupSettings.value.backupPath,
  (val) => {
    validateBackupPath(val)
  }
)

// 触发一次立即备份任务
const createBackup = async () => {
  try {
    await settingsAPI.triggerBackup()
    ElMessage.success('备份任务已创建')
    loadBackups()
  } catch (e) {
    ElMessage.error('创建备份失败')
  }
}

// 从指定备份记录恢复数据
const restoreBackup = (row: BackupRecord) => {
  ElMessageBox.confirm(`确定从备份 ${row.name} 恢复数据吗?`, '警告', { type: 'warning' })
    .then(async () => {
      try {
        await settingsAPI.restoreBackup(row.id)
        ElMessage.success('恢复任务已提交')
      } catch (e) {
        ElMessage.error('恢复失败')
      }
    })
}

// 模拟下载备份文件
const downloadBackup = (row: BackupRecord) => ElMessage.success(`备份 ${row.name} 下载开始`)

// 删除指定备份记录
const deleteBackup = (row: BackupRecord) => {
  ElMessageBox.confirm(`确定删除备份 ${row.name} 吗?`, '警告', { type: 'warning' })
    .then(async () => {
      try {
        await settingsAPI.deleteBackup(row.id)
        ElMessage.success('备份删除任务已提交')
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
    originalBackupSettings.value = { ...data }
    localVersion.value = configVersionStore.currentVersion
  } catch (e) {
    ElMessage.warning('获取备份设置失败')
  }
  loadBackups()
})
</script>
