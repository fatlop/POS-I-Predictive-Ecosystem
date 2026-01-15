// FATI Token System - Internal cryptocurrency for POS-I Ecosystem

export interface FatiPurchaseOption {
  amount: number;
  price: number;
  bonus: number; // percentage bonus
  totalFati: number;
}

// Conversion rate: 1 USD = 100 FATI
export const USD_TO_FATI_RATE = 100;

// Purchase options with volume discounts
export const FATI_PURCHASE_OPTIONS: FatiPurchaseOption[] = [
  {
    amount: 100,
    price: 1,
    bonus: 0,
    totalFati: 100,
  },
  {
    amount: 500,
    price: 5,
    bonus: 5,
    totalFati: 525, // 500 + 5% bonus
  },
  {
    amount: 1000,
    price: 10,
    bonus: 10,
    totalFati: 1100, // 1000 + 10% bonus
  },
  {
    amount: 5000,
    price: 50,
    bonus: 20,
    totalFati: 6000, // 5000 + 20% bonus
  },
  {
    amount: 10000,
    price: 100,
    bonus: 25,
    totalFati: 12500, // 10000 + 25% bonus
  },
];

// Helper: Convert USD to FATI
export const usdToFati = (usd: number): number => {
  return Math.floor(usd * USD_TO_FATI_RATE);
};

// Helper: Convert FATI to USD
export const fatiToUsd = (fati: number): number => {
  return fati / USD_TO_FATI_RATE;
};

// Helper: Calculate FATI with bonus
export const calculateFatiWithBonus = (baseAmount: number, bonusPercent: number): number => {
  return Math.floor(baseAmount * (1 + bonusPercent / 100));
};

// Helper: Get purchase option by amount
export const getPurchaseOption = (amount: number): FatiPurchaseOption | undefined => {
  return FATI_PURCHASE_OPTIONS.find(option => option.amount === amount);
};

// Helper: Get best purchase option for USD amount
export const getBestOptionForUsd = (usd: number): FatiPurchaseOption | undefined => {
  return FATI_PURCHASE_OPTIONS
    .filter(option => option.price <= usd)
    .sort((a, b) => b.totalFati - a.totalFati)[0];
};

// Transaction types
export type FatiTransactionType = 'purchase' | 'transfer' | 'spend' | 'reward' | 'refund';

export interface FatiTransaction {
  id: string;
  userId: string;
  type: FatiTransactionType;
  amount: number;
  fatiAmount: number;
  balance: number; // balance after transaction
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Validation: Check if user has sufficient balance
export const hasSufficientBalance = (balance: number, required: number): boolean => {
  return balance >= required;
};

// Validation: Validate FATI amount
export const isValidFatiAmount = (amount: number): boolean => {
  return amount > 0 && Number.isInteger(amount);
};
