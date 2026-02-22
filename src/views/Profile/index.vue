<template>
  <div class="profile-page">
    <BaseCard class="profile-card" title="用户信息">
      <el-form :model="profileForm" label-width="100px" class="profile-form">
        <el-form-item label="用户名">
          <el-input v-model="profileForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色">
          <el-input :model-value="currentUser?.role || 'admin'" disabled />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="savingProfile" @click="handleSaveProfile">
            保存基本信息
          </el-button>
        </el-form-item>
      </el-form>
    </BaseCard>

    <BaseCard class="profile-card" title="修改密码">
      <el-form :model="passwordForm" label-width="100px" class="profile-form">
        <el-form-item label="当前密码">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="savingPassword" @click="handleChangePassword">
            修改密码
          </el-button>
        </el-form-item>
      </el-form>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import BaseCard from '@/components/common/BaseCard.vue'
import { useAuthStore } from '@/store/modules/auth'
import * as authAPI from '@/api/auth'

const authStore = useAuthStore()

const currentUser = computed(() => authStore.currentUser)

const profileForm = reactive({
  username: '',
  email: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const savingProfile = ref(false)
const savingPassword = ref(false)

const initProfileForm = () => {
  if (currentUser.value) {
    profileForm.username = currentUser.value.username
    profileForm.email = currentUser.value.email
  }
}

const handleSaveProfile = async () => {
  if (!profileForm.username) {
    ElMessage.error('用户名不能为空')
    return
  }
  if (!profileForm.email || !profileForm.email.includes('@')) {
    ElMessage.error('邮箱格式不正确')
    return
  }

  try {
    savingProfile.value = true
    const { token, user } = await authAPI.updateProfile({
      username: profileForm.username,
      email: profileForm.email
    })
    authStore.setAuth(token, user)
    ElMessage.success('基本信息已更新')
  } catch (e: any) {
    ElMessage.error(e?.message || '更新失败')
  } finally {
    savingProfile.value = false
  }
}

const handleChangePassword = async () => {
  if (!passwordForm.currentPassword || !passwordForm.newPassword) {
    ElMessage.error('请输入完整密码信息')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致')
    return
  }
  if (passwordForm.newPassword.length < 6) {
    ElMessage.error('新密码长度至少为 6 位')
    return
  }

  try {
    savingPassword.value = true
    await authAPI.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    ElMessage.success('密码修改成功')
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (e: any) {
    ElMessage.error(e?.message || '修改密码失败')
  } finally {
    savingPassword.value = false
  }
}

onMounted(() => {
  initProfileForm()
})
</script>

<style scoped lang="scss">
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card {
  max-width: 600px;
}

.profile-form {
  max-width: 480px;
}
</style>

