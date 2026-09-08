import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, QrCode, KeyRound, CheckCircle2, AlertCircle, Search } from 'lucide-react';

export const VerifyFarmerModal = ({ isOpen, onClose, mandiId, onVerificationSuccess }) => {
  const [method, setMethod] = useState('token'); // 'token' | 'qr'
  const [tokenInput, setTokenInput] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [verifiedFarmer, setVerifiedFarmer] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTokenInput('');
    setQrInput('');
    setError('');
    setSuccessMsg('');
    setVerifiedFarmer(null);
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload = { mandiId };
      if (method === 'token') {
        if (!tokenInput.trim()) throw new Error("Please enter a Token Number.");
        payload.tokenNumber = tokenInput.trim();
      } else {
        if (!qrInput.trim()) throw new Error("Please paste or scan a QR Code payload.");
        payload.qrData = qrInput.trim();
      }

      const res = await fetch('/api/arrivals/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setVerifiedFarmer(data.booking);
      setSuccessMsg(data.message || "Farmer Verified & Arrived Successfully!");
      if (onVerificationSuccess) onVerificationSuccess(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '550px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 color="#D97706" /> Verify Arriving Farmer
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
            <X size={20} />
          </button>
        </div>

        {/* Verification Method Switcher */}
        <div style={{ display: 'flex', backgroundColor: '#F3F4F6', padding: '0.25rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
          <button
            onClick={() => { setMethod('token'); resetForm(); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: method === 'token' ? '#FFFFFF' : 'transparent',
              color: method === 'token' ? '#D97706' : '#4B5563',
              boxShadow: method === 'token' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem'
            }}
          >
            <KeyRound size={16} /> Token Number Verification
          </button>

          <button
            onClick={() => { setMethod('qr'); resetForm(); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: method === 'qr' ? '#FFFFFF' : 'transparent',
              color: method === 'qr' ? '#D97706' : '#4B5563',
              boxShadow: method === 'qr' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem'
            }}
          >
            <QrCode size={16} /> QR Code Verification
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* METHOD 1: TOKEN NUMBER */}
        {method === 'token' && (
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label className="form-label">Farmer Booking Token Number</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="e.g. TKN-849201"
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Search size={16} /> {loading ? 'Verifying...' : 'Verify Token'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* METHOD 2: QR CODE */}
        {method === 'qr' && (
          <div>
            <div className="form-group">
              <label className="form-label">Scan or Paste QR Code Payload</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder='Paste QR Code Payload JSON or token string (e.g. {"tokenNumber":"TKN-849201"})'
              />
            </div>
            <button
              onClick={() => handleVerify()}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '1rem' }}
              disabled={loading}
            >
              <QrCode size={16} /> {loading ? 'Verifying QR Code...' : 'Verify QR Code'}
            </button>
          </div>
        )}

        {/* Verified Farmer Detail Card */}
        {verifiedFarmer && (
          <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065F46', fontWeight: 700, marginBottom: '0.5rem' }}>
              <CheckCircle2 size={18} /> Verified Farmer Arrival Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.85rem', color: '#047857' }}>
              <div><strong>Name:</strong> {verifiedFarmer.farmerName}</div>
              <div><strong>Farmer ID:</strong> {verifiedFarmer.id || verifiedFarmer.farmerId}</div>
              <div><strong>Mobile:</strong> {verifiedFarmer.mobile}</div>
              <div><strong>Token No:</strong> {verifiedFarmer.tokenNumber}</div>
              <div><strong>Crop:</strong> {verifiedFarmer.cropName}</div>
              <div><strong>Slot Time:</strong> {verifiedFarmer.timeSlot}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
