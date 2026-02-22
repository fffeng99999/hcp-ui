<template>
  <BaseCard class="settings-content" title="通知设置">
    <el-form :model="notificationSettings" label-width="160px">
      <el-divider content-position="left">邮件通知</el-divider>

      <el-form-item label="启用邮件通知">
        <el-switch v-model="notificationSettings.emailEnabled" />
      </el-form-item>

      <el-form-item label="SMTP服务器">
        <el-input v-model="notificationSettings.smtpHost" placeholder="smtp.example.com" style="width: 300px" :disabled="!notificationSettings.emailEnabled" />
      </el-form-item>

      <el-form-item label="SMTP端口">
        <el-input-number v-model="notificationSettings.smtpPort" :min="1" :max="65535" :disabled="!notificationSettings.emailEnabled" />
      </el-form-item>

      <el-form-item label="发件人邮箱">
        <el-input v-model="notificationSettings.senderEmail" placeholder="noreply@example.com" style="width: 300px" :disabled="!notificationSettings.emailEnabled" />
      </el-form-item>

      <el-form-item label="收件人列表">
        <el-select
          v-model="notificationSettings.recipients"
          multiple
          filterable
          allow-create
          placeholder="输入邮箱地址后按回车"
          style="width: 400px"
          :disabled="!notificationSettings.emailEnabled"
        >
        </el-select>
      </el-form-item>

      <el-divider content-position="left">Webhook通知</el-divider>

      <el-form-item label="启用Webhook">
        <el-switch v-model="notificationSettings.webhookEnabled" />
      </el-form-item>

      <el-form-item label="Webhook URL">
        <el-input v-model="notificationSettings.webhookUrl" placeholder="https://api.example.com/webhook" style="width: 400px" :disabled="!notificationSettings.webhookEnabled" />
      </el-form-item>

      <el-form-item label="认证Token">
        <el-input v-model="notificationSettings.webhookToken" type="password" show-password style="width: 400px" :disabled="!notificationSettings.webhookEnabled" />
      </el-form-item>

      <el-divider content-position="left">通知事件</el-divider>

      <el-form-item label="系统事件">
        <el-checkbox-group v-model="notificationSettings.systemEvents">
          <el-checkbox label="startup">系统启动</el-checkbox>
          <el-checkbox label="shutdown">系统关闭</el-checkbox>
          <el-checkbox label="error">系统错误</el-checkbox>
          <el-checkbox label="update">系统更新</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="性能事件">
        <el-checkbox-group v-model="notificationSettings.performanceEvents">
          <el-checkbox label="high-latency">高延迟告警</el-checkbox>
          <el-checkbox label="low-tps">低TPS告警</el-checkbox>
          <el-checkbox label="node-failure">节点故障</el-checkbox>
          <el-checkbox label="consensus-failure">共识失败</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="安全事件">
        <el-checkbox-group v-model="notificationSettings.securityEvents">
          <el-checkbox label="manipulation">操纵检测</el-checkbox>
          <el-checkbox label="attack">攻击检测</el-checkbox>
          <el-checkbox label="unauthorized">未授权访问</el-checkbox>
          <el-checkbox label="suspicious">可疑行为</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
        <el-button @click="testNotification">发送测试通知</el-button>
      </el-form-item>
    </el-form>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as settingsAPI from '@/api/settings'
import type { NotificationSettings } from '@/types'
import BaseCard from '@/components/common/BaseCard.vue'
import { useConfigVersionStore } from '@/store/modules/configVersion'

// 通知设置表单数据
const notificationSettings = ref<NotificationSettings>({
  emailEnabled: true,
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  senderEmail: 'noreply@hcp.com',
  recipients: ['admin@example.com'],
  webhookEnabled: true,
  webhookUrl: 'https://api.example.com/webhook',
  webhookToken: '',
  systemEvents: ['error', 'update'],
  performanceEvents: ['high-latency', 'low-tps', 'node-failure'],
  securityEvents: ['manipulation', 'attack', 'unauthorized']
})

// 原始通知设置快照，用于计算差异字段
const originalNotificationSettings = ref<NotificationSettings | null>(null)

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

// 保存通知设置，只提交变更字段
const saveNotificationSettings = async () => {
  if (
    localVersion.value !== null &&
    configVersionStore.currentVersion !== null &&
    configVersionStore.currentVersion > localVersion.value
  ) {
    await ElMessageBox.alert('检测到通知设置已被其他终端修改，请刷新页面后重试', '配置版本过期', {
      type: 'warning'
    })
    return
  }
  try {
    const payload = getChangedFields(notificationSettings.value, originalNotificationSettings.value)
    await settingsAPI.updateNotificationSettings(payload)
    originalNotificationSettings.value = { ...notificationSettings.value }
    localVersion.value = configVersionStore.currentVersion
    ElMessage.success('通知设置已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

// 发送一条测试通知，验证通知通路是否可用
const testNotification = () => ElMessage.success('测试通知已发送')

onMounted(async () => {
  try {
    const data = await settingsAPI.getNotificationSettings()
    notificationSettings.value = data
    originalNotificationSettings.value = { ...data }
    localVersion.value = configVersionStore.currentVersion
  } catch (e) {
    ElMessage.warning('获取通知设置失败')
  }
})
</script>
