<template>
  <div class="settings-page">
    <el-row :gutter="20">
      <!-- 左侧导航菜单 -->
      <el-col :span="5">
        <el-card class="settings-menu">
          <el-menu :default-active="activeMenu" @select="handleMenuSelect">
            <el-menu-item index="general">
              <el-icon><Setting /></el-icon>
              <span>通用设置</span>
            </el-menu-item>
            <el-menu-item index="network">
              <el-icon><Connection /></el-icon>
              <span>网络配置</span>
            </el-menu-item>
            <el-menu-item index="storage">
              <el-icon><FolderOpened /></el-icon>
              <span>存储配置</span>
            </el-menu-item>
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon>
              <span>安全设置</span>
            </el-menu-item>
            <el-menu-item index="notification">
              <el-icon><Bell /></el-icon>
              <span>通知设置</span>
            </el-menu-item>
            <el-menu-item index="user">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
            <el-menu-item index="system">
              <el-icon><Monitor /></el-icon>
              <span>系统信息</span>
            </el-menu-item>
            <el-menu-item index="backup">
              <el-icon><Download /></el-icon>
              <span>备份恢复</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 右侧内容区域 -->
      <el-col :span="19">
        <!-- 通用设置 -->
        <el-card v-show="activeMenu === 'general'" class="settings-content">
          <template #header>
            <span>通用设置</span>
          </template>

          <el-form :model="generalSettings" label-width="160px">
            <el-form-item label="系统名称">
              <el-input v-model="generalSettings.systemName" style="width: 400px" />
            </el-form-item>

            <el-form-item label="默认语言">
              <el-select v-model="generalSettings.language" style="width: 200px">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
                <el-option label="日本語" value="ja-JP" />
              </el-select>
            </el-form-item>

            <el-form-item label="时区">
              <el-select v-model="generalSettings.timezone" style="width: 300px">
                <el-option label="UTC+8 北京时间" value="Asia/Shanghai" />
                <el-option label="UTC+0 协调世界时" value="UTC" />
                <el-option label="UTC-5 美国东部时间" value="America/New_York" />
              </el-select>
            </el-form-item>

            <el-form-item label="日志级别">
              <el-radio-group v-model="generalSettings.logLevel">
                <el-radio label="debug">调试</el-radio>
                <el-radio label="info">信息</el-radio>
                <el-radio label="warn">警告</el-radio>
                <el-radio label="error">错误</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="数据保留期限">
              <el-input-number v-model="generalSettings.dataRetention" :min="7" :max="365" />
              <span class="unit">天</span>
            </el-form-item>

            <el-form-item label="自动清理过期数据">
              <el-switch v-model="generalSettings.autoCleanup" />
            </el-form-item>

            <el-form-item label="启用性能监控">
              <el-switch v-model="generalSettings.performanceMonitor" />
            </el-form-item>

            <el-form-item label="API请求限流">
              <el-input-number v-model="generalSettings.rateLimit" :min="100" :max="10000" :step="100" />
              <span class="unit">次/分钟</span>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveGeneralSettings">保存设置</el-button>
              <el-button @click="resetGeneralSettings">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 网络配置 -->
        <el-card v-show="activeMenu === 'network'" class="settings-content">
          <template #header>
            <span>网络配置</span>
          </template>

          <el-form :model="networkSettings" label-width="160px">
            <el-divider content-position="left">P2P网络配置</el-divider>

            <el-form-item label="监听地址">
              <el-input v-model="networkSettings.listenAddress" placeholder="0.0.0.0" style="width: 300px" />
            </el-form-item>

            <el-form-item label="P2P端口">
              <el-input-number v-model="networkSettings.p2pPort" :min="1024" :max="65535" />
            </el-form-item>

            <el-form-item label="RPC端口">
              <el-input-number v-model="networkSettings.rpcPort" :min="1024" :max="65535" />
            </el-form-item>

            <el-form-item label="最大连接数">
              <el-input-number v-model="networkSettings.maxConnections" :min="10" :max="1000" />
            </el-form-item>

            <el-form-item label="最大入站连接">
              <el-input-number v-model="networkSettings.maxInbound" :min="5" :max="500" />
            </el-form-item>

            <el-form-item label="最大出站连接">
              <el-input-number v-model="networkSettings.maxOutbound" :min="5" :max="500" />
            </el-form-item>

            <el-divider content-position="left">网络优化</el-divider>

            <el-form-item label="启用UPnP">
              <el-switch v-model="networkSettings.upnp" />
            </el-form-item>

            <el-form-item label="启用NAT穿透">
              <el-switch v-model="networkSettings.natTraversal" />
            </el-form-item>

            <el-form-item label="带宽限制(上传)">
              <el-input-number v-model="networkSettings.uploadBandwidth" :min="1" :max="1000" />
              <span class="unit">MB/s</span>
            </el-form-item>

            <el-form-item label="带宽限制(下载)">
              <el-input-number v-model="networkSettings.downloadBandwidth" :min="1" :max="1000" />
              <span class="unit">MB/s</span>
            </el-form-item>

            <el-divider content-position="left">种子节点</el-divider>

            <el-form-item label="种子节点列表">
              <el-input
                v-model="seedNodesInput"
                type="textarea"
                :rows="5"
                placeholder="每行一个节点地址，格式: ip:port"
                style="width: 500px"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveNetworkSettings">保存设置</el-button>
              <el-button @click="testNetworkConnection">测试连接</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 存储配置 -->
        <el-card v-show="activeMenu === 'storage'" class="settings-content">
          <template #header>
            <span>存储配置</span>
          </template>

          <el-form :model="storageSettings" label-width="160px">
            <el-alert 
              title="当前存储使用情况" 
              type="info" 
              :closable="false"
              style="margin-bottom: 20px"
            >
              <div class="storage-info">
                <el-progress :percentage="storageUsage" :color="getStorageColor(storageUsage)">
                  <span>{{ storageUsed }}GB / {{ storageTotal }}GB</span>
                </el-progress>
              </div>
            </el-alert>

            <el-form-item label="数据存储路径">
              <el-input v-model="storageSettings.dataPath" style="width: 400px">
                <template #append>
                  <el-button @click="selectDataPath">浏览</el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="日志存储路径">
              <el-input v-model="storageSettings.logPath" style="width: 400px">
                <template #append>
                  <el-button @click="selectLogPath">浏览</el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="数据库类型">
              <el-select v-model="storageSettings.dbType" style="width: 200px">
                <el-option label="LevelDB" value="leveldb" />
                <el-option label="RocksDB" value="rocksdb" />
                <el-option label="PostgreSQL" value="postgres" />
                <el-option label="MongoDB" value="mongodb" />
              </el-select>
            </el-form-item>

            <el-form-item label="缓存大小">
              <el-input-number v-model="storageSettings.cacheSize" :min="128" :max="8192" :step="128" />
              <span class="unit">MB</span>
            </el-form-item>

            <el-form-item label="数据压缩">
              <el-switch v-model="storageSettings.compression" />
            </el-form-item>

            <el-form-item label="压缩算法">
              <el-select v-model="storageSettings.compressionAlgo" :disabled="!storageSettings.compression" style="width: 200px">
                <el-option label="Snappy" value="snappy" />
                <el-option label="LZ4" value="lz4" />
                <el-option label="Gzip" value="gzip" />
                <el-option label="Zstd" value="zstd" />
              </el-select>
            </el-form-item>

            <el-form-item label="自动归档">
              <el-switch v-model="storageSettings.autoArchive" />
            </el-form-item>

            <el-form-item label="归档阈值">
              <el-input-number v-model="storageSettings.archiveThreshold" :min="1" :max="100" :disabled="!storageSettings.autoArchive" />
              <span class="unit">GB</span>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveStorageSettings">保存设置</el-button>
              <el-button @click="optimizeStorage" :loading="optimizing">优化存储</el-button>
              <el-button @click="cleanupStorage" type="danger">清理垃圾数据</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 安全设置 -->
        <el-card v-show="activeMenu === 'security'" class="settings-content">
          <template #header>
            <span>安全设置</span>
          </template>

          <el-form :model="securitySettings" label-width="180px">
            <el-divider content-position="left">认证配置</el-divider>

            <el-form-item label="启用JWT认证">
              <el-switch v-model="securitySettings.jwtEnabled" />
            </el-form-item>

            <el-form-item label="JWT过期时间">
              <el-input-number v-model="securitySettings.jwtExpiration" :min="1" :max="168" :disabled="!securitySettings.jwtEnabled" />
              <span class="unit">小时</span>
            </el-form-item>

            <el-form-item label="启用双因素认证">
              <el-switch v-model="securitySettings.twoFactorAuth" />
            </el-form-item>

            <el-form-item label="密码策略">
              <el-checkbox-group v-model="securitySettings.passwordPolicy">
                <el-checkbox label="minLength">最少8位</el-checkbox>
                <el-checkbox label="uppercase">包含大写字母</el-checkbox>
                <el-checkbox label="lowercase">包含小写字母</el-checkbox>
                <el-checkbox label="number">包含数字</el-checkbox>
                <el-checkbox label="special">包含特殊字符</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-divider content-position="left">访问控制</el-divider>

            <el-form-item label="IP白名单">
              <el-input
                v-model="ipWhitelistInput"
                type="textarea"
                :rows="4"
                placeholder="每行一个IP地址或CIDR段"
                style="width: 400px"
              />
            </el-form-item>

            <el-form-item label="启用访问日志">
              <el-switch v-model="securitySettings.accessLog" />
            </el-form-item>

            <el-form-item label="失败登录锁定">
              <el-switch v-model="securitySettings.loginLockout" />
            </el-form-item>

            <el-form-item label="锁定阈值">
              <el-input-number v-model="securitySettings.lockoutThreshold" :min="3" :max="10" :disabled="!securitySettings.loginLockout" />
              <span class="unit">次</span>
            </el-form-item>

            <el-form-item label="锁定时长">
              <el-input-number v-model="securitySettings.lockoutDuration" :min="5" :max="120" :disabled="!securitySettings.loginLockout" />
              <span class="unit">分钟</span>
            </el-form-item>

            <el-divider content-position="left">加密配置</el-divider>

            <el-form-item label="数据加密">
              <el-switch v-model="securitySettings.dataEncryption" />
            </el-form-item>

            <el-form-item label="加密算法">
              <el-select v-model="securitySettings.encryptionAlgo" :disabled="!securitySettings.dataEncryption" style="width: 200px">
                <el-option label="AES-256-GCM" value="aes-256-gcm" />
                <el-option label="ChaCha20-Poly1305" value="chacha20-poly1305" />
                <el-option label="AES-128-GCM" value="aes-128-gcm" />
              </el-select>
            </el-form-item>

            <el-form-item label="传输层加密(TLS)">
              <el-switch v-model="securitySettings.tlsEnabled" />
            </el-form-item>

            <el-form-item label="TLS版本">
              <el-select v-model="securitySettings.tlsVersion" :disabled="!securitySettings.tlsEnabled" style="width: 200px">
                <el-option label="TLS 1.3" value="1.3" />
                <el-option label="TLS 1.2" value="1.2" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveSecuritySettings">保存设置</el-button>
              <el-button @click="generateNewKeys">重新生成密钥</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 通知设置 -->
        <el-card v-show="activeMenu === 'notification'" class="settings-content">
          <template #header>
            <span>通知设置</span>
          </template>

          <el-form :model="notificationSettings" label-width="160px">
            <el-divider content-position="left">邮件通知</el-divider>

            <el-form-item label="启用邮件通知">
              <el-switch v-model="notificationSettings.emailEnabled" />
            </el-form-item>

            <el-form-item label="SMTP服务器">
              <el-input v-model="notificationSettings.smtpHost" placeholder="smtp.example.com" style="width: 300px" :disabled="!notificationSettings.emailEnabled" />
            </el-form-item>

            <el-form-item label="SMTP端口">
              <el-input-number v-model="notificationSettings.smtpPort" :min="1" :max="65535" :disabled="!notificationSettings.emailEnabled" />
            </el-form-item>

            <el-form-item label="发件人邮箱">
              <el-input v-model="notificationSettings.senderEmail" placeholder="noreply@example.com" style="width: 300px" :disabled="!notificationSettings.emailEnabled" />
            </el-form-item>

            <el-form-item label="收件人列表">
              <el-select
                v-model="notificationSettings.recipients"
                multiple
                filterable
                allow-create
                placeholder="输入邮箱地址后按回车"
                style="width: 400px"
                :disabled="!notificationSettings.emailEnabled"
              >
              </el-select>
            </el-form-item>

            <el-divider content-position="left">Webhook通知</el-divider>

            <el-form-item label="启用Webhook">
              <el-switch v-model="notificationSettings.webhookEnabled" />
            </el-form-item>

            <el-form-item label="Webhook URL">
              <el-input v-model="notificationSettings.webhookUrl" placeholder="https://api.example.com/webhook" style="width: 400px" :disabled="!notificationSettings.webhookEnabled" />
            </el-form-item>

            <el-form-item label="认证Token">
              <el-input v-model="notificationSettings.webhookToken" type="password" show-password style="width: 400px" :disabled="!notificationSettings.webhookEnabled" />
            </el-form-item>

            <el-divider content-position="left">通知事件</el-divider>

            <el-form-item label="系统事件">
              <el-checkbox-group v-model="notificationSettings.systemEvents">
                <el-checkbox label="startup">系统启动</el-checkbox>
                <el-checkbox label="shutdown">系统关闭</el-checkbox>
                <el-checkbox label="error">系统错误</el-checkbox>
                <el-checkbox label="update">系统更新</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="性能事件">
              <el-checkbox-group v-model="notificationSettings.performanceEvents">
                <el-checkbox label="high-latency">高延迟告警</el-checkbox>
                <el-checkbox label="low-tps">低TPS告警</el-checkbox>
                <el-checkbox label="node-failure">节点故障</el-checkbox>
                <el-checkbox label="consensus-failure">共识失败</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="安全事件">
              <el-checkbox-group v-model="notificationSettings.securityEvents">
                <el-checkbox label="manipulation">操纵检测</el-checkbox>
                <el-checkbox label="attack">攻击检测</el-checkbox>
                <el-checkbox label="unauthorized">未授权访问</el-checkbox>
                <el-checkbox label="suspicious">可疑行为</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
              <el-button @click="testNotification">发送测试通知</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 用户管理 -->
        <el-card v-show="activeMenu === 'user'" class="settings-content">
          <template #header>
            <div class="card-header">
              <span>用户管理</span>
              <el-button type="primary" size="small" @click="showAddUser = true">
                <el-icon><Plus /></el-icon> 新增用户
              </el-button>
            </div>
          </template>

          <el-table :data="users" stripe>
            <el-table-column prop="username" label="用户名" width="150" />
            <el-table-column prop="email" label="邮箱" width="200" />
            <el-table-column prop="role" label="角色" width="120">
              <template #default="{ row }">
                <el-tag :type="getRoleType(row.role)">{{ row.role }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '正常' ? 'success' : 'danger'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastLogin" label="最后登录" width="180" />
            <el-table-column prop="createdAt" label="创建时间" width="180" />
            <el-table-column label="操作" fixed="right" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="editUser(row)">编辑</el-button>
                <el-button size="small" @click="resetPassword(row)">重置密码</el-button>
                <el-button size="small" type="danger" @click="deleteUser(row)" :disabled="row.role === '超级管理员'">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 系统信息 -->
        <el-card v-show="activeMenu === 'system'" class="settings-content">
          <template #header>
            <span>系统信息</span>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="系统版本">
              <el-tag type="success">HCP-Bench v1.0.0</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="区块链版本">
              <el-tag>v2.5.3</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="操作系统">
              Ubuntu 22.04 LTS x86_64
            </el-descriptions-item>
            <el-descriptions-item label="内核版本">
              5.15.0-89-generic
            </el-descriptions-item>
            <el-descriptions-item label="CPU">
              Intel Xeon E5-2680 v4 @ 2.40GHz (28核56线程)
            </el-descriptions-item>
            <el-descriptions-item label="内存">
              128GB DDR4 2400MHz
            </el-descriptions-item>
            <el-descriptions-item label="运行时间">
              15天 8小时 32分钟
            </el-descriptions-item>
            <el-descriptions-item label="Go版本">
              go1.21.5 linux/amd64
            </el-descriptions-item>
            <el-descriptions-item label="数据库版本">
              LevelDB 1.23
            </el-descriptions-item>
            <el-descriptions-item label="网络延迟">
              <el-tag type="success">平均 45ms</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="磁盘I/O">
              读: 258MB/s | 写: 186MB/s
            </el-descriptions-item>
            <el-descriptions-item label="网络吞吐">
              上行: 125MB/s | 下行: 98MB/s
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic title="CPU使用率" :value="68.5" suffix="%">
                <template #prefix>
                  <el-icon><Cpu /></el-icon>
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="8">
              <el-statistic title="内存使用率" :value="72.3" suffix="%">
                <template #prefix>
                  <el-icon><MemoryCard /></el-icon>
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="8">
              <el-statistic title="磁盘使用率" :value="45.8" suffix="%">
                <template #prefix>
                  <el-icon><FolderOpened /></el-icon>
                </template>
              </el-statistic>
            </el-col>
          </el-row>

          <el-divider />

          <el-space>
            <el-button @click="checkUpdate">检查更新</el-button>
            <el-button @click="viewLogs">查看日志</el-button>
            <el-button @click="exportSystemInfo">导出系统信息</el-button>
            <el-button type="danger" @click="restartSystem">重启系统</el-button>
          </el-space>
        </el-card>

        <!-- 备份恢复 -->
        <el-card v-show="activeMenu === 'backup'" class="settings-content">
          <template #header>
            <div class="card-header">
              <span>备份恢复</span>
              <el-button type="primary" size="small" @click="createBackup">
                <el-icon><FolderAdd /></el-icon> 创建备份
              </el-button>
            </div>
          </template>

          <el-form :model="backupSettings" label-width="160px">
            <el-form-item label="自动备份">
              <el-switch v-model="backupSettings.autoBackup" />
            </el-form-item>

            <el-form-item label="备份频率">
              <el-select v-model="backupSettings.frequency" :disabled="!backupSettings.autoBackup" style="width: 200px">
                <el-option label="每天" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
              </el-select>
            </el-form-item>

            <el-form-item label="备份保留数量">
              <el-input-number v-model="backupSettings.retentionCount" :min="1" :max="30" :disabled="!backupSettings.autoBackup" />
            </el-form-item>

            <el-form-item label="备份路径">
              <el-input v-model="backupSettings.backupPath" style="width: 400px">
                <template #append>
                  <el-button @click="selectBackupPath">浏览</el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveBackupSettings">保存设置</el-button>
            </el-form-item>
          </el-form>

          <el-divider />

          <el-table :data="backupList" stripe>
            <el-table-column prop="name" label="备份名称" width="250" />
            <el-table-column prop="size" label="大小" width="120" />
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }">
                <el-tag :type="row.type === '自动' ? 'success' : 'primary'" size="small">
                  {{ row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="200" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '完整' ? 'success' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="250">
              <template #default="{ row }">
                <el-button size="small" @click="restoreBackup(row)">
                  <el-icon><Upload /></el-icon> 恢复
                </el-button>
                <el-button size="small" @click="downloadBackup(row)">
                  <el-icon><Download /></el-icon> 下载
                </el-button>
                <el-button size="small" type="danger" @click="deleteBackup(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新增用户对话框 -->
    <el-dialog v-model="showAddUser" title="新增用户" width="500px">
      <el-form :model="newUser" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="newUser.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="newUser.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="newUser.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="newUser.role" style="width: 100%">
            <el-option label="超级管理员" value="超级管理员" />
            <el-option label="管理员" value="管理员" />
            <el-option label="操作员" value="操作员" />
            <el-option label="观察者" value="观察者" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddUser = false">取消</el-button>
        <el-button type="primary" @click="addUser">创建用户</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Setting, Connection, FolderOpened, Lock, Bell, User, Monitor, Download,
  Plus, Upload, FolderAdd, Cpu
} from '@element-plus/icons-vue'

const activeMenu = ref('general')
const showAddUser = ref(false)
const optimizing = ref(false)

// 通用设置
const generalSettings = ref({
  systemName: 'HCP-Bench系统',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  logLevel: 'info',
  dataRetention: 30,
  autoCleanup: true,
  performanceMonitor: true,
  rateLimit: 1000
})

// 网络设置
const networkSettings = ref({
  listenAddress: '0.0.0.0',
  p2pPort: 30303,
  rpcPort: 8545,
  maxConnections: 100,
  maxInbound: 50,
  maxOutbound: 50,
  upnp: true,
  natTraversal: true,
  uploadBandwidth: 100,
  downloadBandwidth: 100
})

const seedNodesInput = ref('192.168.1.10:30303\n192.168.1.11:30303\n192.168.1.12:30303')

// 存储设置
const storageSettings = ref({
  dataPath: '/data/hcp-bench',
  logPath: '/var/log/hcp-bench',
  dbType: 'leveldb',
  cacheSize: 1024,
  compression: true,
  compressionAlgo: 'snappy',
  autoArchive: true,
  archiveThreshold: 50
})

const storageUsed = ref(385)
const storageTotal = ref(1024)
const storageUsage = computed(() => Math.round((storageUsed.value / storageTotal.value) * 100))

// 安全设置
const securitySettings = ref({
  jwtEnabled: true,
  jwtExpiration: 24,
  twoFactorAuth: false,
  passwordPolicy: ['minLength', 'uppercase', 'lowercase', 'number'],
  accessLog: true,
  loginLockout: true,
  lockoutThreshold: 5,
  lockoutDuration: 30,
  dataEncryption: true,
  encryptionAlgo: 'aes-256-gcm',
  tlsEnabled: true,
  tlsVersion: '1.3'
})

const ipWhitelistInput = ref('192.168.1.0/24\n10.0.0.0/8')

// 通知设置
const notificationSettings = ref({
  emailEnabled: true,
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  senderEmail: 'noreply@hcp-bench.com',
  recipients: ['admin@example.com'],
  webhookEnabled: true,
  webhookUrl: 'https://api.example.com/webhook',
  webhookToken: '',
  systemEvents: ['error', 'update'],
  performanceEvents: ['high-latency', 'low-tps', 'node-failure'],
  securityEvents: ['manipulation', 'attack', 'unauthorized']
})

// 用户列表
const users = ref([
  {
    username: 'admin',
    email: 'admin@hcp-bench.com',
    role: '超级管理员',
    status: '正常',
    lastLogin: '2026-01-29 10:30:00',
    createdAt: '2025-12-01 09:00:00'
  },
  {
    username: 'operator',
    email: 'operator@hcp-bench.com',
    role: '操作员',
    status: '正常',
    lastLogin: '2026-01-29 09:15:00',
    createdAt: '2025-12-15 14:30:00'
  },
  {
    username: 'observer',
    email: 'observer@hcp-bench.com',
    role: '观察者',
    status: '正常',
    lastLogin: '2026-01-28 16:45:00',
    createdAt: '2026-01-10 11:20:00'
  }
])

const newUser = ref({
  username: '',
  email: '',
  password: '',
  role: '观察者'
})

// 备份设置
const backupSettings = ref({
  autoBackup: true,
  frequency: 'daily',
  retentionCount: 7,
  backupPath: '/backup/hcp-bench'
})

const backupList = ref([
  {
    name: 'backup-2026-01-29-auto',
    size: '2.3GB',
    type: '自动',
    createdAt: '2026-01-29 02:00:00',
    status: '完整'
  },
  {
    name: 'backup-2026-01-28-auto',
    size: '2.1GB',
    type: '自动',
    createdAt: '2026-01-28 02:00:00',
    status: '完整'
  },
  {
    name: 'backup-2026-01-27-manual',
    size: '2.0GB',
    type: '手动',
    createdAt: '2026-01-27 15:30:00',
    status: '完整'
  }
])

// 方法
const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

const saveGeneralSettings = () => {
  ElMessage.success('通用设置已保存')
}

const resetGeneralSettings = () => {
  ElMessage.info('已重置为默认设置')
}

const saveNetworkSettings = () => {
  ElMessage.success('网络配置已保存')
}

const testNetworkConnection = () => {
  ElMessage.success('网络连接测试成功')
}

const getStorageColor = (percentage: number) => {
  if (percentage >= 90) return '#F56C6C'
  if (percentage >= 70) return '#E6A23C'
  return '#67C23A'
}

const selectDataPath = () => {
  ElMessage.info('打开文件选择器')
}

const selectLogPath = () => {
  ElMessage.info('打开文件选择器')
}

const saveStorageSettings = () => {
  ElMessage.success('存储配置已保存')
}

const optimizeStorage = () => {
  optimizing.value = true
  setTimeout(() => {
    optimizing.value = false
    ElMessage.success('存储优化完成')
  }, 2000)
}

const cleanupStorage = () => {
  ElMessageBox.confirm('确定清理垃圾数据吗?此操作不可恢复', '警告', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('清理完成,释放空间 15.8GB')
  })
}

const saveSecuritySettings = () => {
  ElMessage.success('安全设置已保存')
}

const generateNewKeys = () => {
  ElMessageBox.confirm('重新生成密钥将使所有现有会话失效,确定继续吗?', '警告', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('密钥已重新生成')
  })
}

const saveNotificationSettings = () => {
  ElMessage.success('通知设置已保存')
}

const testNotification = () => {
  ElMessage.success('测试通知已发送')
}

const getRoleType = (role: string) => {
  const types: Record<string, any> = {
    '超级管理员': 'danger',
    '管理员': 'warning',
    '操作员': 'success',
    '观察者': 'info'
  }
  return types[role] || 'info'
}

const editUser = (row: any) => {
  ElMessage.info(`编辑用户 ${row.username}`)
}

const resetPassword = (row: any) => {
  ElMessageBox.confirm(`确定重置用户 ${row.username} 的密码吗?`, '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('密码已重置为默认密码')
  })
}

const deleteUser = (row: any) => {
  ElMessageBox.confirm(`确定删除用户 ${row.username} 吗?`, '警告', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('用户已删除')
  })
}

const addUser = () => {
  ElMessage.success('用户创建成功')
  showAddUser.value = false
}

const checkUpdate = () => {
  ElMessage.info('当前已是最新版本')
}

const viewLogs = () => {
  ElMessage.info('跳转到日志查看页面')
}

const exportSystemInfo = () => {
  ElMessage.success('系统信息导出成功')
}

const restartSystem = () => {
  ElMessageBox.confirm('确定重启系统吗?这将中断所有正在运行的任务', '警告', {
    type: 'warning'
  }).then(() => {
    ElMessage.warning('系统将在10秒后重启')
  })
}

const saveBackupSettings = () => {
  ElMessage.success('备份设置已保存')
}

const selectBackupPath = () => {
  ElMessage.info('打开文件选择器')
}

const createBackup = () => {
  ElMessage.success('备份任务已创建')
}

const restoreBackup = (row: any) => {
  ElMessageBox.confirm(`确定从备份 ${row.name} 恢复数据吗?当前数据将被覆盖`, '警告', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('数据恢复中,请稍候...')
  })
}

const downloadBackup = (row: any) => {
  ElMessage.success(`备份 ${row.name} 下载开始`)
}

const deleteBackup = (row: any) => {
  ElMessageBox.confirm(`确定删除备份 ${row.name} 吗?`, '警告', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('备份已删除')
  })
}
</script>

<style scoped>
.settings-page {
  padding: 20px;
}

.settings-menu {
  position: sticky;
  top: 20px;
}

.settings-content {
  min-height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.unit {
  margin-left: 8px;
  color: #909399;
}

.storage-info {
  padding: 10px 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}
</style>
