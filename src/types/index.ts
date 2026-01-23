// ============= Dashboard Types =============
export interface Metrics {
  tps: number;
  p99Latency: number;
  nodeCount: number;
  cpuUsage: number;
  memoryUsage: number;
  networkBandwidth: number;
  blockHeight: number;
  successRate: number;
  timestamp: string;
}

export interface TrendData {
  time: string;
  tps: number;
  latency: number;
  cpu: number;
  memory: number;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

// ============= Benchmark Types =============
export interface BenchmarkTask {
  id: string;
  name: string;
  description?: string;
  consensus: 'PBFT' | 'tPBFT' | 'Raft' | 'Leios' | 'HotStuff' | 'VoteChain';
  nodeCount: number;
  transactionRate: number;
  duration: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  results?: {
    avgTps: number;
    avgLatency: number;
    p99Latency: number;
    p95Latency: number;
    maxLatency: number;
    minLatency: number;
    successRate: number;
    failedTx: number;
    totalTx: number;
    nodeUtilization: number;
  };
}

export interface BenchmarkForm {
  name: string;
  description: string;
  consensus: string;
  nodeCount: number;
  transactionRate: number;
  duration: number;
}

// ============= Consensus Types =============
export interface ConsensusAlgorithm {
  id: string;
  name: string;
  fullName: string;
  description: string;
  parameters: ConsensusParameter[];
  advantages: string[];
  disadvantages: string[];
}

export interface ConsensusParameter {
  key: string;
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  value: any;
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: ParameterOption[];
  description: string;
  unit?: string;
}

export interface ParameterOption {
  label: string;
  value: any;
  description?: string;
}

export interface ConsensusConfig {
  id: string;
  algorithm: string;
  parameters: Record<string, any>;
  status: 'active' | 'inactive';
  appliedAt: string;
  nodeCount: number;
  createdAt: string;
  description?: string;
}

// ============= Anti-Manipulation Types =============
export interface AntiManipulationStrategy {
  id: string;
  name: string;
  description: string;
  rules: ManipulationRule[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  detectionsCount: number;
}

export interface ManipulationRule {
  id: string;
  name: string;
  type: 'wash_trading' | 'spoofing' | 'front_running' | 'back_running' | 'custom';
  threshold: number;
  action: 'alert' | 'block' | 'log';
  description: string;
  enabled: boolean;
}

export interface ManipulationEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: string;
  data: Record<string, any>;
  resolved: boolean;
  resolvedAt?: string;
}

// ============= Metrics Types =============
export interface HistoricalMetrics {
  id: string;
  timestamp: string;
  taskId: string;
  taskName: string;
  consensus: string;
  tps: number;
  latency: number;
  p99Latency: number;
  nodeCount: number;
  cpuUsage: number;
  memoryUsage: number;
  blockHeight: number;
}

export interface MetricsFilter {
  startTime?: string;
  endTime?: string;
  consensus?: string;
  taskId?: string;
  minTps?: number;
  maxLatency?: number;
  page?: number;
  pageSize?: number;
}

export interface MetricsComparison {
  taskId: string;
  taskName: string;
  consensus: string;
  avgTps: number;
  avgLatency: number;
  p99Latency: number;
  successRate: number;
  efficiency: number;
}

// ============= Common Types =============
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PageMeta {
  title: string;
  icon?: string;
  breadcrumb?: boolean;
}

export interface NavItem {
  name: string;
  path: string;
  icon: string;
  title: string;
}

// ============= Chart Data Types =============
export interface ChartPoint {
  x: string | number;
  y: number;
}

export interface SeriesData {
  name: string;
  data: ChartPoint[];
}

export interface ChartConfig {
  title: string;
  xLabel?: string;
  yLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
}
