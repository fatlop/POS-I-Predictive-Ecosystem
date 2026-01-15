export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  priceId?: string; // Stripe Price ID
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Acceso limitado a chat básico',
      'StarField visualization',
      '10 consultas por día',
      'Avatares básicos',
    ],
  },
  {
    id: 'basic',
    name: 'Básico',
    price: 9.99,
    priceId: process.env.STRIPE_PRICE_BASIC,
    interval: 'month',
    features: [
      'Chat básico ilimitado',
      'StarField completo',
      'Hasta 100 consultas por día',
      'Todos los avatares básicos',
      'Soporte por email',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    priceId: process.env.STRIPE_PRICE_PRO,
    interval: 'month',
    popular: true,
    features: [
      'Todo lo del plan Básico',
      'Voz en vivo con avatares',
      'Análisis predictivo avanzado',
      'Avatares ilimitados',
      'Consultas ilimitadas',
      'Dashboard de analytics',
      'Sistema de referidos',
      'Soporte prioritario',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
    interval: 'month',
    features: [
      'Todo lo del plan Pro',
      'API access completo',
      'Avatares personalizados',
      'Consultorías 1-on-1',
      'Soporte dedicado 24/7',
      'SLA garantizado',
      'Integraciones personalizadas',
      'Reportes avanzados',
      'Prioridad en nuevas features',
    ],
  },
];

// Feature limits per tier
export const TIER_LIMITS = {
  free: {
    dailyQueries: 10,
    fatiBonus: 0,
    voiceMinutes: 0,
    avatarLimit: 3,
  },
  basic: {
    dailyQueries: 100,
    fatiBonus: 100,
    voiceMinutes: 60,
    avatarLimit: 10,
  },
  pro: {
    dailyQueries: -1, // unlimited
    fatiBonus: 500,
    voiceMinutes: 1000,
    avatarLimit: -1, // unlimited
  },
  enterprise: {
    dailyQueries: -1, // unlimited
    fatiBonus: 2000,
    voiceMinutes: -1, // unlimited
    avatarLimit: -1, // unlimited
  },
};

// Helper function to get plan by tier
export const getPlanByTier = (tier: SubscriptionTier): PricingPlan | undefined => {
  return PRICING_PLANS.find(plan => plan.id === tier);
};

// Helper function to check if feature is available for tier
export const hasFeatureAccess = (
  tier: SubscriptionTier,
  feature: keyof typeof TIER_LIMITS.free
): boolean => {
  const limit = TIER_LIMITS[tier][feature];
  return limit === -1 || limit > 0;
};
