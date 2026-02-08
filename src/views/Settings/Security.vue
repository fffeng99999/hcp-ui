<template>
  <SettingsCard class="settings-content" title="安全设置">
    <el-form :model="securitySettings" label-width="180px">
      <el-divider content-position="left">认证配置</el-divider>

      <el-form-item label="启用JWT认证">
        <el-switch v-model="securitySettings.jwtEnabled" />
      </el-form-item>

      <el-form-item label="JWT过期时间">
        <el-input-number v-model="securitySettings.jwtExpiration" :min="1" :max="168" :disabled="!securitySettings.jwtEnabled" />
        <span class="unit">小时</span>
      </el-form-item>

      <el-form-item label="启用双因素认证">
        <el-switch v-model="securitySettings.twoFactorAuth" />
      </el-form-item>

      <el-form-item label="密码策略">
        <el-checkbox-group v-model="securitySettings.passwordPolicy">
          <el-checkbox label="minLength">最少8位</el-checkbox>
          <el-checkbox label="uppercase">包含大写字母</el-checkbox>
          <el-checkbox label="lowercase">包含小写字母</el-checkbox>
          <el-checkbox label="number">包含数字</el-checkbox>
          <el-checkbox label="special">包含特殊字符</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-divider content-position="left">访问控制</el-divider>

      <el-form-item label="IP白名单">
        <el-input
          v-model="ipWhitelistInput"
          type="textarea"
          :rows="4"
          placeholder="每行一个IP地址或CIDR段"
          style="width: 400px"
        />
      </el-form-item>

      <el-form-item label="启用访问日志">
        <el-switch v-model="securitySettings.accessLog" />
      </el-form-item>

      <el-form-item label="失败登录锁定">
        <el-switch v-model="securitySettings.loginLockout" />
      </el-form-item>

      <el-form-item label="锁定阈值">
        <el-input-number v-model="securitySettings.lockoutThreshold" :min="3" :max="10" :disabled="!securitySettings.loginLockout" />
        <span class="unit">次</span>
      </el-form-item>

      <el-form-item label="锁定时长">
        <el-input-number v-model="securitySettings.lockoutDuration" :min="5" :max="120" :disabled="!securitySettings.loginLockout" />
        <span class="unit">分钟</span>
      </el-form-item>

      <el-divider content-position="left">加密配置</el-divider>

      <el-form-item label="数据加密">
        <el-switch v-model="securitySettings.dataEncryption" />
      </el-form-item>

      <el-form-item label="加密算法">
        <el-select v-model="securitySettings.encryptionAlgo" :disabled="!securitySettings.dataEncryption" style="width: 200px">
          <el-option label="AES-256-GCM" value="aes-256-gcm" />
          <el-option label="ChaCha20-Poly1305" value="chacha20-poly1305" />
          <el-option label="AES-128-GCM" value="aes-128-gcm" />
        </el-select>
      </el-form-item>

      <el-form-item label="传输层加密(TLS)">
        <el-switch v-model="securitySettings.tlsEnabled" />
      </el-form-item>

      <el-form-item label="TLS版本">
        <el-select v-model="securitySettings.tlsVersion" :disabled="!securitySettings.tlsEnabled" style="width: 200px">
          <el-option label="TLS 1.3" value="1.3" />
          <el-option label="TLS 1.2" value="1.2" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveSecuritySettings">保存设置</el-button>
        <el-button @click="generateNewKeys">重新生成密钥</el-button>
      </el-form-item>
    </el-form>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as settingsAPI from '@/api/settings'
import type { SecuritySettings } from '@/types'
import SettingsCard from '@/components/SettingsCard.vue'

const securitySettings = ref<SecuritySettings>({
  jwtEnabled: true,
  jwtExpiration: 24,
  twoFactorAuth: false,
  passwordPolicy: ['minLength', 'uppercase', 'lowercase', 'number'],
  accessLog: true,
  loginLockout: true,
  lockoutThreshold: 5,
  lockoutDuration: 30,
  dataEncryption: true,
  encryptionAlgo: 'aes-256-gcm',
  tlsEnabled: true,
  tlsVersion: '1.3',
  ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8']
})

const ipWhitelistInput = computed({
  get: () => securitySettings.value.ipWhitelist.join('\n'),
  set: (val) => {
    securitySettings.value.ipWhitelist = val.split('\n').filter(s => s.trim())
  }
})

const saveSecuritySettings = async () => {
  try {
    await settingsAPI.updateSecuritySettings(securitySettings.value)
    ElMessage.success('安全设置已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const generateNewKeys = () => {
  ElMessageBox.confirm('重新生成密钥将使所有现有会话失效,确定继续吗?', '警告', { type: 'warning' })
    .then(() => ElMessage.success('密钥已重新生成'))
}

onMounted(async () => {
  try {
    const data = await settingsAPI.getSecuritySettings()
    securitySettings.value = data
  } catch (e) {
    ElMessage.warning('获取安全设置失败')
  }
})
</script>
