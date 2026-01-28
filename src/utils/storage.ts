/**
 * 本地存储工具
 */
export class StorageUtil {
  /**
   * 获取值
   */
  static get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      if (!item) return defaultValue ?? null
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Failed to get storage item: ${key}`, error)
      return defaultValue ?? null
    }
  }

  /**
   * 设置值
   */
  static set<T = any>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to set storage item: ${key}`, error)
    }
  }

  /**
   * 移除值
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove storage item: ${key}`, error)
    }
  }

  /**
   * 清空所有值
   */
  static clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Failed to clear storage', error)
    }
  }

  /**
   * 获取所有键
   */
  static keys(): string[] {
    return Object.keys(localStorage)
  }
}

export default StorageUtil
