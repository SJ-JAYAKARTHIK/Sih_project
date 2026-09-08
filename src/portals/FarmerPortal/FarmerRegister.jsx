import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export const FarmerRegister = ({ onSwitchToLogin }) => {
  const { loginFarmer, t } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    location: '',
    bankDetails: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/farmer-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(`Registration successful! Generated Farmer ID: ${data.farmer.id}`);
      setTimeout(() => {
        loginFarmer(data.farmer);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto' }} className="card">
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
          <UserPlus size={28} />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{t('farmerRegisterTitle')}</h2>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Create your 8-digit Farmer ID account for slot bookings</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">{t('farmerNameLabel')}</label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Ramesh Verma"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('mobileLabel')}</label>
          <input
            type="tel"
            className="form-input"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            placeholder="10-digit Mobile Number"
            maxLength={10}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('locationLabel')}</label>
          <input
            type="text"
            className="form-input"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Village / District / Location"
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('bankDetailsLabel')}</label>
          <input
            type="text"
            className="form-input"
            value={formData.bankDetails}
            onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
            placeholder="Bank Name — Account No / IFSC (Prototype representation)"
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t('passwordLabel')}</label>
          <input
            type="password"
            className="form-input"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Create password"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
          {loading ? 'Creating Account...' : t('registerBtn')}
        </button>
      </form>

      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #E5E7EB',
        textAlign: 'center',
        fontSize: '0.9rem'
      }}>
        <span style={{ color: '#6B7280' }}>{t('hasAccount')}{' '}</span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{ background: 'none', border: 'none', color: '#D97706', fontWeight: 600, cursor: 'pointer' }}
        >
          {t('farmerLoginTitle')}
        </button>
      </div>
    </div>
  );
};
