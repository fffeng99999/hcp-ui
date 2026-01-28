import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UIState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  language: 'en' | 'zh'
}

export const useUIStore = defineStore('ui', () => {
  const sidebarCollapsed = ref<boolean>(false)
  const theme = ref<'light' | 'dark'>('light')
  const language = ref<'en' | 'zh'>('en')

  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setTheme(newTheme: 'light' | 'dark'): void {
    theme.value = newTheme
    localStorage.setItem('ui_theme', newTheme)
    // 应用主题逻辑
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  function setLanguage(newLanguage: 'en' | 'zh'): void {
    language.value = newLanguage
    localStorage.setItem('ui_language', newLanguage)
  }

  function loadPreferences(): void {
    const savedTheme = localStorage.getItem('ui_theme') as 'light' | 'dark' | null
    const savedLanguage = localStorage.getItem('ui_language') as 'en' | 'zh' | null

    if (savedTheme) {
      setTheme(savedTheme)
    }
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }

  return {
    // State
    sidebarCollapsed,
    theme,
    language,

    // Methods
    toggleSidebar,
    setTheme,
    setLanguage,
    loadPreferences
  }
})
