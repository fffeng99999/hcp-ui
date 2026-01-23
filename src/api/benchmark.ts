import request from './index';

export interface BenchmarkTask {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'FINISHED' | 'FAILED';
  targetTps: number;
  durationSec: number;
  consensusAlgo: string;
  nodeCount: number;
  createdAt: string;
}

export function listBenchmarks() {
  return request.get<BenchmarkTask[]>('/benchmarks');
}

export function createBenchmark(payload: {
  name: string;
  targetTps: number;
  durationSec: number;
  consensusAlgo: string;
  nodeCount: number;
}) {
  return request.post<BenchmarkTask>('/benchmarks', payload);
}

export function startBenchmark(id: string) {
  return request.post(`/benchmarks/${id}/start`);
}

export function stopBenchmark(id: string) {
  return request.post(`/benchmarks/${id}/stop`);
}
