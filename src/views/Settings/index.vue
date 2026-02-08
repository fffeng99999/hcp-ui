<template>
  <div class="settings-page">
    <el-row :gutter="20">
      <el-col :span="5">
        <el-card class="settings-menu">
          <el-menu :default-active="activeMenu" router>
            <el-menu-item index="/settings/general">
              <el-icon><Setting /></el-icon>
              <span>通用设置</span>
            </el-menu-item>
            <el-menu-item index="/settings/network">
              <el-icon><Connection /></el-icon>
              <span>网络配置</span>
            </el-menu-item>
            <el-menu-item index="/settings/storage">
              <el-icon><FolderOpened /></el-icon>
              <span>存储配置</span>
            </el-menu-item>
            <el-menu-item index="/settings/security">
              <el-icon><Lock /></el-icon>
              <span>安全设置</span>
            </el-menu-item>
            <el-menu-item index="/settings/notification">
              <el-icon><Bell /></el-icon>
              <span>通知设置</span>
            </el-menu-item>
            <el-menu-item index="/settings/users">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
            <el-menu-item index="/settings/system">
              <el-icon><Monitor /></el-icon>
              <span>系统信息</span>
            </el-menu-item>
            <el-menu-item index="/settings/backup">
              <el-icon><Download /></el-icon>
              <span>备份恢复</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <el-col :span="19">
        <router-view />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Setting, Connection, FolderOpened, Lock, Bell, User, Monitor, Download } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style lang="scss" src="@/assets/styles/pages/settings.scss"></style>
