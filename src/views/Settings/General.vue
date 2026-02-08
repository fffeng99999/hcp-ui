<template>
  <BaseCard class="settings-content" title="通用设置">
    <el-form :model="generalSettings" label-width="160px">
      <el-form-item label="系统名称">
        <el-input v-model="generalSettings.systemName" style="width: 400px" />
      </el-form-item>

      <el-form-item label="默认语言">
        <el-select v-model="generalSettings.language" style="width: 200px">
          <el-option label="简体中文" value="zh-CN" />
          <el-option label="English" value="en-US" />
          <el-option label="日本語" value="ja-JP" />
        </el-select>
      </el-form-item>

      <el-form-item label="时区">
        <el-select v-model="generalSettings.timezone" style="width: 300px">
          <el-option label="UTC+8 北京时间" value="Asia/Shanghai" />
          <el-option label="UTC+0 协调世界时" value="UTC" />
          <el-option label="UTC-5 美国东部时间" value="America/New_York" />
        </el-select>
      </el-form-item>

      <el-form-item label="日志级别">
        <el-radio-group v-model="generalSettings.logLevel">
          <el-radio label="debug">调试</el-radio>
          <el-radio label="info">信息</el-radio>
          <el-radio label="warn">警告</el-radio>
          <el-radio label="error">错误</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="数据保留期限">
        <el-input-number v-model="generalSettings.dataRetention" :min="7" :max="365" />
        <span class="unit">天</span>
      </el-form-item>

      <el-form-item label="自动清理过期数据">
        <el-switch v-model="generalSettings.autoCleanup" />
      </el-form-item>

      <el-form-item label="启用性能监控">
        <el-switch v-model="generalSettings.performanceMonitor" />
      </el-form-item>

      <el-form-item label="API请求限流">
        <el-input-number v-model="generalSettings.rateLimit" :min="100" :max="10000" :step="100" />
        <span class="unit">次/分钟</span>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveGeneralSettings">保存设置</el-button>
        <el-button @click="resetGeneralSettings">重置</el-button>
      </el-form-item>
    </el-form>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as settingsAPI from '@/api/settings'
import type { GeneralSettings } from '@/types'
import BaseCard from '@/components/common/BaseCard.vue'

const generalSettings = ref<GeneralSettings>({
  systemName: 'HCP-Bench系统',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  logLevel: 'info',
  dataRetention: 30,
  autoCleanup: true,
  performanceMonitor: true,
  rateLimit: 1000
})

const saveGeneralSettings = async () => {
  try {
    await settingsAPI.updateGeneralSettings(generalSettings.value)
    ElMessage.success('通用设置已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const resetGeneralSettings = async () => {
  try {
    const data = await settingsAPI.getGeneralSettings()
    generalSettings.value = data
    ElMessage.info('已重置')
  } catch (e) {
    ElMessage.warning('重置失败')
  }
}

onMounted(async () => {
  try {
    const data = await settingsAPI.getGeneralSettings()
    generalSettings.value = data
  } catch (e) {
    ElMessage.warning('获取通用设置失败')
  }
})
</script>
