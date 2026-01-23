import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Benchmarks from '../views/Benchmarks.vue';
import ConsensusConfig from '../views/ConsensusConfig.vue';
import PolicyConfig from '../views/PolicyConfig.vue';
import Metrics from '../views/Metrics.vue';
import Settings from '../views/Settings.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { title: '仪表盘' } },
  { path: '/benchmarks', name: 'Benchmarks', component: Benchmarks, meta: { title: '压测任务' } },
  { path: '/consensus', name: 'Consensus', component: ConsensusConfig, meta: { title: '共识配置' } },
  { path: '/policies', name: 'Policies', component: PolicyConfig, meta: { title: '反操纵策略' } },
  { path: '/metrics', name: 'Metrics', component: Metrics, meta: { title: '监控与指标' } },
  { path: '/settings', name: 'Settings', component: Settings, meta: { title: '系统设置' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
