<template>
  <div :class="['action-table-card', { 'ios-card': card }]">
    <div v-if="title || $slots.title || $slots['header-actions']" class="action-table-header">
      <div class="action-table-title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="$slots['header-actions']" class="action-table-header-actions">
        <slot name="header-actions" />
      </div>
    </div>
    <el-table
      class="action-table"
      :data="data"
      :stripe="stripe"
      :border="border"
      :header-cell-style="headerCellStyle"
      v-loading="loading"
      @selection-change="onSelectionChange"
      @row-click="onRowClick"
    >
      <!-- Selection Column -->
      <el-table-column v-if="selection" type="selection" width="55" resizable />
      
      <!-- Custom Columns via Slot -->
      <slot />

      <!-- Configurable Columns -->
      <template v-if="columns && columns.length > 0">
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :fixed="col.fixed"
          :sortable="col.sortable"
          resizable
        >
          <template #default="scope">
            <slot :name="col.slotName" v-bind="scope">
              <!-- Default rendering if no slot provided -->
              <span v-if="!col.actions">{{ scope.row[col.prop] }}</span>
              <!-- Render actions if configured -->
              <TableActionButtons 
                v-else 
                :buttons="col.actions" 
                :row="scope.row" 
              />
            </slot>
          </template>
        </el-table-column>
      </template>

      <!-- Fixed Action Column (Legacy support or explicit config) -->
      <el-table-column
        v-if="$slots.actions || actionButtons.length > 0"
        label="操作"
        fixed="right"
        :width="actionWidth"
        class-name="action-column"
        label-class-name="action-column"
        resizable
      >
        <template #default="scope">
          <div class="action-table-actions">
            <!-- Slot actions take precedence -->
            <slot name="actions" v-bind="scope" />
            <!-- Configured action buttons -->
            <TableActionButtons 
              v-if="!$slots.actions && actionButtons.length > 0" 
              :buttons="actionButtons" 
              :row="scope.row" 
            />
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="$slots.pagination" class="action-table-footer">
      <slot name="pagination" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TableActionButtons, { ActionButton } from './TableActionButtons.vue'

export interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean
  slotName?: string
  actions?: ActionButton[] // If this column is an action column
}

const props = withDefaults(defineProps<{
  data: any[]
  columns?: TableColumn[]
  actionButtons?: ActionButton[] // Global action buttons for the fixed right column
  title?: string
  loading?: boolean
  selection?: boolean
  actionWidth?: number
  stripe?: boolean
  border?: boolean
  headerTransparent?: boolean
  card?: boolean
}>(), {
  columns: () => [],
  actionButtons: () => [],
  loading: false,
  selection: false,
  actionWidth: 240,
  stripe: true,
  border: true,
  headerTransparent: true,
  card: true
})

const emit = defineEmits<{
  (e: 'selection-change', val: any[]): void
  (e: 'row-click', row: any, column: any, event: Event): void
}>()

const onSelectionChange = (val: any[]) => emit('selection-change', val)
const onRowClick = (row: any, column: any, event: Event) => emit('row-click', row, column, event)

const headerCellStyle = computed(() => props.headerTransparent ? { background: 'transparent' } : undefined)
</script>

<style scoped lang="scss" src="@/assets/styles/components/action-table.scss"></style>
