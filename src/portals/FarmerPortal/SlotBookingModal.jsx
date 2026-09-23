import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import QRCode from 'qrcode';
import { X, Calendar, Clock, MapPin, Sprout, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export const SlotBookingModal = ({ isOpen, onClose, onBookingSuccess }) => {
  const { farmerUser, t } = useApp();

  const [step, setStep] = useState(1);
  const [crops, setCrops] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [dateAvailability, setDateAvailability] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  // Selections
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedMandi, setSelectedMandi] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [expectedQty, setExpectedQty] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  // Fetch initial crops
  useEffect(() => {
    if (isOpen) {
      fetchCrops();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setStep(1);
    setSelectedCrop(null);
    setSelectedMandi(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setExpectedQty('');
    setError('');
    setConfirmedBooking(null);
    setQrCodeDataUrl('');
  };

  const fetchCrops = async () => {
    try {
      const res = await fetch('/api/master/crops');
      const data = await res.json();
      setCrops(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Step 1 -> Step 2: Fetch Mandis filtered by crop
  const handleSelectCrop = async (crop) => {
    setSelectedCrop(crop);
    setSelectedMandi(null);
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/master/mandis?cropId=${crop.id}`);
      const data = await res.json();
      setMandis(data);
      setStep(2);
    } catch (e) {
      setError("Failed to fetch available mandis.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> Step 3: Fetch 1-Month Date Availability
  const handleSelectMandi = async (mandi) => {
    setSelectedMandi(mandi);
    setSelectedDate(null);
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/slots/availability?mandiId=${mandi.id}&cropId=${selectedCrop.id}`);
      const data = await res.json();
      setDateAvailability(data);
      setStep(3);
    } catch (e) {
      setError("Failed to calculate date availability.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3 -> Step 4: Fetch 30-Min Time Slots
  const handleSelectDate = async (dateObj) => {
    if (dateObj.status === 'Red') {
      setError("This date is full. Please select a date with green or yellow availability.");
      return;
    }

    setSelectedDate(dateObj);
    setSelectedSlot(null);
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/slots/time-slots?mandiId=${selectedMandi.id}&date=${dateObj.date}`);
      const data = await res.json();
      setTimeSlots(data);
      setStep(4);
    } catch (e) {
      setError("Failed to fetch time slots.");
    } finally {
      setLoading(false);
    }
  };

  // Step 4 -> Step 5: Time slot picked
  const handleSelectSlot = (slot) => {
    if (!slot.isAvailable) {
      setError("This slot is already fully booked.");
      return;
    }
    setSelectedSlot(slot);
    setError('');
    setStep(5);
  };

  // Step 6: Confirm Booking
  const handleConfirmBooking = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: farmerUser.id,
          mandiId: selectedMandi.id,
          cropId: selectedCrop.id,
          date: selectedDate.date,
          timeSlot: selectedSlot.time,
          expectedQty: expectedQty.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book slot.');
      }

      const booking = data.booking;
      setConfirmedBooking(booking);

      // Generate QR Code data URL
      const qrUrl = await QRCode.toDataURL(booking.qrPayload, { width: 220, margin: 2 });
      setQrCodeDataUrl(qrUrl);

      setStep(6);
      if (onBookingSuccess) onBookingSuccess(booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={22} color="#D97706" />
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{t('quickBookBtn')}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
            <X size={22} />
          </button>
        </div>

        {/* Step Progress Bar */}
        {step < 6 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: i <= step ? '#D97706' : '#E5E7EB',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: SELECT CROP */}
        {step === 1 && (
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{t('step1Title')}</h4>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1rem' }}>{t('step1Desc')}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {crops.map((crop) => (
                <div
                  key={crop.id}
                  onClick={() => handleSelectCrop(crop)}
                  style={{
                    backgroundColor: selectedCrop?.id === crop.id ? '#FFFBEB' : '#FFFFFF',
                    border: selectedCrop?.id === crop.id ? '2px solid #D97706' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{crop.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{crop.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#D97706', marginTop: '0.25rem', fontWeight: 600 }}>
                    MSP Rate: ₹{crop.ratePerQuintal.toLocaleString()} / Quintal
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: SELECT MANDI */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setStep(1)}><ArrowLeft size={16} /> {t('backBtn')}</button>
              <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Crop Selected: <strong>{selectedCrop?.name}</strong></span>
            </div>

            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{t('step2Title')}</h4>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1rem' }}>{t('step2Desc')}</p>

            {mandis.length === 0 ? (
              <div className="alert alert-warning">{t('noMandisForCrop')}</div>
            ) : (
              <div style={{ display: 'grid', gap: '0.875rem' }}>
                {mandis.map((mandi) => (
                  <div
                    key={mandi.id}
                    onClick={() => handleSelectMandi(mandi)}
                    style={{
                      backgroundColor: selectedMandi?.id === mandi.id ? '#FFFBEB' : '#FFFFFF',
                      border: selectedMandi?.id === mandi.id ? '2px solid #D97706' : '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{mandi.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.825rem', color: '#6B7280', marginTop: '0.25rem' }}>
                        <MapPin size={14} color="#D97706" />
                        <span>{mandi.location}</span>
                      </div>
                    </div>
                    <span className="badge badge-green">Accepts {selectedCrop?.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: 1-MONTH CALENDAR VIEW */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setStep(2)}><ArrowLeft size={16} /> {t('backBtn')}</button>
              <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Mandi: <strong>{selectedMandi?.name}</strong></span>
            </div>

            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{t('step3Title')}</h4>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1rem' }}>{t('step3Desc')}</p>

            {/* Calendar Legend */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem', backgroundColor: '#F9FAFB', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span>{t('calendarLegendGreen')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <span>{t('calendarLegendYellow')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <span>{t('calendarLegendRed')}</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-dates-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))',
              gap: '0.625rem',
              maxHeight: '340px',
              overflowY: 'auto',
              paddingRight: '0.25rem'
            }}>
              {dateAvailability.map((item) => {
                let colorBg = '#ECFDF5';
                let colorBorder = '#10B981';
                let textColor = '#065F46';

                if (item.status === 'Yellow') {
                  colorBg = '#FFFBEB';
                  colorBorder = '#F59E0B';
                  textColor = '#92400E';
                } else if (item.status === 'Red') {
                  colorBg = '#FEF2F2';
                  colorBorder = '#EF4444';
                  textColor = '#991B1B';
                }

                return (
                  <div
                    key={item.date}
                    onClick={() => handleSelectDate(item)}
                    style={{
                      backgroundColor: colorBg,
                      border: `2px solid ${selectedDate?.date === item.date ? '#111827' : colorBorder}`,
                      borderRadius: '10px',
                      padding: '0.625rem 0.375rem',
                      textAlign: 'center',
                      cursor: item.status === 'Red' ? 'not-allowed' : 'pointer',
                      opacity: item.status === 'Red' ? 0.6 : 1,
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: textColor, textTransform: 'uppercase' }}>
                      {item.dayOfWeek}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: textColor, margin: '0.1rem 0' }}>
                      {item.dayNumber}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: textColor, fontWeight: 500 }}>
                      {item.monthName}
                    </div>
                    <div style={{ fontSize: '0.68rem', marginTop: '0.25rem', fontWeight: 700, color: textColor }}>
                      {item.status === 'Red' ? 'FULL' : `${item.remainingCount} left`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: SELECT 30-MIN TIME SLOT */}
        {step === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setStep(3)}><ArrowLeft size={16} /> {t('backBtn')}</button>
              <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Date Selected: <strong>{selectedDate?.date} ({selectedDate?.dayOfWeek})</strong></span>
            </div>

            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{t('step4Title')}</h4>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1rem' }}>{t('step4Desc')}</p>

            <div className="time-slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {timeSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSlot(slot)}
                  disabled={!slot.isAvailable}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: selectedSlot?.time === slot.time ? '2px solid #D97706' : '1px solid #E5E7EB',
                    backgroundColor: !slot.isAvailable ? '#F3F4F6' : (selectedSlot?.time === slot.time ? '#FFFBEB' : '#FFFFFF'),
                    color: !slot.isAvailable ? '#9CA3AF' : '#111827',
                    cursor: !slot.isAvailable ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} color={slot.isAvailable ? '#D97706' : '#9CA3AF'} />
                    <span>{slot.time}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: slot.isAvailable ? '#059669' : '#DC2626' }}>
                    {slot.isAvailable ? 'Available' : 'Booked'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: OPTIONAL EXPECTED QUANTITY */}
        {step === 5 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setStep(4)}><ArrowLeft size={16} /> {t('backBtn')}</button>
              <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Slot: <strong>{selectedSlot?.time}</strong></span>
            </div>

            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{t('step5Title')}</h4>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{t('step5Desc')}</p>

            <div className="form-group">
              <label className="form-label">{t('expectedQtyLabel')}</label>
              <input
                type="number"
                className="form-input"
                value={expectedQty}
                onChange={(e) => setExpectedQty(e.target.value)}
                placeholder={t('expectedQtyPlaceholder')}
                min={0}
                step={0.1}
              />
            </div>

            <div style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.825rem',
              color: '#92400E',
              marginBottom: '1.5rem'
            }}>
              {t('expectedQtyHint')}
            </div>

            {/* Summary Review Card */}
            <div style={{ backgroundColor: '#F9FAFB', borderRadius: '10px', padding: '1rem', border: '1px solid #E5E7EB', marginBottom: '1.5rem' }}>
              <h5 style={{ margin: '0 0 0.5rem', color: '#111827', fontWeight: 700 }}>{t('confirmSummaryTitle')}</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div><strong>Crop:</strong> {selectedCrop?.name}</div>
                <div><strong>Mandi:</strong> {selectedMandi?.name}</div>
                <div><strong>Date:</strong> {selectedDate?.date}</div>
                <div><strong>Time:</strong> {selectedSlot?.time}</div>
                <div><strong>Expected Qty:</strong> {expectedQty ? `${expectedQty} Quintals` : t('notSpecified')}</div>
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Processing Booking...' : t('confirmBookingBtn')}
            </button>
          </div>
        )}

        {/* STEP 6: CONFIRMATION SUCCESS WITH QR CODE & TOKEN */}
        {step === 6 && confirmedBooking && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <CheckCircle size={36} />
            </div>

            <h3 style={{ color: '#065F46', fontSize: '1.5rem', marginBottom: '0.25rem' }}>{t('bookingSuccessTitle')}</h3>
            <p style={{ color: '#4B5563', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{t('tokenGeneratedMsg')}</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              {/* Card 1: Booking Details */}
              <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '1rem', border: '1px solid #E5E7EB' }}>
                <h5 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.5rem' }}>
                  {t('cardDetailsTitle')}
                </h5>
                <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <div><strong>Farmer Name:</strong> {confirmedBooking.farmerName}</div>
                  <div><strong>Farmer ID:</strong> {confirmedBooking.farmerId}</div>
                  <div><strong>Crop:</strong> {confirmedBooking.cropName}</div>
                  <div><strong>Mandi:</strong> {confirmedBooking.mandiName}</div>
                  <div><strong>Date:</strong> {confirmedBooking.date}</div>
                  <div><strong>Time Slot:</strong> {confirmedBooking.timeSlot}</div>
                  <div><strong>Token Number:</strong> <span style={{ color: '#D97706', fontWeight: 800 }}>{confirmedBooking.tokenNumber}</span></div>
                </div>
              </div>

              {/* Card 2: QR Code */}
              <div style={{ backgroundColor: '#FFFBEB', borderRadius: '12px', padding: '1rem', border: '1px solid #FCD34D', textAlign: 'center' }}>
                <h5 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#B45309' }}>
                  {t('cardQrTitle')}
                </h5>
                {qrCodeDataUrl && (
                  <img
                    src={qrCodeDataUrl}
                    alt="Booking QR Code"
                    style={{ width: '160px', height: '160px', borderRadius: '8px', margin: '0.25rem auto' }}
                  />
                )}
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#92400E', marginTop: '0.25rem' }}>
                  {confirmedBooking.tokenNumber}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem' }}
            >
              {t('returnDashboardBtn')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
