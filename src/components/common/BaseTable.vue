<template>
  <div class="base-table-container">
    <el-table
      :data="data"
      style="width: 100%"
      v-bind="$attrs"
      :border="true"
      @selection-change="$emit('selection-change', $event)"
    >
      <el-table-column v-if="selection" type="selection" width="55" fixed="left" />
      <!-- Dynamic Columns -->
      <template v-for="col in processedColumns" :key="col.prop">
        <el-table-column
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :fixed="col.fixed"
          :sortable="col.sortable"
          :align="col.align || 'left'"
        >
          <template #default="scope">
            <!-- Custom Slot Content -->
            <slot
              v-if="col.slotName"
              :name="col.slotName"
              :row="scope.row"
              :index="scope.$index"
            />
            <!-- Default Content -->
            <span v-else>{{ scope.row[col.prop] }}</span>
          </template>
        </el-table-column>
      </template>

      <!-- Fixed Section (Always Right) -->
      <el-table-column
        v-if="config.fixedSection"
        fixed="right"
        :label="config.fixedSection.label"
        :width="config.fixedSection.width"
        align="center"
      >
        <template #default="scope">
          <!-- Operation Type: Buttons -->
          <div v-if="config.fixedSection.type === 'operation'" class="operation-buttons">
            <template v-for="(btn, btnIndex) in (config.fixedSection.buttons || [])" :key="btnIndex">
              <el-button
                v-if="!btn.show || btn.show?.(scope.row)"
                :type="btn.type || 'primary'"
                size="small"
                :icon="btn.icon"
                link
                @click="$emit(btn.event as any, scope.row)"
              >
                {{ btn.label }}
              </el-button>
            </template>
          </div>

          <!-- Display Type: Content -->
          <div v-else-if="config.fixedSection.type === 'display'" class="display-content">
            <slot
              v-if="config.fixedSection.slotName"
              :name="config.fixedSection.slotName"
              :row="scope.row"
              :index="scope.$index"
            />
            <span v-else-if="config.fixedSection.contentProp">{{ scope.row[config.fixedSection.contentProp] }}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TableConfig } from '@/types/table'

const props = defineProps<{
  config: TableConfig
  data: any[]
  selection?: boolean
}>()

const emit = defineEmits(['view', 'edit', 'delete', 'start', 'stop', 'pause', 'download', 'duplicate', 'selection-change'])

// 处理列配置，统一控制固定列的级联逻辑
const processedColumns = computed(() => {
  const cols = [...props.config.columns]
  let isPrevFixed = true // 初始为 true，用于检查首列是否固定

  return cols.map((col, index) => {
    const newCol = { ...col }

    // 第一列：如果配置为 fixed，则固定在左侧
    if (index === 0) {
      if (newCol.fixed === true || newCol.fixed === 'left') {
        newCol.fixed = 'left'
        isPrevFixed = true
      } else {
        newCol.fixed = false
        isPrevFixed = false
      }
    } else {
      // 后续列：仅当前一列固定且本列也声明 fixed 时才固定
      if (isPrevFixed && (newCol.fixed === true || newCol.fixed === 'left')) {
        newCol.fixed = 'left'
        isPrevFixed = true
      } else {
        newCol.fixed = false
        isPrevFixed = false
      }
    }
    return newCol
  })
})
</script>

<style scoped lang="scss">
.base-table-container {
  width: 100%;
}

.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.display-content {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
