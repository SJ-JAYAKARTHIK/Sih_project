import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Building2, Search, RefreshCw } from 'lucide-react';

export const DailyReports = ({ selectedDate, onDateChange }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('date'); // 'date' | 'history'
  const [historyMandi, setHistoryMandi] = useState('');
  const [historyStart, setHistoryStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [historyEnd, setHistoryEnd] = useState(() => new Date().toISOString().split('T')[0]);
  const [mandis, setMandis] = useState([]);

  // Fetch mandis for filter dropdown
  useEffect(() => {
    fetch('/api/master/mandis').then(r => r.json()).then(setMandis).catch(() => {});
  }, []);

  // When viewMode = 'date', reports come from parent (admin stats for selected date)
  useEffect(() => {
    if (viewMode === 'date') {
      fetchDateReports();
    }
  }, [selectedDate, viewMode]);

  const fetchDateReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/history?startDate=${selectedDate}&endDate=${selectedDate}`);
      const data = await res.json();
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryReports = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/history?startDate=${historyStart}&endDate=${historyEnd}`;
      if (historyMandi) url += `&mandiId=${historyMandi}`;
      const res = await fetch(url);
      const data = await res.json();
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Mandi Daily Operational Reports & History</h3>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Daily summary reports submitted by Mandi Officers. Search by date or view historical range.
          </p>
        </div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', backgroundColor: '#F3F4F6', padding: '0.2rem', borderRadius: '8px' }}>
          <button
            onClick={() => setViewMode('date')}
            style={{
              padding: '0.4rem 0.75rem', border: 'none', borderRadius: '6px', fontSize: '0.82rem',
              fontWeight: 600, cursor: 'pointer',
              backgroundColor: viewMode === 'date' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'date' ? '#D97706' : '#6B7280',
              boxShadow: viewMode === 'date' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            📅 Single Date
          </button>
          <button
            onClick={() => setViewMode('history')}
            style={{
              padding: '0.4rem 0.75rem', border: 'none', borderRadius: '6px', fontSize: '0.82rem',
              fontWeight: 600, cursor: 'pointer',
              backgroundColor: viewMode === 'history' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'history' ? '#D97706' : '#6B7280',
              boxShadow: viewMode === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            📚 History Range
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      {viewMode === 'date' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', backgroundColor: '#F9FAFB', padding: '0.6rem 0.875rem', borderRadius: '8px' }}>
          <Calendar size={16} color="#D97706" />
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Date:</label>
          <input
            type="date"
            style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: '0.9rem', color: '#111827', outline: 'none' }}
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end', backgroundColor: '#F9FAFB', padding: '0.875rem', borderRadius: '8px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>From Date</label>
            <input type="date" value={historyStart} onChange={e => setHistoryStart(e.target.value)}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>To Date</label>
            <input type="date" value={historyEnd} onChange={e => setHistoryEnd(e.target.value)}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Mandi Filter</label>
            <select value={historyMandi} onChange={e => setHistoryMandi(e.target.value)}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.85rem', minWidth: '180px' }}>
              <option value="">All Mandis</option>
              {mandis.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary btn-sm" onClick={fetchHistoryReports} disabled={loading}>
            <Search size={14} /> {loading ? 'Loading...' : 'Search History'}
          </button>
        </div>
      )}

      {/* Report Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>Loading reports...</div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6B7280' }}>
          <FileText size={44} color="#9CA3AF" style={{ margin: '0 auto 0.75rem' }} />
          <div>No EOD reports found for the selected criteria.</div>
          <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
            Daily reports appear when Mandi Officers submit their End-of-Day summaries.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {reports.map((report) => (
            <div key={report.id} style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={20} color="#D97706" />
                  <div>
                    <h4 style={{ margin: 0, color: '#92400E', fontSize: '1.05rem' }}>{report.mandiName}</h4>
                    <div style={{ fontSize: '0.78rem', color: '#B45309' }}>Date: <strong>{report.date}</strong> | ID: {report.id}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#B45309' }}>
                  Submitted: {new Date(report.submittedAt).toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><span style={{ color: '#B45309' }}>Total Booked:</span> <strong>{report.totalBooked}</strong></div>
                <div><span style={{ color: '#065F46' }}>Verified:</span> <strong style={{ color: '#065F46' }}>{report.totalVerified}</strong></div>
                <div><span style={{ color: '#92400E' }}>Pending / No-show:</span> <strong>{report.totalPending}</strong></div>
                <div><span style={{ color: '#D97706' }}>Completed:</span> <strong style={{ color: '#D97706' }}>{report.totalCompleted}</strong></div>
                <div><span style={{ color: '#059669' }}>Total Qty:</span> <strong style={{ color: '#059669' }}>{report.totalQty} Qtl</strong></div>
                <div><span style={{ color: '#D97706' }}>Total Payout:</span> <strong style={{ color: '#D97706' }}>₹{(report.totalPayment || 0).toLocaleString()}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
