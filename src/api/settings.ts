import http from './http'
import { endpoints } from './config'
import type {
  GeneralSettings,
  NetworkSettings,
  StorageSettings,
  SecuritySettings,
  NotificationSettings,
  BackupSettings,
  SystemUser,
  BackupRecord
} from '@/types'

// ================ 通用设置相关接口 ================

// 获取通用设置
export const getGeneralSettings = () => {
  return http.get<GeneralSettings>(endpoints.SETTINGS_GENERAL)
}

// 更新通用设置，支持部分字段更新
export const updateGeneralSettings = (data: Partial<GeneralSettings>) => {
  return http.put<void>(endpoints.SETTINGS_GENERAL, data)
}

// ================ 网络配置相关接口 ================

export const getNetworkSettings = () => {
  return http.get<NetworkSettings>(endpoints.SETTINGS_NETWORK)
}

export const updateNetworkSettings = (data: Partial<NetworkSettings>) => {
  return http.put<void>(endpoints.SETTINGS_NETWORK, data)
}

// ================ 存储配置相关接口 ================

export const getStorageSettings = () => {
  return http.get<StorageSettings>(endpoints.SETTINGS_STORAGE)
}

export const updateStorageSettings = (data: Partial<StorageSettings>) => {
  return http.put<void>(endpoints.SETTINGS_STORAGE, data)
}

// 校验存储路径可用性
export const validateStoragePath = (path: string) => {
  return http.get<{ is_valid: boolean; normalized_path: string }>(
    '/settings/storage/validatePath',
    { params: { path } }
  )
}

// ================ 安全配置相关接口 ================

export const getSecuritySettings = () => {
  return http.get<SecuritySettings>(endpoints.SETTINGS_SECURITY)
}

export const updateSecuritySettings = (data: Partial<SecuritySettings>) => {
  return http.put<void>(endpoints.SETTINGS_SECURITY, data)
}

// ================ 通知配置相关接口 ================

export const getNotificationSettings = () => {
  return http.get<NotificationSettings>(endpoints.SETTINGS_NOTIFICATION)
}

export const updateNotificationSettings = (data: Partial<NotificationSettings>) => {
  return http.put<void>(endpoints.SETTINGS_NOTIFICATION, data)
}

// ================ 备份设置与记录相关接口 ================

export const getBackupSettings = () => {
  return http.get<BackupSettings>(endpoints.SETTINGS_BACKUP)
}

export const updateBackupSettings = (data: Partial<BackupSettings>) => {
  return http.put<void>(endpoints.SETTINGS_BACKUP, data)
}

// 触发一次立即备份
export const triggerBackup = () => {
  return http.post<void>('/settings/backup/trigger')
}

// 获取备份记录列表
export const getBackupRecords = () => {
  return http.get<BackupRecord[]>(endpoints.SETTINGS_BACKUPS)
}

export const restoreBackup = (id: string) => {
  return http.post<void>(`/settings/backup/restore/${id}`)
}

export const deleteBackup = (id: string) => {
  return http.delete<void>(`/settings/backups/${id}`)
}

// ================ 用户管理相关接口 ================

export const getUsers = () => {
  return http.get<SystemUser[]>(endpoints.SETTINGS_USERS)
}

export const createUser = (data: Partial<SystemUser>) => {
  return http.post<void>(endpoints.SETTINGS_USERS, data)
}

export const updateUser = (id: string, data: Partial<SystemUser>) => {
  return http.put<void>(`${endpoints.SETTINGS_USERS}/${id}`, data)
}

export const deleteUser = (id: string) => {
  return http.delete<void>(`${endpoints.SETTINGS_USERS}/${id}`)
}

// 重置用户密码
export const resetUserPassword = (id: string) => {
  return http.post<void>(`${endpoints.SETTINGS_USERS}/${id}/reset-password`)
}

// 用户字段级校验
export const validateUser = (data: {
  id?: string
  username: string
  email: string
  role?: string
}) => {
  return http.post<{
    valid: boolean
    errors: { field: string; message: string }[]
  }>('/settings/user/validate', data)
}
