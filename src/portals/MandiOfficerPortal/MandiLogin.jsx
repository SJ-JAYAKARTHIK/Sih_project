import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Lock, AlertCircle, Sparkles } from 'lucide-react';

export const MandiLogin = () => {
  const { loginMandi } = useApp();
  const [mandiId, setMandiId] = useState('MANDI01');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/mandi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mandiId, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      loginMandi(data.mandi);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '3rem auto' }} className="card">
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
          <Building2 size={28} />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Mandi Officer Portal</h2>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Shared Officer Access for Procurement Operations</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Mandi ID</label>
          <select
            className="form-select"
            value={mandiId}
            onChange={(e) => setMandiId(e.target.value)}
          >
            <option value="MANDI01">MANDI01 — Warangal Agriculture Market</option>
            <option value="MANDI02">MANDI02 — Nizamabad APMC Mandi</option>
            <option value="MANDI03">MANDI03 — Guntur Grain Yard</option>
            <option value="MANDI04">MANDI04 — Khammam Procurement Yard</option>
          </select>
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
              placeholder="Enter password (123456)"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Login to Mandi Account'}
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
        <span>Prototype Mandi Password: <strong>123456</strong> (Shared for authorized staff)</span>
      </div>
    </div>
  );
};
