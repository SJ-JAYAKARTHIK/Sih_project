import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const EndOfDayReport = ({ mandiId, mandiName, bookings, dateStr, onReportSubmitted }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const totalBooked = bookings.length;
  const verifiedCount = bookings.filter(b => b.arrivalStatus === 'Verified / Arrived').length;
  const pendingArrivals = bookings.filter(b => b.arrivalStatus === 'Pending').length;
  const completedList = bookings.filter(b => b.procurementStatus === 'Completed');
  const completedCount = completedList.length;

  const totalQty = completedList.reduce((acc, b) => acc + (b.actualQty || 0), 0);
  // Note: totalPayment shown here is an estimate; the server calculates exact payment from actual bills
  const totalPayment = completedList.reduce((acc, b) => acc + (b.pricePaid || 0), 0);


  const handleSubmitEOD = async () => {
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch('/api/reports/daily/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mandiId,
          date: dateStr || new Date().toISOString().split('T')[0]
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit EOD report");
      }

      setSuccess(`End-of-Day Mandi Report submitted successfully to Admin! (Report ID: ${data.report.id})`);
      if (onReportSubmitted) onReportSubmitted(data.report);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ borderLeft: '3px solid var(--primary)', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.05rem', fontWeight: 700 }}>End-of-Day Mandi Summary</h4>
          <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0', fontSize: '0.82rem' }}>
            Submit today's automated operational report to the Admin Portal.
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={handleSubmitEOD}
          disabled={loading}
        >
          <Send size={15} /> {loading ? 'Submitting...' : 'Submit EOD Report to Admin'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem 0.75rem', marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem' }}>
        <div><span style={{ color: 'var(--text-muted)' }}>Total Booked:</span> <strong>{totalBooked}</strong></div>
        <div><span style={{ color: 'var(--text-muted)' }}>Verified:</span> <strong style={{ color: 'var(--status-success-text)' }}>{verifiedCount}</strong></div>
        <div><span style={{ color: 'var(--text-muted)' }}>Pending:</span> <strong>{pendingArrivals}</strong></div>
        <div><span style={{ color: 'var(--text-muted)' }}>Completed:</span> <strong style={{ color: 'var(--primary)' }}>{completedCount}</strong></div>
        <div><span style={{ color: 'var(--text-muted)' }}>Total Qty:</span> <strong style={{ color: 'var(--status-success-text)' }}>{totalQty} Qtl</strong></div>
        <div><span style={{ color: 'var(--text-muted)' }}>Est. Payment:</span> <strong>₹{totalPayment.toLocaleString()}</strong></div>
      </div>
    </div>
  );
};
