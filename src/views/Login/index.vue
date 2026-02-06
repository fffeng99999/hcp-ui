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

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--ios-bg-primary);
}
.login-card {
  padding: 40px;
  background: var(--ios-bg-secondary);
  border-radius: 8px;
  box-shadow: var(--ios-shadow-2);
  text-align: center;
}
.btn-login {
  margin-top: 20px;
  padding: 10px 24px;
  background: var(--el-color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>