import React, { useState } from 'react';
import { signIn, signUp } from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
  referralCode?: string;
}

export default function AuthModal({ isOpen, onClose, onSuccess, referralCode }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }

        const { user, error: signUpError } = await signUp(email, password);
        
        if (signUpError) {
          setError(signUpError.message);
        } else if (user) {
          // If there's a referral code, track it
          if (referralCode) {
            try {
              await fetch('/api/referrals/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  referralCode,
                  newUserId: user.id,
                }),
              });
            } catch (refError) {
              console.error('Error tracking referral:', refError);
            }
          }
          
          if (onSuccess) onSuccess(user);
          onClose();
        }
      } else {
        const { user, error: signInError } = await signIn(email, password);
        
        if (signInError) {
          setError(signInError.message);
        } else if (user) {
          if (onSuccess) onSuccess(user);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '450px',
        width: '90%',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: '#a0aec0',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '0.5rem',
          }}>
            {mode === 'signin' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h2>
          <p style={{ color: '#a0aec0' }}>
            {mode === 'signin'
              ? 'Ingresa para continuar tu viaje cósmico'
              : 'Únete al ecosistema predictivo'}
          </p>
          {referralCode && mode === 'signup' && (
            <p style={{
              color: '#10b981',
              marginTop: '1rem',
              fontSize: '0.875rem',
            }}>
              🎁 Código de referido aplicado! Recibirás 100 $FATI de bienvenida
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#ef4444',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: '#fff',
              fontSize: '1rem',
            }}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              color: '#fff',
              fontSize: '1rem',
            }}
          />

          {mode === 'signup' && (
            <input
              type="password"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={{
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                color: '#fff',
                fontSize: '1rem',
              }}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? 'Procesando...'
              : mode === 'signin'
              ? 'Iniciar Sesión'
              : 'Crear Cuenta'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: '#a0aec0',
        }}>
          {mode === 'signin' ? (
            <p>
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => setMode('signup')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#667eea',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: 'inherit',
                }}
              >
                Regístrate
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => setMode('signin')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#667eea',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: 'inherit',
                }}
              >
                Inicia Sesión
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
