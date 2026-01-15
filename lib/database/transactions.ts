import { supabase } from '../supabase';
import { FatiTransaction, FatiTransactionType } from '../fati-token';

// Create a new transaction
export const createTransaction = async (
  userId: string,
  type: FatiTransactionType,
  amount: number,
  fatiAmount: number,
  metadata?: Record<string, any>
): Promise<string | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type,
      amount,
      fati_amount: fatiAmount,
      metadata: metadata || {},
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    return null;
  }

  return data.id;
};

// Get transactions by user ID
export const getTransactionsByUserId = async (
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<FatiTransaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return (data || []).map(mapToFatiTransaction);
};

// Get transactions by type
export const getTransactionsByType = async (
  userId: string,
  type: FatiTransactionType,
  limit: number = 50
): Promise<FatiTransaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching transactions by type:', error);
    return [];
  }

  return (data || []).map(mapToFatiTransaction);
};

// Get transaction summary for user
export const getTransactionSummary = async (userId: string): Promise<{
  totalPurchases: number;
  totalSpent: number;
  totalRewards: number;
  totalTransfers: number;
}> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('type, fati_amount')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching transaction summary:', error);
    return {
      totalPurchases: 0,
      totalSpent: 0,
      totalRewards: 0,
      totalTransfers: 0,
    };
  }

  const summary = {
    totalPurchases: 0,
    totalSpent: 0,
    totalRewards: 0,
    totalTransfers: 0,
  };

  data?.forEach(transaction => {
    switch (transaction.type) {
      case 'purchase':
        summary.totalPurchases += Math.abs(transaction.fati_amount);
        break;
      case 'spend':
        summary.totalSpent += Math.abs(transaction.fati_amount);
        break;
      case 'reward':
        summary.totalRewards += Math.abs(transaction.fati_amount);
        break;
      case 'transfer':
        summary.totalTransfers += Math.abs(transaction.fati_amount);
        break;
    }
  });

  return summary;
};

// Get recent transactions (last 30 days)
export const getRecentTransactions = async (
  userId: string,
  days: number = 30
): Promise<FatiTransaction[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recent transactions:', error);
    return [];
  }

  return (data || []).map(mapToFatiTransaction);
};

// Get transaction by ID
export const getTransactionById = async (transactionId: string): Promise<FatiTransaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }

  return mapToFatiTransaction(data);
};

// Helper function to map database row to FatiTransaction
const mapToFatiTransaction = (data: any): FatiTransaction => {
  return {
    id: data.id,
    userId: data.user_id,
    type: data.type as FatiTransactionType,
    amount: parseFloat(data.amount),
    fatiAmount: data.fati_amount,
    balance: 0, // Balance not stored in transactions table
    metadata: data.metadata || {},
    createdAt: new Date(data.created_at),
  };
};
