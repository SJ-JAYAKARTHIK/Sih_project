import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KeyRound, User, Lock, AlertCircle, Sparkles } from 'lucide-react';

export const FarmerLogin = ({ onSwitchToRegister }) => {
  const { loginFarmer, t } = useApp();
  const [farmerId, setFarmerId] = useState('10029384'); // Pre-fill for prototype ease
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
    <div style={{ maxWidth: '450px', margin: '3rem auto' }} className="card">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#FEF3C7',
          color: '#D97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem'
        }}>
          <KeyRound size={28} />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{t('farmerLoginTitle')}</h2>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Access your procurement bookings & transaction bills</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">{t('farmerIdLabel')}</label>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
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
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
            <input
              type="password"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
          {loading ? 'Logging in...' : t('loginBtn')}
        </button>
      </form>

      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #E5E7EB',
        textAlign: 'center',
        fontSize: '0.9rem'
      }}>
        <span style={{ color: '#6B7280' }}>{t('noAccount')}{' '}</span>
        <button
          type="button"
          onClick={onSwitchToRegister}
          style={{ background: 'none', border: 'none', color: '#D97706', fontWeight: 600, cursor: 'pointer' }}
        >
          {t('registerBtn')}
        </button>
      </div>

      <div style={{
        marginTop: '1.25rem',
        backgroundColor: '#FFFBEB',
        border: '1px dashed #FCD34D',
        padding: '0.75rem',
        borderRadius: '8px',
        fontSize: '0.8rem',
        color: '#B45309',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Sparkles size={16} />
        <span>{t('demoFarmerNotice')}</span>
      </div>
    </div>
  );
};
