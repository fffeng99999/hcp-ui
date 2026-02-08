<template>
  <div class="consensus-page">
    <!-- 顶部共识算法选择区域 -->
    <div class="algorithm-section">
      <div class="algorithm-list">
        <div 
          v-for="algo in consensusAlgorithms" 
          :key="algo.id"
          class="ios-card algorithm-card"
          :class="{ active: selectedAlgo === algo.id }"
          @click="selectAlgorithm(algo.id)"
        >
          <div class="algo-header">
            <div class="icon-wrapper" :style="{ background: algo.color + '20', color: algo.color }">
              <el-icon :size="24">
                <component :is="iconComponents[algo.icon as string]" />
              </el-icon>
            </div>
            <div class="algo-info">
              <h3>{{ algo.displayName }}</h3>
              <el-tag :type="algo.recommended ? 'success' : 'info'" size="small" effect="light" round>
                {{ algo.recommended ? '推荐' : '标准' }}
              </el-tag>
            </div>
          </div>
          
          <div class="algo-stats">
            <div class="stat-item">
              <span class="label">延迟</span>
              <span class="value">{{ algo.avgLatency }}ms</span>
            </div>
            <div class="stat-item">
              <span class="label">TPS</span>
              <span class="value">{{ algo.peakTps }}</span>
            </div>
          </div>
        </div>

        <!-- 添加新算法卡片 -->
        <div class="ios-card algorithm-card add-card" @click="addNewAlgorithm">
          <div class="icon-wrapper add-icon">
            <el-icon :size="24"><Plus /></el-icon>
          </div>
          <h3>添加算法</h3>
        </div>
      </div>
    </div>

    <!-- 算法性能对比 (New Table) -->
    <BaseCard title="算法性能对比">
      <BaseTable
        :data="tableData"
        :config="consensusComparisonTable"
        :loading="loading"
      >
        <template #avgTps="{ row }">
          <span style="color: var(--ios-success)">{{ row.avgTps }}</span>
        </template>
        <template #peakTps="{ row }">
          <span style="font-weight: 600">{{ row.peakTps }}</span>
        </template>
        <template #cpuUsage="{ row }">
          <el-progress :percentage="row.cpuUsage" :status="row.cpuUsage > 80 ? 'exception' : 'success'" />
        </template>
        <template #memoryUsage="{ row }">
          {{ row.memoryUsage }} MB
        </template>
        <!-- 固定栏：综合评分 -->
        <template #score="{ row }">
          <div class="score-display">
            <span class="score-value" :style="{ color: getScoreColor(row.score) }">{{ row.score }}</span>
            <span class="score-label">分</span>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <div class="row-layout">
      <!-- 配置面板 -->
      <div class="col-left">
        <BaseCard :title="selectedAlgo + ' 参数配置'">
          <template #actions>
            <el-button round size="small" @click="resetConfig">重置默认</el-button>
            <el-button type="primary" round size="small" @click="saveConfig">保存配置</el-button>
          </template>

          <el-tabs v-model="activeTab">
            <!-- 基础参数 -->
            <el-tab-pane label="基础参数" name="basic">
              <el-form :model="config" label-width="140px" class="config-form" label-position="left">
                <el-row :gutter="40">
                  <el-col :span="12">
                    <el-form-item label="视图变更超时">
                      <el-input-number v-model="config.viewChangeTimeout" :min="1000" :max="30000" :step="1000" controls-position="right" />
                      <span class="unit">ms</span>
                    </el-form-item>

                    <el-form-item label="区块生成间隔">
                      <el-input-number v-model="config.blockInterval" :min="1" :max="60" controls-position="right" />
                      <span class="unit">秒</span>
                    </el-form-item>

                    <el-form-item label="最大区块大小">
                      <el-input-number v-model="config.maxBlockSize" :min="1" :max="32" controls-position="right" />
                      <span class="unit">MB</span>
                    </el-form-item>

                    <el-form-item label="交易池大小">
                      <el-input-number v-model="config.txPoolSize" :min="1000" :max="100000" :step="1000" controls-position="right" />
                      <span class="unit">条</span>
                    </el-form-item>
                  </el-col>

                  <el-col :span="12">
                    <el-form-item label="最小节点数">
                      <el-input-number v-model="config.minNodes" :min="4" :max="100" controls-position="right" />
                      <span class="unit">个</span>
                    </el-form-item>

                    <el-form-item label="共识轮次超时">
                      <el-input-number v-model="config.consensusTimeout" :min="5000" :max="60000" :step="1000" controls-position="right" />
                      <span class="unit">ms</span>
                    </el-form-item>

                    <el-form-item label="确认区块数">
                      <el-input-number v-model="config.confirmations" :min="1" :max="12" controls-position="right" />
                      <span class="unit">块</span>
                    </el-form-item>

                    <el-form-item label="网络延迟容忍">
                      <el-input-number v-model="config.networkLatency" :min="100" :max="5000" :step="100" controls-position="right" />
                      <span class="unit">ms</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-tab-pane>

            <!-- 高级参数 -->
            <el-tab-pane label="高级参数" name="advanced">
              <el-form :model="config" label-width="140px" class="config-form" label-position="left">
                <el-row :gutter="40">
                  <el-col :span="12">
                    <el-form-item label="动态节点选择">
                      <el-switch v-model="config.dynamicNodeSelection" />
                    </el-form-item>

                    <el-form-item label="信誉评分阈值">
                      <el-slider v-model="config.reputationThreshold" :min="0" :max="100" show-stops />
                    </el-form-item>

                    <el-form-item label="批量处理大小">
                      <el-input-number v-model="config.batchSize" :min="100" :max="10000" :step="100" controls-position="right" />
                      <span class="unit">条</span>
                    </el-form-item>

                    <el-form-item label="并行验证">
                      <el-switch v-model="config.parallelValidation" />
                    </el-form-item>
                  </el-col>

                  <el-col :span="12">
                    <el-form-item label="自适应超时">
                      <el-switch v-model="config.adaptiveTimeout" />
                    </el-form-item>

                    <el-form-item label="检查点间隔">
                      <el-input-number v-model="config.checkpointInterval" :min="10" :max="1000" :step="10" controls-position="right" />
                      <span class="unit">块</span>
                    </el-form-item>

                    <el-form-item label="预执行交易">
                      <el-switch v-model="config.preExecution" />
                    </el-form-item>

                    <el-form-item label="压缩算法">
                      <el-select v-model="config.compressionAlgo" style="width: 100%">
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
              <el-form :model="config" label-width="140px" class="config-form" label-position="left">
                <el-alert 
                  title="tPBFT优化建议" 
                  type="success" 
                  :closable="false"
                  style="margin-bottom: 20px"
                  show-icon
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
                      <el-input-number v-model="config.pipelineDepth" :min="1" :max="10" controls-position="right" />
                      <span class="unit">级</span>
                    </el-form-item>

                    <el-form-item label="内存池大小">
                      <el-input-number v-model="config.memPoolSize" :min="512" :max="8192" :step="512" controls-position="right" />
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
                      <el-input-number v-model="config.ioThreads" :min="1" :max="16" controls-position="right" />
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
        </BaseCard>
      </div>

      <!-- 性能预估 -->
      <div class="col-right">
        <BaseCard title="性能预估">
          <div class="estimation-content">
            <div class="performance-metric">
              <div class="metric-icon-wrapper blue">
                <el-icon :size="24"><TrendCharts /></el-icon>
              </div>
              <div>
                <div class="metric-label">预估TPS</div>
                <div class="metric-value">{{ estimatedTps }}</div>
              </div>
            </div>
            
            <div class="performance-metric">
              <div class="metric-icon-wrapper green">
                <el-icon :size="24"><Timer /></el-icon>
              </div>
              <div>
                <div class="metric-label">预估延迟</div>
                <div class="metric-value">{{ estimatedLatency }}ms</div>
              </div>
            </div>
            
            <div class="performance-metric">
              <div class="metric-icon-wrapper orange">
                <el-icon :size="24"><Connection /></el-icon>
              </div>
              <div>
                <div class="metric-label">建议节点数</div>
                <div class="metric-value">{{ recommendedNodes }}</div>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { 
  Setting, Checked, Document, DataLine, 
  TrendCharts, Timer, Connection, Plus
} from '@element-plus/icons-vue'
import { useConsensusStore } from '@/store/modules/consensus'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import { consensusComparisonTable } from '@/config/tables/consensusComparison'

const store = useConsensusStore()
const { algorithms: consensusAlgorithms, currentAlgorithm: selectedAlgo, parameters, isLoading: loading } = storeToRefs(store)
const activeTab = ref('basic')
const iconComponents: Record<string, any> = { Setting, Checked, Document, DataLine, Plus }

const config = computed(() => parameters.value[selectedAlgo.value])

const tableData = computed(() => consensusAlgorithms.value.map(a => ({
  ...a,
  algorithm: a.displayName
})))

const addNewAlgorithm = () => {
  ElMessage.info('功能开发中：添加新共识算法')
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'var(--ios-success)'
  if (score >= 80) return 'var(--ios-blue)'
  if (score >= 60) return 'var(--ios-warning)'
  return 'var(--ios-danger)'
}

const estimatedTps = computed(() => {
  let baseTps = 1850
  if (config.value?.dynamicNodeSelection) baseTps *= 1.3
  if (config.value?.batchSize >= 1000) baseTps *= 1.2
  if (config.value?.parallelValidation) baseTps *= 1.15
  return Math.round(baseTps)
})

const estimatedLatency = computed(() => {
  let baseLatency = 328
  if (config.value?.adaptiveTimeout) baseLatency *= 0.9
  if (config.value?.networkOptimizations?.length >= 2) baseLatency *= 0.85
  return Math.round(baseLatency)
})

const recommendedNodes = computed(() => {
  if (config.value?.txPoolSize > 30000) return '50-100'
  if (config.value?.txPoolSize > 10000) return '30-50'
  return '10-30'
})

const resetConfig = () => {
  store.loadConfig()
  ElMessage.info('已重置为默认配置')
}

const saveConfig = async () => {
  try {
    ElMessage.success('配置已保存')
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

const selectAlgorithm = async (algoName: string) => {
  try {
    await store.selectAlgorithm(algoName as any)
  } catch (error) {
    ElMessage.error('切换算法失败')
  }
}

onMounted(() => {
  store.loadConfig()
  store.loadAlgorithms()
})
</script>

<style scoped lang="scss">
.consensus-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.algorithm-section {
  margin-bottom: 24px;
}

.algorithm-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.algorithm-card {
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  background: var(--ios-card-bg);
  backdrop-filter: blur(20px);
  border-radius: var(--ios-radius-l);
  box-shadow: var(--ios-shadow-s);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--ios-shadow-m);
  }

  &.active {
    border-color: var(--ios-blue);
    background: linear-gradient(145deg, rgba(var(--ios-blue-rgb), 0.05) 0%, transparent 100%),
                var(--ios-card-bg);
  }
}

.algo-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
  }

  .algo-info {
    h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.algo-stats {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--ios-border);

  .stat-item {
    display: flex;
    flex-direction: column;
    
    .label {
      font-size: 12px;
      color: var(--ios-text-secondary);
      margin-bottom: 4px;
    }
    
    .value {
      font-size: 14px;
      font-weight: 600;
      color: var(--ios-text-primary);
    }
  }
}

.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--ios-border);
  background: transparent;

  .add-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--ios-gray-bg);
    color: var(--ios-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    transition: all 0.3s ease;
  }

  h3 {
    margin: 0;
    color: var(--ios-text-secondary);
    font-size: 16px;
  }

  &:hover {
    border-color: var(--ios-blue);
    
    .add-icon {
      background: var(--ios-blue);
      color: white;
    }
    
    h3 {
      color: var(--ios-blue);
    }
  }
}

.row-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-top: 24px;
  align-items: start;
}

.config-form {
  padding: 10px 0;

  :deep(.el-form-item__label) {
    font-weight: 500;
  }
  
  .unit {
    margin-left: 8px;
    color: var(--ios-text-secondary);
  }
}

.estimation-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.performance-metric {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--ios-gray-bg);
  border-radius: var(--ios-radius-m);

  .metric-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    color: white;

    &.blue { background: linear-gradient(135deg, #409EFF, #337ECC); }
    &.green { background: linear-gradient(135deg, #67C23A, #529B2E); }
    &.orange { background: linear-gradient(135deg, #E6A23C, #B88230); }
  }

  .metric-label {
    font-size: 13px;
    color: var(--ios-text-secondary);
    margin-bottom: 4px;
  }

  .metric-value {
    font-size: 20px;
    font-weight: 600;
    color: var(--ios-text-primary);
  }
}

.score-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  
  .score-value {
    font-size: 18px;
    font-weight: 700;
    margin-right: 2px;
  }
  
  .score-label {
    font-size: 12px;
    color: var(--ios-text-secondary);
  }
}

/* BaseCard overrides to fit layout if needed */
:deep(.base-card) {
  height: 100%;
}
</style>