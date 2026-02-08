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
    case 'outline': return 'primary' // Outline usually implies primary color border
    case 'text': return '' // Text button, type handled by :text prop
    case 'secondary':
    default: return '' // Default button
  }
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
/* No custom styles needed - inheriting global Element Plus overrides */
</style>
