<template>
  <BaseCard class="settings-content" title="用户管理">
    <template #actions>
      <el-button type="primary" size="small" @click="handleAddUser">
        <el-icon><Plus /></el-icon> 新增用户
      </el-button>
    </template>

    <ActionTable 
      :data="users" 
      :columns="columns"
      :action-buttons="actionButtons"
      :action-width="260" 
      :card="false"
    >
      <!-- Custom Slot for Role -->
      <template #role="{ row }">
        <el-tag :type="getRoleType(row.role)">{{ row.role }}</el-tag>
      </template>
      
      <!-- Custom Slot for Status -->
      <template #status="{ row }">
        <el-tag :type="row.status === '正常' ? 'success' : 'danger'" size="small">
          {{ row.status }}
        </el-tag>
      </template>
    </ActionTable>
  </BaseCard>

  <el-dialog v-model="showUserDialog" :title="isEditing ? '编辑用户' : '新增用户'" width="500px">
    <el-form :model="userForm" label-width="100px">
      <el-form-item label="用户名">
        <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="isEditing" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="userForm.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="userForm.role" style="width: 100%">
          <el-option label="超级管理员" value="超级管理员" />
          <el-option label="管理员" value="管理员" />
          <el-option label="操作员" value="操作员" />
          <el-option label="观察者" value="观察者" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" v-if="isEditing">
        <el-select v-model="userForm.status" style="width: 100%">
          <el-option label="正常" value="正常" />
          <el-option label="禁用" value="禁用" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showUserDialog = false">取消</el-button>
      <el-button type="primary" @click="saveUser">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import * as settingsAPI from '@/api/settings'
import ActionTable, { TableColumn } from '@/components/table/ActionTable.vue'
import { ActionButton } from '@/components/table/TableActionButtons.vue'
import type { SystemUser } from '@/types'
import BaseCard from '@/components/common/BaseCard.vue'
import { useConfigVersionStore } from '@/store/modules/configVersion'

const users = ref<SystemUser[]>([])
const showUserDialog = ref(false)
const isEditing = ref(false)
const userForm = ref<Partial<SystemUser>>({
  username: '',
  email: '',
  role: '观察者',
  status: '正常'
})

// Columns Configuration
const columns = computed<TableColumn[]>(() => [
  { prop: 'username', label: '用户名', width: 150 },
  { prop: 'email', label: '邮箱', width: 200 },
  { prop: 'role', label: '角色', width: 120, slotName: 'role' },
  { prop: 'status', label: '状态', width: 100, slotName: 'status' },
  { prop: 'lastLogin', label: '最后登录', width: 180 },
  { prop: 'createdAt', label: '创建时间', width: 180 }
])

// 本地保存的配置版本号，用于与全局版本号对比
const configVersionStore = useConfigVersionStore()
const localVersion = ref<number | null>(null)

const getRoleType = (role: string) => {
  const types: Record<string, string> = {
    '超级管理员': 'danger',
    '管理员': 'warning',
    '操作员': 'success',
    '观察者': 'info'
  }
  return types[role] || 'info'
}

const loadUsers = async () => {
  try {
    const data = await settingsAPI.getUsers()
    users.value = data
    localVersion.value = configVersionStore.currentVersion
  } catch (e) {
    ElMessage.error('加载用户列表失败')
  }
}

const handleAddUser = () => {
  isEditing.value = false
  userForm.value = {
    username: '',
    email: '',
    role: '观察者',
    status: '正常'
  }
  showUserDialog.value = true
}

const editUser = (row: SystemUser) => {
  isEditing.value = true
  userForm.value = { ...row }
  showUserDialog.value = true
}

const saveUser = async () => {
  try {
    if (
      localVersion.value !== null &&
      configVersionStore.currentVersion !== null &&
      configVersionStore.currentVersion > localVersion.value
    ) {
      await ElMessageBox.alert('检测到用户列表已被其他终端修改，请刷新页面后重试', '配置版本过期', {
        type: 'warning'
      })
      return
    }

    const validateResult = await settingsAPI.validateUser({
      id: userForm.value.id,
      username: userForm.value.username || '',
      email: userForm.value.email || '',
      role: userForm.value.role
    })
    if (!validateResult.valid) {
      const messages = validateResult.errors.map(err => `${err.field}: ${err.message}`).join('；')
      ElMessage.error(messages || '用户信息校验失败')
      return
    }

    if (isEditing.value && userForm.value.id) {
      await settingsAPI.updateUser(userForm.value.id, userForm.value)
      ElMessage.success('用户更新成功')
    } else {
      await settingsAPI.createUser(userForm.value)
      ElMessage.success('用户创建成功')
    }
    showUserDialog.value = false
    loadUsers()
  } catch (e) {
    ElMessage.error(isEditing.value ? '更新失败' : '创建失败')
  }
}

const resetPassword = (row: SystemUser) => {
  ElMessageBox.confirm(`确定重置用户 ${row.username} 的密码吗?`, '提示', { type: 'warning' })
    .then(async () => {
      try {
        await settingsAPI.resetUserPassword(row.id)
        ElMessage.success('密码已重置为默认密码')
      } catch (e) {
        ElMessage.error('重置密码失败')
      }
    })
}

const deleteUser = async (row: SystemUser) => {
  ElMessageBox.confirm(`确定删除用户 ${row.username} 吗?`, '警告', { type: 'warning' })
    .then(async () => {
      try {
        await settingsAPI.deleteUser(row.id)
        ElMessage.success('用户已删除')
        loadUsers()
      } catch (e) {
        ElMessage.error('删除失败')
      }
    })
}

// Action Buttons Configuration (Template 2)
const actionButtons = computed<ActionButton[]>(() => [
  { 
    label: '编辑', 
    onClick: editUser, 
    templateType: 'detail' // 详情/普通样式
  },
  { 
    label: '重置密码', 
    onClick: resetPassword, 
    templateType: 'detail' // 详情/普通样式
  },
  { 
    label: '删除', 
    onClick: deleteUser, 
    templateType: 'delete', // 红色删除样式
    disabled: (row) => row.role === '超级管理员'
  }
])

onMounted(() => {
  loadUsers()
})
</script>
