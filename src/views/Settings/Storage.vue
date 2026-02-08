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
            <span>{{ storageUsed }}GB / {{ storageTotal }}GB</span>
          </el-progress>
        </div>
      </el-alert>

      <el-form-item label="数据存储路径">
        <el-input v-model="storageSettings.dataPath" style="width: 400px">
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

      <el-form-item label="数据库类型">
        <el-select v-model="storageSettings.dbType" style="width: 200px">
          <el-option label="LevelDB" value="leveldb" />
          <el-option label="RocksDB" value="rocksdb" />
          <el-option label="PostgreSQL" value="postgres" />
          <el-option label="MongoDB" value="mongodb" />
        </el-select>
      </el-form-item>

      <el-form-item label="缓存大小">
        <el-input-number v-model="storageSettings.cacheSize" :min="128" :max="8192" :step="128" />
        <span class="unit">MB</span>
      </el-form-item>

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

      <el-form-item>
        <el-button type="primary" @click="saveStorageSettings">保存设置</el-button>
        <el-button @click="optimizeStorage" :loading="optimizing">优化存储</el-button>
        <el-button @click="cleanupStorage" type="danger">清理垃圾数据</el-button>
      </el-form-item>
    </el-form>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as settingsAPI from '@/api/settings'
import type { StorageSettings } from '@/types'
import BaseCard from '@/components/common/BaseCard.vue'

const storageSettings = ref<StorageSettings>({
  dataPath: '/data/hcp',
  logPath: '/var/log/hcp',
  dbType: 'leveldb',
  cacheSize: 1024,
  compression: true,
  compressionAlgo: 'snappy',
  autoArchive: true,
  archiveThreshold: 50
})

const optimizing = ref(false)
const storageUsed = ref(385)
const storageTotal = ref(1024)
const storageUsage = computed(() => Math.round((storageUsed.value / storageTotal.value) * 100))

const getStorageColor = (percentage: number) => {
  if (percentage >= 90) return '#F56C6C'
  if (percentage >= 70) return '#E6A23C'
  return '#67C23A'
}

const selectDataPath = () => ElMessage.info('打开文件选择器')
const selectLogPath = () => ElMessage.info('打开文件选择器')

const saveStorageSettings = async () => {
  try {
    await settingsAPI.updateStorageSettings(storageSettings.value)
    ElMessage.success('存储配置已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const optimizeStorage = () => {
  optimizing.value = true
  setTimeout(() => {
    optimizing.value = false
    ElMessage.success('存储优化完成')
  }, 2000)
}

const cleanupStorage = () => {
  ElMessageBox.confirm('确定清理垃圾数据吗?此操作不可恢复', '警告', { type: 'warning' })
    .then(() => ElMessage.success('清理完成,释放空间 15.8GB'))
}

onMounted(async () => {
  try {
    const data = await settingsAPI.getStorageSettings()
    storageSettings.value = data
  } catch (e) {
    ElMessage.warning('获取存储配置失败')
  }
})
</script>
