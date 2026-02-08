<template>
  <el-radio-group
    :model-value="modelValue"
    size="small"
    class="base-segmented-control"
    :disabled="disabled"
    @update:model-value="updateValue"
    @change="handleChange"
  >
    <el-radio-button
      v-for="option in options"
      :key="option.value"
      :label="option.value"
      :disabled="option.disabled"
    >
      <slot name="label" :option="option">
        {{ option.label }}
      </slot>
    </el-radio-button>
  </el-radio-group>
</template>

<script setup lang="ts">
export interface SegmentOption {
  label: string
  value: string | number
  disabled?: boolean
}

const props = defineProps<{
  modelValue: string | number
  options: SegmentOption[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}>()

const updateValue = (value: string | number) => {
  emit('update:modelValue', value)
}

const handleChange = (value: string | number) => {
  emit('change', value)
}
</script>

<style scoped lang="scss">
/* No custom styles needed - inheriting global Element Plus overrides */
</style>
