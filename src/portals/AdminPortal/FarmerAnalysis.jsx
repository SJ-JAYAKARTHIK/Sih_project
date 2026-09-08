import React from 'react';
import { Users, Sprout, CheckCircle2, TrendingUp } from 'lucide-react';

export const FarmerAnalysis = ({ cropStats, totalFarmers, todayBooked, todayVerified, todayCompleted }) => {
  return (
    <div>
      {/* Overview Metric Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>Total Registered Farmers</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '0.25rem 0' }}>{totalFarmers}</div>
          <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Across state divisions</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>Farmers Booked Slots Today</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706', margin: '0.25rem 0' }}>{todayBooked}</div>
          <div style={{ fontSize: '0.78rem', color: '#B45309' }}>Confirmed slot reservations</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: '#065F46', textTransform: 'uppercase', fontWeight: 700 }}>Farmer Turnout Rate</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#065F46', margin: '0.25rem 0' }}>
            {todayBooked > 0 ? Math.round((todayVerified / todayBooked) * 100) : 0}%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669' }}>{todayVerified} arrived of {todayBooked} booked</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: '#92400E', textTransform: 'uppercase', fontWeight: 700 }}>Procurement Fulfilled</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#92400E', margin: '0.25rem 0' }}>{todayCompleted}</div>
          <div style={{ fontSize: '0.78rem', color: '#B45309' }}>Payment & bills completed</div>
        </div>
      </div>

      {/* Crop-wise Procurement Distribution */}
      <div className="card">
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.25rem' }}>Crop-Wise Procurement Breakdown</h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Crop Name</th>
                <th>Total Transactions</th>
                <th>Total Quantity Procured</th>
                <th>Procurement Value Processed</th>
              </tr>
            </thead>
            <tbody>
              {cropStats.map((crop) => (
                <tr key={crop.cropId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#111827' }}>
                      <span style={{ fontSize: '1.4rem' }}>{crop.icon}</span>
                      <span>{crop.cropName}</span>
                    </div>
                  </td>
                  <td><strong>{crop.count} Procurements</strong></td>
                  <td><strong style={{ color: '#059669' }}>{crop.totalQty} Quintals</strong></td>
                  <td><strong style={{ color: '#D97706' }}>₹{crop.totalPayment.toLocaleString()}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
