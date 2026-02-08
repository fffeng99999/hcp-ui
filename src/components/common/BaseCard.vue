<template>
  <el-card class="base-card">
    <template v-if="title || $slots.title || $slots.actions" #header>
      <div class="base-card-header">
        <div class="base-card-title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div v-if="$slots.actions" class="base-card-actions">
          <slot name="actions" />
        </div>
      </div>
    </template>
    <div class="base-card-content">
      <slot />
    </div>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<style scoped lang="scss">
.base-card {
  border-radius: var(--ios-radius-m, 16px);
  box-shadow: var(--ios-shadow-2, 0 4px 12px rgba(0, 0, 0, 0.05));
  border: 1px solid var(--ios-border-color, #e5e5ea);
  width: 100%;
  box-sizing: border-box;
  background: var(--ios-card-bg, #ffffff);
  
  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid var(--ios-border-color-light, #f2f2f7);
  }
  
  :deep(.el-card__body) {
    padding: 20px;
  }
}

.base-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
}

.base-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--ios-text-primary, #1d1d1f);
  line-height: 24px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: inherit;
    line-height: 24px;
  }
}

.base-card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
