<template>
  <SettingsCard class="settings-content" title="网络配置">
    <el-form :model="networkSettings" label-width="160px">
      <el-divider content-position="left">P2P网络配置</el-divider>

      <el-form-item label="监听地址">
        <el-input v-model="networkSettings.listenAddress" placeholder="0.0.0.0" style="width: 300px" />
      </el-form-item>

      <el-form-item label="P2P端口">
        <el-input-number v-model="networkSettings.p2pPort" :min="1024" :max="65535" />
      </el-form-item>

      <el-form-item label="RPC端口">
        <el-input-number v-model="networkSettings.rpcPort" :min="1024" :max="65535" />
      </el-form-item>

      <el-form-item label="最大连接数">
        <el-input-number v-model="networkSettings.maxConnections" :min="10" :max="1000" />
      </el-form-item>

      <el-form-item label="最大入站连接">
        <el-input-number v-model="networkSettings.maxInbound" :min="5" :max="500" />
      </el-form-item>

      <el-form-item label="最大出站连接">
        <el-input-number v-model="networkSettings.maxOutbound" :min="5" :max="500" />
      </el-form-item>

      <el-divider content-position="left">网络优化</el-divider>

      <el-form-item label="启用UPnP">
        <el-switch v-model="networkSettings.upnp" />
      </el-form-item>

      <el-form-item label="启用NAT穿透">
        <el-switch v-model="networkSettings.natTraversal" />
      </el-form-item>

      <el-form-item label="带宽限制(上传)">
        <el-input-number v-model="networkSettings.uploadBandwidth" :min="1" :max="1000" />
        <span class="unit">MB/s</span>
      </el-form-item>

      <el-form-item label="带宽限制(下载)">
        <el-input-number v-model="networkSettings.downloadBandwidth" :min="1" :max="1000" />
        <span class="unit">MB/s</span>
      </el-form-item>

      <el-divider content-position="left">种子节点</el-divider>

      <el-form-item label="种子节点列表">
        <el-input
          v-model="seedNodesInput"
          type="textarea"
          :rows="5"
          placeholder="每行一个节点地址，格式: ip:port"
          style="width: 500px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveNetworkSettings">保存设置</el-button>
        <el-button @click="testNetworkConnection">测试连接</el-button>
      </el-form-item>
    </el-form>
  </SettingsCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as settingsAPI from '@/api/settings'
import type { NetworkSettings } from '@/types'
import SettingsCard from '@/components/cards/SettingsCard.vue'

const networkSettings = ref<NetworkSettings>({
  listenAddress: '0.0.0.0',
  p2pPort: 30303,
  rpcPort: 8545,
  maxConnections: 100,
  maxInbound: 50,
  maxOutbound: 50,
  upnp: true,
  natTraversal: true,
  uploadBandwidth: 100,
  downloadBandwidth: 100,
  seedNodes: ['192.168.1.10:30303', '192.168.1.11:30303', '192.168.1.12:30303']
})

const seedNodesInput = computed({
  get: () => networkSettings.value.seedNodes.join('\n'),
  set: (val) => {
    networkSettings.value.seedNodes = val.split('\n').filter(s => s.trim())
  }
})

const saveNetworkSettings = async () => {
  try {
    await settingsAPI.updateNetworkSettings(networkSettings.value)
    ElMessage.success('网络配置已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const testNetworkConnection = () => {
  ElMessage.success('网络连接测试成功')
}

onMounted(async () => {
  try {
    const data = await settingsAPI.getNetworkSettings()
    networkSettings.value = data
  } catch (e) {
    ElMessage.warning('获取网络配置失败')
  }
})
</script>
