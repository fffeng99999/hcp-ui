<template>
  <div class="consensus-container">
    <div class="page-header">
      <h1>共识算法配置</h1>
      <p class="subtitle">支持多种共识算法参数调整</p>
    </div>

    <!-- 算法选择 -->
    <div class="algorithms-grid">
      <div
        v-for="algo in consensusStore.algorithms"
        :key="algo.id"
        :class="['algo-card card', { active: selectedAlgo?.id === algo.id }]"
        @click="selectedAlgo = algo"
      >
        <h3>{{ algo.name }}</h3>
        <p class="algo-description">{{ algo.description }}</p>
        <div class="algo-meta">
          <span v-if="currentConfig?.algorithm === algo.id" class="badge-active">
            ✓ 当前使用
          </span>
        </div>
      </div>
    </div>

    <!-- 参数配置 -->
    <div v-if="selectedAlgo" class="config-section card">
      <h2>配置参数</h2>

      <form @submit.prevent="applyConfig">
        <div v-for="param in selectedAlgo.parameters" :key="param.key" class="form-group">
          <label :for="param.key">
            {{ param.name }}
            <span v-if="param.unit" class="unit">({{ param.unit }})</span>
          </label>
          <p class="param-description">{{ param.description }}</p>

          <!-- 文本输入 -->
          <input
            v-if="param.type === 'string'"
            :id="param.key"
            v-model="configForm[param.key]"
            type="text"
          />

          <!-- 数字输入 -->
          <input
            v-else-if="param.type === 'number'"
            :id="param.key"
            v-model.number="configForm[param.key]"
            type="number"
            :min="param.min"
            :max="param.max"
            :step="param.step"
          />

          <!-- 布尔选择 -->
          <select v-else-if="param.type === 'boolean'" :id="param.key"
            v-model="configForm[param.key]"
          >
            <option :value="true">启用</option>
            <option :value="false">禁用</option>
          </select>

          <!-- 下拉选择 -->
          <select v-else-if="param.type === 'select'" :id="param.key"
            v-model="configForm[param.key]"
          >
            <option
              v-for="option in param.options"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-lg">
            应用配置
          </button>
          <button
            type="button"
            class="btn btn-secondary btn-lg"
            @click="resetForm"
          >
            重置
          </button>
        </div>
      </form>
    </div>

    <!-- 配置历史 -->
    <div class="history-section card">
      <h2>配置历史</h2>
      <div v-if="consensusStore.configHistory.length === 0" class="empty">
        暂无配置历史
      </div>
      <div v-else class="history-list">
        <div
          v-for="config in consensusStore.configHistory"
          :key="config.id"
          class="history-item"
        >
          <div class="history-header">
            <span class="algo-name">{{ config.algorithm }}</span>
            <span :class="`status-${config.status}`">
              {{ config.status === 'active' ? '当前' : '历史' }}
            </span>
          </div>
          <p class="history-time">{{ formatDate(config.appliedAt) }}</p>
          <p class="history-nodes">{{ config.nodeCount }} 个节点</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useConsensusStore } from '../../stores/modules/consensus'
import type { ConsensusAlgorithm, ConsensusConfig } from '../../types'

const consensusStore = useConsensusStore()
const selectedAlgo = ref<ConsensusAlgorithm | null>(null)
const configForm = ref<Record<string, any>>({})

const currentConfig = computed(() => consensusStore.currentConfig)

const initializeForm = () => {
  if (!selectedAlgo.value) return

  const form: Record<string, any> = {}
  selectedAlgo.value.parameters.forEach(param => {
    form[param.key] =
      currentConfig.value?.parameters[param.key] ?? param.defaultValue
  })
  configForm.value = form
}

const applyConfig = async () => {
  if (!selectedAlgo.value) return

  const newConfig: Partial<ConsensusConfig> = {
    algorithm: selectedAlgo.value.id,
    parameters: configForm.value
  }

  try {
    await consensusStore.updateConfig(newConfig)
    alert('配置已成功应用！')
  } catch (error) {
    console.error('Failed to apply config:', error)
    alert('配置应用失败')
  }
}

const resetForm = () => {
  initializeForm()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

watch(selectedAlgo, () => {
  initializeForm()
})

onMounted(async () => {
  await consensusStore.fetchAlgorithms()
  await consensusStore.fetchConfig()
  await consensusStore.fetchConfigHistory()

  if (
    consensusStore.algorithms.length > 0 &&
    !selectedAlgo.value
  ) {
    selectedAlgo.value = consensusStore.algorithms
  }
})
</script>

<style scoped>
.consensus-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
}

.subtitle {
  margin: 0;
  color: var(--color-text-secondary);
}

/* 算法卡片 */
.algorithms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.algo-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.algo-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.algo-card.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.algo-card h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--color-text-primary);
}

.algo-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.algo-meta {
  display: flex;
  gap: 8px;
}

.badge-active {
  display: inline-block;
  padding: 4px 12px;
  background: var(--color-success);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* 配置部分 */
.config-section {
  margin-bottom: 32px;
}

.config-section h2,
.history-section h2 {
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.unit {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: normal;
}

.param-description {
  margin: 4px 0 8px 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.form-group input,
.form-group select {
  width: 100%;
  max-width: 400px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

/* 历史列表 */
.history-section {
  margin-bottom: 24px;
}

.empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-secondary);
}

.history-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.history-item {
  padding: 16px;
  background: var(--color-bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--color-border-light);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.algo-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.status-active {
  display: inline-block;
  padding: 2px 8px;
  background: var(--color-success);
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.history-time {
  margin: 8px 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.history-nodes {
  margin: 4px 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .algorithms-grid {
    grid-template-columns: 1fr;
  }

  .form-group input,
  .form-group select {
    max-width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
