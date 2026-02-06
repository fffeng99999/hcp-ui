<template>
  <div class="login-container">
    <div class="login-card">
      <h2>HCP-Bench 控制台</h2>
      <button @click="handleLogin" class="btn-login">模拟登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogin = () => {
  // 模拟设置 Token
  localStorage.setItem('auth_token', 'mock_token_' + Date.now())
  router.push('/')
}
</script>

<style scoped lang="scss" src="@/assets/styles/pages/login.scss"></style>