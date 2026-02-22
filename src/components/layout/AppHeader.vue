<template>
  <header class="header">
    <div class="header-left">
      <h2 class="page-title">{{ route.meta.title || route.name || 'Dashboard' }}</h2>
    </div>
    <div class="header-right">
      <!-- Theme Toggle Switch -->
      <div class="theme-switch" @click="toggleTheme" :class="{ active: isDark }" title="切换主题">
        <div class="track-icons">
          <el-icon class="track-icon icon-moon" :size="14"><Moon /></el-icon>
          <el-icon class="track-icon icon-sun" :size="14"><Sunny /></el-icon>
        </div>
        <div class="switch-thumb"></div>
      </div>

      <div class="icon-btn">
        <span class="icon">🔍</span>
      </div>
      <div class="icon-btn">
        <span class="icon">🔔</span>
        <span class="badge"></span>
      </div>
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="icon-btn user-btn">
          <span class="avatar-text">{{ userInitial }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>
              {{ currentUser?.username || '未登录' }}
            </el-dropdown-item>
            <el-dropdown-item divided command="profile">
              用户主页
            </el-dropdown-item>
            <el-dropdown-item command="logout">
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/modules/auth'
import { useUIStore } from '@/store/modules/ui'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const currentUser = computed(() => authStore.currentUser)
const isDark = computed(() => uiStore.theme === 'dark')
const userInitial = computed(() => {
  if (currentUser.value?.username) {
    return currentUser.value.username.charAt(0).toUpperCase()
  }
  return 'U'
})

const toggleTheme = () => {
  uiStore.setTheme(isDark.value ? 'light' : 'dark')
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    authStore.clearAuth()
    ElMessage.success('已退出登录')
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  }
}

</script>

<style scoped lang="scss" src="@/assets/styles/layouts/header.scss"></style>
