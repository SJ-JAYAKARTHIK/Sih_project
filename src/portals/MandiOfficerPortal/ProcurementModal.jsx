import React, { useState, useEffect } from 'react';
import { X, Scale, CreditCard, CheckCircle2, AlertCircle, Receipt, Printer, UserCheck } from 'lucide-react';

export const ProcurementModal = ({ isOpen, onClose, booking, mandiId, onProcurementSuccess }) => {
  const [actualQty, setActualQty] = useState('');
  const [billedBy, setBilledBy] = useState('Rajesh Sharma - Mandi Officer');
  const [ratePerQuintal, setRatePerQuintal] = useState(2300);
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedBill, setGeneratedBill] = useState(null);

  useEffect(() => {
    if (booking) {
      // Pre-fill actual or expected quantity
      setActualQty(booking.actualQty || booking.expectedQty || '');
      setError('');

      // If booking is already completed, fetch the existing bill
      if (booking.procurementStatus === 'Completed') {
        fetch(`/api/procurement/booking/${booking.id}`)
          .then(res => res.ok ? res.json() : null)
          .then(bill => {
            if (bill) {
              setGeneratedBill(bill);
              setActualQty(bill.actualQty);
              setRatePerQuintal(bill.ratePerQuintal);
              setBilledBy(bill.billedBy || '');
            }
          })
          .catch(err => console.error("Error fetching completed bill:", err));
      } else {
        setGeneratedBill(null);
        // Fetch accurate crop rate from master data
        fetch('/api/master/crops')
          .then(res => res.json())
          .then(crops => {
            const crop = crops.find(c => c.id === booking.cropId || booking.cropName?.includes(c.name.split(' ')[0]));
            if (crop) setRatePerQuintal(crop.ratePerQuintal);
          })
          .catch(() => {
            // Fallback estimation
            let rate = 2300;
            if (booking.cropName?.includes('Cotton')) rate = 7121;
            else if (booking.cropName?.includes('Wheat')) rate = 2275;
            else if (booking.cropName?.includes('Maize')) rate = 2090;
            else if (booking.cropName?.includes('Pulses')) rate = 7000;
            else if (booking.cropName?.includes('Gram')) rate = 5440;
            setRatePerQuintal(rate);
          });
      }
    }
  }, [booking]);

  useEffect(() => {
    const qtyVal = parseFloat(actualQty);
    if (!isNaN(qtyVal) && qtyVal > 0) {
      setCalculatedAmount(Math.round(qtyVal * ratePerQuintal));
    } else {
      setCalculatedAmount(0);
    }
  }, [actualQty, ratePerQuintal]);

  const handleConfirmPayment = async () => {
    setError('');
    setLoading(true);

    try {
      if (!actualQty || isNaN(actualQty) || parseFloat(actualQty) <= 0) {
        throw new Error("Please enter a valid numeric Actual Quantity weighed on the scale.");
      }

      if (!billedBy.trim()) {
        throw new Error("Please specify the operator name for 'Billed By'.");
      }

      const res = await fetch('/api/procurement/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mandiId,
          bookingId: booking.id,
          actualQty: parseFloat(actualQty),
          billedBy: billedBy.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process procurement payment.");
      }

      setGeneratedBill(data.bill);
      if (onProcurementSuccess) onProcurementSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: generatedBill ? '820px' : '580px', transition: 'all 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale color="#D97706" /> Weighing & Payment Procurement Process
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Layout Split: Left = Input & Calculation, Right = Bill Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: generatedBill ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
          
          {/* LEFT FORM */}
          <div>
            {/* Farmer Overview */}
            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '0.875rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                Farmer: {booking.farmerName} (ID: {booking.farmerId})
              </div>
              <div><strong>Crop:</strong> {booking.cropName}</div>
              <div><strong>Token:</strong> <span style={{ color: '#D97706', fontWeight: 800 }}>{booking.tokenNumber}</span></div>
              <div><strong>Mobile:</strong> {booking.mobile}</div>
              <div><strong>Expected Quantity:</strong> {booking.expectedQty ? `${booking.expectedQty} Quintals` : 'Not specified'}</div>
            </div>

            {/* Weighing Scale Actual Qty Input */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Scale size={16} /> Weighing Machine Scale — Actual Quantity (Quintals) *
              </label>
              <input
                type="number"
                className="form-input"
                style={{ fontSize: '1.1rem', fontWeight: 700, borderColor: '#F59E0B' }}
                value={actualQty}
                onChange={(e) => setActualQty(e.target.value)}
                placeholder="Enter verified actual quantity in quintals"
                step="0.1"
                min="0.1"
                required
                disabled={!!generatedBill}
              />
              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                1 Quintal = 100 KG. Overrides expected quantity estimate.
              </span>
            </div>

            {/* Price Calculation Box */}
            <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span>Applicable Rate / Quintal:</span>
                <strong>₹{ratePerQuintal.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span>Verified Quantity:</span>
                <strong>{actualQty || 0} Quintals</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #FCD34D', paddingTop: '0.5rem' }}>
                <span style={{ fontWeight: 700, color: '#92400E' }}>Total Calculated Amount:</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D97706' }}>₹{calculatedAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Billed By Field */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>
                <UserCheck size={15} /> Billed By (Officer / Operator Staff Name) *
              </label>
              <input
                type="text"
                className="form-input"
                value={billedBy}
                onChange={(e) => setBilledBy(e.target.value)}
                placeholder="Enter your name / officer ID"
                required
                disabled={!!generatedBill}
              />
            </div>

            {!generatedBill && (
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={loading}
              >
                <CreditCard size={18} /> {loading ? 'Processing Payment...' : 'Confirm Prototype Payment & Generate Bill'}
              </button>
            )}
          </div>

          {/* RIGHT SIDE: GENERATED BILL RECEIPT */}
          {generatedBill && (
            <div>
              <div className="alert alert-success" style={{ marginBottom: '0.75rem' }}>
                <CheckCircle2 size={18} />
                <div>
                  <strong>Payment Transactioned Successfully!</strong>
                  <div style={{ fontSize: '0.78rem' }}>Transferred to Farmer Bank Account via simulated prototype API.</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', border: '2px solid #059669', borderRadius: '10px', padding: '1rem', fontSize: '0.825rem' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #D1D5DB', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, color: '#065F46', fontSize: '1rem' }}>MANDI PROCUREMENT RECEIPT</div>
                  <div>{generatedBill.mandiName}</div>
                </div>

                <div style={{ display: 'grid', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  <div><strong>Bill No:</strong> {generatedBill.id}</div>
                  <div><strong>Token:</strong> {generatedBill.tokenNumber}</div>
                  <div><strong>Farmer:</strong> {generatedBill.farmerName} (ID: {generatedBill.farmerId})</div>
                  <div><strong>Crop:</strong> {generatedBill.cropName}</div>
                  <div><strong>Actual Quantity:</strong> <strong style={{ color: '#059669' }}>{generatedBill.actualQty} Quintals</strong></div>
                  <div><strong>Rate Paid:</strong> ₹{generatedBill.ratePerQuintal}/Quintal</div>
                  <div><strong>Total Paid:</strong> <strong style={{ color: '#D97706', fontSize: '1rem' }}>₹{generatedBill.totalAmount.toLocaleString()}</strong></div>
                  <div><strong>Billed By Officer:</strong> <span style={{ color: '#D97706', fontWeight: 700 }}>{generatedBill.billedBy}</span></div>
                  <div><strong>Payment Status:</strong> <span className="badge badge-green">Completed</span></div>
                </div>

                <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={() => window.print()}>
                  <Printer size={14} /> Print Bill Receipt
                </button>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={onClose}
              >
                Close & Return to List
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
