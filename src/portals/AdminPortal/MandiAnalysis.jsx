import React, { useState } from 'react';
import { Building2, MapPin, Scale, CheckCircle2, Search } from 'lucide-react';

export const MandiAnalysis = ({ mandiStats }) => {
  const [selectedMandiId, setSelectedMandiId] = useState('ALL');

  const filteredStats = selectedMandiId === 'ALL'
    ? mandiStats
    : mandiStats.filter(m => m.mandiId === selectedMandiId);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Mandi Activity & Performance Analysis</h3>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
            Monitor turnout, verified arrivals, completed procurements, and total payouts by mandi
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter Mandi:</label>
          <select
            className="form-select"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', width: 'auto' }}
            value={selectedMandiId}
            onChange={(e) => setSelectedMandiId(e.target.value)}
          >
            <option value="ALL">All Mandis ({mandiStats.length})</option>
            {mandiStats.map(m => (
              <option key={m.mandiId} value={m.mandiId}>{m.mandiName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Mandi Name & Location</th>
              <th>Bookings Today</th>
              <th>Verified Arrivals</th>
              <th>Pending Arrivals</th>
              <th>Completed Procurements</th>
              <th>Procured Qty</th>
              <th>Total Payment Processed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStats.map((m) => (
              <tr key={m.mandiId}>
                <td>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{m.mandiName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <MapPin size={12} color="#D97706" /> {m.location}
                  </div>
                </td>
                <td><strong>{m.booked}</strong></td>
                <td><span className="badge badge-green">{m.verified} Arrived</span></td>
                <td><span className="badge badge-yellow">{m.pending} Pending</span></td>
                <td><strong>{m.completed} / {m.booked}</strong></td>
                <td><strong style={{ color: '#059669' }}>{m.totalQty} Quintals</strong></td>
                <td><strong style={{ color: '#D97706' }}>₹{m.totalPayment.toLocaleString()}</strong></td>
                <td>
                  <span className="badge badge-green">
                    <CheckCircle2 size={12} /> Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
