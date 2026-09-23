import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExcelExporter } from './ExcelExporter';
import {
  Calendar, CheckCircle2, Clock, CreditCard, ChevronLeft, ChevronRight,
  RotateCcw, AlertTriangle, FileText, PhoneCall, Globe, ArrowRight,
  Check, X, Eye, Printer, ShieldAlert, Sparkles, User, Package
} from 'lucide-react';

const getTodayLocalStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const MandiHistory = ({ mandiId, mandiName, onOpenProcurement }) => {
  const { refreshTrigger, triggerRefresh } = useApp();
  const todayStr = getTodayLocalStr();

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Modals / Drawers
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportMessage, setReportMessage] = useState('');

  useEffect(() => {
    if (mandiId && selectedDate) {
      fetchHistoryData();
    }
  }, [mandiId, selectedDate, refreshTrigger]);

  const fetchHistoryData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/history/mandi/${mandiId}?date=${selectedDate}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch history');
      }
      setHistoryData(data);
    } catch (e) {
      console.error('History fetch error:', e);
      setErrorMsg('Unable to load history. Please try again.');
      setHistoryData(null);
    } finally {
      setLoading(false);
    }
  };

  const changeDateByDays = (days) => {
    const parts = selectedDate.split('-');
    const current = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    current.setDate(current.getDate() + days);
    
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const isToday = selectedDate === todayStr;

  const bookings = historyData?.bookings || [];
  const reconciliation = historyData?.reconciliation || {
    bookingsCount: 0, arrivalsCount: 0, verifiedCount: 0, completedCount: 0, paidCount: 0, billedCount: 0, warnings: []
  };
  const cropBreakdown = historyData?.cropBreakdown || [];
  const timeline = historyData?.timeline || [];

  const handleGenerateReport = async () => {
    setReportSubmitting(true);
    setReportMessage('');
    try {
      const res = await fetch('/api/reports/daily/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mandiId, date: selectedDate })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Report submission failed');
      setReportMessage(`✅ Daily Report successfully saved to database! Report ID: ${data.report?.id}`);
      triggerRefresh();
      fetchHistoryData();
    } catch (err) {
      alert(`Report Generation Error: ${err.message}`);
    } finally {
      setReportSubmitting(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* ══════════════════════════════════════════════════════════
          1. NAVIGATION BAR & DATE PICKER
          ══════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0E3524', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="#059669" />
              Mandi History & Operational Control
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#4B5563', marginTop: '2px' }}>
              Operational log, arrivals, weighing, payment reconciliation & report generation
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            {/* Navigation Controls */}
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '3px', border: '1px solid #E5E7EB' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: 'none', background: 'transparent' }}
                onClick={() => changeDateByDays(-1)}
                title="Previous Day"
              >
                <ChevronLeft size={16} />
                <span>Prev Day</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0 0.75rem', fontWeight: 700, fontSize: '0.88rem', color: '#111827' }}>
                <input
                  type="date"
                  style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.88rem', color: '#111827', outline: 'none', cursor: 'pointer' }}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: 'none', background: 'transparent' }}
                onClick={() => changeDateByDays(1)}
                title="Next Day"
              >
                <span>Next Day</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              className={`btn btn-sm ${isToday ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedDate(todayStr)}
              style={{ fontWeight: 700 }}
            >
              TODAY
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsReportModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#ECFDF5', color: '#065F46', borderColor: '#A7F3D0', fontWeight: 700 }}
            >
              <FileText size={15} />
              <span>Daily Report</span>
            </button>

            <ExcelExporter mandiId={mandiId} mandiName={mandiName} dateStr={selectedDate} />
          </div>
        </div>

        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem' }}>
          <div style={{ color: '#374151', fontWeight: 600 }}>
            Selected Date: <span style={{ color: '#059669', fontWeight: 800 }}>{formatDisplayDate(selectedDate)}</span> {isToday && <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '6px', fontWeight: 700 }}>Today</span>}
          </div>
          <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>
            Mandi: <strong>{mandiName || mandiId}</strong> (ID: {mandiId})
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          2. DAILY SUMMARY METRICS CARDS (9 CARDS)
          ══════════════════════════════════════════════════════════ */}
      {historyData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
          
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '0.85rem 1rem', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Total Slots</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>{historyData.totalBooked}</div>
            <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Bookings</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '0.85rem 1rem', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.72rem', color: '#0D6E4F', fontWeight: 700, textTransform: 'uppercase' }}>Arrived</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#047857', marginTop: '2px' }}>{historyData.totalVerified}</div>
            <div style={{ fontSize: '0.72rem', color: '#059669' }}>Gate Scanned</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '0.85rem 1rem', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.72rem', color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase' }}>Verified</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1D4ED8', marginTop: '2px' }}>{historyData.totalVerified}</div>
            <div style={{ fontSize: '0.72rem', color: '#3B82F6' }}>QR / Token Pass</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '0.85rem 1rem', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700, textTransform: 'uppercase' }}>Waiting / Pending</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#B45309', marginTop: '2px' }}>{historyData.totalPending}</div>
            <div style={{ fontSize: '0.72rem', color: '#F59E0B' }}>Pending Arrival</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '0.85rem 1rem', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 700, textTransform: 'uppercase' }}>No Show</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#991B1B', marginTop: '2px' }}>{historyData.totalNoShow || 0}</div>
            <div style={{ fontSize: '0.72rem', color: '#EF4444' }}>Slot Expired</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '0.85rem 1rem', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: 700, textTransform: 'uppercase' }}>Completed</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#065F46', marginTop: '2px' }}>{historyData.totalCompleted}</div>
            <div style={{ fontSize: '0.72rem', color: '#10B981' }}>Weighed & Billed</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '0.85rem 1rem', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700, textTransform: 'uppercase' }}>Qty Procured</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D97706', marginTop: '2px' }}>{historyData.totalQty} <span style={{ fontSize: '0.85rem' }}>Qtl</span></div>
            <div style={{ fontSize: '0.72rem', color: '#F59E0B' }}>Total Quintals</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '0.85rem 1rem', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Total Value</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#047857', marginTop: '2px' }}>₹{historyData.totalPayment.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '0.72rem', color: '#10B981' }}>Total Procurement</div>
          </div>

          <div style={{ backgroundColor: historyData.totalPendingPayment > 0 ? '#FEF2F2' : '#FFFFFF', border: `1px solid ${historyData.totalPendingPayment > 0 ? '#FCA5A5' : '#E5E7EB'}`, padding: '0.85rem 1rem', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.72rem', color: historyData.totalPendingPayment > 0 ? '#991B1B' : '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Payments Pending</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: historyData.totalPendingPayment > 0 ? '#DC2626' : '#111827', marginTop: '2px' }}>{historyData.totalPendingPayment}</div>
            <div style={{ fontSize: '0.72rem', color: historyData.totalPendingPayment > 0 ? '#EF4444' : '#9CA3AF' }}>Action Required</div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          3. RECONCILIATION, BOOKING SOURCE & CROP BREAKDOWN ROW
          ══════════════════════════════════════════════════════════ */}
      {historyData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          
          {/* Daily Reconciliation Card */}
          <div className="card" style={{ padding: '1rem 1.15rem' }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0E3524', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={17} color="#059669" />
              <span>Daily Audit Reconciliation</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '0.75rem' }}>
              <div style={{ backgroundColor: '#F9FAFB', padding: '0.5rem', borderRadius: '6px', border: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Bookings</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827' }}>{reconciliation.bookingsCount}</div>
              </div>
              <div style={{ backgroundColor: '#F9FAFB', padding: '0.5rem', borderRadius: '6px', border: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Arrivals</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#047857' }}>{reconciliation.arrivalsCount}</div>
              </div>
              <div style={{ backgroundColor: '#F9FAFB', padding: '0.5rem', borderRadius: '6px', border: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Verified</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1D4ED8' }}>{reconciliation.verifiedCount}</div>
              </div>
              <div style={{ backgroundColor: '#F9FAFB', padding: '0.5rem', borderRadius: '6px', border: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Completed</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#065F46' }}>{reconciliation.completedCount}</div>
              </div>
              <div style={{ backgroundColor: '#F9FAFB', padding: '0.5rem', borderRadius: '6px', border: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Paid</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#D97706' }}>{reconciliation.paidCount}</div>
              </div>
              <div style={{ backgroundColor: '#F9FAFB', padding: '0.5rem', borderRadius: '6px', border: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Billed</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#065F46' }}>{reconciliation.billedCount}</div>
              </div>
            </div>

            {reconciliation.warnings && reconciliation.warnings.length > 0 ? (
              <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#92400E' }}>
                {reconciliation.warnings.map((w, idx) => (
                  <div key={idx} style={{ marginBottom: idx < reconciliation.warnings.length - 1 ? '2px' : 0 }}>{w}</div>
                ))}
              </div>
            ) : (
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Check size={14} />
                <span>All daily transactions match reconciliation criteria.</span>
              </div>
            )}
          </div>

          {/* Booking Source Summary Card */}
          <div className="card" style={{ padding: '1rem 1.15rem' }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0E3524', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Globe size={17} color="#2563EB" />
                Booking Source Distribution
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>KrishiDwaar Omnichannel</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#1E40AF', fontWeight: 700 }}>WEB PORTAL</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1D4ED8' }}>{historyData.webBookingsCount || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#60A5FA' }}>
                    {historyData.totalBooked > 0 ? Math.round(((historyData.webBookingsCount || 0) / historyData.totalBooked) * 100) : 0}% of total
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#D97706', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneCall size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 700 }}>VOICE IVR</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#B45309' }}>{historyData.ivrBookingsCount || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#F59E0B' }}>
                    {historyData.totalBooked > 0 ? Math.round(((historyData.ivrBookingsCount || 0) / historyData.totalBooked) * 100) : 0}% of total
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#4B5563', fontStyle: 'italic', backgroundColor: '#F9FAFB', padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid #F3F4F6' }}>
              💡 IVR Voice bookings & Web bookings are synchronized in real-time.
            </div>
          </div>

          {/* Crop-Wise Summary Card */}
          <div className="card" style={{ padding: '1rem 1.15rem' }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0E3524', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={17} color="#D97706" />
              <span>Crop-Wise Daily Summary</span>
            </div>

            {cropBreakdown.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: '#9CA3AF', fontStyle: 'italic', padding: '1rem 0', textAlign: 'center' }}>
                No crop procurement data for this date.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto' }}>
                {cropBreakdown.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', backgroundColor: '#F9FAFB', borderRadius: '6px', border: '1px solid #F3F4F6', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 700, color: '#111827' }}>
                      {item.cropName}
                      <span style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 400, marginLeft: '6px' }}>({item.bookingsCount} bookings)</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#059669' }}>{item.actualQty} Qtl</strong>
                      <span style={{ margin: '0 4px', color: '#9CA3AF' }}>|</span>
                      <strong style={{ color: '#D97706' }}>₹{item.totalValue.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          4. MAIN PROCUREMENT HISTORY TABLE & TIMELINE SECTION
          ══════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0E3524', margin: 0 }}>
              Daily Procurement Register
            </h4>
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              Click any row to view full lifecycle verification & payment drawer
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 600 }}>
            Total Records: <strong style={{ color: '#059669' }}>{bookings.length}</strong>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#059669', fontWeight: 600 }}>
            <div className="spinner" style={{ margin: '0 auto 0.75rem auto' }}></div>
            Loading mandi history records...
          </div>
        ) : errorMsg ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#DC2626', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
            <AlertTriangle size={24} style={{ margin: '0 auto 0.5rem auto' }} />
            <div>{errorMsg}</div>
            <button className="btn btn-secondary btn-sm" onClick={fetchHistoryData} style={{ marginTop: '0.75rem' }}>
              Try Again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6B7280', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
            <Calendar size={28} color="#9CA3AF" style={{ margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No procurement activity found for {selectedDate}.</div>
            <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '4px' }}>Select another date using the date navigator above.</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Token</th>
                  <th>Farmer Details</th>
                  <th>Crop</th>
                  <th>Source</th>
                  <th>Exp Qty</th>
                  <th>Actual Qty</th>
                  <th>Arrival Status</th>
                  <th>Procurement</th>
                  <th>Payment Status</th>
                  <th>Bill Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const isCompleted = b.procurementStatus === 'Completed';
                  const isNoShow = b.bookingStatus === 'NO_SHOW';
                  const isIvr = b.source === 'VOICE IVR' || b.source === 'IVR';

                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedRecord(b)}
                      style={{
                        backgroundColor: isCompleted ? '#F0FDF4' : isNoShow ? '#FEF2F2' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td><strong>{b.timeSlot}</strong></td>
                      <td style={{ color: '#D97706', fontWeight: 800 }}>{b.tokenNumber}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{b.farmerName}</div>
                        <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>ID: {b.farmerId} | {b.mobile}</div>
                      </td>
                      <td>{b.cropName}</td>
                      <td>
                        <span className={`badge ${isIvr ? 'badge-yellow' : 'badge-blue'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          {isIvr ? <PhoneCall size={11} /> : <Globe size={11} />}
                          {isIvr ? 'VOICE IVR' : 'WEB'}
                        </span>
                      </td>
                      <td style={{ color: '#6B7280' }}>{b.expectedQty ? `${b.expectedQty} Qtl` : '—'}</td>
                      <td>
                        {b.actualQty
                          ? <strong style={{ color: '#059669' }}>{b.actualQty} Qtl</strong>
                          : <span style={{ color: '#9CA3AF' }}>—</span>}
                      </td>
                      <td>
                        <span className={`badge ${b.arrivalStatus === 'Verified / Arrived' ? 'badge-green' : isNoShow ? 'badge-red' : 'badge-yellow'}`}>
                          {isNoShow ? 'No Show' : b.arrivalStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isCompleted ? 'badge-green' : 'badge-yellow'}`}>
                          {b.procurementStatus}
                        </span>
                      </td>
                      <td>
                        {b.pricePaid > 0
                          ? <span style={{ color: '#047857', fontWeight: 700 }}>₹{b.pricePaid.toLocaleString('en-IN')}</span>
                          : <span style={{ color: '#D97706', fontSize: '0.8rem', fontWeight: 600 }}>Pending</span>}
                      </td>
                      <td>
                        {b.billedBy ? (
                          <span style={{ color: '#065F46', fontWeight: 600, fontSize: '0.8rem' }}>{b.billedBy}</span>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.8rem' }}>N/A</span>
                        )}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => setSelectedRecord(b)}
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          5. DAILY PROCUREMENT TIMELINE & EVENT LOG
          ══════════════════════════════════════════════════════════ */}
      {timeline.length > 0 && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0E3524', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="#059669" />
            <span>Daily Procurement Activity Timeline ({formatDisplayDate(selectedDate)})</span>
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', paddingLeft: '1.25rem', borderLeft: '2px solid #E5E7EB' }}>
            {timeline.map((event, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-1.65rem', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: event.type === 'COMPLETED' ? '#059669' : event.type === 'WEIGHING' ? '#D97706' : '#2563EB', border: '2px solid #FFFFFF' }}></div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#374151', minWidth: '70px' }}>{event.time}</span>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#111827' }}>{event.title}</span>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', marginLeft: '8px' }}>— {event.detail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          6. HISTORY DETAIL DRAWER (SLIDE-OVER PANEL)
          ══════════════════════════════════════════════════════════ */}
      {selectedRecord && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(2px)'
        }} onClick={() => setSelectedRecord(null)}>
          
          <div style={{
            width: '100%', maxWidth: '520px', backgroundColor: '#FFFFFF',
            height: '100%', overflowY: 'auto', padding: '1.5rem',
            boxShadow: '-4px 0 15px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '1.25rem'
          }} onClick={(e) => e.stopPropagation()}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0E3524', margin: 0 }}>
                  Historical Booking Record
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>
                  Token: <strong style={{ color: '#D97706' }}>{selectedRecord.tokenNumber}</strong>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedRecord(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Source & Status Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`badge ${selectedRecord.source === 'VOICE IVR' ? 'badge-yellow' : 'badge-blue'}`}>
                {selectedRecord.source === 'VOICE IVR' ? <PhoneCall size={12} style={{ marginRight: '4px' }} /> : <Globe size={12} style={{ marginRight: '4px' }} />}
                Source: {selectedRecord.source}
              </span>
              <span className={`badge ${selectedRecord.arrivalStatus === 'Verified / Arrived' ? 'badge-green' : 'badge-yellow'}`}>
                Gate: {selectedRecord.arrivalStatus}
              </span>
              <span className={`badge ${selectedRecord.procurementStatus === 'Completed' ? 'badge-green' : 'badge-yellow'}`}>
                Procurement: {selectedRecord.procurementStatus}
              </span>
            </div>

            {/* Section 1: Farmer Info */}
            <div style={{ backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#374151', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                Farmer Profile
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div><strong>Name:</strong> {selectedRecord.farmerName}</div>
                <div><strong>Farmer ID:</strong> {selectedRecord.farmerId}</div>
                <div><strong>Mobile:</strong> {selectedRecord.mobile}</div>
                <div><strong>Village:</strong> {selectedRecord.village || 'Nizamabad'}</div>
              </div>
            </div>

            {/* Section 2: Booking Info */}
            <div style={{ backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#374151', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                Booking Details
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div><strong>Crop:</strong> {selectedRecord.cropName}</div>
                <div><strong>Date:</strong> {selectedRecord.date}</div>
                <div><strong>Time Slot:</strong> {selectedRecord.timeSlot}</div>
                <div><strong>Mandi:</strong> {selectedRecord.mandiName}</div>
                <div><strong>Exp Qty:</strong> {selectedRecord.expectedQty ? `${selectedRecord.expectedQty} Qtl` : 'N/A'}</div>
                <div><strong>Actual Qty:</strong> {selectedRecord.actualQty ? `${selectedRecord.actualQty} Qtl` : 'Pending'}</div>
              </div>
            </div>

            {/* Section 3: Financial & Bill Info */}
            <div style={{ backgroundColor: '#ECFDF5', padding: '1rem', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065F46', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                Financial & Billing Summary
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div><strong>Total Payment:</strong> <span style={{ color: '#047857', fontWeight: 800 }}>₹{(selectedRecord.pricePaid || 0).toLocaleString('en-IN')}</span></div>
                <div><strong>Rate/Qtl:</strong> ₹{selectedRecord.ratePerQuintal || 2300}</div>
                <div><strong>Payment Status:</strong> {selectedRecord.paymentStatus || 'Completed'}</div>
                <div><strong>Payment Ref:</strong> {selectedRecord.paymentRef || 'TXN-GEN-OK'}</div>
                <div><strong>Billed By:</strong> {selectedRecord.billedBy || 'Mandi Staff'}</div>
                <div><strong>Bill ID:</strong> {selectedRecord.billId || 'BILL-AUTO'}</div>
              </div>
            </div>

            {/* Lifecycle Timeline Box */}
            <div style={{ border: '1px solid #E5E7EB', padding: '1rem', borderRadius: '8px' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#374151', margin: '0 0 0.75rem 0' }}>
                End-to-End Audit Trail
              </h5>
              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} color="#059669" />
                  <span>Slot Booked via <strong>{selectedRecord.source}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} color="#059669" />
                  <span>Gate Arrival Verified</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} color={selectedRecord.procurementStatus === 'Completed' ? '#059669' : '#9CA3AF'} />
                  <span>Weighing Completed ({selectedRecord.actualQty || '—'} Qtl)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} color={selectedRecord.pricePaid > 0 ? '#059669' : '#9CA3AF'} />
                  <span>Payment Confirmed & Bill Generated</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-block" onClick={() => setSelectedRecord(null)}>
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          7. OFFICIAL APMC DAILY REPORT MODAL
          ══════════════════════════════════════════════════════════ */}
      {isReportModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={() => setIsReportModalOpen(false)}>

          <div style={{
            width: '100%', maxWidth: '720px', backgroundColor: '#FFFFFF',
            borderRadius: '12px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }} onClick={(e) => e.stopPropagation()}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #059669', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0E3524', margin: 0 }}>
                  APMC OFFICIAL DAILY PROCUREMENT REPORT
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#4B5563', marginTop: '2px' }}>
                  {mandiName || mandiId} | Date: <strong>{formatDisplayDate(selectedDate)}</strong>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsReportModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {reportMessage && (
              <div style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '0.6rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', marginTop: '0.75rem', fontWeight: 700 }}>
                {reportMessage}
              </div>
            )}

            <div style={{ margin: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <div><span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Total Bookings:</span> <strong style={{ display: 'block', fontSize: '1.1rem' }}>{historyData?.totalBooked || 0}</strong></div>
                <div><span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Web Bookings:</span> <strong style={{ display: 'block', fontSize: '1.1rem', color: '#2563EB' }}>{historyData?.webBookingsCount || 0}</strong></div>
                <div><span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Voice IVR Bookings:</span> <strong style={{ display: 'block', fontSize: '1.1rem', color: '#D97706' }}>{historyData?.ivrBookingsCount || 0}</strong></div>
                <div><span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Arrived Farmers:</span> <strong style={{ display: 'block', fontSize: '1.1rem', color: '#059669' }}>{historyData?.totalVerified || 0}</strong></div>
                <div><span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Completed Procurements:</span> <strong style={{ display: 'block', fontSize: '1.1rem', color: '#065F46' }}>{historyData?.totalCompleted || 0}</strong></div>
                <div><span style={{ fontSize: '0.75rem', color: '#6B7280' }}>No Shows:</span> <strong style={{ display: 'block', fontSize: '1.1rem', color: '#DC2626' }}>{historyData?.totalNoShow || 0}</strong></div>
                <div><span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Total Qty Procured:</span> <strong style={{ display: 'block', fontSize: '1.1rem', color: '#D97706' }}>{historyData?.totalQty || 0} Qtl</strong></div>
                <div><span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Total Procurement Value:</span> <strong style={{ display: 'block', fontSize: '1.1rem', color: '#047857' }}>₹{(historyData?.totalPayment || 0).toLocaleString('en-IN')}</strong></div>
                <div><span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Payments Pending:</span> <strong style={{ display: 'block', fontSize: '1.1rem', color: '#991B1B' }}>{historyData?.totalPendingPayment || 0}</strong></div>
              </div>

              {/* Crop Breakdown Table */}
              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>
                  Crop-Wise Breakdown
                </h5>
                <table className="custom-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>Crop</th>
                      <th>Bookings</th>
                      <th>Quantity (Qtl)</th>
                      <th>Total Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cropBreakdown.map((c, idx) => (
                      <tr key={idx}>
                        <td><strong>{c.cropName}</strong></td>
                        <td>{c.bookingsCount}</td>
                        <td>{c.actualQty} Qtl</td>
                        <td>₹{c.totalValue.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                Report Generated by APMC Mandi Officer System
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handlePrintReport}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Printer size={15} />
                  <span>Print Report</span>
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleGenerateReport}
                  disabled={reportSubmitting}
                  style={{ fontWeight: 700 }}
                >
                  {reportSubmitting ? 'Saving...' : 'Submit / Save Daily Report'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
