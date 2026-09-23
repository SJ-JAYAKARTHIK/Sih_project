import React from 'react';
import { X, Calendar, MapPin, CheckCircle2, Shield, User, FileText, Globe, PhoneCall, Scale, CreditCard } from 'lucide-react';

export const BookingDetailsDrawer = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  const isCompleted = booking.procurementStatus === 'Completed' || booking.procurementStage === 'COMPLETED';
  const isVerified = booking.arrivalStatus === 'Verified / Arrived';
  const isIVR = booking.source === 'VOICE IVR' || booking.source === 'IVR';

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '560px', padding: 0, borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#0E3524', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              UNIVERSAL BOOKING DETAILS
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{booking.tokenNumber || 'Token'}</span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', backgroundColor: isIVR ? '#FEF3C7' : '#EFF6FF', color: isIVR ? '#B45309' : '#1D4ED8', fontWeight: 800 }}>
                {isIVR ? '🎙️ VOICE IVR' : '🌐 WEB BOOKING'}
              </span>
            </h3>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: '#FFFFFF', fontSize: '1.5rem', cursor: 'pointer' }}>
            &times;
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.25rem 1.5rem', maxHeight: '75vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Farmer & Booking Card */}
          <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Farmer Name</div>
                <div style={{ fontWeight: 800, color: '#111827' }}>{booking.farmerName || 'Farmer'}</div>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>ID: {booking.farmerId}</div>
              </div>
              <div>
                <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Booking ID</div>
                <div style={{ fontWeight: 800, color: '#059669', fontFamily: 'monospace' }}>{booking.id || booking.bookingId}</div>
              </div>
              <div>
                <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Crop</div>
                <div style={{ fontWeight: 700, color: '#111827' }}>{booking.cropName || 'Crop'}</div>
              </div>
              <div>
                <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Mandi</div>
                <div style={{ fontWeight: 700, color: '#111827' }}>{booking.mandiName || 'Mandi'}</div>
              </div>
              <div>
                <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Date & Slot</div>
                <div style={{ fontWeight: 700, color: '#111827' }}>{booking.date} ({booking.timeSlot})</div>
              </div>
              <div>
                <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>Expected Quantity</div>
                <div style={{ fontWeight: 700, color: '#111827' }}>{booking.expectedQty || booking.expected_qty || 0} kg</div>
              </div>
            </div>
          </div>

          {/* Lifecycle Progress Timeline */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0E3524', marginBottom: '0.75rem' }}>
              Procurement Lifecycle Tracker
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 700 }}>
                <CheckCircle2 size={16} /> <span>1. Slot Booked ({booking.source || 'WEB'})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isVerified ? '#059669' : '#9CA3AF', fontWeight: isVerified ? 700 : 500 }}>
                <CheckCircle2 size={16} /> <span>2. Mandi Gate Arrival ({isVerified ? 'Verified' : 'Pending'})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isVerified ? '#059669' : '#9CA3AF', fontWeight: isVerified ? 700 : 500 }}>
                <CheckCircle2 size={16} /> <span>3. QR / Token Pass Verification</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isCompleted ? '#059669' : '#9CA3AF', fontWeight: isCompleted ? 700 : 500 }}>
                <CheckCircle2 size={16} /> <span>4. Weighing Completed ({booking.actualQty ? `${booking.actualQty} kg` : 'Pending'})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isCompleted ? '#059669' : '#9CA3AF', fontWeight: isCompleted ? 700 : 500 }}>
                <CheckCircle2 size={16} /> <span>5. Payment Confirmed ({booking.pricePaid ? `₹${booking.pricePaid.toLocaleString()}` : 'Pending'})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isCompleted ? '#059669' : '#9CA3AF', fontWeight: isCompleted ? 700 : 500 }}>
                <CheckCircle2 size={16} /> <span>6. Bill Generated (Billed By: {booking.billedBy || 'Mandi Officer'})</span>
              </div>
            </div>
          </div>

          {/* Financial Summary if Completed */}
          {isCompleted && (
            <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '0.85rem 1rem' }}>
              <div style={{ fontWeight: 800, color: '#065F46', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                Payment & Billing Summary
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem', color: '#047857' }}>
                <div>Actual Weight: <strong>{booking.actualQty} kg</strong></div>
                <div>Rate: <strong>₹{booking.ratePerQuintal || 2300} / Qtl</strong></div>
                <div>Total Payout: <strong>₹{(booking.pricePaid || booking.totalAmount || 0).toLocaleString('en-IN')}</strong></div>
                <div>Payment Ref: <strong>{booking.paymentRef || 'TXN-CONFIRMED'}</strong></div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
