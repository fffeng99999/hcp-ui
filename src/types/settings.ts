export interface GeneralSettings {
  systemName: string
  language: string
  timezone: string
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  dataRetention: number
  autoCleanup: boolean
  performanceMonitor: boolean
  rateLimit: number
}

export interface NetworkSettings {
  listenAddress: string
  p2pPort: number
  rpcPort: number
  maxConnections: number
  maxInbound: number
  maxOutbound: number
  upnp: boolean
  natTraversal: boolean
  uploadBandwidth: number
  downloadBandwidth: number
  seedNodes: string[]
}

export interface StorageSettings {
  dataPath: string
  logPath: string
  dbType: 'leveldb' | 'rocksdb' | 'postgres' | 'mongodb'
  cacheSize: number
  compression: boolean
  compressionAlgo: 'snappy' | 'lz4' | 'gzip' | 'zstd'
  autoArchive: boolean
  archiveThreshold: number
}

export interface SecuritySettings {
  jwtEnabled: boolean
  jwtExpiration: number
  twoFactorAuth: boolean
  passwordPolicy: string[]
  accessLog: boolean
  loginLockout: boolean
  lockoutThreshold: number
  lockoutDuration: number
  dataEncryption: boolean
  encryptionAlgo: 'aes-256-gcm' | 'chacha20-poly1305' | 'aes-128-gcm'
  tlsEnabled: boolean
  tlsVersion: '1.2' | '1.3'
  ipWhitelist: string[]
}

export interface NotificationSettings {
  emailEnabled: boolean
  smtpHost: string
  smtpPort: number
  senderEmail: string
  recipients: string[]
  webhookEnabled: boolean
  webhookUrl: string
  webhookToken: string
  systemEvents: string[]
  performanceEvents: string[]
  securityEvents: string[]
}

export interface BackupSettings {
  autoBackup: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  retentionCount: number
  backupPath: string
}

export interface SystemUser {
  id: string
  username: string
  email: string
  role: '超级管理员' | '管理员' | '操作员' | '观察者'
  status: '正常' | '禁用'
  lastLogin: string
  createdAt: string
}

export interface BackupRecord {
  id: string
  name: string
  size: string
  type: '自动' | '手动'
  createdAt: string
  status: '完整' | '损坏' | '进行中'
}

export interface SystemSettings {
  general: GeneralSettings
  network: NetworkSettings
  storage: StorageSettings
  security: SecuritySettings
  notification: NotificationSettings
  backup: BackupSettings
}
