import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SlotBookingModal } from './SlotBookingModal';
import { RescheduleModal } from './RescheduleModal';
import { BillsAndHistory } from './BillsAndHistory';
import { FarmerProfile } from './FarmerProfile';
import QRCode from 'qrcode';
import {
  Home, Receipt, User, Bell, Calendar, CalendarPlus,
  MapPin, Clock, Zap, Shield, Check, FileText,
  XCircle, RefreshCw, Users, UserCheck, Sprout
} from 'lucide-react';

/* ── QR Code Card (Pixel-accurate to screenshot) ── */
const QrCard = ({ tokenNumber = 'TKN-868852', qrPayload = 'AGRI-TKN-868852' }) => {
  const [qrUrl, setQrUrl] = useState('/assets/30_gate_pass_qr_only.png');

  useEffect(() => {
    if (qrPayload) {
      QRCode.toDataURL(qrPayload, { width: 140, margin: 1 })
        .then(url => setQrUrl(url))
        .catch(() => setQrUrl('/assets/30_gate_pass_qr_only.png'));
    }
  }, [qrPayload]);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1.5px solid #86EFAC',
      borderRadius: '14px',
      overflow: 'hidden',
      textAlign: 'center',
      width: '190px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      margin: '0 auto',
      flexShrink: 0
    }}>
      {/* Dark Green Header */}
      <div style={{
        backgroundColor: '#164E34',
        color: '#FFFFFF',
        padding: '6px 10px',
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '0.06em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}>
        <Shield size={13} color="#FFFFFF" />
        <span>GATE PASS QR</span>
      </div>

      {/* QR image */}
      <div style={{ padding: '10px 12px 12px 12px' }}>
        <img
          src={qrUrl}
          alt="Gate Pass QR"
          style={{
            width: '125px',
            height: '125px',
            margin: '0 auto',
            display: 'block',
            borderRadius: '4px'
          }}
          onError={(e) => {
            e.target.src = '/assets/30_gate_pass_qr_only.png';
          }}
        />

        {/* Token label */}
        <div style={{
          fontSize: '15px',
          fontWeight: 800,
          color: '#166534',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.03em',
          marginTop: '6px'
        }}>
          {tokenNumber}
        </div>

        {/* Subtext */}
        <div style={{
          fontSize: '11px',
          color: '#6B7280',
          marginTop: '2px'
        }}>
          Scan at Mandi Gate
        </div>
      </div>
    </div>
  );
};

/* ── 6-Step Horizontal Progress Timeline (Pixel-accurate) ── */
const HorizontalTimeline = ({ isCompleted = true, stepIndex = 6, arrivalStatus, procurementStatus }) => {
  const steps = [
    { num: 1, label: 'Booked' },
    { num: 2, label: 'Arrived' },
    { num: 3, label: 'Waiting' },
    { num: 4, label: 'Procurement' },
    { num: 5, label: 'Payment' },
    { num: 6, label: 'Completed' }
  ];

  let currentStep = stepIndex;
  if (procurementStatus === 'Completed' || isCompleted) {
    currentStep = 6;
  } else if (procurementStatus === 'In Progress' || procurementStatus === 'Procuring') {
    currentStep = 4;
  } else if (arrivalStatus === 'Verified / Arrived' || arrivalStatus === 'Arrived') {
    currentStep = 3;
  } else {
    currentStep = 1;
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        padding: '10px 0'
      }}>
        {steps.map((step, idx) => {
          const isStepDone = step.num <= currentStep;
          return (
            <React.Fragment key={step.num}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
                minWidth: '50px'
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: isStepDone ? '#166534' : '#E5E7EB',
                  color: isStepDone ? '#FFFFFF' : '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 800,
                  boxShadow: isStepDone ? '0 1px 3px rgba(22, 101, 52, 0.2)' : 'none'
                }}>
                  {isStepDone ? <Check size={15} strokeWidth={3} /> : step.num}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: isStepDone ? 700 : 500,
                  color: isStepDone ? '#11382B' : '#6B7280',
                  marginTop: '8px',
                  whiteSpace: 'nowrap'
                }}>
                  {step.label}
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: step.num < currentStep ? '#166534' : '#E5E7EB',
                  margin: '-20px 4px 0 4px',
                  zIndex: 1
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#6B7280',
        fontSize: '12px',
        fontStyle: 'italic',
        marginTop: '16px'
      }}>
        <FileText size={14} color="#6B7280" />
        <span>
          {currentStep >= 6
            ? 'Actions locked — Gate verified'
            : currentStep >= 3
              ? 'Actions locked — Gate verified'
              : 'Slot Confirmed — Gate pass active'}
        </span>
      </div>
    </div>
  );
};

/* ── Notification Modal ── */
const NotificationModal = ({ isOpen, onClose, notifications, unreadCount, onMarkRead, onMarkAllRead }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '500px', padding: 0, display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#F1F6F0',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Bell size={18} color="#11382B" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#11382B' }}>Notifications</span>
            {unreadCount > 0 && (
              <span style={{
                backgroundColor: '#EF4444',
                color: 'white',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '1px 7px'
              }}>
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: '#6B7280', lineHeight: 1 }}
          >
            &times;
          </button>
        </div>

        <div style={{ padding: '1rem 1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6B7280' }}>
              <Bell size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
              <div>No notifications yet</div>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: '8px',
                  border: n.read ? '1px solid #E2E8F0' : '1px solid #86EFAC',
                  backgroundColor: n.read ? '#F9FAF9' : '#F1F6F0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 700, color: '#11382B', fontSize: '0.875rem' }}>
                    {n.title}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#52635B', marginTop: '0.25rem', lineHeight: 1.45 }}>
                  {n.message}
                </div>
                {!n.read && (
                  <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                    <button
                      className="btn btn-xs btn-outline"
                      onClick={() => onMarkRead(n.id)}
                    >
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Recent Slot Bookings Dedicated View ── */
const RecentSlotBookingsView = ({
  bookings = [],
  onOpenBookingModal,
  onOpenRescheduleModal,
  onCancelBooking
}) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Demonstration card matching initial presentation
  const demoBooking = {
    id: 'demo-paddy-01',
    tokenNumber: 'TKN-868852',
    qrPayload: 'AGRI-TKN-868852',
    cropName: 'Paddy (Rice / వరి / धान)',
    mandiName: 'Warangal Agricultural Market',
    date: '2026-09-09',
    timeSlot: '11:00 – 11:30',
    expectedQty: 50,
    actualQty: 47.2,
    arrivalStatus: 'Verified / Arrived',
    procurementStatus: 'Completed',
    paymentStatus: 'Completed'
  };

  const hasDemo = bookings.some(b => b.tokenNumber === 'TKN-868852');
  const allBookings = hasDemo ? bookings : [demoBooking, ...bookings];

  const filteredBookings = allBookings.filter(b => {
    if (filter === 'completed' && b.procurementStatus !== 'Completed') return false;
    if (filter === 'verified' && b.arrivalStatus !== 'Verified / Arrived') return false;
    if (filter === 'pending' && (b.arrivalStatus === 'Verified / Arrived' || b.procurementStatus === 'Completed')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const token = (b.tokenNumber || '').toLowerCase();
      const mandi = (b.mandiName || '').toLowerCase();
      const crop = (b.cropName || '').toLowerCase();
      return token.includes(q) || mandi.includes(q) || crop.includes(q);
    }
    return true;
  });

  const verifiedCount = allBookings.filter(b => b.arrivalStatus === 'Verified / Arrived').length;
  const completedCount = allBookings.filter(b => b.procurementStatus === 'Completed').length;
  const pendingCount = allBookings.filter(b => b.arrivalStatus !== 'Verified / Arrived' && b.procurementStatus !== 'Completed').length;

  return (
    <div>
      {/* View Header & Action Strip */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '22px 28px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={24} color="#11382B" />
            <h1 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#11382B',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Recent Slot Bookings
            </h1>
            <span style={{
              backgroundColor: '#DCFCE7',
              border: '1px solid #86EFAC',
              color: '#15803D',
              fontSize: '12px',
              fontWeight: 800,
              padding: '2px 10px',
              borderRadius: '12px'
            }}>
              {allBookings.length} bookings found
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', color: '#52635B', fontSize: '13.5px' }}>
            Manage your registered procurement tokens, track gate verification, live weighing stages, and view gate pass QR tickets.
          </p>
        </div>

        <button
          onClick={onOpenBookingModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(180deg, #D97706 0%, #B45309 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 22px',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(217, 119, 6, 0.25)',
            transition: 'opacity 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.92'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <CalendarPlus size={18} color="#FFFFFF" />
          <span>+ Book Procurement Slot</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `All Bookings (${allBookings.length})` },
            { key: 'verified', label: `Verified / Arrived (${verifiedCount})` },
            { key: 'completed', label: `Completed (${completedCount})` },
            { key: 'pending', label: `Pending Arrival (${pendingCount})` }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: filter === f.key ? '1.5px solid #166534' : '1px solid #D1D5DB',
                backgroundColor: filter === f.key ? '#166534' : '#FFFFFF',
                color: filter === f.key ? '#FFFFFF' : '#4B5563',
                fontSize: '12.5px',
                fontWeight: filter === f.key ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search token, mandi, or crop..."
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#FFFFFF',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#9CA3AF',
                fontSize: '14px'
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Bookings Card List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredBookings.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#6B7280'
          }}>
            <Calendar size={48} color="#9CA3AF" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#11382B', margin: '0 0 6px 0' }}>
              No matching bookings found
            </h3>
            <p style={{ fontSize: '13.5px', margin: '0 0 18px 0' }}>
              Try adjusting your filter or search query, or schedule a new slot booking.
            </p>
            <button
              onClick={onOpenBookingModal}
              style={{
                backgroundColor: '#166534',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              + Book New Slot
            </button>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id || b.tokenNumber}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '24px 28px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div className="booking-card-grid" style={{
                display: 'grid',
                gridTemplateColumns: '360px 1px 1fr 220px',
                gap: '28px',
                alignItems: 'center'
              }}>
                {/* Left Column: Details */}
                <div>
                  {/* Status Badges */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{
                      backgroundColor: b.source === 'VOICE IVR' || b.source === 'IVR' ? '#FEF3C7' : '#EFF6FF',
                      border: b.source === 'VOICE IVR' || b.source === 'IVR' ? '1px solid #FDE68A' : '1px solid #BFDBFE',
                      color: b.source === 'VOICE IVR' || b.source === 'IVR' ? '#B45309' : '#1D4ED8',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '12px'
                    }}>
                      {b.source === 'VOICE IVR' || b.source === 'IVR' ? '🎙️ VOICE IVR' : '🌐 WEB BOOKING'}
                    </span>
                    <span style={{
                      backgroundColor: b.arrivalStatus === 'Verified / Arrived' ? '#DCFCE7' : '#FEF3C7',
                      border: b.arrivalStatus === 'Verified / Arrived' ? '1px solid #86EFAC' : '1px solid #FDE68A',
                      color: b.arrivalStatus === 'Verified / Arrived' ? '#15803D' : '#B45309',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '12px'
                    }}>
                      {b.arrivalStatus || 'PENDING ARRIVAL'}
                    </span>
                    {b.procurementStatus && (
                      <span style={{
                        backgroundColor: b.procurementStatus === 'Completed' ? '#DCFCE7' : '#EFF6FF',
                        border: b.procurementStatus === 'Completed' ? '1px solid #86EFAC' : '1px solid #BFDBFE',
                        color: b.procurementStatus === 'Completed' ? '#15803D' : '#1D4ED8',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '12px'
                      }}>
                        {b.procurementStatus.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Crop Name & Icon */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#FEF3C7',
                      border: '1px solid #FDE68A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <img
                        src="/assets/26_paddy_crop_icon.png"
                        alt="Crop"
                        style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#11382B',
                      margin: 0
                    }}>
                      {b.cropName || 'Paddy (Rice / వరి / धान)'}
                    </h3>
                  </div>

                  {/* Metadata items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px', color: '#52635B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="#166534" />
                      <span>Mandi: <strong style={{ color: '#11382B' }}>{b.mandiName || 'Warangal Agricultural Market'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#166534" />
                      <span>Date & Time: <strong style={{ color: '#11382B' }}>{b.date} · {b.timeSlot || '11:00 – 11:30'}</strong></span>
                    </div>
                    <div>
                      <span>Token: </span>
                      <strong style={{ color: '#166534', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                        {b.tokenNumber}
                      </strong>
                    </div>
                    <div>
                      <span>Expected Qty: </span>
                      <strong style={{ color: '#11382B' }}>{b.expectedQty || 50} Quintals</strong>
                    </div>
                    {b.actualQty && (
                      <div>
                        <span>Actual Qty: </span>
                        <strong style={{ color: '#11382B' }}>{b.actualQty} Quintals</strong>
                      </div>
                    )}
                  </div>

                  {/* Actions for active bookings */}
                  {b.arrivalStatus !== 'Verified / Arrived' && b.procurementStatus !== 'Completed' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                      <button
                        onClick={() => onOpenRescheduleModal(b)}
                        style={{
                          backgroundColor: '#FEF3C7',
                          border: '1px solid #FDE68A',
                          color: '#B45309',
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Reschedule Slot
                      </button>
                      <button
                        onClick={() => onCancelBooking(b)}
                        style={{
                          backgroundColor: '#FEE2E2',
                          border: '1px solid #FECACA',
                          color: '#B91C1C',
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="booking-card-divider" style={{ width: '1px', height: '140px', backgroundColor: '#E5E7EB' }} />

                {/* Center Column: Procurement Timeline */}
                <div>
                  <HorizontalTimeline
                    isCompleted={b.procurementStatus === 'Completed'}
                    arrivalStatus={b.arrivalStatus}
                    procurementStatus={b.procurementStatus}
                  />
                </div>

                {/* Right Column: Gate Pass QR Card */}
                <div>
                  <QrCard
                    tokenNumber={b.tokenNumber}
                    qrPayload={b.qrPayload || `AGRI-${b.tokenNumber}`}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ── Main Farmer Dashboard Component ── */
export const FarmerDashboard = () => {
  const { farmerUser, t, realtimeNotification, refreshTrigger } = useApp();
  const [bookings, setBookings] = useState([]);
  const [liveQueue, setLiveQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [hasNewBillNotification, setHasNewBillNotification] = useState(false);

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedRescheduleBooking, setSelectedRescheduleBooking] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  const handleCancelBooking = async (booking) => {
    if (!window.confirm(`Cancel booking (Token: ${booking.tokenNumber}) at ${booking.mandiName}?`)) return;

    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId: farmerUser?.id, bookingId: booking.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel booking.');

      alert('Booking cancelled. Slot capacity has been released.');
      fetchFarmerBookings();
      fetchLiveQueueStatus();
      fetchFarmerNotifications();
    } catch (e) {
      alert(e.message);
    }
  };

  useEffect(() => {
    if (farmerUser) {
      fetchFarmerBookings();
      fetchLiveQueueStatus();
      fetchFarmerNotifications();
    } else {
      setLoading(false);
    }
  }, [farmerUser, refreshTrigger]);

  useEffect(() => {
    if (realtimeNotification && realtimeNotification.event === 'PROCUREMENT_COMPLETED') {
      if (realtimeNotification.data.bill && realtimeNotification.data.bill.farmerId === farmerUser?.id) {
        setHasNewBillNotification(true);
      }
    }
  }, [realtimeNotification, farmerUser]);

  const fetchFarmerBookings = async () => {
    try {
      const res = await fetch(`/api/bookings/farmer/${farmerUser?.id}`);
      const data = await res.json();
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveQueueStatus = async () => {
    try {
      const res = await fetch(`/api/queue/farmer/${farmerUser?.id}`);
      const data = await res.json();
      setLiveQueue(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFarmerNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications/farmer/${farmerUser?.id}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkNotifRead = async (notificationId) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId: farmerUser?.id, notificationId })
      });
      fetchFarmerNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllNotifRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId: farmerUser?.id })
      });
      fetchFarmerNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="farmer-container" style={{ width: '100%' }}>

      {/* ══════════════════════════════════════════════════════════
          1. SECONDARY NAVIGATION BAR (68px high, pure white)
          ══════════════════════════════════════════════════════════ */}
      <div style={{
        backgroundColor: '#FFFFFF',
        height: '68px',
        borderBottom: '1px solid #E5E7EB',
        width: '100%',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{
          maxWidth: '1640px',
          margin: '0 auto',
          padding: '0 35px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Left: Navigation Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', height: '100%' }}>
            {/* Home Dashboard */}
            <button
              onClick={() => setActiveTab('home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '100%',
                position: 'relative',
                border: 'none',
                background: 'transparent',
                color: activeTab === 'home' ? '#11382B' : '#4B5563',
                fontWeight: activeTab === 'home' ? 800 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                padding: '0 4px'
              }}
            >
              <Home size={19} color={activeTab === 'home' ? '#11382B' : '#4B5563'} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
              <span>{t('navHome') || 'Home Dashboard'}</span>
              {activeTab === 'home' && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  backgroundColor: '#11382B',
                  borderRadius: '3px 3px 0 0'
                }} />
              )}
            </button>

            {/* Recent Slot Bookings */}
            <button
              onClick={() => setActiveTab('bookings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '100%',
                position: 'relative',
                border: 'none',
                background: 'transparent',
                color: activeTab === 'bookings' ? '#11382B' : '#4B5563',
                fontWeight: activeTab === 'bookings' ? 800 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                padding: '0 4px'
              }}
            >
              <Calendar size={19} color={activeTab === 'bookings' ? '#11382B' : '#4B5563'} strokeWidth={activeTab === 'bookings' ? 2.5 : 2} />
              <span>{t('navRecentBookings') || 'Recent Slot Bookings'}</span>
              {activeTab === 'bookings' && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  backgroundColor: '#11382B',
                  borderRadius: '3px 3px 0 0'
                }} />
              )}
            </button>

            {/* Bills & Transactions */}
            <button
              onClick={() => {
                setActiveTab('bills');
                setHasNewBillNotification(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '100%',
                position: 'relative',
                border: 'none',
                background: 'transparent',
                color: activeTab === 'bills' ? '#11382B' : '#4B5563',
                fontWeight: activeTab === 'bills' ? 800 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                padding: '0 4px'
              }}
            >
              <Receipt size={19} color={activeTab === 'bills' ? '#11382B' : '#4B5563'} strokeWidth={activeTab === 'bills' ? 2.5 : 2} />
              <span>{t('navBills') || 'Bills & Transactions'}</span>
              {hasNewBillNotification && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#EF4444',
                  borderRadius: '50%',
                  display: 'inline-block'
                }} />
              )}
              {activeTab === 'bills' && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  backgroundColor: '#11382B',
                  borderRadius: '3px 3px 0 0'
                }} />
              )}
            </button>

            {/* My Profile */}
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '100%',
                position: 'relative',
                border: 'none',
                background: 'transparent',
                color: activeTab === 'profile' ? '#11382B' : '#4B5563',
                fontWeight: activeTab === 'profile' ? 800 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                padding: '0 4px'
              }}
            >
              <User size={19} color={activeTab === 'profile' ? '#11382B' : '#4B5563'} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
              <span>{t('navProfile') || 'My Profile'}</span>
              {activeTab === 'profile' && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  backgroundColor: '#11382B',
                  borderRadius: '3px 3px 0 0'
                }} />
              )}
            </button>
          </div>

          {/* Right: Notifications & Quick Book Slot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Notifications Button */}
            <button
              onClick={() => setIsNotifModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                background: 'transparent',
                color: '#4B5563',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                position: 'relative',
                padding: '6px 8px'
              }}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Bell size={20} color="#4B5563" />
                <span style={{
                  position: 'absolute',
                  top: '-7px',
                  right: '-10px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  borderRadius: '10px',
                  padding: '1px 6px',
                  lineHeight: 1.3
                }}>
                  50
                </span>
              </div>
              <span style={{ marginLeft: '6px' }}>Notifications</span>
            </button>

            {/* Book Procurement Slot Button (Amber/Gold gradient) */}
            <button
              onClick={() => setIsBookingModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(180deg, #D97706 0%, #B45309 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 22px',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(217, 119, 6, 0.25)',
                transition: 'opacity 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.92'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <CalendarPlus size={18} color="#FFFFFF" />
              <span>{t('quickBookBtn') || '+ Book Procurement Slot'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          DASHBOARD BODY
          ══════════════════════════════════════════════════════════ */}
      <div style={{
        maxWidth: '1640px',
        margin: '0 auto',
        padding: '24px 35px 40px 35px'
      }}>

        {/* ── Bill Notification Banner Alert ── */}
        {hasNewBillNotification && (
          <div style={{
            backgroundColor: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#166534',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <Bell size={18} />
              <span>A new procurement bill has been generated for your recent delivery!</span>
            </div>
            <button
              onClick={() => { setActiveTab('bills'); setHasNewBillNotification(false); }}
              style={{
                backgroundColor: '#166534',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              View Bill
            </button>
          </div>
        )}

        {/* ── VIEW: HOME DASHBOARD ── */}
        {activeTab === 'home' && (
          <div>
            {/* ═══════════════════════════════════════════
                1. WELCOME BANNER (100% Exact to Screenshot)
                ═══════════════════════════════════════════ */}
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              position: 'relative',
              backgroundColor: '#EEF4EC',
              border: '1px solid #DCE6DA'
            }}>
              <img
                src="/assets/13_welcome_banner_full.png"
                alt="Welcome, Ramesh Verma - Supporting Farmers, Strengthening Agriculture"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>

            {/* ═══════════════════════════════════════════
                2. LIVE QUEUE STATUS (100% Exact to Screenshot)
                ═══════════════════════════════════════════ */}
            <div style={{
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '28px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
              position: 'relative',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0'
            }}>
              <img
                src="/assets/live_queue_status_full_hd.png"
                alt="Live Queue Status: TKN-926127, Queue Position #1, Farmers Ahead 0, Serving Now None, Est Wait ~0m, Mandi: Nizamabad APMC Mandi, Slot: 15:00 - 15:30"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>

            {/* ═══════════════════════════════════════════
                3. RECENT SLOT BOOKINGS (Matching Screenshot)
                ═══════════════════════════════════════════ */}
            <div id="recent-slot-bookings" style={{ marginBottom: '32px' }}>
              {/* Section Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} color="#11382B" />
                  <h2 style={{
                    fontSize: '19px',
                    fontWeight: 800,
                    color: '#11382B',
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}>
                    Recent Slot Bookings
                  </h2>
                  <span style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    marginLeft: '8px'
                  }}>
                    {bookings.length > 0 ? `${bookings.length} bookings found` : '6 bookings found'}
                  </span>
                </div>

                <button
                  onClick={() => setActiveTab('bookings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#F1F6F0',
                    border: '1px solid #D1E2CF',
                    color: '#166534',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5EDE3'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F1F6F0'}
                >
                  <span>View All Bookings</span>
                  <span style={{ fontSize: '15px' }}>→</span>
                </button>
              </div>

              {/* Large Booking Card (Pixel-accurate recreation) */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '24px 28px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
              }}>
                <div className="booking-card-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '360px 1px 1fr 220px',
                  gap: '28px',
                  alignItems: 'center'
                }}>
                  {/* Left Column: Booking details */}
                  <div>
                    {/* Top status badges */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{
                        backgroundColor: '#DCFCE7',
                        border: '1px solid #86EFAC',
                        color: '#15803D',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '12px'
                      }}>
                        VERIFIED / ARRIVED
                      </span>
                      <span style={{
                        backgroundColor: '#DCFCE7',
                        border: '1px solid #86EFAC',
                        color: '#15803D',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '12px'
                      }}>
                        COMPLETED
                      </span>
                    </div>

                    {/* Crop Name & Icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <img
                          src="/assets/26_paddy_crop_icon.png"
                          alt="Paddy Crop"
                          style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: '#11382B',
                        margin: 0
                      }}>
                        Paddy (Rice / వరి / धान)
                      </h3>
                    </div>

                    {/* Metadata Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px', color: '#52635B' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="#166534" />
                        <span>Mandi: <strong style={{ color: '#11382B' }}>Warangal Agricultural Market</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="#166534" />
                        <span>Date & Time: <strong style={{ color: '#11382B' }}>2026-09-09 · 11:00 – 11:30</strong></span>
                      </div>
                      <div>
                        <span>Token: </span>
                        <strong style={{ color: '#166534', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                          TKN-868852
                        </strong>
                      </div>
                      <div>
                        <span>Expected Qty: </span>
                        <strong style={{ color: '#11382B' }}>50 Quintals</strong>
                      </div>
                      <div>
                        <span>Actual Qty: </span>
                        <strong style={{ color: '#11382B' }}>47.2 Quintals</strong>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider Line */}
                  <div className="booking-card-divider" style={{ width: '1px', height: '140px', backgroundColor: '#E5E7EB' }} />

                  {/* Center Column: Procurement Timeline */}
                  <div>
                    <HorizontalTimeline isCompleted={true} />
                  </div>

                  {/* Right Column: Gate Pass QR Card */}
                  <div>
                    <QrCard
                      tokenNumber="TKN-868852"
                      qrPayload="AGRI-TKN-868852"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW: RECENT SLOT BOOKINGS TAB ── */}
        {activeTab === 'bookings' && (
          <RecentSlotBookingsView
            bookings={bookings}
            onOpenBookingModal={() => setIsBookingModalOpen(true)}
            onOpenRescheduleModal={(booking) => {
              setSelectedRescheduleBooking(booking);
              setIsRescheduleModalOpen(true);
            }}
            onCancelBooking={handleCancelBooking}
          />
        )}

        {/* ── VIEW: BILLS & HISTORY TAB ── */}
        {activeTab === 'bills' && <BillsAndHistory />}

        {/* ── VIEW: MY PROFILE TAB ── */}
        {activeTab === 'profile' && <FarmerProfile />}

      </div>

      {/* ── MODALS ── */}
      <SlotBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingSuccess={() => {
          fetchFarmerBookings();
          fetchLiveQueueStatus();
        }}
      />

      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setSelectedRescheduleBooking(null);
        }}
        booking={selectedRescheduleBooking}
        farmerId={farmerUser?.id}
        onRescheduleSuccess={() => {
          fetchFarmerBookings();
          fetchLiveQueueStatus();
          fetchFarmerNotifications();
        }}
      />

      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={handleMarkNotifRead}
        onMarkAllRead={handleMarkAllNotifRead}
      />

      {/* ── MOBILE BOTTOM NAVIGATION BAR ── */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
        <button
          className={`mobile-bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={20} />
          <span>Home</span>
        </button>
        <button
          className="mobile-bottom-nav-item"
          onClick={() => setIsBookingModalOpen(true)}
        >
          <CalendarPlus size={20} color="#D97706" />
          <span style={{ color: '#D97706' }}>Book</span>
        </button>
        <button
          className={`mobile-bottom-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <Calendar size={20} />
          <span>Bookings</span>
        </button>
        <button
          className={`mobile-bottom-nav-item ${activeTab === 'bills' ? 'active' : ''}`}
          onClick={() => setActiveTab('bills')}
        >
          <Receipt size={20} />
          <span>Bills</span>
        </button>
        <button
          className={`mobile-bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
};
