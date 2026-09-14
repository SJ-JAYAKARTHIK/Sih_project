import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, QrCode, KeyRound, CheckCircle2, AlertCircle, Search, Camera, RefreshCw, Smartphone } from 'lucide-react';

export const VerifyFarmerModal = ({ isOpen, onClose, mandiId, onVerificationSuccess, initialMethod = 'token' }) => {
  const [method, setMethod] = useState(initialMethod); // 'token' | 'qr'
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [verifiedFarmer, setVerifiedFarmer] = useState(null);

  // QR Scanner specific states
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const html5QrcodeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMethod(initialMethod || 'token');
      resetForm();
    } else {
      stopScanner();
      resetForm();
    }
  }, [isOpen, initialMethod]);

  // Handle scanner lifecycle when method changes or modal closes
  useEffect(() => {
    if (method === 'qr' && isOpen && !verifiedFarmer) {
      // Small timeout to allow DOM element #qr-reader-container to render
      const timer = setTimeout(() => {
        startScanner();
      }, 100);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [method, isOpen, verifiedFarmer]);

  const resetForm = () => {
    setTokenInput('');
    setError('');
    setSuccessMsg('');
    setVerifiedFarmer(null);
    setCameraError('');
  };

  const startScanner = async () => {
    setCameraError('');
    setIsScanning(false);
    await stopScanner(); // ensure clean state

    try {
      const scannerId = "qr-reader-container";
      const qrRegion = document.getElementById(scannerId);
      if (!qrRegion) return;

      const html5Qrcode = new Html5Qrcode(scannerId);
      html5QrcodeRef.current = html5Qrcode;

      const config = {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.7);
          return { width: Math.max(qrboxSize, 180), height: Math.max(qrboxSize, 180) };
        },
        aspectRatio: 1.0
      };

      await html5Qrcode.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          // QR Code detected!
          console.log("QR Code Scanned:", decodedText);
          await stopScanner();
          handleVerifyQrData(decodedText);
        },
        () => {
          // Frame scan error callback (ignored during active scanning)
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.warn("Camera start failed:", err);
      setIsScanning(false);
      setCameraError("Camera permission is required to scan a QR code. Please allow camera access in your browser settings or use Token verification.");
    }
  };

  const stopScanner = async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
      } catch (err) {
        // Ignore stop errors if scanner wasn't active
      } finally {
        html5QrcodeRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const handleVerifyQrData = async (qrDataText) => {
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/arrivals/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mandiId, qrData: qrDataText })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed for this QR code.");
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

  const handleTokenVerify = async (e) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) {
      setError("Please enter a Token Number.");
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/arrivals/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mandiId, tokenNumber: tokenInput.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed for this Token Number.");
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
      <div className="modal-content" style={{ maxWidth: '550px', width: '92%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 color="#D97706" /> Verify Arriving Farmer
          </h3>
          <button onClick={() => { stopScanner(); onClose(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
            <X size={20} />
          </button>
        </div>

        {/* Verification Method Switcher */}
        <div style={{ display: 'flex', backgroundColor: '#F3F4F6', padding: '0.25rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
          <button
            onClick={() => { setMethod('token'); resetForm(); }}
            style={{
              flex: 1,
              padding: '0.55rem',
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
            <KeyRound size={16} /> Token Verification
          </button>

          <button
            onClick={() => { setMethod('qr'); resetForm(); }}
            style={{
              flex: 1,
              padding: '0.55rem',
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
            <QrCode size={16} /> QR Camera Scanner
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* METHOD 1: TOKEN NUMBER */}
        {method === 'token' && !verifiedFarmer && (
          <form onSubmit={handleTokenVerify}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#374151' }}>
                Farmer Booking Token Number
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="e.g. TKN-849201"
                  style={{ flex: 1, minWidth: '180px' }}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Search size={16} /> {loading ? 'Verifying...' : 'Verify Token'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* METHOD 2: REAL CAMERA QR SCANNER */}
        {method === 'qr' && !verifiedFarmer && (
          <div style={{ textAlign: 'center' }}>
            {cameraError ? (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
                <Camera size={32} color="#DC2626" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 700, color: '#991B1B', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                  Camera Access Required
                </div>
                <div style={{ fontSize: '0.825rem', color: '#B91C1C', marginBottom: '1rem' }}>
                  {cameraError}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => startScanner()} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                    <RefreshCw size={14} /> Try Camera Again
                  </button>
                  <button onClick={() => { setMethod('token'); setError(''); }} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                    <KeyRound size={14} /> Verify with Token
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '380px',
                    margin: '0 auto 1rem',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#111827',
                    minHeight: '260px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  <div id="qr-reader-container" style={{ width: '100%' }}></div>
                  {loading && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', gap: '0.5rem', zIndex: 10 }}>
                      <RefreshCw size={28} className="animate-spin" color="#F59E0B" />
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Verifying Booking QR Code...</div>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.825rem', color: '#4B5563', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                  <Smartphone size={15} color="#D97706" />
                  Point your device camera directly at the farmer's booking QR code
                </div>

                {error && (
                  <button onClick={() => startScanner()} className="btn btn-outline" style={{ width: '100%', marginBottom: '0.5rem' }}>
                    <RefreshCw size={15} /> Scan Another QR Code
                  </button>
                )}
              </div>
            )}
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
              <div><strong>Status:</strong> <span style={{ backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>ARRIVED</span></div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button className="btn btn-outline" onClick={() => { stopScanner(); onClose(); }}>Close</button>
        </div>
      </div>
    </div>
  );
};

