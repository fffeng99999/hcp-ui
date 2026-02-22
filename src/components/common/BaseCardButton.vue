<template>
  <el-button
    :type="elType"
    :plain="type === 'outline'"
    :text="type === 'text'"
    :icon="icon"
    :disabled="disabled"
    class="base-card-button"
    @click="handleClick"
  >
    <slot>{{ label }}</slot>
  </el-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type?: 'primary' | 'secondary' | 'outline' | 'text'
  label?: string
  icon?: any
  disabled?: boolean
}>(), {
  type: 'secondary',
  disabled: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const elType = computed(() => {
  switch (props.type) {
    case 'primary': return 'primary'
    case 'outline': return 'primary' // 描边按钮一般仍使用主色系
    case 'text': return '' // 文字按钮，通过 :text 属性控制样式
    case 'secondary':
    default: return '' // 默认按钮类型，保持 Element Plus 默认样式
  }
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
/* 此处不做单独样式覆盖，直接继承全局的 Element Plus 重写样式 */
</style>
