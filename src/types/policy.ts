export interface PolicyBase {
  enabled: boolean
  actions: string[] // 'log' | 'alert' | 'block' | 'punish' | 'freeze' | 'throttle' | 'ban'
}

export interface FrontRunningPolicy extends PolicyBase {
  timeWindow: number
  priceThreshold: number
  volumeThreshold: number
  similarityThreshold: number
  algorithm: 'temporal' | 'pattern' | 'ml' | 'hybrid'
  sensitivity: 'low' | 'medium' | 'high'
  autoLearn: boolean
}

export interface WashTradingPolicy extends PolicyBase {
  detectionPeriod: number
  roundTripCount: number
  accountCorrelation: number
  priceTolerance: number
  graphAlgorithm: 'community' | 'path' | 'centrality'
  addressLinking: boolean
  mlModel: 'random_forest' | 'neural_network' | 'xgboost'
}

export interface SpoofingPolicy extends PolicyBase {
  orderLifetime: number
  cancelRatio: number
  bookDepth: number
  priceDeviation: number
  detectionMode: 'realtime' | 'batch'
  orderAggregation: boolean
  behaviorModeling: boolean
}

export interface MevPolicy extends PolicyBase {
  sandwichDetection: boolean
  reorderingDetection: boolean
  profitThreshold: number
  timestampCheck: boolean
  gasPriceAnalysis: boolean
  blockBuildingMonitor: boolean
}

export interface AntiManipulationConfig {
  frontrunning: FrontRunningPolicy
  washtrading: WashTradingPolicy
  spoofing: SpoofingPolicy
  mev: MevPolicy
}

export interface ManipulationEvent {
  id?: string
  timestamp: string
  type: string
  txHash: string
  account: string
  confidence: number
  action: string
  status: string
}

export interface PolicyStats {
  totalDetected: number
  interceptionRate: number
  falsePositiveRate: number
  activeStrategies: number
}
