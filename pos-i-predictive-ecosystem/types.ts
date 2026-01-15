
export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  tags: string[];
}

export interface SaleItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  timestamp: number;
  customerId?: string;
}

export interface AIInsight {
  type: 'demand' | 'pricing' | 'fraud' | 'recommendation' | 'health';
  message: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  actionableData?: any;
}

export interface ModelHealth {
  accuracy: number;
  drift: number;
  latency: number;
  cpu: number;
  memory: number;
  status: 'optimal' | 'degraded' | 're-training';
}

export interface TrialState {
  startDate: number;
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
  fingerprint: string;
}

export interface POSState {
  inventory: Product[];
  sales: Sale[];
  currentCart: SaleItem[];
  trial: TrialState;
  health: ModelHealth;
}

export interface Avatar {
  name: string;
  role: string;
  desc: string;
  status: string;
  color: string;
  isSpecial?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface CosmicResponse {
  answer: string;
  sources: GroundingSource[];
}

export interface AppNotification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}
