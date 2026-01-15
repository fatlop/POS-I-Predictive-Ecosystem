import { supabase } from './supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  subscriptionTier: 'free' | 'basic' | 'pro' | 'enterprise';
  fatiBalance: number;
}

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { user: null, error };
  }

  // Create user profile in database
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        subscription_tier: 'free',
        fati_balance: 100, // Welcome bonus
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }
  }

  return { user: data.user, error: null };
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error };
  }

  // Update last login
  if (data.user) {
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id);
  }

  return { user: data.user, error: null };
};

// Sign out
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current session
export const getSession = async (): Promise<Session | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};

// Get user profile with additional data
export const getUserProfile = async (userId: string): Promise<AuthUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, subscription_tier, fati_balance')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    subscriptionTier: data.subscription_tier,
    fatiBalance: data.fati_balance,
  };
};

// Reset password
export const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error };
};

// Update password
export const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { error };
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return !!session;
};

// Verify email (resend verification)
export const resendVerificationEmail = async (email: string): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  return { error };
};
