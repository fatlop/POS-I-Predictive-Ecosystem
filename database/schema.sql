-- POS-I Predictive Ecosystem Database Schema
-- This schema is designed for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- USERS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
  fati_balance INTEGER DEFAULT 0 CHECK (fati_balance >= 0),
  stripe_customer_id VARCHAR(255),
  referral_code VARCHAR(50) UNIQUE,
  referred_by UUID REFERENCES users(id),
  last_login TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);

-- =====================================
-- TRANSACTIONS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'transfer', 'reward', 'spend', 'refund')),
  amount DECIMAL(10, 2) DEFAULT 0,
  fati_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- =====================================
-- AVATARS USAGE TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS avatars_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar_name VARCHAR(100) NOT NULL,
  query_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_avatars_usage_user_id ON avatars_usage(user_id);
CREATE INDEX idx_avatars_usage_avatar_name ON avatars_usage(avatar_name);
CREATE UNIQUE INDEX idx_avatars_usage_unique ON avatars_usage(user_id, avatar_name);

-- =====================================
-- MARKETPLACE ITEMS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  price_fati INTEGER NOT NULL CHECK (price_fati >= 0),
  description TEXT,
  icon VARCHAR(255),
  category VARCHAR(50),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index
CREATE INDEX idx_marketplace_items_available ON marketplace_items(available);
CREATE INDEX idx_marketplace_items_category ON marketplace_items(category);

-- =====================================
-- PURCHASES TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES marketplace_items(id),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fati_spent INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_item_id ON purchases(item_id);
CREATE INDEX idx_purchases_purchased_at ON purchases(purchased_at DESC);

-- =====================================
-- SUBSCRIPTIONS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('basic', 'pro', 'enterprise')),
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- =====================================
-- REFERRALS TABLE
-- =====================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_fati INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_referrals_status ON referrals(status);

-- =====================================
-- INITIAL MARKETPLACE ITEMS
-- =====================================
INSERT INTO marketplace_items (name, price_fati, description, icon, category, available) VALUES
  ('Consulta Profunda con Tio Chepe', 500, 'Sesión 1-on-1 de 30 minutos con el avatar más sabio del ecosistema', '🔮', 'premium', true),
  ('Pack de Voz Premium', 300, '1000 minutos de voz nativa para interactuar con todos los avatares', '🎙️', 'voice', true),
  ('Avatar Personalizado', 1000, 'Crea tu propio avatar IA con personalidad única', '🤖', 'avatar', true),
  ('Análisis Predictivo Avanzado', 200, 'Reportes semanales personalizados con insights profundos', '📊', 'analytics', true),
  ('Cristal de Memoria', 50, 'Guarda conversaciones importantes para siempre', '💎', 'utility', true),
  ('Boost de Frecuencia', 100, 'Duplica la velocidad de respuesta por 24 horas', '⚡', 'booster', true),
  ('Portal Dimensional', 150, 'Acceso a dimensiones ocultas del ecosistema', '🌀', 'special', true),
  ('Grimorio del Oráculo', 250, 'Colección de predicciones y sabiduría ancestral', '📖', 'knowledge', true)
ON CONFLICT DO NOTHING;

-- =====================================
-- FUNCTIONS AND TRIGGERS
-- =====================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscriptions table
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'REF-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for generating referral codes
CREATE TRIGGER generate_user_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- =====================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own avatar usage
CREATE POLICY "Users can view own avatar usage" ON avatars_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert avatar usage
CREATE POLICY "Users can insert avatar usage" ON avatars_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own avatar usage
CREATE POLICY "Users can update own avatar usage" ON avatars_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Everyone can view available marketplace items
CREATE POLICY "Anyone can view marketplace items" ON marketplace_items
  FOR SELECT USING (available = true);

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their referrals
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
