<template>
  <div class="page">
    <h2>压测任务管理</h2>
    <BenchmarkForm @submit="createTask" />
    <BenchmarkTable
      :items="tasks"
      :loading="loading"
      @start="startTask"
      @stop="stopTask"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BenchmarkForm from '../components/benchmarks/BenchmarkForm.vue';
import BenchmarkTable from '../components/benchmarks/BenchmarkTable.vue';
// 真实环境：引入 listBenchmarks/createBenchmark/startBenchmark/stopBenchmark
// 这里先用假数据

interface Task {
  id: string;
  name: string;
  targetTps: number;
  durationSec: number;
  consensusAlgo: string;
  nodeCount: number;
  status: 'PENDING' | 'RUNNING' | 'FINISHED' | 'FAILED';
}

const tasks = ref<Task[]>([]);
const loading = ref(false);

onMounted(() => {
  // TODO: 调用后端 API 获取
  tasks.value = [
    { id: '1', name: 'tPBFT-80nodes-12kTPS', targetTps: 12000, durationSec: 60, consensusAlgo: 'tPBFT', nodeCount: 80, status: 'RUNNING' },
  ];
});

function createTask(payload: Omit<Task, 'id' | 'status'>) {
  const id = String(Date.now());
  tasks.value.push({ ...payload, id, status: 'PENDING' });
  // TODO: 调用 createBenchmark(payload)
}

function startTask(id: string) {
  const t = tasks.value.find(t => t.id === id);
  if (t) t.status = 'RUNNING';
  // TODO: startBenchmark(id)
}

function stopTask(id: string) {
  const t = tasks.value.find(t => t.id === id);
  if (t) t.status = 'FINISHED';
  // TODO: stopBenchmark(id)
}
</script>

<style scoped>
.page h2 {
  margin-bottom: 16px;
}
</style>
