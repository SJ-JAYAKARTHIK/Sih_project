import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TodayFarmerList } from './TodayFarmerList';
import { VerifyFarmerModal } from './VerifyFarmerModal';
import { ProcurementModal } from './ProcurementModal';
import { ExcelExporter } from './ExcelExporter';
import { MandiHistory } from './MandiHistory';
import { EndOfDayReport } from './EndOfDayReport';
import { Building2, CheckCircle2, Clock, CheckSquare, Scale, MapPin, Search, Calendar, RefreshCw } from 'lucide-react';

export const MandiDashboard = () => {
  const { mandiUser, refreshTrigger, triggerRefresh } = useApp();

  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'history'

  // Modals
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (mandiUser) {
      fetchTodayBookings();
    }
  }, [mandiUser, refreshTrigger]);

  const fetchTodayBookings = async () => {
    try {
      const res = await fetch(`/api/bookings/mandi/${mandiUser.id}?date=${todayStr}`);
      const data = await res.json();
      setTodayBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Metrics calculation
  const totalSlotsToday = todayBookings.length;
  const verifiedArrivalsCount = todayBookings.filter(b => b.arrivalStatus === 'Verified / Arrived').length;
  const pendingCount = todayBookings.filter(b => b.arrivalStatus === 'Pending').length;
  const completedCount = todayBookings.filter(b => b.procurementStatus === 'Completed').length;

  const handleOpenProcurement = (booking) => {
    setSelectedBooking(booking);
    setIsProcurementModalOpen(true);
  };

  return (
    <div>
      {/* Top Banner Header */}
      <div className="card" style={{
        backgroundColor: '#FFFFFF',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FCD34D',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={28} />
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#111827' }}>{mandiUser.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#6B7280', marginTop: '0.2rem' }}>
              <MapPin size={14} color="#D97706" />
              <span>{mandiUser.location}</span>
              <span>•</span>
              <span>Mandi ID: <strong>{mandiUser.id}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className={`btn ${activeView === 'dashboard' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setActiveView('dashboard')}
          >
            <Clock size={16} /> Operational Dashboard
          </button>

          <button
            className={`btn ${activeView === 'history' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setActiveView('history')}
          >
            <Calendar size={16} /> Mandi History
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsVerifyModalOpen(true)}
          >
            <CheckCircle2 size={16} /> Verify Farmer
          </button>

          <ExcelExporter mandiId={mandiUser.id} mandiName={mandiUser.name} dateStr={todayStr} />
        </div>
      </div>

      {activeView === 'dashboard' && (
        <div>
          {/* OPERATIONAL STATISTICS CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {/* Card 1: Today's Slots */}
            <div className="card" style={{ borderLeft: '4px solid #F59E0B' }}>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                Today's Slots
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0.25rem 0' }}>
                {totalSlotsToday}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                Total farmers scheduled for today
              </div>
            </div>

            {/* Card 2: Verified Arrivals */}
            <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
              <div style={{ fontSize: '0.8rem', color: '#065F46', textTransform: 'uppercase', fontWeight: 700 }}>
                Verified Arrivals
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#065F46', margin: '0.25rem 0' }}>
                {verifiedArrivalsCount}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#059669' }}>
                Arrived & gate verified via QR / Token
              </div>
            </div>

            {/* Card 3: Pending */}
            <div className="card" style={{ borderLeft: '4px solid #FBBF24' }}>
              <div style={{ fontSize: '0.8rem', color: '#92400E', textTransform: 'uppercase', fontWeight: 700 }}>
                Pending Arrival
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#92400E', margin: '0.25rem 0' }}>
                {pendingCount}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#B45309' }}>
                Booked farmers yet to arrive
              </div>
            </div>

            {/* Card 4: Completed Today (e.g. 8 / 15 Completed) */}
            <div className="card" style={{ backgroundColor: '#FEF3C7', borderLeft: '4px solid #D97706', borderColor: '#FCD34D' }}>
              <div style={{ fontSize: '0.8rem', color: '#92400E', textTransform: 'uppercase', fontWeight: 700 }}>
                Completed Today
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706', margin: '0.25rem 0' }}>
                {completedCount} / {totalSlotsToday}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#B45309', fontWeight: 600 }}>
                {completedCount} / {totalSlotsToday} Completed
              </div>
            </div>
          </div>

          {/* END OF DAY REPORT SUBMISSION */}
          <EndOfDayReport
            mandiId={mandiUser.id}
            mandiName={mandiUser.name}
            bookings={todayBookings}
            dateStr={todayStr}
            onReportSubmitted={() => triggerRefresh()}
          />

          {/* TODAY'S FARMER LIST ORDERED BY TIME SLOT */}
          <TodayFarmerList
            bookings={todayBookings}
            onOpenVerify={(booking) => setIsVerifyModalOpen(true)}
            onOpenProcurement={handleOpenProcurement}
          />
        </div>
      )}

      {/* VIEW: MANDI HISTORY SEARCH */}
      {activeView === 'history' && (
        <MandiHistory mandiId={mandiUser.id} mandiName={mandiUser.name} />
      )}

      {/* VERIFY FARMER MODAL (QR Code + Token Verification) */}
      <VerifyFarmerModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        mandiId={mandiUser.id}
        onVerificationSuccess={() => {
          triggerRefresh();
          fetchTodayBookings();
        }}
      />

      {/* PROCUREMENT & BILLING MODAL */}
      <ProcurementModal
        isOpen={isProcurementModalOpen}
        onClose={() => {
          setIsProcurementModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        mandiId={mandiUser.id}
        onProcurementSuccess={() => {
          triggerRefresh();
          fetchTodayBookings();
        }}
      />
    </div>
  );
};
