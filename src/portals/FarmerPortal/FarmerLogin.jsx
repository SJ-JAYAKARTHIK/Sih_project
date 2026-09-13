import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KeyRound, User, Lock, AlertCircle, Info } from 'lucide-react';

export const FarmerLogin = ({ onSwitchToRegister }) => {
  const { loginFarmer, t } = useApp();
  const [farmerId, setFarmerId] = useState('10029384');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/farmer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      loginFarmer(data.farmer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container" style={{ maxWidth: '420px' }}>
        <div className="card card-lg login-card">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--light-green)',
              border: '1px solid var(--green-border)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <KeyRound size={26} />
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.3rem', color: 'var(--text)' }}>
              {t('farmerLoginTitle')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Access your procurement bookings &amp; transaction history
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('farmerIdLabel')}</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={farmerId}
                  onChange={(e) => setFarmerId(e.target.value)}
                  placeholder={t('farmerIdPlaceholder')}
                  maxLength={8}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('passwordLabel')}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : t('loginBtn')}
            </button>
          </form>

          <div style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
            fontSize: '0.875rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>{t('noAccount')}{' '}</span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {t('registerBtn')}
            </button>
          </div>

          {/* Demo credentials */}
          <div style={{
            marginTop: '1rem',
            backgroundColor: 'var(--light-green)',
            border: '1px solid var(--green-border)',
            padding: '0.7rem 0.875rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{t('demoFarmerNotice')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

