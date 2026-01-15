import { supabase } from '../supabase';

export interface UserProfile {
  id: string;
  email: string;
  createdAt: Date;
  subscriptionTier: 'free' | 'basic' | 'pro' | 'enterprise';
  fatiBalance: number;
  stripeCustomerId?: string;
  referralCode?: string;
  referredBy?: string;
  lastLogin?: Date;
  metadata?: Record<string, any>;
}

// Get user by ID
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return mapToUserProfile(data);
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }

  return mapToUserProfile(data);
};

// Update user subscription tier
export const updateUserSubscription = async (
  userId: string,
  tier: 'free' | 'basic' | 'pro' | 'enterprise',
  stripeCustomerId?: string
): Promise<boolean> => {
  const updates: any = { subscription_tier: tier };
  
  if (stripeCustomerId) {
    updates.stripe_customer_id = stripeCustomerId;
  }

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user subscription:', error);
    return false;
  }

  return true;
};

// Update user metadata
export const updateUserMetadata = async (
  userId: string,
  metadata: Record<string, any>
): Promise<boolean> => {
  const { error } = await supabase
    .from('users')
    .update({ metadata })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user metadata:', error);
    return false;
  }

  return true;
};

// Get user by referral code
export const getUserByReferralCode = async (code: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('referral_code', code)
    .single();

  if (error) {
    console.error('Error fetching user by referral code:', error);
    return null;
  }

  return mapToUserProfile(data);
};

// Link referred user
export const linkReferredUser = async (
  referredUserId: string,
  referrerUserId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('users')
    .update({ referred_by: referrerUserId })
    .eq('id', referredUserId);

  if (error) {
    console.error('Error linking referred user:', error);
    return false;
  }

  return true;
};

// Get referral statistics
export const getReferralStats = async (userId: string): Promise<{
  totalReferrals: number;
  completedReferrals: number;
  totalRewards: number;
}> => {
  const { data: referrals, error: referralsError } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId);

  if (referralsError) {
    console.error('Error fetching referral stats:', referralsError);
    return { totalReferrals: 0, completedReferrals: 0, totalRewards: 0 };
  }

  const totalReferrals = referrals?.length || 0;
  const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0;
  const totalRewards = referrals?.reduce((sum, r) => sum + (r.reward_fati || 0), 0) || 0;

  return { totalReferrals, completedReferrals, totalRewards };
};

// Helper function to map database row to UserProfile
const mapToUserProfile = (data: any): UserProfile => {
  return {
    id: data.id,
    email: data.email,
    createdAt: new Date(data.created_at),
    subscriptionTier: data.subscription_tier,
    fatiBalance: data.fati_balance,
    stripeCustomerId: data.stripe_customer_id,
    referralCode: data.referral_code,
    referredBy: data.referred_by,
    lastLogin: data.last_login ? new Date(data.last_login) : undefined,
    metadata: data.metadata,
  };
};
