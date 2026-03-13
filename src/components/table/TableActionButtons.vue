<template>
  <div class="table-action-buttons">
    <template v-for="(btn, index) in buttons" :key="index">
      <el-button
        v-if="!isHidden(btn)"
        :type="getButtonType(btn)"
        :class="['action-btn', getButtonClass(btn)]"
        :disabled="isDisabled(btn)"
        size="small"
        @click="btn.onClick && btn.onClick(row)"
      >
        <el-icon v-if="btn.icon"><component :is="btn.icon" /></el-icon>
        {{ btn.label }}
      </el-button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'

export interface ActionButton {
  label: string
  // 模板类型：'start' (蓝色启动) | 'delete' (红色删除) | 'detail' (详情/默认) | 'normal' (普通)
  templateType?: 'start' | 'delete' | 'detail' | 'normal'
  // Element Plus 类型，如果指定 templateType 则此项优先级较低或作为补充
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  icon?: any
  onClick?: (row: any) => void
  disabled?: boolean | ((row: any) => boolean)
  hidden?: boolean | ((row: any) => boolean)
}

const props = defineProps({
  buttons: {
    type: Array as PropType<ActionButton[]>,
    default: () => []
  },
  row: {
    type: Object,
    required: true
  }
})

const getButtonType = (btn: ActionButton) => {
  if (btn.templateType === 'start') return 'primary'
  if (btn.templateType === 'delete') return 'danger'
  if (btn.type) return btn.type
  return 'default' // 详情/默认
}

const getButtonClass = (btn: ActionButton) => {
  if (btn.templateType === 'start') return 'btn-start'
  if (btn.templateType === 'delete') return 'btn-delete'
  if (btn.templateType === 'detail') return 'btn-detail'
  return ''
}

const isHidden = (btn: ActionButton) => {
  if (btn.hidden === undefined) return false
  if (typeof btn.hidden === 'function') return btn.hidden(props.row)
  return btn.hidden
}

const isDisabled = (btn: ActionButton) => {
  if (btn.disabled === undefined) return false
  if (typeof btn.disabled === 'function') return btn.disabled(props.row)
  return btn.disabled
}
</script>

<style scoped lang="scss">
.table-action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  border-radius: 9999px;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0 14px;
  height: 28px;
  border: 1px solid transparent;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  // 详情按钮 (默认)
  &.btn-detail {
    background-color: var(--ios-bg-secondary);
    border-color: var(--ios-border-color);
    color: var(--ios-text-primary);

    &:hover {
      border-color: var(--ios-blue);
      color: var(--ios-blue);
    }
  }

  // 启动按钮 (蓝色背景，白色文字)
  &.btn-start {
    background-color: var(--ios-blue);
    color: #ffffff;
    border: none;
    box-shadow: 0 2px 6px rgba(var(--ios-blue-rgb), 0.28);

    &:hover {
      filter: brightness(0.96);
      box-shadow: 0 4px 12px rgba(var(--ios-blue-rgb), 0.34);
    }
    
    &:active {
      box-shadow: 0 1px 3px rgba(var(--ios-blue-rgb), 0.24);
    }
  }

  // 删除按钮 (红色背景，白色文字)
  &.btn-delete {
    background-color: var(--ios-red);
    color: #ffffff;
    border: none;
    box-shadow: 0 2px 6px rgba(255, 59, 48, 0.28);

    &:hover {
      filter: brightness(0.96);
      box-shadow: 0 4px 12px rgba(255, 59, 48, 0.34);
    }

    &:active {
      box-shadow: 0 1px 3px rgba(255, 59, 48, 0.24);
    }
    
    &.is-disabled {
      background-color: var(--ios-fill-color);
      color: var(--ios-text-tertiary);
      box-shadow: none;
    }
  }
}
</style>
