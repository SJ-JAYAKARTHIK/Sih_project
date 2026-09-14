import React, { useState, useEffect } from 'react';
import { ExcelExporter } from './ExcelExporter';
import { Calendar, CheckCircle2, Clock, CreditCard } from 'lucide-react';

export const MandiHistory = ({ mandiId, mandiName }) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mandiId && selectedDate) {
      fetchHistoryData();
    }
  }, [mandiId, selectedDate]);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      // Use enriched endpoint which joins booking + bill data (billedBy, pricePaid, etc.)
      const res = await fetch(`/api/history/mandi/${mandiId}?date=${selectedDate}`);
      const data = await res.json();
      setHistoryData(data);
    } catch (e) {
      console.error(e);
      setHistoryData(null);
    } finally {
      setLoading(false);
    }
  };

  const bookings = historyData?.bookings || [];

  return (
    <div className="card">
      <div className="section-header">
        <div>
          <h3 className="section-title">Mandi Procurement History</h3>
          <div className="section-subtitle">Review historical days, arrivals, billing and officer records</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', backgroundColor: 'var(--surface-muted)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <Calendar size={15} color="var(--primary)" />
            <input
              type="date"
              style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', outline: 'none' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Excel export for the selected history date */}
          <ExcelExporter mandiId={mandiId} mandiName={mandiName} dateStr={selectedDate} />
        </div>
      </div>

      {/* Summary Stats */}
      {historyData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.875rem', marginBottom: '1.25rem' }}>
          <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: '#B45309' }}>Total Bookings</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400E' }}>{historyData.totalBooked}</div>
          </div>
          <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: '#15803D' }}>Verified Arrivals</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>{historyData.totalVerified}</div>
          </div>
          <div style={{ backgroundColor: '#FEF9C3', border: '1px solid #FDE047', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: '#854D0E' }}>Pending / No-Show</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400E' }}>{historyData.totalPending}</div>
          </div>
          <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: '#065F46' }}>Completed</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065F46' }}>{historyData.totalCompleted}</div>
          </div>
          <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: '#92400E' }}>Total Qty Procured</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D97706' }}>{historyData.totalQty} Qtl</div>
          </div>
          <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: '#92400E' }}>Total Payment</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D97706' }}>₹{historyData.totalPayment.toLocaleString()}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading history records...</div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>No records found for {selectedDate}.</div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Token</th>
                <th>Farmer Name (ID)</th>
                <th>Crop</th>
                <th>Exp Qty</th>
                <th>Actual Qty</th>
                <th>Arrival</th>
                <th>Procurement</th>
                <th>Payment</th>
                <th>Billed By</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ backgroundColor: b.procurementStatus === 'Completed' ? '#F9FFF9' : '#FFFFFF' }}>
                  <td><strong>{b.timeSlot}</strong></td>
                  <td style={{ color: '#D97706', fontWeight: 800 }}>{b.tokenNumber}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.farmerName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>ID: {b.farmerId} | {b.mobile}</div>
                  </td>
                  <td>{b.cropName}</td>
                  <td style={{ color: '#6B7280' }}>{b.expectedQty ? `${b.expectedQty} Qtl` : '—'}</td>
                  <td>
                    {b.actualQty
                      ? <strong style={{ color: '#059669' }}>{b.actualQty} Qtl</strong>
                      : <span style={{ color: '#9CA3AF' }}>—</span>}
                  </td>
                  <td>
                    <span className={`badge ${b.arrivalStatus === 'Verified / Arrived' ? 'badge-green' : 'badge-yellow'}`}>
                      {b.arrivalStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${b.procurementStatus === 'Completed' ? 'badge-green' : 'badge-yellow'}`}>
                      {b.procurementStatus}
                    </span>
                  </td>
                  <td>
                    {b.pricePaid > 0
                      ? <span style={{ color: '#D97706', fontWeight: 700 }}>₹{b.pricePaid.toLocaleString()}</span>
                      : <span style={{ color: '#9CA3AF' }}>Pending</span>}
                  </td>
                  <td>
                    {b.billedBy
                      ? <span style={{ color: '#065F46', fontWeight: 600, fontSize: '0.82rem' }}>{b.billedBy}</span>
                      : <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.82rem' }}>N/A</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
