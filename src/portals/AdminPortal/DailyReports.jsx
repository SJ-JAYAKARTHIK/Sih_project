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
      <div className="section-header">
        <div>
          <h3 className="section-title">Mandi Daily Operational Reports &amp; History</h3>
          <div className="section-subtitle">Daily summary reports submitted by Mandi Officers</div>
        </div>

        {/* Mode Toggle */}
        <div className="tab-bar">
          <button
            className={`tab-btn ${viewMode === 'date' ? 'active' : ''}`}
            onClick={() => setViewMode('date')}
          >
            Single Date
          </button>
          <button
            className={`tab-btn ${viewMode === 'history' ? 'active' : ''}`}
            onClick={() => setViewMode('history')}
          >
            History Range
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      {viewMode === 'date' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', backgroundColor: 'var(--surface-muted)', padding: '0.6rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <Calendar size={15} color="var(--primary)" />
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date:</label>
          <input
            type="date"
            style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', outline: 'none' }}
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end', backgroundColor: 'var(--surface-muted)', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">From Date</label>
            <input type="date" value={historyStart} onChange={e => setHistoryStart(e.target.value)} className="form-input" style={{ width: 'auto' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">To Date</label>
            <input type="date" value={historyEnd} onChange={e => setHistoryEnd(e.target.value)} className="form-input" style={{ width: 'auto' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Mandi</label>
            <select value={historyMandi} onChange={e => setHistoryMandi(e.target.value)} className="form-select" style={{ minWidth: '180px' }}>
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
        <div className="loading-state"><div className="spinner" />Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <FileText size={44} className="empty-state-icon" />
          <div className="empty-state-title">No EOD reports found</div>
          <div className="empty-state-desc">Daily reports appear when Mandi Officers submit their End-of-Day summaries.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {reports.map((report) => (
            <div key={report.id} style={{ backgroundColor: 'var(--light-green)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Building2 size={18} color="var(--primary)" />
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '1rem', fontWeight: 700 }}>{report.mandiName}</h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Date: <strong style={{ color: 'var(--text)' }}>{report.date}</strong> · ID: {report.id}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Submitted: {new Date(report.submittedAt).toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem 0.75rem', fontSize: '0.82rem', borderTop: '1px solid var(--green-border)', paddingTop: '0.75rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Booked:</span> <strong>{report.totalBooked}</strong></div>
                <div><span style={{ color: 'var(--status-success-text)' }}>Verified:</span> <strong style={{ color: 'var(--status-success-text)' }}>{report.totalVerified}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Pending:</span> <strong>{report.totalPending}</strong></div>
                <div><span style={{ color: 'var(--primary)' }}>Completed:</span> <strong style={{ color: 'var(--primary)' }}>{report.totalCompleted}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Qty:</span> <strong style={{ color: 'var(--status-success-text)' }}>{report.totalQty} Qtl</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Payout:</span> <strong>₹{(report.totalPayment || 0).toLocaleString()}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
