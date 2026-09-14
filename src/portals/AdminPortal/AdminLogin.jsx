import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Lock, AlertCircle, Info } from 'lucide-react';

export const AdminLogin = () => {
  const { loginAdmin } = useApp();
  const [adminId, setAdminId] = useState('ADMIN01');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      loginAdmin(data.admin);
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
            <Shield size={26} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.3rem', color: 'var(--text)' }}>
            Admin Portal
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            State-Level Procurement &amp; Mandi Management
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
            <label className="form-label">Admin ID</label>
            <input
              type="text"
              className="form-input"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="e.g. ADMIN01"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
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
            {loading ? 'Logging in...' : 'Login to Admin Portal'}
          </button>
        </form>

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
          <span>Demo Credentials — ID: <strong>ADMIN01</strong> | Password: <strong>admin123</strong></span>
        </div>
      </div>
    </div>
  </div>
);
};
