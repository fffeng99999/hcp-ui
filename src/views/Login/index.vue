<template>
  <div class="login-container">
    <div class="login-card">
      <h2>HCP-Bench 控制台</h2>
      <el-form
        :model="form"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="用户名"
            autocomplete="username"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            autocomplete="current-password"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="btn-login"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '@/api/http'

const router = useRouter()

const form = reactive({
  username: 'admin',
  password: 'admin123'
})

const loading = ref(false)

const handleLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.error('请输入用户名和密码')
    return
  }

  try {
    loading.value = true
    const resp = await http.post<{ token: string }>(
      '/auth/login',
      {
        username: form.username,
        password: form.password
      }
    )
    localStorage.setItem('auth_token', resp.token)
    router.push('/')
  } catch (e: any) {
    ElMessage.error(e?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss" src="@/assets/styles/pages/login.scss"></style>
