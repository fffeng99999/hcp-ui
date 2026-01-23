
# HCP-UI (HCP‑Bench 控制台)

HCP-UI 是一个基于 **Vue 3**、**TypeScript** 和 **Vite** 开发的区块链共识性能压测管理系统前端。该系统旨在为 `HCP-Bench` 提供直观的可视化操作界面，支持压测任务的创建、共识算法配置以及实时的性能指标监控。

## 🛠️ 技术栈

* **框架**: [Vue 3 (Composition API)](https://vuejs.org/)
* **构建工具**: [Vite 7](https://vitejs.dev/)
* **状态管理**: [Pinia](https://pinia.vuejs.org/)
* **路由**: [Vue Router 4](https://router.vuejs.org/)
* **语言**: [TypeScript](https://www.typescriptlang.org/)
* **网络请求**: [Axios](https://axios-http.com/)
* **样式**: 原生 CSS (Scoped)

## ✨ 核心功能

* **📊 系统概览 (Dashboard)**: 实时监控当前系统的 TPS（每秒交易数）、P99 延迟、在线节点数以及性能趋势曲线。
* **🧪 压测任务管理**: 支持压测任务的列表展示、表单创建，并可手动控制任务的启动与停止。
* **⚙️ 共识与策略配置**: 提供专门的界面用于调整共识算法参数及反操纵策略。
* **📈 监控与指标**: 集成性能指标可视化图表，帮助分析区块链在高负载下的表现。

## 📁 目录结构

```text
src/
├── api/            # Axios 请求封装及接口定义 (如 benchmark.ts)
├── assets/         # 静态资源及全局样式 (如 main.css)
├── components/     # 公共组件
│   ├── layout/     # 布局组件 (Header, Sidebar, AppLayout)
│   ├── benchmarks/ # 压测任务相关组件
│   └── dashboard/  # 仪表盘统计卡片及图表
├── router/         # 路由配置
├── views/          # 页面视图 (Dashboard, Benchmarks 等)
├── App.vue         # 根组件
└── main.ts         # 入口文件

```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install

```

### 2. 开发环境运行

```bash
npm run dev

```

### 3. 项目打包

```bash
npm run build

```

## ⚙️ 配置说明

### 后端 API 地址

项目通过 `axios` 实例与后端通信。默认 API 基础路径为 `http://localhost:8080/api`。

您可以通过创建 `.env` 文件并修改 `VITE_API_BASE` 环境变量来覆盖此设置：

```env
VITE_API_BASE=http://your-backend-server:8080/api

```

## 🗺️ 路由导航

系统侧边栏包含以下功能模块：

* **仪表盘**: 系统整体性能状态快照。
* **压测任务**: 任务的生命周期管理。
* **共识配置**: 动态调整区块链共识参数。
* **反操纵策略**: 安全与防操纵机制设置。
* **监控与指标**: 详细的历史性能数据分析。

---

**Would you like me to add a section about the specific data structures used in the benchmark API or more details on the component communication?**