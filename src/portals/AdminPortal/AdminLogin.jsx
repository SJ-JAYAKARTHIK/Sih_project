import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Lock, AlertCircle, Sparkles } from 'lucide-react';

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
          <Shield size={28} />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Admin Portal</h2>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>State Level Procurement & Mandi Management System</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
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
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' }} />
            <input
              type="password"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Login to Admin Portal'}
        </button>
      </form>

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
        <span>Demo Credentials — ID: <strong>ADMIN01</strong> | Password: <strong>admin123</strong></span>
      </div>
    </div>
  );
};
