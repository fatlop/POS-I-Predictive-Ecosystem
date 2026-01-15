import React, { useState, useEffect } from 'react';
import { FATI_PURCHASE_OPTIONS } from '../lib/fati-token';

interface UserWalletProps {
  userId: string;
  balance: number;
  onPurchaseFati?: (amount: number) => void;
  onTransfer?: (toUserId: string, amount: number) => void;
}

export default function UserWallet({ userId, balance, onPurchaseFati, onTransfer }: UserWalletProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferEmail, setTransferEmail] = useState('');

  const handlePurchase = (amount: number) => {
    setSelectedOption(amount);
    if (onPurchaseFati) {
      onPurchaseFati(amount);
    }
  };

  const handleTransfer = () => {
    const amount = parseInt(transferAmount);
    if (amount > 0 && amount <= balance && onTransfer) {
      onTransfer(transferEmail, amount);
      setTransferAmount('');
      setTransferEmail('');
      setShowTransfer(false);
    }
  };

  return (
    <div style={{
      padding: '2rem',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Balance Card */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '1.5rem',
          padding: '3rem',
          marginBottom: '3rem',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.125rem',
              marginBottom: '0.5rem',
            }}>
              Balance Total $FATI
            </p>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#fff',
              margin: '1rem 0',
            }}>
              {balance.toLocaleString()} 
              <span style={{ fontSize: '2rem', marginLeft: '0.5rem' }}>$FATI</span>
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem',
            }}>
              ≈ ${(balance / 100).toFixed(2)} USD
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginTop: '2rem',
          }}>
            <button
              onClick={() => setShowTransfer(!showTransfer)}
              style={{
                padding: '1rem 2rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              🔄 Transferir
            </button>
          </div>
        </div>

        {/* Transfer Section */}
        {showTransfer && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem',
          }}>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>
              Transferir $FATI
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="email"
                placeholder="Email del destinatario"
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
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
                type="number"
                placeholder="Cantidad de $FATI"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                min="10"
                max={balance}
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '1rem',
                }}
              />
              <button
                onClick={handleTransfer}
                disabled={!transferEmail || !transferAmount || parseInt(transferAmount) > balance}
                style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  opacity: (!transferEmail || !transferAmount) ? 0.5 : 1,
                }}
              >
                Transferir
              </button>
            </div>
          </div>
        )}

        {/* Purchase Options */}
        <h2 style={{
          color: '#fff',
          fontSize: '2rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          Comprar $FATI Tokens
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem',
        }}>
          {FATI_PURCHASE_OPTIONS.map((option) => (
            <div
              key={option.amount}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '1rem',
                padding: '2rem',
                border: selectedOption === option.amount
                  ? '2px solid #667eea'
                  : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onClick={() => handlePurchase(option.amount)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {option.bonus > 0 && (
                <div style={{
                  background: '#f59e0b',
                  color: '#1a1a2e',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  marginBottom: '1rem',
                }}>
                  +{option.bonus}% BONUS
                </div>
              )}
              
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#667eea',
                  margin: '1rem 0',
                }}>
                  {option.totalFati.toLocaleString()}
                </p>
                <p style={{ color: '#a0aec0', marginBottom: '0.5rem' }}>
                  $FATI Tokens
                </p>
                <p style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#fff',
                  marginTop: '1rem',
                }}>
                  ${option.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Info Footer */}
        <div style={{
          marginTop: '3rem',
          textAlign: 'center',
          color: '#a0aec0',
        }}>
          <p style={{ marginBottom: '0.5rem' }}>
            💎 1 USD = 100 $FATI
          </p>
          <p>
            🔒 Pagos seguros con Stripe | 🎁 Bonificaciones por volumen
          </p>
        </div>
      </div>
    </div>
  );
}
