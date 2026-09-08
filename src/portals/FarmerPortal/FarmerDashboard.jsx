import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SlotBookingModal } from './SlotBookingModal';
import { BillsAndHistory } from './BillsAndHistory';
import { FarmerProfile } from './FarmerProfile';
import QRCode from 'qrcode';
import { PlusCircle, Calendar, Receipt, User, CheckCircle2, Clock, MapPin, Sparkles, Download, Bell } from 'lucide-react';

const QrCard = ({ booking }) => {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (booking && booking.qrPayload) {
      QRCode.toDataURL(booking.qrPayload, { width: 180, margin: 1 })
        .then(url => setQrUrl(url))
        .catch(err => console.error(err));
    }
  }, [booking]);

  return (
    <div style={{
      backgroundColor: '#FFFBEB',
      border: '1px solid #FCD34D',
      borderRadius: '12px',
      padding: '1.25rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '220px'
    }}>
      <h5 style={{ margin: '0 0 0.5rem', color: '#B45309', fontSize: '0.9rem', fontWeight: 700 }}>
        QR CODE PASS
      </h5>
      {qrUrl ? (
        <img
          src={qrUrl}
          alt="Booking QR Code"
          style={{ width: '150px', height: '150px', borderRadius: '8px', border: '1px solid #FDE68A' }}
        />
      ) : (
        <div style={{ width: '150px', height: '150px', backgroundColor: '#FEF3C7', borderRadius: '8px' }} />
      )}
      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#92400E', marginTop: '0.5rem' }}>
        {booking.tokenNumber}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#B45309', marginTop: '0.25rem' }}>
        Scan at Mandi Gate for Verification
      </div>
    </div>
  );
};

export const FarmerDashboard = () => {
  const { farmerUser, t, realtimeNotification, refreshTrigger } = useApp();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'bills' | 'profile'
  const [hasNewBillNotification, setHasNewBillNotification] = useState(false);

  useEffect(() => {
    if (farmerUser) {
      fetchFarmerBookings();
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
      const res = await fetch(`/api/bookings/farmer/${farmerUser.id}`);
      const data = await res.json();
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Sub Navbar Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #E5E7EB',
        paddingBottom: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${activeTab === 'home' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setActiveTab('home')}
          >
            <Calendar size={16} /> {t('navHome')}
          </button>

          <button
            className={`btn ${activeTab === 'bills' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => {
              setActiveTab('bills');
              setHasNewBillNotification(false);
            }}
            style={{ position: 'relative' }}
          >
            <Receipt size={16} /> {t('navBills')}
            {hasNewBillNotification && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '10px',
                height: '10px',
                backgroundColor: '#EF4444',
                borderRadius: '50%',
                border: '2px solid white'
              }} />
            )}
          </button>

          <button
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} /> {t('navProfile')}
          </button>
        </div>

        {activeTab === 'home' && (
          <button
            className="btn btn-primary"
            onClick={() => setIsBookingModalOpen(true)}
          >
            <PlusCircle size={18} /> {t('quickBookBtn')}
          </button>
        )}
      </div>

      {/* Realtime Notification Banner */}
      {hasNewBillNotification && (
        <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell className="animate-bounce" size={20} color="#059669" />
            <span>{t('billNotificationAlert')}</span>
          </div>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => {
              setActiveTab('bills');
              setHasNewBillNotification(false);
            }}
          >
            View Bill
          </button>
        </div>
      )}

      {/* VIEW: HOME DASHBOARD */}
      {activeTab === 'home' && (
        <div>
          {/* Welcome Banner */}
          <div className="card" style={{
            backgroundColor: '#FFFBEB',
            borderColor: '#FCD34D',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: '#92400E', marginBottom: '0.25rem' }}>
                {t('welcomeFarmer')} {farmerUser.name}! 👋
              </h2>
              <p style={{ color: '#B45309', margin: 0, fontSize: '0.9rem' }}>
                {t('dashboardSubHeading')}
              </p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => setIsBookingModalOpen(true)}>
              <PlusCircle size={20} /> {t('quickBookBtn')}
            </button>
          </div>

          {/* Recent Slot Bookings List */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#111827' }}>
              {t('recentBookingsTitle')} ({bookings.length})
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Calendar size={48} color="#9CA3AF" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ margin: 0, color: '#4B5563' }}>{t('noBookings')}</h4>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsBookingModalOpen(true)}>
                  <PlusCircle size={18} /> {t('quickBookBtn')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {bookings.map((booking) => (
                  <div key={booking.id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '1.25rem',
                      alignItems: 'center'
                    }}>
                      {/* CARD 1 — Booking Details */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <span className={`badge ${
                            booking.arrivalStatus === 'Verified / Arrived' ? 'badge-green' : 'badge-yellow'
                          }`}>
                            {booking.arrivalStatus}
                          </span>
                          <span className={`badge ${
                            booking.procurementStatus === 'Completed' ? 'badge-green' : 'badge-yellow'
                          }`}>
                            Procurement: {booking.procurementStatus}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.2rem', color: '#111827', margin: '0 0 0.5rem' }}>
                          {booking.cropName}
                        </h4>

                        <div style={{ display: 'grid', gap: '0.35rem', fontSize: '0.875rem', color: '#4B5563' }}>
                          <div><strong>Farmer Name:</strong> {booking.farmerName} (ID: {booking.farmerId})</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={14} color="#D97706" />
                            <span><strong>Mandi:</strong> {booking.mandiName}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={14} color="#D97706" />
                            <span><strong>Date & Time:</strong> {booking.date} | <strong>{booking.timeSlot}</strong></span>
                          </div>
                          <div><strong>Token Number:</strong> <span style={{ color: '#D97706', fontWeight: 800 }}>{booking.tokenNumber}</span></div>
                          <div>
                            <strong>Expected Qty:</strong> {booking.expectedQty ? `${booking.expectedQty} Quintals` : 'Not specified (To be weighed)'}
                          </div>
                          {booking.actualQty && (
                            <div style={{ color: '#059669', fontWeight: 700 }}>
                              <strong>Actual Weighed Qty:</strong> {booking.actualQty} Quintals
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CARD 2 — QR Code Pass */}
                      <QrCard booking={booking} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: BILLS & TRANSACTIONS */}
      {activeTab === 'bills' && <BillsAndHistory />}

      {/* VIEW: PROFILE */}
      {activeTab === 'profile' && <FarmerProfile />}

      {/* SLOT BOOKING WIZARD MODAL */}
      <SlotBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingSuccess={() => fetchFarmerBookings()}
      />
    </div>
  );
};
