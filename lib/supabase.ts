import { createClient } from '@supabase/supabase-js';

// Check for required environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is not defined in environment variables');
}

if (!supabaseAnonKey) {
  throw new Error('SUPABASE_ANON_KEY is not defined in environment variables');
}

// Create Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Create Supabase admin client for server-side operations (requires service key)
export const createAdminClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_KEY is not defined');
  }
  
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          subscription_tier: 'free' | 'basic' | 'pro' | 'enterprise';
          fati_balance: number;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'purchase' | 'transfer' | 'reward' | 'spend';
          amount: number;
          fati_amount: number;
          created_at: string;
        };
      };
      avatars_usage: {
        Row: {
          id: string;
          user_id: string;
          avatar_name: string;
          query_count: number;
          last_used: string;
        };
      };
      marketplace_items: {
        Row: {
          id: string;
          name: string;
          price_fati: number;
          description: string;
          icon: string;
          available: boolean;
        };
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          purchased_at: string;
        };
      };
    };
  };
}
