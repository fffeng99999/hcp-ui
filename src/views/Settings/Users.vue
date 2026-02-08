<template>
  <BaseCard class="settings-content" title="用户管理">
    <template #actions>
      <el-button type="primary" size="small" @click="handleAddUser">
        <el-icon><Plus /></el-icon> 新增用户
      </el-button>
    </template>

    <ActionTable :data="users" :action-width="tableConfig.action.width" :card="false">
      <el-table-column prop="username" :label="tableConfig.columns.username.label" :width="tableConfig.columns.username.width" resizable />
      <el-table-column prop="email" :label="tableConfig.columns.email.label" :width="tableConfig.columns.email.width" resizable />
      <el-table-column prop="role" :label="tableConfig.columns.role.label" :width="tableConfig.columns.role.width" resizable>
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.role)">{{ row.role }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="tableConfig.columns.status.label" :width="tableConfig.columns.status.width" resizable>
        <template #default="{ row }">
          <el-tag :type="row.status === '正常' ? 'success' : 'danger'" size="small">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLogin" :label="tableConfig.columns.lastLogin.label" :width="tableConfig.columns.lastLogin.width" resizable />
      <el-table-column prop="createdAt" :label="tableConfig.columns.createdAt.label" :width="tableConfig.columns.createdAt.width" resizable />
      <template #actions="{ row }">
        <div class="action-table-actions">
          <el-button size="small" @click="editUser(row)">编辑</el-button>
          <el-button size="small" @click="resetPassword(row)">重置密码</el-button>
          <el-button size="small" type="danger" @click="deleteUser(row)" :disabled="row.role === '超级管理员'">
            删除
          </el-button>
        </div>
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import * as settingsAPI from '@/api/settings'
import ActionTable from '@/components/table/ActionTable.vue'
import { settingsUsersTable as tableConfig } from '@/config/tables/settingsUsers'
import type { SystemUser } from '@/types'
import BaseCard from '@/components/common/BaseCard.vue'

const users = ref<SystemUser[]>([])
const showUserDialog = ref(false)
const isEditing = ref(false)
const userForm = ref<Partial<SystemUser>>({
  username: '',
  email: '',
  role: '观察者',
  status: '正常'
})

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
  } catch (e) {
    if (users.value.length === 0) {
      users.value = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@hcp.com',
          role: '超级管理员',
          status: '正常',
          lastLogin: '2026-01-29 10:30:00',
          createdAt: '2025-12-01 09:00:00'
        }
      ]
    }
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

onMounted(() => {
  loadUsers()
})
</script>
