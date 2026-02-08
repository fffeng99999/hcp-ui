<template>
  <el-card class="settings-card">
    <template v-if="title || $slots.title || $slots.actions" #header>
      <div class="settings-card-header">
        <div class="settings-card-title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div v-if="$slots.actions" class="settings-card-actions">
          <slot name="actions" />
        </div>
      </div>
    </template>
    <slot />
  </el-card>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<style scoped lang="scss">
.settings-card {
  border-radius: var(--ios-radius-m);
  box-shadow: var(--ios-shadow-2);
  border: 1px solid var(--ios-border-color);
  width: 100%;
  box-sizing: border-box;
}

.settings-card :deep(.el-card__header) {
  padding: 16px 20px;
}

.settings-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
}

.settings-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--ios-text-primary);
  line-height: 24px;
}

.settings-card-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--ios-text-primary);
  line-height: 24px;
}

.settings-card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
