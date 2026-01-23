<template>
  <div class="page">
    <h2>系统概览</h2>
    <div class="grid">
      <StatCard title="当前TPS" :value="fakeOverview.tps" unit="tx/s" />
      <StatCard title="P99延迟" :value="fakeOverview.p99" unit="ms" />
      <StatCard title="共识算法" :value="fakeOverview.consensusAlgo" />
      <StatCard title="在线节点" :value="fakeOverview.nodeCount" unit="nodes" />
    </div>

    <section class="section">
      <h3>最近一分钟性能</h3>
      <MiniChart title="TPS曲线" :points="fakeOverview.tpsSeries" />
      <MiniChart title="P99延迟曲线" :points="fakeOverview.p99Series" />
    </section>

    <section class="section">
      <h3>最近任务</h3>
      <table class="table">
        <thead>
          <tr>
            <th>任务名</th>
            <th>算法</th>
            <th>目标TPS</th>
            <th>节点数</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in fakeTasks" :key="task.id">
            <td>{{ task.name }}</td>
            <td>{{ task.consensusAlgo }}</td>
            <td>{{ task.targetTps }}</td>
            <td>{{ task.nodeCount }}</td>
            <td>
              <span :class="['tag', task.status.toLowerCase()]">{{ task.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
import StatCard from '../components/dashboard/StatCard.vue';
import MiniChart from '../components/dashboard/MiniChart.vue';

const fakeOverview = {
  tps: 12500,
  p99: 420,
  consensusAlgo: 'tPBFT',
  nodeCount: 80,
  tpsSeries: [8000, 10000, 12000, 13000, 12500],
  p99Series: [350, 380, 450, 430, 420],
};

const fakeTasks = [
  { id: '1', name: 'Raft-20nodes-5kTPS', consensusAlgo: 'Raft', targetTps: 5000, nodeCount: 20, status: 'FINISHED' },
  { id: '2', name: 'tPBFT-80nodes-12kTPS', consensusAlgo: 'tPBFT', targetTps: 12000, nodeCount: 80, status: 'RUNNING' },
  { id: '3', name: 'HotStuff-100nodes-15kTPS', consensusAlgo: 'HotStuff', targetTps: 15000, nodeCount: 100, status: 'PENDING' },
];
</script>

<style scoped>
.page h2 {
  margin-bottom: 16px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.section {
  margin-top: 24px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.table th, .table td {
  padding: 8px 10px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
}
.tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}
.tag.running {
  background: #e0f2fe;
  color: #0369a1;
}
.tag.finished {
  background: #dcfce7;
  color: #15803d;
}
.tag.pending {
  background: #fef9c3;
  color: #92400e;
}
</style>
