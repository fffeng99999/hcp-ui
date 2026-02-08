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
      <el-table-column v-if="selection" type="selection" width="55" resizable />
      <slot />
      <el-table-column
        label="操作"
        fixed="right"
        :width="actionWidth"
        class-name="action-column"
        label-class-name="action-column"
        resizable
      >
        <template #default="scope">
          <div class="action-table-actions">
            <slot name="actions" v-bind="scope" />
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

const props = withDefaults(defineProps<{
  data: any[]
  title?: string
  loading?: boolean
  selection?: boolean
  actionWidth?: number
  stripe?: boolean
  border?: boolean
  headerTransparent?: boolean
  card?: boolean
}>(), {
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
