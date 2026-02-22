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

// 通用设置相关接口
export const getGeneralSettings = () => {
  return http.get<GeneralSettings>(endpoints.SETTINGS_GENERAL)
}

export const updateGeneralSettings = (data: Partial<GeneralSettings>) => {
  return http.put<GeneralSettings>(endpoints.SETTINGS_GENERAL, data)
}

// 网络设置相关接口
export const getNetworkSettings = () => {
  return http.get<NetworkSettings>(endpoints.SETTINGS_NETWORK)
}

export const updateNetworkSettings = (data: Partial<NetworkSettings>) => {
  return http.put<NetworkSettings>(endpoints.SETTINGS_NETWORK, data)
}

// 存储设置相关接口
export const getStorageSettings = () => {
  return http.get<StorageSettings>(endpoints.SETTINGS_STORAGE)
}

export const updateStorageSettings = (data: Partial<StorageSettings>) => {
  return http.put<StorageSettings>(endpoints.SETTINGS_STORAGE, data)
}

// 安全设置相关接口
export const getSecuritySettings = () => {
  return http.get<SecuritySettings>(endpoints.SETTINGS_SECURITY)
}

export const updateSecuritySettings = (data: Partial<SecuritySettings>) => {
  return http.put<SecuritySettings>(endpoints.SETTINGS_SECURITY, data)
}

// 通知设置相关接口
export const getNotificationSettings = () => {
  return http.get<NotificationSettings>(endpoints.SETTINGS_NOTIFICATION)
}

export const updateNotificationSettings = (data: Partial<NotificationSettings>) => {
  return http.put<NotificationSettings>(endpoints.SETTINGS_NOTIFICATION, data)
}

// 备份设置相关接口
export const getBackupSettings = () => {
  return http.get<BackupSettings>(endpoints.SETTINGS_BACKUP)
}

export const updateBackupSettings = (data: Partial<BackupSettings>) => {
  return http.put<BackupSettings>(endpoints.SETTINGS_BACKUP, data)
}

// 用户管理相关接口
export const getUsers = () => {
  return http.get<SystemUser[]>(endpoints.SETTINGS_USERS)
}

export const createUser = (data: Partial<SystemUser>) => {
  return http.post<SystemUser>(endpoints.SETTINGS_USERS, data)
}

export const updateUser = (id: string, data: Partial<SystemUser>) => {
  return http.put<SystemUser>(`${endpoints.SETTINGS_USERS}/${id}`, data)
}

export const deleteUser = (id: string) => {
  return http.delete(`${endpoints.SETTINGS_USERS}/${id}`)
}

export const resetUserPassword = (id: string) => {
  return http.post(`${endpoints.SETTINGS_USERS}/${id}/reset-password`)
}

// 备份记录相关接口
export const getBackups = () => {
  return http.get<BackupRecord[]>(endpoints.SETTINGS_BACKUPS)
}

export const createBackup = () => {
  return http.post<BackupRecord>(endpoints.SETTINGS_BACKUPS)
}

export const restoreBackup = (id: string) => {
  return http.post(`${endpoints.SETTINGS_BACKUPS}/${id}/restore`)
}

export const deleteBackup = (id: string) => {
  return http.delete(`${endpoints.SETTINGS_BACKUPS}/${id}`)
}
