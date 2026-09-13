import React from 'react';

export const FarmerAnalysis = ({ cropStats, totalFarmers, todayBooked, todayVerified, todayCompleted }) => {
  return (
    <div>
      {/* KPI Row */}
      <div className="kpi-grid-auto" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Registered Farmers</div>
          <div className="kpi-value">{totalFarmers}</div>
          <div className="kpi-sub">Across state divisions</div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div className="kpi-label" style={{ color: 'var(--status-warning-text)' }}>Booked Today</div>
          <div className="kpi-value" style={{ color: 'var(--warning)' }}>{todayBooked}</div>
          <div className="kpi-sub">Confirmed slot reservations</div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div className="kpi-label" style={{ color: 'var(--status-success-text)' }}>Farmer Turnout Rate</div>
          <div className="kpi-value" style={{ color: 'var(--status-success-text)' }}>
            {todayBooked > 0 ? Math.round((todayVerified / todayBooked) * 100) : 0}%
          </div>
          <div className="kpi-sub">{todayVerified} arrived of {todayBooked} booked</div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--primary)' }}>
          <div className="kpi-label" style={{ color: 'var(--primary)' }}>Procurement Fulfilled</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>{todayCompleted}</div>
          <div className="kpi-sub">Payment &amp; bills completed</div>
        </div>
      </div>

      {/* Crop breakdown */}
      <div className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Crop-Wise Procurement Breakdown</h3>
            <div className="section-subtitle">Quantity and payment by crop variety today</div>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Transactions</th>
                <th>Total Qty Procured</th>
                <th>Procurement Value</th>
              </tr>
            </thead>
            <tbody>
              {cropStats.map((crop) => (
                <tr key={crop.cropId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                      <span style={{ fontSize: '1.25rem' }}>{crop.icon}</span>
                      <span>{crop.cropName}</span>
                    </div>
                  </td>
                  <td><strong>{crop.count}</strong></td>
                  <td><strong style={{ color: 'var(--status-success-text)' }}>{crop.totalQty} Quintals</strong></td>
                  <td><strong>₹{crop.totalPayment.toLocaleString()}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
