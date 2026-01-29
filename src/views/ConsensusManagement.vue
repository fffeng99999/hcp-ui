<template>
  <div class="consensus-config-page">
    <!-- 共识算法对比卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="algo in consensusAlgorithms" :key="algo.name">
        <el-card 
          class="consensus-card" 
          :class="{ active: selectedAlgo === algo.name }"
          @click="selectedAlgo = algo.name"
        >
          <div class="algo-header">
            <el-icon :size="32" :color="algo.color">
              <component :is="algo.icon" />
            </el-icon>
            <h3>{{ algo.name }}</h3>
          </div>
          <div class="algo-stats">
            <div class="stat-item">
              <span class="label">平均延迟</span>
              <span class="value">{{ algo.avgLatency }}ms</span>
            </div>
            <div class="stat-item">
              <span class="label">峰值TPS</span>
              <span class="value">{{ algo.peakTps }}</span>
            </div>
            <div class="stat-item">
              <span class="label">容错率</span>
              <span class="value">{{ algo.faultTolerance }}</span>
            </div>
          </div>
          <el-tag :type="algo.recommended ? 'success' : 'info'" size="small">
            {{ algo.recommended ? '推荐使用' : '标准算法' }}
          </el-tag>
        </el-card>
      </el-col>
    </el-row>

    <!-- 配置面板 -->
    <el-card class="config-panel">
      <template #header>
        <div class="card-header">
          <span>{{ selectedAlgo }} 配置参数</span>
          <div>
            <el-button @click="resetConfig">重置默认</el-button>
            <el-button type="primary" @click="saveConfig">保存配置</el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 基础参数 -->
        <el-tab-pane label="基础参数" name="basic">
          <el-form :model="config" label-width="180px" class="config-form">
            <el-row :gutter="40">
              <el-col :span="12">
                <el-form-item label="视图变更超时">
                  <el-input-number v-model="config.viewChangeTimeout" :min="1000" :max="30000" :step="1000" />
                  <span class="unit">ms</span>
                </el-form-item>

                <el-form-item label="区块生成间隔">
                  <el-input-number v-model="config.blockInterval" :min="1" :max="60" />
                  <span class="unit">秒</span>
                </el-form-item>

                <el-form-item label="最大区块大小">
                  <el-input-number v-model="config.maxBlockSize" :min="1" :max="32" />
                  <span class="unit">MB</span>
                </el-form-item>

                <el-form-item label="交易池大小">
                  <el-input-number v-model="config.txPoolSize" :min="1000" :max="100000" :step="1000" />
                  <span class="unit">条</span>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="最小节点数">
                  <el-input-number v-model="config.minNodes" :min="4" :max="100" />
                  <span class="unit">个</span>
                </el-form-item>

                <el-form-item label="共识轮次超时">
                  <el-input-number v-model="config.consensusTimeout" :min="5000" :max="60000" :step="1000" />
                  <span class="unit">ms</span>
                </el-form-item>

                <el-form-item label="确认区块数">
                  <el-input-number v-model="config.confirmations" :min="1" :max="12" />
                  <span class="unit">块</span>
                </el-form-item>

                <el-form-item label="网络延迟容忍">
                  <el-input-number v-model="config.networkLatency" :min="100" :max="5000" :step="100" />
                  <span class="unit">ms</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <!-- 高级参数 -->
        <el-tab-pane label="高级参数" name="advanced">
          <el-form :model="config" label-width="180px" class="config-form">
            <el-row :gutter="40">
              <el-col :span="12">
                <el-form-item label="动态节点选择">
                  <el-switch v-model="config.dynamicNodeSelection" />
                  <el-tooltip content="启用基于信誉的动态节点选择机制">
                    <el-icon style="margin-left: 8px"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </el-form-item>

                <el-form-item label="信誉评分阈值">
                  <el-slider v-model="config.reputationThreshold" :min="0" :max="100" show-stops />
                </el-form-item>

                <el-form-item label="批量处理大小">
                  <el-input-number v-model="config.batchSize" :min="100" :max="10000" :step="100" />
                  <span class="unit">条交易</span>
                </el-form-item>

                <el-form-item label="并行验证">
                  <el-switch v-model="config.parallelValidation" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="自适应超时">
                  <el-switch v-model="config.adaptiveTimeout" />
                  <el-tooltip content="根据网络状况动态调整超时参数">
                    <el-icon style="margin-left: 8px"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </el-form-item>

                <el-form-item label="检查点间隔">
                  <el-input-number v-model="config.checkpointInterval" :min="10" :max="1000" :step="10" />
                  <span class="unit">块</span>
                </el-form-item>

                <el-form-item label="预执行交易">
                  <el-switch v-model="config.preExecution" />
                  <el-tooltip content="启用交易预执行优化">
                    <el-icon style="margin-left: 8px"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </el-form-item>

                <el-form-item label="压缩算法">
                  <el-select v-model="config.compressionAlgo" style="width: 200px">
                    <el-option label="无压缩" value="none" />
                    <el-option label="Gzip" value="gzip" />
                    <el-option label="Snappy" value="snappy" />
                    <el-option label="LZ4" value="lz4" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <!-- 性能优化 -->
        <el-tab-pane label="性能优化" name="optimization">
          <el-form :model="config" label-width="180px" class="config-form">
            <el-alert 
              title="tPBFT优化建议" 
              type="success" 
              :closable="false"
              style="margin-bottom: 20px"
            >
              <template #default>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>启用动态节点选择可提升30%吞吐量</li>
                  <li>建议节点数设置为50-100以平衡性能与容错</li>
                  <li>在高频交易场景下启用批量处理</li>
                </ul>
              </template>
            </el-alert>

            <el-row :gutter="40">
              <el-col :span="12">
                <el-form-item label="启用缓存">
                  <el-checkbox-group v-model="config.cacheOptions">
                    <el-checkbox label="transaction">交易缓存</el-checkbox>
                    <el-checkbox label="signature">签名缓存</el-checkbox>
                    <el-checkbox label="state">状态缓存</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="流水线深度">
                  <el-input-number v-model="config.pipelineDepth" :min="1" :max="10" />
                  <span class="unit">级</span>
                </el-form-item>

                <el-form-item label="内存池大小">
                  <el-input-number v-model="config.memPoolSize" :min="512" :max="8192" :step="512" />
                  <span class="unit">MB</span>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="网络优化">
                  <el-checkbox-group v-model="config.networkOptimizations">
                    <el-checkbox label="tcp-nodelay">TCP_NODELAY</el-checkbox>
                    <el-checkbox label="tcp-quickack">TCP_QUICKACK</el-checkbox>
                    <el-checkbox label="multicast">组播优化</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="I/O线程数">
                  <el-input-number v-model="config.ioThreads" :min="1" :max="16" />
                  <span class="unit">个</span>
                </el-form-item>

                <el-form-item label="CPU亲和性">
                  <el-switch v-model="config.cpuAffinity" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 性能预估 -->
    <el-card>
      <template #header>
        <span>性能预估</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="performance-metric">
            <el-icon :size="40" color="#409EFF"><TrendCharts /></el-icon>
            <div>
              <div class="metric-label">预估TPS</div>
              <div class="metric-value">{{ estimatedTps }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="performance-metric">
            <el-icon :size="40" color="#67C23A"><Timer /></el-icon>
            <div>
              <div class="metric-label">预估延迟</div>
              <div class="metric-value">{{ estimatedLatency }}ms</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="performance-metric">
            <el-icon :size="40" color="#E6A23C"><Connection /></el-icon>
            <div>
              <div class="metric-label">建议节点数</div>
              <div class="metric-value">{{ recommendedNodes }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Setting, Checked, Document, DataLine, 
  QuestionFilled, TrendCharts, Timer, Connection 
} from '@element-plus/icons-vue'

const selectedAlgo = ref('tPBFT')
const activeTab = ref('basic')

const consensusAlgorithms = ref([
  {
    name: 'tPBFT',
    icon: 'Checked',
    color: '#67C23A',
    avgLatency: 328,
    peakTps: 2200,
    faultTolerance: '33%',
    recommended: true
  },
  {
    name: 'PBFT',
    icon: 'Setting',
    color: '#E6A23C',
    avgLatency: 486,
    peakTps: 1400,
    faultTolerance: '33%',
    recommended: false
  },
  {
    name: 'Raft',
    icon: 'Document',
    color: '#409EFF',
    avgLatency: 558,
    peakTps: 1100,
    faultTolerance: '50%',
    recommended: false
  },
  {
    name: 'HotStuff',
    icon: 'DataLine',
    color: '#F56C6C',
    avgLatency: 412,
    peakTps: 1800,
    faultTolerance: '33%',
    recommended: false
  }
])

const config = ref({
  // 基础参数
  viewChangeTimeout: 10000,
  blockInterval: 3,
  maxBlockSize: 4,
  txPoolSize: 50000,
  minNodes: 10,
  consensusTimeout: 15000,
  confirmations: 6,
  networkLatency: 500,
  
  // 高级参数
  dynamicNodeSelection: true,
  reputationThreshold: 70,
  batchSize: 1000,
  parallelValidation: true,
  adaptiveTimeout: true,
  checkpointInterval: 100,
  preExecution: true,
  compressionAlgo: 'snappy',
  
  // 性能优化
  cacheOptions: ['transaction', 'signature'],
  pipelineDepth: 5,
  memPoolSize: 2048,
  networkOptimizations: ['tcp-nodelay', 'multicast'],
  ioThreads: 8,
  cpuAffinity: true
})

const estimatedTps = computed(() => {
  let baseTps = 1850
  if (config.value.dynamicNodeSelection) baseTps *= 1.3
  if (config.value.batchSize >= 1000) baseTps *= 1.2
  if (config.value.parallelValidation) baseTps *= 1.15
  return Math.round(baseTps)
})

const estimatedLatency = computed(() => {
  let baseLatency = 328
  if (config.value.adaptiveTimeout) baseLatency *= 0.9
  if (config.value.networkOptimizations.length >= 2) baseLatency *= 0.85
  return Math.round(baseLatency)
})

const recommendedNodes = computed(() => {
  if (config.value.txPoolSize > 30000) return '50-100'
  if (config.value.txPoolSize > 10000) return '30-50'
  return '10-30'
})

const resetConfig = () => {
  ElMessage.info('已重置为默认配置')
}

const saveConfig = () => {
  ElMessage.success('配置已保存')
}
</script>

<style scoped>
.consensus-config-page {
  padding: 20px;
}

.consensus-card {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.consensus-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.consensus-card.active {
  border: 2px solid #409EFF;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.algo-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.algo-header h3 {
  margin: 0;
  font-size: 18px;
}

.algo-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.stat-item .label {
  color: #909399;
}

.stat-item .value {
  font-weight: bold;
  color: #303133;
}

.config-panel {
  margin: 20px 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.config-form .unit {
  margin-left: 8px;
  color: #909399;
}

.performance-metric {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.metric-label {
  font-size: 14px;
  color: #909399;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
</style>
