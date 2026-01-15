import React from 'react';
import { PRICING_PLANS, PricingPlan } from '../config/pricing';

interface PricingTableProps {
  onSelectPlan?: (plan: PricingPlan) => void;
  currentTier?: string;
}

export default function PricingTable({ onSelectPlan, currentTier = 'free' }: PricingTableProps) {
  return (
    <div style={{
      padding: '4rem 2rem',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
          }}>
            Elige tu Plan Cósmico
          </h1>
          <p style={{
            color: '#a0aec0',
            fontSize: '1.125rem',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Selecciona el plan perfecto para tus necesidades y comienza tu viaje predictivo
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginTop: '2rem',
        }}>
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: plan.popular
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                borderRadius: '1rem',
                padding: plan.popular ? '2px' : '0',
                position: 'relative',
                transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = plan.popular ? 'scale(1.05)' : 'scale(1)';
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#f59e0b',
                  color: '#1a1a2e',
                  padding: '0.25rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                }}>
                  ⭐ POPULAR
                </div>
              )}

              <div style={{
                background: '#1a1a2e',
                borderRadius: plan.popular ? 'calc(1rem - 2px)' : '1rem',
                padding: '2rem',
                height: '100%',
              }}>
                {/* Plan Header */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#fff',
                    marginBottom: '0.5rem',
                  }}>
                    {plan.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '3rem',
                      fontWeight: 'bold',
                      color: plan.popular ? '#667eea' : '#fff',
                    }}>
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span style={{ color: '#a0aec0' }}>/{plan.interval}</span>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '2rem 0',
                  minHeight: '300px',
                }}>
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'start',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                        color: '#e2e8f0',
                      }}
                    >
                      <span style={{ color: '#10b981', fontSize: '1.25rem' }}>✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => onSelectPlan && onSelectPlan(plan)}
                  disabled={currentTier === plan.id}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: currentTier === plan.id ? 'not-allowed' : 'pointer',
                    background: currentTier === plan.id
                      ? '#4a5568'
                      : plan.popular
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: currentTier === plan.id ? '#a0aec0' : '#fff',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (currentTier !== plan.id) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {currentTier === plan.id
                    ? 'Plan Actual'
                    : plan.price === 0
                    ? 'Comenzar Gratis'
                    : 'Seleccionar Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div style={{
          marginTop: '4rem',
          textAlign: 'center',
          color: '#a0aec0',
        }}>
          <p style={{ marginBottom: '1rem' }}>
            💎 Todos los planes incluyen acceso al ecosistema predictivo
          </p>
          <p>
            🔒 Pagos seguros procesados por Stripe | 🔄 Cancela cuando quieras
          </p>
        </div>
      </div>
    </div>
  );
}
