import { defineStore } from 'pinia'
import { ref } from 'vue'

// 配置版本号全局状态，用于前端乐观锁与刷新提示
export const useConfigVersionStore = defineStore('config-version', () => {
  const currentVersion = ref<number | null>(null)

  // 从响应头更新全局配置版本号
  function updateFromHeader(headerValue: string | string[] | null | undefined): void {
    if (!headerValue) return
    const raw = Array.isArray(headerValue) ? headerValue[0] : headerValue
    const parsed = Number(raw)
    if (!Number.isNaN(parsed) && parsed > 0) {
      if (currentVersion.value === null || parsed > currentVersion.value) {
        currentVersion.value = parsed
      }
    }
  }

  return {
    currentVersion,
    updateFromHeader
  }
})
