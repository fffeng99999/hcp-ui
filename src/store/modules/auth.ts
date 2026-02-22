import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AuthUser } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const currentUser = ref<AuthUser | null>(null)

  function setAuth(newToken: string, user: AuthUser): void {
    token.value = newToken
    currentUser.value = user
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(user))
  }

  function clearAuth(): void {
    token.value = null
    currentUser.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  function loadFromStorage(): void {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    if (savedToken) {
      token.value = savedToken
    }
    if (savedUser) {
      try {
        currentUser.value = JSON.parse(savedUser)
      } catch {
        currentUser.value = null
      }
    }
  }

  function updateUser(user: AuthUser): void {
    currentUser.value = user
    localStorage.setItem('auth_user', JSON.stringify(user))
  }

  return {
    token,
    currentUser,
    setAuth,
    clearAuth,
    loadFromStorage,
    updateUser
  }
})

