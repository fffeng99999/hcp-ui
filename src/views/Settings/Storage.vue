<template>
  <BaseCard class="settings-content" title="存储配置">
    <el-form :model="storageSettings" label-width="160px">
      <el-alert
        title="当前存储使用情况"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <div class="storage-info">
          <el-progress :percentage="storageUsage" :color="getStorageColor(storageUsage)">
            <span>{{ formatSize(storageSettings.storageUsed) }}GB / {{ formatSize(storageSettings.storageTotal) }}GB</span>
          </el-progress>
        </div>
      </el-alert>

      <el-form-item label="区块链数据存储路径">
        <el-input v-model="storageSettings.blockchainDataPath" style="width: 400px">
          <template #append>
            <el-button @click="selectDataPath">浏览</el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="日志存储路径">
        <el-input v-model="storageSettings.logPath" style="width: 400px">
          <template #append>
            <el-button @click="selectLogPath">浏览</el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="报告数据">
        <el-input v-model="storageSettings.reportDataPath" style="width: 400px" placeholder="报告数据存储路径">
        </el-input>
      </el-form-item>

      <el-form-item label="后端数据库类型">
        <el-input v-model="storageSettings.backendDbType" disabled style="width: 200px" />
      </el-form-item>

      <el-form-item label="区块链数据库类型">
        <el-input v-model="storageSettings.blockchainDbType" disabled style="width: 200px" />
      </el-form-item>

      <el-form-item label="缓存大小">
        <el-input-number v-model="storageSettings.cacheSize" :min="128" :max="8192" :step="128" />
        <span class="unit">MB</span>
      </el-form-item>

      <div v-show="false">
        <el-form-item label="数据压缩">
          <el-switch v-model="storageSettings.compression" />
        </el-form-item>

        <el-form-item label="压缩算法">
          <el-select v-model="storageSettings.compressionAlgo" :disabled="!storageSettings.compression" style="width: 200px">
            <el-option label="Snappy" value="snappy" />
            <el-option label="LZ4" value="lz4" />
            <el-option label="Gzip" value="gzip" />
            <el-option label="Zstd" value="zstd" />
          </el-select>
        </el-form-item>

        <el-form-item label="自动归档">
          <el-switch v-model="storageSettings.autoArchive" />
        </el-form-item>

        <el-form-item label="归档阈值">
          <el-input-number v-model="storageSettings.archiveThreshold" :min="1" :max="100" :disabled="!storageSettings.autoArchive" />
          <span class="unit">GB</span>
        </el-form-item>
      </div>

      <el-form-item>
        <el-button type="primary" @click="saveStorageSettings">保存设置</el-button>
        <el-button @click="optimizeStorage" :loading="optimizing">优化存储</el-button>
        <el-button @click="cleanupStorage" type="danger">清理垃圾数据</el-button>
      </el-form-item>
    </el-form>
  </BaseCard>
  <input
    ref="dataPathPicker"
    type="file"
    webkitdirectory
    style="display: none"
    @change="onDataPathPicked"
  />
  <input
    ref="logPathPicker"
    type="file"
    webkitdirectory
    style="display: none"
    @change="onLogPathPicked"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as settingsAPI from '@/api/settings'
import type { StorageSettings } from '@/types'
import BaseCard from '@/components/common/BaseCard.vue'
import { useConfigVersionStore } from '@/store/modules/configVersion'

// 存储配置表单数据
const storageSettings = ref<StorageSettings>({
  blockchainDataPath: '/data/hcp',
  logPath: '/var/log/hcp',
  reportDataPath: '/data/reports',
  backendDbType: 'PostgreSQL',
  blockchainDbType: 'LevelDB',
  cacheSize: 1024,
  compression: true,
  compressionAlgo: 'snappy',
  autoArchive: true,
  archiveThreshold: 50,
  storageUsed: 0,
  storageTotal: 0
})

// 原始存储配置快照，用于计算差异字段
const originalStorageSettings = ref<StorageSettings | null>(null)

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

// 存储使用率展示相关状态
const optimizing = ref(false)
const formatSize = (bytes: number | undefined) => {
  if (!bytes) return '0'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2)
}

const storageUsage = computed(() => {
    const used = storageSettings.value.storageUsed || 0
    const total = storageSettings.value.storageTotal || 1 // Avoid division by zero
    if (total === 0) return 0
    return Math.round((used / total) * 100)
})

// 根据使用率返回进度条颜色
const getStorageColor = (percentage: number) => {
  if (percentage >= 90) return '#F56C6C'
  if (percentage >= 70) return '#E6A23C'
  return '#67C23A'
}

const dataPathPicker = ref<HTMLInputElement | null>(null)
const logPathPicker = ref<HTMLInputElement | null>(null)

const selectDataPath = () => {
  dataPathPicker.value?.click()
}

const selectLogPath = () => {
  logPathPicker.value?.click()
}

const resolvePickedPath = (input: HTMLInputElement): string | null => {
  const file = input.files?.[0]
  if (!file) return null
  const rawPath = (file as any).path || file.webkitRelativePath || file.name
  if (!rawPath) return null
  if (rawPath.startsWith('/')) return rawPath
  return `/${rawPath.split('/')[0]}`
}

const onDataPathPicked = (event: Event) => {
  const input = event.target as HTMLInputElement
  const picked = resolvePickedPath(input)
  if (picked) {
    storageSettings.value.blockchainDataPath = picked
  }
  input.value = ''
}

const onLogPathPicked = (event: Event) => {
  const input = event.target as HTMLInputElement
  const picked = resolvePickedPath(input)
  if (picked) {
    storageSettings.value.logPath = picked
  }
  input.value = ''
}

// 调用后端接口校验路径可用性
const validatePath = async (label: string, path: string) => {
  if (!path) return
  try {
    await settingsAPI.validateStoragePath(path)
    ElMessage.success(`${label}可用`)
  } catch (e) {
    ElMessage.error(`${label}不可用，请检查路径或权限`)
  }
}

watch(
  () => storageSettings.value.blockchainDataPath,
  (val) => {
    validatePath('区块链数据存储路径', val)
  }
)

watch(
  () => storageSettings.value.logPath,
  (val) => {
    validatePath('日志存储路径', val)
  }
)

// 保存存储配置，只提交变更字段
const saveStorageSettings = async () => {
  if (
    localVersion.value !== null &&
    configVersionStore.currentVersion !== null &&
    configVersionStore.currentVersion > localVersion.value
  ) {
    await ElMessageBox.alert('检测到存储配置已被其他终端修改，请刷新页面后重试', '配置版本过期', {
      type: 'warning'
    })
    return
  }
  try {
    const payload = getChangedFields(storageSettings.value, originalStorageSettings.value)
    await settingsAPI.updateStorageSettings(payload)
    originalStorageSettings.value = { ...storageSettings.value }
    localVersion.value = configVersionStore.currentVersion
    ElMessage.success('存储配置已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

// 模拟存储优化操作
const optimizeStorage = () => {
  optimizing.value = true
  setTimeout(() => {
    optimizing.value = false
    ElMessage.success('存储优化完成')
  }, 2000)
}

// 模拟清理垃圾数据操作
const cleanupStorage = () => {
  ElMessageBox.confirm('确定清理垃圾数据吗?此操作不可恢复', '警告', { type: 'warning' })
    .then(() => ElMessage.success('清理完成,释放空间 15.8GB'))
}

onMounted(async () => {
  try {
    const data = await settingsAPI.getStorageSettings()
    storageSettings.value = data
    originalStorageSettings.value = { ...data }
    localVersion.value = configVersionStore.currentVersion
  } catch (e) {
    ElMessage.warning('获取存储配置失败')
  }
})
</script>
