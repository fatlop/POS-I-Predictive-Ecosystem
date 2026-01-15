import { supabase } from './supabase';
import { FatiTransaction, FatiTransactionType, isValidFatiAmount } from './fati-token';

export interface Wallet {
  userId: string;
  balance: number;
  lastUpdated: Date;
}

// Get user's wallet balance
export const getWalletBalance = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('users')
    .select('fati_balance')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching wallet balance:', error);
    throw new Error('Failed to fetch wallet balance');
  }

  return data?.fati_balance || 0;
};

// Update wallet balance
export const updateWalletBalance = async (
  userId: string,
  newBalance: number
): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .update({ fati_balance: newBalance })
    .eq('id', userId);

  if (error) {
    console.error('Error updating wallet balance:', error);
    throw new Error('Failed to update wallet balance');
  }
};

// Add FATI to wallet
export const addFatiToWallet = async (
  userId: string,
  amount: number,
  type: FatiTransactionType = 'purchase',
  metadata?: Record<string, any>
): Promise<FatiTransaction> => {
  if (!isValidFatiAmount(amount)) {
    throw new Error('Invalid FATI amount');
  }

  const currentBalance = await getWalletBalance(userId);
  const newBalance = currentBalance + amount;
  
  await updateWalletBalance(userId, newBalance);

  // Record transaction
  const transaction: FatiTransaction = {
    id: crypto.randomUUID(),
    userId,
    type,
    amount: 0, // USD amount (filled by caller if applicable)
    fatiAmount: amount,
    balance: newBalance,
    metadata,
    createdAt: new Date(),
  };

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type,
      amount: transaction.amount,
      fati_amount: amount,
    });

  if (error) {
    console.error('Error recording transaction:', error);
    // Don't throw - balance already updated, just log
  }

  return transaction;
};

// Deduct FATI from wallet
export const deductFatiFromWallet = async (
  userId: string,
  amount: number,
  type: FatiTransactionType = 'spend',
  metadata?: Record<string, any>
): Promise<FatiTransaction> => {
  if (!isValidFatiAmount(amount)) {
    throw new Error('Invalid FATI amount');
  }

  const currentBalance = await getWalletBalance(userId);
  
  if (currentBalance < amount) {
    throw new Error('Insufficient FATI balance');
  }

  const newBalance = currentBalance - amount;
  await updateWalletBalance(userId, newBalance);

  // Record transaction
  const transaction: FatiTransaction = {
    id: crypto.randomUUID(),
    userId,
    type,
    amount: 0,
    fatiAmount: -amount,
    balance: newBalance,
    metadata,
    createdAt: new Date(),
  };

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type,
      amount: transaction.amount,
      fati_amount: -amount,
    });

  if (error) {
    console.error('Error recording transaction:', error);
  }

  return transaction;
};

// Transfer FATI between wallets
export const transferFati = async (
  fromUserId: string,
  toUserId: string,
  amount: number
): Promise<{ fromTransaction: FatiTransaction; toTransaction: FatiTransaction }> => {
  if (!isValidFatiAmount(amount)) {
    throw new Error('Invalid FATI amount');
  }

  if (fromUserId === toUserId) {
    throw new Error('Cannot transfer to same wallet');
  }

  // Deduct from sender
  const fromTransaction = await deductFatiFromWallet(fromUserId, amount, 'transfer', {
    to: toUserId,
  });

  // Add to receiver
  const toTransaction = await addFatiToWallet(toUserId, amount, 'transfer', {
    from: fromUserId,
  });

  return { fromTransaction, toTransaction };
};

// Get transaction history
export const getTransactionHistory = async (
  userId: string,
  limit: number = 50
): Promise<FatiTransaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    userId: row.user_id,
    type: row.type as FatiTransactionType,
    amount: row.amount,
    fatiAmount: row.fati_amount,
    balance: 0, // Not stored, would need to calculate
    createdAt: new Date(row.created_at),
  }));
};
