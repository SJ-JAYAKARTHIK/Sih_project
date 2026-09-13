import React, { useState, useEffect } from 'react';
import { Calendar, Clock, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RescheduleModal = ({ isOpen, onClose, booking, farmerId, onRescheduleSuccess }) => {
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && booking) {
      setErrorMsg('');
      setSelectedDate('');
      setSelectedSlot('');
      fetchDateAvailability();
    }
  }, [isOpen, booking]);

  useEffect(() => {
    if (selectedDate && booking) {
      setSelectedSlot('');
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchDateAvailability = async () => {
    try {
      setLoadingDates(true);
      const res = await fetch(`/api/slots/availability?mandiId=${booking.mandiId}&cropId=${booking.cropId}`);
      const data = await res.json();
      // Filter out past dates or full dates
      const validDates = data.filter(d => d.status !== 'Red');
      setAvailableDates(validDates);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to load date availability.");
    } finally {
      setLoadingDates(false);
    }
  };

  const fetchTimeSlots = async (dateStr) => {
    try {
      setLoadingSlots(true);
      const res = await fetch(`/api/slots/time-slots?mandiId=${booking.mandiId}&date=${dateStr}`);
      const data = await res.json();
      setTimeSlots(data);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to load time slots.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedDate || !selectedSlot) {
      setErrorMsg("Please select both a new date and an available time slot.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await fetch('/api/bookings/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId,
          bookingId: booking.id,
          newDate: selectedDate,
          newTimeSlot: selectedSlot
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reschedule booking.');

      alert(`✅ Booking Rescheduled Successfully!\nNew Date: ${selectedDate}\nNew Time Slot: ${selectedSlot}`);
      if (onRescheduleSuccess) onRescheduleSuccess(data.booking);
      onClose();
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={22} color="#D97706" />
            <h3 style={{ margin: 0, color: '#111827', fontSize: '1.2rem' }}>Reschedule Procurement Slot</h3>
          </div>
          <button className="btn btn-sm btn-outline" onClick={onClose}>✕</button>
        </div>

        {/* Current Booking Overview */}
        <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <div style={{ fontWeight: 800, color: '#92400E' }}>Current Booking Details:</div>
          <div>Token: <strong>{booking.tokenNumber}</strong> | Crop: <strong>{booking.cropName}</strong></div>
          <div>Mandi: <strong>{booking.mandiName}</strong></div>
          <div>Date: {booking.date} | Time Slot: <strong>{booking.timeSlot}</strong></div>
        </div>

        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Select New Date */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
            1. Select New Date:
          </label>

          {loadingDates ? (
            <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Loading available dates...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
              {availableDates.map(d => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setSelectedDate(d.date)}
                  style={{
                    border: selectedDate === d.date ? '2px solid #D97706' : '1px solid #D1D5DB',
                    backgroundColor: selectedDate === d.date ? '#FEF3C7' : '#FFFFFF',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{d.dayOfWeek}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>{d.dayNumber} {d.monthName}</div>
                  <div style={{ fontSize: '0.7rem', color: '#059669' }}>{d.remainingCount} slots left</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Select New Time Slot */}
        {selectedDate && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
              2. Select New 30-Minute Time Slot for {selectedDate}:
            </label>

            {loadingSlots ? (
              <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Loading available time slots...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                {timeSlots.map(s => (
                  <button
                    key={s.time}
                    type="button"
                    disabled={!s.isAvailable}
                    onClick={() => setSelectedSlot(s.time)}
                    style={{
                      border: selectedSlot === s.time ? '2px solid #D97706' : '1px solid #D1D5DB',
                      backgroundColor: selectedSlot === s.time ? '#FEF3C7' : !s.isAvailable ? '#F3F4F6' : '#FFFFFF',
                      borderRadius: '8px',
                      padding: '0.6rem 0.5rem',
                      textAlign: 'center',
                      cursor: s.isAvailable ? 'pointer' : 'not-allowed',
                      opacity: s.isAvailable ? 1 : 0.5
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{s.time}</div>
                    <div style={{ fontSize: '0.7rem', color: s.isAvailable ? '#059669' : '#EF4444' }}>
                      {s.isAvailable ? `${s.maxCapacity - s.bookedCount} spots available` : 'FULL'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
          <button className="btn btn-outline" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleRescheduleSubmit}
            disabled={!selectedDate || !selectedSlot || submitting}
          >
            {submitting ? 'Confirming Reschedule...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
};
